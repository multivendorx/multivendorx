<?php
/**
 * Rest class file
 *
 * @package CatalogX
 */

namespace CatalogX\Quote;

defined( 'ABSPATH' ) || exit;

/**
 * CatalogX Rest class
 *
 * @class       Rest class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Rest {

    /**
     * REST API controllers.
     *
     * @var object[]
     */
    private $container = array();

    /**
     * Constructor.
     */
    public function __construct() {
        $this->init_classes();

        add_action('rest_api_init',array( $this, 'register_rest_api_routes' ),10);
    }

    /**
     * Initialize REST controllers.
     *
     * @return void
     */
    private function init_classes() {
        $this->container = array(
            new QuoteAdd(),
            new QuoteCart(),
            new Quotes(),
        );
    }

    /**
     * Register REST API routes.
     *
     * @return void
     */
    public function register_rest_api_routes() {

        foreach ( $this->container as $controller ) {
            if ( method_exists( $controller, 'register_routes' ) ) {
                $controller->register_routes();
            }
        }
    }
}
