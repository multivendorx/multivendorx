<?php
/**
 * Cron class file.
 *
 * @package Notifima
 */

namespace Notifima;

defined( 'ABSPATH' ) || exit;

/**
 * Notifima Cron class
 *
 * @class       Cron class
 * @version     3.1.10
 * @author      MultiVendorX
 */
class Cron {

    /**
     * Constructor.
     */
    public function __construct() {
        add_filter( 'cron_schedules', array( $this, 'register_custom_schedules' ) );
        add_action( 'admin_init', array( $this, 'schedule_subscriber_report' ) );
		add_action( 'notifima_send_subscriber_report', array( $this, 'notifima_send_subscriber_report' ) );
    }

    /**
     * Register custom cron schedules.
     *
     * @param array $schedules Available cron schedules.
     * @return array
     */
    public function register_custom_schedules( $schedules ) {

        $schedules['biweekly'] = array(
            'interval' => 14 * DAY_IN_SECONDS,
            'display'  => __( 'Every 2 weeks', 'catalogx' ),
        );

        $schedules['monthly'] = array(
            'interval' => 30 * DAY_IN_SECONDS,
            'display'  => __( 'Monthly', 'catalogx' ),
        );

        $schedules['quarterly'] = array(
            'interval' => 90 * DAY_IN_SECONDS,
            'display'  => __( 'Quarterly', 'catalogx' ),
        );

        return $schedules;
    }

    /**
     * Schedule subscriber report cron.
     *
     * @return void
     */
    public function schedule_subscriber_report() {

        $frequency = Notifima()->setting->get_setting( 'subscriber_report_frequency', 'monthly' );

        $scheduled_frequency = wp_get_schedule( 'notifima_send_subscriber_report' );

        if ( $scheduled_frequency === $frequency ) {
            return;
        }

        wp_clear_scheduled_hook( 'notifima_send_subscriber_report' );

        wp_schedule_event( time() + 60, $frequency, 'notifima_send_subscriber_report' );
    }


    /**
     * Generate subscriber report based on selected frequency.
     *
     * @return void
     */
    public function notifima_send_subscriber_report() {

        $frequency = Notifima()->setting->get_setting( 'subscriber_report_frequency', 'monthly' );
        $now       = current_time( 'timestamp' );

        switch ( $frequency ) {
            case 'daily':
                $start_date = strtotime( 'yesterday', $now );
                break;

            case 'weekly':
                $start_date = strtotime( '-1 week', $now );
                break;

            case 'biweekly':
                $start_date = strtotime( '-2 weeks', $now );
                break;

            case 'monthly':
                $start_date = strtotime( '-1 month', $now );
                break;

            case 'quarterly':
                $start_date = strtotime( '-3 months', $now );
                break;

            default:
                return;
        }

        $email = WC()->mailer()->emails['Subscriber_Report_Email'];

        $subscribers = Utill::get_subscribers(
            array(
                'start_date' => $start_date,
                'end_date'   => $now,
            )
        );

        $subscriber_report = array();

        foreach ( $subscribers as $subscriber ) {

            $product_id = absint( $subscriber->product_id );

            $subscriber_report[ $product_id ] = array(
                'product_id'   => $product_id,
                'product_name' => get_the_title( $product_id ),
                'count'        => ( $subscriber_report[ $product_id ]['count'] ?? 0 ) + 1,
            );
        }

        $email->trigger(
            array_values( $subscriber_report ),
            wp_date( 'Y-m-d H:i:s', $start_date ),
            wp_date( 'Y-m-d H:i:s', $now )
        );
    }
}