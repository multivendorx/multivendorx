<?php

namespace MultiVendorX\RestAPI\Controllers;

use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Store\Store;
use MultiVendorX\Utill;
use MultiVendorX\Store\SocialVerification;
use MultiVendorX\Commission\CommissionUtil;
use MultiVendorX\StoreReview\Util;
use MultiVendorX\Transaction\Transaction;

defined( 'ABSPATH' ) || exit;

class MultiVendorX_REST_Store_Controller extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'store';

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
			)
        );

        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base . '/social-profiles',
            array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_social_profiles' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
				),
			)
        );

        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base . '/connect-social',
            array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'connect_social_profile' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
				),
			)
        );

        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base . '/disconnect-social',
            array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'disconnect_social_profile' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
				),
			)
        );

        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base . '/social-callback',
            array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'handle_social_callback' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
				),
			)
        );

        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/states/(?P<country>[A-Z]{2})',
            array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_states_by_country' ),
				'permission_callback' => array( $this, 'get_items_permissions_check' ),
			)
        );
    }

    /**
     * Handle social verification callback
     */
    public function handle_social_callback( $request ) {
        try {
            $params   = $request->get_params();
            $provider = sanitize_text_field( $params['provider'] ?? '' );
            $code     = sanitize_text_field( $params['code'] ?? '' );
            $state    = sanitize_text_field( $params['state'] ?? '' );

            if ( empty( $provider ) || empty( $code ) ) {
                return new \WP_Error( 'invalid_params', __( 'Missing required parameters', 'multivendorx' ), array( 'status' => 400 ) );
            }

            $user_id = get_current_user_id();
            if ( ! $user_id ) {
                return new \WP_Error( 'unauthorized', __( 'You must be logged in', 'multivendorx' ), array( 'status' => 401 ) );
            }

            $social_verification = $this->get_social_verification();
            $user_data           = $social_verification->process_oauth_callback( $provider, $code, $params );

            if ( $user_data ) {
                $social_verification->save_social_connection( $user_id, $provider, $user_data );

                return rest_ensure_response(
                    array(
						'success' => true,
						'message' => ucfirst( $provider ) . ' account connected successfully!',
						'data'    => $user_data,
                    )
                );
            } else {
                return new \WP_Error( 'verification_failed', __( 'Failed to verify social account', 'multivendorx' ), array( 'status' => 400 ) );
            }
        } catch ( \Exception $e ) {
            return new \WP_Error( 'server_error', __( 'Failed to process social verification', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }
    function get_social_verification() {
        static $instance = null;

        if ( is_null( $instance ) ) {
            $instance = new SocialVerification();
        }

        return $instance;
    }

    public function get_social_profiles( $request ) {
        try {
            $user_id             = get_current_user_id();
            $social_verification = $this->get_social_verification();
            $profiles            = $social_verification->get_social_profiles( $user_id );

            return rest_ensure_response(
                array(
					'success' => true,
					'data'    => $profiles,
                )
            );
        } catch ( \Exception $e ) {
            return new \WP_Error( 'server_error', __( 'Failed to fetch social profiles', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }

    public function connect_social_profile( $request ) {
        try {
            $params   = $request->get_json_params();
            $provider = sanitize_text_field( $params['provider'] ?? '' );

            if ( empty( $provider ) ) {
                return new \WP_Error( 'missing_provider', __( 'Provider is required', 'multivendorx' ), array( 'status' => 400 ) );
            }

            $social_verification = $this->get_social_verification();
            $auth_url            = $social_verification->get_auth_url( $provider );

            if ( ! $auth_url ) {
                return new \WP_Error( 'invalid_provider', __( 'Invalid provider or provider not configured', 'multivendorx' ), array( 'status' => 400 ) );
            }

            return rest_ensure_response(
                array(
					'success' => true,
					'data'    => array(
						'redirect_url' => $auth_url,
					),
                )
            );
        } catch ( \Exception $e ) {
            return new \WP_Error( 'server_error', __( 'Failed to connect social profile', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }

    public function disconnect_social_profile( $request ) {
        try {
            $params   = $request->get_json_params();
            $provider = sanitize_text_field( $params['provider'] ?? '' );

            if ( empty( $provider ) ) {
                return new \WP_Error( 'missing_provider', __( 'Provider is required', 'multivendorx' ), array( 'status' => 400 ) );
            }

            $user_id             = get_current_user_id();
            $social_verification = $this->get_social_verification();
            $success             = $social_verification->disconnect_social_profile( $user_id, $provider );

            if ( $success ) {
                return rest_ensure_response(
                    array(
						'success' => true,
						'message' => __( 'Social profile disconnected successfully', 'multivendorx' ),
                    )
                );
            } else {
                return new \WP_Error( 'disconnect_failed', __( 'Failed to disconnect social profile', 'multivendorx' ), array( 'status' => 400 ) );
            }
        } catch ( \Exception $e ) {
            return new \WP_Error( 'server_error', __( 'Failed to disconnect social profile', 'multivendorx' ), array( 'status' => 500 ) );
        }
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


    public function get_items( $request ) {
        global $wpdb;
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
            $store_registration = $request->get_param( 'store_registration' );

            if ( $store_registration ) {
                $rejected_stores = StoreUtil::get_store_by_primary_owner( 'rejected' );

                $all_stores = array();
                $response   = array();
                $store_data = array();

                foreach ( $rejected_stores as $store ) {
                    $store_object = new \MultiVendorX\Store\Store( $store['ID'] );
                    $all_stores[] = array(
                        'key'   => $store['ID'],
                        'value' => $store['ID'],
                        'label' => $store['name'],
                    );

                    $from_data     = StoreUtil::get_store_registration_form( $store['ID'] );
                    $response[]    = $from_data['all_registration_data'];
                    $store_data [] = array(
                        'id'   => $store['ID'],
                        'note' => unserialize( $store_object->get_meta( 'store_reject_note' ) ),
                    );
                }

                // $response = StoreUtil::get_store_registration_form( reset($rejected_stores)['ID'] );
                return rest_ensure_response(
                    array(
						'all_stores' => $all_stores,
						'response'   => $response,
						'store_data' => $store_data,
                    )
                );
            }

            $slug = $request->get_param( 'slug' );
            if ( ! empty( $slug ) ) {
                $id     = $request->get_param( 'id' );
                $exists = Store::store_slug_exists( $slug, $id ?? 0 );
                return rest_ensure_response( array( 'exists' => $exists > 0 ) );
            }

            if ( $request->get_param( 'pending_withdraw' ) ) {
                return rest_ensure_response( $this->get_stores_with_pending_withdraw( $request ) );
            }

            if ( $request->get_param( 'deactivate' ) ) {
                return rest_ensure_response( $this->get_stores_with_deactivate_requests( $request ) );
            }

            $options = $request->get_param( 'options' );
            if ( $options ) {
                return $this->get_stores_dropdown( $request );
            }

            $status = $request->get_param( 'status' );
            if ( $status ) {
                return $this->get_pending_stores( $request );
            }

            $follower = $request->get_param( 'follower' );
            if ( $follower ) {
                return $this->get_store_follower( $request );
            }

            $count = $request->get_param( 'count' );

            if ( $count ) {
                return StoreUtil::get_store_information( array( 'count' => true ) );
            }

            $limit          = max( intval( $request->get_param( 'row' ) ), 10 );
            $page           = max( intval( $request->get_param( 'page' ) ), 1 );
            $offset         = ( $page - 1 ) * $limit;
            $filter_status  = $request->get_param( 'filter_status' );
            $searchField    = sanitize_text_field( $request->get_param( 'searchField' ) );
            $start_date_raw = sanitize_text_field( $request->get_param( 'startDate' ) );
            $end_date_raw   = sanitize_text_field( $request->get_param( 'endDate' ) );

            // Convert to proper timestamps
            $start_timestamp = ! empty( $start_date_raw ) ? strtotime( str_replace( 'T', ' ', preg_replace( '/\.\d+Z?$/', '', $start_date_raw ) ) ) : false;
            $end_timestamp   = ! empty( $end_date_raw ) ? strtotime( str_replace( 'T', ' ', preg_replace( '/\.\d+Z?$/', '', $end_date_raw ) ) ) : false;

            $start_date = $start_timestamp ? date( 'Y-m-d 00:00:00', $start_timestamp ) : '';
            $end_date   = $end_timestamp ? date( 'Y-m-d 23:59:59', $end_timestamp ) : '';
            $orderBy    = sanitize_text_field( $request->get_param( 'orderBy' ) );
            $order      = sanitize_text_field( $request->get_param( 'order' ) );

            $args = array(
                'limit'  => $limit,
                'offset' => $offset,
            );

            // Pass search to StoreUtil
            if ( $searchField ) {
                $args['searchField'] = $searchField;
            } elseif ( $start_date && $end_date ) {
                // Only apply date filter if no search
                $args['start_date'] = $start_date;
                $args['end_date']   = $end_date;
            }

            if ( ! empty( $filter_status ) ) {
                $args['status'] = $filter_status;
            }
            if ( ! empty( $orderBy ) && ! empty( $order ) ) {
                $args['orderBy'] = $orderBy;
                $args['order']   = $order;
            }

            $filters = $request->get_param( 'filters' );

            if ( ! empty( $filters ) ) {
                $args['orderBy'] = $filters['sort'];

                if ( ! empty( $filters['category'] ) ) {
                    $product_args = array(
                        'return'      => 'ids',
                        'numberposts' => -1,
                        'tax_query'   => array(
                            array(
                                'taxonomy' => 'product_cat',
                                'field'    => 'term_id',
                                'terms'    => $filters['category'],
                            ),
                        ),
                    );

                    $product_ids = wc_get_products( $product_args );
                    $store_ids   = array();

                    foreach ( $product_ids as $product_id ) {
                        $store_id = get_post_meta( $product_id, Utill::POST_META_SETTINGS['store_id'], true );

                        if ( ! empty( $store_id ) ) {
							$store_ids[] = $store_id;
                        }
                    }

                    $store_ids  = array_unique( array_filter( $store_ids ) );
                    $args['ID'] = $store_ids;
                }

                if ( ! empty( $filters['product'] ) ) {
                    $store_id   = get_post_meta( $filters['product'], Utill::POST_META_SETTINGS['store_id'], true );
                    $args['ID'] = $store_id;
                }
            }
            $stores = StoreUtil::get_store_information( $args );

            $formatted_stores = array();
            foreach ( $stores as $store ) {
                $store_meta = Store::get_store_by_id( (int) $store['ID'] );
                $commission = CommissionUtil::get_commission_summary_for_store( (int) $store['ID'] );
                // Get primary owner information using Store object
                $primary_owner_id = StoreUtil::get_primary_owner( $store['ID'] );
                $primary_owner    = get_userdata( $primary_owner_id );

                // Get store image and banner from meta
                $store_image  = $store_meta->meta_data['image'] ?? '';
                $store_banner = $store_meta->meta_data['banner'] ?? '';

                $formatted_stores[] = apply_filters(
                    'multivendorx_stores',
                    array(
                        'id'                  => (int) $store['ID'],
                        'store_name'          => $store['name'],
                        'store_slug'          => $store['slug'],
                        'status'              => $store['status'],
                        'email'               => $store_meta->meta_data['primary_email'] ?? '',
                        'phone'               => $store_meta->meta_data['phone'] ?? $store_meta->meta_data['_phone'] ?? $store_meta->meta_data['contact_number'] ?? '',
                        'primary_owner'       => $primary_owner,
                        'primary_owner_image' => get_avatar( $primary_owner->ID, 48 ),
                        'applied_on'          => $store['create_time'],
                        'store_image'         => $store_image, // Add store image
                        'store_banner'        => $store_banner, // Add store banner
                        'address_1'           => $store_meta->meta_data['address_1'] ?? '',
                        'image'               => ! empty( $store_meta->meta_data['image'] ) ? $store_meta->meta_data['image'] : null,
                        'commission'          => $commission,
                    )
                );
            }
            $all          = StoreUtil::get_store_information( array( 'count' => true ) );
            $active       = StoreUtil::get_store_information(
                array(
					'status' => 'active',
					'count'  => true,
				)
            );
            $pending      = StoreUtil::get_store_information(
                array(
					'status' => 'pending',
					'count'  => true,
				)
            );
            $under_review = StoreUtil::get_store_information(
                array(
					'status' => 'under_review',
					'count'  => true,
				)
            );
            $suspended    = StoreUtil::get_store_information(
                array(
					'status' => 'suspended',
					'count'  => true,
				)
            );
            $deactivated  = StoreUtil::get_store_information(
                array(
					'status' => 'deactivated',
					'count'  => true,
				)
            );

            $response = array(
                'stores'       => $formatted_stores,
                'all'          => $all,
                'active'       => $active,
                'pending'      => $pending,
                'under_review' => $under_review,
                'suspended'    => $suspended,
                'deactivated'  => $deactivated,
            );
            return rest_ensure_response( $response );
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

    public function get_pending_stores( $request ) {
        global $wpdb;

        $limit  = max( intval( $request->get_param( 'row' ) ), 10 );
        $page   = max( intval( $request->get_param( 'page' ) ), 1 );
        $offset = ( $page - 1 ) * $limit;
        $count  = $request->get_param( 'count' );

        $start_date = $request->get_param( 'start_date' ); // ISO8601 string
        $end_date   = $request->get_param( 'end_date' );   // ISO8601 string

        $table_name = "{$wpdb->prefix}" . Utill::TABLES['store'];

        if ( $count ) {
            // Get total count with optional date filter
            $sql    = "SELECT COUNT(*) FROM $table_name WHERE status = 'pending'";
            $params = array();

            if ( $start_date && $end_date ) {
                $sql     .= ' AND create_time BETWEEN %s AND %s';
                $params[] = $start_date;
                $params[] = $end_date;
            }

            $total_count = $params ? $wpdb->get_var( $wpdb->prepare( $sql, ...$params ) ) : $wpdb->get_var( $sql );
            return rest_ensure_response( (int) $total_count );
        }

        // Get pending stores
        $sql    = "SELECT * FROM $table_name WHERE status = 'pending'";
        $params = array();

        if ( $start_date && $end_date ) {
            $sql     .= ' AND create_time BETWEEN %s AND %s';
            $params[] = $start_date;
            $params[] = $end_date;
        }

        $sql     .= ' ORDER BY create_time DESC LIMIT %d OFFSET %d';
        $params[] = $limit;
        $params[] = $offset;

        $stores = $params ? $wpdb->get_results( $wpdb->prepare( $sql, ...$params ), ARRAY_A ) : $wpdb->get_results( $sql, ARRAY_A );

        $formatted_stores = array();
        foreach ( $stores as $store ) {
            $store_id   = (int) $store['ID'];
            $store_name = $store['name'];
            $store_slug = $store['slug'];
            $status     = $store['status'];
            $applied_on = $store['create_time'];

            $formatted_stores[] = apply_filters(
                'multivendorx_stores',
                array(
                    'id'         => $store_id,
                    'store_name' => $store_name,
                    'store_slug' => $store_slug,
                    'status'     => $status,
                    'applied_on' => $applied_on,
                )
            );
        }

        return rest_ensure_response( $formatted_stores );
    }

    public function get_stores_dropdown( $request ) {
        $stores = StoreUtil::get_store();

        $formatted_stores = array();
        foreach ( $stores as $store ) {
            $formatted_stores[] = array(
                'id'         => (int) $store['ID'],
                'store_name' => $store['name'],
            );
        }

        return rest_ensure_response( $formatted_stores );
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
        try{
            $registrations = $request->get_header( 'registrations' );
            $store_data    = $request->get_param( 'formData' );

            $current_user = wp_get_current_user();

            $core_fields               = array( 'name', 'slug', 'description', 'who_created', 'status' );
            $store_data['who_created'] = $current_user->ID;
            $store_data['status']      = 'active';

            if ( ! empty( $store_data['id'] ) ) {
                // Load existing store
                $store = new \MultiVendorX\Store\Store( (int) $store_data['id'] );

                unset( $store_data['id'] );
                unset( $store_data['status'] );

                $store_data['status'] = 'pending';
            } else {
                // Create store object
                $store = new \MultiVendorX\Store\Store();
                if ( ! current_user_can( 'manage_options' ) && MultiVendorX()->setting->get_setting( 'approve_store' ) == 'manually' ) {
                    $store_data['status'] = 'pending';
                }
            }

            // Set core fields
            foreach ( $core_fields as $field ) {
                if ( isset( $store_data[ $field ] ) ) {
                    $store->set( $field, $store_data[ $field ] );
                }
            }

            // Save store
            $insert_id = $store->save();

            // Save other meta if not registration
            if ( $insert_id && ! $registrations ) {
                foreach ( $store_data as $key => $value ) {
                    if ( ! in_array( $key, $core_fields, true ) && $key !== 'store_owners' ) {
                        $store->update_meta( $key, $value );
                    }
                }
            }

            // Handle registrations
            if ( $registrations ) {
                $non_core_fields = array();
                foreach ( $store_data as $key => $value ) {
                    if ( ! in_array( $key, $core_fields, true ) && $key !== 'store_owners' ) {
                        if ( in_array( $key, array( 'phone', 'paypal_email', 'address_1', 'address_2', 'city', 'state', 'country', 'postcode' ), true ) ) {
                            $store->update_meta( $key, $value );
                        } else {
                            $non_core_fields[ $key ] = $value;
                        }
                    }
                }

                if ( ! empty( $non_core_fields ) ) {
                    $store->update_meta( 'multivendorx_registration_data', serialize( $non_core_fields ) );
                }

                // Assign current user as primary owner if automatic approval
                if ( MultiVendorX()->setting->get_setting( 'approve_store' ) == 'automatically' ) {
                    $current_user->set_role( 'store_owner' );
                } elseif ( ! in_array( 'store_owner', (array) $current_user->roles ) ) {
                        $role = get_option( Utill::OTHER_SETTINGS['default_role'] );
                        $current_user->set_role( $role );
                }

                StoreUtil::set_primary_owner( $current_user->ID, $insert_id );
                update_user_meta( $current_user->ID, 'multivendorx_active_store', $insert_id );
            }

            // Handle store_owners array if provided
            if ( ! empty( $store_data['store_owners'] ) ) {
                StoreUtil::set_primary_owner( $store_data['store_owners'], $insert_id );
                StoreUtil::add_store_users(
                    array(
                        'store_id' => $insert_id,
                        'users'    => array( $store_data['store_owners'] ),
                        'role_id'  => 'store_owner',
                    )
                );
            }

        return rest_ensure_response( [
            'success' => true,
            'id'      => $insert_id,
            'redirect'=> $registrations ? get_permalink( MultiVendorX()->setting->get_setting( 'store_dashboard_page' ) ) : null,
        ] );
    }
    
    public function get_item( $request ) {
        $id = absint( $request->get_param( 'id' ) );
        $action = $request->get_param( 'action' );

        if ($id && $action == 'switch') {
            update_user_meta(get_current_user_id(), 'multivendorx_active_store', $id);

            $dashboard_page_id = (int) MultiVendorX()->setting->get_setting('store_dashboard_page');
            if ($dashboard_page_id) {
                $redirect_url = get_permalink($dashboard_page_id);
            }
            return rest_ensure_response([
                'redirect' => $redirect_url
            ]);
        }

        $store = $request->get_param( 'store' );
        if( $store ){
            return $this->get_store_products_and_category( $request );
        }
        $fetch_user = $request->get_param( 'fetch_user' );
        $registrations = $request->get_header( 'registrations' );
        if ($fetch_user) {
            $users = StoreUtil::get_store_users($id);

            $response = [
                'id'           => $id,
                'store_owners' => $users['users'],
                'primary_owner' => (int) $users['primary_owner'],
            ];
            return rest_ensure_response( $response );
        }

            $admin_email = get_option( Utill::OTHER_SETTINGS['admin_email'] );
            $store_email = 'test@gmail.com';
            $parameters  = array(
                'admin_email' => $admin_email,
                'store_email' => $store_email,
                'store_id'    => $insert_id,
                'category'    => 'activity',
            );

            do_action( 'multivendorx_notify_new_store_approval', 'new_store_approval', $parameters );

            $admin_email = get_option( Utill::OTHER_SETTINGS['admin_email'] );
            $store_email = 'test@gmail.com';
            $parameters  = array(
                'admin_email' => $admin_email,
                'store_email' => $store_email,
                'store_id'    => $insert_id,
                'category'    => 'notification',
            );

            do_action( 'multivendorx_notify_new_store_approval', 'new_store_approval', $parameters );

            return rest_ensure_response(
                array(
                    'success'  => true,
                    'id'       => $insert_id,
                    'redirect' => $registrations ? get_permalink( MultiVendorX()->setting->get_setting( 'store_dashboard_page' ) ) : null,
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
        try{
            $id    = absint( $request->get_param( 'id' ) );
            $store = $request->get_param( 'store' );
            if ( $store ) {
                return $this->get_store_products_and_category( $request );
            }
            $fetch_user    = $request->get_param( 'fetch_user' );
            $registrations = $request->get_header( 'registrations' );
            if ( $fetch_user ) {
                $users = StoreUtil::get_store_users( $id );
    
                $response = array(
                    'id'            => $id,
                    'store_owners'  => $users['users'],
                    'primary_owner' => (int) $users['primary_owner'],
                );
                return rest_ensure_response( $response );
            }
    
            // Load the store
            $store = new \MultiVendorX\Store\Store( $id );
            if ( $registrations ) {
                $response = StoreUtil::get_store_registration_form( $store->get_id() );
                return rest_ensure_response( $response );
            }
    
            $commission   = CommissionUtil::get_commission_summary_for_store( (int) $id );
            $transactions = Transaction::get_balances_for_store( (int) $id );
            // Get primary owner information using Store object
            $primary_owner_id   = StoreUtil::get_primary_owner( $id );
            $primary_owner_info = get_userdata( $primary_owner_id );
    
            $overall = Util::get_overall_rating( $id );
    
            // Get all reviews
            $reviews       = Util::get_reviews_by_store( $id );
            $total_reviews = count( $reviews );
    
            $response = array(
                'id'                 => $store->get_id(),
                'name'               => $store->get( 'name' ),
                'slug'               => $store->get( 'slug' ),
                'description'        => $store->get( 'description' ),
                'who_created'        => $store->get( 'who_created' ),
                'status'             => $store->get( 'status' ),
                'create_time'        => date( 'M j, Y', strtotime( $store->get( 'create_time' ) ) ),
                'commission'         => $commission,
                'transactions'       => $transactions,
                'primary_owner_info' => $primary_owner_info,
                'overall_reviews'    => $overall,
                'total_reviews'      => $total_reviews,
            );
    
            // Add meta data
            foreach ( $store->meta_data as $key => $values ) {
                $response[ $key ] = is_array( $values ) ? $values[0] : $values;
            }
    
            return rest_ensure_response( $response );
        }catch ( \Exception $e ) {
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
        try{
            $id   = absint( $request->get_param( 'id' ) );
            $data = $request->get_json_params();
    
            $store = new \MultiVendorX\Store\Store( $id );
    
            if ( $data['deactivate'] ) {
                $action = $data['action'] ?: '';
                if ( $action == 'approve' ) {
                    $store->set( 'status', 'deactivated' );
                    $store->delete_meta( 'deactivation_reason' );
                    $store->delete_meta( 'deactivation_request_date' );
                }
    
                if ( $action == 'reject' ) {
                    $store->delete_meta( 'deactivation_reason' );
                    $store->delete_meta( 'deactivation_request_date' );
                }
    
                $store->save();
                return rest_ensure_response( array( 'success' => true ) );
            }
    
            if ( ! empty( $data['delete'] ) ) {
                $delete_option = $data['deleteOption'] ?? '';
    
                switch ( $delete_option ) {
                    case 'direct':
                    case 'permanent_delete':
                        $deleted = $store->delete_store_completely();
                        return rest_ensure_response( array( 'success' => (bool) $deleted ) );
    
                    case 'product_assign_admin':
                        $admins        = get_users(
                            array(
                                'role'   => 'administrator',
                                'number' => 1,
                            )
                        );
                        $admin_user_id = $admins[0]->ID ?? 1;
    
                        $products = wc_get_products(
                            array(
                                'limit'      => -1,
                                'return'     => 'ids',
                                'meta_key'   => 'multivendorx_store_id',
                                'meta_value' => $id,
                            )
                        );
    
                        if ( $products ) {
                            foreach ( $products as $product_id ) {
                                wp_update_post(
                                    array(
                                        'ID'          => $product_id,
                                        'post_author' => $admin_user_id,
                                    )
                                );
                                delete_post_meta( $product_id, 'multivendorx_store_id' );
                            }
                        }
    
                        $deleted = $store->delete_store_completely();
                        return rest_ensure_response( array( 'success' => (bool) $deleted ) );
    
                    case 'set_store_owner':
                        if ( empty( $data['new_owner_id'] ) ) {
                            return rest_ensure_response(
                                array(
                                    'success' => false,
                                    'message' => 'New owner ID missing.',
                                )
                            );
                        }
    
                        StoreUtil::add_store_users(
                            array(
                                'store_id' => $id,
                                'users'    => (array) $data['new_owner_id'],
                                'role_id'  => 'store_owner',
                            )
                        );
    
                        StoreUtil::set_primary_owner( $data['new_owner_id'], $id );
                        return rest_ensure_response( array( 'success' => true ) );
    
                    default:
                        unset( $data['delete'] );
                        break;
                }
            }
    
            // Handle registration & core data
            if ( ! empty( $data['registration_data'] ) || ! empty( $data['core_data'] ) ) {
                if ( isset( $data['status'] ) && $data['status'] === 'approve' ) {
                    $users = StoreUtil::get_store_users( $id );
                    $user  = get_userdata( empty( $users['users'] ) ? $users['primary_owner'] : reset( $users['users'] ) );
    
                    if ( $user ) {
                        $user->set_role( 'store_owner' );
                        StoreUtil::set_primary_owner( $user->ID, $id );
                        $store->set( 'status', 'active' );
                        $store->save();
                        do_action( 'multivendorx_after_store_active', $id );
    
                        return rest_ensure_response( array( 'success' => true ) );
                    }
                } elseif ( isset( $data['status'] ) && $data['status'] === 'rejected' ) {
                    $store->set( 'status', 'rejected' );
                    // Save _reject_note if provided
                    if ( ! empty( $data['store_permanent_reject'] ) ) {
                        $store->set( 'status', 'permanently_rejected' );
                        delete_metadata( 'user', 0, 'multivendorx_active_store', '', true );
                    }
    
                    if ( ! empty( $data['store_application_note'] ) ) {
                        $old_notes = unserialize( $store->get_meta( 'store_reject_note' ) );
                        if ( ! is_array( $old_notes ) ) {
                            $old_notes = array();
                        }
    
                        $old_notes[] = array(
                            'note' => sanitize_text_field( $data['store_application_note'] ),
                            'date' => current_time( 'mysql' ),
                        );
    
                        $store->update_meta( 'store_reject_note', serialize( $old_notes ) );
                    }
    
                    $store->save();
                    return rest_ensure_response( array( 'success' => true ) );
                }
                return;
            }
    
            // Handle adding store owners
            if ( ! empty( $data['store_owners'] ) || ! empty( $data['primary_owner'] ) ) {
                StoreUtil::add_store_users(
                    array(
                        'store_id' => $data['id'],
                        'users'    => (array) $data['store_owners'],
                        'role_id'  => 'store_owner',
                    )
                );
    
                StoreUtil::set_primary_owner( $data['primary_owner'], $data['id'] );
    
                unset( $data['store_owners'] );
                unset( $data['primary_owner'] );
                // return rest_ensure_response([ 'success' => true ]);
            }
    
            unset( $data['commission'] );
            unset( $data['transactions'] );
            unset( $data['primary_owner_info'] );
            unset( $data['overall_reviews'] );
            unset( $data['total_reviews'] );
    
            if ( $data['status'] == 'deactivated' ) {
                delete_metadata( 'user', 0, 'multivendorx_active_store', '', true );
            }
            // Update basic store info
            $store->set( 'name', $data['name'] ?? $store->get( 'name' ) );
            $store->set( 'slug', $data['slug'] ?? $store->get( 'slug' ) );
            $store->set( 'description', $data['description'] ?? $store->get( 'description' ) );
            $store->set( 'who_created', 'admin' );
            $store->set( 'status', $data['status'] ?? $store->get( 'status' ) );
            $store->set( 'create_time', $data['create_time'] ?? $store->get( 'create_time' ) );
    
            // Save all other meta dynamically
            if ( is_array( $data ) ) {
                foreach ( $data as $key => $value ) {
                    if ( ! in_array( $key, array( 'id', 'name', 'slug', 'description', 'who_created', 'status', 'create_time' ), true ) ) {
                        $store->update_meta( $key, $value );
                        if ( $key == 'deactivation_reason' ) {
                            $store->update_meta( 'deactivation_request_date', current_time( 'mysql' ) );
                        }
                    }
                }
            }
    
            $store->save();
    
            if ( $store->get( 'status' ) == 'active' ) {
                do_action( 'multivendorx_after_store_active', $id );
            }
    
            return rest_ensure_response(
                array(
                    'success' => true,
                    'id'      => $store->get_id(),
                )
            );
        }catch ( \Exception $e ) {
            MultiVendorX()->util->log(
                'MVX REST Exception: ' .
                'Message=' . $e->getMessage() . '; ' .
                'File=' . $e->getFile() . '; ' .
                'Line=' . $e->getLine() . "\n\n"
            );        

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }


    public function get_states_by_country( $request ) {
        $country_code = $request->get_param( 'country' );
        $states       = WC()->countries->get_states( $country_code );

        $state_list = array();

        if ( is_array( $states ) ) {
            foreach ( $states as $code => $name ) {
                $state_list[] = array(
                    'label' => $name,
                    'value' => $code,
                );
            }
        }

        return rest_ensure_response( $state_list );
    }

    public function get_store_products_and_category( $request ) {
        $id = absint( $request->get_param( 'id' ) );

        if ( ! $id ) {
            return new \WP_Error(
                'invalid_store_id',
                __( 'Invalid store ID', 'multivendorx' ),
                array( 'status' => 400 )
            );
        }

        // Fetch products for this store
        $products = wc_get_products(
            array(
				'status'     => 'publish', // or use your $status variable if dynamic
				'limit'      => -1,
				'return'     => 'ids',
				'meta_key'   => 'multivendorx_store_id',
				'meta_value' => $id,
            )
        );

        $product_data = array();
        if ( ! empty( $products ) ) {
            foreach ( $products as $product_id ) {
                $product_obj = wc_get_product( $product_id );
                if ( $product_obj ) {
                    $product_data[] = array(
                        'value' => $product_obj->get_id(),
                        'label' => $product_obj->get_name(),
                    );
                }
            }
        }

        //Fetch categories
        $categories = get_terms(
            array(
				'taxonomy'   => 'product_cat',
				'hide_empty' => false,
            )
        );

        $category_data = array();
        if ( ! is_wp_error( $categories ) && ! empty( $categories ) ) {
            foreach ( $categories as $cat ) {
                $category_data[] = array(
                    'value' => $cat->term_id,
                    'label' => $cat->name,
                );
            }
        }

        return rest_ensure_response(
            array(
				'products'   => $product_data,
				'categories' => $category_data,
            )
        );
    }
    /**
     * Get paginated followers of a store
     */
    public function get_store_follower( $request ) {
        $store_id = intval( $request->get_param( 'store_id' ) );
        if ( ! $store_id ) {
            return rest_ensure_response( array( 'error' => 'Invalid store ID' ) );
        }

        // Check if count param is requested
        $count = $request->get_param( 'count' );

        // Get store object
        $store = new \MultiVendorX\Store\Store( $store_id );

        // Fetch followers from meta_data
        $followers_raw = $store->meta_data['followers'] ?? '[]';
        $followers     = json_decode( $followers_raw, true );
        if ( ! is_array( $followers ) ) {
            $followers = array();
        }

        //Handle old format (plain array of user IDs)
        // Convert to new format with id + empty date
        if ( isset( $followers[0] ) && is_int( $followers[0] ) ) {
            $followers = array_map(
                fn( $uid ) => array(
					'id'   => $uid,
					'date' => '',
                ),
                $followers
            );
        }

        if ( $count ) {
            return rest_ensure_response( count( $followers ) );
        }

        // Pagination
        $page   = max( intval( $request->get_param( 'page' ) ), 1 );
        $limit  = max( intval( $request->get_param( 'row' ) ), 10 );
        $offset = ( $page - 1 ) * $limit;

        // Paginate followers
        $followers_page = array_slice( $followers, $offset, $limit );

        $formatted_followers = array();
        foreach ( $followers_page as $follower ) {
            $user_id     = $follower['id'] ?? 0;
            $follow_date = $follower['date'] ?? '';

            $user = get_userdata( $user_id );
            if ( $user ) {
                // Get first + last name
                $first_name = get_user_meta( $user_id, 'first_name', true );
                $last_name  = get_user_meta( $user_id, 'last_name', true );

                // Combine names, fallback to display_name if empty
                $full_name = trim( "$first_name $last_name" );
                if ( empty( $full_name ) ) {
                    $full_name = $user->display_name;
                }

                $formatted_followers[] = array(
                    'id'    => $user_id,
                    'name'  => $full_name,
                    'email' => $user->user_email,
                    'date'  => $follow_date, // ✅ Include follow date
                );
            }
        }

        return rest_ensure_response( $formatted_followers );
    }

    /**
     * Get stores with pending withdrawal requests
     *
     * @param WP_REST_Request $request
     * @return array|int
     */
    private function get_stores_with_pending_withdraw( $request ) {
        $all_stores           = StoreUtil::get_store_information(); // get all stores
        $stores_with_withdraw = array();

        foreach ( $all_stores as $store ) {
            $store_meta = Store::get_store_by_id( (int) $store['ID'] );

            // Check if request_withdrawal_amount exists and is non-zero
            if ( ! empty( $store_meta->meta_data['request_withdrawal_amount'] ) ) {
                $stores_with_withdraw[] = array(
                    'id'              => (int) $store['ID'],
                    'store_name'      => $store['name'],
                    'store_slug'      => $store['slug'],
                    'status'          => $store['status'],
                    'email'           => $store_meta->meta_data['email'] ?? '',
                    'withdraw_amount' => $store_meta->meta_data['request_withdrawal_amount'],
                    'applied_on'      => $store['create_time'],
                );
            }
        }

        // ✅ If this is a count-only request
        if ( $request->get_param( 'count' ) ) {
            return count( $stores_with_withdraw );
        }

        // ✅ Pagination
        $page   = max( 1, intval( $request->get_param( 'page' ) ) );
        $limit  = max( 1, intval( $request->get_param( 'row' ) ) );
        $offset = ( $page - 1 ) * $limit;

        return array_slice( $stores_with_withdraw, $offset, $limit );
    }


    private function get_stores_with_deactivate_requests( $request ) {
        $all_stores                 = StoreUtil::get_store_information(); // get all stores
        $stores_deactivate_requests = array();

        foreach ( $all_stores as $store ) {
            $store_meta = Store::get_store_by_id( (int) $store['ID'] );

            if ( ! empty( $store_meta->meta_data['deactivation_reason'] ) ) {
                $stores_deactivate_requests[] = array(
                    'id'         => (int) $store['ID'],
                    'store_name' => $store['name'],
                    'reason'     => $store_meta->meta_data['deactivation_reason'],
                    'date'       => date( 'M j, Y', strtotime( $store_meta->meta_data['deactivation_request_date'] ) ),
                );
            }
        }

        if ( $request->get_param( 'count' ) ) {
            return count( $stores_deactivate_requests );
        }

        // ✅ Pagination
        $page   = max( 1, intval( $request->get_param( 'page' ) ) );
        $limit  = max( 1, intval( $request->get_param( 'row' ) ) );
        $offset = ( $page - 1 ) * $limit;

        return array_slice( $stores_deactivate_requests, $offset, $limit );
    }
}
