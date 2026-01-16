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
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Stores extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'store';

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
     * Get states by country
     *
     * @param object $request Request data.
     */
    public function get_items_permissions_check( $request ) {
        return current_user_can( 'read' ) || current_user_can( 'edit_stores' );
    }

    /**
     * Create a new store.
     *
     * @param object $request Request data.
     */
    public function create_item_permissions_check( $request ) {
        return current_user_can( 'create_stores' );
    }

    /**
     * Update an existing store.
     *
     * @param object $request Request data.
     */
    public function update_item_permissions_check( $request ) {
        return current_user_can( 'edit_stores' );
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

                if ( $cached = get_transient( $cache_key ) ) {
                    return $cached;
                }

                $dates = Utill::normalize_date_range(
                    $request->get_param( 'start_date' ),
                    $request->get_param( 'end_date' )
                );
                
                $start = $dates['start_date'];
                $end   = $dates['end_date'];
                global $wpdb;

                 $rows = $wpdb->get_results(
                    $wpdb->prepare(
                        "SELECT country
                        FROM {$wpdb->prefix}" . Utill::TABLES['visitors_stats'] . "
                        WHERE store_id = %d
                        AND created >= %s
                        AND created <= %s",
                        $store_id,
                        $start,
                        $end
                    )
                );

                $mapStats = [];

                foreach ( $rows as $row ) {
                    $code = strtolower( $row->country ?: '' );
                    $mapStats[ $code ] = ( $mapStats[ $code ] ?? 0 ) + 1;
                }

                arsort( $mapStats );

                $colors = [];
                $scale  = [ '#316fa8', '#3f7fb5', '#4c8fc1', '#5b9fcd', '#6bb0d9' ];
                $i = 0;

                foreach ( array_slice( $mapStats, 0, 5, true ) as $code => $count ) {
                    $colors[ $code ] = $scale[ $i ] ?? '#316fa8';
                    $i++;
                }

                $data = [
                    'map_stats' => array_map(
                        fn( $count ) => [ 'hits_count' => $count ],
                        $mapStats
                    ),
                    'colors' => $colors,
                ];

                set_transient( $cache_key, $data, DAY_IN_SECONDS );

                return rest_ensure_response($data);
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
                'follower'         => 'get_store_follower',
            );

            foreach ( $flag_map as $param => $method ) {
                if ( $request->get_param( $param ) ) {
                    return rest_ensure_response( $this->$method( $request ) );
                }
            }

            // Count only.
            if ( $request->get_param( 'count' ) ) {
                return StoreUtil::get_store_information( array( 'count' => true ) );
            }

            // Pagination & filters.
            $limit  = $request->get_param( 'row' );
            $page   = $request->get_param( 'page' );
            $offset = ( $page - 1 ) * $limit;
            $args = array();

            if ( ! empty( $limit ) ) {
                $args['limit'] = $limit;
            }
            if ( ! empty( $offset ) ) {
                $args['offset'] = $offset;
            }

            $search = sanitize_text_field( $request->get_param( 'searchField' ) );
            if ( ! empty( $search ) ) {
                $args['searchField'] = $search;
            } else {
                $dates = Utill::normalize_date_range(
                    $request->get_param( 'startDate' ),
                    $request->get_param( 'endDate' )
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

            $order_by = $request->get_param( 'orderBy' );
            if ( ! empty( $order_by ) ) {
                $args['orderBy'] = sanitize_text_field( $order_by );
                $args['order']   = sanitize_text_field( $request->get_param( 'order' ) );
            }

            // Advanced filters.
            $filters = $request->get_param( 'filters' );
            if ( ! empty( $filters ) ) {
                $args['orderBy'] = $filters['sort'] ?? $args['orderBy'] ?? '';
                $args['order']   = $filters['order'] ?? '';
                $lat    = !empty($filters['location_lat']) ? $filters['location_lat'] : 0;
                $lng    = !empty($filters['location_lng']) ? $filters['location_lng'] : 0;
                $radius = !empty($filters['distance']) ? $filters['distance'] : 0;
                $unit   = $filters['miles'] ?? 'km';

                switch ($unit) {
                    case 'miles':
                        $earth_radius = 3959;
                        break;
                    case 'nm':
                        $earth_radius = 3440;
                        break;
                    default:
                        $earth_radius = 6371;
                }                

                if ( !empty( $filters['limit'] ) && $filters['limit'] ) {
                    $args['limit'] = absint( $filters['limit'] );
                }

                if ( !empty( $filters['offset'] ) && $filters['offset'] ) {
                    $args['offset'] = absint( $filters['offset'] );
                }

                if ( ! empty( $filters['category'] ) ) {
                    $product_ids = wc_get_products(
                        array(
                            'return'      => 'ids',
                            'numberposts' => -1,
                            'tax_query'   => array(
                                array(
                                    'taxonomy' => 'product_cat',
                                    'field'    => 'term_id',
                                    'terms'    => $filters['category'],
                                ),
                            ),
                        )
                    );

                    $store_ids = array_unique(
                        array_filter(
                            array_map(
                                fn( $pid ) => get_post_meta(
                                    $pid,
                                    Utill::POST_META_SETTINGS['store_id'],
                                    true
                                ),
                                $product_ids
                            )
                        )
                    );

                    $args['ID'] = $store_ids;
                }

                if ( ! empty( $filters['product'] ) ) {
                    $args['ID'] = get_post_meta(
                        $filters['product'],
                        Utill::POST_META_SETTINGS['store_id'],
                        true
                    );
                }
            }
            // Fetch & format stores.
            $stores = StoreUtil::get_store_information( $args );
            if ( $lat && $lng && $radius ) {
                $stores = array_filter( $stores, function ( $store ) use ( $lat, $lng, $radius, $earth_radius ) {
                    $store_id   = (int) $store['ID'];
                    $store_meta = Store::get_store( $store_id );
                    $store_lat = $store_meta->meta_data[ Utill::STORE_SETTINGS_KEYS['location_lat'] ] ?? 0.00 ;
                    $store_lng = $store_meta->meta_data[ Utill::STORE_SETTINGS_KEYS['location_lng'] ] ?? 0.00 ;
                    if ( ! $store_lat || ! $store_lng ) {
                        return false;
                    }
                    $delta_latitude = deg2rad( $store_lat - $lat );
                    $delta_longitude = deg2rad( $store_lng - $lng );
                    $haversine = sin($delta_latitude / 2) ** 2 +
                         cos(deg2rad($lat)) * cos(deg2rad($store_lat)) *
                         sin($delta_longitude / 2) ** 2;
                    $distance = $earth_radius * ( 2 * atan2( sqrt($haversine), sqrt(1 - $haversine) ) );
                    return $distance <= $radius;
                });
                $stores = array_values( $stores );
            }            
            $formatted_stores = array();
            foreach ( $stores as $store ) {
                $store_id   = (int) $store['ID'];
                $store_meta = Store::get_store( $store_id );
                $owner_id = StoreUtil::get_primary_owner( $store_id );
                $owner    = get_userdata( $owner_id );
                $formatted_stores[] = apply_filters(
                    'multivendorx_stores',
                    array(
                        'id'                  => $store_id,
                        'store_name'          => $store['name'],
                        'store_slug'          => $store['slug'],
                        'status'              => $store['status'],
                        'email'               => $store_meta->meta_data[ Utill::STORE_SETTINGS_KEYS['primary_email'] ] ?? '',
                        'phone'               => $store_meta->meta_data[ Utill::STORE_SETTINGS_KEYS['phone'] ] ?? '',
                        'primary_owner'       => $owner,
                        'primary_owner_image' => get_avatar( $owner_id, 48 ),
                        'applied_on'          => $store['create_time'],
                        'store_image'         => $store_meta->meta_data['image'] ?? '',
                        'store_banner'        => $store_meta->meta_data['banner'] ?? '',
                        'address_1'           => $store_meta->meta_data[ Utill::STORE_SETTINGS_KEYS['address_1'] ] ?? '',
                        'location_lat'        => $store_meta->meta_data[ Utill::STORE_SETTINGS_KEYS['location_lat'] ] ?? '',
                        'location_lng'        => $store_meta->meta_data[ Utill::STORE_SETTINGS_KEYS['location_lng'] ] ?? '',
                        'commission'          => CommissionUtil::get_commission_summary_for_store( $store_id ),
                    )
                );
            }

            // Status counters.
            $counts = array(
                'all'          => array(),
                'active'       => array( 'status' => 'active' ),
                'pending'      => array( 'status' => 'pending' ),
                'under_review' => array( 'status' => 'under_review' ),
                'suspended'    => array( 'status' => 'suspended' ),
                'deactivated'  => array( 'status' => 'deactivated' ),
            );

            foreach ( $counts as $key => $filter ) {
                $counts[ $key ] = StoreUtil::get_store_information(
                    array_merge( $filter, array( 'count' => true ) )
                );
            }

            return rest_ensure_response(
                array_merge(
                    array( 'stores' => $formatted_stores ),
                    $counts
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

        $count = $request->get_param( 'count' );
        if ( $count ) {
            $args['count'] = true;
            return rest_ensure_response(
                (int) StoreUtil::get_store_information( $args )
            );
        }

        $start_date = $request->get_param( 'start_date' );
        $end_date   = $request->get_param( 'end_date' );

        if ( $start_date && $end_date ) {
            $args['start_date'] = $start_date;
            $args['end_date']   = $end_date;
        }

        $args['limit']   = $limit;
        $args['offset']  = $offset;
        $args['orderBy'] = 'create_time';
        $args['order']   = 'desc';

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
                    'applied_on' => $store['create_time'],
                )
            );
        }

        return rest_ensure_response( $formatted_stores );
    }

    /**
     * Get stores dropdown.
     */
    public function get_stores_dropdown() {
        $stores = StoreUtil::get_stores();

        $formatted_stores = array();
        foreach ( $stores as $store ) {
            if ($store['status'] == 'active') {
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
     * @param object $request Full data about the request.
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
            $file_data   = $request->get_file_params();
            $current_user  = wp_get_current_user();

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
                Utill::STORE_SETTINGS_KEYS['address_1'],
                Utill::STORE_SETTINGS_KEYS['address_2'],
                Utill::STORE_SETTINGS_KEYS['city'],
                Utill::STORE_SETTINGS_KEYS['state'],
                Utill::STORE_SETTINGS_KEYS['country'],
                Utill::STORE_SETTINGS_KEYS['postcode'],
            );

            $non_core_fields = array();

            foreach ( $file_data as $file ) {
                $field_key = array_key_first( $file['name'] );
                $normalized_file = [
                    'name'     => $file['name'][ $field_key ],
                    'type'     => $file['type'][ $field_key ],
                    'tmp_name' => $file['tmp_name'][ $field_key ],
                    'error'    => $file['error'][ $field_key ],
                    'size'     => $file['size'][ $field_key ],
                ];
                $attachment_id = StoreUtil::create_attachment_from_files_array($normalized_file);
                $store_data[$field_key] = $attachment_id;
            }

            foreach ( $store_data as $key => $value ) {
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
            }

            if ( 'active' === $store_data['status'] ) {
                do_action( 'multivendorx_after_store_active', $store_id );

                do_action(
                    'multivendorx_notify_store_activated',
                    'store_activated',
                    array(
                        'admin_email' => MultiVendorX()->setting->get_setting( 'sender_email_address' ),
                        'admin_phn' => MultiVendorX()->setting->get_setting( 'sms_receiver_phone_number' ),
                        'store_phn' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['phone'] ),
                        'store_email' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['primary_email'] ),
                        'store_name' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['name'] ),
                        'store_id'    => $store_id,
                        'category'    => 'activity',
                    )
                );
            }

            if ( 'pending' === $store_data['status'] ) {
                do_action(
                    'multivendorx_notify_store_pending_approval',
                    'store_pending_approval',
                    array(
                        'admin_email' => MultiVendorX()->setting->get_setting( 'sender_email_address' ),
                        'admin_phn' => MultiVendorX()->setting->get_setting( 'sms_receiver_phone_number' ),
                        'store_phn' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['phone'] ),
                        'store_email' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['primary_email'] ),
                        'store_name' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['name'] ),
                        'store_id'    => $store_id,
                        'category'    => 'activity',
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

            if ( $id && 'switch' === $action ) {
                update_user_meta(
                    get_current_user_id(),
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

            if ( $fetch_user ) {
                $users = StoreUtil::get_store_users( $id );

                return rest_ensure_response(
                    array(
                        'id'            => $id,
                        'store_owners'  => $users['users'],
                        'primary_owner' => (int) $users['primary_owner'],
                    )
                );
            }

            $store = new Store( $id );

            if ( $registrations ) {
                return rest_ensure_response(
                    StoreUtil::get_store_registration_form( $store->get_id() )
                );
            }

            $commission   = CommissionUtil::get_commission_summary_for_store( $id );
            
            $primary_owner_id   = StoreUtil::get_primary_owner( $id );
            $primary_owner_info = $primary_owner_id
                ? get_userdata( $primary_owner_id )
                : null;

            if ($dashboard) {
                if (get_transient('multivendorx_dashboard_data_' . $id)) {
                    return get_transient('multivendorx_dashboard_data_' . $id);
                }

                $visitors  = StoreUtil::get_store_visitors( $id );

                $response = [
                    'id'  => $store->get_id(),
                    'name'  => $store->get( Utill::STORE_SETTINGS_KEYS['name'] ),
                    'commission'         => $commission,
                    'primary_owner_info' => $primary_owner_info,
                    'visitors'           => $visitors,
                ];

                set_transient('multivendorx_dashboard_data_' . $id, $response, DAY_IN_SECONDS);
                
                return rest_ensure_response( $response );
            }
            
            $transactions = Transaction::get_balances_for_store( $id );
            $overall_reviews = Util::get_overall_rating( $id );
            $reviews         = Util::get_reviews_by_store( $id );

            $response = array(
                'id'                 => $store->get_id(),
                'name'               => $store->get( Utill::STORE_SETTINGS_KEYS['name'] ),
                'slug'               => $store->get( Utill::STORE_SETTINGS_KEYS['slug'] ),
                'description'        => $store->get( Utill::STORE_SETTINGS_KEYS['description'] ),
                'who_created'        => $store->get( Utill::STORE_SETTINGS_KEYS['who_created'] ),
                'status'             => $store->get( Utill::STORE_SETTINGS_KEYS['status'] ),
                'create_time'        => gmdate(
                    'M j, Y',
                    strtotime( $store->get( Utill::STORE_SETTINGS_KEYS['create_time'] ) )
                ),
                'commission'         => $commission,
                'transactions'       => $transactions,
                'primary_owner_info' => $primary_owner_info,
                'overall_reviews'    => $overall_reviews,
                'total_reviews'      => is_array( $reviews ) ? count( $reviews ) : 0,
            );

            foreach ( (array) $store->meta_data as $key => $values ) {
                $response[ $key ] = is_array( $values ) ? reset( $values ) : $values;
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
            $id   = absint( $request->get_param( 'id' ) );
            $data = (array) $request->get_json_params();

            $store = new Store( $id );

            // Deactivation handling.
            if ( ! empty( $data['deactivate'] ) ) {
                $action = $data['action'] ?? '';

                if ( 'approve' === $action ) {
                    $store->set( Utill::STORE_SETTINGS_KEYS['status'], 'deactivated' );
                    $store->delete_meta( Utill::STORE_SETTINGS_KEYS['deactivation_reason'] );
                    $store->delete_meta( Utill::STORE_SETTINGS_KEYS['deactivation_request_date'] );
                    do_action(
                        'multivendorx_notify_store_permanently_deactivated',
                        'store_permanently_deactivated',
                        array(
                            'admin_email' => MultiVendorX()->setting->get_setting( 'sender_email_address' ),
                            'admin_phn' => MultiVendorX()->setting->get_setting( 'sms_receiver_phone_number' ),
                            'store_phn' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['phone'] ),
                            'store_email' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['primary_email'] ),
                            'store_name' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['name'] ),
                            'store_id'    => $id,
                            'category'    => 'activity',
                        )
                    );
                }

                if ( 'reject' === $action ) {
                    $store->delete_meta( Utill::STORE_SETTINGS_KEYS['deactivation_reason'] );
                    $store->delete_meta( Utill::STORE_SETTINGS_KEYS['deactivation_request_date'] );
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
                                'meta_key'   => Utill::POST_META_SETTINGS['store_id'],
                                'meta_value' => $id,
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
                        do_action(
                            'multivendorx_notify_store_activated',
                            'store_activated',
                            array(
                                'admin_email' => MultiVendorX()->setting->get_setting( 'sender_email_address' ),
                                'admin_phn' => MultiVendorX()->setting->get_setting( 'sms_receiver_phone_number' ),
                                'store_phn' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['phone'] ),
                                'store_email' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['primary_email'] ),
                                'store_name' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['name'] ),
                                'store_id'    => $id,
                                'category'    => 'activity',
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

                    if ($status == 'permanently_rejected') {
                        do_action(
                            'multivendorx_notify_store_permanently_rejected',
                            'store_permanently_rejected',
                            array(
                                'admin_email' => MultiVendorX()->setting->get_setting( 'sender_email_address' ),
                                'admin_phn' => MultiVendorX()->setting->get_setting( 'sms_receiver_phone_number' ),
                                'store_phn' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['phone'] ),
                                'store_email' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['primary_email'] ),
                                'store_name' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['name'] ),
                                'store_id'    => $id,
                                'category'    => 'activity',
                            )
                        );
                    }

                    if ($status == 'rejected') {
                        do_action(
                            'multivendorx_notify_store_rejected',
                            'store_rejected',
                            array(
                                'admin_email' => MultiVendorX()->setting->get_setting( 'sender_email_address' ),
                                'admin_phn' => MultiVendorX()->setting->get_setting( 'sms_receiver_phone_number' ),
                                'store_phn' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['phone'] ),
                                'store_email' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['primary_email'] ),
                                'store_name' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['name'] ),
                                'store_id'    => $id,
                                'category'    => 'activity',
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

                StoreUtil::set_primary_owner( $data['primary_owner'], $id );

                unset( $data['store_owners'], $data['primary_owner'] );
            }

            unset(
                $data['commission'],
                $data['transactions'],
                $data['primary_owner_info'],
                $data['overall_reviews'],
                $data['total_reviews']
            );

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

                $store->update_meta( $key, $value );

                if ( Utill::STORE_SETTINGS_KEYS['deactivation_reason'] === $key ) {
                    $store->update_meta(
                        Utill::STORE_SETTINGS_KEYS['deactivation_request_date'],
                        current_time( 'mysql' )
                    );
                }
            }

            $store->save();

            if ( 'active' === $store->get( Utill::STORE_SETTINGS_KEYS['status'] ) ) {
                do_action( 'multivendorx_after_store_active', $id );
                do_action(
                    'multivendorx_notify_store_activated',
                    'store_activated',
                    array(
                        'admin_email' => MultiVendorX()->setting->get_setting( 'sender_email_address' ),
                        'admin_phn' => MultiVendorX()->setting->get_setting( 'sms_receiver_phone_number' ),
                        'store_phn' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['phone'] ),
                        'store_email' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['primary_email'] ),
                        'store_name' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['name'] ),
                        'store_id'    => $id,
                        'category'    => 'activity',
                    )
                );
            }

            if ('rejected' == ($data['status'] ?? '')) {
                do_action(
                    'multivendorx_notify_store_rejected',
                    'store_rejected',
                    array(
                        'admin_email' => MultiVendorX()->setting->get_setting( 'sender_email_address' ),
                        'admin_phn' => MultiVendorX()->setting->get_setting( 'sms_receiver_phone_number' ),
                        'store_phn' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['phone'] ),
                        'store_email' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['primary_email'] ),
                        'store_name' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['name'] ),
                        'store_id'    => $id,
                        'category'    => 'activity',
                    )
                );
            }

            if ('under_review' == ($data['status'] ?? '')) {
                do_action(
                    'multivendorx_notify_store_under_review',
                    'store_under_review',
                    array(
                        'admin_email' => MultiVendorX()->setting->get_setting( 'sender_email_address' ),
                        'admin_phn' => MultiVendorX()->setting->get_setting( 'sms_receiver_phone_number' ),
                        'store_phn' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['phone'] ),
                        'store_email' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['primary_email'] ),
                        'store_name' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['name'] ),
                        'store_id'    => $id,
                        'category'    => 'activity',
                    )
                );
            }

            if ('suspended' == ($data['status'] ?? '')) {
                do_action(
                    'multivendorx_notify_store_suspended',
                    'store_suspended',
                    array(
                        'admin_email' => MultiVendorX()->setting->get_setting( 'sender_email_address' ),
                        'admin_phn' => MultiVendorX()->setting->get_setting( 'sms_receiver_phone_number' ),
                        'store_phn' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['phone'] ),
                        'store_email' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['primary_email'] ),
                        'store_name' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['name'] ),
                        'store_id'    => $id,
                        'category'    => 'activity',
                    )
                );
            }

            if ('deactivated' == ($data['status'] ?? '')) {
                delete_metadata(
                    'user',
                    0,
                    Utill::USER_SETTINGS_KEYS['active_store'],
                    '',
                    true
                );

                do_action(
                    'multivendorx_notify_store_permanently_deactivated',
                    'store_permanently_deactivated',
                    array(
                        'admin_email' => MultiVendorX()->setting->get_setting( 'sender_email_address' ),
                        'admin_phn' => MultiVendorX()->setting->get_setting( 'sms_receiver_phone_number' ),
                        'store_phn' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['phone'] ),
                        'store_email' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['primary_email'] ),
                        'store_name' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['name'] ),
                        'store_id'    => $id,
                        'category'    => 'activity',
                    )
                );
            }

            return rest_ensure_response(
                array(
                    'success' => true,
                    'id'      => $store->get_id(),
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
     * Get states by country
     *
     * @param object $request WP_REST_Request object.
     */
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

        // Fetch products for this store.
        $products = wc_get_products(
            array(
				'status'     => 'publish', // or use your $status variable if dynamic.
				'limit'      => -1,
				'return'     => 'ids',
				'meta_key'   => Utill::POST_META_SETTINGS['store_id'],
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
     * Get paginated followers of a store
     *
     * @param object $request WP_REST_Request object.
     */
    public function get_store_follower( $request ) {
        $store_id = intval( $request->get_param( 'store_id' ) );
        if ( ! $store_id ) {
            return rest_ensure_response( array( 'error' => 'Invalid store ID' ) );
        }

        // Check if count param is requested.
        $count = $request->get_param( 'count' );

        // Get store object.
        $store = new Store( $store_id );

        // Fetch followers from meta_data.
        $followers_raw = $store->meta_data[ Utill::STORE_SETTINGS_KEYS['followers'] ] ?? '[]';
        $followers     = json_decode( $followers_raw, true );
        if ( ! is_array( $followers ) ) {
            $followers = array();
        }

        // Handle old format (plain array of user IDs).
        // Convert to new format with id + empty date.
        if ( ! empty( $followers[0] ) && is_int( $followers[0] ) ) {
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

        usort(
            $followers,
            function ( $a, $b ) {
				$date_a = ! empty( $a['date'] ) ? strtotime( $a['date'] ) : 0;
				$date_b = ! empty( $b['date'] ) ? strtotime( $b['date'] ) : 0;
				return $date_b <=> $date_a;
			}
        );

        // Pagination.
        $page   = max( intval( $request->get_param( 'page' ) ), 1 );
        $limit  = max( intval( $request->get_param( 'row' ) ), 10 );
        $offset = ( $page - 1 ) * $limit;

        // Paginate followers.
        $followers_page = array_slice( $followers, $offset, $limit );

        $formatted_followers = array();
        foreach ( $followers_page as $follower ) {
            $user_id     = $follower['id'] ?? 0;
            $follow_date = $follower['date'] ?? '';

            $user = get_userdata( $user_id );
            if ( $user ) {
                // Get first + last name.
                $first_name = get_user_meta( $user_id, Utill::USER_SETTINGS_KEYS['first_name'], true );
                $last_name  = get_user_meta( $user_id, Utill::USER_SETTINGS_KEYS['last_name'], true );

                // Combine names, fallback to display_name if empty.
                $full_name = trim( "$first_name $last_name" );
                if ( empty( $full_name ) ) {
                    $full_name = $user->display_name;
                }

                $formatted_followers[] = array(
                    'id'    => $user_id,
                    'name'  => $full_name,
                    'email' => $user->user_email,
                    'date'  => $follow_date,
                );
            }
        }

        return rest_ensure_response( $formatted_followers );
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
                    'applied_on'      => $store['create_time'],
                );
            }
        }

        // If this is a count-only request.
        if ( $request->get_param( 'count' ) ) {
            return count( $stores_with_withdraw );
        }

        // Pagination.
        $page   = max( 1, intval( $request->get_param( 'page' ) ) );
        $limit  = max( 1, intval( $request->get_param( 'row' ) ) );
        $offset = ( $page - 1 ) * $limit;

        return array_slice( $stores_with_withdraw, $offset, $limit );
    }

    /**
     * Get stores with deactivate requests
     *
     * @param object $request Request object.
     * @return array|int
     */
    private function get_stores_with_deactivate_requests( $request ) {
        $all_stores                 = StoreUtil::get_store_information(); // get all stores.
        $stores_deactivate_requests = array();

        foreach ( $all_stores as $store ) {
            $store_meta = Store::get_store( (int) $store['ID'] );

            if ( ! empty( $store_meta->meta_data[ Utill::STORE_SETTINGS_KEYS['deactivation_reason'] ] ) ) {
                $stores_deactivate_requests[] = array(
                    'id'         => (int) $store['ID'],
                    'store_name' => $store['name'],
                    'reason'     => $store_meta->meta_data[ Utill::STORE_SETTINGS_KEYS['deactivation_reason'] ],
                    'date'       => gmdate( 'M j, Y', strtotime( $store_meta->meta_data[ Utill::STORE_SETTINGS_KEYS['deactivation_request_date'] ] ) ),
                );
            }
        }

        if ( $request->get_param( 'count' ) ) {
            return count( $stores_deactivate_requests );
        }

        // Pagination.
        $page   = max( 1, intval( $request->get_param( 'page' ) ) );
        $limit  = max( 1, intval( $request->get_param( 'row' ) ) );
        $offset = ( $page - 1 ) * $limit;

        return array_slice( $stores_deactivate_requests, $offset, $limit );
    }
}
