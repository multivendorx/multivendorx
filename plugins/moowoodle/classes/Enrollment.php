<?php
/**
 * Enrollment class file.
 *
 * @package MooWoodle
 */

namespace MooWoodle;

defined( 'ABSPATH' ) || exit;

use MooWoodle\Util;
/**
 * MooWoodle Enrollment class
 *
 * @class       Enrollment class
 * @version     3.3.0
 * @author      DualCube
 */
class Enrollment {

	/**
     * Enrollment constructor.
     */
	public function __construct() {
		add_action( 'woocommerce_order_status_completed', array( $this, 'process_completed_order' ), 10, 1 );
		add_action( 'woocommerce_thankyou', array( $this, 'render_enrollment_notice' ) );
		add_action( 'woocommerce_after_shop_loop_item_title', array( $this, 'render_course_availability_dates' ) );
		add_action( 'woocommerce_product_meta_start', array( $this, 'render_course_availability_dates' ) );
		add_action( 'woocommerce_cart_updated', array( $this, 'restrict_cart_quantity_on_update' ) );
	}

	/**
	 * Retrieves enrollment records based on the given conditions.
	 *
	 * @param array $enrollment_args Filter conditions.
	 * @return array List of enrollment records.
	 */
	public static function get_enrollments( $enrollment_args ) {
		global $wpdb;

		$table_name = $wpdb->prefix . Util::TABLES['enrollment'];

		// Each filter is an "enabled" flag plus its value; a 0 flag turns its condition into a no-op.
		$list_filters = array();
		foreach ( array( 'id', 'user_id', 'learners_hub_id', 'order_item_id' ) as $list_key ) {
			$list_filters[ $list_key ] = array(
				'enabled' => isset( $enrollment_args[ $list_key ] ) ? 1 : 0,
				'ids'     => array_merge( array( 0 ), array_map( 'intval', (array) ( $enrollment_args[ $list_key ] ?? 0 ) ) ), // 0 keeps IN () valid for an empty list.
			);
		}

		$user_email = sanitize_email( strtolower( trim( (string) ( $enrollment_args['user_email'] ?? '' ) ) ) );
		$status     = sanitize_text_field( (string) ( $enrollment_args['status'] ?? '' ) );
		$by_dates   = ( ! empty( $enrollment_args['start_date'] ) && ! empty( $enrollment_args['end_date'] ) ) ? 1 : 0;

		$integer_values = array();
		foreach ( array( 'course_id', 'order_id', 'cohort_id', 'group_id' ) as $filter_key ) {
			$integer_values[] = isset( $enrollment_args[ $filter_key ] ) ? 1 : 0;
			$integer_values[] = (int) ( $enrollment_args[ $filter_key ] ?? 0 );
		}

		// meta_query accepts arbitrary column/operator/value triples, which can't be expressed in a fixed SQL
		// template, so it is applied in PHP and limit/offset are applied after it in that case.
		$meta_query = ! empty( $enrollment_args['meta_query'] ) ? $enrollment_args['meta_query'] : array();
		$has_limit  = isset( $enrollment_args['limit'], $enrollment_args['offset'] ) && empty( $meta_query ) && ! isset( $enrollment_args['count'] );
		$limit      = $has_limit ? intval( $enrollment_args['limit'] ) : PHP_INT_MAX;
		$offset     = $has_limit ? intval( $enrollment_args['offset'] ) : 0;

		$filter_values = array_merge(
			array( $list_filters['id']['enabled'], $list_filters['user_id']['enabled'], $user_email, $user_email ),
			$integer_values,
			array(
				$list_filters['learners_hub_id']['enabled'],
				$list_filters['order_item_id']['enabled'],
				$status,
				$status,
				$by_dates,
				(string) ( $enrollment_args['start_date'] ?? '' ),
				(string) ( $enrollment_args['end_date'] ?? '' ),
				! empty( $enrollment_args['expired'] ) ? 1 : 0,
				current_time( 'mysql', true ),
			)
		);

		if ( isset( $enrollment_args['count'] ) && empty( $meta_query ) ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			return (int) $wpdb->get_var(
				$wpdb->prepare(
					'SELECT COUNT(*) FROM %i
					WHERE ( %d = 0 OR id IN (' . esc_sql( implode( ',', $list_filters['id']['ids'] ) ) . ') )
					AND ( %d = 0 OR user_id IN (' . esc_sql( implode( ',', $list_filters['user_id']['ids'] ) ) . ') )
					AND ( CHAR_LENGTH( %s ) = 0 OR LOWER( user_email ) = %s )
					AND ( %d = 0 OR course_id = %d )
					AND ( %d = 0 OR order_id = %d )
					AND ( %d = 0 OR cohort_id = %d )
					AND ( %d = 0 OR group_id = %d )
					AND ( %d = 0 OR learners_hub_id IN (' . esc_sql( implode( ',', $list_filters['learners_hub_id']['ids'] ) ) . ') )
					AND ( %d = 0 OR order_item_id IN (' . esc_sql( implode( ',', $list_filters['order_item_id']['ids'] ) ) . ') )
					AND ( CHAR_LENGTH( %s ) = 0 OR status = %s )
					AND ( %d = 0 OR enrollment_date BETWEEN %s AND %s )
					AND ( %d = 0 OR expiry_date <= %s )',
					$table_name,
					...$filter_values
				)
			);
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$results = $wpdb->get_results(
			$wpdb->prepare(
				'SELECT * FROM %i
				WHERE ( %d = 0 OR id IN (' . esc_sql( implode( ',', $list_filters['id']['ids'] ) ) . ') )
				AND ( %d = 0 OR user_id IN (' . esc_sql( implode( ',', $list_filters['user_id']['ids'] ) ) . ') )
				AND ( CHAR_LENGTH( %s ) = 0 OR LOWER( user_email ) = %s )
				AND ( %d = 0 OR course_id = %d )
				AND ( %d = 0 OR order_id = %d )
				AND ( %d = 0 OR cohort_id = %d )
				AND ( %d = 0 OR group_id = %d )
				AND ( %d = 0 OR learners_hub_id IN (' . esc_sql( implode( ',', $list_filters['learners_hub_id']['ids'] ) ) . ') )
				AND ( %d = 0 OR order_item_id IN (' . esc_sql( implode( ',', $list_filters['order_item_id']['ids'] ) ) . ') )
				AND ( CHAR_LENGTH( %s ) = 0 OR status = %s )
				AND ( %d = 0 OR enrollment_date BETWEEN %s AND %s )
				AND ( %d = 0 OR expiry_date <= %s )
				LIMIT %d OFFSET %d',
				$table_name,
				...array_merge( $filter_values, array( $limit, $offset ) )
			),
			ARRAY_A
		);

		$results = $results ?? array();

		if ( ! empty( $meta_query ) ) {
			$results = array_values( array_filter( $results, fn( $row ) => self::row_matches_meta_query( $row, $meta_query ) ) );

			if ( isset( $enrollment_args['limit'], $enrollment_args['offset'] ) ) {
				$results = array_slice( $results, intval( $enrollment_args['offset'] ), intval( $enrollment_args['limit'] ) );
			}
		}

		if ( isset( $enrollment_args['count'] ) ) {
			return count( $results );
		}

		return self::select_columns( $results, $enrollment_args['fields'] ?? '*' );
	}

	/**
	 * Keep only the requested columns of each enrollment row.
	 *
	 * @param array        $rows   Enrollment rows.
	 * @param string|array $fields Column name(s), or '*' for every column.
	 * @return array
	 */
	private static function select_columns( $rows, $fields ) {
		if ( '*' === $fields ) {
			return $rows;
		}

		$columns = array_flip( array_map( 'sanitize_key', (array) $fields ) );

		return array_map( fn( $row ) => array_intersect_key( $row, $columns ), $rows );
	}

	/**
	 * Check whether an enrollment row satisfies every condition of a meta_query.
	 *
	 * @param array $row        Enrollment row.
	 * @param array $meta_query List of arrays with 'key', 'compare' and 'value'.
	 * @return bool
	 */
	private static function row_matches_meta_query( $row, $meta_query ) {
		foreach ( $meta_query as $meta_condition ) {
			if ( empty( $meta_condition['key'] ) ) {
				continue;
			}

			$compare = strtoupper( $meta_condition['compare'] ?? '' );
			$column  = $row[ sanitize_key( $meta_condition['key'] ) ] ?? null;
			$value   = $meta_condition['value'] ?? '';

			switch ( $compare ) {
				case '=':
					$matches = (string) $column === (string) $value;
					break;
				case '!=':
					$matches = (string) $column !== (string) $value;
					break;
				case '>':
					$matches = $column > $value;
					break;
				case '<':
					$matches = $column < $value;
					break;
				case '>=':
					$matches = $column >= $value;
					break;
				case '<=':
					$matches = $column <= $value;
					break;
				case 'LIKE':
				case 'NOT LIKE':
					$pattern = '/^' . str_replace( '%', '.*', preg_quote( (string) $value, '/' ) ) . '$/is';
					$matches = (bool) preg_match( $pattern, (string) $column );
					$matches = ( 'LIKE' === $compare ) ? $matches : ! $matches;
					break;
				default:
					// Unsupported operators were ignored by the previous SQL implementation too.
					$matches = true;
			}

			if ( ! $matches ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Insert or update an enrollment record.
	 *
	 * @param array $enrollment_args Enrollment data. Must include 'user_email'. If 'id' is present, updates the record.
	 * @return int|false Enrollment ID on success, false on failure.
	 */
	public static function update_enrollment( $enrollment_args ) {
		global $wpdb;

		$table = $wpdb->prefix . Util::TABLES['enrollment'];
		$id    = isset( $enrollment_args['id'] ) ? (int) $enrollment_args['id'] : 0;

		unset( $enrollment_args['id'] );

		if ( $id > 0 ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$updated = $wpdb->update( $table, $enrollment_args, array( 'id' => $id ) );
			return ( false === $updated ) ? false : $id;
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$inserted = $wpdb->insert( $table, $enrollment_args );
		return $inserted ? $wpdb->insert_id : false;
	}

	/**
	 * Process WooCommerce order for Moodle enrollment.
	 *
	 * Enrolls the user into Moodle courses based on the products in the order.
	 *
	 * @param int $order_id WooCommerce order ID.
	 */
	public function process_completed_order( $order_id ) {
		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return;
		}

		if ( ! $order->get_customer_id() ) {
			Util::log( "Order #{$order_id}: Unable to enroll user — customer ID not found." );
			return;
		}

		$email_payload = array();

		foreach ( $order->get_items() as $item_id => $item ) {
			$product = $item->get_product();
			if ( ! $product ) {
				continue;
			}

			if ( $product->is_type( 'variation' ) ) {
				$parent_product = wc_get_product( $product->get_parent_id() );
				if ( $parent_product ) {
					$product = $parent_product;
				}
			}

			$moodle_course_id    = $product->get_meta( Util::MOOWOODLE_PRODUCT_META['moodle_course_id'], true );
			$wordpress_course_id = $product->get_meta( Util::MOOWOODLE_PRODUCT_META['wordpress_course_id'], true );

			if ( ! $moodle_course_id ) {
				Util::log( "Skipping enrollment - Moodle course ID is missing. Linked Course ID: #{$wordpress_course_id}" );
				continue;
			}

			$response = $this->enroll_user_in_course(
				array(
					'first_name'   => $order->get_billing_first_name(),
					'last_name'    => $order->get_billing_last_name(),
					'purchaser_id' => $order->get_customer_id(),
					'user_email'   => $order->get_billing_email(),
				),
				array(
					'order_id'      => $order_id,
					'order_item_id' => $item_id,
				),
				array(
					'course_id'        => $wordpress_course_id,
					'moodle_course_id' => $moodle_course_id,
				)
            );

			if ( $response ) {
				$email_payload['course'][ $product->get_id() ] = $product->get_name();
			}
		}

		if ( ! empty( $email_payload['course'] ) ) {
			$email = WC()->mailer()->emails['EnrollmentEmail'];
			$email->trigger( $order->get_billing_email(), $email_payload );
		}

		do_action( 'moowoodle_after_enrol_moodle_user', $order );
	}

	/**
	 * Enroll the user in a Moodle course.
	 *
	 * @param array $user_details   User info.
	 * @param array $order_details  Order info.
	 * @param array $course_details Course info.
	 * @return bool
	 */
	public function enroll_user_in_course( $user_details, $order_details, $course_details ) {

		if ( empty( $user_details ) || empty( $order_details ) || empty( $course_details ) ) {
			Util::log(
				'[MooWoodle] Enrollment aborted — one or more required data arrays are empty.',
				compact( 'user_details', 'order_details', 'course_details' )
			);
			return false;
		}
		$moodle_user_id = $this->get_moodle_user_id( $user_details );

		if ( empty( $moodle_user_id ) ) {
			Util::log( "[MooWoodle] Missing Moodle user ID for purchaser {$user_details['purchaser_id']}." );
			return false;
		}

		$role_id = apply_filters( 'moowoodle_enrolled_user_role_id', 5 );

	    $response = MooWoodle()->external_service->do_request(
			'enrol_users',
			array(
				'enrolments' => array(
					array(
						'roleid'   => $role_id,
						'suspend'  => $course_details['suspend'] ?? 0,
						'courseid' => (int) $course_details['moodle_course_id'],
						'userid'   => $moodle_user_id,
					),
				),
			)
		);

		if ( ! empty( $response['error'] ) ) {
			update_user_meta( $user_details['purchaser_id'], Util::MOOWOODLE_USER_META['password_reset'], 1 );
		}

		$enrollment_data = array(
			'user_id'         => $user_details['purchaser_id'],
			'user_email'      => $user_details['user_email'],
			'course_id'       => $course_details['course_id'],
			'order_id'        => $order_details['order_id'],
			'order_item_id'   => $order_details['order_item_id'],
			'status'          => 'enrolled',
			'enrollment_date' => gmdate( 'Y-m-d H:i:s' ),
		);

		$existing_enrollment = self::get_enrollments(
			array(
				'user_email' => $user_details['user_email'],
				'course_id'  => $course_details['course_id'],
				'fields'     => 'id',
			)
		);

		$existing_enrollment = (int) ( $existing_enrollment[0]['id'] ?? 0 );

		if ( $existing_enrollment > 0 ) {
			$enrollment_data['id'] = $existing_enrollment;
		}

		self::update_enrollment( $enrollment_data );

		return true;
	}

	/**
	 * Get the Moodle user ID for a given enrollment data.
	 * Creates or updates the Moodle user if needed.
	 *
	 * @param array $user_details Enrollment details including purchaser ID and email.
	 * @return int Moodle user ID or 0 if not found/created.
	 */
	public function get_moodle_user_id( $user_details ) {

		if ( ! $user_details['purchaser_id'] ) {
			return 0;
		}

		$moodle_user_id = get_user_meta( $user_details['purchaser_id'], 'moowoodle_moodle_user_id', true );
		$moodle_user_id = apply_filters( 'moowoodle_get_moodle_user_id_before_enrollment', $moodle_user_id, $user_details['purchaser_id'] );

		if ( $moodle_user_id ) {
			return $moodle_user_id;
		}

		$response = MooWoodle()->external_service->do_request(
			'get_moodle_users',
			array(
				'criteria' => array(
					array(
						'key'   => 'email',
						'value' => $user_details['user_email'],
					),
				),
			)
		);

		$moodle_user_id = ! empty( $response['data']['users'] ) ? reset( $response['data']['users'] )['id'] : 0;

		if ( ! $moodle_user_id ) {
			$moodle_user_id = $this->create_moodle_user( $user_details );
		}

		update_user_meta( $user_details['purchaser_id'], 'moowoodle_moodle_user_id', $moodle_user_id );

		return $moodle_user_id;
	}

	/**
	 * Create a Moodle user based on user data.
	 *
	 * Checks and uses stored passwords if available, generates username from email,
	 * sends the data to Moodle to create the user, and returns the Moodle user ID.
	 *
	 * @param array $user_details User data including purchaser ID, email, first and last names.
	 * @return int Moodle user ID on success, 0 on failure.
	 * @throws \Exception If there is an error during user creation or API call.
	 */
	public function create_moodle_user( $user_details ) {
		$user_id = absint( $user_details['purchaser_id'] ?? 0 );
		if ( ! $user_id ) {
			return 0;
		}

		try {
			$email = sanitize_email( $user_details['user_email'] ?? '' );
			if ( ! $email ) {
				return 0;
			}

			// Generate username from email.
			$username = sanitize_user( explode( '@', $email )[0] );

			$moodle_user_payload = apply_filters(
				'moowoodle_moodle_user_payload',
				array(
					'email'          => $email,
					'username'       => $username,
					'createpassword' => 1,
					'auth'           => 'manual',
					'firstname'      => sanitize_text_field( $user_details['first_name'] ?? 'User' ),
					'lastname'       => sanitize_text_field( $user_details['last_name'] ?? 'User' ),
				)
			);

			$response = MooWoodle()->external_service->do_request( 'create_users', array( 'users' => array( $moodle_user_payload ) ) );

			if ( empty( $response['data'] ) ) {
				throw new \Exception( 'Invalid response from Moodle while creating user.' );
			}

			$moodle_user = reset( $response['data'] );

			if ( isset( $moodle_user['id'] ) ) {
				return $moodle_user['id'];
			}

			throw new \Exception( 'Unable to create user in Moodle.' );
		} catch ( \Exception $e ) {
			Util::log( "[MooWoodle] Moodle user creation error for user ID {$user_id}: " . $e->getMessage() );
		}

		return 0;
	}


    /**
	 * Display WC order thankyou page containt.
     *
	 * @param int $order_id order id.
	 * @return void
	 */
	public function render_enrollment_notice( $order_id ) {
		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return;
		}

		if ( 'completed' === $order->get_status() ) {
			esc_html_e( 'Please check your mail or go to My Courses page to access your courses.', 'moowoodle' );
		} else {
			printf(
				/* translators: %s: Order status. */
				esc_html__( 'Order status is: %s', 'moowoodle' ),
				esc_html( $order->get_status() )
			);

			echo '<br />'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		}
	}

	/**
	 * Display course start and end date.
     *
	 * @return void
	 */
	public function render_course_availability_dates() {
		global $product;
		if ( ! $product instanceof \WC_Product ) {
			return;
		}

		$start_date = $product->get_meta( Util::MOOWOODLE_PRODUCT_META['course_startdate'], true );
		$end_date   = $product->get_meta( Util::MOOWOODLE_PRODUCT_META['course_enddate'], true );

		// Get start end date setting.
		$start_end_date = in_array( 'start_end_date', MooWoodle()->setting->get_setting( 'start_end_date', array() ), true );

		if ( $start_end_date ) {
			if ( $start_date ) {
				printf(
					/* translators: %s: Start date in Y-m-d format. */
					esc_html__( 'Start Date: %s', 'moowoodle' ),
					esc_html( gmdate( 'Y-m-d', $start_date ) )
				);
				echo '<br />'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			}

			if ( $end_date ) {
				printf(
					/* translators: %s: End date in Y-m-d format. */
					esc_html__( 'End Date: %s', 'moowoodle' ),
					esc_html( gmdate( 'Y-m-d', $end_date ) )
				);
			}
		}
	}


	/**
	 * Restrict quantity to 1 for Moodle products only.
	 */
	public function restrict_cart_quantity_on_update() {
		foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
			$product_id = $cart_item['product_id'];

			// Check if product has Moodle course ID.
			$moodle_course_id = get_post_meta( $product_id, Util::MOOWOODLE_PRODUCT_META['moodle_course_id'], true );
			if ( empty( $moodle_course_id ) ) {
				continue; // Skip non-Moodle products.
			}

			if ( $cart_item['quantity'] > 1 ) {
				WC()->cart->set_quantity( $cart_item_key, 1 );
				wc_add_notice( __( 'You can only purchase one unit of this product.', 'moowoodle' ), 'error' );
			}
		}
	}
}
