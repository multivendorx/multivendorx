<?php
/**
 * CronScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags scheduled cron events that are overdue — a hook scheduled for the
 * past that still hasn't run means WP-Cron isn't actually firing (no
 * traffic hitting the site, DISABLE_WP_CRON without a real system cron
 * replacing it, a fatal error in another hook blocking the request). This
 * mirrors the check behind WordPress core's own Site Health "scheduled
 * event" test, using the same _get_cron_array() core already maintains.
 *
 * @class       CronScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class CronScanner extends AbstractBasicScanner {

    /**
     * How late (in seconds) an event has to be before it's flagged.
     * One hour comfortably exceeds normal scheduling jitter.
     */
    private const OVERDUE_THRESHOLD_SECONDS = HOUR_IN_SECONDS;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'cron';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Cron', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_category(): string {
        return 'cron';
    }

    /**
     * @inheritDoc
     */
    public function scan(): array {
        $findings   = array();
        $cron_array = _get_cron_array();

        if ( false === $cron_array ) {
            return $findings;
        }

        $now = time();

        foreach ( $cron_array as $timestamp => $hooks ) {
            if ( $timestamp >= $now - self::OVERDUE_THRESHOLD_SECONDS ) {
                continue;
            }

            foreach ( array_keys( $hooks ) as $hook_name ) {
                $findings[] = new Finding(
                    sprintf(
                        /* translators: %s is the cron hook name. */
                        __( 'Overdue scheduled event: %s', 'vulopilot' ),
                        $hook_name
                    ),
                    Severity::MEDIUM,
                    $this->get_category(),
                    sprintf(
                        /* translators: %s is a human-readable time difference, e.g. "2 hours". */
                        __( 'This event was due %s ago and has not run — WP-Cron may not be firing.', 'vulopilot' ),
                        human_time_diff( $timestamp, $now )
                    ),
                    'cron_hook',
                    $hook_name
                );
            }
        }

        return $findings;
    }
}
