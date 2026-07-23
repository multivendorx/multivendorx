<?php
/**
 * PerformanceScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags an oversized autoloaded-options footprint — every option row with
 * `autoload = 'yes'` is loaded into memory on *every* WordPress request
 * (`wp_load_alloptions()`), so a bloated autoload set (a common side
 * effect of poorly-behaved plugins storing large blobs there) is one of
 * the most direct, well-documented causes of slow WordPress sites.
 *
 * @class       PerformanceScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class PerformanceScanner extends AbstractBasicScanner {

    /**
     * Autoloaded-options size, in bytes, above which this is worth
     * flagging. 1MB is a widely-cited threshold for this exact check.
     */
    private const AUTOLOAD_SIZE_THRESHOLD_BYTES = 1_000_000;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'performance';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Performance', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_category(): string {
        return 'performance';
    }

    /**
     * @inheritDoc
     */
    public function scan(): array {
        global $wpdb;

        $findings = array();

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $autoload_bytes = (int) $wpdb->get_var(
            "SELECT SUM(LENGTH(option_value)) FROM {$wpdb->options} WHERE autoload = 'yes'"
        );

        if ( $autoload_bytes > self::AUTOLOAD_SIZE_THRESHOLD_BYTES ) {
            $findings[] = new Finding(
                sprintf(
                    /* translators: %s is a formatted byte size, e.g. "1.4 MB". */
                    __( 'Autoloaded options are %s', 'vulopilot' ),
                    size_format( $autoload_bytes )
                ),
                Severity::MEDIUM,
                $this->get_category(),
                __( 'Autoloaded options are loaded into memory on every page request. A large autoload footprint slows down every request site-wide.', 'vulopilot' ),
                'table',
                $wpdb->options,
                array( 'autoload_bytes' => $autoload_bytes )
            );
        }

        return $findings;
    }
}
