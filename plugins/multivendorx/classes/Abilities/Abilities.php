<?php
/**
 * MultiVendorX Abilities API
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Abilities;

use MultiVendorX\Abilities\AbilitiesApi\Stores;
use MultiVendorX\Abilities\AbilitiesApi\Commissions;
use MultiVendorX\Abilities\AbilitiesApi\Transactions;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Abilities main class.
 *
 * @class       Abilities class
 * @version     5.0.22
 * @author      MultiVendorX
 */
class Abilities {

    /**
     * Container for all abilities controller classes.
     *
     * @var array
     */
    private $container = array();

    /**
     * Abilities constructor.
     */
    public function __construct() {
        $this->init_classes();

        add_action( 'wp_abilities_api_categories_init', array( $this, 'register_categories' ) );
        add_action( 'wp_abilities_api_init', array( $this, 'register_abilities' ) );
        add_filter( 'woocommerce_product_data_store_cpt_get_products_query', array( $this, 'multivendorx_get_current_store_items' ), 20 );
        add_filter( 'woocommerce_orders_table_datastore_get_orders_query', array( $this, 'multivendorx_get_current_store_items' ), 20 );
    }

    /**
     * Initialize all abilities controller classes.
     *
     * @return void
     */
    public function init_classes() {
        $this->container = array(
            'store'       => new Stores(),
            'commission'  => new Commissions(),
            'transaction' => new Transactions(),
        );
    }

    /**
     * Register the MultiVendorX ability category.
     *
     * @return void
     */
    public function register_categories() {
        wp_register_ability_category(
            'multivendorx',
            array(
                'label'       => __( 'MultiVendorX', 'multivendorx' ),
                'description' => __( 'MultiVendorX marketplace abilities.', 'multivendorx' ),
            )
        );
    }

    /**
     * Register abilities for each controller in the container.
     *
     * @return void
     */
    public function register_abilities() {
        foreach ( $this->container as $controller ) {
            if ( method_exists( $controller, 'register_abilities' ) ) {
                $controller->register_abilities();
            }
        }
    }

    /**
     * Scope a product/order query to the current store owner's own store.
     *
     * @param array $args Query args.
     * @return array
     */
    public function multivendorx_get_current_store_items( $args ) {
        $store_id = Utill::resolve_ability_store_id( array() );
        if ( ! $store_id ) {
            return $args;
        }

        $args['meta_query']   = $args['meta_query'] ?? array();
        $args['meta_query'][] = array(
            'key'     => Utill::POST_META_SETTINGS['store_id'],
            'value'   => (string) $store_id,
            'compare' => '=',
        );

        return $args;
    }
}
