<?php

namespace MultiVendorX\StoreReview;

use MultiVendorX\StoreReview\Util;

defined( 'ABSPATH' ) || exit;

class MultiVendorX_REST_Store_Review_Controller extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'review';

    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ), 10 );
    }

    public function register_routes() {
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base,
            array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
				),
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'create_item' ),
					'permission_callback' => array( $this, 'create_item_permissions_check' ),
				),
			)
        );

        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)',
            array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_item' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
					'args'                => array(
						'id' => array( 'required' => true ),
					),
				),
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_item' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
				),
				array(
					'methods'             => \WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete_item' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
					'args'                => array(
						'id' => array( 'required' => true ),
					),
				),
			)
        );
    }

    public function get_items_permissions_check( $request ) {
        return current_user_can( 'read' ) || current_user_can( 'edit_stores' );
    }

    // POST permission
    public function create_item_permissions_check( $request ) {
        return current_user_can( 'create_stores' );
    }

    public function update_item_permissions_check( $request ) {
        return current_user_can( 'edit_stores' );
    }

    /**
     * Get review items with optional pagination, date filters, and counters
     */
    public function get_items( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            // Log the error
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log(
                    'MVX REST Error: ' .
                    'Code=' . $error->get_error_code() . '; ' .
                    'Message=' . $error->get_error_message() . '; ' .
                    'Data=' . wp_json_encode( $error->get_error_data() ) . "\n\n"
                );
            }

            return $error;
        }
        try {
            // --- Step 2: Collect Request Parameters ---
            $store_id       = $request->get_param( 'store_id' );
            $limit          = max( intval( $request->get_param( 'row' ) ), 10 );
            $page           = max( intval( $request->get_param( 'page' ) ), 1 );
            $offset         = ( $page - 1 ) * $limit;
            $start_date     = sanitize_text_field( $request->get_param( 'startDate' ) );
            $end_date       = sanitize_text_field( $request->get_param( 'endDate' ) );
            $count          = $request->get_param( 'count' );
            $status         = sanitize_text_field( $request->get_param( 'status' ) );
            $orderBy        = sanitize_text_field( $request->get_param( 'orderBy' ) );
            $order          = sanitize_text_field( $request->get_param( 'order' ) );
            $overall_rating = $request->get_param( 'overall_rating' );
            $args           = array();

            // --- Step 3: Apply Store Filter ---
            if ( $store_id ) {
                $args['store_id'] = intval( $store_id );
            }

            // --- Step 4: Handle Count-Only Request ---
            if ( $count ) {
                $args['count'] = true;
                $total_count   = Util::get_review_information( $args );
                return rest_ensure_response( (int) $total_count );
            }

            // --- Step 5: Add Filters (status, date, pagination) ---
            if ( $status ) {
                $args['status'] = $status;
            }

            $args['limit']  = $limit;
            $args['offset'] = $offset;

            if ( $start_date ) {
                $args['start_date'] = $start_date;
            }

            if ( $end_date ) {
                $args['end_date'] = $end_date;
            }

            // --- Step 5.2: Filter by Overall Rating (like "4 stars & up") ---
            if ( $overall_rating !== null && $overall_rating !== '' ) {
                $rating = floatval( $overall_rating );

                // Prevent invalid or below 1 ratings
                if ( $rating < 1 ) {
                    $rating = 1;
                }

                // Pass to query args
                $args['overall_rating'] = $rating;
            }

            // --- Step 5.1: Add Sorting ---
            if ( ! empty( $orderBy ) && ! empty( $order ) ) {
                $args['order_by']  = $orderBy;
                $args['order_dir'] = ! empty( $order ) ? strtoupper( $order ) : 'DESC';
            } else {
                // Fallback default sort
                $args['order_by']  = 'date_created';
                $args['order_dir'] = 'DESC';
            }

            // --- Step 6: Fetch Review Data ---
            $reviews = Util::get_review_information( $args );

            // --- Step 7: Format Data for Response ---
            $formatted = array_map(
                function ( $review ) {
                    $customer      = get_userdata( $review['customer_id'] );
                    $customer_name = $customer ? $customer->display_name : __( 'Guest', 'multivendorx' );
                    $store_obj     = MultivendorX()->store->get_store_by_id( (int) $review['store_id'] );

                    return array(
                        'review_id'      => (int) $review['review_id'],
                        'store_id'       => (int) $review['store_id'],
                        'store_name'     => $store_obj->get( 'name' ),
                        'customer_id'    => (int) $review['customer_id'],
                        'customer_name'  => $customer_name,
                        'order_id'       => (int) $review['order_id'],
                        'overall_rating' => round( floatval( $review['overall_rating'] ), 2 ),
                        'review_title'   => sanitize_text_field( $review['review_title'] ),
                        'review_content' => wp_strip_all_tags( $review['review_content'] ),
                        'status'         => ucfirst( sanitize_text_field( $review['status'] ) ),
                        'reported'       => (int) $review['reported'],
                        'reply'          => $review['reply'] ?? '',
                        'reply_date'     => $review['reply_date'] ?? '',
                        'date_created'   => $review['date_created'],
                        'date_modified'  => $review['date_modified'],
                    );
                },
                $reviews ?: array()
            );

            // --- Step 8: Get Status Counters ---
            $base_args = $args;
            unset( $base_args['limit'], $base_args['offset'], $base_args['status'] );

            if ( current_user_can( 'manage_options' ) ) {
                unset( $base_args['store_id'] );
            }

            $base_args['count'] = true;

            $all_args  = $base_args;
            $all_count = Util::get_review_information( $all_args );

            $pending_args           = $base_args;
            $pending_args['status'] = 'pending';
            $pending_count          = Util::get_review_information( $pending_args );

            $approved_args           = $base_args;
            $approved_args['status'] = 'approved';
            $approved_count          = Util::get_review_information( $approved_args );

            $rejected_args           = $base_args;
            $rejected_args['status'] = 'rejected';
            $rejected_count          = Util::get_review_information( $rejected_args );

            // --- Step 9: Return Final Response ---
            return rest_ensure_response(
                array(
                    'items'    => $formatted,
                    'all'      => (int) $all_count,
                    'pending'  => (int) $pending_count,
                    'approved' => (int) $approved_count,
                    'rejected' => (int) $rejected_count,
                )
            );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log(
                'MVX REST Exception: ' .
                'Message=' . $e->getMessage() . '; ' .
                'File=' . $e->getFile() . '; ' .
                'Line=' . $e->getLine() . "\n\n"
            );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }

    public function create_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            // Log the error
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log(
                    'MVX REST Error: ' .
                    'Code=' . $error->get_error_code() . '; ' .
                    'Message=' . $error->get_error_message() . '; ' .
                    'Data=' . wp_json_encode( $error->get_error_data() ) . "\n\n"
                );
            }

            return $error;
        }
    }

    public function get_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            // Log the error
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log(
                    'MVX REST Error: ' .
                    'Code=' . $error->get_error_code() . '; ' .
                    'Message=' . $error->get_error_message() . '; ' .
                    'Data=' . wp_json_encode( $error->get_error_data() ) . "\n\n"
                );
            }

            return $error;
        }
        try {
            return rest_ensure_response( $data );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log(
                'MVX REST Exception: ' .
                'Message=' . $e->getMessage() . '; ' .
                'File=' . $e->getFile() . '; ' .
                'Line=' . $e->getLine() . "\n\n"
            );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }

    public function update_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            // Log the error
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log(
                    'MVX REST Error: ' .
                    'Code=' . $error->get_error_code() . '; ' .
                    'Message=' . $error->get_error_message() . '; ' .
                    'Data=' . wp_json_encode( $error->get_error_data() ) . "\n\n"
                );
            }

            return $error;
        }
        try {
            // Get review ID
            $id = absint( $request->get_param( 'id' ) );
            if ( ! $id ) {
                return new \WP_Error(
                    'invalid_id',
                    __( 'Invalid review ID', 'multivendorx' ),
                    array( 'status' => 400 )
                );
            }

            // Fetch review info (replace this with your correct util function)
            $review = reset( Util::get_review_information( array( 'id' => $id ) ) );
            if ( ! $review ) {
                return new \WP_Error(
                    'not_found',
                    __( 'Review not found', 'multivendorx' ),
                    array( 'status' => 404 )
                );
            }

            // Fields that can be updated
            $reply  = $request->get_param( 'reply' );
            $status = $request->get_param( 'status' );

            $data_to_update = array();

            // Save reply text
            if ( isset( $reply ) ) {
                $data_to_update['reply']      = sanitize_textarea_field( $reply );
                $data_to_update['reply_date'] = current_time( 'mysql' );
            }

            // Save status (Pending / Approved / Rejected)
            if ( isset( $status ) ) {
                $allowed = array( 'Pending', 'Approved', 'Rejected' );
                if ( in_array( $status, $allowed, true ) ) {
                    $data_to_update['status'] = sanitize_text_field( $status );
                } else {
                    return new \WP_Error(
                        'invalid_status',
                        __( 'Invalid status value', 'multivendorx' ),
                        array( 'status' => 400 )
                    );
                }
            }

            if ( empty( $data_to_update ) ) {
                return new \WP_Error(
                    'nothing_to_update',
                    __( 'No valid fields to update', 'multivendorx' ),
                    array( 'status' => 400 )
                );
            }

            // 💾 Save to DB (replace with your helper function)
            $updated = Util::update_review( $id, $data_to_update );

            if ( ! $updated ) {
                return rest_ensure_response( array( 'success' => false ) );
            }

            return rest_ensure_response(
                array(
                    'success' => true,
                    'data'    => array(
                        'id'      => $id,
                        'updated' => $data_to_update,
                    ),
                )
            );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log(
                'MVX REST Exception: ' .
                'Message=' . $e->getMessage() . '; ' .
                'File=' . $e->getFile() . '; ' .
                'Line=' . $e->getLine() . "\n\n"
            );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }


    public function delete_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            // Log the error
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log(
                    'MVX REST Error: ' .
                    'Code=' . $error->get_error_code() . '; ' .
                    'Message=' . $error->get_error_message() . '; ' .
                    'Data=' . wp_json_encode( $error->get_error_data() ) . "\n\n"
                );
            }

            return $error;
        }
        try {
            // 🔹 Get review ID
            $id = absint( $request->get_param( 'id' ) );
            if ( ! $id ) {
                return new \WP_Error(
                    'invalid_id',
                    __( 'Invalid review ID', 'multivendorx' ),
                    array( 'status' => 400 )
                );
            }

            // 🔹 Fetch the review (to confirm it exists)
            $review = reset( Util::get_review_information( array( 'review_id' => $id ) ) );
            if ( ! $review ) {
                return new \WP_Error(
                    'not_found',
                    __( 'Review not found', 'multivendorx' ),
                    array( 'status' => 404 )
                );
            }

            // Delete via Util helper (this also deletes rating rows)
            $deleted = Util::delete_review( $id );

            if ( ! $deleted ) {
                return new \WP_Error(
                    'delete_failed',
                    __( 'Failed to delete review', 'multivendorx' ),
                    array( 'status' => 500 )
                );
            }

            // Success response
            return rest_ensure_response( array( 'success' => true ) );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log(
                'MVX REST Exception: ' .
                'Message=' . $e->getMessage() . '; ' .
                'File=' . $e->getFile() . '; ' .
                'Line=' . $e->getLine() . "\n\n"
            );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }
}
