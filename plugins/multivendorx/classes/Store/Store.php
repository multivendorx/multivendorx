<?php

namespace MultiVendorX\Store;

defined('ABSPATH') || exit;

/**
 * MultiVendorX Main Store class
 *
 * @version		PRODUCT_VERSION
 * @package		MultivendorX
 * @author 		MultiVendorX
 */
class Store {

    private $container = array();
    public function __construct() {
        $this->init_classes();
    }

    /**
     * Initialize all Store classes.
     */
    public function init_classes() {
        $this->container = array(
            'rewrites'    => new Rewrites(),
            'storeutil'   => new StoreUtil(),
        );
    }

    public function __get( $class ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound
        if ( array_key_exists( $class, $this->container ) ) {
            return $this->container[ $class ];
        }

        return new \WP_Error( sprintf( 'Call to unknown class %s.', $class ) );
    }
}