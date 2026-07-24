<?php
/**
 * PhpWarningScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilot\ValueObjects\Finding;
use VuloPilot\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Tails WordPress's own debug.log (when WP_DEBUG_LOG is enabled) for
 * recent PHP warnings/notices/deprecated/fatal messages, deduped by
 * message text. This scanner has no way to detect what isn't being
 * logged — if WP_DEBUG_LOG is off, it returns no findings rather than
 * guessing; that's a correct, honest "nothing to report" result, not a
 * failure. Bounded to the last MAX_BYTES_READ of the file (never reads
 * the whole log) and the last MAX_LINES_CHECKED lines within that, same
 * bounded-work discipline every other scanner here follows.
 *
 * @class       PhpWarningScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class PhpWarningScanner extends AbstractBasicScanner {

    private const MAX_BYTES_READ    = 204800; // 200KB from the end of the file.
    private const MAX_LINES_CHECKED = 500;
    private const MAX_FINDINGS      = 20;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'php-warnings';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'PHP Warning Detection', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_category(): string {
        return 'php-warnings';
    }

    /**
     * @inheritDoc
     */
    public function scan(): array {
        $log_path = $this->get_debug_log_path();

        if ( null === $log_path || ! is_readable( $log_path ) ) {
            return array();
        }

        $lines    = $this->tail_log( $log_path );
        $messages = array();

        foreach ( $lines as $line ) {
            $parsed = $this->parse_log_line( $line );

            if ( null === $parsed ) {
                continue;
            }

            // Dedupe by message text — the same warning firing on every
            // page load would otherwise flood findings with near-identical
            // rows.
            $messages[ $parsed['message'] ] = $parsed;
        }

        $findings = array();

        foreach ( array_slice( $messages, 0, self::MAX_FINDINGS ) as $entry ) {
            $findings[] = new Finding(
                sprintf(
                    /* translators: 1: PHP error level (Warning, Notice, etc.), 2: the error message. */
                    __( 'PHP %1$s: %2$s', 'vulopilot' ),
                    $entry['level'],
                    $entry['message']
                ),
                $this->severity_for_level( $entry['level'] ),
                $this->get_category(),
                __( 'Found in this site\'s own debug.log. Recurring warnings can indicate a plugin/theme compatibility issue.', 'vulopilot' ),
                null,
                null,
                array( 'level' => $entry['level'] )
            );
        }

        return $findings;
    }

    /**
     * Resolves WP_DEBUG_LOG's effective log file path — it's either a
     * boolean (defaulting to WP_CONTENT_DIR . '/debug.log') or a custom
     * path string.
     *
     * @return string|null
     */
    private function get_debug_log_path(): ?string {
        if ( ! defined( 'WP_DEBUG_LOG' ) || ! WP_DEBUG_LOG ) {
            return null;
        }

        if ( is_string( WP_DEBUG_LOG ) ) {
            return WP_DEBUG_LOG;
        }

        return WP_CONTENT_DIR . '/debug.log';
    }

    /**
     * Reads the last MAX_BYTES_READ bytes of the log file and returns up
     * to MAX_LINES_CHECKED of its most recent lines.
     *
     * @param string $log_path Absolute path to the debug log.
     * @return string[]
     */
    private function tail_log( string $log_path ): array {
        $file_size   = filesize( $log_path );
        $read_length = min( $file_size, self::MAX_BYTES_READ );

        // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fopen
        $handle = fopen( $log_path, 'r' );

        if ( false === $handle ) {
            return array();
        }

        fseek( $handle, -$read_length, SEEK_END );
        $contents = fread( $handle, $read_length ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fread
        fclose( $handle ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose

        if ( false === $contents ) {
            return array();
        }

        $lines = explode( "\n", $contents );

        return array_slice( $lines, -self::MAX_LINES_CHECKED );
    }

    /**
     * Parses one debug.log line into a level/message pair. WordPress's
     * own format is "[date] PHP Warning:  message in file on line N".
     *
     * @param string $line Raw log line.
     * @return array{level: string, message: string}|null
     */
    private function parse_log_line( string $line ): ?array {
        if ( ! preg_match( '/PHP (Warning|Notice|Deprecated|Fatal error|Parse error):\s*(.+?)\s+in\s+\S+\s+on line \d+/', $line, $matches ) ) {
            return null;
        }

        return array(
            'level'   => $matches[1],
            'message' => $matches[2],
        );
    }

    /**
     * @param string $level PHP error level as it appears in debug.log.
     * @return string One of Severity's constants.
     */
    private function severity_for_level( string $level ): string {
        switch ( $level ) {
            case 'Fatal error':
            case 'Parse error':
                return Severity::CRITICAL;
            case 'Warning':
                return Severity::MEDIUM;
            default:
                return Severity::LOW;
        }
    }
}
