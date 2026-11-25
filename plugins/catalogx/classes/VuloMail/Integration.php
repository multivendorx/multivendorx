<?php
/**
 * Integration class file.
 *
 * @package CatalogX
 */

namespace CatalogX\VuloMail;

use CatalogX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Wires VuloMail in as the enquiry email's editor, for every CatalogX site. Also self-registers
 * the REST route for the Email Customizer's enquiry email preview (instead of going through
 * `RestAPI\Rest`), reading VuloMail's own stored template content in-process
 * (`Templates\Registry::load()`) rather than round-tripping to VuloMail's REST API.
 *
 * Also replaces `WC_Email`/`WC()->mailer()->emails[...]` as how CatalogX actually builds and
 * sends its transactional emails (`send()`) -- subject/content come from VuloMail's own editable
 * copy (`Templates::defaults()` registers them there) when it's active; when it's not, the same
 * defaults are used directly and the email goes out through plain `wp_mail()` instead.
 */
class Integration {

    /**
     * Integration constructor.
     */
    public function __construct() {
        new Installer();
        new Templates();

        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    /**
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            CatalogX()->rest_namespace,
            '/vulomail-enquiry-preview',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_preview' ),
                    'permission_callback' => array( $this, 'check_permission' ),
                ),
            )
        );
    }

    /**
     * @return true|\WP_Error
     */
    public function check_permission() {
        return Utill::current_user_has_capability( array( 'manage_options' ) );
    }

    /**
     * @param \WP_REST_Request $request The REST request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function get_preview( $request ) {
        $nonce_check = Utill::validate_nonce( $request );

        if ( is_wp_error( $nonce_check ) ) {
            return $nonce_check;
        }

        // "Installed" means active -- VuloMail's classes only autoload while active.
        $installed = class_exists( '\VuloMail\VuloMail' );
        $available = $installed && class_exists( '\VuloMail\Templates\Registry' );

        $response = array(
            'installed'  => $installed,
            'plugin_url' => $installed ? admin_url( 'plugins.php' ) : admin_url( 'plugin-install.php?s=VuloMail&tab=search&type=term' ),
            'available'  => $available,
            'edit_url'   => '',
            'subject'    => '',
            'content'    => '',
        );

        if ( ! $available ) {
            return rest_ensure_response( $response );
        }

        $email = \VuloMail\Templates\Registry::load( Templates::ENQUIRY );

        if ( ! $email ) {
            return rest_ensure_response( $response );
        }

        $response['edit_url'] = function_exists( 'vulomail_get_template_edit_url' )
            ? vulomail_get_template_edit_url( Templates::ENQUIRY )
            : admin_url( 'admin.php?page=vulomail#&tab=email-templates&template=' . Templates::ENQUIRY );
        $response['subject']  = self::substitute_tags( (string) ( $email['subject'] ?? '' ), self::demo_tags(), true );
        $response['content']  = self::substitute_tags( (string) ( $email['content'] ?? '' ), self::demo_tags() );

        return rest_ensure_response( $response );
    }

    /**
     * Sample values so the admin preview reads like a real enquiry instead of showing raw `{tag}`
     * placeholders. Preview-only -- `send()` always substitutes the real submitted values.
     *
     * @return array `{tag}` => demo value.
     */
    private static function demo_tags() {
        return array(
            '{product_name}'    => __( 'Sample Product', 'catalogx' ),
            '{user_name}'       => __( 'Jane Doe', 'catalogx' ),
            '{user_email}'      => 'jane.doe@example.com',
            '{enquiry_details}' => __( 'Is this product available in other colors?', 'catalogx' ),
            '{date_time}'       => current_time( 'F j, Y g:i a' ),
        );
    }

    /**
     * @param string $name        `plugin/name` registered in `Templates::defaults()`.
     * @param string $to          Recipient(s) -- a single address, or a comma-separated string for more than one.
     * @param array  $tags        `{tag}` => replacement value, applied to both subject and content.
     * @param string $headers     Optional extra headers (e.g. a `Reply-to:` line), same format `wp_mail()` accepts.
     * @param array  $attachments Optional absolute file paths.
     * @return bool Whether the email was sent.
     */
    public static function send( $name, $to, array $tags, $headers = '', array $attachments = array() ) {
        $default = Templates::defaults()[ $name ] ?? null;

        if ( ! $default || ! $to ) {
            return false;
        }

        $subject = $default['subject'];
        $content = $default['content'];

        if ( class_exists( '\VuloMail\Templates\Registry' ) ) {
            $loaded = \VuloMail\Templates\Registry::load( $name );

            if ( $loaded ) {
                $subject = $loaded['subject'] ?? $subject;
                $content = $loaded['content'] ?? $content;
            }
        }

        $subject = self::substitute_tags( $subject, $tags, true );
        $content = self::substitute_tags( $content, $tags, false );

        if ( function_exists( 'vulomail_send_email' ) ) {
            $result = vulomail_send_email(
                array(
                    'to'          => $to,
                    'subject'     => $subject,
                    'message'     => $content,
                    'headers'     => $headers,
                    'attachments' => $attachments,
                    'source'      => 'catalogx',
                )
            );

            return ! is_wp_error( $result );
        }

        $mail_headers   = $headers ? (array) $headers : array();
        $mail_headers[] = 'Content-Type: text/html; charset=UTF-8';

        return (bool) wp_mail( $to, $subject, $content, $mail_headers, $attachments );
    }

    /**
     * Single substitution path for a template's subject/content -- `send()` and the Email
     * Customizer's preview (`get_preview()`) both go through this instead of each carrying their
     * own `str_ireplace()`/`strtr()` pass, which used to let the two silently drift. Delegates to
     * VuloMail's own `vulomail_substitute_tags()` (every VuloLabs plugin sending through VuloMail
     * shares that one implementation instead of each keeping its own copy -- which had already
     * drifted: Notifima's copy used case-sensitive `strtr()` and silently left differently-cased
     * tags unsubstituted). Falls back to the same logic locally so sending still works with
     * VuloMail inactive.
     *
     * @param string $text           Subject or content, `{tag}` placeholders intact.
     * @param array  $tags           `{tag}` => replacement value.
     * @param bool   $strip_newlines True for a subject line -- see `vulomail_substitute_tags()`.
     * @return string
     */
    public static function substitute_tags( $text, array $tags, $strip_newlines = false ) {
        if ( function_exists( 'vulomail_substitute_tags' ) ) {
            return vulomail_substitute_tags( $text, $tags, $strip_newlines );
        }

        if ( $strip_newlines ) {
            $tags = array_map(
                static function ( $value ) {
                    return str_replace( array( "\r", "\n" ), ' ', (string) $value );
                },
                $tags
            );
        }

        return str_ireplace( array_keys( $tags ), array_values( $tags ), (string) $text );
    }
}
