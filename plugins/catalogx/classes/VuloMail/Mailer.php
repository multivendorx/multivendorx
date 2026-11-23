<?php
/**
 * Mailer class file.
 *
 * @package CatalogX
 */

namespace CatalogX\VuloMail;

defined( 'ABSPATH' ) || exit;

/**
 * Replaces `WC_Email`/`WC()->mailer()->emails[...]` as how CatalogX actually builds and sends
 * its transactional emails. Subject/content come from VuloMail's own editable copy
 * (`Templates::defaults()` registers them there) when it's active; when it's not, the same
 * defaults are used directly and the email goes out through plain `wp_mail()` instead.
 */
class Mailer {

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

        // A tag's value can come from an unauthenticated form submission (e.g. the enquiry
        // form's name/email). Strip CR/LF before it ever lands in the subject line -- a stray
        // newline there becomes a real extra mail header once PHPMailer/wp_mail parses it. (The
        // caller is still responsible for validating/newline-stripping anything it puts directly
        // into $headers itself, e.g. a Reply-To built from submitter input -- see the CVE report
        // on the enquiry email's old Reply-To header.)
        $subject_tags = array_map(
            static function ( $value ) {
                return str_replace( array( "\r", "\n" ), ' ', (string) $value );
            },
			$tags
        );

        // Case-insensitive: once a template's content/subject is edited in VuloMail's own
        // editor, its tags are whatever casing was typed/pasted there (e.g. a generic
        // "{PRODUCT_NAME}" placeholder VuloMail itself suggested), not necessarily the exact
        // lowercase `{product_name}` this plugin registers. strtr() is case-sensitive and
        // silently leaves an unmatched tag as literal text instead of the real value -- which is
        // how a saved template can end up missing product/enquiry details with no error at all.
        $subject = str_ireplace( array_keys( $subject_tags ), array_values( $subject_tags ), (string) $subject );
        $content = str_ireplace( array_keys( $tags ), array_values( $tags ), (string) $content );

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

        $mail_headers = $headers ? (array) $headers : array();
        $mail_headers[] = 'Content-Type: text/html; charset=UTF-8';

        return (bool) wp_mail( $to, $subject, $content, $mail_headers, $attachments );
    }
}
