<?php
/**
 * SlowPageScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilot\ValueObjects\Finding;
use VuloPilot\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Times a real request to the site's own homepage and flags a slow
 * response — no existing scanner measures request timing (ScanRunner
 * times a whole scanner's execution, not one HTTP response), so this
 * brackets its own wp_remote_get() call with microtime(true), the same
 * way ScanRunner itself times a scanner run.
 *
 * @class       SlowPageScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class SlowPageScanner extends AbstractBasicScanner {

    /**
     * Response time, in seconds, above which the homepage is considered slow.
     */
    private const SLOW_THRESHOLD_SECONDS = 2.0;

    private const REQUEST_TIMEOUT_SECONDS = 10;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'slow-pages';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Slow Pages', 'vulopilot' );
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
        $started_at = microtime( true );
        $response   = wp_remote_get(
            home_url( '/' ),
            array(
                'timeout'   => self::REQUEST_TIMEOUT_SECONDS,
                'sslverify' => false,
            )
        );
        $elapsed    = microtime( true ) - $started_at;

        if ( is_wp_error( $response ) ) {
            return array();
        }

        if ( $elapsed < self::SLOW_THRESHOLD_SECONDS ) {
            return array();
        }

        return array(
            new Finding(
                sprintf(
                    /* translators: %s is the response time in seconds, e.g. "3.42". */
                    __( 'Homepage took %ss to respond', 'vulopilot' ),
                    number_format( $elapsed, 2 )
                ),
                Severity::MEDIUM,
                $this->get_category(),
                __( 'A slow homepage response affects every visit and is one of the biggest levers on perceived site speed.', 'vulopilot' ),
                'url',
                home_url( '/' ),
                array( 'response_time_seconds' => round( $elapsed, 2 ) )
            ),
        );
    }
}
