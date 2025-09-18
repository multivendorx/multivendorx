<?php

namespace MultiVendorX\RestAPI\Controllers;
use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Utill;

defined('ABSPATH') || exit;

class MultiVendorX_REST_Payouts_Controller extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'payouts';

    public function register_routes() {
        register_rest_route( MultiVendorX()->rest_namespace, '/' . $this->rest_base, [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [ $this, 'get_items' ],
                'permission_callback' => [ $this, 'get_items_permissions_check' ],
            ],
            [
                'methods'             => \WP_REST_Server::CREATABLE,
                'callback'            => [ $this, 'create_item' ],
                'permission_callback' => [ $this, 'create_item_permissions_check' ],
            ],
        ] );

        register_rest_route(MultiVendorX()->rest_namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', [
            [
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => [$this, 'get_item'],
                'permission_callback' => [$this, 'get_items_permissions_check'],
                'args'                => [
                    'id' => ['required' => true],
                ],
            ],
            [
                'methods'             => \WP_REST_Server::EDITABLE,
                'callback'            => [$this, 'update_item'],
                'permission_callback' => [$this, 'update_item_permissions_check'],
            ],
        ]);

        register_rest_route(MultiVendorX()->rest_namespace, '/states/(?P<country>[A-Z]{2})', [
            'methods'               => \WP_REST_Server::READABLE,
            'callback'              => [$this, 'get_states_by_country'],
            'permission_callback'   => [$this, 'get_items_permissions_check'],
        ]);

    }

    public function get_items_permissions_check($request) {
        // return current_user_can( 'read' );
        return true;
    }

     // POST permission
    public function create_item_permissions_check($request) {
        // return current_user_can( 'manage_options' );
        return true;
    }

    public function update_item_permissions_check($request) {
        // return current_user_can('manage_options');
        return true;
    }


    // GET 
    public function get_items( $request ) {
        // Verify nonce
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );
        }
    
        // Pagination
        $limit  = max( intval( $request->get_param( 'row' ) ), 10 );
        $page   = max( intval( $request->get_param( 'page' ) ), 1 );
        $offset = ( $page - 1 ) * $limit;
        $count  = $request->get_param( 'count' );
    
        // Count only
        if ( $count ) {
            $pending_products_count = count( wc_get_products( array(
                'status'   => 'pending',
                'limit'    => -1,
                'return'   => 'ids',
                'meta_key' => 'multivendorx_store_id',
            ) ) );
    
            return rest_ensure_response( (int) $pending_products_count );
        }
    
        // Fetch pending products with pagination
        $pending_products = wc_get_products( array(
            'status'   => 'pending',
            'limit'    => $limit,
            'offset'   => $offset,
            'return'   => 'objects',
            'meta_key' => 'multivendorx_store_id',
        ) );
    
        $formatted_products = array();
        foreach ( $pending_products as $product ) {
            $formatted_products[] = apply_filters(
                'multivendorx_product',
                array(
                    'id'     => $product->get_id(),
                    'name'   => $product->get_name(),
                    'sku'    => $product->get_sku(),
                    'price'  => $product->get_price(),
                    'status' => $product->get_status(),
                )
            );
        }
    
        return rest_ensure_response( $formatted_products );
    }
    
    public function create_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );
        }
        $registrations = $request->get_header( 'registrations' );

        $store_data = $request->get_param('formData');
        // Create store object
        $store = new \MultiVendorX\Store\Store();

        $core_fields = [ 'name', 'slug', 'description', 'who_created', 'status' ];
        foreach ( $core_fields as $field ) {
            if ( isset( $store_data[ $field ] ) ) {
                $store->set( $field, $store_data[ $field ] );
            }
        }

        $insert_id = $store->save();

        if ( $insert_id && ! $registrations ) {
            foreach ( $store_data as $key => $value ) {
                if ( ! in_array( $key, $core_fields, true ) ) {
                    $store->update_meta( $key, $value );
                }
            }
        }

        if ( $registrations ) {
            // Collect all non-core fields into one array
            $non_core_fields = [];
            foreach ( $store_data as $key => $value ) {
                if ( ! in_array( $key, $core_fields, true ) ) {
                    $non_core_fields[$key] = $value;
                }
            }

            // Save them under one key
            if ( ! empty( $non_core_fields ) ) {
                $store->update_meta( 'multivendorx-registration-data', $non_core_fields );
            }
        }

        return rest_ensure_response( [
            'success' => true,
            'id'      => $insert_id,
        ] );
    }

    public function get_item( $request ) {
        $id = absint( $request->get_param( 'id' ) );
        $fetch_user = $request->get_param( 'fetch_user' );
        $registrations = $request->get_header( 'registrations' );
        if ($fetch_user) {
            $users = StoreUtil::get_store_users($id);

            $response = [
                'id'           => $id,
                'store_owners' => $users,
            ];
            return rest_ensure_response( $response );
        }

        // Load the store
        $store = new \MultiVendorX\Store\Store( $id );
        if ( $registrations ) {
            $response = StoreUtil::get_store_registration_form( $store->get_id() );

            return rest_ensure_response( $response );
        }

        $response = [
            'id'          => $store->get_id(),
            'name'        => $store->get('name'),
            'slug'        => $store->get('slug'),
            'description' => $store->get('description'),
            'who_created' => $store->get('who_created'),
            'status'      => $store->get('status'),
        ];

        // Add meta data
        foreach ( $store->meta_data as $key => $values ) {
            $response[ $key ] = is_array( $values ) ? $values[0] : $values;
        }

        return rest_ensure_response( $response );
    }

    public function update_item( $request ) {
        $id   = absint( $request->get_param( 'id' ) );
        $data = $request->get_json_params();

        $store = new \MultiVendorX\Store\Store( $id );

        if ( $data['store_owners'] ) {
            StoreUtil::add_store_users([
                'store_id' => $data['id'],
                'store_owners' => $data['store_owners'],
                'role_id' => 'store_owner',
            ]);

            return rest_ensure_response( [
                'success' => true
            ] );
        }
        
        $store->set( 'name',        $data['name'] ?? $store->get('name') );
        $store->set( 'slug',        $data['slug'] ?? $store->get('slug') );
        $store->set( 'description', $data['description'] ?? $store->get('description') );
        $store->set( 'who_created', 'admin' );
        $store->set( 'status',      $data['status'] ?? $store->get('status') );

        if ( is_array( $data ) ) {
            foreach ( $data as $key => $value ) {
                if ( ! in_array( $key, [ 'id', 'name', 'slug', 'description', 'who_created', 'status' ], true ) ) {
                    $store->update_meta( $key, $value );
                }
            }
        }

        $store->save();

        return rest_ensure_response( [
            'success' => true,
            'id'      => $store->get_id(),
        ] );
    }


    public function get_states_by_country($request) {
        $country_code = $request->get_param('country');
        $states = WC()->countries->get_states($country_code);

        $state_list = [];

        if (is_array($states)) {
            foreach ($states as $code => $name) {
                $state_list[] = [
                    'label' => $name,
                    'value' => $code,
                ];
            }
        }

        return rest_ensure_response($state_list);
    }
}