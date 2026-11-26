<?php
/**
 * Integration class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Integrations\VuloMail;

use MultiVendorX\Integrations\PluginInstaller;

defined( 'ABSPATH' ) || exit;

/**
 * Wires VuloMail in as MultiVendorX's email transport. Installs VuloMail via the shared
 * `PluginInstaller`; the one-time migration of a site's pre-5.0.21 admin email/SMS settings into
 * VuloMail's own connections lives in the sibling `Migration` class (triggered from `Install.php`'s
 * `do_migration()`). Also replaces `WC()->mailer()->emails[...]` as how MultiVendorX sends the two
 * admin emails that were still reaching for it (`send()`), falling back to `wp_mail()` when
 * VuloMail isn't active.
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
                    __( 'MultiVendorX could not automatically install the VuloMail plugin needed for email and SMS notifications: %s. Please install and activate "VuloMail" manually from the Plugins screen.', 'multivendorx' ),
                    $error_message
                );
            }
        );
        new Templates();
    }

    /**
     * @param string $name    `plugin/name` registered in `Templates::defaults()`.
     * @param string $to      Recipient(s) -- a single address, or a comma-separated string for more than one.
     * @param array  $tags    `{tag}` => replacement value, applied to both subject and content.
     * @param string $headers Optional extra headers, same format `wp_mail()` accepts.
     * @return bool Whether the email was sent.
     */
    public static function send( $name, $to, array $tags, $headers = '' ) {
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
                    'to'      => $to,
                    'subject' => $subject,
                    'message' => $content,
                    'headers' => $headers,
                    'source'  => 'multivendorx',
                )
            );

            return ! is_wp_error( $result );
        }

        $mail_headers   = $headers ? (array) $headers : array();
        $mail_headers[] = 'Content-Type: text/html; charset=UTF-8';

        return (bool) wp_mail( $to, $subject, $content, $mail_headers );
    }

    /**
     * Fills `{tag}` placeholders into a subject/content string. Delegates to VuloMail's own
     * `vulomail_substitute_tags()` (every VuloLabs plugin sending through VuloMail shares that
     * one implementation instead of each keeping its own copy -- which had already drifted:
     * Notifima's copy used case-sensitive `strtr()` and silently left differently-cased tags
     * unsubstituted). Falls back to the same logic locally so sending still works with VuloMail
     * inactive.
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
