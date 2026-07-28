<?php
/**
 * VuloCart class file.
 *
 * @package VuloCart
 */

namespace VuloCart;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Class.
 *
 * Plugin bootstrap singleton — same plain-array-container + magic
 * __get/__set shape as MultiVendorX\MultiVendorX and VuloPilot\VuloPilot.
 * VuloCart is not WooCommerce-bound (a deliberate break from the
 * multivendorx family — see the vision's "own tables, don't rely on
 * WooCommerce's data model" principle), so it boots on 'plugins_loaded'
 * directly, the same as VuloPilot\VuloPilot.
 *
 * @class       VuloCart class
 * @version     1.0.0
 * @author      MultiVendorX
 */
final class VuloCart {

    /**
     * Holds the single instance of the class (singleton pattern).
     *
     * @var self|null
     */
    private static $instance = null;

    /**
     * The main plugin file path.
     *
     * @var string
     */
    private $file = '';

    /**
     * Container for shared class instances and config values.
     *
     * @var array
     */
    private $container = array();

    /**
     * Class constructor.
     *
     * @param string $file Main plugin file path.
     */
    public function __construct( $file ) {
        require_once trailingslashit( dirname( $file ) ) . '/config.php';

        $this->file                        = $file;
        $this->container['plugin_url']     = trailingslashit( plugins_url( '', $file ) );
        $this->container['plugin_path']    = trailingslashit( dirname( $file ) );
        $this->container['plugin_base']    = plugin_basename( $file );
        $this->container['version']        = VULOCART_PLUGIN_VERSION;
        $this->container['rest_namespace'] = 'vulocart/v1';
        $this->container['plugin_slug']    = VULOCART_PLUGIN_SLUG;

        register_activation_hook( $file, array( $this, 'activate' ) );
        register_deactivation_hook( $file, array( $this, 'deactivate' ) );

        add_action( 'plugins_loaded', array( $this, 'init_plugin' ) );
        add_action( 'init', array( $this, 'load_plugin_textdomain' ) );
    }

    /**
     * Runs on plugin activation. Sets a flag rather than creating tables
     * directly — register_activation_hook() fires before 'plugins_loaded',
     * earlier than dbDelta()'s upgrade.php include is guaranteed available,
     * so table creation is deferred to init_plugin() — same reasoning as
     * VuloPilot\VuloPilot::activate().
     *
     * @return void
     */
    public function activate() {
        add_option( Utill::OTHER_SETTINGS['run_installer'], true );
        flush_rewrite_rules();
    }

    /**
     * Runs on plugin deactivation.
     *
     * @return void
     */
    public function deactivate() {
        flush_rewrite_rules();
    }

    /**
     * Boots the plugin once every other active plugin has loaded.
     *
     * @return void
     */
    public function init_plugin() {
        add_action( 'init', array( $this, 'init_classes' ), 0 );

        if ( get_option( Utill::OTHER_SETTINGS['run_installer'] ) ) {
            new Install();
            delete_option( Utill::OTHER_SETTINGS['run_installer'] );
        }
    }

    /**
     * Initializes VuloCart classes and fires 'vulocart_loaded', the hook
     * VuloCart Pro (and any third-party extension) gates its own boot on —
     * the equivalent of multivendorx_loaded/vulopilot_loaded for this
     * product line.
     *
     * @return void
     */
    public function init_classes() {
        $this->container['util'] = new Utill();

        // Dependency-injection seam (vision principle: "storage engine is
        // replaceable") — AssetRepositoryInterface is bound to a concrete
        // WPDBAssetRepository here, and only here; every other class asks
        // the container for the interface instead of `new`ing the concrete
        // class directly, so swapping storage engines later is a one-line
        // change to this binding.
        $this->container['service_container'] = new ServiceContainer();
        $this->container['service_container']->singleton(
            Domain\Asset\AssetRepositoryInterface::class,
            function () {
                return new Infrastructure\Database\WPDBAssetRepository();
            }
        );

        $this->container['event_dispatcher'] = new Events\EventDispatcher();

        $this->container['asset_service'] = new Application\AssetService(
            $this->container['service_container']->make( Domain\Asset\AssetRepositoryInterface::class ),
            $this->container['event_dispatcher']
        );

        // Module loader (module-architecture.md) — loaded before the REST
        // dispatcher so a module's own constructor (e.g. registering a
        // route via `vulocart_rest_controllers`, or reacting to
        // `vulocart_activated_module_{id}`) runs before those registries'
        // own hooks fire.
        $this->container['modules'] = new Modules();

        // Cart and Order are real toggleable modules (modules/Cart,
        // modules/Order — module-architecture.md), not core services wired
        // here — VuloCart()->cart_service/order_service only exist once
        // their own Module.php has run. A brand-new install (or this exact
        // site, the very first time it boots after Cart/Order became
        // modules) gets both pre-activated exactly once, via
        // Modules::activate_modules() (which merges into whatever's
        // already active, unlike add_option() — the stored active-module
        // list may already exist with unrelated entries, e.g. this site
        // already had 'passport' active from before Cart/Order existed as
        // toggleable concepts), so cart/checkout keeps working out of the
        // box. The one-time flag means turning either off afterward is
        // fully respected — this never re-seeds them back on.
        if ( ! get_option( 'vulocart_cart_order_modules_seeded' ) ) {
            $this->container['modules']->activate_modules( array( 'cart', 'order' ) );
            update_option( 'vulocart_cart_order_modules_seeded', true );
        } else {
            $this->container['modules']->load_active_modules();
        }

        $this->container['admin']        = new Admin\Menu();
        $this->container['rest']         = new RestAPI\Rest();
        $this->container['block']        = new Block();
        $this->container['order_emails'] = new Notifications\OrderEmails();

        $previous_version = get_option( Utill::OTHER_SETTINGS['plugin_db_version'], '' );
        if ( version_compare( $previous_version, $this->container['version'], '<' ) ) {
            new Install();
        }

        do_action( 'vulocart_loaded' );
    }

    /**
     * Loads translation files.
     *
     * @return void
     */
    public function load_plugin_textdomain() {
        if ( version_compare( $GLOBALS['wp_version'], '6.7', '<' ) ) {
            load_plugin_textdomain( 'vulocart', false, plugin_basename( dirname( $this->file ) ) . '/languages' );
        } else {
            load_textdomain( 'vulocart', WP_LANG_DIR . '/plugins/vulocart-' . determine_locale() . '.mo' );
        }
    }

    /**
     * Magic getter for the container.
     *
     * @param string $class_name Container key to retrieve.
     * @return mixed
     * @throws \Exception If the requested key does not exist in the container.
     */
    public function __get( $class_name ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound
        if ( array_key_exists( $class_name, $this->container ) ) {
            return $this->container[ $class_name ];
        }

        throw new \Exception( sprintf( 'Call to unknown class %s.', esc_html( $class_name ) ) );
    }

    /**
     * Magic setter for the container.
     *
     * @param string $class_name Container key to store under.
     * @param mixed  $value      Value to store.
     * @return void
     */
    public function __set( $class_name, $value ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound
        $this->container[ $class_name ] = $value;
    }

    /**
     * Returns the single instance of this class, creating it if necessary.
     *
     * @param string $file Main plugin file path.
     * @return self
     */
    public static function init( $file ) {
        if ( null === self::$instance ) {
            self::$instance = new self( $file );
        }

        return self::$instance;
    }
}
