<?php

namespace MultiVendorX\RestAPI\Controllers;

defined( 'ABSPATH' ) || exit;

class MultiVendorX_REST_Orders_Controller extends \WP_REST_Controller {

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
	protected $rest_base = 'orders';

    public function register_routes() {
        register_rest_route(
            $this->namespace,
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
					'args'                => $this->get_endpoint_args_for_item_schema( true ),
				),
			)
        );
    }


    // GET permission
    public function get_items_permissions_check( $request ) {
        return current_user_can( 'read' );
    }

    // POST permission
    public function create_item_permissions_check( $request ) {
        return current_user_can( 'edit_posts' );
    }

    // GET /books
    public function get_items( $request ) {
    }

    public function create_item( $request ) {
    }
}
