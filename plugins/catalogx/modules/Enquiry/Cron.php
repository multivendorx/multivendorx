<?php
/**
 * Enquiry module cron class file
 *
 * @package CatalogX
 */

namespace CatalogX\Enquiry;

defined( 'ABSPATH' ) || exit;

/**
 * CatalogX Enquiry Module cron class
 *
 * @class       Frontend class
 * @version     6.1.9
 * @author      MultiVendorX
 */
class Cron {

    /**
     * Constructor.
     */
    public function __construct() {
        add_filter( 'cron_schedules', array( $this, 'register_custom_schedules' ) );
		add_action( 'admin_init', array( $this, 'schedule_enquiry_report' ) );
		add_action( 'catalogx_send_enquiry_report', array( $this, 'catalogx_send_enquiry_report' ) );
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
	 * Schedule enquiry report cron.
	 *
	 * @return void
	 */
	public function schedule_enquiry_report() {

		$frequency = CatalogX()->setting->get_setting( 'enquiry_report_frequency',  'monthly' );

		$scheduled_frequency = wp_get_schedule( 'catalogx_send_enquiry_report' );

		if ( $scheduled_frequency === $frequency ) {
			return;
		}

		wp_clear_scheduled_hook( 'catalogx_send_enquiry_report' );

		wp_schedule_event( time() + 60, $frequency, 'catalogx_send_enquiry_report' );
	}


	/**
	 * Generate enquiry report based on selected frequency.
	 *
	 * @return void
	 */
	public function catalogx_send_enquiry_report() {

		$frequency = CatalogX()->setting->get_setting( 'enquiry_report_frequency', 'monthly' );
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

		$email = WC()->mailer()->emails['EnquiryReportEmail'];

		$enquiries = Util::get_enquiries(
			array(
				'start_date' => wp_date( 'Y-m-d H:i:s', $start_date ),
				'end_date'   => wp_date( 'Y-m-d H:i:s', $now ),
			)
		);

		if( empty( $enquiries ) ) {
			$email->trigger( array(), wp_date( 'Y-m-d H:i:s', $start_date ), wp_date( 'Y-m-d H:i:s', $now ) );
			return;
		}

		$product_report = array();

		foreach ( $enquiries as $enquiry ) {

			$products = maybe_unserialize( $enquiry->product_info );

			if ( ! is_array( $products ) ) {
				continue;
			}

			foreach ( $products as $product_id => $quantity ) {

				$product_report[ $product_id ] = array(
					'product_id'   => $product_id,
					'product_name' => get_the_title( $product_id ),
					'count'        => ( $product_report[ $product_id ]['count'] ?? 0 ) + absint( $quantity ),
				);
			}
		}

		$email->trigger( $product_report, wp_date( 'Y-m-d H:i:s', $start_date ), wp_date( 'Y-m-d H:i:s', $now ) );

	}
}