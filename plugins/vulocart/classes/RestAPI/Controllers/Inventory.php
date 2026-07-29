<?php
/**
 * Inventory class file.
 *
 * @package VuloCart
 */

namespace VuloCart\RestAPI\Controllers;

use VuloCart\Domain\Offering\Offering;
use VuloCart\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Inventory REST controller.
 *
 * Backs the Offerings menu's "Inventory" admin page
 * (`src/pages/Inventory/`) — a specialized, admin-only view over the
 * existing `vulocart_offerings` table (Application\OfferingService), not a new
 * domain entity of its own: "inventory" is just "offerings of a
 * stock-trackable type, with their stock fields surfaced for quick bulk
 * editing". `manage_options`-gated throughout, same as every other
 * offering-management route.
 *
 * @class       Inventory class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Inventory extends \WP_REST_Controller {

    /**
     * REST base for this controller's routes.
     *
     * @var string
     */
    protected $rest_base = 'inventory';

    /**
     * Offering types stock tracking is meaningful for — same
     * hand-maintained list `OfferingEdit.tsx`'s own `STOCK_TRACKED_TYPES`
     * duplicates independently (small, stable, per-type distinction
     * Domain\Offering\OfferingType's own docblock deliberately keeps out of
     * that class).
     *
     * @var string[]
     */
    const STOCK_TRACKED_TYPES = array( 'physical', 'rental', 'bundle', 'gift_card' );

    /**
     * Registers this controller's REST routes.
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            VuloCart()->rest_namespace,
            '/' . $this->rest_base,
            array(
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_items' ),
                'permission_callback' => array( $this, 'admin_permissions_check' ),
            )
        );

        register_rest_route(
            VuloCart()->rest_namespace,
            '/' . $this->rest_base . '/(?P<id>\d+)',
            array(
                'methods'             => \WP_REST_Server::EDITABLE,
                'callback'            => array( $this, 'update_item' ),
                'permission_callback' => array( $this, 'admin_permissions_check' ),
            )
        );
    }

    /**
     * Checks whether the current user can manage inventory.
     *
     * @return bool
     */
    public function admin_permissions_check() {
        return current_user_can( 'manage_options' );
    }

    /**
     * Converts a domain Offering into the Inventory REST response shape —
     * only the fields the Inventory list actually needs, not the full
     * shape `Offerings::prepare_offering_for_response()` returns.
     *
     * @param Offering $offering     Offering to convert to a REST response shape.
     * @param int      $threshold The Catalog tab's `low_stock_threshold` setting.
     * @return array<string, mixed>
     */
    private function prepare_inventory_item_for_response( Offering $offering, int $threshold ): array {
        $quantity = $offering->meta['stock_quantity'] ?? null;

        return array(
            'id'               => $offering->id,
            'title'            => $offering->title,
            'type'             => $offering->type,
            'sku'              => $offering->sku,
            'stock_management' => ! empty( $offering->meta['stock_management'] ),
            'stock_status'     => $offering->meta['stock_status'] ?? 'in_stock',
            'stock_quantity'   => $quantity,
            'low_stock'        => null !== $quantity && $quantity <= $threshold,
        );
    }

    /**
     * Lists every offering of a stock-trackable type.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response
     */
    public function get_items( $request ) {
        $page     = absint( $request->get_param( 'page' ) ? $request->get_param( 'page' ) : 1 );
        $per_page = absint( $request->get_param( 'per_page' ) ? $request->get_param( 'per_page' ) : 20 );
        $search   = sanitize_text_field( (string) $request->get_param( 'search' ) );

        $settings  = wp_parse_args( get_option( Utill::SETTINGS_KEY, array() ), Utill::SETTINGS_DEFAULTS );
        $threshold = (int) $settings['low_stock_threshold'];

        // OfferingService/WPDBOfferingRepository don't support filtering by a
        // set of types (only one), so this fetches a generously-sized
        // page of every offering and filters client-of-the-repository
        // side — acceptable at this plugin's current catalog-size scale,
        // same tradeoff Terms.php's own `count_offerings_for_term()` accepts
        // for a `LIKE`-based count rather than a maintained join table.
        $result = VuloCart()->offering_service->list_offerings(
            array(
                'page'     => 1,
                'per_page' => 500,
            )
        );

        $items = array_filter(
            $result['data'],
            function ( $offering ) use ( $search ) {
                if ( ! in_array( $offering->type, self::STOCK_TRACKED_TYPES, true ) ) {
                    return false;
                }

                if ( '' !== $search && false === stripos( $offering->title, $search ) && false === stripos( (string) $offering->sku, $search ) ) {
                    return false;
                }

                return true;
            }
        );

        $items = array_values( $items );
        $total = count( $items );
        $items = array_slice( $items, ( $page - 1 ) * $per_page, $per_page );

        $response = rest_ensure_response(
            array_map(
                function ( $offering ) use ( $threshold ) {
                    return $this->prepare_inventory_item_for_response( $offering, $threshold );
                },
                $items
            )
        );
        $response->header( 'X-WP-Total', (string) $total );
        $response->header( 'X-WP-TotalPages', (string) ceil( $total / max( 1, $per_page ) ) );

        return $response;
    }

    /**
     * Quick-updates one offering's stock fields.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function update_item( $request ) {
        $id       = absint( $request->get_param( 'id' ) );
        $offering = VuloCart()->offering_service->get_offering( $id );

        if ( ! $offering ) {
            return new \WP_Error( 'vulocart_offering_not_found', esc_html__( 'No offering exists with this id.', 'vulocart' ), array( 'status' => 404 ) );
        }

        $meta = $offering->meta;

        if ( null !== $request->get_param( 'stock_quantity' ) ) {
            $meta['stock_quantity'] = max( 0, absint( $request->get_param( 'stock_quantity' ) ) );
        }

        if ( null !== $request->get_param( 'stock_status' ) && in_array( $request->get_param( 'stock_status' ), array( 'in_stock', 'out_of_stock', 'backorder' ), true ) ) {
            $meta['stock_status'] = $request->get_param( 'stock_status' );
        }

        $offering = VuloCart()->offering_service->update_offering( $id, array( 'meta' => $meta ) );

        $settings  = wp_parse_args( get_option( Utill::SETTINGS_KEY, array() ), Utill::SETTINGS_DEFAULTS );
        $threshold = (int) $settings['low_stock_threshold'];

        return rest_ensure_response( $this->prepare_inventory_item_for_response( $offering, $threshold ) );
    }
}
