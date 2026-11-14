<?php
/**
 * Notifima Tracker class file.
 *
 * @package Notifima
 */

namespace Notifima\Growth;

use Notifima\FrontendScripts;
use Notifima\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Opt-in usage tracking for Notifima (WordPress.org guideline 7) - nothing is sent until the
 * admin opts in via the notice or the Automation settings toggle.
 *
 * Transport: VuloCloud. Registers once, then reports a snapshot immediately and daily via
 * WP-Cron. The secret is stored AES-256-CBC encrypted and never output.
 *
 * Deactivation reporting is a separate popup flow, not register_deactivation_hook() (which
 * only stops the cron): the admin can send one final report before navigating away.
 *
 * @package Notifima
 */
class Tracker {

    private const CONSENT_OPTION_KEY = 'notifima_tracking_consent';

    /**
     * Key of the permanent on/off toggle inside the Automation settings tab.
     *
     * @var string
     */
    private const CONSENT_SETTING_KEY = 'is_usage_tracking_enable';

    /**
     * Option key holding the stored VuloCloud connection (site id + encrypted secret).
     *
     * @var string
     */
    private const CONNECTION_OPTION_KEY        = 'notifima_vulocloud_connection';
    private const VERIFICATION_TOKEN_TRANSIENT = 'notifima_vulocloud_verification_token';

    /**
     * Plugin slug, sent as `pluginId` (becomes ConnectedSite.pluginSlug on VuloCloud).
     *
     * @var string
     */
    private string $slug;

    /**
     * Human-readable plugin name.
     *
     * @var string
     */
    private string $plugin_name;

    /**
     * Current free plugin version.
     *
     * @var string
     */
    private string $plugin_version;

    /**
     * Installed Pro plugin version, if active.
     *
     * @var string
     */
    private string $pro_plugin_version;

    /**
     * VuloCloud base URL, no trailing slash.
     *
     * @var string
     */
    private string $vulocloud_url;

    /**
     * VuloCloud Organization id this plugin's connections are scoped to.
     *
     * @var string
     */
    private string $organization_id;

    /**
     * True while set_consent() is writing its own mirrored value into the Automation settings -
     * stops sync_consent_from_settings() from re-processing that same write a second time.
     *
     * @var bool
     */
    private bool $writing_consent_setting = false;

    /**
     * Constructor. Registers the opt-in notice, its handlers, the settings toggle hook, cron and deactivation.
     */
    public function __construct() {
        $this->slug               = NOTIFIMA_PLUGIN_SLUG;
        $this->plugin_name        = 'Notifima';
        $this->plugin_version     = NOTIFIMA_PLUGIN_VERSION;
        $this->pro_plugin_version = defined( 'NOTIFIMA_PRO_PLUGIN_VERSION' ) ? NOTIFIMA_PRO_PLUGIN_VERSION : '';
        $this->vulocloud_url      = untrailingslashit( trim( (string) apply_filters( 'notifima_vulocloud_url', NOTIFIMA_VULOCLOUD_URL ) ) );
        $this->organization_id    = trim( (string) apply_filters( 'notifima_vulocloud_organization_id', NOTIFIMA_VULOCLOUD_ORGANIZATION_ID ) );

        add_action( 'admin_notices', array( $this, 'render_opt_in_notice' ) );
        add_action( 'admin_post_notifima_accept_tracking', array( $this, 'handle_accept' ) );
        add_action( 'admin_post_notifima_skip_tracking', array( $this, 'handle_skip' ) );

        add_filter( 'pre_update_option_' . Utill::NOTIFIMA_SETTINGS['automation'], array( $this, 'sync_consent_from_settings' ), 10, 2 );

        // Retry a failed registration quietly on later admin visits - only ever after consent.
        add_action( 'admin_init', array( $this, 'maybe_retry_registration' ) );

        add_action( 'init', array( $this, 'ensure_daily_report_scheduled' ) );
        add_action( 'notifima_site_telemetry_daily', array( $this, 'report_current_state' ) );
        add_action( 'rest_api_init', array( $this, 'register_verification_route' ) );

        add_filter( 'plugin_action_links_' . Notifima()->plugin_base, array( $this, 'wrap_deactivate_link' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_deactivation_assets' ) );
        add_action( 'wp_ajax_notifima_deactivation_report', array( $this, 'handle_deactivation_report_request' ) );

        register_deactivation_hook(
            Notifima()->plugin_path . 'product_stock_alert.php',
            array( $this, 'on_plugin_deactivated' )
        );
    }

    /**
     * Whether tracking may actually run right now - consent plus the kill-switch filter.
     *
     * Every place that sends data (or attempts to register) checks this, not has_consent()
     * directly, so a filter can force tracking off site-wide independent of what was saved.
     *
     * @return bool
     */
    private function is_tracking_enabled(): bool {
        if ( 'yes' !== get_option( self::CONSENT_OPTION_KEY ) ) {
            return false;
        }

        return true;
    }

    /**
     * Persist the decision and mirror it into the settings toggle so both stay in sync.
     *
     * @param bool $allowed True for "yes", false for "no".
     */
    private function set_consent( bool $allowed ): void {
        update_option( self::CONSENT_OPTION_KEY, $allowed ? 'yes' : 'no', false );
        $this->writing_consent_setting = true;
        Notifima()->setting->update_setting(
            self::CONSENT_SETTING_KEY,
            $allowed ? 'yes' : 'no',
            Utill::NOTIFIMA_SETTINGS['automation']
        );
        $this->writing_consent_setting = false;
    }

    /**
     * Render the opt-in admin notice until the administrator answers it.
     */
    public function render_opt_in_notice(): void {
        if ( false !== get_option( self::CONSENT_OPTION_KEY ) || ! $this->is_configured() || ! Utill::current_user_has_capability( array( 'manage_options' ) ) ) {
            return;
        }

        $current_user = Notifima()->current_user;
        $admin_email  = sanitize_email( $current_user->user_email );

        $accept_url = wp_nonce_url( admin_url( 'admin-post.php?action=notifima_accept_tracking' ), 'notifima_tracking_nonce' );
        $skip_url   = wp_nonce_url( admin_url( 'admin-post.php?action=notifima_skip_tracking' ), 'notifima_tracking_nonce' );
        ?>
        <div class="notice notice-info notifima-tracking-notice" style="padding: 15px;">
            <p>
                <strong><?php esc_html_e( 'Want to help make Notifima better?', 'notifima' ); ?></strong>
                <?php
                printf(
                    /* translators: %s: the current administrator's email address. */
                    esc_html__( 'Opt in to share non-sensitive diagnostic data and your email (%s) to receive security updates and product news.', 'notifima' ),
                    '<code>' . esc_html( $admin_email ) . '</code>'
                );
                ?>
            </p>
            <details>
                <summary><?php esc_html_e( 'What we collect', 'notifima' ); ?></summary>
                <p><?php esc_html_e( 'Your site URL and name, WordPress, PHP and WooCommerce versions, active theme and plugin list, server software, and the email address shown above. No customer or order data is ever sent. You can switch this off at any time under Notifima > Settings > Automation > Usage tracking.', 'notifima' ); ?></p>
            </details>
            <a href="<?php echo esc_url( $accept_url ); ?>" class="button button-primary"><?php esc_html_e( 'Allow & Continue', 'notifima' ); ?></a>
            <a href="<?php echo esc_url( $skip_url ); ?>" class="button button-secondary" style="margin-left: 5px;"><?php esc_html_e( 'Skip', 'notifima' ); ?></a>
        </div>
        <?php
    }

    /**
     * "Allow & Continue": store consent, then register and send the first snapshot.
     */
    public function handle_accept(): void {
        check_admin_referer( 'notifima_tracking_nonce' );

        if ( ! Utill::current_user_has_capability( array( 'manage_options' ) ) ) {
            wp_die( esc_html__( 'You do not have permission to do this.', 'notifima' ) );
        }

        $this->set_consent( true );
        $this->start_tracking();
        $this->redirect_back();
    }

    /**
     * "Skip": store the refusal so the notice never returns.
     */
    public function handle_skip(): void {
        check_admin_referer( 'notifima_tracking_nonce' );

        if ( ! Utill::current_user_has_capability( array( 'manage_options' ) ) ) {
            wp_die( esc_html__( 'You do not have permission to do this.', 'notifima' ) );
        }

        $this->set_consent( false );
        $this->redirect_back();
    }

    /**
     * Keep consent in step with the settings toggle, without misreading an unrelated
     * Automation-tab save as a decline (the whole tab resubmits every field, touched or not).
     *
     * Hooked on `pre_update_option` so both old and new values are available: only a real,
     * known change (key present in both, values differ) counts as the admin flipping it.
     *
     * @param mixed $value     The new value about to be saved.
     * @param mixed $old_value The value currently stored, before this save.
     * @return mixed $value, unchanged - this is a pass-through filter.
     */
    public function sync_consent_from_settings( $value, $old_value ) {
        if ( $this->writing_consent_setting || ! is_array( $value ) || ! array_key_exists( self::CONSENT_SETTING_KEY, $value ) ) {
            return $value;
        }
        if ( ! is_array( $old_value ) || ! array_key_exists( self::CONSENT_SETTING_KEY, $old_value ) ) {
            return $value;
        }

        $new_raw = $value[ self::CONSENT_SETTING_KEY ];
        $old_raw = $old_value[ self::CONSENT_SETTING_KEY ];

        if ( $new_raw === $old_raw ) {
            return $value;
        }

        $enabled = 'yes' === $new_raw;

        update_option( self::CONSENT_OPTION_KEY, $enabled ? 'yes' : 'no', false );

        if ( $enabled ) {
            $this->start_tracking();
        } else {
            $this->stop_tracking();
        }

        return $value;
    }

    /**
     * Send the browser back where the notice was clicked, or to the Notifima admin page.
     */
    private function redirect_back(): void {
        wp_safe_redirect( wp_get_referer() ?: admin_url( 'admin.php?page=notifima' ) ); // phpcs:ignore Universal.Operators.DisallowShortTernary.Found -- wp_get_referer() has no falsy-but-valid return to misfire on here.
        exit;
    }

    /**
     * Whether this build is configured to reach VuloCloud at all.
     *
     * @return bool
     */
    private function is_configured(): bool {
        return '' !== $this->vulocloud_url && '' !== $this->organization_id;
    }

    /**
     * The stored connection merged with defaults.
     *
     * @return array
     */
    private function get_connection(): array {
        return wp_parse_args(
            get_option( self::CONNECTION_OPTION_KEY, array() ),
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
    private function save_connection( array $fields ): void {
        update_option( self::CONNECTION_OPTION_KEY, array_merge( $this->get_connection(), $fields ), false );
    }

    /**
     * Whether this site holds a VuloCloud ConnectedSite credential.
     *
     * @return bool
     */
    public function is_connected(): bool {
        $connection = $this->get_connection();
        return '' !== $connection['site_id'] && '' !== $connection['secret_enc'];
    }

    /**
     * The decrypted site credential, or null when not connected / undecryptable.
     *
     * @return array|null { site_id: string, secret: string }
     */
    private function get_site_credential(): ?array {
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
     * Forget the stored credential.
     */
    private function clear_connection(): void {
        delete_option( self::CONNECTION_OPTION_KEY );
    }

    /**
     * Register with VuloCloud (first snapshot travels with the registration) or, if already
     * registered, send a fresh snapshot. Only ever called after consent.
     */
    private function start_tracking(): void {
        if ( ! $this->is_configured() ) {
            return;
        }

        $credential = $this->get_site_credential();
        if ( null === $credential ) {
            $this->register_site();
            return;
        }

        $this->report( $credential['site_id'], $credential['secret'], $this->get_tracking_payload() );
    }

    /**
     * Opt-out: best-effort, non-blocking revoke request, then forget the credential locally
     * either way - never blocked by, or dependent on, network reachability.
     */
    private function stop_tracking(): void {
        $credential = $this->get_site_credential();
        if ( null !== $credential && $this->is_configured() ) {
            $this->post_to_vulocloud(
                '/connected-sites/disconnect',
                array(
                    'siteId' => $credential['site_id'],
                    'secret' => $credential['secret'],
                ),
                false,
                10
            );
        }
        $this->clear_connection();
    }

    /**
     * POST JSON to a VuloCloud endpoint - the one shared shape behind every call this class makes.
     *
     * @param string $path     Endpoint path, e.g. '/connected-sites/register'.
     * @param array  $body     Request body, JSON-encoded as-is.
     * @param bool   $blocking True to wait for the response; false (default) to fire-and-forget.
     * @param int    $timeout  Request timeout in seconds.
     * @return array|\WP_Error Same shape wp_remote_post() returns.
     */
    private function post_to_vulocloud( string $path, array $body, bool $blocking = false, int $timeout = 15 ) {
        return wp_remote_post(
            $this->vulocloud_url . $path,
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
     * Publish a fresh one-time verification token for an in-flight registration - shared by
     * register_site() and send_one_time_deactivation_report(), which otherwise each repeated the
     * same generate/set_transient pair.
     *
     * @return string The token to send along with the registration request.
     */
    private function publish_verification_token(): string {
        $token = wp_generate_password( 48, false, false );
        set_transient( self::VERIFICATION_TOKEN_TRANSIENT, $token, 10 * MINUTE_IN_SECONDS );
        return $token;
    }

    /**
     * Retry a failed registration quietly on a later admin visit (once per day at most).
     */
    public function maybe_retry_registration(): void {
        if ( ! $this->is_tracking_enabled() || ! $this->is_configured() || $this->is_connected() || wp_doing_ajax() ) {
            return;
        }

        $last_attempt   = (int) $this->get_connection()['last_register_attempt'];
        $retry_interval = (int) apply_filters( 'notifima_tracking_register_retry_interval', DAY_IN_SECONDS );

        if ( $last_attempt && ( time() - $last_attempt ) < $retry_interval ) {
            return;
        }

        $this->register_site();
    }

    /**
     * Expose the in-flight verification token so VuloCloud can confirm this domain registered
     * itself. Public by design - single-use, lives ten minutes, 404 when none is in flight.
     */
    public function register_verification_route(): void {
        register_rest_route(
            Notifima()->rest_namespace,
            '/tracking/verification',
            array(
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_verification_token' ),
                'permission_callback' => '__return_true',
            )
        );
    }

    /**
     * REST callback for the verification route.
     *
     * @return \WP_REST_Response|\WP_Error
     */
    public function get_verification_token() {
        $token = get_transient( self::VERIFICATION_TOKEN_TRANSIENT );
        if ( ! is_string( $token ) || '' === $token ) {
            return new \WP_Error( 'notifima_no_pending_verification', __( 'No registration is in progress.', 'notifima' ), array( 'status' => 404 ) );
        }

        $response = new \WP_REST_Response(
            array(
                'token'            => $token,
                'plugin'           => $this->slug,
                'pluginActive'     => true,
                'pluginVersion'    => $this->plugin_version,
                'wordpressVersion' => get_bloginfo( 'version' ),
            )
        );
        $response->header( 'Cache-Control', 'no-store' );
        return $response;
    }

    /**
     * POST /connected-sites/register and store the returned credential.
     *
     * A fresh one-time token is published first (see register_verification_route) and sent along,
     * so VuloCloud can fetch it back and confirm this domain really made the request.
     *
     * @return true|false|\WP_Error False only when skipped outright (an AJAX request - matches
     *                               WC_Tracker::send_tracking_data()'s own DOING_AJAX guard).
     */
    public function register_site() {
        if ( wp_doing_ajax() ) {
            return false;
        }

        $this->save_connection( array( 'last_register_attempt' => time() ) );

        $response = $this->post_to_vulocloud(
            '/connected-sites/register',
            array(
                'organizationId'    => $this->organization_id,
                'pluginId'          => $this->slug,
                'domain'            => home_url(),
                'verificationToken' => $this->publish_verification_token(),
                'payload'           => $this->get_tracking_payload(),
            ),
            true
        );
        return $this->finish_registration( $response );
    }

    /**
     * Parse the registration response and store the credential - split out of register_site()
     * only so the method above stays focused on the request itself.
     *
     * @param array|\WP_Error $response Result of the wp_remote_post() call to /connected-sites/register.
     * @return true|\WP_Error
     */
    private function finish_registration( $response ) {

        if ( is_wp_error( $response ) ) {
            Utill::log(
                array(
                    'context' => 'notifima_vulocloud_register',
                    'error'   => $response->get_error_message(),
                )
            );
            return $response;
        }

        $status = (int) wp_remote_retrieve_response_code( $response );
        $body   = json_decode( (string) wp_remote_retrieve_body( $response ), true );

        if ( $status < 200 || $status >= 300 || ! is_array( $body ) || empty( $body['siteId'] ) || empty( $body['siteSecret'] ) ) {
            Utill::log(
                array(
                    'context' => 'notifima_vulocloud_register',
                    'status'  => $status,
                    'body'    => wp_remote_retrieve_body( $response ),
                )
            );
            return new \WP_Error(
                'notifima_vulocloud_register_failed',
                sprintf(
                    /* translators: %d: HTTP status code. */
                    __( 'VuloCloud site registration failed (HTTP %d).', 'notifima' ),
                    $status
                )
            );
        }

        $secret_enc = $this->encrypt_secret( (string) $body['siteSecret'] );
        if ( null === $secret_enc ) {
            Utill::log(
                array(
                    'context' => 'notifima_vulocloud_register',
                    'error'   => 'OpenSSL unavailable - cannot encrypt credential.',
                )
            );
            return new \WP_Error(
                'notifima_vulocloud_encryption_unavailable',
                __( 'This server cannot encrypt the VuloCloud credential (OpenSSL is unavailable).', 'notifima' )
            );
        }

        $this->save_connection(
            array(
                'site_id'               => sanitize_text_field( (string) $body['siteId'] ),
                'secret_enc'            => $secret_enc,
                'connected_at'          => current_time( 'mysql' ),
                // The registration request already carried the first snapshot.
                'last_reported_at'      => current_time( 'mysql' ),
                'last_register_attempt' => 0,
            )
        );

        return true;
    }

    /*
    |--------------------------------------------------------------------------
    | Telemetry
    |--------------------------------------------------------------------------
    */

    /**
     * Schedule the daily report if it isn't already.
     */
    public function ensure_daily_report_scheduled(): void {
        if ( ! wp_next_scheduled( 'notifima_site_telemetry_daily' ) ) {
            wp_schedule_event( time(), 'daily', 'notifima_site_telemetry_daily' );
        }
    }

    /**
     * Daily cron callback - a no-op without consent.
     */
    public function report_current_state(): void {
        if ( ! $this->is_tracking_enabled() ) {
            return;
        }
        $this->start_tracking();
    }

    /**
     * Stop the daily cron on deactivation. No network call here - this hook fires on every
     * deactivation path (bulk, WP-CLI) the popup can't intercept; the popup's own AJAX handler
     * sends the final report before this ever runs.
     */
    public function on_plugin_deactivated(): void {
        wp_clear_scheduled_hook( 'notifima_site_telemetry_daily' );
    }

    /**
     * Wrap the Plugins-screen "Deactivate" link with the React.
     *
     * @param array $links Existing plugin action links.
     * @return array
     */
    public function wrap_deactivate_link( array $links ): array {
        if ( ! isset( $links['deactivate'] ) || ! preg_match( '/href="([^"]+)"/', $links['deactivate'], $matches ) ) {
            return $links;
        }

        $deactivate_url = html_entity_decode( $matches[1], ENT_QUOTES );

        // Nonce/action travel as data attributes on the same mount point rather than a separate
        // wp_localize_script() call - one fewer inline <script> and global for the popup to read.
        $links['deactivate'] = str_replace( '<a ', '<a id="notifima-deactivate-link" ', $links['deactivate'] )
            . '<div id="notifima-deactivation-popup"'
            . ' data-deactivate-url="' . esc_attr( $deactivate_url ) . '"'
            . ' data-action="notifima_deactivation_report"'
            . ' data-nonce="' . esc_attr( wp_create_nonce( 'notifima_deactivation_nonce' ) ) . '"'
            . '></div>';

        return $links;
    }

    /**
     * Enqueue the shared admin React bundle (the same one Notifima's own settings page uses) on
     * the Plugins screen only, so DeactivationPopup.tsx can mount there too.
     *
     * @param string $hook_suffix Current admin page, as passed by the 'admin_enqueue_scripts' action.
     */
    public function enqueue_deactivation_assets( string $hook_suffix ): void {
        if ( 'plugins.php' !== $hook_suffix ) {
            return;
        }

        wp_enqueue_script( 'wp-element' );
        FrontendScripts::enqueue_script( 'notifima-components-script' );
        FrontendScripts::enqueue_script( 'notifima-admin-script' );
        FrontendScripts::enqueue_style( 'notifima-admin-style' );
    }

    /**
     * AJAX handler behind the popup's "Send report & Deactivate" button. Always responds
     * success - a failed report must never block deactivation.
     */
    public function handle_deactivation_report_request(): void {
        check_ajax_referer( 'notifima_deactivation_nonce', 'nonce' );

        if ( ! Utill::current_user_has_capability( array( 'manage_options' ) ) ) {
            wp_send_json_error( null, 403 );
        }

        if ( $this->is_configured() ) {
            $payload                     = $this->get_tracking_payload();
            $payload['Status']           = 'Deactivated';
            $payload['Deactivated Date'] = time();

            $credential = $this->is_connected() ? $this->get_site_credential() : null;

            if ( null !== $credential && $this->is_tracking_enabled() ) {
                $this->report( $credential['site_id'], $credential['secret'], $payload, true, true );
            } elseif ( null === $credential ) {
                $this->send_one_time_deactivation_report( $payload );
            }
        }

        wp_send_json_success();
    }

    /**
     * Register for, and immediately spend, a short-lived single-use report authorization.
     * Only called when no ongoing credential exists; never stores anything locally.
     *
     * @param array $payload Final snapshot to send (Status already set to "Deactivated").
     */
    private function send_one_time_deactivation_report( array $payload ): void {
        $response = $this->post_to_vulocloud(
            '/connected-sites/register',
            array(
                'organizationId'    => $this->organization_id,
                'pluginId'          => $this->slug,
                'domain'            => home_url(),
                'verificationToken' => $this->publish_verification_token(),
                'purpose'           => 'deactivation_report',
                'payload'           => $payload,
            ),
            true
        );

        if ( is_wp_error( $response ) ) {
            return;
        }

        $status = (int) wp_remote_retrieve_response_code( $response );
        $body   = json_decode( (string) wp_remote_retrieve_body( $response ), true );

        if ( $status < 200 || $status >= 300 || ! is_array( $body ) || empty( $body['siteId'] ) || empty( $body['reportToken'] ) ) {
            return;
        }

        $this->send_one_time_report(
            sanitize_text_field( (string) $body['siteId'] ),
            (string) $body['reportToken'],
            $payload
        );
    }

    /**
     * POST the approved snapshot using a one-time report authorization instead of a permanent
     * secret. Not gated by is_tracking_enabled() - this click is its own one-time consent.
     *
     * @param string $site_id      ConnectedSite id from the one-time registration response.
     * @param string $report_token Single-use authorization from that same response.
     * @param array  $payload      The approved final snapshot.
     * @return bool
     */
    private function send_one_time_report( string $site_id, string $report_token, array $payload ): bool {
        if ( ! $this->is_configured() ) {
            return false;
        }

        $response = $this->post_to_vulocloud(
            '/connected-sites/ingest',
            array(
                'siteId'      => $site_id,
                'reportToken' => $report_token,
                'payload'     => $payload,
            ),
            true
        );

        return ! is_wp_error( $response ) && (int) wp_remote_retrieve_response_code( $response ) < 300;
    }

    /**
     * Build the snapshot sent to VuloCloud.
     *
     * @return array
     */
    public function get_tracking_payload(): array {
        global $wpdb;

        if ( ! function_exists( 'get_plugins' ) ) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        $all_plugins    = array_keys( get_plugins() );
        $active_plugins = (array) get_option( 'active_plugins', array() );
        if ( is_multisite() ) {
            $active_plugins = array_merge( $active_plugins, array_keys( (array) get_site_option( 'active_sitewide_plugins', array() ) ) );
        }
        $active_plugins = array_values( array_unique( $active_plugins ) );

        $theme         = wp_get_theme();
        $server_header = filter_input( INPUT_SERVER, 'SERVER_SOFTWARE', FILTER_UNSAFE_RAW );

        $current_user = Notifima()->current_user;
        $email        = $current_user && $current_user->exists() && $current_user->user_email
            ? $current_user->user_email
            : get_bloginfo( 'admin_email' );

        $payload = array(
            'Site Name'         => get_bloginfo( 'name' ),
            'Site Version'      => get_bloginfo( 'version' ),
            'Site Language'     => get_bloginfo( 'language' ),
            'Charset'           => get_bloginfo( 'charset' ),
            'Php Version'       => phpversion(),
            'Multisite'         => is_multisite(),
            'File Location'     => ABSPATH,
            'Email'             => sanitize_email( $email ),
            'Server'            => sanitize_text_field( (string) ( $server_header ?? getenv( 'SERVER_SOFTWARE' ) ) ),
            'Text Direction'    => is_rtl() ? 'rtl' : 'ltr',
            'Plugin'            => $this->plugin_name,
            'Version'           => $this->plugin_version,
            'Status'            => 'active',
            'Theme'             => sanitize_text_field( (string) $theme->get( 'Name' ) ),
            'Theme Version'     => sanitize_text_field( (string) $theme->get( 'Version' ) ),
            'Platform'          => 'WordPress',
            'Database'          => $wpdb->db_version(),
            'Environment'       => wp_get_environment_type(),
            'Hosting Type'      => $this->detect_hosting_type(),
            'Commerce Platform' => defined( 'WC_VERSION' ) ? 'WooCommerce ' . WC_VERSION : '',
            'Site URL'          => home_url(),
            'Pro Version'       => $this->pro_plugin_version,
            'Active Plugins'    => $active_plugins,
            'Inactive Plugins'  => array_values( array_diff( $all_plugins, $active_plugins ) ),
        );

        return apply_filters( 'notifima_tracking_payload', $payload );
    }

    /**
     * POST one snapshot to VuloCloud. A 401/403/404 drops the stored connection so the site
     * re-registers on the next run.
     *
     * @param string $site_id           ConnectedSite id.
     * @param string $secret            Plaintext site secret.
     * @param array  $payload           Snapshot from get_tracking_payload().
     * @param bool   $blocking          Wait for the response instead of fire-and-forget.
     * @param bool   $allow_during_ajax Send even during wp_doing_ajax() - the deactivation popup only.
     * @return bool True if VuloCloud acknowledged the ping (always false when non-blocking).
     */
    public function report( string $site_id, string $secret, array $payload, bool $blocking = false, bool $allow_during_ajax = false ): bool {
        if ( ! $this->is_configured() || ! $this->is_tracking_enabled() || ( wp_doing_ajax() && ! $allow_during_ajax ) ) {
            return false;
        }

        $response = $this->post_to_vulocloud(
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
     * User-Agent sent on every VuloCloud request.
     *
     * @return string
     */
    private function get_user_agent(): string {
        return $this->plugin_name . 'Tracker/' . $this->plugin_version . '; ' . md5( esc_url_raw( home_url( '/' ) ) );
    }

    /**
     * Best-effort recognition of hosts that identify themselves via a well-known constant/function.
     *
     * @return string
     */
    private function detect_hosting_type(): string {
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
     * 32 raw key bytes derived from this site's auth salt.
     *
     * @return string
     */
    private function get_encryption_key(): string {
        return hash( 'sha256', wp_salt( 'auth' ), true );
    }

    /**
     * Encrypt the site secret for storage.
     *
     * @param string $plaintext Plaintext site secret.
     * @return string|null Base64 IV + ciphertext, or null when OpenSSL is unavailable.
     */
    private function encrypt_secret( string $plaintext ): ?string {
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
    private function decrypt_secret( string $encoded ): ?string {
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
