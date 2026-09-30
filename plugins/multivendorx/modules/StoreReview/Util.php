<?php
/**
 * MultiVendorX StoreReview Module Util Class
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\StoreReview;

use MultiVendorX\Utill;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * MultiVendorX StoreReview Module Utility Class.
 *
 * @class       Module class
 * @version     5.0.0
 * @author      MultiVendorX
 */
class Util {

	/**
	 * Largest accepted review image, in bytes.
	 */
	const MAX_REVIEW_IMAGE_SIZE = 5 * MB_IN_BYTES;

	/**
	 * Sanitize submitted per-parameter ratings, dropping anything outside 1-5.
	 *
	 * @param mixed $ratings Raw ratings keyed by parameter name.
	 * @return array Sanitized ratings (parameter => int 1-5).
	 */
	public static function sanitize_rating_values( $ratings ) {
		$sanitized_ratings = array();

		foreach ( (array) $ratings as $parameter => $rating ) {
			$parameter = sanitize_text_field( (string) $parameter );
			$rating    = absint( $rating );

			if ( '' === $parameter || $rating < 1 || $rating > 5 ) {
				continue;
			}

			$sanitized_ratings[ $parameter ] = $rating;
		}

		return $sanitized_ratings;
	}

	/**
	 * Upload submitted review images (JPEG/PNG/GIF/WebP only, size-capped).
	 *
	 * @param array $review_images A $_FILES-style entry (name/tmp_name/error/size, each an array).
	 * @return array URLs of the uploaded images.
	 */
	public static function upload_review_images( $review_images ) {
		$review_images = (array) $review_images;
		$file_names    = array_map( 'sanitize_file_name', (array) ( $review_images['name'] ?? array() ) );
		$file_tmp      = array_map( 'sanitize_text_field', (array) ( $review_images['tmp_name'] ?? array() ) );
		$file_errors   = array_map( 'absint', (array) ( $review_images['error'] ?? array() ) );
		$file_sizes    = array_map( 'absint', (array) ( $review_images['size'] ?? array() ) );

		if ( empty( $file_names ) ) {
			return array();
		}

		require_once ABSPATH . 'wp-admin/includes/file.php';

		$allowed_image_mimes = array(
			'jpg|jpeg|jpe' => 'image/jpeg',
			'gif'          => 'image/gif',
			'png'          => 'image/png',
			'webp'         => 'image/webp',
		);

		$uploaded_image_urls = array();

		foreach ( $file_names as $index => $file_name ) {
			$tmp_path = $file_tmp[ $index ] ?? '';
			$size     = $file_sizes[ $index ] ?? 0;

			if ( '' === $file_name || '' === $tmp_path
				|| UPLOAD_ERR_OK !== ( $file_errors[ $index ] ?? UPLOAD_ERR_NO_FILE )
				|| $size > self::MAX_REVIEW_IMAGE_SIZE
				|| ! is_uploaded_file( $tmp_path )
			) {
				continue;
			}

			// Check the real file contents, not the client-supplied type.
			$file_type = wp_check_filetype_and_ext( $tmp_path, $file_name, $allowed_image_mimes );
			if ( empty( $file_type['type'] ) ) {
				continue;
			}

			$upload = wp_handle_upload(
				array(
					'name'     => $file_type['proper_filename'] ? $file_type['proper_filename'] : $file_name,
					'type'     => $file_type['type'],
					'tmp_name' => $tmp_path,
					'error'    => UPLOAD_ERR_OK,
					'size'     => $size,
				),
				array(
					'test_form' => false,
					'mimes'     => $allowed_image_mimes,
				)
			);

			if ( empty( $upload['error'] ) && ! empty( $upload['url'] ) ) {
				$uploaded_image_urls[] = esc_url_raw( $upload['url'] );
			}
		}

		return $uploaded_image_urls;
	}

    /**
     * Check if a user has purchased from a specific store
     *
     * @param int $store_id Store ID.
     * @param int $user_id User ID.
     */
    public static function is_verified_buyer( $store_id, $user_id ) {
        if ( empty( $store_id ) || empty( $user_id ) ) {
            return 0;
        }

        // Fetch all relevant orders for this user.
        $orders = wc_get_orders(
            array(
				'customer_id' => $user_id,
				'status'      => array( 'completed', 'processing', 'on-hold' ),
				'limit'       => -1,
				'return'      => 'ids',
            )
        );

        if ( empty( $orders ) ) {
            return 0;
        }

        foreach ( $orders as $order_id ) {
            $order = wc_get_order( $order_id );
            if ( ! $order ) {
                continue;
            }

            // Loop through all products in the order.
            foreach ( $order->get_items( 'line_item' ) as $item_id => $item ) {
                $product_id = $item->get_product_id();
                $product    = wc_get_product( $product_id );
                if ( ! $product ) {
					continue;
                }

                // Get store ID from product meta or item meta.
                $product_store_id = get_post_meta( $product_id, Utill::POST_META_SETTINGS['store_id'], true );
                if ( empty( $product_store_id ) ) {
                    $product_store_id = $item->get_meta( Utill::POST_META_SETTINGS['store_id'] );
                }

                // Match store ID.
                if ( (int) $product_store_id === (int) $store_id ) {
                    return (int) $order_id; // Verified buyer — return that order ID.
                }
            }
        }

        return 0; // Not a verified buyer.
    }

	/**
	 * Check if user has already submitted a review for a store
	 *
	 * @param int $store_id Store ID.
	 * @param int $user_id User ID.
	 */
	public static function has_reviewed( $store_id, $user_id ) {
		global $wpdb;
		$table_review = $wpdb->prefix . Utill::TABLES['review'];

		$result = (bool) $wpdb->get_var( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->prepare(
                'SELECT COUNT(*) FROM %i WHERE store_id = %d AND customer_id = %d',
                $table_review,
                $store_id,
                $user_id
            )
		);

		if ( ! empty( $wpdb->last_error ) && MultiVendorX()->show_advanced_log ) {
			MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
		}
		return $result;
	}

	/**
	 * Insert a new review
	 *
	 * @param int    $store_id Store ID.
	 * @param int    $user_id User ID.
	 * @param string $title Review title.
	 * @param string $content Review content.
	 * @param int    $overall Overall rating.
	 * @param int    $order_id Optional. Order ID related to the review.
	 * @param array  $images Optional. Array of image URLs attached to the review.
	 */
	public static function insert_review( $store_id, $user_id, $title, $content, $overall, $order_id = 0, $images = array() ) {
		global $wpdb;
		$table_review = $wpdb->prefix . Utill::TABLES['review'];

		$wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
            $table_review,
            array(
				'store_id'       => $store_id,
				'customer_id'    => $user_id,
				'order_id'       => intval( $order_id ),
				'overall_rating' => $overall,
				'review_title'   => $title,
				'review_content' => $content,
				'review_images'  => ! empty( $images ) ? wp_json_encode( $images ) : null,
				'status'         => 'pending',
				'date_created'   => current_time( 'mysql' ),
				'user_ip'        => getenv( 'REMOTE_ADDR' ),
            )
		);

		if ( ! empty( $wpdb->last_error ) && MultiVendorX()->show_advanced_log ) {
			MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
		}

		return $wpdb->insert_id;
	}

	/**
	 * Insert multiple parameter ratings for a review
	 *
	 * @param int   $review_id Review ID.
	 * @param array $ratings Associative array where keys are parameter names and values are ratings.
	 */
	public static function insert_ratings( $review_id, $ratings ) {
		global $wpdb;
		$table_rating = $wpdb->prefix . Utill::TABLES['rating'];

		foreach ( $ratings as $param => $value ) {
			if ( $value ) {
				$wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
                    $table_rating,
                    array(
						'review_id'    => $review_id,
						'parameter'    => sanitize_text_field( $param ),
						'rating_value' => intval( $value ),
                    )
				);
			}
		}

		if ( ! empty( $wpdb->last_error ) && MultiVendorX()->show_advanced_log ) {
			MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
		}
	}

	/**
	 * Fetch all approved reviews for a store
	 *
	 * @param int $store_id Store ID.
	 * @param int $limit Number of reviews to fetch.
	 */
	public static function get_reviews_by_store( $store_id, $limit = 20 ) {
		global $wpdb;
		$table_review = $wpdb->prefix . Utill::TABLES['review'];

		$result = $wpdb->get_results( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->prepare(
                "SELECT * FROM %i WHERE store_id = %d AND status = 'approved' ORDER BY date_created DESC LIMIT %d",
                $table_review,
                $store_id,
                $limit
            )
		);

		if ( ! empty( $wpdb->last_error ) && MultiVendorX()->show_advanced_log ) {
			MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
		}

		return $result;
	}

	/**
	 * Get average rating per parameter
	 *
	 * @param int   $store_id Store ID.
	 * @param array $parameters Array of parameter names.
	 */
	public static function get_avg_ratings( $store_id, $parameters ) {
		global $wpdb;
		$table_review = $wpdb->prefix . Utill::TABLES['review'];
		$table_rating = $wpdb->prefix . Utill::TABLES['rating'];

		$averages = array();
		foreach ( $parameters as $param ) {
			$param_value = is_array( $param ) ? ( $param['value'] ?? '' ) : $param;
			if ( empty( $param_value ) ) {
				continue;
			}

			$avg = $wpdb->get_var( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $wpdb->prepare(
                    "SELECT AVG(rating_value) FROM %i
        INNER JOIN %i ON %i.review_id = %i.review_id
        WHERE %i.store_id = %d
        AND %i.parameter = %s
        AND %i.status = 'approved'",
                    $table_rating,
                    $table_review,
                    $table_review,
                    $table_rating,
                    $table_review,
                    $store_id,
                    $table_rating,
                    $param_value,
                    $table_review
                )
			);

			$averages[ $param_value ] = $avg ? round( $avg, 2 ) : 0;
		}

		if ( ! empty( $wpdb->last_error ) && MultiVendorX()->show_advanced_log ) {
			MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
		}

		return $averages;
	}

	/**
	 * Get overall store rating
	 *
	 * @param int $store_id Store ID.
	 */
	public static function get_overall_rating( $store_id ) {
		global $wpdb;
		$table_review = $wpdb->prefix . Utill::TABLES['review'];

		$overall = $wpdb->get_var( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->prepare(
                "SELECT AVG(overall_rating) FROM %i WHERE store_id = %d AND status = 'approved'",
                $table_review,
                $store_id
            )
		);

		if ( ! empty( $wpdb->last_error ) && MultiVendorX()->show_advanced_log ) {
			MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
		}

		if ( null === $overall ) {
			return 0.00;
		}

		return round( (float) $overall, 2 );
	}

	/**
	 * Get user's review status for a store
	 *
	 * @param int $store_id Store ID.
	 * @param int $user_id User ID.
	 */
	public static function get_user_review_status( $store_id, $user_id ) {
		global $wpdb;
		$table_review = $wpdb->prefix . Utill::TABLES['review'];

		$result = $wpdb->get_var( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->prepare(
                "SELECT status FROM %i
        WHERE store_id = %d
        AND customer_id = %d
        ORDER BY date_created DESC
        LIMIT 1",
                $table_review,
                $store_id,
                $user_id
            )
		);

		if ( ! empty( $wpdb->last_error ) && MultiVendorX()->show_advanced_log ) {
			MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
		}
		return $result;
	}

    /**
     * Fetch review information from database.
     * Supports filtering by ID, store, customer, date range, pagination, and count.
     *
     * @param array $args Query arguments.
     */
    public static function query_reviews( $args ) {
        global $wpdb;
        $where = array();

        // Filter by review IDs.
        if ( isset( $args['review_id'] ) ) {
            $ids     = is_array( $args['review_id'] ) ? $args['review_id'] : array( $args['review_id'] );
            $ids     = implode( ',', array_map( 'intval', $ids ) );
            $where[] = "review_id IN ($ids)";
        }

        // Filter by store_id.
        if ( isset( $args['store_id'] ) ) {
            $where[] = 'store_id = ' . intval( $args['store_id'] );
        }

        // Filter by customer_id.
        if ( isset( $args['customer_id'] ) ) {
            $where[] = 'customer_id = ' . intval( $args['customer_id'] );
        }

        // Filter by order_id.
        if ( isset( $args['order_id'] ) ) {
            $where[] = 'order_id = ' . intval( $args['order_id'] );
        }

        // Filter by review status (pending, approved, rejected, etc.).
        if ( isset( $args['status'] ) && '' !== $args['status'] ) {
            $where[] = "status = '" . esc_sql( $args['status'] ) . "'";
        }

        // Filter by reported flag.
        if ( isset( $args['reported'] ) ) {
            $where[] = 'reported = ' . intval( $args['reported'] );
        }

        // Filter by start_date.
        if ( ! empty( $args['start_date'] ) ) {
            $where[] = "date_created >= '" . esc_sql( $args['start_date'] ) . "'";
        }

        // Filter by end_date.
        if ( ! empty( $args['end_date'] ) ) {
            $where[] = "date_created <= '" . esc_sql( $args['end_date'] ) . "'";
        }
        // Filter by overall_rating ("X stars & up" style).
        if ( isset( $args['overall_rating'] ) && '' !== $args['overall_rating'] ) {
            $rating = floatval( $args['overall_rating'] );

            // Handle invalid ratings gracefully.
            if ( $rating < 1 ) {
                $rating = 1;
            }

            // Flipkart-style filter: show reviews with rating >= selected value.
            $where[] = "overall_rating >= {$rating}";
        }

        // Table name (update according to your DB structure).
        $table = $wpdb->prefix . Utill::TABLES['review'];

        // Build query.
        if ( isset( $args['count'] ) ) {
            $query = $wpdb->prepare( 'SELECT COUNT(*) FROM %i', $table );
        } else {
            $query = $wpdb->prepare( 'SELECT * FROM %i', $table );
        }

        // Add WHERE conditions.
        if ( ! empty( $where ) ) {
            $condition = $args['condition'] ?? ' AND ';
            $query    .= ' WHERE ' . implode( $condition, $where );
        }

        // Order results safely.
        if ( ! isset( $args['count'] ) ) {
            $allowed_columns = array( 'date_created', 'overall_rating', 'status', 'store_id', 'customer_id' );
            $order_by        = isset( $args['order_by'] ) && in_array( $args['order_by'], $allowed_columns, true )
                ? $args['order_by']
                : 'date_created';

            $order_dir = isset( $args['order_dir'] ) && in_array( strtoupper( $args['order_dir'] ), array( 'ASC', 'DESC' ), true )
                ? strtoupper( $args['order_dir'] )
                : 'DESC';

            $query .= ' ORDER BY ' . esc_sql( $order_by ) . ' ' . esc_sql( $order_dir );
        }

        // Limit & offset.
        if ( isset( $args['limit'] ) && isset( $args['offset'] ) && ! isset( $args['count'] ) ) {
            $query .= ' LIMIT ' . intval( $args['limit'] ) . ' OFFSET ' . intval( $args['offset'] );
        }

        // Run query first (no return yet).
		$results = isset( $args['count'] )
		? $wpdb->get_var( $query ) // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
		: $wpdb->get_results( $query, ARRAY_A ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared

        // Log DB error if any.
        if ( ! empty( $wpdb->last_error ) && MultiVendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        }

        // Now return results AFTER logging.
        return isset( $args['count'] )
            ? (int) ( $results ?? 0 )
            : ( $results ?? array() );
    }

	/**
	 * Update a review.
	 *
	 * @param int   $id               The review ID to update.
	 * @param array $fields_to_update The data to update.
	 */
	public static function update_review( $id, $fields_to_update ) {
		global $wpdb;

		$table = $wpdb->prefix . Utill::TABLES['review'];

		if ( empty( $fields_to_update ) ) {
			return false;
		}

		$update_data   = array();
		$update_format = array();

		if ( isset( $fields_to_update['reply'] ) ) {
			$update_data['reply'] = sanitize_textarea_field( $fields_to_update['reply'] );
			$update_format[]      = '%s';
		}

		if ( isset( $fields_to_update['reply_date'] ) ) {
			$update_data['reply_date'] = sanitize_text_field( $fields_to_update['reply_date'] );
			$update_format[]           = '%s';
		}

		if ( isset( $fields_to_update['status'] ) ) {
			$update_data['status'] = sanitize_text_field( $fields_to_update['status'] );
			$update_format[]       = '%s';
		}

		if ( empty( $update_data ) ) {
			return false;
		}

		$where        = array( 'review_id' => intval( $id ) );
		$where_format = array( '%d' );

		$updated = $wpdb->update( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $table,
            $update_data,
            $where,
            $update_format,
            $where_format
		);

		if ( ! empty( $wpdb->last_error ) && MultiVendorX()->show_advanced_log ) {
			MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
		}

		if ( false === $updated ) {
			return false;
		}

		return true;
	}

	/**
	 * Delete a review and its associated ratings.
	 *
	 * @param int $id The review ID to delete.
	 */
	public static function delete_review( $id ) {
		global $wpdb;

		$review_table = $wpdb->prefix . Utill::TABLES['review'];
		$rating_table = $wpdb->prefix . Utill::TABLES['rating'];

		$id = intval( $id );
		if ( ! $id ) {
			return false;
		}

		// Begin transaction (optional but good practice if supported).
		$wpdb->query( 'START TRANSACTION' ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared

		// Delete from ratings first.
		$wpdb->delete( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $rating_table,
            array( 'review_id' => $id ),
            array( '%d' )
		);

		// Delete from main review table.
		$deleted = $wpdb->delete( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $review_table,
            array( 'review_id' => $id ),
            array( '%d' )
		);

		if ( false === $deleted ) {
			$wpdb->query( 'ROLLBACK' ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
			return false;
		}

		$wpdb->query( 'COMMIT' ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared

		if ( ! empty( $wpdb->last_error ) && MultiVendorX()->show_advanced_log ) {
			MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
		}

		return true;
	}
}
