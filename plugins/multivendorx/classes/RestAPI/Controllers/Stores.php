<?php
/**
 * MultiVendorX REST API Store Controller.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\RestAPI\Controllers;

use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Store\Store;
use MultiVendorX\Utill;
use MultiVendorX\Commission\CommissionUtil;
use MultiVendorX\StoreReview\Util;
use MultiVendorX\Transaction\Transaction;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX REST API Store Controller.
 *
 * @class       Store class
 * @version     5.0.0
 * @author      MultiVendorX
 */
class Stores extends \WP_REST_Controller {


    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'stores';

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
    }

    /**
     * Get states by country
     *
     * @param object $request Request data.
     */
    public function get_items_permissions_check( $request ) {
        return current_user_can( 'manage_options' ) || current_user_can( 'edit_stores' );// phpcs:ignore WordPress.WP.Capabilities.Unknown
    }

    /**
     * Create a new store.
     *
     * @param object $request Request data.
     */
    public function create_item_permissions_check( $request ) {
        return current_user_can( 'create_stores' );// phpcs:ignore WordPress.WP.Capabilities.Unknown
    }

    /**
     * Update an existing store.
     *
     * @param object $request Request data.
     */
    public function update_item_permissions_check( $request ) {
        return current_user_can( 'edit_stores' );// phpcs:ignore WordPress.WP.Capabilities.Unknown
    }

    /**
     * Get all stores
     *
     * @param object $request Request data.
     */
    public function get_items( $request ) {
        // Nonce verification.
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );
            MultiVendorX()->util->log( $error );
            return $error;
        }

        try {
            if ( $request->get_param( 'visitorMap' ) ) {
                $store_id  = (int) $request->get_param( 'id' );
                $cache_key = 'multivendorx_visitor_stats_data_' . $store_id;

                $cached = get_transient( $cache_key );

                if ( false !== $cached ) {
                    return $cached;
                }

                $dates = Utill::normalize_date_range(
                    $request->get_param( 'start_date' ),
                    $request->get_param( 'end_date' )
                );

                $start = $dates['start_date'];
                $end   = $dates['end_date'];
                global $wpdb;
                $table_name = $wpdb->prefix . Utill::TABLES['visitors_stats'];

                // phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $rows = $wpdb->get_results( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                    $wpdb->prepare(
                        "SELECT country
                        FROM {$table_name}
                        WHERE store_id = %d
                        AND created >= %s
                        AND created <= %s",
                        $store_id,
                        $start,
                        $end
                    )
                );
                // phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared

                $map_stats = array();

                foreach ( $rows as $row ) {
                    $code               = strtolower( ! empty( $row->country ) ? $row->country : '' );
                    $map_stats[ $code ] = ( $map_stats[ $code ] ?? 0 ) + 1;
                }

                arsort( $map_stats );

                $colors = array();
                $scale  = array( '#316fa8', '#3f7fb5', '#4c8fc1', '#5b9fcd', '#6bb0d9' );
                $i      = 0;

                foreach ( array_slice( $map_stats, 0, 5, true ) as $code => $count ) {
                    $colors[ $code ] = $scale[ $i ] ?? '#316fa8';
                    ++$i;
                }

                $data = array(
                    'map_stats' => array_map(
                        fn( $count ) => array( 'hits_count' => $count ),
                        $map_stats
                    ),
                    'colors'    => $colors,
                );

                set_transient( $cache_key, $data, DAY_IN_SECONDS );

                return rest_ensure_response( $data );
            }

            // Store registration (rejected stores).
            if ( $request->get_param( 'store_registration' ) ) {
                $rejected_stores = Store::get_store( 'rejected', 'primary_owner' );

                $all_stores = array();
                $response   = array();
                $store_data = array();

                foreach ( $rejected_stores as $store ) {
                    $store_id     = (int) $store['ID'];
                    $store_object = new Store( $store_id );

                    $all_stores[] = array(
                        'key'   => $store_id,
                        'value' => $store_id,
                        'label' => $store['name'],
                    );

                    $form_data  = StoreUtil::get_store_registration_form( $store_id );
                    $response[] = $form_data['all_registration_data'] ?? array();

                    $store_data[] = array(
                        'id'   => $store_id,
                        'note' => maybe_unserialize(
                            $store_object->get_meta(
                                Utill::STORE_SETTINGS_KEYS['store_reject_note']
                            )
                        ),
                    );
                }

                return rest_ensure_response(
                    compact( 'all_stores', 'response', 'store_data' )
                );
            }

            // Slug existence check.
            $slug = $request->get_param( 'slug' );
            if ( ! empty( $slug ) ) {
                $id     = (int) $request->get_param( 'id' );
                $exists = Store::store_slug_exists( $slug, $id );
                return rest_ensure_response( array( 'exists' => $exists > 0 ) );
            }

            // Early-return flags.
            $flag_map = array(
                'pending_withdraw' => 'get_stores_with_pending_withdraw',
                'deactivate'       => 'get_stores_with_deactivate_requests',
                'options'          => 'get_stores_dropdown',
                'status'           => 'get_pending_stores',
            );
            $flag_map = apply_filters( 'multivendorx_rest_store_handlers', $flag_map );
            foreach ( $flag_map as $param => $method ) {
                if ( $request->get_param( $param ) ) {
                    if ( method_exists( $this, $method ) ) {
                        return rest_ensure_response( $this->$method( $request ) );
                    }
                    return apply_filters( $method, rest_ensure_response( array() ), $request );
                }
            }

            // Pagination & filters.
            $limit  = $request->get_param( 'row' );
            $page   = $request->get_param( 'page' );
            $offset = ( $page - 1 ) * $limit;
            $args   = array();

            if ( ! empty( $limit ) ) {
                $args['limit'] = $limit;
            }
            if ( ! empty( $offset ) ) {
                $args['offset'] = $offset;
            }

            $search = sanitize_text_field( $request->get_param( 'search_value' ) );
            if ( ! empty( $search ) ) {
                $args['searchField'] = $search;
            } else {
                $dates = Utill::normalize_date_range(
                    $request->get_param( 'start_date' ),
                    $request->get_param( 'end_date' )
                );

                if ( ! empty( $dates['start_date'] ) ) {
                    $args['start_date'] = $dates['start_date'];
                }

                if ( ! empty( $dates['end_date'] ) ) {
                    $args['end_date'] = $dates['end_date'];
                }
            }

            $status = $request->get_param( 'filter_status' );
            if ( ! empty( $status ) ) {
                $args['status'] = $status;
            }

            $order_by = $request->get_param( 'order_by' );
            if ( ! empty( $order_by ) ) {
                $args['order_by'] = sanitize_text_field( $order_by );
                $args['order']    = sanitize_text_field( $request->get_param( 'order' ) );
            }
            $lat    = $request->get_param( 'location_lat' );
            $lng    = $request->get_param( 'location_lng' );
            $radius = $request->get_param( 'radius_max' );
            $unit   = $request->get_param( 'radius_unit' );
            if ( ! empty( $lat ) && ! empty( $lng ) && ! empty( $radius ) ) {
                $store_ids = StoreUtil::get_stores_by_radius(
                    floatval( $lat ),
                    floatval( $lng ),
                    floatval( $radius ),
                    $unit
                );

                if ( ! empty( $store_ids ) ) {
                    $args['ID'] = $store_ids;
                    // Keep nearest-first order from radius query.
                    unset( $args['order_by'], $args['order'] );
                }
            }
            // Fetch & format stores.
            $stores = StoreUtil::get_store_information( $args );

            if ( ! empty( $store_ids ) ) {
                $store_order = array_flip( array_map( 'intval', $store_ids ) );
                usort(
                    $stores,
                    function ( $a, $b ) use ( $store_order ) {
                        $a_pos = $store_order[ (int) $a['ID'] ] ?? PHP_INT_MAX;
                        $b_pos = $store_order[ (int) $b['ID'] ] ?? PHP_INT_MAX;

                        if ( $a_pos === $b_pos ) {
                            return 0;
                        }

                        return ( $a_pos < $b_pos ) ? -1 : 1;
                    }
                );
            }

            $formatted_stores = array();
            foreach ( $stores as $store ) {
                $store_id           = (int) $store['ID'];
                $store_meta         = Store::get_store( $store_id );
                $owner_id           = StoreUtil::get_primary_owner( $store_id );
                $owner              = get_userdata( $owner_id );
                $formatted_stores[] = apply_filters(
                    'multivendorx_stores_details',
                    array(
                        'id'                  => $store_id,
                        'store_name'          => $store['name'],
                        'store_slug'          => $store['slug'],
                        'status'              => $store['status'],
                        'email'               => $store_meta->meta_data[ Utill::STORE_SETTINGS_KEYS['store_email'] ]['primary'] ?? '',
                        'phone'               => $store_meta->meta_data[ Utill::STORE_SETTINGS_KEYS['phone'] ] ?? '',
                        'primary_owner'       => $owner,
                        'primary_owner_image' => get_avatar( $owner_id, 48 ),
                        'create_time'         => Utill::multivendorx_rest_prepare_date_response( $store['create_time'] ),
                        'create_time_gmt'     => Utill::multivendorx_rest_prepare_date_response( $store['create_time'], true ),
                        'store_image'         => $store_meta->meta_data['image'] ?? '',
                        'store_banner'        => $store_meta->meta_data['banner'] ?? '',
                        'address'             => $store_meta->meta_data[ Utill::STORE_SETTINGS_KEYS['address'] ] ?? '',
                        'location_lat'        => $store_meta->meta_data[ Utill::STORE_SETTINGS_KEYS['location_lat'] ] ?? '',
                        'location_lng'        => $store_meta->meta_data[ Utill::STORE_SETTINGS_KEYS['location_lng'] ] ?? '',
                        'commission'          => CommissionUtil::get_commission_summary_for_store( $store_id ),
                    ),
                    $store_id
                );
            }

            // Prepare status filters.
            $status_filters = array(
                'all'          => array(),
                'active'       => array( 'status' => 'active' ),
                'pending'      => array( 'status' => 'pending' ),
                'under_review' => array( 'status' => 'under_review' ),
                'suspended'    => array( 'status' => 'suspended' ),
                'deactivated'  => array( 'status' => 'deactivated' ),
            );

            $response = rest_ensure_response( $formatted_stores );

            // Status counters in headers.
            foreach ( $status_filters as $key => $filter ) {
                $count = StoreUtil::get_store_information(
                    array_merge( $filter, array( 'count' => true ) )
                );

                if ( 'all' === $key ) {
                    $response->header( 'X-WP-Total', (int) $count );
                } else {
                    $response->header(
                        'X-WP-Status-' . ucfirst( str_replace( '_', '-', $key ) ),
                        (int) $count
                    );
                }
            }

            return $response;
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );
            return new \WP_Error(
                'server_error',
                __( 'Unexpected server error', 'multivendorx' ),
                array( 'status' => 500 )
            );
        }
    }

    /**
     * Get pending stores.
     *
     * @param WP_REST_Request $request Request data.
     * @return WP_REST_Response
     */
    public function get_pending_stores( $request ) {

        $limit  = max( (int) $request->get_param( 'row' ), 10 );
        $page   = max( (int) $request->get_param( 'page' ), 1 );
        $offset = ( $page - 1 ) * $limit;
        $args   = array(
            'status' => 'pending',
        );

        $response = rest_ensure_response( array() );
        $response->header( 'X-WP-Total', (int) StoreUtil::get_store_information( array_merge( $args, array( 'count' => true ) ) ) );
        $start_date = $request->get_param( 'start_date' );
        $end_date   = $request->get_param( 'end_date' );

        if ( $start_date && $end_date ) {
            $args['start_date'] = $start_date;
            $args['end_date']   = $end_date;
        }

        $args['limit']    = $limit;
        $args['offset']   = $offset;
        $args['order_by'] = 'create_time';
        $args['order']    = 'desc';

        $stores = StoreUtil::get_store_information( $args );

        $formatted_stores = array();

        foreach ( $stores as $store ) {
            $formatted_stores[] = apply_filters(
                'multivendorx_stores',
                array(
                    'id'         => (int) $store['ID'],
                    'store_name' => $store['name'],
                    'store_slug' => $store['slug'],
                    'status'     => $store['status'],
                    'applied_on' => Utill::multivendorx_rest_prepare_date_response( $store['create_time'] ),
                )
            );
        }
        $response->set_data( $formatted_stores );

        return $response;
    }

    /**
     * Get stores dropdown.
     */
    public function get_stores_dropdown() {
        $stores = StoreUtil::get_stores();

        $formatted_stores = array();
        foreach ( $stores as $store ) {
            if ( 'active' === $store['status'] ) {
                $formatted_stores[] = array(
                    'id'         => (int) $store['ID'],
                    'store_name' => $store['name'],
                );
            }
        }

        return rest_ensure_response( $formatted_stores );
    }

	/**
	 * Create a store.
	 *
	 * Handles both admin and frontend store registration.
	 *
	 * @param \WP_REST_Request $request Full data about the request.
	 * @return \WP_REST_Response|\WP_Error
	 * @throws \Exception If the store cannot be saved or another unexpected error occurs.
	 */
    public function create_item( $request ) {

        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );

            MultiVendorX()->util->log( $error );
            return $error;
        }

        try {
            $registrations = (bool) $request->get_header( 'registrations' );
            $store_data    = (array) $request->get_param( 'formData' );
            $file_data     = $request->get_file_params();
            $current_user  = MultiVendorX()->current_user;

            if ( ! empty( $store_data['store-name'] ) && empty( $store_data['name'] ) ) {
                $store_data['name'] = $store_data['store-name'];
            }

            if ( ! empty( $store_data['Description'] ) && empty( $store_data['description'] ) ) {
                $store_data['description'] = $store_data['Description'];
            }

            unset( $store_data['store-name'], $store_data['Description'] );
            $core_fields = array(
                Utill::STORE_SETTINGS_KEYS['name'],
                Utill::STORE_SETTINGS_KEYS['slug'],
                Utill::STORE_SETTINGS_KEYS['description'],
                Utill::STORE_SETTINGS_KEYS['who_created'],
                Utill::STORE_SETTINGS_KEYS['status'],
            );

            $store_data['who_created'] = $current_user->ID;
            $store_data['status']      = 'active';

            if ( ! empty( $store_data['id'] ) ) {
                $store = new Store( (int) $store_data['id'] );
                unset( $store_data['id'], $store_data['status'] );

                $store_data['status'] = 'pending';
            } else {
                $store = new Store();

                if (
                    ! current_user_can( 'manage_options' ) &&
                    'manually' === MultiVendorX()->setting->get_setting( 'approve_store' )
                ) {
                    $store_data['status'] = 'pending';
                }
            }

            if ( $registrations ) {
                $raw_slug = $store_data['slug']
                    ?? sanitize_title( $store_data['name'] ?? '' );

                $store_data['slug'] = Store::generate_unique_store_slug( $raw_slug );
            }

            foreach ( $core_fields as $field ) {
                if ( array_key_exists( $field, $store_data ) ) {
                    $store->set( $field, $store_data[ $field ] );
                }
            }

            $store_id = $store->save();
            if ( ! $store_id ) {
                throw new \Exception( 'Store save failed' );
            }

            $registration_allowed_meta = array(
                Utill::STORE_SETTINGS_KEYS['phone'],
                Utill::STORE_SETTINGS_KEYS['paypal_email'],
                Utill::STORE_SETTINGS_KEYS['address'],
                Utill::STORE_SETTINGS_KEYS['address_2'],
                Utill::STORE_SETTINGS_KEYS['city'],
                Utill::STORE_SETTINGS_KEYS['state'],
                Utill::STORE_SETTINGS_KEYS['country'],
                Utill::STORE_SETTINGS_KEYS['zip'],
            );
            $non_core_fields           = array();

            foreach ( $file_data as $file ) {
                $field_key                = array_key_first( $file['name'] );
                $normalized_file          = array(
                    'name'     => $file['name'][ $field_key ],
                    'type'     => $file['type'][ $field_key ],
                    'tmp_name' => $file['tmp_name'][ $field_key ],
                    'error'    => $file['error'][ $field_key ],
                    'size'     => $file['size'][ $field_key ],
                );
                $attachment_id            = StoreUtil::create_attachment_from_files_array( $normalized_file );
                $store_data[ $field_key ] = $attachment_id;
            }

            $registration_meta_map = array(
                'store-paypal' => Utill::STORE_SETTINGS_KEYS['paypal_email'],
                'Phone'        => Utill::STORE_SETTINGS_KEYS['phone'],
            );

            foreach ( $store_data as $key => $value ) {
                if ( isset( $registration_meta_map[ $key ] ) ) {
                    $key = $registration_meta_map[ $key ];
                }
                if ( in_array( $key, $core_fields, true ) || 'store_owners' === $key ) {
                    continue;
                }

                if ( ! $registrations ) {
                    $store->update_meta( $key, $value );
                    continue;
                }

                if ( in_array( $key, $registration_allowed_meta, true ) ) {
                    $store->update_meta( $key, $value );
                } else {
                    $non_core_fields[ $key ] = $value;
                }
            }

            if ( $registrations && ! empty( $non_core_fields ) ) {
                $store->update_meta(
                    Utill::STORE_SETTINGS_KEYS['registration_data'],
                    maybe_serialize( $non_core_fields )
                );
            }

            if ( $registrations ) {
                if ( 'automatically' === MultiVendorX()->setting->get_setting( 'approve_store' ) ) {
                    $current_user->set_role( 'store_owner' );
                } elseif ( ! in_array( 'store_owner', (array) $current_user->roles, true ) ) {
                    $current_user->set_role(
                        get_option( Utill::MULTIVENDORX_OTHER_SETTINGS['default_role'] )
                    );
                }
                $store->update_meta(
                    'store_email',
                    array(
                        'list'    => array( $current_user->user_email ),
                        'primary' => $current_user->user_email,
                    )
                );

                StoreUtil::set_primary_owner( $current_user->ID, $store_id );
                update_user_meta(
                    $current_user->ID,
                    Utill::USER_SETTINGS_KEYS['active_store'],
                    $store_id
                );
            }

            if ( ! empty( $store_data['store_owners'] ) ) {
                StoreUtil::set_primary_owner( $store_data['store_owners'], $store_id );
                StoreUtil::add_store_users(
                    array(
                        'store_id' => $store_id,
                        'users'    => array( $store_data['store_owners'] ),
                        'role_id'  => 'store_owner',
                    )
                );

                $user = get_user_by( 'id', $store_data['store_owners'] );

                MultiVendorX()->notifications->send_notification_helper(
                    'store_account_created_by_admin',
                    $store,
                    null,
                    array(
						'store_name'       => $store->get( Utill::STORE_SETTINGS_KEYS['name'] ),
						'marketplace_name' => get_bloginfo( 'name' ),
						'store_owner_name' => $user->display_name,
						'login_url'        => get_permalink( (int) MultiVendorX()->setting->get_setting( 'store_dashboard_page' ) ),
						'store_id'         => $store_id,
						'category'         => 'activity',
					)
                );
            }

            if ( 'active' === $store_data['status'] ) {
                do_action( 'multivendorx_after_store_active', $store_id );

                MultiVendorX()->notifications->send_notification_helper(
                    'store_activated',
                    $store,
                    null,
                    array(
						'store_name' => $store->get( Utill::STORE_SETTINGS_KEYS['name'] ),
						'store_id'   => $store_id,
						'category'   => 'activity',
					)
                );
            }

            if ( 'pending' === $store_data['status'] ) {
                MultiVendorX()->notifications->send_notification_helper(
                    'store_pending_approval',
                    $store,
                    null,
                    array(
						'store_name' => $store->get( Utill::STORE_SETTINGS_KEYS['name'] ),
						'store_id'   => $store_id,
						'category'   => 'activity',
					)
                );
            }

            return rest_ensure_response(
                array(
                    'success'  => true,
                    'id'       => $store_id,
                    'redirect' => $registrations
                        ? get_permalink( MultiVendorX()->setting->get_setting( 'store_dashboard_page' ) )
                        : null,
                )
            );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error(
                'server_error',
                __( 'Unexpected server error', 'multivendorx' ),
                array( 'status' => 500 )
            );
        }
    }

    /**
     * Get store data.
     *
     * @param  object $request Full details about the request.
     */
    public function get_item( $request ) {

        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );

            MultiVendorX()->util->log( $error );
            return $error;
        }

        try {
            $id            = absint( $request->get_param( 'id' ) );
            $action        = $request->get_param( 'action' );
            $store_flag    = $request->get_param( 'store' );
            $fetch_user    = $request->get_param( 'fetch_user' );
            $dashboard     = $request->get_param( 'dashboard' );
            $registrations = (bool) $request->get_header( 'registrations' );
            $start_date    = $request->get_param( 'start_date' );
            $end_date      = $request->get_param( 'end_date' );

            if ( $id && 'switch' === $action ) {
                update_user_meta(
                    MultiVendorX()->current_user_id,
                    Utill::USER_SETTINGS_KEYS['active_store'],
                    $id
                );

                $dashboard_page_id = (int) MultiVendorX()->setting->get_setting( 'store_dashboard_page' );

                return rest_ensure_response(
                    array(
                        'redirect' => $dashboard_page_id
                            ? get_permalink( $dashboard_page_id )
                            : null,
                    )
                );
            }

            if ( $store_flag ) {
                return $this->get_store_products_and_category( $request );
            }

            $primary_owner_id   = StoreUtil::get_primary_owner( $id );
            $primary_owner_info = $primary_owner_id
                ? get_userdata( $primary_owner_id )
                : null;

            if ( $fetch_user ) {
                $users = StoreUtil::get_store_users( $id );

                return rest_ensure_response(
                    array(
                        'id'            => $id,
                        'store_owners'  => $users['users'],
                        'primary_owner' => (int) $users['primary_owner'],
                        'primary_owner_info'    =>  $primary_owner_info
                    )
                );
            }

            $store = new Store( $id );

            if ( $registrations ) {
                return rest_ensure_response(
                    StoreUtil::get_store_registration_form( $store->get_id() )
                );
            }
            $args = array();

            if ( $start_date && $end_date ) {
                $args['start_date'] = $start_date;
                $args['end_date']   = $end_date;
            }
            $commission = CommissionUtil::get_commission_summary_for_store( $id, false, false, 3, $args );

            if ( $dashboard ) {
                $transient_key = Utill::MULTIVENDORX_TRANSIENT_KEYS['dashboard_transient'];

                $date_range_label = $args['start_date'] . '_' . $args['end_date'];

                $cached_data        = get_transient( $transient_key ) ?? array();
                $cached_data[ $id ] = $cached_data[ $id ] ?? array();

                if ( isset( $cached_data[ $id ][ $date_range_label ] ) ) {
                    return rest_ensure_response( $cached_data[ $id ][ $date_range_label ] );
                }

                $visitors = StoreUtil::get_store_visitors( $id, $args );

                $response = array(
                    'id'                 => $store->get_id(),
                    'name'               => $store->get( Utill::STORE_SETTINGS_KEYS['name'] ),
                    'commission'         => $commission,
                    'primary_owner_info' => $primary_owner_info,
                    'visitors'           => $visitors,
                );

                $cached_data[ $id ][ $date_range_label ] = $response;
                set_transient( $transient_key, $cached_data, DAY_IN_SECONDS );

                return rest_ensure_response( $response );
            }

            $transactions    = Transaction::get_balances_for_store( $id );
            $overall_reviews = Util::get_overall_rating( $id );
            $reviews         = Util::get_reviews_by_store( $id );

            $response = array(
                'id'                 => $store->get_id(),
                'name'               => $store->get( Utill::STORE_SETTINGS_KEYS['name'] ),
                'slug'               => $store->get( Utill::STORE_SETTINGS_KEYS['slug'] ),
                'description'        => $store->get( Utill::STORE_SETTINGS_KEYS['description'] ),
                'who_created'        => $store->get( Utill::STORE_SETTINGS_KEYS['who_created'] ),
                'status'             => $store->get( Utill::STORE_SETTINGS_KEYS['status'] ),
                'create_time'        => Utill::multivendorx_rest_prepare_date_response( $store->get( Utill::STORE_SETTINGS_KEYS['create_time'] ) ),
                'create_time_gmt'    => Utill::multivendorx_rest_prepare_date_response( $store->get( Utill::STORE_SETTINGS_KEYS['create_time'] ), true ),
                'commission'         => $commission,
                'transactions'       => $transactions,
                'primary_owner_info' => $primary_owner_info,
                'overall_reviews'    => $overall_reviews,
                'total_reviews'      => is_array( $reviews ) ? count( $reviews ) : 0,
            );

            foreach ( (array) $store->meta_data as $key => $values ) {
                $response[ $key ] = $values;
            }

            return rest_ensure_response( $response );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error(
                'server_error',
                __( 'Unexpected server error', 'multivendorx' ),
                array( 'status' => 500 )
            );
        }
    }

    /**
     * Update store
     *
     * @param  object $request Full details about the request.
     */
    public function update_item( $request ) {

        // Verify nonce.
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );

            MultiVendorX()->util->log( $error );
            return $error;
        }

        try {
            $ids    = $request->get_param( 'ids' );
            $status = $request->get_param( 'action' );

            if ( ! empty( $ids ) && ! empty( $status ) ) {
                foreach ( (array) $ids as $store_id ) {
                    $store = new Store( absint( $store_id ) );

                    $store->set( Utill::STORE_SETTINGS_KEYS['status'], $status );
                    $store->save();
                }

                return rest_ensure_response(
                    array(
                        'success' => true,
                    )
                );
            }
            $id   = absint( $request->get_param( 'id' ) );
            $data = (array) $request->get_json_params();

            $store = new Store( $id );

            $data = apply_filters( 'multivendorx_before_store_update', $data, $store, $request );

            // Deactivation handling.
            if ( ! empty( $data['deactivate'] ) ) {
                $action = $data['action'] ?? '';

                if ( 'approve' === $action ) {
                    $store->set( Utill::STORE_SETTINGS_KEYS['status'], 'deactivated' );
                    $store->delete_meta( Utill::STORE_SETTINGS_KEYS['deactivation_reason'] );
                    $store->delete_meta( Utill::STORE_SETTINGS_KEYS['deactivation_request_date'] );
                    MultiVendorX()->notifications->send_notification_helper(
                        'store_permanently_deactivated',
                        $store,
                        null,
                        array(
							'store_name' => $store->get( Utill::STORE_SETTINGS_KEYS['name'] ),
							'store_id'   => $id,
							'category'   => 'activity',
						)
                    );
                }

                if ( 'reject' === $action ) {
                    $store->delete_meta( Utill::STORE_SETTINGS_KEYS['deactivation_reason'] );
                    $store->delete_meta( Utill::STORE_SETTINGS_KEYS['deactivation_request_date'] );
                    MultiVendorX()->notifications->send_notification_helper(
                        'store_deactivation_request_rejected',
                        $store,
                        null,
                        array(
							'store_name' => $store->get( Utill::STORE_SETTINGS_KEYS['name'] ),
							'store_id'   => $id,
							'category'   => 'activity',
						)
                    );
                }

                $store->save();
                return rest_ensure_response( array( 'success' => true ) );
            }

            // Delete store handling.
            if ( ! empty( $data['delete'] ) ) {
                $delete_option = $data['deleteOption'] ?? '';

                switch ( $delete_option ) {
                    case 'direct':
                    case 'permanent_delete':
                        return rest_ensure_response(
                            array(
                                'success' => (bool) $store->delete_store_completely(),
                            )
                        );

                    case 'product_assign_admin':
                        $admin_user_id = get_users(
                            array(
                                'role'   => 'administrator',
                                'number' => 1,
                                'fields' => 'ID',
                            )
                        )[0] ?? 1;

                        $products = wc_get_products(
                            array(
                                'limit'      => -1,
                                'return'     => 'ids',
                                'meta_key'   => Utill::POST_META_SETTINGS['store_id'], // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
                                'meta_value' => $id, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
                            )
                        );

                        foreach ( (array) $products as $product_id ) {
                            wp_update_post(
                                array(
                                    'ID'          => $product_id,
                                    'post_author' => $admin_user_id,
                                )
                            );
                            delete_post_meta( $product_id, Utill::POST_META_SETTINGS['store_id'] );
                        }

                        return rest_ensure_response(
                            array(
                                'success' => (bool) $store->delete_store_completely(),
                            )
                        );

                    case 'set_store_owner':
                        if ( empty( $data['new_owner_id'] ) ) {
                            return rest_ensure_response(
                                array(
                                    'success' => false,
                                    'message' => __( 'New owner ID missing.', 'multivendorx' ),
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
                }
            }

            // Registration approval / rejection.
            if ( ! empty( $data['registration_data'] ) || ! empty( $data['core_data'] ) ) {
                if ( 'approve' === ( $data['status'] ?? '' ) ) {
                    $users = StoreUtil::get_store_users( $id );
                    $user  = get_userdata(
                        empty( $users['users'] )
                            ? $users['primary_owner']
                            : reset( $users['users'] )
                    );

                    if ( $user ) {
                        $user->set_role( 'store_owner' );
                        StoreUtil::set_primary_owner( $user->ID, $id );

                        $store->set( Utill::STORE_SETTINGS_KEYS['status'], 'active' );
                        $store->save();

                        do_action( 'multivendorx_after_store_active', $id );
                        MultiVendorX()->notifications->send_notification_helper(
                            'store_activated',
                            $store,
                            null,
                            array(
								'store_name' => $store->get( Utill::STORE_SETTINGS_KEYS['name'] ),
								'store_id'   => $id,
								'category'   => 'activity',
							)
                        );
                        return rest_ensure_response( array( 'success' => true ) );
                    }
                }

                if ( 'rejected' === ( $data['status'] ?? '' ) ) {
                    $status = ! empty( $data['store_permanent_reject'] )
                        ? 'permanently_rejected'
                        : 'rejected';

                    $store->set( Utill::STORE_SETTINGS_KEYS['status'], $status );

                    if ( ! empty( $data['store_permanent_reject'] ) ) {
                        delete_metadata(
                            'user',
                            0,
                            Utill::USER_SETTINGS_KEYS['active_store'],
                            '',
                            true
                        );
                    }

                    if ( ! empty( $data['store_application_note'] ) ) {
                        $old_notes = maybe_unserialize(
                            $store->get_meta( Utill::STORE_SETTINGS_KEYS['store_reject_note'] )
                        );

                        $old_notes   = is_array( $old_notes ) ? $old_notes : array();
                        $old_notes[] = array(
                            'note' => sanitize_text_field( $data['store_application_note'] ),
                            'date' => current_time( 'mysql' ),
                        );

                        $store->update_meta(
                            Utill::STORE_SETTINGS_KEYS['store_reject_note'],
                            maybe_serialize( $old_notes )
                        );
                    }

                    $store->save();

                    if ( 'permanently_rejected' === $status ) {
                        MultiVendorX()->notifications->send_notification_helper(
                            'store_permanently_rejected',
                            $store,
                            null,
                            array(
								'store_name' => $store->get( Utill::STORE_SETTINGS_KEYS['name'] ),
								'store_id'   => $id,
								'category'   => 'activity',
							)
                        );
                    }

                    if ( 'rejected' === $status ) {
                        MultiVendorX()->notifications->send_notification_helper(
                            'store_rejected',
                            $store,
                            null,
                            array(
								'store_name' => $store->get( Utill::STORE_SETTINGS_KEYS['name'] ),
								'store_id'   => $id,
								'category'   => 'activity',
							)
                        );
                    }
                    return rest_ensure_response( array( 'success' => true ) );
                }

                return;
            }

            // Store owners update.
            if ( ! empty( $data['store_owners'] ) || ! empty( $data['primary_owner'] ) ) {
                StoreUtil::add_store_users(
                    array(
                        'store_id' => $id,
                        'users'    => (array) $data['store_owners'],
                        'role_id'  => 'store_owner',
                    )
                );

                $old_owner = StoreUtil::get_primary_owner( $id );
                StoreUtil::set_primary_owner( $data['primary_owner'], $id );
                StoreUtil::reassign_attachments_to_new_owner( $old_owner, $data['primary_owner'] );

                unset( $data['store_owners'], $data['primary_owner'] );
            }

            unset(
                $data['commission'],
                $data['transactions'],
                $data['primary_owner_info'],
                $data['overall_reviews'],
                $data['total_reviews']
            );

            if ( ! empty( $data['setting'] ) ) {
                $data = $data['setting'];
                unset( $data['setting'], $data['settingName'] );
            }

            // Core fields update.
            $core_fields = array(
                Utill::STORE_SETTINGS_KEYS['name'],
                Utill::STORE_SETTINGS_KEYS['slug'],
                Utill::STORE_SETTINGS_KEYS['description'],
                Utill::STORE_SETTINGS_KEYS['status'],
                Utill::STORE_SETTINGS_KEYS['create_time'],
            );

            foreach ( $core_fields as $field ) {
                if ( array_key_exists( $field, $data ) ) {
                    $store->set( $field, $data[ $field ] );
                    unset( $data[ $field ] );
                }
            }

            $store->set( Utill::STORE_SETTINGS_KEYS['who_created'], 'admin' );

            foreach ( $data as $key => $value ) {
                if ( Utill::STORE_SETTINGS_KEYS['id'] === $key ) {
                    continue;
                }

                if ( in_array( $key, [ Utill::STORE_SETTINGS_KEYS['image'], Utill::STORE_SETTINGS_KEYS['banner'] ], true ) ) {
                    $value = esc_url_raw( (string) ( $value['url'] ?? $value ) );
                }
                
                $store->update_meta( $key, $value );

                if ( Utill::STORE_SETTINGS_KEYS['deactivation_reason'] === $key ) {
                    $store->update_meta(
                        Utill::STORE_SETTINGS_KEYS['deactivation_request_date'],
                        current_time( 'mysql' )
                    );

                    MultiVendorX()->notifications->send_notification_helper(
                        'store_account_deactivation_request',
                        $store,
                        null,
                        array(
							'store_name' => $store->get( Utill::STORE_SETTINGS_KEYS['name'] ),
							'store_id'   => $id,
							'category'   => 'activity',
						)
                    );
                }
            }

            $store->save();

            if ( 'active' === $store->get( Utill::STORE_SETTINGS_KEYS['status'] ) ) {
                do_action( 'multivendorx_after_store_active', $id );
                MultiVendorX()->notifications->send_notification_helper(
                    'store_activated',
                    $store,
                    null,
                    array(
						'store_name' => $store->get( Utill::STORE_SETTINGS_KEYS['name'] ),
						'store_id'   => $id,
						'category'   => 'activity',
					)
                );
            }

            if ( 'rejected' === ( $data['status'] ?? '' ) ) {
                MultiVendorX()->notifications->send_notification_helper(
                    'store_rejected',
                    $store,
                    null,
                    array(
						'store_name' => $store->get( Utill::STORE_SETTINGS_KEYS['name'] ),
						'store_id'   => $id,
						'category'   => 'activity',
					)
                );
            }

            if ( 'under_review' === ( $data['status'] ?? '' ) ) {
                MultiVendorX()->notifications->send_notification_helper(
                    'store_under_review',
                    $store,
                    null,
                    array(
						'store_name' => $store->get( Utill::STORE_SETTINGS_KEYS['name'] ),
						'store_id'   => $id,
						'category'   => 'activity',
					)
                );
            }

            if ( 'suspended' === ( $data['status'] ?? '' ) ) {
                MultiVendorX()->notifications->send_notification_helper(
                    'store_suspended',
                    $store,
                    null,
                    array(
						'store_name' => $store->get( Utill::STORE_SETTINGS_KEYS['name'] ),
						'store_id'   => $id,
						'category'   => 'activity',
					)
                );
            }

            if ( 'deactivated' === ( $data['status'] ?? '' ) ) {
                delete_metadata(
                    'user',
                    0,
                    Utill::USER_SETTINGS_KEYS['active_store'],
                    '',
                    true
                );

                MultiVendorX()->notifications->send_notification_helper(
                    'store_permanently_deactivated',
                    $store,
                    null,
                    array(
						'store_name' => $store->get( Utill::STORE_SETTINGS_KEYS['name'] ),
						'store_id'   => $id,
						'category'   => 'activity',
					)
                );
            }

            return rest_ensure_response(
                array(
                    'success' => true,
                    'id'      => $store->get_id(),
                    'error'   => __( 'Settings Saved', 'multivendorx' ),
                )
            );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error(
                'server_error',
                __( 'Unexpected server error', 'multivendorx' ),
                array( 'status' => 500 )
            );
        }
    }

    /**
     * Get store products and categories
     *
     * @param object $request WP_REST_Request object.
     */
    public function get_store_products_and_category( $request ) {
        $id = absint( $request->get_param( 'id' ) );

        if ( ! $id ) {
            return new \WP_Error(
                'invalid_store_id',
                __( 'Invalid store ID', 'multivendorx' ),
                array( 'status' => 400 )
            );
        }

		$products     = wc_get_products(
            array(
				'status'   => 'publish',
				'limit'    => -1,
				'return'   => 'ids',
				'meta_key' => Utill::POST_META_SETTINGS['store_id'], // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
            'meta_value'   => $id, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
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

        // Fetch categories.
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
     * Get stores with pending withdrawal requests
     *
     * @param object $request WP_REST_Request.
     * @return array|int
     */
    private function get_stores_with_pending_withdraw( $request ) {
        $all_stores           = StoreUtil::get_store_information(); // get all stores.
        $stores_with_withdraw = array();

        foreach ( $all_stores as $store ) {
            $store_meta = Store::get_store( (int) $store['ID'] );

            // Check if request_withdrawal_amount exists and is non-zero.
            if ( ! empty( $store_meta->meta_data[ Utill::STORE_SETTINGS_KEYS['request_withdrawal_amount'] ] ) ) {
                $stores_with_withdraw[] = array(
                    'id'              => (int) $store['ID'],
                    'store_name'      => $store['name'],
                    'store_slug'      => $store['slug'],
                    'status'          => $store['status'],
                    'email'           => $store_meta->meta_data['email'] ?? '',
                    'withdraw_amount' => $store_meta->meta_data[ Utill::STORE_SETTINGS_KEYS['request_withdrawal_amount'] ],
                    'create_time'     => Utill::multivendorx_rest_prepare_date_response( $store['create_time'] ),
                    'create_time_gmt' => Utill::multivendorx_rest_prepare_date_response( $store['create_time'], true ),
                );
            }
        }

        $total_count = count( $stores_with_withdraw );

        // Pagination.
        $page   = max( 1, intval( $request->get_param( 'page' ) ) );
        $limit  = max( 1, intval( $request->get_param( 'row' ) ) );
        $offset = ( $page - 1 ) * $limit;

        $paged_data = array_slice( $stores_with_withdraw, $offset, $limit );

        // Return WP_REST_Response with total count in headers.
        $response = rest_ensure_response( $paged_data );
        $response->header( 'X-WP-Total', $total_count );

        return $response;
    }


    /**
     * Get stores with deactivate requests
     *
     * @param object $request Request object.
     * @return array|int
     */
    private function get_stores_with_deactivate_requests( $request ) {
        $all_stores                 = StoreUtil::get_store_information();
        $stores_deactivate_requests = array();

        foreach ( $all_stores as $store ) {
            $store_meta = Store::get_store( (int) $store['ID'] );

            if ( ! empty( $store_meta->meta_data[ Utill::STORE_SETTINGS_KEYS['deactivation_reason'] ] ) ) {
                $stores_deactivate_requests[] = array(
                    'id'                            => (int) $store['ID'],
                    'store_name'                    => $store['name'],
                    'reason'                        => $store_meta->meta_data[ Utill::STORE_SETTINGS_KEYS['deactivation_reason'] ],
                    'deactivation_request_date'     => Utill::multivendorx_rest_prepare_date_response( $store_meta->meta_data[ Utill::STORE_SETTINGS_KEYS['deactivation_request_date'] ] ),
                    'deactivation_request_date_gmt' => Utill::multivendorx_rest_prepare_date_response( $store_meta->meta_data[ Utill::STORE_SETTINGS_KEYS['deactivation_request_date'] ], true ),
                );
            }
        }

        $total = count( $stores_deactivate_requests );

        // Pagination.
        $page   = max( 1, (int) $request->get_param( 'page' ) );
        $limit  = max( 1, (int) $request->get_param( 'row' ) );
        $offset = ( $page - 1 ) * $limit;

        $data = array_slice( $stores_deactivate_requests, $offset, $limit );

        // REST response with headers.
        $response = rest_ensure_response( $data );
        $response->header( 'X-WP-Total', (int) $total );

        return $response;
    }
}
