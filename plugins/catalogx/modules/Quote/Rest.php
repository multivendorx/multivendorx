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
     * Controllers for all our classes
     *
     * @var array
     */
    private $controllers = array();
    /**
     * Rest class constructor function
     */
    public function __construct() {
        $this->register_controllers();
        add_action( 'rest_api_init', array( $this, 'register_rest_api_routes' ), 10 );
    }

    /**
     * Initialize all REST API controller classes.
     */
    public function register_controllers() {
        $this->controllers = array(
            'quote-add'         => new QuoteAdd(),
            'quote-cart'        => new QuoteCart(),
            'quotes'            => new Quotes(),
        );
    }

    /**
     * Register rest api
     *
     * @return void
     */
    public function register_rest_api_routes() {

        foreach ( $this->controllers as $rest_controller ) {
            if ( method_exists( $rest_controller, 'register_routes' ) ) {
                $rest_controller->register_routes();
            }
        }

    }
}
