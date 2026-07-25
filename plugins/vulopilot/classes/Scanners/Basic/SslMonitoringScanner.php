<?php
/**
 * SslMonitoringScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilot\ValueObjects\Finding;
use VuloPilot\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags the site not being served over HTTPS at all, and — when it is —
 * connects to the site's own host to read its live certificate and flags
 * an already-expired or soon-to-expire one. No existing scanner does any
 * TLS/certificate inspection; this is genuinely new ground for this
 * codebase (SSL/DATABASE.md's own gap list), following the same
 * "reach out to the site's own front end" idiom RobotsTxtScanner/
 * SitemapScanner already use for HTTP requests.
 *
 * @class       SslMonitoringScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class SslMonitoringScanner extends AbstractBasicScanner {

    /**
     * Flag a certificate as "expiring soon" inside this many days.
     */
    private const EXPIRY_WARNING_DAYS = 30;

    /**
     * How long to wait for the TLS handshake before giving up.
     */
    private const CONNECT_TIMEOUT_SECONDS = 5;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'ssl-monitoring';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'SSL Monitoring', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_category(): string {
        return 'ssl';
    }

    /**
     * @inheritDoc
     */
    public function scan(): array {
        $host = wp_parse_url( home_url(), PHP_URL_HOST );

        if ( ! is_ssl() && 'https' !== wp_parse_url( home_url(), PHP_URL_SCHEME ) ) {
            return array(
                new Finding(
                    __( 'Site is not served over HTTPS', 'vulopilot' ),
                    Severity::HIGH,
                    $this->get_category(),
                    __( 'Serving the site without SSL/TLS exposes visitor data in transit and is penalized by most search engines.', 'vulopilot' ),
                    'url',
                    $host
                ),
            );
        }

        $certificate = $this->fetch_certificate( $host );

        if ( null === $certificate ) {
            return array();
        }

        return $this->check_certificate_expiry( $certificate, $host );
    }

    /**
     * Opens a TLS connection to the site's own host and reads back the
     * peer certificate WordPress's own HTTP API doesn't expose directly.
     *
     * @param string $host Hostname to connect to.
     * @return array<string, mixed>|null Parsed certificate fields, or null on any connection/parse failure.
     */
    private function fetch_certificate( string $host ): ?array {
        $context = stream_context_create(
            array(
                'ssl' => array(
                    'capture_peer_cert' => true,
                    'verify_peer'       => false,
                    'verify_peer_name'  => false,
                ),
            )
        );

        // stream_socket_client() emits a PHP warning on connection failure
        // in addition to returning false — the boolean return value below
        // is already how this method detects and handles that failure, so
        // the warning itself is expected noise, not something masking a
        // real bug.
        // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_stream_socket_client, WordPress.PHP.NoSilencedErrors.Discouraged
        $client = @stream_socket_client(
            sprintf( 'ssl://%s:443', $host ),
            $error_code,
            $error_message,
            self::CONNECT_TIMEOUT_SECONDS,
            STREAM_CLIENT_CONNECT,
            $context
        );

        if ( false === $client ) {
            return null;
        }

        $params = stream_context_get_params( $client );
        fclose( $client ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose

        if ( empty( $params['options']['ssl']['peer_certificate'] ) ) {
            return null;
        }

        $parsed = openssl_x509_parse( $params['options']['ssl']['peer_certificate'] );

        return false !== $parsed ? $parsed : null;
    }

    /**
     * @param array<string, mixed> $certificate Parsed certificate from openssl_x509_parse().
     * @param string               $host        Hostname the certificate was fetched for.
     * @return Finding[]
     */
    private function check_certificate_expiry( array $certificate, string $host ): array {
        if ( empty( $certificate['validTo_time_t'] ) ) {
            return array();
        }

        $expires_at    = (int) $certificate['validTo_time_t'];
        $days_left     = (int) floor( ( $expires_at - time() ) / DAY_IN_SECONDS );
        $expires_human = gmdate( 'Y-m-d', $expires_at );

        if ( $days_left < 0 ) {
            return array(
                new Finding(
                    sprintf(
                        /* translators: %s is the date the certificate expired. */
                        __( 'SSL certificate expired on %s', 'vulopilot' ),
                        $expires_human
                    ),
                    Severity::CRITICAL,
                    $this->get_category(),
                    __( 'Visitors and browsers will show a security warning until the certificate is renewed.', 'vulopilot' ),
                    'url',
                    $host,
                    array(
                        'expires_at' => $expires_human,
                        'days_left'  => $days_left,
                    )
                ),
            );
        }

        if ( $days_left <= self::EXPIRY_WARNING_DAYS ) {
            return array(
                new Finding(
                    sprintf(
                        /* translators: %s is the date the certificate expires. */
                        __( 'SSL certificate expires soon: %s', 'vulopilot' ),
                        $expires_human
                    ),
                    Severity::MEDIUM,
                    $this->get_category(),
                    sprintf(
                        /* translators: %d is the number of days remaining. */
                        __( 'This certificate expires in %d day(s). Renew it before then to avoid a browser security warning.', 'vulopilot' ),
                        $days_left
                    ),
                    'url',
                    $host,
                    array(
                        'expires_at' => $expires_human,
                        'days_left'  => $days_left,
                    )
                ),
            );
        }

        return array();
    }
}
