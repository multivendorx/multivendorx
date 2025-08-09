<?php

namespace MultiVendorX\RestAPI\Controllers;
use MultiVendorX\Store\StoreUtil;

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
        
    }

    public function create_item( $request ) {
        $store_data = $request->get_param('formData');

        $insert_id = StoreUtil::create_store([
            'name'          => $store_data[ 'name' ] ?? '',
            'slug'          => $store_data[ 'slug' ] ?? '',
            'description'   => $store_data[ 'description' ] ?? '',
            'who_created'   => 'admin' ?? '',
        ]);

        StoreUtil::create_store_meta([
            'store_id'      => $insert_id,
            'image'         => $store_data[ 'image' ] ?? '',
            'banner'        => $store_data[ 'banner' ] ?? '',
            'banner_type'   => 'image',
        ]);

        return rest_ensure_response ([ 'success' => true, 'id' => $insert_id ]);
    }

    public function get_item( $request ) {
        $id = $request->get_param('id');
        $store = StoreUtil::get_store_by_id($id);
        return new \WP_REST_Response($store, 200);
    }

    public function update_item($request) {
        $id   = $request->get_param('id');
        $data = $request->get_json_params();

        $updated = StoreUtil::update_store($id, [
            'name'          => $data['name'] ?? '',
            'slug'          => $data['slug'] ?? '',
            'description'   => $data['description'] ?? '',
            'who_created'   => 'admin' ?? '',
        ]);

        $updated = StoreUtil::update_store_meta($id, [
            'image'         => $data['image'] ?? '',
            'banner'        => $data['banner'] ?? '',
            'banner_type'   => 'image',
            'address_1'     => $data['address_1'] ?? '',
            'address_2'     => $data['address_2'] ?? '',
            'phone'         => $data['phone'] ?? '',
            'city'          => $data['city'] ?? '',
            'state'         => $data['state'] ?? '',
            'country'       => $data['country'] ?? '',
            'postcode'      => $data['postcode'] ?? '',
        ]);

        if ($updated) {
            return rest_ensure_response(['success' => true, 'id' => $id]);
        }
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