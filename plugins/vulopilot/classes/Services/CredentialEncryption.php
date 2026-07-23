<?php
/**
 * CredentialEncryption class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Services;

defined( 'ABSPATH' ) || exit;

/**
 * Encrypts/decrypts third-party API keys before they touch
 * vulopilot_ai_provider_configs.credentials. Flagged in DATABASE.md and
 * ARCHITECTURE.md as new ground for this codebase — nothing else here
 * encrypts a secret at rest (the license system validates a license key
 * against MultiVendorX's own server; it isn't a third-party credential
 * with direct spend risk the way an OpenAI/Anthropic/etc. key is).
 *
 * The encryption key is derived from wp_salt('auth') rather than stored
 * anywhere in the database — the same site-specific secret WordPress
 * itself relies on for auth cookies, so it moves (or is lost) exactly
 * when the rest of the site's secrets would too. AES-256-CBC with a
 * random IV per call, IV prepended to the ciphertext (standard
 * construction — the IV isn't secret, it just must never repeat with the
 * same key).
 *
 * @class       CredentialEncryption class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class CredentialEncryption {

    private const CIPHER = 'aes-256-cbc';

    /**
     * @return string 32 raw bytes, suitable for aes-256-cbc.
     */
    private static function get_key(): string {
        return hash( 'sha256', wp_salt( 'auth' ), true );
    }

    /**
     * @param string $plaintext The raw API key.
     * @return string Base64-encoded IV + ciphertext.
     */
    public static function encrypt( string $plaintext ): string {
        $iv         = random_bytes( openssl_cipher_iv_length( self::CIPHER ) );
        $ciphertext = openssl_encrypt( $plaintext, self::CIPHER, self::get_key(), OPENSSL_RAW_DATA, $iv );

        return base64_encode( $iv . $ciphertext );
    }

    /**
     * @param string $encoded Value previously returned by encrypt().
     * @return string|null The original plaintext, or null if $encoded is malformed/undecryptable.
     */
    public static function decrypt( string $encoded ): ?string {
        $raw        = base64_decode( $encoded, true );
        $iv_length  = openssl_cipher_iv_length( self::CIPHER );

        if ( false === $raw || strlen( $raw ) <= $iv_length ) {
            return null;
        }

        $iv         = substr( $raw, 0, $iv_length );
        $ciphertext = substr( $raw, $iv_length );
        $plaintext  = openssl_decrypt( $ciphertext, self::CIPHER, self::get_key(), OPENSSL_RAW_DATA, $iv );

        return false === $plaintext ? null : $plaintext;
    }
}
