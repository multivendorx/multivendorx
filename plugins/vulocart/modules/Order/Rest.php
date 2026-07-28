<?php
/**
 * Rest class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Order;

use VuloCart\Order\Domain\Order as OrderEntity;
use VuloCart\Order\Domain\OrderItem;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Order module Rest class.
 *
 * Module-level REST controller — self-hooks `rest_api_init` in its own
 * constructor, per rest-api.md's "module-level controllers" tier, same as
 * VuloCart\Cart\Rest. `POST /orders` (create from cart) and
 * `GET /orders/track` are public, same "cart token is the access control"
 * reasoning VuloCart\Cart\Rest's docblock explains — a guest placing an
 * order and a guest checking on the order they just placed both need to
 * work with no WordPress session. `GET /orders`, `GET /orders/{id}`, and
 * `PATCH /orders/{id}` stay `manage_options`-gated, matching every other
 * admin-listing controller (rest-api.md) — order management (as opposed
 * to placing/tracking one's own order) is store-owner-only.
 *
 * @class       Rest class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Rest {

    /**
     * Rest constructor.
     */
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    /**
     * Registers this module's REST routes.
     *
     * @return void
     */
    public function register_routes(): void {
        register_rest_route(
            VuloCart()->rest_namespace,
            '/orders',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_items' ),
                    'permission_callback' => array( $this, 'admin_permissions_check' ),
                ),
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'create_item' ),
                    'permission_callback' => '__return_true',
                ),
            )
        );

        register_rest_route(
            VuloCart()->rest_namespace,
            '/orders/track',
            array(
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => array( $this, 'track_item' ),
                'permission_callback' => '__return_true',
            )
        );

        register_rest_route(
            VuloCart()->rest_namespace,
            '/orders/bulk-status',
            array(
                'methods'             => \WP_REST_Server::EDITABLE,
                'callback'            => array( $this, 'bulk_update_status' ),
                'permission_callback' => array( $this, 'admin_permissions_check' ),
            )
        );

        register_rest_route(
            VuloCart()->rest_namespace,
            '/orders/(?P<id>\d+)',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_item' ),
                    'permission_callback' => array( $this, 'admin_permissions_check' ),
                ),
                array(
                    'methods'             => \WP_REST_Server::EDITABLE,
                    'callback'            => array( $this, 'update_item' ),
                    'permission_callback' => array( $this, 'admin_permissions_check' ),
                ),
            )
        );
    }

    /**
     * Checks whether the current user can manage orders.
     *
     * @return bool
     */
    public function admin_permissions_check() {
        return current_user_can( 'manage_options' );
    }

    /**
     * Converts a domain OrderItem into the REST response shape.
     *
     * @param OrderItem $item Order item to convert to a REST response shape.
     * @return array<string, mixed>
     */
    private function format_order_item_for_response( OrderItem $item ): array {
        return array(
            'id'         => $item->id,
            'asset_id'   => $item->asset_id,
            'title'      => $item->title,
            'quantity'   => $item->quantity,
            'unit_price' => $item->unit_price,
            'currency'   => $item->currency,
            'subtotal'   => round( $item->unit_price * $item->quantity, 2 ),
        );
    }

    /**
     * Converts a domain Order into the REST response shape. `access_token`
     * is only ever included right after creation (create_item()) — never
     * on admin list/detail reads, so it can't leak to anyone browsing the
     * admin order list.
     *
     * @param OrderEntity $order          Order to convert to a REST response shape.
     * @param bool        $include_token Whether to include access_token (only true right after creation).
     * @return array<string, mixed>
     */
    private function prepare_order_for_response( OrderEntity $order, bool $include_token = false ): array {
        $response = array(
            'id'             => $order->id,
            'order_number'   => $order->order_number,
            'customer_email' => $order->customer_email,
            'customer_name'  => $order->customer_name,
            'status'         => $order->status,
            'currency'       => $order->currency,
            'subtotal'       => $order->subtotal,
            'total'          => $order->total,
            'items'          => array_map( array( $this, 'format_order_item_for_response' ), $order->items ),
            'created_at'     => $order->created_at,
            'updated_at'     => $order->updated_at,
        );

        if ( $include_token ) {
            $response['access_token'] = $order->access_token;
        }

        return $response;
    }

    /**
     * Lists orders, paginated — admin only.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response
     */
    public function get_items( $request ) {
        $page     = absint( $request->get_param( 'page' ) ? $request->get_param( 'page' ) : 1 );
        $per_page = absint( $request->get_param( 'per_page' ) ? $request->get_param( 'per_page' ) : 20 );
        $status   = sanitize_key( (string) $request->get_param( 'status' ) );
        $search   = sanitize_text_field( (string) $request->get_param( 'search' ) );

        $result = VuloCart()->order_service->list_orders(
            array(
                'page'     => $page,
                'per_page' => $per_page,
                'status'   => $status,
                'search'   => $search,
            )
        );

        $response = rest_ensure_response( array_map( array( $this, 'prepare_order_for_response' ), $result['data'] ) );
        $response->header( 'X-WP-Total', (string) $result['total'] );
        $response->header( 'X-WP-TotalPages', (string) ceil( $result['total'] / max( 1, $per_page ) ) );

        return $response;
    }

    /**
     * Fetches one order by id — admin only.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function get_item( $request ) {
        $order = VuloCart()->order_service->get_order( absint( $request->get_param( 'id' ) ) );

        if ( ! $order ) {
            return new \WP_Error( 'vulocart_order_not_found', esc_html__( 'Order not found.', 'vulocart' ), array( 'status' => 404 ) );
        }

        return rest_ensure_response( $this->prepare_order_for_response( $order ) );
    }

    /**
     * The guest order-tracking lookup: order number + access token, both
     * required — neither alone is treated as sufficient authorization.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function track_item( $request ) {
        $order_number = sanitize_text_field( (string) $request->get_param( 'order_number' ) );
        $access_token = sanitize_text_field( (string) $request->get_param( 'access_token' ) );

        if ( '' === $order_number || '' === $access_token ) {
            return new \WP_Error(
                'vulocart_missing_tracking_params',
                esc_html__( 'order_number and access_token are both required.', 'vulocart' ),
                array( 'status' => 400 )
            );
        }

        $order = VuloCart()->order_service->track_order( $order_number, $access_token );

        if ( ! $order ) {
            return new \WP_Error( 'vulocart_order_not_found', esc_html__( 'Order not found.', 'vulocart' ), array( 'status' => 404 ) );
        }

        return rest_ensure_response( $this->prepare_order_for_response( $order ) );
    }

    /**
     * Creates an order from a cart. Public — see class docblock.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function create_item( $request ) {
        $cart_token = $request->get_header( 'X-Cart-Token' );

        if ( ! $cart_token ) {
            $cart_token = (string) $request->get_param( 'cart_token' );
        }

        $cart_token = substr( preg_replace( '/[^a-zA-Z0-9-]/', '', (string) $cart_token ), 0, 64 );

        if ( '' === $cart_token ) {
            return new \WP_Error(
                'vulocart_missing_cart_token',
                esc_html__( 'A cart_token (or X-Cart-Token header) is required.', 'vulocart' ),
                array( 'status' => 400 )
            );
        }

        $customer_email = $request->get_param( 'customer_email' ) ? sanitize_email( (string) $request->get_param( 'customer_email' ) ) : null;
        $customer_name  = $request->get_param( 'customer_name' ) ? sanitize_text_field( (string) $request->get_param( 'customer_name' ) ) : null;

        try {
            $order = VuloCart()->order_service->create_from_cart( $cart_token, $customer_email, $customer_name );
        } catch ( \InvalidArgumentException $exception ) {
            return new \WP_Error( 'vulocart_empty_cart', esc_html__( 'Cart is empty or does not exist.', 'vulocart' ), array( 'status' => 400 ) );
        }

        $response = rest_ensure_response( $this->prepare_order_for_response( $order, true ) );
        $response->set_status( 201 );

        return $response;
    }

    /**
     * Updates an order's status — admin only.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function update_item( $request ) {
        $status = sanitize_key( (string) $request->get_param( 'status' ) );

        try {
            $order = VuloCart()->order_service->update_status( absint( $request->get_param( 'id' ) ), $status );
        } catch ( \InvalidArgumentException $exception ) {
            return new \WP_Error( 'vulocart_invalid_status', esc_html__( 'Invalid order status.', 'vulocart' ), array( 'status' => 400 ) );
        }

        if ( ! $order ) {
            return new \WP_Error( 'vulocart_order_not_found', esc_html__( 'Order not found.', 'vulocart' ), array( 'status' => 404 ) );
        }

        return rest_ensure_response( $this->prepare_order_for_response( $order ) );
    }

    /**
     * Transitions many orders to the same status in one request — backs
     * the admin grid's bulk-action dropdown. Admin only, same gate as
     * every other order-management route.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function bulk_update_status( $request ) {
        $ids = $request->get_param( 'ids' );

        if ( ! is_array( $ids ) || empty( $ids ) ) {
            return new \WP_Error( 'vulocart_missing_order_ids', esc_html__( 'No order ids were provided.', 'vulocart' ), array( 'status' => 400 ) );
        }

        $ids    = array_map( 'absint', $ids );
        $status = sanitize_key( (string) $request->get_param( 'status' ) );

        try {
            $updated = VuloCart()->order_service->bulk_update_status( $ids, $status );
        } catch ( \InvalidArgumentException $exception ) {
            return new \WP_Error( 'vulocart_invalid_status', esc_html__( 'Invalid order status.', 'vulocart' ), array( 'status' => 400 ) );
        }

        return rest_ensure_response( array( 'updated' => $updated ) );
    }
}
