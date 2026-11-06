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
 * @version     1.0.0
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
        add_filter( 'woocommerce_product_data_store_cpt_get_products_query', array( $this, 'scope_woocommerce_ability_query' ), 20 );
        add_filter( 'woocommerce_orders_table_datastore_get_orders_query', array( $this, 'scope_woocommerce_ability_query' ), 20 );
        add_filter( 'woocommerce_rest_check_permissions', array( $this, 'scope_woocommerce_ability_object_permission' ), 20, 4 );
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
     * @param array $args Query args.
     * @return array
     */
    public function scope_woocommerce_ability_query( $args ) {
        if ( Utill::current_user_has_capability( array( 'manage_woocommerce' ) ) ) {
            return $args;
        }

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

    /**
     * @param bool   $permission Whether the operation is allowed.
     * @param string $context    Request context.
     * @param int    $object_id  Object ID, 0 for a collection.
     * @param string $post_type  Post type, taxonomy, or WooCommerce object name.
     * @return bool
     */
    public function scope_woocommerce_ability_object_permission( $permission, $context, $object_id, $post_type ) {
        if ( Utill::current_user_has_capability( array( 'manage_woocommerce' ) ) ) {
            return $permission;
        }

        if ( ! in_array( $post_type, array( 'product', 'product_variation', 'shop_order' ), true ) ) {
            return $permission;
        }

        $store_id = Utill::resolve_ability_store_id( array() );
        if ( ! $store_id ) {
            return $permission;
        }

        $object_id = absint( $object_id );
        if ( ! $object_id ) {
            // A query/list call with no id yet - the data-store query filter scopes the actual results.
            return true;
        }

        return $this->get_object_store_id( $post_type, $object_id ) === $store_id;
    }

    /**
     * @param string $post_type Object type.
     * @param int    $object_id Object ID.
     * @return int Store ID, or 0 when unassigned.
     */
    private function get_object_store_id( $post_type, $object_id ) {
        if ( 'shop_order' === $post_type ) {
            $order = wc_get_order( $object_id );
            return $order ? absint( $order->get_meta( Utill::POST_META_SETTINGS['store_id'] ) ) : 0;
        }

        if ( 'product_variation' === $post_type ) {
            $object_id = wp_get_post_parent_id( $object_id );
        }

        return absint( get_post_meta( $object_id, Utill::POST_META_SETTINGS['store_id'], true ) );
    }
}
