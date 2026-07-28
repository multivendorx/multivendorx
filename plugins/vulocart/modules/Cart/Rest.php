<?php
/**
 * Rest class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Cart;

use VuloCart\Cart\Domain\Cart as CartEntity;
use VuloCart\Cart\Domain\CartItem;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Cart module Rest class.
 *
 * Module-level REST controller — self-hooks `rest_api_init` in its own
 * constructor rather than going through the plugin-level `RestAPI\Rest`
 * dispatcher, per rest-api.md's "module-level controllers" tier (same
 * pattern `vulocart-pro`'s Passport\Rest already establishes). A plain
 * class rather than `extends \WP_REST_Controller` — Passport's Rest is
 * the same, and this avoids a real bug hit earlier in this codebase's
 * history: a private helper named `prepare_item_for_response()` fatally
 * collided with `WP_REST_Controller`'s own public method of that name.
 *
 * `/cart`, `/cart/items`, `/cart/items/{id}`, `/cart/totals` — calls only
 * VuloCart()->cart_service, same "controller never touches a repository
 * directly" convention every other REST class in this codebase follows.
 *
 * Deliberately public (no `manage_options`/nonce requirement) — a cart has
 * to be reachable by a client with no WordPress session at all (a
 * headless storefront, a mobile app, an MCP client per the vision's
 * headless requirement), so the cart *token* is the access control here,
 * the same way a session id is for any other cart implementation.
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
            '/cart',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_item' ),
                    'permission_callback' => '__return_true',
                ),
                array(
                    'methods'             => \WP_REST_Server::DELETABLE,
                    'callback'            => array( $this, 'clear_cart' ),
                    'permission_callback' => '__return_true',
                ),
            )
        );

        register_rest_route(
            VuloCart()->rest_namespace,
            '/cart/totals',
            array(
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_totals' ),
                'permission_callback' => '__return_true',
            )
        );

        register_rest_route(
            VuloCart()->rest_namespace,
            '/cart/items',
            array(
                'methods'             => \WP_REST_Server::CREATABLE,
                'callback'            => array( $this, 'add_item' ),
                'permission_callback' => '__return_true',
            )
        );

        register_rest_route(
            VuloCart()->rest_namespace,
            '/cart/items/(?P<item_id>\d+)',
            array(
                array(
                    'methods'             => \WP_REST_Server::EDITABLE,
                    'callback'            => array( $this, 'update_item' ),
                    'permission_callback' => '__return_true',
                ),
                array(
                    'methods'             => \WP_REST_Server::DELETABLE,
                    'callback'            => array( $this, 'remove_item' ),
                    'permission_callback' => '__return_true',
                ),
            )
        );
    }

    /**
     * Resolves the cart token for a request: the `X-Cart-Token` header
     * takes precedence (the convention a headless client is expected to
     * use), falling back to a `cart_token` body/query param for simpler
     * same-origin callers. Sanitized to a safe, bounded token shape rather
     * than trusted as-is, even though it's only ever used in a `%s`
     * prepared placeholder.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return string
     */
    private function resolve_token( \WP_REST_Request $request ): string {
        $token = $request->get_header( 'X-Cart-Token' );

        if ( ! $token ) {
            $token = (string) $request->get_param( 'cart_token' );
        }

        $token = substr( preg_replace( '/[^a-zA-Z0-9-]/', '', (string) $token ), 0, 64 );

        return '' !== $token ? $token : wp_generate_uuid4();
    }

    /**
     * Converts a domain CartItem into the REST response shape, including
     * a display title from its Asset — bounded by cart size (a handful of
     * items), and AssetService's own in-request cache-by-id
     * (performance.md) means this never re-queries the same asset twice.
     *
     * @param CartItem $item Cart item to convert to a REST response shape.
     * @return array<string, mixed>
     */
    private function format_cart_item_for_response( CartItem $item ): array {
        $asset = VuloCart()->asset_service->get_asset( $item->asset_id );

        return array(
            'id'         => $item->id,
            'asset_id'   => $item->asset_id,
            'title'      => $asset ? $asset->title : null,
            'type'       => $asset ? $asset->type : null,
            'quantity'   => $item->quantity,
            'unit_price' => $item->unit_price,
            'currency'   => $item->currency,
            'subtotal'   => round( $item->unit_price * $item->quantity, 2 ),
        );
    }

    /**
     * Converts a domain Cart into the REST response shape.
     *
     * @param CartEntity $cart Cart to convert to a REST response shape.
     * @return array<string, mixed>
     */
    private function prepare_cart_for_response( CartEntity $cart ): array {
        return array(
            'token'      => $cart->token,
            'currency'   => $cart->currency,
            'item_count' => array_sum( array_map( fn( $item ) => $item->quantity, $cart->items ) ),
            'items'      => array_map( array( $this, 'format_cart_item_for_response' ), $cart->items ),
            'totals'     => VuloCart()->cart_service->get_totals( $cart ),
            'created_at' => $cart->created_at,
            'updated_at' => $cart->updated_at,
        );
    }

    /**
     * Returns a cart, without creating a row for a token nothing has been
     * added to yet — an anonymous page view shouldn't write a DB row just
     * because a client sent a freshly-generated token along with its
     * first, empty GET /cart.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response
     */
    public function get_item( $request ) {
        $token = $this->resolve_token( $request );
        $cart  = VuloCart()->cart_service->find_cart( $token );

        if ( ! $cart ) {
            return rest_ensure_response(
                array(
                    'token'      => $token,
                    'currency'   => null,
                    'item_count' => 0,
                    'items'      => array(),
                    'totals'     => array(
                        'currency'   => null,
                        'item_count' => 0,
                        'subtotal'   => 0.0,
                        'total'      => 0.0,
                    ),
                    'created_at' => null,
                    'updated_at' => null,
                )
            );
        }

        return rest_ensure_response( $this->prepare_cart_for_response( $cart ) );
    }

    /**
     * Returns just a cart's totals.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response
     */
    public function get_totals( $request ) {
        $token = $this->resolve_token( $request );
        $cart  = VuloCart()->cart_service->find_cart( $token );

        if ( ! $cart ) {
            return rest_ensure_response(
                array(
                    'currency'   => null,
                    'item_count' => 0,
                    'subtotal'   => 0.0,
                    'total'      => 0.0,
                )
            );
        }

        return rest_ensure_response( VuloCart()->cart_service->get_totals( $cart ) );
    }

    /**
     * Adds a quantity of an asset to a cart.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function add_item( $request ) {
        $asset_id = absint( $request->get_param( 'asset_id' ) );

        if ( ! $asset_id ) {
            return new \WP_Error(
                'vulocart_missing_asset_id',
                esc_html__( 'An asset_id is required.', 'vulocart' ),
                array( 'status' => 400 )
            );
        }

        $quantity_param = $request->get_param( 'quantity' );
        $quantity       = null === $quantity_param ? 1 : max( 1, absint( $quantity_param ) );
        $token          = $this->resolve_token( $request );

        try {
            $cart = VuloCart()->cart_service->add_item( $token, $asset_id, $quantity );
        } catch ( \InvalidArgumentException $exception ) {
            return new \WP_Error(
                'vulocart_invalid_asset',
                esc_html__( 'Invalid asset.', 'vulocart' ),
                array( 'status' => 400 )
            );
        }

        $response = rest_ensure_response( $this->prepare_cart_for_response( $cart ) );
        $response->set_status( 201 );

        return $response;
    }

    /**
     * Sets a line item's quantity.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response
     */
    public function update_item( $request ) {
        $token    = $this->resolve_token( $request );
        $item_id  = absint( $request->get_param( 'item_id' ) );
        $quantity = absint( $request->get_param( 'quantity' ) );

        $cart = VuloCart()->cart_service->update_item_quantity( $token, $item_id, $quantity );

        return rest_ensure_response( $this->prepare_cart_for_response( $cart ) );
    }

    /**
     * Removes one line item from a cart.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response
     */
    public function remove_item( $request ) {
        $token   = $this->resolve_token( $request );
        $item_id = absint( $request->get_param( 'item_id' ) );

        $cart = VuloCart()->cart_service->remove_item( $token, $item_id );

        return rest_ensure_response( $this->prepare_cart_for_response( $cart ) );
    }

    /**
     * Removes every line item from a cart.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response
     */
    public function clear_cart( $request ) {
        $token = $this->resolve_token( $request );
        $cart  = VuloCart()->cart_service->clear_cart( $token );

        return rest_ensure_response( $this->prepare_cart_for_response( $cart ) );
    }
}
