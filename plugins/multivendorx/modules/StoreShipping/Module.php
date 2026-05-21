<?php
/**
 * MultiVendorX Module class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\StoreShipping;

use MultiVendorX\Utill;

/**
 * MultiVendorX Module class
 *
 * @class       Module class
 * @version     5.0.0
 * @author      MultiVendorX
 */
class Module {
    /**
     * Container contain all helper class
     *
     * @var array
     */
    private $container = array();

    /**
     * Contain reference of the class
     *
     * @var Module|null
     */
    private static $instance = null;

    /**
     * Simple class constructor function
     */
    public function __construct() {
        $this->init_classes();

        add_filter( 'woocommerce_cart_shipping_packages', array( 'MultiVendorX\StoreShipping\Shipping_Helper', 'split_cart_by_store' ) );

        add_filter( 'woocommerce_shipping_methods', array( $this, 'register_shipping_method' ) );

        add_action( 'multivendorx_after_store_active', array( $this, 'create_store_shipping_class' ) );
    }


    /**
     * Init helper classes
     *
     * @return void
     */
    public function init_classes() {
        $this->container['frontend'] = new Frontend();
        $this->container['admin']    = new Admin();
        $this->container['util']     = new Util();
        $this->container['rest']     = new Rest();
    }

    /**
     * Magic getter function to get the reference of class.
     * Accept class name, If valid return reference, else Wp_Error.
     *
     * @param   mixed $class Name of the class to retrieve from the container.
     * @return  object | \WP_Error
     */
    public function __get( $class ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound
        if ( array_key_exists( $class, $this->container ) ) {
            return $this->container[ $class ];
        }
        return new \WP_Error( sprintf( 'Call to unknown class %s.', $class ) );
    }

    /**
     * Magic setter function to store a reference of a class.
     * Accepts a class name as the key and stores the instance in the container.
     *
     * @param string $class The class name or key to store the instance.
     * @param object $value The instance of the class to store.
     */
    public function __set( $class, $value ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound
        $this->container[ $class ] = $value;
    }

    /**
     * Initializes Simple class.
     * Checks for an existing instance
     * And if it doesn't find one, create it.
     *
     * @return object | null
     */
    public static function init() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }

        return self::$instance;
    }
    /**
     * Register the shipping method for WooCommerce
     *
     * @param array $methods Shipping methods.
     * @return array
     */
    public function register_shipping_method( $methods ) {
        $methods['multivendorx_distance_shipping'] = Distance_Shipping::class;
        $methods['multivendorx_country_shipping']  = Country_Shipping::class;
        $methods['multivendorx_store_shipping']    = Zone_Shipping::class;
        return $methods;
    }

    /**
     * Create a WooCommerce shipping class when store becomes active.
     *
     * @param int $store_id Store ID.
     */
    public function create_store_shipping_class( $store_id ) {
        // Load store object.
        $store = new \MultiVendorX\Store\Store( $store_id );

        // Check if class already exists for this store.
        $existing_class_id = $store->get_meta( Utill::STORE_SETTINGS_KEYS['shipping_class_id'] );
        if ( $existing_class_id ) {
            return; // Skip creation.
        }

        // Prepare unique shipping class slug.
        $store_name = sanitize_title( $store->get( 'name' ) );
        $slug       = $store_name . '-' . $store_id;

        // Check if the shipping class already exists.
        $shipping_term = get_term_by( 'slug', $slug, Utill::WORDPRESS_SETTINGS['product_shipping_class'], ARRAY_A );

        // Create a new shipping class if missing.
        if ( ! $shipping_term ) {
            $shipping_term = wp_insert_term(
                $store->get( 'name' ) . ' Shipping', // Shipping class name.
                Utill::WORDPRESS_SETTINGS['product_shipping_class'],
                array(
                    'slug' => $slug,
                )
            );
        }

        // Validate creation.
        if ( ! is_wp_error( $shipping_term ) ) {
            $class_id = $shipping_term['term_id'];

            // Save class ID in store meta.
            $store->update_meta( Utill::STORE_SETTINGS_KEYS['shipping_class_id'], $class_id );

            // Save MultiVendorX store reference in term meta.
            update_term_meta( $class_id, Utill::POST_META_SETTINGS['store_id'], $store_id );

            // Optional: add origin help.
            update_term_meta( $class_id, Utill::WORDPRESS_SETTINGS['shipping_origin_country'], get_option( Utill::WOO_SETTINGS['default_country'] ) );
        }
    }
}
