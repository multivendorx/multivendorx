<?php
/**
 * MultiVendorX class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

defined( 'ABSPATH' ) || exit;
use Automattic\WooCommerce\Utilities\FeaturesUtil;
use MultiVendorX\Utill;

/**
 * MultiVendorX Class.
 *
 * @class       Module class
 * @version     5.0.0
 * @author      MultiVendorX
 */
final class MultiVendorX {

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
     * Container for dependency injection or shared resources.
     *
     * @var array
     */
    private $container = array();

    /**
     * Class constructor
     *
     * @param object $file file.
     */
    public function __construct( $file ) {
        require_once trailingslashit( dirname( $file ) ) . '/config.php';

        $this->file                               = $file;
        $this->container['plugin_url']            = trailingslashit( plugins_url( '', $plugin = $file ) );
        $this->container['plugin_path']           = trailingslashit( dirname( $file ) );
        $this->container['plugin_base']           = plugin_basename( $file );
        $this->container['multivendorx_logs_dir'] = ( trailingslashit( wp_upload_dir( null, false )['basedir'] ) . 'mw-logs' );
        $this->container['version']               = MULTIVENDORX_PLUGIN_VERSION;
        $this->container['rest_namespace']        = 'multivendorx/v1';
        $this->container['plugin_slug']           = MULTIVENDORX_WORDPRESS_SLUG;
        $this->container['block_paths']           = array();
        $this->container['is_dev']                = defined( 'WP_ENV' ) && WP_ENV === 'development';
        $this->container['date_format']           = get_option( 'date_format' ) . ' ' . get_option( 'time_format' );

        register_activation_hook( $file, array( $this, 'activate' ) );
        register_deactivation_hook( $file, array( $this, 'deactivate' ) );

        add_action( 'before_woocommerce_init', array( $this, 'declare_compatibility' ) );
        add_action( 'woocommerce_loaded', array( $this, 'init_plugin' ) );
        add_action( 'init', array( $this, 'load_plugin_textdomain' ) );
        add_action( 'plugins_loaded', array( $this, 'is_woocommerce_loaded' ) );
        add_filter( 'plugin_row_meta', array( $this, 'plugin_row_meta' ), 10, 2 );
        // Major update notice.
		add_action( 'in_plugin_update_message-dc-woocommerce-multi-vendor/dc_product_vendor.php', array( $this, 'multivendorx_plugin_update_message' ) );
    }

    /**
     * Show a plugin update message on the plugin update screen for major versions.
     *
     * This is hooked to display a custom admin notice when the installed version is less than 5.0.0.
     *
     * @return void
     */
    public function multivendorx_plugin_update_message() {
        if ( version_compare( MULTIVENDORX_PLUGIN_VERSION, '5.0.0', '<' ) ) {
            echo '<p><strong>Heads up!</strong> 5.0.0 is a major update. Make a full site backup before upgrading your marketplace to avoid any undesirable situations.</p>';
            return;
        }
    }

    /**
     * Placeholder for activation function.
     *
     * @return void
     */
    public function activate() {
        add_option( Utill::MULTIVENDORX_OTHER_SETTINGS['run_installer'], true );
        if ( ! get_option( Utill::MULTIVENDORX_OTHER_SETTINGS['installed'] ) ) {
            add_option( Utill::MULTIVENDORX_OTHER_SETTINGS['installed'], true );
            add_option( Utill::MULTIVENDORX_OTHER_SETTINGS['plugin_activated'], true );
        }
        flush_rewrite_rules();
    }

    /**
     * Placeholder for deactivation function.
     *
     * @return void
     */
    public function deactivate() {
        delete_option( Utill::MULTIVENDORX_OTHER_SETTINGS['installed'] );
        delete_option( Utill::MULTIVENDORX_OTHER_SETTINGS['plugin_page_install'] );
        flush_rewrite_rules();
    }

    /**
     * Add High Performance Order Storage Support.
     *
     * @return void
     */
    public function declare_compatibility() {
        FeaturesUtil::declare_compatibility( 'custom_order_tables', plugin_basename( $this->file ), true );
    }

    /**
     * Initilizing plugin on WP init.
     *
     * @return void
     */
    public function init_plugin() {
        add_action( 'init', array( $this, 'init_classes' ), 0 );
        if ( get_option( Utill::MULTIVENDORX_OTHER_SETTINGS['run_installer'] ) ) {
            new Install();
            delete_option( Utill::MULTIVENDORX_OTHER_SETTINGS['run_installer'] );
        }

        add_action( 'init', array( $this, 'multivendorx_register_setup_wizard' ) );

        add_filter( 'woocommerce_email_classes', array( $this, 'setup_email_class' ) );
    }


    /**
     * Init all MultiVendorX classess.
     * Access this classes using magic method.
     *
     * @return void
     */
    public function init_classes() {
        $this->container['current_user']    = wp_get_current_user();
        $this->container['current_user_id'] = get_current_user_id();

        $this->container['util']            = new Utill();
        $this->container['setting']         = new Setting();
        $this->container['admin']           = new Admin();
        $this->container['frontendScripts'] = new FrontendScripts();
        $this->container['shortcode']       = new Shortcode();
        $this->container['frontend']        = new Frontend();
        $this->container['roles']           = new Roles();
        $this->container['filters']         = new Deprecated\DeprecatedFilterHooks();
        $this->container['actions']         = new Deprecated\DeprecatedActionHooks();
        $this->container['commission']      = new Commission\CommissionManager();
        $this->container['order']           = new Order\OrderManager();
        $this->container['rest']            = new RestAPI\Rest();
        $this->container['payments']        = new Payments\Payments();
        $this->container['store']           = new Store\Store();
        $this->container['transaction']     = new Transaction\Transaction();
        $this->container['modules']         = new Modules();
        $this->container['status']          = new Status();
        $this->container['product']         = new Product();
        $this->container['coupon']          = new Coupon();
        $this->container['cron']            = new Cron();
        $this->container['block']           = new Block();
        $this->container['notifications']   = new Notifications\Notifications();
        $this->container['widgets']         = new Widgets();
        $this->container['pattern']         = new Pattern();
        $this->container['tracker']         = new Tracker();
        $this->container['promotions']      = new Promotions();
        $this->container['migration']       = new Migration\Cron();

        $this->initialize_multivendorx_log();

        // Load all active modules.
        $this->container['modules']->load_active_modules();

        $this->container['active_store'] = get_user_meta( get_current_user_id(), Utill::USER_SETTINGS_KEYS['active_store'], true );

        do_action( 'multivendorx_loaded' );
    }

    /**
     * Register setup wizard.
     *
     * @return void
     */
    public function multivendorx_register_setup_wizard() {
        new SetupWizard();
        if ( get_option( Utill::MULTIVENDORX_OTHER_SETTINGS['plugin_activated'] ) ) {
            delete_option( Utill::MULTIVENDORX_OTHER_SETTINGS['plugin_activated'] );
            wp_safe_redirect( admin_url( 'admin.php?page=multivendorx-setup' ) );
            exit;
        }
    }

    /**
     * Add MultiVendorX Email Class.
     *
     * @param array $emails  All MultiVendorX emails.
     * @return array
     */
    public function setup_email_class( $emails ) {
        return $emails;
    }

    /**
     * Take action based on if woocommerce is not loaded.
     *
     * @return void
     */
    public function is_woocommerce_loaded() {
        if ( did_action( 'woocommerce_loaded' ) || ! is_admin() ) {
            $previous_version = get_option( Utill::MULTIVENDORX_OTHER_SETTINGS['plugin_db_version'], '' );
            if ( version_compare( $previous_version, MultiVendorX()->version, '<' ) ) {
                new Install();
            }
            return;
        }
    }

    /**
     * Load Localisation files.
     * Note: the first-loaded translation file overrides any following ones if the same translation is present.
     *
     * @access public
     * @return void
     */
    public function load_plugin_textdomain() {
        if ( version_compare( $GLOBALS['wp_version'], '6.7', '<' ) ) {
            load_plugin_textdomain( 'multivendorx', false, plugin_basename( dirname( __DIR__ ) ) . '/languages' );
        } else {
            load_textdomain( 'multivendorx', WP_LANG_DIR . '/plugins/dc-woocommerce-multi-vendor-' . determine_locale() . '.mo' );
        }
    }

    /**
     * Add metadata links (e.g. documentation, support) to the plugin row on the Plugins screen.
     *
     * @param array  $links An array of the plugin's metadata links.
     * @param string $file  The path to the plugin file relative to the plugins directory.
     *
     * @return array Modified array of metadata links.
     */
    public function plugin_row_meta( $links, $file ) {
        if ( MultiVendorX()->plugin_base === $file ) {
            $row_meta = array(
                'docs'    => '<a href="https://multivendorx.com/docs/" aria-label="' . esc_attr__( 'View WooCommerce documentation', 'multivendorx' ) . '" target="_blank">' . esc_html__( 'Docs', 'multivendorx' ) . '</a>',
                'support' => '<a href="https://wordpress.org/support/plugin/dc-woocommerce-product-vendor/" aria-label="' . esc_attr__( 'Visit community forums', 'multivendorx' ) . '" target="_blank">' . esc_html__( 'Support', 'multivendorx' ) . '</a>',
            );

            if ( ! Utill::is_khali_dabba() ) {
                $row_meta['go_pro'] = '<a href="' . MULTIVENDORX_PRO_SHOP_URL . '" class="multivendorx-pro-plugin" target="_blank" style="font-weight: 700;background: linear-gradient(110deg, rgb(63, 20, 115) 0%, 25%, rgb(175 59 116) 50%, 75%, rgb(219 75 84) 100%);-webkit-background-clip: text;-webkit-text-fill-color: transparent;">' . __( 'Upgrade to Pro', 'multivendorx' ) . '</a>';
            }

            return array_merge( $links, $row_meta );
        }

        return $links;
    }

    /**
     * Get multivendorx log file name.
     */
    public function initialize_multivendorx_log() {
        // The log file name is stored in the options table because it is generated with an arbitrary name.
        $log_file_name = get_option( Utill::MULTIVENDORX_OTHER_SETTINGS['log_file'] );

        if ( ! $log_file_name ) {
            $log_file_name = uniqid( 'error' ) . '.txt';
            update_option( Utill::MULTIVENDORX_OTHER_SETTINGS['log_file'], $log_file_name );
        }

        $this->container['log_file']          = MultiVendorX()->multivendorx_logs_dir . '/' . $log_file_name;
        $this->container['show_advanced_log'] = in_array( 'multivendorx_adv_log', MultiVendorX()->setting->get_setting( 'multivendorx_adv_log', array() ), true );
    }

    /**
     * Magic getter function to get the reference of class.
     * Accept class name, If valid return reference, else Wp_Error.
     *
     * @param  mixed $class_name all classes.
     */
    public function __get( $class_name ) {
     // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound
        if ( array_key_exists( $class_name, $this->container ) ) {
            return $this->container[ $class_name ];
        }

        return new \WP_Error( sprintf( 'Call to unknown class %s.', $class_name ) );
    }

    /**
     * Magic setter function to store a reference of a class.
     * Accepts a class name as the key and stores the instance in the container.
     *
     * @param string $class_name The class name or key to store the instance.
     * @param object $value The instance of the class to store.
     */
    public function __set( $class_name, $value ) {
     // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound
        $this->container[ $class_name ] = $value;
    }

    /**
     * Initializes the Multivendorx class.
     * Checks for an existing instance
     * And if it doesn't find one, create it.
     *
     * @param  mixed $file file.
     * @return object | null
     */
    public static function init( $file ) {
        if ( null === self::$instance ) {
            self::$instance = new self( $file );
        }

        return self::$instance;
    }
}
