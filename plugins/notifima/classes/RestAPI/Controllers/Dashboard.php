<?php
/**
 * Notifima REST API Dashboard controller.
 *
 * @package Notifima
 */

namespace Notifima\RestAPI\Controllers;

use Notifima\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * REST API controller for the admin dashboard: subscription figures for the chosen period (7, 30 or 90 days, against
 * the period before it), the demand waiting on out-of-stock products, the state of the back-in-stock email, and the
 * counts the dashboard turns into "needs your attention" items.
 *
 * Subscriber rows only record when they were created (`create_time`), not when their status changed, so "emails sent"
 * and "failed" are all-time totals; only new subscriptions are compared period on period.
 */
class Dashboard extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'dashboard';

	/**
	 * Default length of the reporting period, in days. The period before it, of the same length, is the comparison.
	 */
	const PERIOD_DAYS = 30;

	/**
	 * The periods the dashboard's range switch offers.
	 */
	const PERIOD_CHOICES = array( 7, 30, 90 );

	/**
	 * At most this many waited-for products are loaded to work out demand and restocked-but-waiting products.
	 */
	const WAITLIST_PRODUCTS_LIMIT = 200;

	/**
	 * How many products the "Most wanted" table lists.
	 */
	const TOP_PRODUCTS = 5;

	/**
	 * How many subscriptions the "Latest subscribers" card lists.
	 */
	const RECENT_SUBSCRIBERS = 5;

	/**
	 * ID of the back-in-stock email (Emails/ProductBackInStockEmail.php).
	 */
	const BACK_IN_STOCK_EMAIL_ID = 'notifima_product_back_stock';

	/**
	 * Register the routes for the objects of the controller.
	 */
	public function register_routes() {
		register_rest_route(
			Notifima()->rest_namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
					'args'                => array(
						'days' => array(
							'description' => __( 'Length of the reporting period, in days.', 'notifima' ),
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
	 * Check request permissions.
	 *
	 * @param \WP_REST_Request $request REST request object.
	 * @return bool
	 */
	public function get_items_permissions_check( $request ) {
		return Utill::current_user_has_capability( 'manage_options' );
	}

	/**
	 * Everything the dashboard shows, in one response.
	 *
	 * Days are grouped by the site's time zone (its current UTC offset), so "today" on the chart is the site's today.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_items( $request ) {
		$nonce_check = Utill::validate_nonce( $request );

		if ( is_wp_error( $nonce_check ) ) {
			return $nonce_check;
		}

		try {
			$period_days  = in_array( (int) $request->get_param( 'days' ), self::PERIOD_CHOICES, true ) ? (int) $request->get_param( 'days' ) : self::PERIOD_DAYS;
			$now          = time();
			$period_start = $now - $period_days * DAY_IN_SECONDS;
			$prior_start  = $now - 2 * $period_days * DAY_IN_SECONDS;
			$waitlist     = $this->get_waitlist( self::WAITLIST_PRODUCTS_LIMIT );

			$dashboard_data = array(
				'period_days'    => $period_days,
				'period_choices' => self::PERIOD_CHOICES,
				'currency'       => get_woocommerce_currency(),
				'setup'          => $this->get_setup_state(),
				'subscriptions'  => $this->get_subscription_counts( $period_start, $prior_start ),
				'products'       => $this->get_product_counts( $waitlist ),
				'daily'          => $this->get_daily_subscriptions( $now, $period_days ),
				'top_products'   => $this->get_top_products( $waitlist, $period_start ),
				'recent'         => $this->get_recent_subscriptions(),
			);

			/**
			 * Filters the admin dashboard data, e.g. for Notifima Pro to add figures of its own.
			 *
			 * @param array            $dashboard_data The dashboard response.
			 * @param \WP_REST_Request $request        The request.
			 */
			return rest_ensure_response( apply_filters( 'notifima_dashboard_data', $dashboard_data, $request ) );
		} catch ( \Exception $exception ) {
			Utill::log( $exception->getMessage() );

			return new \WP_Error(
				'notifima_dashboard_failed',
				esc_html__( 'Could not load the dashboard.', 'notifima' ),
				array( 'status' => 500 )
			);
		}
	}

	/**
	 * What the setup checklist needs beyond the counts: whether the back-in-stock email is on (and where to change it),
	 * and whether the subscription form has been customized.
	 *
	 * @return array
	 */
	private function get_setup_state() {
		$email_enabled = false;
		$email_url     = admin_url( 'admin.php?page=wc-settings&tab=email' );

		if ( function_exists( 'WC' ) && WC()->mailer() ) {
			foreach ( WC()->mailer()->get_emails() as $email ) {
				if ( self::BACK_IN_STOCK_EMAIL_ID === $email->id ) {
					$email_enabled = $email->is_enabled();
					$email_url     = add_query_arg( 'section', strtolower( get_class( $email ) ), $email_url );
					break;
				}
			}
		}

		return array(
			'email_enabled'   => (bool) $email_enabled,
			'email_url'       => esc_url_raw( $email_url ),
			'form_customized' => ! empty( get_option( Utill::NOTIFIMA_SETTINGS['subscription-form-designer'] ) ),
			'products_url'    => esc_url_raw( admin_url( 'edit.php?post_type=product&stock_status=outofstock' ) ),
		);
	}

	/**
	 * Subscriptions: how many there are in each status, and how many were created this period and the one before.
	 *
	 * @param int $period_start Unix time the reporting period starts.
	 * @param int $prior_start  Unix time the comparison period starts.
	 * @return array
	 */
	private function get_subscription_counts( $period_start, $prior_start ) {
		global $wpdb;

		$table = $wpdb->prefix . Utill::TABLES['subscribers'];

		// phpcs:disable WordPress.DB.DirectDatabaseQuery -- custom table, read-only figures for one admin request.
		$status_rows = $wpdb->get_results(
			$wpdb->prepare( 'SELECT status, COUNT(*) AS total FROM %i GROUP BY status', $table ),
			ARRAY_A
		);

		$new_counts = $wpdb->get_row(
			$wpdb->prepare(
				'SELECT
					SUM( UNIX_TIMESTAMP( create_time ) >= %d ) AS current_period,
					SUM( UNIX_TIMESTAMP( create_time ) >= %d AND UNIX_TIMESTAMP( create_time ) < %d ) AS previous_period
				FROM %i
				WHERE UNIX_TIMESTAMP( create_time ) >= %d',
				$period_start,
				$prior_start,
				$period_start,
				$table,
				$prior_start
			),
			ARRAY_A
		);
		// phpcs:enable WordPress.DB.DirectDatabaseQuery

		$by_status = array(
			'subscribed'          => 0,
			'unsubscribed'        => 0,
			'notification_sent'   => 0,
			'notification_failed' => 0,
		);

		foreach ( (array) $status_rows as $status_row ) {
			$by_status[ sanitize_key( $status_row['status'] ) ] = (int) $status_row['total'];
		}

		return array(
			'total'     => array_sum( $by_status ),
			'by_status' => $by_status,
			'new'       => array(
				'current'  => (int) ( $new_counts['current_period'] ?? 0 ),
				'previous' => (int) ( $new_counts['previous_period'] ?? 0 ),
			),
		);
	}

	/**
	 * The products shoppers are waiting for (status `subscribed`), most waited-for first, with each product loaded once.
	 *
	 * @param int $limit At most this many products.
	 * @return array[] Each `{ product_id: int, waiting: int, product: \WC_Product|null }`.
	 */
	private function get_waitlist( $limit ) {
		global $wpdb;

		$table = $wpdb->prefix . Utill::TABLES['subscribers'];

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery -- custom table, read-only figures for one admin request.
		$waitlist_rows = $wpdb->get_results(
			$wpdb->prepare(
				'SELECT product_id, COUNT(*) AS waiting FROM %i WHERE status = %s GROUP BY product_id ORDER BY waiting DESC LIMIT %d',
				$table,
				'subscribed',
				$limit
			),
			ARRAY_A
		);

		if ( empty( $waitlist_rows ) ) {
			return array();
		}

		$products = $this->get_products_by_id( wp_list_pluck( $waitlist_rows, 'product_id' ) );

		return array_map(
			function ( $waitlist_row ) use ( $products ) {
				$product_id = absint( $waitlist_row['product_id'] );

				return array(
					'product_id' => $product_id,
					'waiting'    => (int) $waitlist_row['waiting'],
					'product'    => $products[ $product_id ] ?? null,
				);
			},
			$waitlist_rows
		);
	}

	/**
	 * Waited-for products: how many, how many of them are out of stock, the value of the demand on those (price × the
	 * shoppers waiting), and the ones back in stock whose waiting shoppers were never told.
	 *
	 * @param array[] $waitlist From get_waitlist().
	 * @return array
	 */
	private function get_product_counts( $waitlist ) {
		$out_of_stock      = 0;
		$demand_value      = 0.0;
		$restocked         = 0;
		$restocked_waiting = 0;

		foreach ( $waitlist as $entry ) {
			$product = $entry['product'];

			if ( ! $product ) {
				continue;
			}

			if ( $product->is_in_stock() && 'onbackorder' !== $product->get_stock_status() ) {
				// In stock with shoppers still marked waiting: the back-in-stock email didn't go out (stock set
				// directly in the database, or the email is off).
				++$restocked;
				$restocked_waiting += $entry['waiting'];
				continue;
			}

			++$out_of_stock;
			$demand_value += (float) $product->get_price() * $entry['waiting'];
		}

		return array(
			'waiting'           => count( $waitlist ),
			'limited'           => count( $waitlist ) >= self::WAITLIST_PRODUCTS_LIMIT,
			'out_of_stock'      => $out_of_stock,
			'demand_value'      => round( $demand_value, 2 ),
			'restocked'         => $restocked,
			'restocked_waiting' => $restocked_waiting,
		);
	}

	/**
	 * New subscriptions per day of the period, oldest first, every day present (zero when there were none).
	 *
	 * @param int $now         Current Unix time.
	 * @param int $period_days Length of the reporting period, in days.
	 * @return array[] Each `{ date: 'Y-m-d', count: int }`.
	 */
	private function get_daily_subscriptions( $now, $period_days ) {
		global $wpdb;

		$table          = $wpdb->prefix . Utill::TABLES['subscribers'];
		$offset_seconds = (int) round( (float) get_option( 'gmt_offset', 0 ) * HOUR_IN_SECONDS );
		$today          = (int) floor( ( $now + $offset_seconds ) / DAY_IN_SECONDS );
		$first_day      = $today - $period_days + 1;

		// UNIX_TIMESTAMP() reads a TIMESTAMP column as true Unix time whatever the MySQL session time zone, so the
		// day number is the site's local day.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery -- custom table, read-only figures for one admin request.
		$day_rows = $wpdb->get_results(
			$wpdb->prepare(
				'SELECT FLOOR( ( UNIX_TIMESTAMP( create_time ) + %d ) / %d ) AS day_number, COUNT(*) AS total
				FROM %i
				WHERE UNIX_TIMESTAMP( create_time ) + %d >= %d
				GROUP BY day_number',
				$offset_seconds,
				DAY_IN_SECONDS,
				$table,
				$offset_seconds,
				$first_day * DAY_IN_SECONDS
			),
			ARRAY_A
		);

		$counts = array();

		foreach ( (array) $day_rows as $day_row ) {
			$counts[ (int) $day_row['day_number'] ] = (int) $day_row['total'];
		}

		$daily = array();

		for ( $day = $first_day; $day <= $today; $day++ ) {
			$daily[] = array(
				'date'  => gmdate( 'Y-m-d', $day * DAY_IN_SECONDS ),
				'count' => $counts[ $day ] ?? 0,
			);
		}

		return $daily;
	}

	/**
	 * The most waited-for products, with stock state, price, new subscriptions this period and an edit link.
	 *
	 * @param array[] $waitlist     From get_waitlist() (already ordered by shoppers waiting).
	 * @param int     $period_start Unix time the reporting period starts.
	 * @return array[]
	 */
	private function get_top_products( $waitlist, $period_start ) {
		global $wpdb;

		$top_entries = array_slice( $waitlist, 0, self::TOP_PRODUCTS );

		if ( empty( $top_entries ) ) {
			return array();
		}

		$table        = $wpdb->prefix . Utill::TABLES['subscribers'];
		$product_ids  = wp_list_pluck( $top_entries, 'product_id' );
		$placeholders = implode( ', ', array_fill( 0, count( $product_ids ), '%d' ) );

		// phpcs:disable WordPress.DB.DirectDatabaseQuery, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare -- custom table; the IN list is one %d placeholder per id.
		$new_rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT product_id, COUNT(*) AS total FROM %i WHERE product_id IN ( {$placeholders} ) AND UNIX_TIMESTAMP( create_time ) >= %d GROUP BY product_id", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				array_merge( array( $table ), $product_ids, array( $period_start ) )
			),
			ARRAY_A
		);
		// phpcs:enable WordPress.DB.DirectDatabaseQuery, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare

		$new_by_product = array_column( (array) $new_rows, 'total', 'product_id' );

		return array_map(
			function ( $entry ) use ( $new_by_product ) {
				$product   = $entry['product'];
				$parent_id = $product ? ( $product->get_parent_id() ? $product->get_parent_id() : $product->get_id() ) : 0;

				return array(
					'product_id'   => $entry['product_id'],
					'name'         => $product ? wp_strip_all_tags( $product->get_name() ) : '',
					'waiting'      => $entry['waiting'],
					'new'          => (int) ( $new_by_product[ $entry['product_id'] ] ?? 0 ),
					'price'        => $product ? (float) $product->get_price() : 0,
					'stock_status' => $product ? $product->get_stock_status() : '',
					'edit_url'     => $parent_id ? esc_url_raw( get_edit_post_link( $parent_id, 'raw' ) ) : '',
				);
			},
			$top_entries
		);
	}

	/**
	 * The latest subscriptions, newest first.
	 *
	 * @return array[] Each `{ email: string, product: string, status: string, date: ISO 8601 }`.
	 */
	private function get_recent_subscriptions() {
		global $wpdb;

		$table = $wpdb->prefix . Utill::TABLES['subscribers'];

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery -- custom table, read-only figures for one admin request.
		$subscriber_rows = $wpdb->get_results(
			$wpdb->prepare(
				'SELECT product_id, email, status, UNIX_TIMESTAMP( create_time ) AS created FROM %i ORDER BY id DESC LIMIT %d',
				$table,
				self::RECENT_SUBSCRIBERS
			),
			ARRAY_A
		);

		$products = $this->get_products_by_id( wp_list_pluck( (array) $subscriber_rows, 'product_id' ) );

		return array_map(
			function ( $subscriber_row ) use ( $products ) {
				$product = $products[ absint( $subscriber_row['product_id'] ) ] ?? null;

				return array(
					'email'   => sanitize_email( $subscriber_row['email'] ),
					'product' => $product ? wp_strip_all_tags( $product->get_name() ) : '',
					'status'  => sanitize_key( $subscriber_row['status'] ),
					'date'    => gmdate( 'c', (int) $subscriber_row['created'] ),
				);
			},
			(array) $subscriber_rows
		);
	}

	/**
	 * Loads products by id in one query, variations included, rather than wc_get_product() per row.
	 *
	 * @param array $product_ids Product or variation ids.
	 * @return \WC_Product[] Keyed by id; ids that no longer exist are missing.
	 */
	private function get_products_by_id( $product_ids ) {
		$product_ids = array_unique( array_filter( array_map( 'absint', (array) $product_ids ) ) );
		$products    = array();

		if ( empty( $product_ids ) ) {
			return $products;
		}

		foreach ( wc_get_products(
			array(
				'include' => $product_ids,
				'type'    => array_merge( array_keys( wc_get_product_types() ), array( 'variation' ) ),
				'status'  => array( 'publish', 'private', 'draft', 'pending' ),
				'limit'   => -1,
			)
		) as $product ) {
			$products[ $product->get_id() ] = $product;
		}

		return $products;
	}
}
