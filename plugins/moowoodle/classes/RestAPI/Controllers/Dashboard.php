<?php
/**
 * MooWoodle REST API Dashboard controller.
 *
 * @package MooWoodle
 */

namespace MooWoodle\RestAPI\Controllers;

use MooWoodle\Util;

defined( 'ABSPATH' ) || exit;

/**
 * REST API controller for the admin dashboard: connection state, course and enrollment figures for the last 30 days,
 * and the counts the dashboard turns into "needs your attention" items.
 */
class Dashboard extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'dashboard';

	/**
	 * Length of the reporting period, in days. The period before it, of the same length, is the comparison.
	 */
	const PERIOD_DAYS = 30;

	/**
	 * A course on sale with no enrollment for this many days counts as not selling.
	 */
	const IDLE_DAYS = 90;

	/**
	 * Register the routes for the objects of the controller.
	 */
	public function register_routes() {
		register_rest_route(
			MooWoodle()->rest_namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'moowoodle_permissions_check' ),
				),
			)
		);
	}

	/**
	 * Check request permissions.
	 *
	 * @param \WP_REST_Request $request REST request object.
	 * @return bool
	 */
	public function moowoodle_permissions_check( $request ) {
		return Util::current_user_has_capability( array( 'manage_options' ) );
	}

	/**
	 * Everything the dashboard shows, in one response.
	 *
	 * Dates are grouped by the site's time zone (its current UTC offset), so "today" on the chart is the site's today.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_items( $request ) {
		$nonce_check = Util::validate_nonce( $request );

		if ( is_wp_error( $nonce_check ) ) {
			return $nonce_check;
		}

		try {
			$now          = time();
			$period_start = gmdate( 'Y-m-d H:i:s', $now - self::PERIOD_DAYS * DAY_IN_SECONDS );
			$prior_start  = gmdate( 'Y-m-d H:i:s', $now - 2 * self::PERIOD_DAYS * DAY_IN_SECONDS );

			$dashboard_data = array(
				'period_days' => self::PERIOD_DAYS,
				'idle_days'   => self::IDLE_DAYS,
				'connection'  => $this->get_connection_state(),
				'courses'     => $this->get_course_counts( $now ),
				'enrollments' => $this->get_enrollment_counts( $period_start, $prior_start ),
				'daily'       => $this->get_daily_enrollments( $now ),
				'top_courses' => $this->get_top_courses( $period_start ),
				'recent'      => $this->get_recent_enrollments(),
			);

			/**
			 * Filters the admin dashboard data, e.g. for MooWoodle Pro to add cohort or classroom figures.
			 *
			 * @param array            $dashboard_data The dashboard response.
			 * @param \WP_REST_Request $request        The request.
			 */
			return rest_ensure_response( apply_filters( 'moowoodle_dashboard_data', $dashboard_data, $request ) );
		} catch ( \Exception $exception ) {
			MooWoodle()->util->log( $exception );

			return new \WP_Error(
				'moowoodle_dashboard_failed',
				esc_html__( 'Could not load the dashboard.', 'moowoodle' ),
				array( 'status' => 500 )
			);
		}
	}

	/**
	 * Whether Moodle is set up: the URL and token are saved, and the Moodle site name is known from a passed
	 * connection test (TestConnection::get_site_info() stores it).
	 *
	 * @return array
	 */
	private function get_connection_state() {
		$moodle_url = (string) MooWoodle()->setting->get_setting( 'moodle_url' );
		$has_token  = '' !== (string) MooWoodle()->setting->get_setting( 'moodle_access_token' );

		return array(
			'configured'   => '' !== $moodle_url && $has_token,
			'site_name'    => (string) get_option( 'moowoodle_moodle_site_name', '' ),
			'moodle_url'   => esc_url_raw( $moodle_url ),
			'sync_running' => (bool) get_transient( 'moowoodle_course_sync_running' ),
		);
	}

	/**
	 * Synced courses: how many, how many are sold through a product, and the ones that need a look (on sale but not
	 * selling, ending soon, ended but still on sale).
	 *
	 * @param int $now Current Unix time.
	 * @return array
	 */
	private function get_course_counts( $now ) {
		global $wpdb;

		$course_table     = $wpdb->prefix . Util::TABLES['course'];
		$enrollment_table = $wpdb->prefix . Util::TABLES['enrollment'];
		$category_table   = $wpdb->prefix . Util::TABLES['category'];
		$idle_since       = gmdate( 'Y-m-d H:i:s', $now - self::IDLE_DAYS * DAY_IN_SECONDS );

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery -- table names come from Util::TABLES; values are prepared.
		$totals = $wpdb->get_row( "SELECT COUNT(*) AS total, SUM( product_id > 0 ) AS with_product FROM `{$course_table}`", ARRAY_A );

		$not_selling = (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM `{$course_table}` AS course
				WHERE course.product_id > 0
				AND NOT EXISTS (
					SELECT 1 FROM `{$enrollment_table}` AS enrollment
					WHERE enrollment.course_id = course.id AND enrollment.enrollment_date >= %s
				)",
				$idle_since
			)
		);

		$ending_soon = (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM `{$course_table}` WHERE enddate > %d AND enddate <= %d",
				$now,
				$now + self::PERIOD_DAYS * DAY_IN_SECONDS
			)
		);

		$ended_product_ids = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT product_id FROM `{$course_table}` WHERE product_id > 0 AND enddate > 0 AND enddate < %d LIMIT 200",
				$now
			)
		);

		$categories = (int) $wpdb->get_var( "SELECT COUNT(*) FROM `{$category_table}`" );
		// phpcs:enable

		// A product's status is post data; at most 200 lookups, cached by WordPress after the first.
		$ended_on_sale = count(
			array_filter(
				$ended_product_ids,
				function ( $product_id ) {
					return 'publish' === get_post_status( (int) $product_id );
				}
			)
		);

		$total        = (int) ( $totals['total'] ?? 0 );
		$with_product = (int) ( $totals['with_product'] ?? 0 );

		return array(
			'total'           => $total,
			'with_product'    => $with_product,
			'without_product' => max( 0, $total - $with_product ),
			'not_selling'     => $not_selling,
			'ending_soon'     => $ending_soon,
			'ended_on_sale'   => $ended_on_sale,
			'categories'      => $categories,
		);
	}

	/**
	 * Enrollment totals by status, and new enrollments and unenrollments in this period and the one before it.
	 *
	 * @param string $period_start Start of this period (UTC, MySQL format).
	 * @param string $prior_start  Start of the period before it (UTC, MySQL format).
	 * @return array
	 */
	private function get_enrollment_counts( $period_start, $prior_start ) {
		global $wpdb;

		$enrollment_table = $wpdb->prefix . Util::TABLES['enrollment'];

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery -- table name comes from Util::TABLES; values are prepared.
		$by_status = $wpdb->get_results( "SELECT status, COUNT(*) AS total FROM `{$enrollment_table}` GROUP BY status", ARRAY_A );

		$periods = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT
					SUM( enrollment_date >= %s ) AS new_current,
					SUM( enrollment_date >= %s AND enrollment_date < %s ) AS new_previous,
					SUM( unenrollment_date >= %s ) AS unenrolled_current,
					SUM( unenrollment_date >= %s AND unenrollment_date < %s ) AS unenrolled_previous
				FROM `{$enrollment_table}`
				WHERE enrollment_date >= %s OR unenrollment_date >= %s",
				$period_start,
				$prior_start,
				$period_start,
				$period_start,
				$prior_start,
				$period_start,
				$prior_start,
				$prior_start
			),
			ARRAY_A
		);
		// phpcs:enable

		$status_totals = array(
			'enrolled'   => 0,
			'unenrolled' => 0,
			'expired'    => 0,
		);

		foreach ( (array) $by_status as $status_row ) {
			$status_totals[ sanitize_key( $status_row['status'] ) ] = (int) $status_row['total'];
		}

		return array(
			'total'      => array_sum( $status_totals ),
			'by_status'  => $status_totals,
			'new'        => array(
				'current'  => (int) ( $periods['new_current'] ?? 0 ),
				'previous' => (int) ( $periods['new_previous'] ?? 0 ),
			),
			'unenrolled' => array(
				'current'  => (int) ( $periods['unenrolled_current'] ?? 0 ),
				'previous' => (int) ( $periods['unenrolled_previous'] ?? 0 ),
			),
		);
	}

	/**
	 * New enrollments per day for the period, oldest first, with a zero for every day that had none.
	 *
	 * @param int $now Current Unix time.
	 * @return array[] Each `{ date: 'Y-m-d', count: int }`.
	 */
	private function get_daily_enrollments( $now ) {
		global $wpdb;

		$enrollment_table = $wpdb->prefix . Util::TABLES['enrollment'];
		$offset_seconds   = (int) round( (float) get_option( 'gmt_offset', 0 ) * HOUR_IN_SECONDS );
		$site_today       = strtotime( gmdate( 'Y-m-d', $now + $offset_seconds ) );
		$first_day        = $site_today - ( self::PERIOD_DAYS - 1 ) * DAY_IN_SECONDS;

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery -- table name comes from Util::TABLES; values are prepared.
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT DATE( DATE_ADD( enrollment_date, INTERVAL %d SECOND ) ) AS day, COUNT(*) AS total
				FROM `{$enrollment_table}`
				WHERE enrollment_date >= %s
				GROUP BY day",
				$offset_seconds,
				gmdate( 'Y-m-d H:i:s', $first_day - $offset_seconds )
			),
			ARRAY_A
		);
		// phpcs:enable

		$count_by_day = array();

		foreach ( (array) $rows as $day_row ) {
			$count_by_day[ $day_row['day'] ] = (int) $day_row['total'];
		}

		$daily = array();

		for ( $day = 0; $day < self::PERIOD_DAYS; $day++ ) {
			$date    = gmdate( 'Y-m-d', $first_day + $day * DAY_IN_SECONDS );
			$daily[] = array(
				'date'  => $date,
				'count' => $count_by_day[ $date ] ?? 0,
			);
		}

		return $daily;
	}

	/**
	 * The five courses with the most new enrollments this period.
	 *
	 * @param string $period_start Start of this period (UTC, MySQL format).
	 * @return array[]
	 */
	private function get_top_courses( $period_start ) {
		global $wpdb;

		$course_table     = $wpdb->prefix . Util::TABLES['course'];
		$enrollment_table = $wpdb->prefix . Util::TABLES['enrollment'];

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery -- table names come from Util::TABLES; values are prepared.
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT enrollment.course_id, course.fullname, course.product_id, COUNT(*) AS total
				FROM `{$enrollment_table}` AS enrollment
				LEFT JOIN `{$course_table}` AS course ON course.id = enrollment.course_id
				WHERE enrollment.enrollment_date >= %s
				GROUP BY enrollment.course_id, course.fullname, course.product_id
				ORDER BY total DESC
				LIMIT 5",
				$period_start
			),
			ARRAY_A
		);
		// phpcs:enable

		return array_map(
			function ( $course_row ) {
				$product_id = (int) $course_row['product_id'];

				return array(
					'course_id'   => (int) $course_row['course_id'],
					'name'        => $course_row['fullname'] ? wp_strip_all_tags( $course_row['fullname'] ) : '',
					'enrollments' => (int) $course_row['total'],
					'product_url' => $product_id ? (string) get_edit_post_link( $product_id, 'raw' ) : '',
				);
			},
			(array) $rows
		);
	}

	/**
	 * The five latest enrollments, newest first.
	 *
	 * @return array[]
	 */
	private function get_recent_enrollments() {
		global $wpdb;

		$course_table     = $wpdb->prefix . Util::TABLES['course'];
		$enrollment_table = $wpdb->prefix . Util::TABLES['enrollment'];

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery -- table names come from Util::TABLES; nothing user-supplied.
		$rows = $wpdb->get_results(
			"SELECT enrollment.user_id, enrollment.user_email, enrollment.status, enrollment.enrollment_date, course.fullname
			FROM `{$enrollment_table}` AS enrollment
			LEFT JOIN `{$course_table}` AS course ON course.id = enrollment.course_id
			WHERE enrollment.enrollment_date IS NOT NULL
			ORDER BY enrollment.enrollment_date DESC
			LIMIT 5",
			ARRAY_A
		);
		// phpcs:enable

		return array_map(
			function ( $enrollment_row ) {
				$user = $enrollment_row['user_id'] ? get_userdata( (int) $enrollment_row['user_id'] ) : false;

				return array(
					'student' => $user ? $user->display_name : sanitize_email( $enrollment_row['user_email'] ),
					'course'  => $enrollment_row['fullname'] ? wp_strip_all_tags( $enrollment_row['fullname'] ) : '',
					'status'  => sanitize_key( $enrollment_row['status'] ),
					// Sent as UTC ISO 8601; the browser shows it in the viewer's locale.
					'date'    => gmdate( 'c', strtotime( $enrollment_row['enrollment_date'] . ' UTC' ) ),
				);
			},
			(array) $rows
		);
	}
}
