<?php
/**
 * Rest class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Order;

use VuloCart\Order\Domain\Order as OrderEntity;
use VuloCart\Order\Domain\OrderItem;
use VuloCart\Utill;

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
 * work with no WordPress session. Every other route (listing, single-order
 * read/update, manual order creation, refunds, bulk actions) stays
 * `manage_options`-gated, matching every other admin-listing controller
 * (rest-api.md) — order management (as opposed to placing/tracking one's
 * own order) is store-owner-only.
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
            '/orders/manual',
            array(
                'methods'             => \WP_REST_Server::CREATABLE,
                'callback'            => array( $this, 'create_manual_item' ),
                'permission_callback' => array( $this, 'admin_permissions_check' ),
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
            '/orders/bulk-fulfillment-status',
            array(
                'methods'             => \WP_REST_Server::EDITABLE,
                'callback'            => array( $this, 'bulk_update_fulfillment_status' ),
                'permission_callback' => array( $this, 'admin_permissions_check' ),
            )
        );

        register_rest_route(
            VuloCart()->rest_namespace,
            '/orders/bulk-payment-status',
            array(
                'methods'             => \WP_REST_Server::EDITABLE,
                'callback'            => array( $this, 'bulk_update_payment_status' ),
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

        register_rest_route(
            VuloCart()->rest_namespace,
            '/orders/(?P<id>\d+)/refund',
            array(
                'methods'             => \WP_REST_Server::CREATABLE,
                'callback'            => array( $this, 'refund_item' ),
                'permission_callback' => array( $this, 'admin_permissions_check' ),
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
            'id'          => $item->id,
            'offering_id' => $item->offering_id,
            'title'       => $item->title,
            'quantity'    => $item->quantity,
            'unit_price'  => $item->unit_price,
            'currency'    => $item->currency,
            'subtotal'    => round( $item->unit_price * $item->quantity, 2 ),
        );
    }

    /**
     * Converts a domain Order into the REST response shape. `access_token`
     * is only ever included right after creation (create_item()/
     * create_manual_item()) — never on admin list/detail reads, so it
     * can't leak to anyone browsing the admin order list. `item_count` is
     * the sum of every line item's quantity — the admin grid's "Items"
     * column (OrdersList.tsx).
     *
     * @param OrderEntity $order          Order to convert to a REST response shape.
     * @param bool        $include_token Whether to include access_token (only true right after creation).
     * @return array<string, mixed>
     */
    private function prepare_order_for_response( OrderEntity $order, bool $include_token = false ): array {
        $response = array(
            'id'                 => $order->id,
            'order_number'       => $order->order_number,
            'customer_email'     => $order->customer_email,
            'customer_name'      => $order->customer_name,
            'payment_status'     => $order->payment_status,
            'fulfillment_status' => $order->fulfillment_status,
            'refunded_amount'    => $order->refunded_amount,
            'currency'           => $order->currency,
            'subtotal'           => $order->subtotal,
            'total'              => $order->total,
            'item_count'         => array_sum( array_map( fn( $item ) => $item->quantity, $order->items ) ),
            'items'              => array_map( array( $this, 'format_order_item_for_response' ), $order->items ),
            'created_at'         => $order->created_at,
            'updated_at'         => $order->updated_at,
        );

        if ( $include_token ) {
            $response['access_token'] = $order->access_token;
        }

        return $response;
    }

    /**
     * Lists orders, paginated — admin only. Also returns per-
     * fulfillment-status counts as response headers (`X-WP-Count-{status}`)
     * so the admin grid can render real "saved view" tab counts (TableCard's
     * `categoryCounts`, OrdersList.tsx) without a second request.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response
     */
    public function get_items( $request ) {
        $page               = absint( $request->get_param( 'page' ) ? $request->get_param( 'page' ) : 1 );
        $per_page           = absint( $request->get_param( 'per_page' ) ? $request->get_param( 'per_page' ) : 20 );
        $payment_status     = sanitize_key( (string) $request->get_param( 'payment_status' ) );
        $fulfillment_status = sanitize_key( (string) $request->get_param( 'fulfillment_status' ) );
        $search             = sanitize_text_field( (string) $request->get_param( 'search' ) );
        $date_from          = sanitize_text_field( (string) $request->get_param( 'date_from' ) );
        $date_to            = sanitize_text_field( (string) $request->get_param( 'date_to' ) );

        $result = VuloCart()->order_service->list_orders(
            array(
                'page'               => $page,
                'per_page'           => $per_page,
                'payment_status'     => $payment_status,
                'fulfillment_status' => $fulfillment_status,
                'search'             => $search,
                'date_from'          => $date_from,
                'date_to'            => $date_to,
            )
        );

        $response = rest_ensure_response( array_map( array( $this, 'prepare_order_for_response' ), $result['data'] ) );
        $response->header( 'X-WP-Total', (string) $result['total'] );
        $response->header( 'X-WP-TotalPages', (string) ceil( $result['total'] / max( 1, $per_page ) ) );

        foreach ( VuloCart()->order_service->count_orders_by_fulfillment_status() as $status => $count ) {
            $response->header( 'X-WP-Count-' . $status, (string) $count );
        }

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
     * Gated on the Checkout tab's `guest_checkout_enabled` setting: when
     * disabled, a request from a visitor with no active WordPress session
     * is rejected rather than silently placing a guest order — the same
     * enforcement `src/blocks/checkout/Checkout.tsx` also applies
     * client-side (hiding the "Place Order" button), duplicated here since
     * a client-side-only check is not real enforcement (a direct API call
     * would bypass it).
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function create_item( $request ) {
        $settings = wp_parse_args( get_option( Utill::SETTINGS_KEY, array() ), Utill::SETTINGS_DEFAULTS );

        if ( empty( $settings['guest_checkout_enabled'] ) && ! is_user_logged_in() ) {
            return new \WP_Error(
                'vulocart_guest_checkout_disabled',
                esc_html__( 'Guest checkout is disabled. Please log in to place an order.', 'vulocart' ),
                array( 'status' => 401 )
            );
        }

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
     * Creates a draft order directly from a merchant-picked item list —
     * admin only. Backs OrderAdd.tsx's "Add New" order page.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function create_manual_item( $request ) {
        $items = $request->get_param( 'items' );

        if ( ! is_array( $items ) || empty( $items ) ) {
            return new \WP_Error( 'vulocart_missing_items', esc_html__( 'At least one item is required.', 'vulocart' ), array( 'status' => 400 ) );
        }

        $sanitized_items = array();

        foreach ( $items as $item ) {
            if ( ! is_array( $item ) || empty( $item['offering_id'] ) ) {
                continue;
            }

            $sanitized_items[] = array(
                'offering_id' => absint( $item['offering_id'] ),
                'quantity'    => isset( $item['quantity'] ) ? absint( $item['quantity'] ) : 1,
            );
        }

        $customer_email = $request->get_param( 'customer_email' ) ? sanitize_email( (string) $request->get_param( 'customer_email' ) ) : null;
        $customer_name  = $request->get_param( 'customer_name' ) ? sanitize_text_field( (string) $request->get_param( 'customer_name' ) ) : null;

        try {
            $order = VuloCart()->order_service->create_manual_order( $sanitized_items, $customer_email, $customer_name );
        } catch ( \InvalidArgumentException $exception ) {
            return new \WP_Error( 'vulocart_invalid_manual_order', esc_html( $exception->getMessage() ), array( 'status' => 400 ) );
        }

        $response = rest_ensure_response( $this->prepare_order_for_response( $order ) );
        $response->set_status( 201 );

        return $response;
    }

    /**
     * Updates an order's payment and/or fulfillment status — admin only.
     * Either field alone is accepted (OrderEdit.tsx saves whichever
     * changed), both together also works.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function update_item( $request ) {
        $id = absint( $request->get_param( 'id' ) );

        $order = null;

        try {
            if ( null !== $request->get_param( 'fulfillment_status' ) ) {
                $order = VuloCart()->order_service->update_fulfillment_status(
                    $id,
                    sanitize_key( (string) $request->get_param( 'fulfillment_status' ) )
                );
            }

            if ( null !== $request->get_param( 'payment_status' ) ) {
                $order = VuloCart()->order_service->update_payment_status(
                    $id,
                    sanitize_key( (string) $request->get_param( 'payment_status' ) )
                );
            }
        } catch ( \InvalidArgumentException $exception ) {
            return new \WP_Error( 'vulocart_invalid_status', esc_html( $exception->getMessage() ), array( 'status' => 400 ) );
        }

        if ( ! $order ) {
            $order = VuloCart()->order_service->get_order( $id );
        }

        if ( ! $order ) {
            return new \WP_Error( 'vulocart_order_not_found', esc_html__( 'Order not found.', 'vulocart' ), array( 'status' => 404 ) );
        }

        return rest_ensure_response( $this->prepare_order_for_response( $order ) );
    }

    /**
     * Issues a refund on an order — admin only.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function refund_item( $request ) {
        $amount = $request->get_param( 'amount' );

        if ( null === $amount || ! is_numeric( $amount ) || (float) $amount <= 0 ) {
            return new \WP_Error( 'vulocart_invalid_refund_amount', esc_html__( 'A positive refund amount is required.', 'vulocart' ), array( 'status' => 400 ) );
        }

        $order = VuloCart()->order_service->refund_order( absint( $request->get_param( 'id' ) ), (float) $amount );

        if ( ! $order ) {
            return new \WP_Error( 'vulocart_order_not_found', esc_html__( 'Order not found.', 'vulocart' ), array( 'status' => 404 ) );
        }

        return rest_ensure_response( $this->prepare_order_for_response( $order ) );
    }

    /**
     * Transitions many orders to the same fulfillment status in one
     * request — backs the admin grid's bulk-action dropdown. Admin only,
     * same gate as every other order-management route.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function bulk_update_fulfillment_status( $request ) {
        $ids = $request->get_param( 'ids' );

        if ( ! is_array( $ids ) || empty( $ids ) ) {
            return new \WP_Error( 'vulocart_missing_order_ids', esc_html__( 'No order ids were provided.', 'vulocart' ), array( 'status' => 400 ) );
        }

        $ids    = array_map( 'absint', $ids );
        $status = sanitize_key( (string) $request->get_param( 'status' ) );

        try {
            $updated = VuloCart()->order_service->bulk_update_fulfillment_status( $ids, $status );
        } catch ( \InvalidArgumentException $exception ) {
            return new \WP_Error( 'vulocart_invalid_status', esc_html( $exception->getMessage() ), array( 'status' => 400 ) );
        }

        return rest_ensure_response( array( 'updated' => $updated ) );
    }

    /**
     * Transitions many orders to the same payment status in one request —
     * same reasoning as bulk_update_fulfillment_status().
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function bulk_update_payment_status( $request ) {
        $ids = $request->get_param( 'ids' );

        if ( ! is_array( $ids ) || empty( $ids ) ) {
            return new \WP_Error( 'vulocart_missing_order_ids', esc_html__( 'No order ids were provided.', 'vulocart' ), array( 'status' => 400 ) );
        }

        $ids    = array_map( 'absint', $ids );
        $status = sanitize_key( (string) $request->get_param( 'status' ) );

        try {
            $updated = VuloCart()->order_service->bulk_update_payment_status( $ids, $status );
        } catch ( \InvalidArgumentException $exception ) {
            return new \WP_Error( 'vulocart_invalid_status', esc_html( $exception->getMessage() ), array( 'status' => 400 ) );
        }

        return rest_ensure_response( array( 'updated' => $updated ) );
    }
}
