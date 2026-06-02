<?php
/**
 * Enrollment class file.
 *
 * @package MooWoodle
 */

namespace MooWoodle;

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
		$where      = array();

		// Filters.
		if ( isset( $enrollment_args['id'] ) ) {
			$ids     = is_array( $enrollment_args['id'] ) ? $enrollment_args['id'] : array( $enrollment_args['id'] );
			$ids     = implode( ',', array_map( 'intval', $ids ) );
			$where[] = "id IN ($ids)";
		}

		if ( isset( $enrollment_args['user_id'] ) ) {
			$ids     = is_array( $enrollment_args['user_id'] ) ? $enrollment_args['user_id'] : array( $enrollment_args['user_id'] );
			$ids     = implode( ',', array_map( 'intval', $ids ) );
			$where[] = "user_id IN ($ids)";
		}

		if ( isset( $enrollment_args['user_email'] ) && '' !== $enrollment_args['user_email'] ) {
			$email   = sanitize_email( strtolower( trim( $enrollment_args['user_email'] ) ) );
			$where[] = $wpdb->prepare( 'LOWER(user_email) = %s', $email );
		}

		if ( isset( $enrollment_args['course_id'] ) ) {
			$where[] = $wpdb->prepare( 'course_id = %d', $enrollment_args['course_id'] );
		}

		if ( ! empty( $enrollment_args['meta_query'] ) ) {
			foreach ( $enrollment_args['meta_query'] as $meta_condition ) {
				if ( ! empty( $meta_condition['key'] ) ) {
					$key     = $meta_condition['key'];
					$compare = strtoupper( $meta_condition['compare'] );
					$value   = $meta_condition['value'];

					if ( in_array( $compare, array( '=', '!=', '>', '<', '>=', '<=', 'LIKE', 'NOT LIKE' ), true ) ) {
						$where[] = "`$key` $compare " . $wpdb->prepare( '%s', $value );
					}
				}
			}
		}

		if ( isset( $enrollment_args['order_id'] ) ) {
			$where[] = $wpdb->prepare( 'order_id = %d', $enrollment_args['order_id'] );
		}

		if ( isset( $enrollment_args['status'] ) && '' !== $enrollment_args['status'] ) {
			$where[] = $wpdb->prepare( 'status = %s', sanitize_text_field( $enrollment_args['status'] ) );
		}

		if ( ! empty( $enrollment_args['start_date'] ) && ! empty( $enrollment_args['end_date'] ) ) {
			$where[] = $wpdb->prepare(
				'enrollment_date BETWEEN %s AND %s',
				$enrollment_args['start_date'],
				$enrollment_args['end_date']
			);
		}

		$where = apply_filters( 'moowoodle_enrollment_query', $where, $enrollment_args );

		$select_fields = '*';

		if ( ! empty( $enrollment_args['fields'] ) ) {
			if ( is_array( $enrollment_args['fields'] ) ) {
				$select_fields = implode( ', ', array_map( 'sanitize_key', $enrollment_args['fields'] ) );
			} else {
				$select_fields = sanitize_key( $enrollment_args['fields'] );
			}
		}

		$query = isset( $enrollment_args['count'] )
			? "SELECT COUNT(*) FROM {$table_name}"
			: "SELECT {$select_fields} FROM {$table_name}";

		if ( ! empty( $where ) ) {
			$query .= ' WHERE ' . implode( ' AND ', $where );
		}

		if ( isset( $enrollment_args['limit'] ) && isset( $enrollment_args['offset'] ) ) {
			$query .= $wpdb->prepare( ' LIMIT %d OFFSET %d', intval( $enrollment_args['limit'] ), intval( $enrollment_args['offset'] ) );
		}

		if ( isset( $enrollment_args['count'] ) ) {
			return $wpdb->get_var( $query ) ?? 0; // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
		}

		$results = $wpdb->get_results( $query, ARRAY_A ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
		return $results ?? array();
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

			$moodle_user_payload = array(
				'email'          => $email,
				'username'       => $username,
				'createpassword' => 1,
				'auth'           => apply_filters( 'moowoodle_new_user_auth_type', 'manual' ),
				'firstname'      => sanitize_text_field( $user_details['first_name'] ?? 'User' ),
				'lastname'       => sanitize_text_field( $user_details['last_name'] ?? 'User' ),
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

			// Check if product has Moodle course ID
			$moodle_course_id = get_post_meta( $product_id, Util::MOOWOODLE_PRODUCT_META['moodle_course_id'], true );
			if ( empty( $moodle_course_id ) ) {
				continue; // Skip non-Moodle products
			}

			if ( $cart_item['quantity'] > 1 ) {
				WC()->cart->set_quantity( $cart_item_key, 1 );
				wc_add_notice( __( 'You can only purchase one unit of this product.', 'moowoodle' ), 'error' );
			}
		}
	}
}
