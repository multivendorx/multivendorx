<?php
/**
 * MultiVendorX Geolocation Module
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\GeoLocation;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Geolocation Module
 *
 * @class       Module class
 * @version     5.0.0
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
