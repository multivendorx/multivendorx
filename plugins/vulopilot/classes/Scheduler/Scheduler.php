<?php
/**
 * Scheduler class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scheduler;

use VuloPilot\Scanners\ScanRunner;
use VuloPilot\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Thin wp-cron wrapper (ARCHITECTURE.md) — custom intervals plus a generic
 * schedule/unschedule helper AutomationEngine's cron-based triggers reuse,
 * rather than each trigger calling wp_schedule_event()/wp_next_scheduled()
 * directly. wp-cron, not a new queue library: nothing else in this repo
 * uses Action Scheduler or similar, so this doesn't introduce new
 * build/runtime infrastructure unprompted (root CLAUDE.md's "Out of
 * scope").
 *
 * Also owns the one thing that already had a settings key
 * (`Utill::VULOPILOT_SETTINGS_DEFAULTS['scan_frequency']`) but nothing
 * reading it yet: the recurring "run every scanner" tick. Previously that
 * setting was saved and displayed in the Settings screen but never
 * actually scheduled anything.
 *
 * @class       Scheduler class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Scheduler {

    private const SCHEDULED_SCAN_HOOK = 'vulopilot_scheduled_scan';

    /**
     * @var ScanRunner
     */
    private ScanRunner $scan_runner;

    /**
     * @param ScanRunner $scan_runner Runner to invoke on the scheduled scan tick.
     */
    public function __construct( ScanRunner $scan_runner ) {
        $this->scan_runner = $scan_runner;

        add_filter( 'cron_schedules', array( $this, 'register_custom_intervals' ) ); // phpcs:ignore WordPress.WP.CronInterval.CronSchedulesInterval
        add_action( 'init', array( $this, 'ensure_scheduled_scan' ), 30 );
        add_action( self::SCHEDULED_SCAN_HOOK, array( $this, 'run_scheduled_scan' ) );
    }

    /**
     * Adds 'weekly'/'monthly' — wp-cron ships hourly/twicedaily/daily only.
     *
     * @param array $schedules Existing registered schedules.
     * @return array
     */
    public function register_custom_intervals( $schedules ) {
        if ( ! isset( $schedules['weekly'] ) ) {
            $schedules['weekly'] = array(
                'interval' => WEEK_IN_SECONDS,
                'display'  => __( 'Once Weekly', 'vulopilot' ),
            );
        }

        if ( ! isset( $schedules['monthly'] ) ) {
            $schedules['monthly'] = array(
                'interval' => 30 * DAY_IN_SECONDS,
                'display'  => __( 'Once Monthly', 'vulopilot' ),
            );
        }

        return $schedules;
    }

    /**
     * (Re)schedules the recurring full-scan tick to match the current
     * `scan_frequency` setting, rescheduling only when the setting has
     * actually changed since the last time this ran (comparing the
     * currently-scheduled recurrence, not just "is something scheduled").
     *
     * @return void
     */
    public function ensure_scheduled_scan(): void {
        $settings       = wp_parse_args( get_option( Utill::VULOPILOT_SETTINGS_KEY, array() ), Utill::VULOPILOT_SETTINGS_DEFAULTS );
        $scan_frequency = in_array( $settings['scan_frequency'], array( 'hourly', 'daily', 'weekly' ), true )
            ? $settings['scan_frequency']
            : Utill::VULOPILOT_SETTINGS_DEFAULTS['scan_frequency'];

        $scheduled_event = wp_get_scheduled_event( self::SCHEDULED_SCAN_HOOK );

        if ( $scheduled_event && $scheduled_event->schedule === $scan_frequency ) {
            return;
        }

        $this->unschedule( self::SCHEDULED_SCAN_HOOK );
        $this->schedule_recurring( self::SCHEDULED_SCAN_HOOK, $scan_frequency );
    }

    /**
     * Runs on the scheduled tick — every registered scanner, same as the
     * REST-triggered "run all scans now" path.
     *
     * @return void
     */
    public function run_scheduled_scan(): void {
        $this->scan_runner->run_all();
    }

    /**
     * Generic recurring-event scheduler AutomationEngine's cron-based
     * triggers reuse — a no-op if $hook is already scheduled.
     *
     * @param string $hook     Action hook to fire on each recurrence.
     * @param string $interval One of the recurrences registered in register_custom_intervals()/wp-cron's own defaults.
     * @return void
     */
    public function schedule_recurring( string $hook, string $interval ): void {
        if ( ! wp_next_scheduled( $hook ) ) {
            wp_schedule_event( time(), $interval, $hook );
        }
    }

    /**
     * @param string $hook Action hook to unschedule every occurrence of.
     * @return void
     */
    public function unschedule( string $hook ): void {
        wp_clear_scheduled_hook( $hook );
    }
}
