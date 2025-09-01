<?php

namespace MultiVendorX\RestAPI\Controllers;
use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Utill;

defined('ABSPATH') || exit;

class MultiVendorX_REST_Store_Controller extends \WP_REST_Controller {
    /**
	 * Endpoint namespace.
	 *
	 * @var string
	 */
	protected $namespace = 'multivendorx/v1';

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'store';

    public function register_routes() {
        register_rest_route( $this->namespace, '/' . $this->rest_base, [
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

        register_rest_route($this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', [
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

        register_rest_route($this->namespace, '/states/(?P<country>[A-Z]{2})', [
            'methods'               => \WP_REST_Server::READABLE,
            'callback'              => [$this, 'get_states_by_country'],
            'permission_callback'   => [$this, 'get_items_permissions_check'],
        ]);

    }

    public function get_items_permissions_check($request) {
        return current_user_can( 'read' );
    }

     // POST permission
    public function create_item_permissions_check($request) {
        return current_user_can( 'manage_options' );
    }

    public function update_item_permissions_check($request) {
        return current_user_can('manage_options');
    }


    // GET 
    public function get_items( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );
        }

        $limit          = max( intval( $request->get_param( 'row' ) ), 10 );
        $page           = max( intval( $request->get_param( 'page' ) ), 1 );
        $offset         = ( $page - 1 ) * $limit;
        $count          = $request->get_param( 'count' );

        $stores = StoreUtil::get_store();
    
        if ( $count ) {
            global $wpdb;
            $table_name = "{$wpdb->prefix}" . Utill::TABLES['store'];

            // Get total count
            $total_count = $wpdb->get_var( "SELECT COUNT(*) FROM $table_name" );
            return rest_ensure_response( (int) $total_count );
        }

        $formatted_stores = array();
        foreach ( $stores as $store ) {
            $store_id       = (int) $store['ID'];
            $store_name     = $store['name'];
            $store_slug     = $store['slug'];
            $status         = $store['status'];
            $formatted_stores[] = apply_filters(
                'multivendorx_stores',
                array(
					'id'                => $store_id,
					'store_name'        => $store_name,
					'store_slug'        => $store_slug,
					'status'      => $status,
				)
            );
        }

        return rest_ensure_response( $formatted_stores );
    }

    public function create_item( $request ) {
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

        if ( $insert_id ) {
            foreach ( $store_data as $key => $value ) {
                if ( ! in_array( $key, $core_fields, true ) ) {
                    $store->update_meta( $key, $value );
                }
            }
        }

        return rest_ensure_response( [
            'success' => true,
            'id'      => $insert_id,
        ] );
    }


    public function get_item( $request ) {
        $id = absint( $request->get_param( 'id' ) );

        // Load the store
        $store = new \MultiVendorX\Store\Store( $id );

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