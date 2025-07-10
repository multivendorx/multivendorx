<?php
/**
 * Enrollment class file.
 *
 * @package MooWoodle
 */

namespace MooWoodle;

/**
 * MooWoodle Enrollment class
 *
 * @class       Enrollment class
 * @version     PRODUCT_VERSION
 * @author      DualCube
 */
class Enrollment {

	/**
     * Enrollment constructor.
     */
	public function __construct() {
		add_action( 'woocommerce_order_status_completed', array( &$this, 'process_order' ), 10, 1 );
		add_action( 'woocommerce_thankyou', array( &$this, 'enrollment_modified_details' ) );
		add_action( 'woocommerce_after_shop_loop_item_title', array( &$this, 'add_dates_with_product' ) );
		add_action( 'woocommerce_product_meta_start', array( &$this, 'add_dates_with_product' ) );
		add_action( 'woocommerce_cart_updated', array( $this, 'restrict_cart_quantity_on_update' ) );
	}

	/**
	 * Retrieves enrollment records based on the given conditions.
	 *
	 * @param array $args Filter conditions.
	 * @return array List of enrollment records.
	 */
	public static function get_enrollment_information( $args ) {
		global $wpdb;

		$table = $wpdb->prefix . Util::TABLES['enrollment'];
		$where = array();

		// Filters.
		if ( isset( $args['id'] ) ) {
			$ids     = is_array( $args['id'] ) ? $args['id'] : array( $args['id'] );
			$ids     = implode( ',', array_map( 'intval', $ids ) );
			$where[] = "id IN ($ids)";
		}

		if ( isset( $args['user_id'] ) ) {
			$ids     = is_array( $args['user_id'] ) ? $args['user_id'] : array( $args['user_id'] );
			$ids     = implode( ',', array_map( 'intval', $ids ) );
			$where[] = "user_id IN ($ids)";
		}

		if ( isset( $args['user_email'] ) && '' !== $args['user_email'] ) {
			$email   = sanitize_email( strtolower( trim( $args['user_email'] ) ) );
			$where[] = $wpdb->prepare( 'LOWER(user_email) = %s', $email );
		}

		if ( isset( $args['course_id'] ) ) {
			$where[] = $wpdb->prepare( 'course_id = %d', $args['course_id'] );
		}

		if ( ! empty( $args['meta_query'] ) ) {
			foreach ( $args['meta_query'] as $meta ) {
				if ( ! empty( $meta['key'] ) ) {
					$key     = $meta['key'];
					$compare = strtoupper( $meta['compare'] );
					$value   = $meta['value'];

					if ( in_array( $compare, array( '=', '!=', '>', '<', '>=', '<=', 'LIKE', 'NOT LIKE' ), true ) ) {
						$where[] = "`$key` $compare " . $wpdb->prepare( '%s', $value );
					}
				}
			}
		}

		if ( isset( $args['order_id'] ) ) {
			$where[] = $wpdb->prepare( 'order_id = %d', $args['order_id'] );
		}

		if ( isset( $args['status'] ) && '' !== $args['status'] ) {
			$where[] = $wpdb->prepare( 'status = %s', $args['status'] );
		}

		$where = apply_filters( 'moowoodle_enrollment_query', $where, $args );

		if ( isset( $args['count'] ) ) {
			$query = "SELECT COUNT(*) FROM $table";
		} else {
			$query = "SELECT * FROM $table";
		}

		if ( ! empty( $where ) ) {
			$query .= ' WHERE ' . implode( ' AND ', $where );
		}

		if ( isset( $args['limit'] ) && isset( $args['offset'] ) ) {
			$query .= $wpdb->prepare( ' LIMIT %d OFFSET %d', intval( $args['limit'] ), intval( $args['offset'] ) );
		}

		if ( isset( $args['count'] ) ) {
			$results = $wpdb->get_var( $query ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
			return $results ?? 0;
		} else {
			$results = $wpdb->get_results( $query, ARRAY_A ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
			return $results ?? array();
		}
	}

	/**
	 * Insert or update an enrollment record.
	 *
	 * @param array $args Enrollment data. Must include 'user_email'. If 'id' is present, updates the record.
	 * @return int|false Enrollment ID on success, false on failure.
	 */
	public static function update_enrollment_information( $args ) {
		global $wpdb;

		$table = $wpdb->prefix . Util::TABLES['enrollment'];
		$id    = isset( $args['id'] ) ? (int) $args['id'] : 0;

		unset( $args['id'] );

		if ( $id > 0 ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$updated = $wpdb->update( $table, $args, array( 'id' => $id ) );
			return ( false === $updated ) ? false : $id;
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$inserted = $wpdb->insert( $table, $args );
		return $inserted ? $wpdb->insert_id : false;
	}

	/**
	 * Process WooCommerce order for Moodle enrollment.
	 *
	 * Enrolls the user into Moodle courses based on the products in the order.
	 *
	 * @param int $order_id WooCommerce order ID.
	 */
	public function process_order( $order_id ) {
		$order = wc_get_order( $order_id );

		if ( ! $order->get_customer_id() ) {
			Util::log( "Order #{$order_id}: Unable to enroll user — customer ID not found." );
		}

		$email_data = array();

		foreach ( $order->get_items() as $item_id => $item ) {
			$product = $item->get_product();

			$moodle_course_id = $product->get_meta( 'moodle_course_id', true );
            $linked_course_id = $product->get_meta( 'linked_course_id', true );

			if ( ! $moodle_course_id ) {
				Util::log( "Skipping enrollment - Moodle course ID is missing. Linked Course ID: #{$linked_course_id}" );
				continue;
			}

			$response = $this->process_course_enrollment(
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
					'course_id'        => $linked_course_id,
					'moodle_course_id' => $moodle_course_id,
				)
            );

			if ( $response ) {
				$email_data['course'][ $product->get_id() ] = $product->get_name();
			}
		}
		$email = WC()->mailer()->emails['EnrollmentEmail'];

		$email->trigger( $order->get_billing_email(), $email_data );

		do_action( 'moowoodle_after_enrol_moodle_user', $order );
	}

	/**
	 * Enroll the user in a Moodle course.
	 *
	 * @param array $user_data   User info.
	 * @param array $order_data  Order info.
	 * @param array $course_data Course info.
	 * @return bool
	 */
	public function process_course_enrollment( $user_data, $order_data, $course_data ) {

		if ( empty( $user_data ) || empty( $order_data ) || empty( $course_data ) ) {
			Util::log( '[MooWoodle] Enrollment aborted — one or more required data arrays are empty.', compact( 'user_data', 'order_data', 'course_data' ) );
			return false;
		}
		$moodle_user_id = $this->get_moodle_user_id( $user_data );

		if ( empty( $moodle_user_id ) ) {
			Util::log( "[MooWoodle] Missing Moodle user ID for purchaser {$user_data['purchaser_id']}." );
			return false;
		}

		$role_id = apply_filters( 'moowoodle_enrolled_user_role_id', 5 );

	    MooWoodle()->external_service->do_request(
			'enrol_users',
			array(
				'enrolments' => array(
					array(
						'roleid'   => $role_id,
						'suspend'  => $course_data['suspend'] ?? 0,
						'courseid' => (int) $course_data['moodle_course_id'],
						'userid'   => $moodle_user_id,
					),
				),
			)
		);

		$enrollment_data = array(
			'user_id'         => $user_data['purchaser_id'],
			'user_email'      => $user_data['user_email'],
			'course_id'       => $course_data['course_id'],
			'order_id'        => $order_data['order_id'],
			'order_item_id'   => $order_data['order_item_id'],
			'status'          => 'enrolled',
			'enrollment_date' => gmdate( 'Y-m-d H:i:s' ),
		);

		$existing_enrollment = $this->get_enrollment_information(
			array(
				'user_email' => $user_data['user_email'],
				'course_id'  => $course_data['course_id'],
			)
		);

		$existing_enrollment = reset( $existing_enrollment );

		if ( $existing_enrollment ) {
			$enrollment_data['id'] = $existing_enrollment['id'];
		}

		self::update_enrollment_information( $enrollment_data );

		return true;
	}

	/**
	 * Get the Moodle user ID for a given enrollment data.
	 * Creates or updates the Moodle user if needed.
	 *
	 * @param array $user_data Enrollment details including purchaser ID and email.
	 * @return int Moodle user ID or 0 if not found/created.
	 */
	public function get_moodle_user_id( $user_data ) {

		if ( ! $user_data['purchaser_id'] ) {
			return 0;
		}

		$moodle_user_id = get_user_meta( $user_data['purchaser_id'], 'moowoodle_moodle_user_id', true );
		$moodle_user_id = apply_filters( 'moowoodle_get_moodle_user_id_before_enrollment', $moodle_user_id, $user_data['purchaser_id'] );

		if ( $moodle_user_id ) {
			return $moodle_user_id;
		}

		$response = MooWoodle()->external_service->do_request(
			'get_moodle_users',
			array(
				'criteria' => array(
					array(
						'key'   => 'email',
						'value' => $user_data['user_email'],
					),
				),
			)
		);

		$moodle_user_id = ! empty( $response['data']['users'] ) ? reset( $response['data']['users'] )['id'] : 0;

		if ( ! $moodle_user_id ) {
			$moodle_user_id = $this->create_user( $user_data );
		} else {
			$settings = MooWoodle()->setting->get_setting( 'update_moodle_user', array() );

			if ( in_array( 'update_moodle_user', $settings, true ) ) {
				$this->update_moodle_user( $moodle_user_id, $user_data['purchaser_id'] );
			}
		}

		update_user_meta( $user_data['purchaser_id'], 'moowoodle_moodle_user_id', $moodle_user_id );

		return $moodle_user_id;
	}

	/**
	 * Create a Moodle user based on user data.
	 *
	 * Checks and uses stored passwords if available, generates username from email,
	 * sends the data to Moodle to create the user, and returns the Moodle user ID.
	 *
	 * @param array $user_data User data including purchaser ID, email, first and last names.
	 * @return int Moodle user ID on success, 0 on failure.
	 * @throws \Exception If there is an error during user creation or API call.
	 */
	public function create_user( $user_data ) {
		$user_id = absint( $user_data['purchaser_id'] ?? 0 );
		if ( ! $user_id ) {
			return 0;
		}

		try {
			$new_wordpress_user = get_user_meta( $user_id, 'moowoodle_wordpress_new_user_created', true );

			if ( $new_wordpress_user ) {
				$password = get_user_meta( $user_id, 'moowoodle_wordpress_user_pwd', true );
				add_user_meta( $user_id, 'moowoodle_moodle_user_pwd', $password );
			} else {
				$password = get_user_meta( $user_id, 'moowoodle_moodle_user_pwd', true );

				if ( ! $password ) {
					$password = $this->generate_password();
					add_user_meta( $user_id, 'moowoodle_moodle_user_pwd', $password );
				}
			}

			$email      = sanitize_email( $user_data['user_email'] ?? '' );
			$first_name = sanitize_text_field( $user_data['first_name'] ?? 'User' );
			$last_name  = sanitize_text_field( $user_data['last_name'] ?? 'User' );

			if ( ! $email ) {
				return 0;
			}

			// Generate username from email.
			$username = sanitize_user( explode( '@', $email )[0] );

			$user_data = array(
				'email'       => $email,
				'username'    => $username,
				'password'    => $password,
				'auth'        => 'manual',
				'firstname'   => $first_name,
				'lastname'    => $last_name,
				'preferences' => array(
					array(
						'type'  => 'auth_forcepasswordchange',
						'value' => 1,
					),
				),
			);

			$response = MooWoodle()->external_service->do_request( 'create_users', array( 'users' => array( $user_data ) ) );

			if ( empty( $response['data'] ) ) {
				throw new \Exception( 'Invalid response from Moodle while creating user.' );
			}

			$moodle_user = reset( $response['data'] );

			if ( isset( $moodle_user['id'] ) ) {
				update_user_meta( $user_id, 'moowoodle_moodle_new_user_created', 'created' );
				return $moodle_user['id'];
			}

			throw new \Exception( 'Unable to create user in Moodle.' );
		} catch ( \Exception $e ) {
			Util::log( "[MooWoodle] Moodle user creation error for user ID {$user_id}: " . $e->getMessage() );
		}

		return 0;
	}

    /**
	 * Generate random password.
     *
	 * @param int $length default length is 12.
	 * @return string generated password.
	 */
	public function generate_password( $length = 12 ) {
		$sets   = array();
		$sets[] = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
		$sets[] = 'abcdefghjkmnpqrstuvwxyz';
		$sets[] = '23456789';
		$sets[] = '~!@#$%^&*(){}[],./?';

		$password = '';

		// Append one character from each set to ensure variety.
		foreach ( $sets as $set ) {
			$chars     = str_split( $set );
			$password .= $chars[ array_rand( $chars ) ];
		}

		$password_length = strlen( $password );

		// Use all characters to fill up to $length.
		while ( $password_length < $length ) {
			$random_set      = $sets[ array_rand( $sets ) ];
			$chars           = str_split( $random_set );
			$password       .= $chars[ array_rand( $chars ) ];
			$password_length = strlen( $password );
		}

		// Shuffle and return.
		return str_shuffle( $password );
	}

	/**
	 * Update Moodle user details with data from the WordPress purchaser.
	 *
	 * Fetches user data and sends an update request to Moodle for the given Moodle user ID.
	 *
	 * @param int $moodle_user_id Moodle user ID to update.
	 * @param int $purchaser_id WordPress user ID of the purchaser.
	 * @return int Returns the Moodle user ID after update.
	 */
	private function update_moodle_user( $moodle_user_id, $purchaser_id ) {

		$purchaser_data = $this->get_user_data( $purchaser_id, $moodle_user_id );

		// update user data on moodle.
		MooWoodle()->external_service->do_request(
			'update_users',
			array(
				'users' => array( $purchaser_data ),
			)
		);

		return $moodle_user_id;
	}

    /**
	 * Info about a user to be created/updated in Moodle.
	 *
	 * @param int $purchaser_id    WordPress user ID of the purchaser.
	 * @param int $moodle_user_id  Optional. Moodle user ID. Default 0.
	 * @return array Returns an array of user data formatted for Moodle API.
	 */
	private function get_user_data( $purchaser_id, $moodle_user_id = 0 ) {
		// Prepare user data.
		$purchaser_details = ( $purchaser_id ) ? get_userdata( $purchaser_id ) : false;
		$username          = ( $purchaser_details ) ? $purchaser_details->user_login : '';
		$username          = str_replace( ' ', '', strtolower( $username ) );
		$password          = get_user_meta( $purchaser_id, 'moowoodle_moodle_user_pwd', true );

		// If password not exist create a password.
		if ( ! $password ) {
			$password = $this->generate_password();
			add_user_meta( $purchaser_id, 'moowoodle_moodle_user_pwd', $password );
		}

		$user_data = array();

		// Moodle user.
		if ( $moodle_user_id ) {
			$user_data['id'] = $moodle_user_id;
		} else {
			$user_data['email']    = ( $purchaser_details ) ? $purchaser_details->user_email : '';
			$user_data['username'] = $username;
			$user_data['password'] = $password;
			$user_data['auth']     = 'manual';
		}
		$user_data['preferences'] = array(
			array(
				'type'  => 'auth_forcepasswordchange',
				'value' => 1,
			),
		);

		/**
		 * Filter after prepare users data.
         *
		 * @var array $user_data
		 * @var \WC_Order $order
		 */
		return apply_filters( 'moowoodle_moodle_users_data', $user_data );
	}

    /**
	 * Display WC order thankyou page containt.
     *
	 * @param int $order_id order id.
	 * @return void
	 */
	public function enrollment_modified_details( $order_id ) {
		$order = wc_get_order( $order_id );

		if ( $order->get_status() === 'completed' ) {
			esc_html_e( 'Please check your mail or go to My Courses page to access your courses.', 'moowoodle' );
		} else {
			esc_html_e( 'Order status is :- ', 'moowoodle' ) . $order->get_status() . '<br>';
		}
	}

	/**
	 * Display course start and end date.
     *
	 * @return void
	 */
	public function add_dates_with_product() {
		global $product;

		$startdate = $product->get_meta( '_course_startdate', true );
		$enddate   = $product->get_meta( '_course_enddate', true );

		// Get start end date setting.
		$start_end_date = MooWoodle()->setting->get_setting( 'start_end_date', array() );
		$start_end_date = in_array( 'start_end_date', $start_end_date, true );

		if ( $start_end_date ) {
			if ( $startdate ) {
				printf(
					// translators: %s: Start date in Y-m-d format.
					esc_html__( 'Start Date: %s', 'moowoodle' ),
					esc_html( gmdate( 'Y-m-d', $startdate ) )
				);
				echo '<br>';
			}

			if ( $enddate ) {
				printf(
					// translators: %s: End date in Y-m-d format.
					esc_html__( 'End Date: %s', 'moowoodle' ),
					esc_html( gmdate( 'Y-m-d', $enddate ) )
				);
			}
		}
	}

	/**
	 * Enforce quantity restriction based on plugin version and settings.
	 */
	public function restrict_cart_quantity_on_update() {
		foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
			if ( $cart_item['quantity'] > 1 ) {
				WC()->cart->set_quantity( $cart_item_key, 1 );
				wc_add_notice( __( 'You can only purchase one unit of this product.', 'moowoodle' ), 'error' );
			}
		}
	}
}
