<?php
/**
 * VuloCloudClient class file.
 *
 * @package MultivendorX\Engagement
 */

namespace MultivendorX\Engagement;

defined( 'ABSPATH' ) || exit;

/**
 * Generic VuloCloud telemetry transport: register a site, send a snapshot, disconnect, and
 * encrypt/decrypt the stored site secret. One instance per consuming plugin. Self-contained -
 * the caller owns consent checks, payload content, and scheduling; this class only owns
 * *how* a snapshot is sent.
 *
 * @package MultivendorX\Engagement
 */
class VuloCloudClient {

    /**
     * VuloCloud base URL, e.g. 'https://store.multivendorx.com'.
     *
     * @var string
     */
    private $base_url;

    /**
     * VuloCloud organization id shared by every MultivendorX product.
     *
     * @var string
     */
    private $organization_id;

    /**
     * This plugin's own slug, sent as `pluginId` on every request.
     *
     * @var string
     */
    private $plugin_id;

    /**
     * This plugin's version, used in the User-Agent header.
     *
     * @var string
     */
    private $plugin_version;

    /**
     * Prefix for this plugin's own options/transients, e.g. 'notifima'.
     *
     * @var string
     */
    private $option_prefix;

    /**
     * Constructor.
     *
     * @param string $base_url        VuloCloud base URL.
     * @param string $organization_id VuloCloud organization id.
     * @param string $plugin_id       This plugin's slug.
     * @param string $plugin_version  This plugin's version.
     * @param string $option_prefix   Prefix for this plugin's connection option/transient.
     */
    public function __construct( $base_url, $organization_id, $plugin_id, $plugin_version, $option_prefix ) {
        $this->base_url        = $base_url;
        $this->organization_id = $organization_id;
        $this->plugin_id       = $plugin_id;
        $this->plugin_version  = $plugin_version;
        $this->option_prefix   = $option_prefix;
    }

    /**
     * Whether this client has a base URL/organization id to reach VuloCloud.
     *
     * @return bool
     */
    public function is_configured() {
        return '' !== $this->base_url && '' !== $this->organization_id;
    }

    /**
     * Whether this site already holds a VuloCloud ConnectedSite credential.
     *
     * @return bool
     */
    public function is_connected() {
        $connection = $this->get_connection();
        return '' !== $connection['site_id'] && '' !== $connection['secret_enc'];
    }

    /**
     * The decrypted site credential, or null when not connected / undecryptable.
     *
     * @return array|null { site_id: string, secret: string }
     */
    public function get_site_credential() {
        $connection = $this->get_connection();
        if ( '' === $connection['site_id'] || '' === $connection['secret_enc'] ) {
            return null;
        }

        $secret = $this->decrypt_secret( $connection['secret_enc'] );
        if ( null === $secret ) {
            return null;
        }

        return array(
            'site_id' => $connection['site_id'],
            'secret'  => $secret,
        );
    }

    /**
     * Timestamp of the last registration attempt (0 if none yet).
     *
     * @return int
     */
    public function get_last_register_attempt() {
        return (int) $this->get_connection()['last_register_attempt'];
    }

    /**
     * POST /connected-sites/register and store the returned credential on success.
     *
     * @param array $payload Snapshot to send with the registration.
     * @return true|\WP_Error
     */
    public function register_site( array $payload ) {
        $this->save_connection( array( 'last_register_attempt' => time() ) );

        $response = $this->post( '/connected-sites/register', $this->registration_body( $payload ), true );

        $log_context = 'vulocloud_register_' . $this->plugin_id;
        $body        = $this->parse_response( $response, array( 'siteId', 'siteSecret' ), $log_context );
        if ( null === $body ) {
            return new \WP_Error(
                'vulocloud_register_failed',
                __( 'VuloCloud site registration failed.', 'notifima' )
            );
        }

        $secret_enc = $this->encrypt_secret( (string) $body['siteSecret'] );
        if ( null === $secret_enc ) {
            return new \WP_Error(
                'vulocloud_encryption_unavailable',
                __( 'This server cannot encrypt the VuloCloud credential (OpenSSL is unavailable).', 'notifima' )
            );
        }

        $this->save_connection(
            array(
                'site_id'               => sanitize_text_field( (string) $body['siteId'] ),
                'secret_enc'            => $secret_enc,
                'connected_at'          => current_time( 'mysql' ),
                'last_reported_at'      => current_time( 'mysql' ),
                'last_register_attempt' => 0,
            )
        );

        return true;
    }

    /**
     * POST one snapshot to VuloCloud. A 401/403/404 drops the stored connection.
     *
     * @param string $site_id           ConnectedSite id.
     * @param string $secret            Plaintext site secret.
     * @param array  $payload           Snapshot to send.
     * @param bool   $blocking          Wait for the response instead of fire-and-forget.
     * @param bool   $allow_during_ajax Send even during wp_doing_ajax().
     * @return bool True if VuloCloud acknowledged the ping (always false when non-blocking).
     */
    public function report( $site_id, $secret, array $payload, $blocking = false, $allow_during_ajax = false ) {
        if ( wp_doing_ajax() && ! $allow_during_ajax ) {
            return false;
        }

        $response = $this->post(
            '/connected-sites/ingest',
            array(
                'siteId'  => $site_id,
                'secret'  => $secret,
                'payload' => $payload,
            ),
            $blocking
        );

        if ( ! $blocking || is_wp_error( $response ) ) {
            return false;
        }

        $status = (int) wp_remote_retrieve_response_code( $response );

        if ( in_array( $status, array( 401, 403, 404 ), true ) ) {
            $this->clear_connection();
            return false;
        }

        if ( $status >= 200 && $status < 300 ) {
            $this->save_connection( array( 'last_reported_at' => current_time( 'mysql' ) ) );
            return true;
        }

        return false;
    }

    /**
     * Best-effort opt-out request, then forget the credential locally either way.
     *
     * @param string $site_id ConnectedSite id.
     * @param string $secret  Plaintext site secret.
     */
    public function disconnect( $site_id, $secret ) {
        $this->post(
            '/connected-sites/disconnect',
            array(
                'siteId' => $site_id,
                'secret' => $secret,
            ),
            false,
            10
        );
        $this->clear_connection();
    }

    /**
     * One-time report for a site with no ongoing credential. Never stores anything locally.
     *
     * @param array  $payload Snapshot to send.
     * @param string $purpose Sent to VuloCloud as the registration's `purpose` field.
     * @return bool
     */
    public function send_one_time_report( array $payload, $purpose = 'one_time_report' ) {
        $registration_body = $this->registration_body( $payload, $purpose );
        $response           = $this->post( '/connected-sites/register', $registration_body, true );

        $log_context = 'vulocloud_one_time_register_' . $this->plugin_id;
        $body        = $this->parse_response( $response, array( 'siteId', 'reportToken' ), $log_context );
        if ( null === $body ) {
            return false;
        }

        $response = $this->post(
            '/connected-sites/ingest',
            array(
                'siteId'      => sanitize_text_field( (string) $body['siteId'] ),
                'reportToken' => (string) $body['reportToken'],
                'payload'     => $payload,
            ),
            true
        );

        return ! is_wp_error( $response ) && (int) wp_remote_retrieve_response_code( $response ) < 300;
    }

    /**
     * Register a REST route exposing the in-flight verification token. Public by design.
     *
     * @param string $rest_namespace This plugin's own REST namespace.
     */
    public function register_verification_route( $rest_namespace ) {
        register_rest_route(
            $rest_namespace,
            '/tracking/verification',
            array(
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_verification_token' ),
                'permission_callback' => '__return_true',
            )
        );
    }

    /**
     * REST callback for the verification route registered above.
     *
     * @return \WP_REST_Response|\WP_Error
     */
    public function get_verification_token() {
        $token = get_transient( $this->verification_transient_key() );
        if ( ! is_string( $token ) || '' === $token ) {
            $message = __( 'No registration is in progress.', 'notifima' );
            return new \WP_Error( 'vulocloud_no_pending_verification', $message, array( 'status' => 404 ) );
        }

        $response = new \WP_REST_Response(
            array(
                'token'            => $token,
                'plugin'           => $this->plugin_id,
                'pluginActive'     => true,
                'pluginVersion'    => $this->plugin_version,
                'wordpressVersion' => get_bloginfo( 'version' ),
            )
        );
        $response->header( 'Cache-Control', 'no-store' );
        return $response;
    }

    /**
     * Best-effort recognition of hosts via a well-known constant/function.
     *
     * @return string
     */
    public static function detect_hosting_type() {
        if ( defined( 'WPE_APIKEY' ) ) {
            return 'WP Engine';
        }
        if ( defined( 'KINSTAMYSQLTUNNEL' ) || function_exists( 'kinsta_cache_purge' ) ) {
            return 'Kinsta';
        }
        if ( defined( 'PANTHEON_ENVIRONMENT' ) ) {
            return 'Pantheon';
        }
        if ( defined( 'IS_PRESSABLE' ) && IS_PRESSABLE ) {
            return 'Pressable';
        }
        if ( defined( 'FLYWHEEL_CONFIG_DIR' ) ) {
            return 'Flywheel';
        }
        if ( defined( 'GD_SYSTEM_PLUGIN_DIR' ) ) {
            return 'GoDaddy';
        }
        if ( defined( 'WPCOMSH__FILE__' ) ) {
            return 'WordPress.com';
        }
        return '';
    }

    /**
     * Build the generic site/environment fields every tracking payload needs - site info,
     * PHP/theme/host details, and the active/inactive plugin lists. The caller adds its own
     * plugin-specific fields ('Plugin', 'Version', 'Pro Version', ...) on top of this array.
     *
     * @return array
     */
    public static function build_site_snapshot(): array {
        global $wpdb;

        if ( ! function_exists( 'get_plugins' ) ) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        $all_plugins    = array_keys( get_plugins() );
        $active_plugins = (array) get_option( 'active_plugins', array() );
        if ( is_multisite() ) {
            $network_plugins = array_keys( (array) get_site_option( 'active_sitewide_plugins', array() ) );
            $active_plugins   = array_merge( $active_plugins, $network_plugins );
        }
        $active_plugins = array_values( array_unique( $active_plugins ) );

        $theme         = wp_get_theme();
        $server_header = filter_input( INPUT_SERVER, 'SERVER_SOFTWARE', FILTER_UNSAFE_RAW );

        $current_user = wp_get_current_user();
        $email        = $current_user->exists() && $current_user->user_email
            ? $current_user->user_email
            : get_bloginfo( 'admin_email' );

        return array(
            'Site Name'        => get_bloginfo( 'name' ),
            'Site Version'     => get_bloginfo( 'version' ),
            'Site Language'    => get_bloginfo( 'language' ),
            'Charset'          => get_bloginfo( 'charset' ),
            'Php Version'      => phpversion(),
            'Multisite'        => is_multisite(),
            'File Location'    => ABSPATH,
            'Email'            => sanitize_email( $email ),
            'Server'           => sanitize_text_field( (string) ( $server_header ?? getenv( 'SERVER_SOFTWARE' ) ) ),
            'Text Direction'   => is_rtl() ? 'rtl' : 'ltr',
            'Theme'            => sanitize_text_field( (string) $theme->get( 'Name' ) ),
            'Theme Version'    => sanitize_text_field( (string) $theme->get( 'Version' ) ),
            'Platform'         => 'WordPress',
            'Database'         => $wpdb->db_version(),
            'Environment'      => wp_get_environment_type(),
            'Hosting Type'     => self::detect_hosting_type(),
            'Commerce Platform' => defined( 'WC_VERSION' ) ? 'WooCommerce ' . WC_VERSION : '',
            'Site URL'         => home_url(),
            'Active Plugins'   => $active_plugins,
            'Inactive Plugins' => array_values( array_diff( $all_plugins, $active_plugins ) ),
        );
    }

    /**
     * Build the `/connected-sites/register` request body.
     *
     * @param array      $payload Snapshot to send.
     * @param string|null $purpose Optional `purpose` field for a one-time registration.
     * @return array
     */
    private function registration_body( array $payload, $purpose = null ) {
        $body = array(
            'organizationId'    => $this->organization_id,
            'pluginId'          => $this->plugin_id,
            'domain'            => home_url(),
            'verificationToken' => $this->publish_verification_token(),
        );

        if ( null !== $purpose ) {
            $body['purpose'] = $purpose;
        }

        $body['payload'] = $payload;

        return $body;
    }

    /**
     * POST JSON to a VuloCloud endpoint.
     *
     * @param string $path     Endpoint path, e.g. '/connected-sites/register'.
     * @param array  $body     Request body, JSON-encoded as-is.
     * @param bool   $blocking True to wait for the response; false (default) to fire-and-forget.
     * @param int    $timeout  Request timeout in seconds.
     * @return array|\WP_Error Same shape wp_remote_post() returns.
     */
    private function post( $path, array $body, $blocking = false, $timeout = 15 ) {
        return wp_remote_post(
            $this->base_url . $path,
            array(
                'timeout'    => $timeout,
                'blocking'   => $blocking,
                'headers'    => array( 'Content-Type' => 'application/json' ),
                'user-agent' => $this->get_user_agent(),
                'body'       => wp_json_encode( $body ),
            )
        );
    }

    /**
     * Parse a wp_remote_post() response, decoding the JSON body and checking required keys.
     *
     * @param array|\WP_Error $response      Result of a post() call.
     * @param string[]        $required_keys Body keys that must be non-empty for success.
     * @param string          $log_context   Passed through to error_log() on failure.
     * @return array|null Decoded body on success, null on any failure.
     */
    private function parse_response( $response, array $required_keys, $log_context ) {
        if ( is_wp_error( $response ) ) {
            $this->log( $log_context, array( 'error' => $response->get_error_message() ) );
            return null;
        }

        $status = (int) wp_remote_retrieve_response_code( $response );
        $body   = json_decode( (string) wp_remote_retrieve_body( $response ), true );

        $has_required_keys = is_array( $body );
        foreach ( $required_keys as $key ) {
            if ( empty( $body[ $key ] ) ) {
                $has_required_keys = false;
                break;
            }
        }

        if ( $status < 200 || $status >= 300 || ! $has_required_keys ) {
            $this->log(
                $log_context,
                array(
                    'status' => $status,
                    'body'   => wp_remote_retrieve_body( $response ),
                )
            );
            return null;
        }

        return $body;
    }

    /**
     * Log a failure to WP's own debug log.
     *
     * @param string $context Log context label.
     * @param array  $data    Extra data to log.
     */
    private function log( $context, array $data ) {
        if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
            // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- intentional debug-only diagnostic, no plugin-specific logger to depend on from a shared package.
            error_log( sprintf( '[%s] %s', $context, wp_json_encode( $data ) ) );
        }
    }

    /**
     * Publish a fresh one-time verification token for an in-flight registration.
     *
     * @return string The token to send along with the registration request.
     */
    private function publish_verification_token() {
        $token = wp_generate_password( 48, false, false );
        set_transient( $this->verification_transient_key(), $token, 10 * MINUTE_IN_SECONDS );
        return $token;
    }

    /**
     * Transient key for this plugin's in-flight verification token.
     *
     * @return string
     */
    private function verification_transient_key() {
        return $this->option_prefix . '_vulocloud_verification_token';
    }

    /**
     * Option key for this plugin's stored VuloCloud connection.
     *
     * @return string
     */
    private function connection_option_key() {
        return $this->option_prefix . '_vulocloud_connection';
    }

    /**
     * The stored connection merged with defaults.
     *
     * @return array
     */
    private function get_connection() {
        return wp_parse_args(
            get_option( $this->connection_option_key(), array() ),
            array(
                'site_id'               => '',
                'secret_enc'            => '',
                'connected_at'          => '',
                'last_reported_at'      => '',
                'last_register_attempt' => 0,
            )
        );
    }

    /**
     * Merge partial fields into the stored connection.
     *
     * @param array $fields Partial connection fields.
     */
    private function save_connection( array $fields ) {
        $connection = array_merge( $this->get_connection(), $fields );
        update_option( $this->connection_option_key(), $connection, false );
    }

    /**
     * Forget the stored credential.
     */
    private function clear_connection() {
        delete_option( $this->connection_option_key() );
    }

    /**
     * User-Agent sent on every VuloCloud request.
     *
     * @return string
     */
    private function get_user_agent() {
        return $this->plugin_id . ' Tracker/' . $this->plugin_version . '; ' . md5( esc_url_raw( home_url( '/' ) ) );
    }

    /**
     * 32 raw key bytes derived from this site's auth salt.
     *
     * @return string
     */
    private function get_encryption_key() {
        return hash( 'sha256', wp_salt( 'auth' ), true );
    }

    /**
     * Encrypt the site secret for storage.
     *
     * @param string $plaintext Plaintext site secret.
     * @return string|null Base64 IV + ciphertext, or null when OpenSSL is unavailable.
     */
    private function encrypt_secret( $plaintext ) {
        if ( ! function_exists( 'openssl_encrypt' ) ) {
            return null;
        }

        $iv         = random_bytes( openssl_cipher_iv_length( 'aes-256-cbc' ) );
        $ciphertext = openssl_encrypt( $plaintext, 'aes-256-cbc', $this->get_encryption_key(), OPENSSL_RAW_DATA, $iv );
        if ( false === $ciphertext ) {
            return null;
        }

        return base64_encode( $iv . $ciphertext ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- binary-to-text encoding of AES ciphertext, not obfuscation.
    }

    /**
     * Decrypt a value produced by encrypt_secret().
     *
     * @param string $encoded Stored value.
     * @return string|null Plaintext, or null if malformed/undecryptable.
     */
    private function decrypt_secret( $encoded ) {
        if ( ! function_exists( 'openssl_decrypt' ) ) {
            return null;
        }

        $raw       = base64_decode( $encoded, true ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode -- reversing encrypt_secret()'s binary-to-text encoding, not obfuscation.
        $iv_length = openssl_cipher_iv_length( 'aes-256-cbc' );

        if ( false === $raw || strlen( $raw ) <= $iv_length ) {
            return null;
        }

        $plaintext = openssl_decrypt(
            substr( $raw, $iv_length ),
            'aes-256-cbc',
            $this->get_encryption_key(),
            OPENSSL_RAW_DATA,
            substr( $raw, 0, $iv_length )
        );

        return false === $plaintext ? null : $plaintext;
    }
}
