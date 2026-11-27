<?php
/**
 * Integration class file.
 *
 * @package CatalogX
 */

namespace CatalogX\Integrations\VuloMail;

use CatalogX\Integrations\PluginInstaller;

defined( 'ABSPATH' ) || exit;

/**
 * Wires VuloMail in as the enquiry email's editor. Installs VuloMail via the shared
 * `PluginInstaller`. The Email Customizer's preview reads VuloMail's own REST API directly, so
 * `get_admin_localize_data()` only resolves install state. Also replaces `WC_Email` as how
 * CatalogX sends its transactional emails (`send()`), falling back to `wp_mail()` when VuloMail
 * isn't active.
 */
class Integration {

    /**
     * Integration constructor.
     */
    public function __construct() {
        new PluginInstaller(
            'vulomail',
            '\VuloMail\VuloMail',
            static function ( $error_message ) {
                return sprintf(
                    /* translators: %s: error message. */
                    __( 'CatalogX could not automatically install the VuloMail plugin needed for email templates: %s. Please install and activate "VuloMail" manually from the Plugins screen.', 'catalogx' ),
                    $error_message
                );
            }
        );
        new Templates();
    }

    /**
     * Install state for the Email Customizer's enquiry email preview, localized server-side
     * instead of fetched over REST -- see the class docblock.
     *
     * @return array
     */
    public static function get_admin_localize_data() {
        // "Installed" means active -- VuloMail's classes only autoload while active.
        $installed = class_exists( '\VuloMail\VuloMail' );
        $available = $installed && class_exists( '\VuloMail\Templates\Registry' );

        $edit_url = '';

        if ( $available && \VuloMail\Templates\Registry::load( Templates::ENQUIRY ) ) {
            $edit_url = function_exists( 'vulomail_get_template_edit_url' )
                ? vulomail_get_template_edit_url( Templates::ENQUIRY )
                : admin_url( 'admin.php?page=vulomail#&tab=email-templates&template=' . Templates::ENQUIRY );
        }

        return array(
            'installed'     => $installed,
            'plugin_url'    => $installed ? admin_url( 'plugins.php' ) : admin_url( 'plugin-install.php?s=VuloMail&tab=search&type=term' ),
            'available'     => $available,
            'edit_url'      => $edit_url,
            'template_name' => Templates::ENQUIRY,
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

        if ( ! $default ) {
            return false;
        }

        return self::send_template( $name, $default, $to, $tags, $headers, $attachments );
    }

    /**
     * Shared by this class and CatalogX Pro's `VuloMail\Integration::send()` -- the only things
     * that differ between a free and a Pro transactional email are which `Templates::defaults()`
     * the fallback subject/content comes from (each plugin keeps its own) and the `$source` tag
     * passed to `vulomail_send_email()`; everything else (VuloMail registry override, tag
     * substitution, the `wp_mail()` fallback) is identical and lives here once.
     *
     * @param string $name        `plugin/name` registered in the caller's `Templates::defaults()`.
     * @param array  $default     `['subject' => ..., 'content' => ...]`, the caller's own fallback.
     * @param string $to          Recipient(s) -- a single address, or a comma-separated string for more than one.
     * @param array  $tags        `{tag}` => replacement value, applied to both subject and content.
     * @param string $headers     Optional extra headers (e.g. a `Reply-to:` line), same format `wp_mail()` accepts.
     * @param array  $attachments Optional absolute file paths.
     * @param string $source      Passed to `vulomail_send_email()` to identify which plugin sent it.
     * @return bool Whether the email was sent.
     */
    public static function send_template( $name, array $default, $to, array $tags, $headers = '', array $attachments = array(), $source = 'catalogx' ) {
        if ( ! $to ) {
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
                    'source'      => $source,
                )
            );

            return ! is_wp_error( $result );
        }

        $mail_headers   = $headers ? (array) $headers : array();
        $mail_headers[] = 'Content-Type: text/html; charset=UTF-8';

        return (bool) wp_mail( $to, $subject, $content, $mail_headers, $attachments );
    }

    /**
     * Single substitution path for a template's subject/content -- `send()` goes through this
     * instead of carrying its own `str_ireplace()`/`strtr()` pass, which used to let it and the
     * Email Customizer's preview silently drift (the preview now substitutes its own demo tags
     * client-side, against the same raw `{tag}` content VuloMail's REST API returns). Delegates to
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
