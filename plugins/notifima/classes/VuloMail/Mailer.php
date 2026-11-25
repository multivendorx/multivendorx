<?php
/**
 * Mailer class file.
 *
 * @package Notifima
 */

namespace Notifima\VuloMail;

defined( 'ABSPATH' ) || exit;

/**
 * Replaces `WC_Email`/`WC()->mailer()->emails[...]` as how Notifima actually builds and sends
 * its transactional emails. Subject/content come from VuloMail's own editable copy
 * (`Templates::defaults()` registers them there) when it's active; when it's not, the same
 * defaults are used directly and the email goes out through plain `wp_mail()` instead.
 */
class Mailer {

    /**
     * @param string $name    `plugin/name` registered in `Templates::defaults()`.
     * @param string $to      Recipient(s) -- a single address, or a comma-separated string for more than one.
     * @param array  $tags    `{tag}` => replacement value, applied to both subject and content.
     * @param string $headers Optional extra headers (e.g. a `Cc:` line), same format `wp_mail()` accepts.
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
                    'source'  => 'notifima',
                )
            );

            return ! is_wp_error( $result );
        }

        $mail_headers = $headers ? (array) $headers : array();
        $mail_headers[] = 'Content-Type: text/html; charset=UTF-8';

        return (bool) wp_mail( $to, $subject, $content, $mail_headers );
    }

    /**
     * Fills `{tag}` placeholders into a subject/content string. Delegates to VuloMail's own
     * `vulomail_substitute_tags()` instead of this plugin's own copy, which used case-sensitive
     * `strtr()` -- a template edited in VuloMail's own editor with a differently-cased tag (e.g.
     * `{PRODUCT_NAME}` instead of `{product_name}`) silently kept the literal placeholder text
     * instead of the real value. Falls back to the same case-insensitive logic locally so sending
     * still works with VuloMail inactive.
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
