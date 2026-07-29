<?php
/**
 * OfferingTypes class file.
 *
 * @package VuloCart
 */

namespace VuloCart\RestAPI\Controllers;

use VuloCart\Domain\Offering\OfferingType;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart OfferingTypes REST controller.
 *
 * Backs the Offerings menu's "Offering Types" admin page
 * (`src/pages/OfferingTypes/`) — deliberately read-only. Unlike
 * Categories/Brands/Collections/Attributes, an offering *type* isn't a
 * merchant-managed record: it's a closed, PHP-registered set
 * (Domain\Offering\OfferingType's own docblock — "this class is only the closed
 * set of known `type` values") that drives real per-type behavior
 * elsewhere (OfferingEdit.tsx's `TYPE_FIELD_CONFIG`,
 * classes/RestAPI/Controllers/Offerings.php's `TYPE_DETAIL_FIELDS`).
 * WooCommerce doesn't let you create a custom product type from wp-admin
 * either, for the identical reason — this page is a reference/dashboard
 * view (real per-type offering counts), not a type builder.
 *
 * @class       OfferingTypes class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class OfferingTypes extends \WP_REST_Controller {

    /**
     * REST base for this controller's routes.
     *
     * @var string
     */
    protected $rest_base = 'offering-types';

    /**
     * One short, merchant-facing description per OfferingType constant —
     * same hand-maintained-list convention every other small, stable
     * lookup table in this codebase already uses (e.g.
     * src/modules-config.ts's module descriptions).
     *
     * @var array<string, string>
     */
    const DESCRIPTIONS = array(
        'physical'     => 'A tangible item that ships to the buyer — has weight, dimensions, and stock.',
        'digital'      => 'A downloadable file or licensed digital good — no shipping.',
        'subscription' => 'A recurring charge on a billing interval (e.g. monthly, yearly).',
        'course'       => 'Structured lessons a buyer enrolls in.',
        'service'      => 'A time-based service booked or scheduled with the buyer.',
        'membership'   => 'Ongoing access to gated content or benefits.',
        'booking'      => 'A reservable time slot (e.g. an appointment or table).',
        'rental'       => 'A physical item rented for a period, then returned.',
        'bundle'       => 'Multiple offerings sold together as one purchasable item.',
        'donation'     => 'A buyer-chosen or fixed contribution amount.',
        'gift_card'    => 'A stored-value card redeemable for a future purchase.',
        'license'      => 'A software/content license key.',
    );

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
    }

    /**
     * Checks whether the current user can view the Offering Types page.
     *
     * @return bool
     */
    public function admin_permissions_check() {
        return current_user_can( 'manage_options' );
    }

    /**
     * Lists every OfferingType with its description and a real, live count
     * of offerings currently using it.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response
     */
    public function get_items( $request ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found
        $counts = VuloCart()->offering_service->count_offerings_by_type();

        $types = array_map(
            function ( $type ) use ( $counts ) {
                return array(
                    'type'           => $type,
                    'description'    => self::DESCRIPTIONS[ $type ] ?? '',
                    'offering_count' => isset( $counts[ $type ] ) ? $counts[ $type ] : 0,
                );
            },
            OfferingType::all()
        );

        return rest_ensure_response( $types );
    }
}
