<?php
/**
 * MultiVendorX Module class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\StripeConnect;

/**
 * MultiVendorX Stripe Connect Module class
 *
 * @class       Module class
 * @version     6.0.0
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
        // Init helper classes.
        $this->init_classes();
        add_filter('multivendorx_payment_providers', [$this, 'add_payment_provider']);
        add_action('admin_init', [$this, 'onboard_vendor']);

    }

    public function onboard_vendor() {
        if (isset($_GET['action']) && $_GET['action'] == 'multivendorx_stripe_connect_onboard') {
            $vendor_id = get_current_user_id();
            $stripe_account_id = get_user_meta($vendor_id, '_stripe_connect_account_id', true);

            if (!$stripe_account_id) {
                $account = $this->container['stripe_connect']->create_account();
                if ($account) {
                    $stripe_account_id = $account->id;
                    update_user_meta($vendor_id, '_stripe_connect_account_id', $stripe_account_id);
                } else {
                    // Handle error
                    wp_die('Could not create Stripe account.');
                }
            }

            $account_link = $this->container['stripe_connect']->create_account_link($stripe_account_id);

            if ($account_link) {
                wp_redirect($account_link->url);
                exit;
            } else {
                // Handle error
                wp_die('Could not create account link.');
            }
        }
    }

    public function add_payment_provider($providers) {
        $providers[] =  [
            'id'    => 'stripe-connect',
            'name'  => 'Stripe Connect',
            'class' => 'MultiVendorX\\StripeConnect\\Payment'
        ];

        return $providers;
    }
    /**
     * Init helper classes
     *
     * @return void
     */
    public function init_classes() {
        $this->container['stripe_connect'] = new Payment();
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
}
