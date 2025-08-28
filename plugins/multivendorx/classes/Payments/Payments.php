<?php

namespace MultiVendorX\Payments;
use MultiVendorX\Payments\Providers\MultiVendorX_Stripe_Payment;
use MultiVendorX\Payments\Providers\MultiVendorX_PayPal_Payment;

defined('ABSPATH') || exit;

/**
 * MultiVendorX Main Payment class
 *
 * @version		PRODUCT_VERSION
 * @package		MultiVendorX
 * @author 		MultiVendorX
 */
class Payments {
    private $providers = array();
    public function __construct() {
        $this->init_classes();

        $this->providers = apply_filters('multivendorx_payment_providers', $this->providers);
    }

    /**
     * Initialize all REST API controller classes.
     */
    public function init_classes() {
        $this->providers = array(
			'stripe'    => new MultiVendorX_Stripe_Payment(),
			'paypal'    => new MultiVendorX_PayPal_Payment(),
		);
    }

    /**
     * Return all providers with their settings array
     */
    public function all_payment_providers() {
        $providers = [];

        foreach ($this->providers as $id => $provider) {
            $providers[$id] = $provider->get_settings();
        }

        return $providers;
    }

    public function __get( $class ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound
        if ( array_key_exists( $class, $this->container ) ) {
            return $this->container[ $class ];
        }

        return new \WP_Error( sprintf( 'Call to unknown class %s.', $class ) );
    }
}