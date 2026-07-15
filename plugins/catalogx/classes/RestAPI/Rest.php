<?php
/**
 * Rest class file
 *
 * @package CatalogX
 */

namespace CatalogX\RestAPI;

use CatalogX\Enquiry\Module as EnquiryModule;
use CatalogX\Quote\Module as QuoteModule;
use CatalogX\RestAPI\Controllers\Logs;
use CatalogX\RestAPI\Controllers\Settings;
use CatalogX\RestAPI\Controllers\Tour;

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
        add_filter( 'woocommerce_rest_check_permissions', array( $this, 'grant_woocommerce_rest_permission' ), 10, 4 );
        add_filter( 'woocommerce_rest_product_object_query', array( $this, 'add_include_types_query' ), 10, 2 );
    }

    /**
     * Give permission based on request.
     *
     * @param bool   $permission Current permission status.
     * @param string $context Request context.
     * @param int    $object_id Object ID.
     * @param string $post_type Post type.
     * @return bool
     */
    public function grant_woocommerce_rest_permission( $permission, $context, $object_id, $post_type ) {
        $request_method = $_SERVER['REQUEST_METHOD'] ?? '';

        if ( 'GET' === $request_method && 'product' === $post_type ) {
            return true;
        }

        return $permission;
    }

    /**
     * Add include types query.
     *
     * @param array            $args    Query arguments.
     * @param \WP_REST_Request $request REST request.
     * @return array
     */
    public function add_include_types_query( $args, $request ) {
        $exclude_types = (array) $request->get_param( 'exclude__types' );

        if ( empty( $exclude_types ) ) {
            return $args;
        }

        $exclude = CatalogX()->setting->get_setting( 'exclusion', array() );

        $map = array(
            'products'   => array( 'catalog_exclusion_value_product_list' ),
            'categories' => array( 'catalog_exclusion_value_category_list', 'product_cat' ),
            'tags'       => array( 'catalog_exclusion_value_tag_list', 'product_tag' ),
            'brands'     => array( 'catalog_exclusion_value_brand_list', 'product_brand' ),
        );

        foreach ( $exclude_types as $type ) {
            if ( empty( $map[ $type ] ) ) {
                continue;
            }

            list( $setting, $taxonomy ) = array_pad( $map[ $type ], 2, '' );

            $ids = array_map( 'absint', (array) ( $exclude[ $setting ] ?? array() ) );

            if ( empty( $ids ) ) {
                continue;
            }

            if ( empty( $taxonomy ) ) {
                $args['post__in'] = isset( $args['post__in'] )
                    ? array_unique( array_merge( $args['post__in'], $ids ) )
                    : $ids;
            } else {
                $args['tax_query'][] = array(
                    'taxonomy' => $taxonomy,
                    'field'    => 'term_id',
                    'terms'    => $ids,
                );
            }
        }

        if ( ! empty( $args['tax_query'] ) ) {
            $args['tax_query']['relation'] = 'OR';
        }

        return $args;
    }

    /**
     * Initialize all REST API controller classes.
     */
    public function register_controllers() {
        $this->controllers = array(
            'settings' => new Settings(),
            'tour'     => new Tour(),
            'logs'     => new Logs(),
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

        register_rest_route(
            CatalogX()->rest_namespace,
            '/buttons',
            array(
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_buttons' ),
                'permission_callback' => array( $this, 'catalogx_permission' ),
            )
        );
    }

    /**
     * Get the enquiry or quote button markup.
     *
     * @param \WP_REST_Request $request The REST request object.
     * @return \WP_REST_Response The HTML response.
     */
    public function get_buttons( $request ) {
        $product_id  = $request->get_param( 'product_id' );
        $button_type = $request->get_param( 'button_type' );

        // Start output buffering.
        ob_start();

        if ( 'enquiry' === $button_type ) {
            EnquiryModule::init()->frontend->render_product_enquiry_button( intval( $product_id ) );
        }

        if ( 'quote' === $button_type ) {
            QuoteModule::init()->frontend->add_button_for_quote( intval( $product_id ) );
        }

        do_action( 'catalogx_get_buttons', $button_type, $product_id );

        // Return the output.
        return rest_ensure_response( array( 'html' => ob_get_clean() ) );
    }

    /**
     * Catalog rest api permission functions
     *
     * @return bool
     */
    public function catalogx_permission() {
        return current_user_can( 'manage_options' );
    }
}
