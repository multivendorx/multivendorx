<?php
/**
 * Cron class file.
 *
 * @package MooWoodle
 */

namespace MooWoodle;

/**
 * MooWoodle Cron class
 *
 * @class       Cron class
 * @version     PRODUCT_VERSION
 * @author      DualCube
 */
class Cron {
	/**
	 * Cron class constructor function
	 */
    public function __construct() {
		add_action( 'moowoodle_process_course_expiry', array( $this, 'process_expired_courses' ));

		$this->schedule_course_expired_cron();
    }

	/**
	 * Process expired courses and draft their associated products.
	 *
	 * @return void
	 */
	public function process_expired_courses() {
		$courses = MooWoodle()->course->get_courses(
			array(
				'expired'     => true,
				'has_product' => true,
			)
		);

		if ( empty( $courses ) ) {
			return;
		}

		foreach ( $courses as $course ) {
			$product_id = absint( $course['product_id'] );

			if ( ! $product_id ) {
				continue;
			}

			$product = wc_get_product( $product_id );

			if ( ! $product || 'draft' === $product->get_status() ) {
				continue;
			}

			$product->set_status( 'draft' );
			$product->save();
		}
	}

	/**
	 * Schedule expired course cron.
	 *
	 * @return void
	 */
	public function schedule_course_expired_cron() {
		if ( ! wp_next_scheduled( 'moowoodle_process_course_expiry' ) ) {
			wp_schedule_event(
				time(),
				'hourly',
				'moowoodle_process_course_expiry'
			);
		}
	}
}
