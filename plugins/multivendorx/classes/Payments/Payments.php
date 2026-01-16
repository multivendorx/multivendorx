<?php
/**
 * MultiVendorX Geolocation Module
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Payments;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Main Payment class
 *
 * @version     PRODUCT_VERSION
 * @package     MultiVendorX
 * @author      MultiVendorX
 */
class Payments {
    /**
     * Container for all payment classes.
     *
     * @var array
     */
    private $container = array();

    /**
     * Container for all payment providers.
     *
     * @var array
     */
    public $providers = array();

    /**
     * Constructor.
     */
    public function __construct() {
        $this->init_classes();

        add_action( 'init', array( $this, 'load_all_providers' ) );
    }

    /**
     * Init all payment classes.
     */
    public function init_classes() {
        $this->container = array(
            'disbursement'   => new Disbursement(),
            'processor'      => new PaymentProcessor(),
            'custom_gateway' => new CustomPayment(),
            'bank_transfer'  => new BankTransfer(),
            'cash'           => new CashPayment(),
            'paypal_payout'  => new PaypalPayout(),
            'stripe_connect' => new StripeConnect(),

        );
    }

    /**
     * Load all payment providers.
     */
    public function load_all_providers() {
        $this->providers = apply_filters( 'multivendorx_payment_providers', $this->providers );
    }

    /**
     * Get all payment settings.
     */
    public function get_all_payment_settings() {
        $all_settings = array();

        $providers = array(
            array(
                'id'    => 'custom-gateway',
                'name'  => 'Custom Gateway',
                'class' => 'MultiVendorX\\Payments\\CustomPayment',
            ),
            array(
                'id'    => 'cash',
                'name'  => 'Cash',
                'class' => 'MultiVendorX\\Payments\\CashPayment',
            ),
            array(
                'id'    => 'bank-transfer',
                'name'  => 'Bank Transfer',
                'class' => 'MultiVendorX\\Payments\\BankTransfer',
            ),
            array(
                'id'    => 'paypal-payout',
                'name'  => 'Paypal Payout',
                'class' => 'MultiVendorX\\Payments\\PaypalPayout',
            ),
            array(
                'id'    => 'stripe-connect',
                'name'  => 'Stripe Connect',
                'class' => 'MultiVendorX\\Payments\\StripeConnect',
            ),

        );

        $this->providers = array_merge( $this->providers ?? array(), $providers );

        foreach ( $this->providers as $provider ) {
            $provider_obj                    = new $provider['class']();
            $all_settings[ $provider['id'] ] = $provider_obj->get_settings();
        }

        return $all_settings;
    }

    /**
     * Get class object.
     *
     * @param  string $class Class name to return an instance of.
     * @return object|WP_Error
     */
    public function __get( $class ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound
        if ( array_key_exists( $class, $this->container ) ) {
            return $this->container[ $class ];
        }

        return new \WP_Error( sprintf( 'Call to unknown class %s.', $class ) );
    }
	//this a hack need to fix later
    private static $store_payment_settings = null;
    /**
     * Get all store payment settings.
     */
    public function get_all_store_payment_settings() {
        if ( self::$store_payment_settings !== null ) {
            return self::$store_payment_settings;
        }
        $store_settings = array();

        foreach ( $this->providers as $provider ) {
                $provider_obj                      = new $provider['class']();
                $store_settings[ $provider['id'] ] = $provider_obj->get_store_payment_settings();
        }
        self::$store_payment_settings = $store_settings;
        return $store_settings;
    }
}
