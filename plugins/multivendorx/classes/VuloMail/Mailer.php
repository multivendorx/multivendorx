<?php
/**
 * Mailer class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\VuloMail;

defined( 'ABSPATH' ) || exit;

/**
 * Replaces `WC()->mailer()->emails[...]` as how MultiVendorX sends the two admin emails that
 * were still reaching for it (both classes were never actually registered, so those calls were
 * already dead). Subject/content come from VuloMail's own editable copy (`Templates::defaults()`
 * registers them there) when it's active; when it's not, the same defaults are used directly and
 * the email goes out through plain `wp_mail()` instead.
 */
class Mailer {

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

        // A tag's value can come from user-submitted input (e.g. the deactivation-feedback
        // form's reason/details). Strip CR/LF before it ever lands in the subject line -- a
        // stray newline there becomes a real extra mail header once PHPMailer/wp_mail parses it.
        $subject_tags = array_map(
            static function ( $value ) {
                return str_replace( array( "\r", "\n" ), ' ', (string) $value );
            },
            $tags
        );

        // Case-insensitive: once a template's content/subject is edited in VuloMail's own
        // editor, its tags are whatever casing was typed/pasted there, not necessarily the exact
        // lowercase tags registered here.
        $subject = str_ireplace( array_keys( $subject_tags ), array_values( $subject_tags ), (string) $subject );
        $content = str_ireplace( array_keys( $tags ), array_values( $tags ), (string) $content );

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

        $mail_headers = $headers ? (array) $headers : array();
        $mail_headers[] = 'Content-Type: text/html; charset=UTF-8';

        return (bool) wp_mail( $to, $subject, $content, $mail_headers );
    }
}
