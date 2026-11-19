<?php
/**
 * MultiVendorX REST API admin dashboard controller.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\RestAPI\Controllers;

use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * GET multivendorx/v1/admin-dashboard: everything MultiVendorX → Dashboard shows, in one response. Sales,
 * marketplace earnings, orders and new stores for the chosen period (7, 30 or 90 days) against the period before
 * it, sales per day, the top stores, what is waiting for the admin, the newest stores and which modules are on.
 *
 * Sales, earnings and orders are read from the commissions table the same way Reports reads them
 * (CommissionUtil): sales are the order totals, earnings are sales less what the stores are paid.
 */
class AdminDashboard extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'admin-dashboard';

	/**
	 * Default length of the reporting period, in days. The period before it, of the same length, is the comparison.
	 */
	const PERIOD_DAYS = 30;

	/**
	 * The periods the dashboard's range switch offers.
	 */
	const PERIOD_CHOICES = array( 7, 30, 90 );

	/**
	 * How many stores the "top stores" and "newest stores" lists show.
	 */
	const LIST_SIZE = 5;

	/**
	 * Register the routes for the objects of the controller.
	 */
	public function register_routes() {
		register_rest_route(
			MultiVendorX()->rest_namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
					'args'                => array(
						'days' => array(
							'description' => __( 'Length of the reporting period, in days.', 'multivendorx' ),
							'type'        => 'integer',
							'enum'        => self::PERIOD_CHOICES,
							'default'     => self::PERIOD_DAYS,
						),
					),
				),
			)
		);
	}

	/**
	 * Marketplace-wide figures are for the marketplace admin only, not for store owners.
	 *
	 * @param \WP_REST_Request $request The request.
	 * @return bool
	 */
	public function get_items_permissions_check( $request ) {
		return Utill::current_user_has_capability( array( 'manage_options' ), 'admin-dashboard' );
	}

	/**
	 * Everything the dashboard shows, in one response.
	 *
	 * Days are grouped by the site's time zone (its current UTC offset), so "today" on the chart is the site's today.
	 *
	 * @param \WP_REST_Request $request The request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_items( $request ) {
		try {
			$period_days = in_array( (int) $request->get_param( 'days' ), self::PERIOD_CHOICES, true )
				? (int) $request->get_param( 'days' )
				: self::PERIOD_DAYS;
			$period      = $this->get_period_bounds( time(), $period_days );

			$dashboard_data = array(
				'period_days'    => $period_days,
				'period_choices' => self::PERIOD_CHOICES,
				'currency'       => get_woocommerce_currency(),
				'is_pro'         => (bool) Utill::is_khali_dabba(),
				'modules'        => array_values( (array) MultiVendorX()->modules->get_active_modules() ),
				'totals'         => $this->get_totals(),
				'sales'          => $this->get_sales_figures( $period ),
				'new_stores'     => $this->get_new_store_counts( $period ),
				'daily'          => $this->get_daily_sales( $period, $period_days ),
				'top_stores'     => $this->get_top_stores( $period ),
				'queue'          => $this->get_queue_counts(),
				'newest_stores'  => $this->get_newest_stores(),
			);

			/**
			 * Filters the admin dashboard data, e.g. for a module to add its own figures.
			 *
			 * @since 5.0.23
			 *
			 * @param array            $dashboard_data The dashboard response.
			 * @param \WP_REST_Request $request        The request.
			 */
			return rest_ensure_response( apply_filters( 'multivendorx_admin_dashboard_data', $dashboard_data, $request ) );
		} catch ( \Exception $exception ) {
			MultiVendorX()->util->log( $exception );

			return new \WP_Error(
				'multivendorx_admin_dashboard_failed',
				esc_html__( 'Could not load the dashboard.', 'multivendorx' ),
				array( 'status' => 500 )
			);
		}
	}

	/**
	 * Start of this period and the one before it (UTC MySQL datetimes), the site's UTC offset, and the chart's first
	 * day in the site's time zone.
	 *
	 * @param int $now         Current Unix time.
	 * @param int $period_days Length of the reporting period, in days.
	 * @return array
	 */
	private function get_period_bounds( $now, $period_days ) {
		$offset_seconds = (int) round( (float) get_option( 'gmt_offset', 0 ) * HOUR_IN_SECONDS );
		$site_today     = strtotime( gmdate( 'Y-m-d', $now + $offset_seconds ) );

		return array(
			'start_utc'       => gmdate( 'Y-m-d H:i:s', $now - $period_days * DAY_IN_SECONDS ),
			'prior_start_utc' => gmdate( 'Y-m-d H:i:s', $now - 2 * $period_days * DAY_IN_SECONDS ),
			'offset'          => $offset_seconds,
			'first_day'       => $site_today - ( $period_days - 1 ) * DAY_IN_SECONDS,
		);
	}

	/**
	 * All-time counts, for the setup steps: how many stores there are, and how many orders have commissions.
	 *
	 * @return array{stores: int, active_stores: int, orders: int}
	 */
	private function get_totals() {
		global $wpdb;

		$commission_table = $wpdb->prefix . Utill::TABLES['commission'];

		return array(
			'stores'        => (int) StoreUtil::get_store_information( array( 'count' => true ) ),
			'active_stores' => (int) StoreUtil::get_store_information(
				array(
					'count'  => true,
					'status' => 'active',
				)
			),
			'orders'        => (int) $wpdb->get_var( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
				$wpdb->prepare( 'SELECT COUNT( DISTINCT order_id ) FROM %i', $commission_table )
			),
		);
	}

	/**
	 * Sales, marketplace earnings and orders in this period and the one before it, in one query.
	 *
	 * @param array $period Period bounds (get_period_bounds()).
	 * @return array{sales: array, earnings: array, orders: array}
	 */
	private function get_sales_figures( $period ) {
		global $wpdb;

		$row = $wpdb->get_row( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->prepare(
				'SELECT
					COALESCE( SUM( IF( created_at >= %s, total_order_value, 0 ) ), 0 ) AS sales_current,
					COALESCE( SUM( IF( created_at < %s, total_order_value, 0 ) ), 0 ) AS sales_previous,
					COALESCE( SUM( IF( created_at >= %s, total_order_value - store_payable, 0 ) ), 0 ) AS earnings_current,
					COALESCE( SUM( IF( created_at < %s, total_order_value - store_payable, 0 ) ), 0 ) AS earnings_previous,
					COUNT( DISTINCT IF( created_at >= %s, order_id, NULL ) ) AS orders_current,
					COUNT( DISTINCT IF( created_at < %s, order_id, NULL ) ) AS orders_previous
				FROM %i
				WHERE created_at >= %s',
				$period['start_utc'],
				$period['start_utc'],
				$period['start_utc'],
				$period['start_utc'],
				$period['start_utc'],
				$period['start_utc'],
				$wpdb->prefix . Utill::TABLES['commission'],
				$period['prior_start_utc']
			),
			ARRAY_A
		);

		$pair = static function ( $key, $is_money ) use ( $row ) {
			$cast = static function ( $value ) use ( $is_money ) {
				return $is_money ? round( (float) $value, 2 ) : (int) $value;
			};

			return array(
				'current'  => $cast( $row[ "{$key}_current" ] ?? 0 ),
				'previous' => $cast( $row[ "{$key}_previous" ] ?? 0 ),
			);
		};

		return array(
			'sales'    => $pair( 'sales', true ),
			'earnings' => $pair( 'earnings', true ),
			'orders'   => $pair( 'orders', false ),
		);
	}

	/**
	 * Stores created in this period and the one before it.
	 *
	 * @param array $period Period bounds (get_period_bounds()).
	 * @return array{current: int, previous: int}
	 */
	private function get_new_store_counts( $period ) {
		global $wpdb;

		$row = $wpdb->get_row( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->prepare(
				'SELECT
					COALESCE( SUM( create_time >= %s ), 0 ) AS current_count,
					COALESCE( SUM( create_time < %s ), 0 ) AS previous_count
				FROM %i
				WHERE create_time >= %s',
				$period['start_utc'],
				$period['start_utc'],
				$wpdb->prefix . Utill::TABLES['store'],
				$period['prior_start_utc']
			),
			ARRAY_A
		);

		return array(
			'current'  => (int) ( $row['current_count'] ?? 0 ),
			'previous' => (int) ( $row['previous_count'] ?? 0 ),
		);
	}

	/**
	 * Sales, marketplace earnings, orders and new stores for each day of this period (site time zone), oldest first;
	 * empty days are 0. Earnings are worked out as on the tiles: order value less what the stores are owed.
	 *
	 * @param array $period      Period bounds (get_period_bounds()).
	 * @param int   $period_days Length of the reporting period, in days.
	 * @return array[]
	 */
	private function get_daily_sales( $period, $period_days ) {
		global $wpdb;

		$rows = $wpdb->get_results( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->prepare(
				'SELECT
					DATE( DATE_ADD( created_at, INTERVAL %d SECOND ) ) AS sale_day,
					COALESCE( SUM( total_order_value ), 0 ) AS sales,
					COALESCE( SUM( total_order_value ), 0 ) - COALESCE( SUM( store_payable ), 0 ) AS earnings,
					COUNT( DISTINCT order_id ) AS orders
				FROM %i
				WHERE created_at >= %s
				GROUP BY sale_day',
				$period['offset'],
				$wpdb->prefix . Utill::TABLES['commission'],
				gmdate( 'Y-m-d H:i:s', $period['first_day'] - $period['offset'] )
			),
			ARRAY_A
		);

		$store_rows = $wpdb->get_results( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->prepare(
				'SELECT
					DATE( DATE_ADD( create_time, INTERVAL %d SECOND ) ) AS store_day,
					COUNT( * ) AS stores
				FROM %i
				WHERE create_time >= %s
				GROUP BY store_day',
				$period['offset'],
				$wpdb->prefix . Utill::TABLES['store'],
				gmdate( 'Y-m-d H:i:s', $period['first_day'] - $period['offset'] )
			),
			ARRAY_A
		);

		$by_day        = array_column( (array) $rows, null, 'sale_day' );
		$stores_by_day = array_column( (array) $store_rows, 'stores', 'store_day' );
		$daily         = array();

		for ( $day = 0; $day < $period_days; $day++ ) {
			$date    = gmdate( 'Y-m-d', $period['first_day'] + $day * DAY_IN_SECONDS );
			$daily[] = array(
				'date'   => $date,
				'sales'      => round( (float) ( $by_day[ $date ]['sales'] ?? 0 ), 2 ),
				'earnings'   => round( (float) ( $by_day[ $date ]['earnings'] ?? 0 ), 2 ),
				'orders'     => (int) ( $by_day[ $date ]['orders'] ?? 0 ),
				'new_stores' => (int) ( $stores_by_day[ $date ] ?? 0 ),
			);
		}

		return $daily;
	}

	/**
	 * The stores that sold most in this period.
	 *
	 * @param array $period Period bounds (get_period_bounds()).
	 * @return array[]
	 */
	private function get_top_stores( $period ) {
		global $wpdb;

		$rows = $wpdb->get_results( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->prepare(
				'SELECT c.store_id, s.name,
					COALESCE( SUM( c.total_order_value ), 0 ) AS sales,
					COUNT( DISTINCT c.order_id ) AS orders
				FROM %i c
				LEFT JOIN %i s ON s.ID = c.store_id
				WHERE c.created_at >= %s
				GROUP BY c.store_id, s.name
				ORDER BY sales DESC
				LIMIT %d',
				$wpdb->prefix . Utill::TABLES['commission'],
				$wpdb->prefix . Utill::TABLES['store'],
				$period['start_utc'],
				self::LIST_SIZE
			),
			ARRAY_A
		);

		return array_map(
			static function ( $row ) {
				return array(
					'id'     => (int) $row['store_id'],
					'name'   => (string) ( $row['name'] ?? '' ),
					'sales'  => round( (float) $row['sales'], 2 ),
					'orders' => (int) $row['orders'],
				);
			},
			(array) $rows
		);
	}

	/**
	 * What is waiting for the admin, by kind. Refund requests only count while the Marketplace Refund module is on:
	 * their order status doesn't exist otherwise.
	 *
	 * @return array<string, int>
	 */
	private function get_queue_counts() {
		$queue = StoreUtil::get_approval_queue_counts();

		if ( MultiVendorX()->modules->is_active( 'marketplace-refund' ) ) {
			$refund_query     = wc_get_orders(
				array(
					'status'   => 'refund-requested',
					'limit'    => 1,
					'paginate' => true,
					'return'   => 'ids',
				)
			);
			$queue['refunds'] = (int) ( $refund_query->total ?? 0 );
		}

		return $queue;
	}

	/**
	 * The most recently created stores, newest first.
	 *
	 * @return array[]
	 */
	private function get_newest_stores() {
		global $wpdb;

		$rows = $wpdb->get_results( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->prepare(
				'SELECT ID, name, status, create_time FROM %i ORDER BY create_time DESC, ID DESC LIMIT %d',
				$wpdb->prefix . Utill::TABLES['store'],
				self::LIST_SIZE
			),
			ARRAY_A
		);

		return array_map(
			static function ( $row ) {
				return array(
					'id'     => (int) $row['ID'],
					'name'   => (string) $row['name'],
					'status' => (string) $row['status'],
					// The column is a MySQL timestamp, returned in the database's (UTC) zone.
					'date'   => gmdate( 'c', strtotime( $row['create_time'] . ' UTC' ) ),
				);
			},
			(array) $rows
		);
	}
}
