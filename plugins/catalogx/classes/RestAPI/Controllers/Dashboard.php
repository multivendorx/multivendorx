<?php
/**
 * CatalogX REST API Dashboard controller.
 *
 * @package CatalogX
 */

namespace CatalogX\RestAPI\Controllers;

use CatalogX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * REST API controller for the admin dashboard: which features are on, enquiry and quote figures for the chosen period
 * (7, 30 or 90 days, against the period before it), the most requested products, the latest requests, and the counts
 * the dashboard turns into "needs your attention" items.
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
	 * Quote order statuses (registered by the Quote module), without the `wc-` prefix.
	 */
	const QUOTE_STATUSES = array( 'quote-new', 'quote-pending', 'quote-accepted', 'quote-rejected', 'quote-expired' );

	/**
	 * At most this many enquiries, and this many quotes, are read for the period's per-day and per-product figures.
	 */
	const PERIOD_ROWS_LIMIT = 1000;

	/**
	 * How many products the "most requested" list shows, and how many requests the "latest" list shows.
	 */
	const LIST_SIZE = 5;

	/**
	 * Register the routes for the objects of the controller.
	 */
	public function register_routes() {
		register_rest_route(
			CatalogX()->rest_namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'catalogx_permissions_check' ),
					'args'                => array(
						'days' => array(
							'description' => __( 'Length of the reporting period, in days.', 'catalogx' ),
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
	 * Check request permissions: the same capability the CatalogX admin menu asks for.
	 *
	 * @param \WP_REST_Request $request REST request object.
	 * @return bool
	 */
	public function catalogx_permissions_check( $request ) {
		return Utill::current_user_has_capability( 'manage_woocommerce' );
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
		$nonce_check = Utill::validate_nonce( $request );

		if ( is_wp_error( $nonce_check ) ) {
			return $nonce_check;
		}

		try {
			$period_days = in_array( (int) $request->get_param( 'days' ), self::PERIOD_CHOICES, true ) ? (int) $request->get_param( 'days' ) : self::PERIOD_DAYS;
			$now         = time();
			$quote_on    = CatalogX()->modules->is_active( 'quote' );
			$period      = $this->get_period_bounds( $now, $period_days );
			$enquiries   = $this->get_period_enquiries( $period['prior_start_utc'] );
			$quotes      = $quote_on ? $this->get_period_quotes( $period['prior_start'] ) : array();

			$dashboard_data = array(
				'period_days'    => $period_days,
				'period_choices' => self::PERIOD_CHOICES,
				'currency'       => get_woocommerce_currency(),
				'is_pro'         => Utill::is_khali_dabba(),
				'features'       => $this->get_feature_state(),
				'enquiries'      => $this->get_enquiry_counts( $enquiries, $period ),
				'quotes'         => $this->get_quote_counts( $quotes, $period, $quote_on ),
				'daily'          => $this->get_daily( $enquiries, $quotes, $period, $period_days ),
				'top_products'   => $this->get_top_products( $enquiries, $quotes, $period['start'] ),
				'recent'         => $this->get_recent_requests( $quote_on ),
				'links'          => array(
					'quotes' => $this->get_orders_url( 'wc-quote-new' ),
				),
			);

			/**
			 * Filters the admin dashboard data, e.g. for CatalogX Pro to add wholesale figures.
			 *
			 * @param array            $dashboard_data The dashboard response.
			 * @param \WP_REST_Request $request        The request.
			 */
			return rest_ensure_response( apply_filters( 'catalogx_dashboard_data', $dashboard_data, $request ) );
		} catch ( \Exception $exception ) {
			Utill::log( $exception->getMessage(), 'ERROR' );

			return new \WP_Error(
				'catalogx_dashboard_failed',
				esc_html__( 'Could not load the dashboard.', 'catalogx' ),
				array( 'status' => 500 )
			);
		}
	}

	/**
	 * Start of this period and the one before it, as Unix times, UTC MySQL datetimes, and the first day of the chart
	 * in the site's time zone.
	 *
	 * @param int $now         Current Unix time.
	 * @param int $period_days Length of the reporting period, in days.
	 * @return array
	 */
	private function get_period_bounds( $now, $period_days ) {
		$offset_seconds = (int) round( (float) get_option( 'gmt_offset', 0 ) * HOUR_IN_SECONDS );
		$start          = $now - $period_days * DAY_IN_SECONDS;
		$prior_start    = $now - 2 * $period_days * DAY_IN_SECONDS;
		$site_today     = strtotime( gmdate( 'Y-m-d', $now + $offset_seconds ) );

		return array(
			'now'             => $now,
			'start'           => $start,
			'prior_start'     => $prior_start,
			'start_utc'       => gmdate( 'Y-m-d H:i:s', $start ),
			'prior_start_utc' => gmdate( 'Y-m-d H:i:s', $prior_start ),
			'offset'          => $offset_seconds,
			'first_day'       => $site_today - ( $period_days - 1 ) * DAY_IN_SECONDS,
		);
	}

	/**
	 * Which CatalogX features are on: the modules, whether Pro is active, and whether the request-a-quote page exists.
	 *
	 * @return array
	 */
	private function get_feature_state() {
		$quote_page_id = (int) get_option( 'catalogx_request_quote_page', 0 );

		return array(
			'modules'    => array_values( (array) CatalogX()->modules->get_active_modules() ),
			'quote_page' => $quote_page_id > 0 && 'publish' === get_post_status( $quote_page_id ),
		);
	}

	/**
	 * The enquiries of this period and the one before it, newest first: id, user, date (Unix, UTC) and products.
	 *
	 * @param string $since Start of the previous period (UTC, MySQL format).
	 * @return array[]
	 */
	private function get_period_enquiries( $since ) {
		global $wpdb;

		$enquiry_table = $wpdb->prefix . Utill::TABLES['enquiry'];

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery -- table name comes from Utill::TABLES; values are prepared.
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT id, user_id, product_info, date FROM `{$enquiry_table}` WHERE date >= %s ORDER BY date DESC LIMIT %d",
				$since,
				self::PERIOD_ROWS_LIMIT
			),
			ARRAY_A
		);
		// phpcs:enable

		return array_map(
			function ( $enquiry_row ) {
				return array(
					'id'       => (int) $enquiry_row['id'],
					'user_id'  => (int) $enquiry_row['user_id'],
					'time'     => strtotime( $enquiry_row['date'] . ' UTC' ),
					'products' => self::parse_product_info( $enquiry_row['product_info'] ),
				);
			},
			(array) $rows
		);
	}

	/**
	 * The quote requests created in this period and the one before it: date, status, total and products.
	 *
	 * @param int $since Start of the previous period (Unix time).
	 * @return array[]
	 */
	private function get_period_quotes( $since ) {
		$orders = wc_get_orders(
			array(
				'status'       => self::QUOTE_STATUSES,
				'date_created' => '>=' . $since,
				'limit'        => self::PERIOD_ROWS_LIMIT,
				'orderby'      => 'date',
				'order'        => 'DESC',
			)
		);

		$quotes = array();

		foreach ( (array) $orders as $order ) {
			if ( ! $order instanceof \WC_Order ) {
				continue;
			}

			$products = array();

			foreach ( $order->get_items() as $item ) {
				$product_id = (int) $item->get_product_id();

				if ( $product_id ) {
					$products[ $product_id ] = ( $products[ $product_id ] ?? 0 ) + (int) $item->get_quantity();
				}
			}

			$created  = $order->get_date_created();
			$quotes[] = array(
				'time'     => $created ? $created->getTimestamp() : 0,
				'status'   => $order->get_status(),
				'total'    => (float) $order->get_total(),
				'products' => $products,
			);
		}

		return $quotes;
	}

	/**
	 * Enquiry figures: all-time total, new in this period and the one before it, and (with Pro, whose inbox is where
	 * replies are written) how many still have no reply.
	 *
	 * @param array[] $enquiries Enquiries of both periods (get_period_enquiries()).
	 * @param array   $period    Period bounds (get_period_bounds()).
	 * @return array
	 */
	private function get_enquiry_counts( $enquiries, $period ) {
		global $wpdb;

		$enquiry_table = $wpdb->prefix . Utill::TABLES['enquiry'];
		$message_table = $wpdb->prefix . Utill::TABLES['message'];

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery -- table names come from Utill::TABLES; nothing user-supplied.
		$total = (int) $wpdb->get_var( "SELECT COUNT(*) FROM `{$enquiry_table}`" );

		$unanswered = null;

		if ( Utill::is_khali_dabba() ) {
			// An enquiry is answered once someone other than the person who sent it has written in its thread.
			$unanswered = (int) $wpdb->get_var(
				"SELECT COUNT(*) FROM `{$enquiry_table}` AS enquiry
				WHERE NOT EXISTS (
					SELECT 1 FROM `{$message_table}` AS message
					WHERE message.enquiry_id = enquiry.id AND message.from_user_id <> enquiry.user_id
				)"
			);
		}
		// phpcs:enable

		return array(
			'total'      => $total,
			'new'        => $this->split_by_period( wp_list_pluck( $enquiries, 'time' ), $period ),
			'unanswered' => $unanswered,
		);
	}

	/**
	 * Quote figures: all-time count per status, new requests in this period and the one before it, their value, and
	 * how many of this period's requests were accepted.
	 *
	 * @param array[] $quotes   Quotes of both periods (get_period_quotes()).
	 * @param array   $period   Period bounds (get_period_bounds()).
	 * @param bool    $quote_on Whether the Quote module is on.
	 * @return array
	 */
	private function get_quote_counts( $quotes, $period, $quote_on ) {
		$by_status = array_fill_keys( self::QUOTE_STATUSES, 0 );

		if ( $quote_on ) {
			foreach ( self::QUOTE_STATUSES as $status ) {
				$result = wc_get_orders(
					array(
						'status'   => $status,
						'limit'    => 1,
						'return'   => 'ids',
						'paginate' => true,
					)
				);

				$by_status[ $status ] = (int) ( $result->total ?? 0 );
			}
		}

		$value    = array(
			'current'  => 0.0,
			'previous' => 0.0,
		);
		$accepted = 0;

		foreach ( $quotes as $quote ) {
			$is_current = $quote['time'] >= $period['start'];

			$value[ $is_current ? 'current' : 'previous' ] += $quote['total'];

			if ( $is_current && 'quote-accepted' === $quote['status'] ) {
				++$accepted;
			}
		}

		return array(
			'enabled'   => $quote_on,
			'total'     => array_sum( $by_status ),
			'by_status' => $by_status,
			'new'       => $this->split_by_period( wp_list_pluck( $quotes, 'time' ), $period ),
			'value'     => array(
				'current'  => round( $value['current'], 2 ),
				'previous' => round( $value['previous'], 2 ),
			),
			'accepted'  => $accepted,
			'limited'   => count( $quotes ) >= self::PERIOD_ROWS_LIMIT,
		);
	}

	/**
	 * How many of the given times fall in this period, and how many in the one before it.
	 *
	 * @param int[] $times  Unix times.
	 * @param array $period Period bounds (get_period_bounds()).
	 * @return array `{ current: int, previous: int }`.
	 */
	private function split_by_period( $times, $period ) {
		$current = 0;

		foreach ( $times as $time ) {
			if ( $time >= $period['start'] ) {
				++$current;
			}
		}

		return array(
			'current'  => $current,
			'previous' => count( $times ) - $current,
		);
	}

	/**
	 * New enquiries and quote requests per day for the period, oldest first, with zeros for every day that had none.
	 *
	 * @param array[] $enquiries   Enquiries of both periods.
	 * @param array[] $quotes      Quotes of both periods.
	 * @param array   $period      Period bounds (get_period_bounds()).
	 * @param int     $period_days Length of the reporting period, in days.
	 * @return array[] Each `{ date: 'Y-m-d', enquiries: int, quotes: int }`.
	 */
	private function get_daily( $enquiries, $quotes, $period, $period_days ) {
		$days = array();

		for ( $day = 0; $day < $period_days; $day++ ) {
			$days[ gmdate( 'Y-m-d', $period['first_day'] + $day * DAY_IN_SECONDS ) ] = array(
				'enquiries' => 0,
				'quotes'    => 0,
			);
		}

		$tally = function ( $rows, $key ) use ( &$days, $period ) {
			foreach ( $rows as $row ) {
				$date = gmdate( 'Y-m-d', $row['time'] + $period['offset'] );

				if ( isset( $days[ $date ] ) ) {
					++$days[ $date ][ $key ];
				}
			}
		};

		$tally( $enquiries, 'enquiries' );
		$tally( $quotes, 'quotes' );

		$daily = array();

		foreach ( $days as $date => $counts ) {
			$daily[] = array_merge( array( 'date' => $date ), $counts );
		}

		return $daily;
	}

	/**
	 * The products asked about most this period: how many enquiries and quote requests named each one.
	 *
	 * @param array[] $enquiries    Enquiries of both periods.
	 * @param array[] $quotes       Quotes of both periods.
	 * @param int     $period_start Start of this period (Unix time).
	 * @return array[]
	 */
	private function get_top_products( $enquiries, $quotes, $period_start ) {
		$counts = array();

		foreach ( array(
			'enquiries' => $enquiries,
			'quotes'    => $quotes,
		) as $key => $rows ) {
			foreach ( $rows as $row ) {
				if ( $row['time'] < $period_start ) {
					continue;
				}

				foreach ( array_keys( $row['products'] ) as $product_id ) {
					if ( ! isset( $counts[ $product_id ] ) ) {
						$counts[ $product_id ] = array(
							'enquiries' => 0,
							'quotes'    => 0,
						);
					}

					++$counts[ $product_id ][ $key ];
				}
			}
		}

		uasort(
			$counts,
			function ( $a, $b ) {
				return ( $b['enquiries'] + $b['quotes'] ) <=> ( $a['enquiries'] + $a['quotes'] );
			}
		);

		$top = array();

		foreach ( array_slice( $counts, 0, self::LIST_SIZE, true ) as $product_id => $product_counts ) {
			$product = wc_get_product( $product_id );
			$top[]   = array(
				'product_id' => (int) $product_id,
				'name'       => $product ? wp_strip_all_tags( $product->get_name() ) : '',
				'enquiries'  => $product_counts['enquiries'],
				'quotes'     => $product_counts['quotes'],
				'edit_url'   => $product ? (string) get_edit_post_link( $product_id, 'raw' ) : '',
			);
		}

		return $top;
	}

	/**
	 * The latest enquiries and quote requests together, newest first. Enquiries are always listed (they stay in their
	 * table when the Enquiry module is switched off); quotes only while the Quote module is on.
	 *
	 * @param bool $with_quotes Whether to include quote requests.
	 * @return array[]
	 */
	private function get_recent_requests( $with_quotes ) {
		global $wpdb;

		$recent        = array();
		$enquiry_table = $wpdb->prefix . Utill::TABLES['enquiry'];

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery -- table name comes from Utill::TABLES; values are prepared.
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT user_name, user_email, product_info, date FROM `{$enquiry_table}` ORDER BY date DESC LIMIT %d",
				self::LIST_SIZE
			),
			ARRAY_A
		);
		// phpcs:enable

		foreach ( (array) $rows as $enquiry_row ) {
			$recent[] = array(
				'type'     => 'enquiry',
				'customer' => '' !== trim( (string) $enquiry_row['user_name'] ) ? sanitize_text_field( $enquiry_row['user_name'] ) : sanitize_email( $enquiry_row['user_email'] ),
				'item'     => $this->describe_products( self::parse_product_info( $enquiry_row['product_info'] ) ),
				'status'   => 'enquiry',
				'time'     => strtotime( $enquiry_row['date'] . ' UTC' ),
			);
		}

		if ( $with_quotes ) {
			$orders = wc_get_orders(
				array(
					'status'  => self::QUOTE_STATUSES,
					'limit'   => self::LIST_SIZE,
					'orderby' => 'date',
					'order'   => 'DESC',
				)
			);

			foreach ( (array) $orders as $order ) {
				if ( ! $order instanceof \WC_Order ) {
					continue;
				}

				$products = array();

				foreach ( $order->get_items() as $item ) {
					$products[ (int) $item->get_product_id() ] = (int) $item->get_quantity();
				}

				$created  = $order->get_date_created();
				$name     = trim( $order->get_formatted_billing_full_name() );
				$recent[] = array(
					'type'     => 'quote',
					'customer' => '' !== $name ? $name : sanitize_email( $order->get_billing_email() ),
					'item'     => $this->describe_products( $products ),
					'status'   => $order->get_status(),
					'time'     => $created ? $created->getTimestamp() : 0,
				);
			}
		}

		usort(
			$recent,
			function ( $a, $b ) {
				return $b['time'] <=> $a['time'];
			}
		);

		return array_map(
			function ( $request ) {
				// Sent as UTC ISO 8601; the browser shows it in the viewer's locale.
				$request['date'] = gmdate( 'c', $request['time'] );
				unset( $request['time'] );

				return $request;
			},
			array_slice( $recent, 0, self::LIST_SIZE )
		);
	}

	/**
	 * "Oak desk" or "Oak desk + 2 more", for a request's products.
	 *
	 * @param array $products Product id => quantity.
	 * @return string Empty when no product can be found.
	 */
	private function describe_products( $products ) {
		$product_ids = array_filter( array_map( 'intval', array_keys( (array) $products ) ) );
		$first       = $product_ids ? wc_get_product( reset( $product_ids ) ) : null;

		if ( ! $first ) {
			return '';
		}

		$name = wp_strip_all_tags( $first->get_name() );

		return count( $product_ids ) > 1
			? sprintf(
				/* translators: 1: product name, 2: number of other products. */
				__( '%1$s + %2$d more', 'catalogx' ),
				$name,
				count( $product_ids ) - 1
			)
			: $name;
	}

	/**
	 * The products of an enquiry, as stored by the Enquiry module: a serialized `product id => quantity` array.
	 *
	 * @param string $product_info The stored value.
	 * @return array Product id => quantity; empty when the value can't be read.
	 */
	private static function parse_product_info( $product_info ) {
		if ( ! is_string( $product_info ) || ! is_serialized( $product_info ) ) {
			return array();
		}

		// Plain data only: no objects are rebuilt from the stored value.
		// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.serialize_unserialize -- the Enquiry module stores it with serialize().
		$products = unserialize( $product_info, array( 'allowed_classes' => false ) );

		if ( ! is_array( $products ) ) {
			return array();
		}

		$parsed = array();

		foreach ( $products as $product_id => $quantity ) {
			if ( absint( $product_id ) ) {
				$parsed[ absint( $product_id ) ] = is_numeric( $quantity ) ? (int) $quantity : 1;
			}
		}

		return $parsed;
	}

	/**
	 * The WooCommerce orders screen filtered to one status, under either order storage.
	 *
	 * @param string $status Order status, with the `wc-` prefix.
	 * @return string Admin URL.
	 */
	private function get_orders_url( $status ) {
		$uses_order_tables = class_exists( '\Automattic\WooCommerce\Utilities\OrderUtil' )
			&& \Automattic\WooCommerce\Utilities\OrderUtil::custom_orders_table_usage_is_enabled();

		return $uses_order_tables
			? admin_url( 'admin.php?page=wc-orders&status=' . rawurlencode( $status ) )
			: admin_url( 'edit.php?post_type=shop_order&post_status=' . rawurlencode( $status ) );
	}
}
