<?php
/**
 * Cron class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Cron class
 *
 * @class       Cron class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Cron {

    /**
     * Constructor
     */
    public function __construct() {
        // Add custom cron schedules.
        add_filter( 'cron_schedules', array( $this, 'custom_cron_schedules' ) );
        // Register cron settings.
        add_action( 'multivendorx_after_save_settings', array( $this, 'register_cron_based_on_settings' ) );

        if ( ! wp_next_scheduled( 'multivendorx_transaction_status_update' ) ) {
            wp_schedule_event( time(), 'hourly', 'multivendorx_transaction_status_update' );
        }

        if ( ! wp_next_scheduled( 'multivendorx_clear_notifications' ) ) {
            wp_schedule_event( time(), 'daily', 'multivendorx_clear_notifications' );
        }

        // This is add for testing
        add_filter( 'multivendorx_system_events', [$this, 'add_new_event'], 10 );
    }

    public function add_new_event($existing) {
        $new = [
            'add_custom_event'        => array(
				'name'           => 'Custom event',
				'desc'           => 'This is custom event.',
				'admin_enabled'  => true,
				'store_enabled'  => true,
				'email_subject'  => 'Custom event',
				'email_body'     => 'This is custom event.',
				'sms_content'    => 'This is custom event.',
				'system_message' => 'Custom event',
				'tag'            => 'Store',
				'category'       => 'activity',
			),
        ];

        return array_merge($existing, $new);
    }
    /**
     * Add custom cron schedules
     *
     * @param array $schedules Array of cron schedules.
     */
    public function custom_cron_schedules( $schedules ) {
        $schedules['weekly']      = array(
            'interval' => WEEK_IN_SECONDS,
            'display'  => __( 'Once Weekly', 'multivendorx' ),
        );
        $schedules['fortnightly'] = array(
            'interval' => 2 * WEEK_IN_SECONDS,
            'display'  => __( 'Once Every Two Weeks', 'multivendorx' ),
        );
        $schedules['monthly']     = array(
            'interval' => MONTH_IN_SECONDS,
            'display'  => __( 'Once Monthly', 'multivendorx' ),
        );
        return $schedules;
    }

    /**
     * Register the payout cron job based on the settings
     */
    public function register_cron_based_on_settings() {
        $schedule_type = MultiVendorX()->setting->get_setting( 'payment_schedules' );

        if ( empty( $schedule_type ) ) {
            return;
        }

        $settings = $this->normalize_settings( $schedule_type );

        switch ( $schedule_type ) {
            case 'hourly':
                $this->register_cron( 'hourly', $settings );
                break;

            case 'daily':
                $this->register_cron( 'daily', $settings );
                break;

            case 'weekly':
                $this->register_cron( 'weekly', $settings );
                break;

            case 'fortnightly':
                $this->register_cron( 'fortnightly', $settings );
                break;

            case 'monthly':
                $this->register_cron( 'monthly', $settings );
                break;

            case 'manual':
            default:
                $this->deregister_cron();
                break;
        }
    }

    /**
     * Normalize settings structure from DB into a standard format
     *
     * @param string $type Cron schedule type.
     */
    public function normalize_settings( $type ) {
        switch ( $type ) {
            case 'hourly':
                return array(
                    'interval' => MultiVendorX()->setting->get_setting( 'disbursement_hourly' ) ? (int) MultiVendorX()->setting->get_setting( 'disbursement_hourly' ) : 1,
                );

            case 'daily':
                $time = MultiVendorX()->setting->get_setting( 'daily_payout_time' );
                return array(
                    'time' => $time ? $time : '09:00',
                );

            case 'weekly':
                $raw = reset( MultiVendorX()->setting->get_setting( 'disbursement_weekly' ) ) ?? array();
                return array(
                    'weekday' => $raw['weekly_payout_day']['value'] ?? 'monday',
                    'time'    => $raw['weekly_payout_time'] ?? '09:00',
                );

            case 'fortnightly':
                $raw = reset( MultiVendorX()->setting->get_setting( 'disbursement_fortnightly' ) ) ?? array();
                return array(
                    'nth'     => $raw['payout_frequency'] ?? 'first',
                    'weekday' => $raw['payout_day']['value'] ?? 'monday',
                    'time'    => $raw['store_opening_time'] ?? '09:00',
                );

            case 'monthly':
                $raw = reset( MultiVendorX()->setting->get_setting( 'disbursement_monthly' ) ) ?? array();
                return array(
                    'day_of_month' => $raw['payouts_every_month'] ? (int) $raw['payouts_every_month'] : 1,
                    'time'         => $raw['monthly_payout_time'] ?? '09:00',
                );

            default:
                return array();
        }
    }

    /**
     * Get the first run time for the cron job
     *
     * @param string $schedule Cron schedule name.
     * @param array  $settings Cron settings.
     */
    public function get_first_run( $schedule, $settings ) {
        $hour   = ! empty( $settings['time'] ) ? (int) gmdate( 'H', strtotime( $settings['time'] ) ) : 9;
        $minute = ! empty( $settings['time'] ) ? (int) gmdate( 'i', strtotime( $settings['time'] ) ) : 0;

        switch ( $schedule ) {
            case 'daily':
                $ts = strtotime( "today {$hour}:{$minute}" );
                if ( $ts <= time() ) {
                    $ts = strtotime( "tomorrow {$hour}:{$minute}" );
                }
                return $ts;

            case 'weekly':
                $day = $settings['weekday'] ?? 'monday';
                $ts  = strtotime( "next {$day} {$hour}:{$minute}" );
                return $ts;

            case 'fortnightly':
                $nth = $settings['nth'] ?? 'first'; // e.g. first, second.
                $day = $settings['weekday'] ?? 'monday';
                $ts  = strtotime( "{$nth} {$day} of this month {$hour}:{$minute}" );
                if ( $ts <= time() ) {
                    $ts = strtotime( "{$nth} {$day} of next month {$hour}:{$minute}" );
                }
                return $ts;

            case 'monthly':
                $date = ! empty( $settings['day_of_month'] ) ? (int) $settings['day_of_month'] : 1;
                $ts   = strtotime( gmdate( "Y-m-{$date} {$hour}:{$minute}:00" ) );
                if ( $ts <= time() ) {
                    $ts = strtotime( '+1 month', $ts );
                }
                return $ts;

            case 'hourly':
                $interval = ! empty( $settings['interval'] ) ? (int) $settings['interval'] : 1;
                $now      = time();

                $current_minute = (int) gmdate( 'i', $now );

                if ( $current_minute >= $interval ) {
                    $next = strtotime( '+' . ( 60 - $current_minute + $interval ) . ' minutes', $now );
                } else {
                    $next = strtotime( '+' . ( $interval - $current_minute ) . ' minutes', $now );
                }

                return $next;

            default:
                return time() + MINUTE_IN_SECONDS;
        }
    }

    /**
     * Register the payout cron job.
     *
     * @param string $schedule The cron schedule (e.g., 'daily', 'hourly').
     * @param array  $settings Settings used to determine first run time.
     *
     * @return void
     */
    public function register_cron( $schedule, $settings ) {
        $hook = 'multivendorx_payout_cron';

        // Always clear old cron first.
        wp_clear_scheduled_hook( $hook );

        $first_run = $this->get_first_run( $schedule, $settings );

        wp_schedule_event( $first_run, $schedule, $hook );
    }

    /**
     * Deregister the payout cron job
     */
    public function deregister_cron() {
        wp_clear_scheduled_hook( 'multivendorx_payout_cron' );
    }
}
