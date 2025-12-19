<?php
/**
 * MultiVendorX Geolocation Module
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\GeoLocation;

/**
 * MultiVendorX Geolocation Module
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Module {
    /**
     * Container for classes.
     *
     * @var array
     */
    private $container = array();
    /**
     * Instance of this module.
     *
     * @var Module
     */
    private static $instance = null;

    /**
     * Constructor.
     */
    public function __construct() {
    }


    /**
     * Initialize hooks.
     */
    public function init_hooks() {
        add_action( 'plugins_loaded', array( $this, 'ensure_class_autoloading' ) );
    }

    /**
     * Ensure class autoloading is working correctly.
     */
    public function ensure_class_autoloading() {
        
    }

    /**
     * Get a class instance from the container.
     *
     * @param string $class_name The class name.
     */
    public function __get( $class_name ) {
        if ( array_key_exists( $class_name, $this->container ) ) {
            return $this->container[ $class_name ];
        }

        return new \WP_Error(
            sprintf( 'Call to unknown class %s.', $class_name )
        );
    }

    /**
     * Set a class instance in the container.
     *
     * @param string $class_name The class name.
     * @param mixed  $value      The class instance.
     */
    public function __set( $class_name, $value ) {
        $this->container[ $class_name ] = $value;
    }

    /**
     * Get the instance of this module.
     *
     * @return Module The instance of this module.
     */
    public static function init() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }
}
