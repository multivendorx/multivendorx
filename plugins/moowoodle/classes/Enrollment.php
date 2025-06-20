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
	 * Variable store woocommerce order object
     *
	 * @var \WC_Order | null
	 */
	public $order = null;

	/**
     * Enrollment constructor.
     */
	public function __construct() {
		add_action( 'woocommerce_order_status_completed', array( &$this, 'process_order' ), 10, 1 );
		add_action( 'woocommerce_thankyou', array( &$this, 'enrollment_modified_details' ) );
		add_action( 'woocommerce_after_shop_loop_item_title', array( &$this, 'add_dates_with_product' ) );
		add_action( 'woocommerce_product_meta_start', array( &$this, 'add_dates_with_product' ) );
	}

	/**
	 * Process WooCommerce order for Moodle enrollment.
	 *
	 * Creates user if needed, then enrolls user in courses, groups, or cohorts
	 * based on the products in the order.
	 *
	 * @param int $order_id The ID of the WooCommerce order.
	 */
	public function process_order( $order_id ) {
		if ( MooWoodle()->util->is_khali_dabba() ) {
			do_action( 'moowoodle_process_enrollment', $order_id );
			return;
		}
		$order       = wc_get_order( $order_id );
		$this->order = $order;

		if ( ! $order->get_customer_id() ) {
			\MooWoodle\Util::log( 'Unable to enroll user — customer ID not found (user not created).' );
		}

		$email_data = array();

		foreach ( $order->get_items() as $item_id => $item ) {
			$product = $item->get_product();

			$moodle_course_id = $product->get_meta( 'moodle_course_id', true );

			if ( ! $moodle_course_id ) {
				\MooWoodle\Util::log( 'Unable to enroll on order complete. Order item is not linked with any course.' );
				continue;
			}

			$response = $this->enrol_moodle_user(
                array(
					'first_name'       => $order->get_billing_first_name(),
					'last_name'        => $order->get_billing_last_name(),
					'purchaser_id'     => $order->get_customer_id(),
					'user_email'       => $order->get_billing_email(),
					'order_id'         => $order_id,
					'item_id'          => $item_id,
					'enrolled_date'    => time(),
					'course_id'        => $product->get_meta( 'linked_course_id', true ),
					'moodle_course_id' => $moodle_course_id,
                )
            );

			if ( $response ) {
				$email_data['course'][] = $product->get_meta( 'linked_course_id', true );
			}
		}

		do_action( 'moowoodle_after_enrol_moodle_user', $email_data, $order->get_customer_id() );
	}

	/**
	 * Process the enrollment when the order status is complete or a user is added to a group.
	 *
	 * @param array $enroll_data all enroll data.
	 * @return bool
	 */
	public function enrol_moodle_user( $enroll_data ) {
		if ( empty( $enroll_data ) ) {
			return false;
		}

		$group_item_id = $enroll_data['group_item_id'] ?? false;

		if ( $group_item_id ) {
			// Apply the filter and check result.
			if ( ! apply_filters( 'moowoodle_check_item', $enroll_data['group_item_id'] ) ) {
				return false;
			}
		}

		$moodle_user_id = $this->get_moodle_user_id( $enroll_data );
		if ( empty( $moodle_user_id ) ) {
			Util::log( "[MooWoodle] Missing Moodle user ID for purchaser {$enroll_data['purchaser_id']}." );
			return false;
		}

		$enroll_data['moodle_user_id'] = $moodle_user_id;
		$enroll_data['role_id']        = apply_filters( 'moowoodle_enrolled_user_role_id', 5 );

		$response = MooWoodle()->external_service->do_request(
			'enrol_users',
			array(
				'enrolments' => array(
					array(
						'roleid'   => $enroll_data['role_id'],
						'suspend'  => $enroll_data['suspend'] ?? 0,
						'courseid' => (int) $enroll_data['moodle_course_id'],
						'userid'   => $moodle_user_id,
					),
				),
			)
		);

		$enrollment_data = array(
			'user_id'       => $enroll_data['purchaser_id'],
			'user_email'    => $enroll_data['user_email'],
			'course_id'     => $enroll_data['course_id'],
			'order_id'      => $enroll_data['order_id'],
			'item_id'       => $enroll_data['item_id'] ?? 0,
			'status'        => 'enrolled',
			'group_item_id' => $enroll_data['group_item_id'] ?? 0,
			'enrolled_date' => current_time( 'mysql' ),
		);

		$existing_enrollment = $this->get_enrollments(
			array(
				'user_email'    => $enroll_data['user_email'],
				'course_id'     => $enroll_data['course_id'],
				'group_item_id' => $enroll_data['group_item_id'] ?? 0,
			)
		);

		$existing_enrollment = reset( $existing_enrollment );

		if ( $existing_enrollment ) {
			if ( 'enrolled' === $existing_enrollment['status'] ) {
				return true;
			}
			// Add 'id' key to trigger update.
			$enrollment_data['id'] = $existing_enrollment['id'];
		}

		self::update_enrollment( $enrollment_data );

		if ( $group_item_id ) {
			do_action( 'moowoodle_seat_book', $enroll_data['group_item_id'] );
		}

		return true;
	}

	/**
	 * Get the Moodle user ID for a given enrollment data.
	 * Creates or updates the Moodle user if needed.
	 *
	 * @param array $enroll_data Enrollment details including purchaser ID and email.
	 * @return int Moodle user ID or 0 if not found/created.
	 */
	public function get_moodle_user_id( $enroll_data ) {

		if ( ! $enroll_data['purchaser_id'] ) {
			return 0;
		}

		$moodle_user_id = get_user_meta( $enroll_data['purchaser_id'], 'moowoodle_moodle_user_id', true );
		$moodle_user_id = apply_filters( 'moowoodle_get_moodle_user_id_before_enrollment', $moodle_user_id, $enroll_data['purchaser_id'] );

		if ( $moodle_user_id ) {
			return $moodle_user_id;
		}

		$moodle_user_id = $this->search_for_moodle_user( 'email', $enroll_data['user_email'] );

		if ( ! $moodle_user_id ) {
			$moodle_user_id = $this->create_user( $enroll_data );
		} else {
			$settings = MooWoodle()->setting->get_setting( 'update_moodle_user', array() );

			if ( in_array( 'update_moodle_user', $settings, true ) ) {
				$this->update_moodle_user( $moodle_user_id, $enroll_data['purchaser_id'] );
			}
		}

		update_user_meta( $enroll_data['purchaser_id'], 'moowoodle_moodle_user_id', $moodle_user_id );

		return $moodle_user_id;
	}

	/**
	 * Search for a Moodle user by a specific key and value.
	 *
	 * @param string $key   The field to search by (e.g., 'email', 'username').
	 * @param string $value The value to search for.
	 * @return int          Moodle user ID if found, otherwise 0.
	 */
	private function search_for_moodle_user( $key, $value ) {
		$response = MooWoodle()->external_service->do_request(
			'get_moodle_users',
			array(
				'criteria' => array(
					array(
						'key'   => $key,
						'value' => $value,
					),
				),
			)
		);

		return ! empty( $response['data']['users'] ) ? reset( $response['data']['users'] )['id'] : 0;
	}

	/**
	 * Create a Moodle user based on enrollment data.
	 *
	 * Checks and uses stored passwords if available, generates username from email,
	 * sends the data to Moodle to create the user, and returns the Moodle user ID.
	 *
	 * @param array $enroll_data Enrollment data including purchaser ID, email, first and last names.
	 * @return int Moodle user ID on success, 0 on failure.
	 * @throws \Exception If there is an error during user creation or API call.
	 */
	public function create_user( $enroll_data ) {
		$user_id = absint( $enroll_data['purchaser_id'] ?? 0 );
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

			$email      = sanitize_email( $enroll_data['user_email'] ?? '' );
			$first_name = sanitize_text_field( $enroll_data['first_name'] ?? 'User' );
			$last_name  = sanitize_text_field( $enroll_data['last_name'] ?? 'User' );

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
	private function generate_password( $length = 12 ) {
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
		return apply_filters( 'moowoodle_moodle_users_data', $user_data, $this->order );
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

		$startdate = get_post_meta( $product->get_id(), '_course_startdate', true );
		$enddate   = get_post_meta( $product->get_id(), '_course_enddate', true );

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
	 * Insert or update an enrollment record.
	 *
	 * @param array $args Enrollment data. Must include 'user_email'. If 'id' is present, updates the record.
	 * @return int|false Enrollment ID on success, false on failure.
	 */
	public static function update_enrollment( $args ) {
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
	 * Retrieves enrollment records based on the given conditions.
	 *
	 * @param string $where SQL WHERE clause to filter enrollment records.
	 * @return array List of enrollment records.
	 */
	public static function get_enrollments( $where ) {
		global $wpdb;

		$table          = $wpdb->prefix . Util::TABLES['enrollment'];
		$query_segments = array();

		// Default SELECT clause.
		$select = '*';

		// Use grouped select if requested.
		if ( ! empty( $where['group_by_email'] ) ) {
			$select = "
				user_email,
				user_id,
				GROUP_CONCAT(DISTINCT JSON_OBJECT('group_item_id', group_item_id, 'course_id', course_id)) AS enrollments,
				COUNT(*) as enrollment_count
			";
		} elseif ( isset( $where['select'] ) ) {
			$select = esc_sql( $where['select'] );
		}

		// Filters.
		if ( isset( $where['id'] ) ) {
			$query_segments[] = $wpdb->prepare( 'id = %d', $where['id'] );
		}

		if ( isset( $where['user_id'] ) ) {
			$query_segments[] = $wpdb->prepare( 'user_id = %d', $where['user_id'] );
		}

		if ( isset( $where['user_email'] ) && '' !== $where['user_email'] ) {
			$email            = sanitize_email( strtolower( trim( $where['user_email'] ) ) );
			$query_segments[] = $wpdb->prepare( 'LOWER(user_email) = %s', $email );
		}

		if ( isset( $where['course_id'] ) ) {
			$query_segments[] = $wpdb->prepare( 'course_id = %d', $where['course_id'] );
		}

		if ( ! empty( $where['meta_query'] ) ) {
			foreach ( $where['meta_query'] as $meta ) {
				if ( ! empty( $meta['key'] ) ) {
					$key     = $meta['key'];
					$compare = strtoupper( $meta['compare'] );
					$value   = $meta['value'];

					if ( in_array( $compare, array( '=', '!=', '>', '<', '>=', '<=', 'LIKE', 'NOT LIKE' ), true ) ) {
						$query_segments[] = "`$key` $compare " . $wpdb->prepare( '%s', $value );
					}
				}
			}
		}

		if ( isset( $where['cohort_id'] ) ) {
			$query_segments[] = $wpdb->prepare( 'cohort_id = %d', $where['cohort_id'] );
		}

		if ( isset( $where['group_id'] ) ) {
			$query_segments[] = $wpdb->prepare( 'group_id = %d', $where['group_id'] );
		}

		if ( isset( $where['order_id'] ) ) {
			$query_segments[] = $wpdb->prepare( 'order_id = %d', $where['order_id'] );
		}

		if ( isset( $where['group_item_id'] ) ) {
			$query_segments[] = $wpdb->prepare( 'group_item_id = %d', $where['group_item_id'] );
		}

		if ( isset( $where['status'] ) && '' !== $where['status'] ) {
			$query_segments[] = $wpdb->prepare( 'status = %s', $where['status'] );
		}

		if ( isset( $where['date'] ) && '' !== $where['date'] ) {
			$query_segments[] = $wpdb->prepare( 'date = %s', $where['date'] );
		}

		if ( ! empty( $where['ids'] ) ) {
			$ids              = implode( ',', array_map( 'intval', $where['ids'] ) );
			$query_segments[] = "id IN ($ids)";
		}

		if ( ! empty( $where['group_item_ids'] ) ) {
			$ids              = implode( ',', array_map( 'intval', $where['group_item_ids'] ) );
			$query_segments[] = "group_item_id IN ($ids)";
		}

		// Build query.
		$query = "SELECT $select FROM $table";

		if ( ! empty( $query_segments ) ) {
			$query .= ' WHERE ' . implode( ' AND ', $query_segments );
		}

		if ( ! empty( $where['group_by_email'] ) ) {
			$query .= ' GROUP BY user_email, user_id';
		}

		if ( isset( $where['limit'] ) && isset( $where['offset'] ) ) {
			$query .= $wpdb->prepare( ' LIMIT %d OFFSET %d', intval( $where['limit'] ), intval( $where['offset'] ) );
		}

		$results = $wpdb->get_results( $query, ARRAY_A ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared

		// Decode JSON enrollments for grouped results.
		if ( ! empty( $where['group_by_email'] ) ) {
			foreach ( $results as &$row ) {
				$row['enrollments'] = isset( $row['enrollments'] )
					? json_decode( '[' . $row['enrollments'] . ']', true )
					: array();
			}
		}

		return $results;
	}
}
