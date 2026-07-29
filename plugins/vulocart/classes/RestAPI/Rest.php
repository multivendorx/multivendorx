<?php
/**
 * Rest class file.
 *
 * @package VuloCart
 */

namespace VuloCart\RestAPI;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Rest class.
 *
 * Plugin-level REST dispatcher — mirrors rest-api.md's documented two-tier
 * pattern: this builds a container of controllers and loops
 * `register_routes()` on `rest_api_init`. Module-scoped controllers (e.g.
 * `modules/Cart/Rest.php`, `modules/Order/Rest.php`, and vulocart-pro's
 * Passport module) self-hook `rest_api_init` independently instead of
 * registering here — see rest-api.md's "module-level controllers" tier.
 *
 * `vulocart_rest_controllers` is the extension point for anything that'd
 * rather add itself to this central dispatcher than self-hook
 * independently — same posture VuloPilot\RestAPI\Rest already uses.
 *
 * @class       Rest class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Rest {

    /**
     * Every registered controller, keyed by a short id.
     *
     * @var array<string, \WP_REST_Controller>
     */
    private array $controllers = array();

    /**
     * Rest constructor.
     */
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    /**
     * Instantiates every controller (own + filtered-in) and registers its
     * routes. A filtered-in controller that isn't already an instance, or
     * doesn't extend \WP_REST_Controller, is silently skipped.
     *
     * @return void
     */
    public function register_routes(): void {
        $this->controllers = array(
            'offerings'      => new Controllers\Offerings(),
            'modules'        => new Controllers\Modules(),
            'settings'       => new Controllers\Settings(),
            'terms'          => new Controllers\Terms(),
            'attributes'     => new Controllers\Attributes(),
            'reviews'        => new Controllers\Reviews(),
            'inventory'      => new Controllers\Inventory(),
            'offering_types' => new Controllers\OfferingTypes(),
        );

        $extra_controllers = apply_filters( 'vulocart_rest_controllers', array() );

        foreach ( $extra_controllers as $key => $controller ) {
            if ( $controller instanceof \WP_REST_Controller ) {
                $this->controllers[ $key ] = $controller;
            }
        }

        foreach ( $this->controllers as $controller ) {
            $controller->register_routes();
        }
    }
}
