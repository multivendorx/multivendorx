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
 * @version     PRODUCT_VERSION
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
        $this->container['block_paths']           = array();
        $this->container['is_dev']                = defined( 'WP_ENV' ) && WP_ENV === 'development';

        register_activation_hook( $file, array( $this, 'activate' ) );
        register_deactivation_hook( $file, array( $this, 'deactivate' ) );

        add_filter( 'plugin_action_links_' . plugin_basename( $file ), array( &$this, 'multivendorx_settings' ) );
        add_action( 'before_woocommerce_init', array( $this, 'declare_compatibility' ) );
        add_action( 'woocommerce_loaded', array( $this, 'init_plugin' ) );
        add_action( 'plugins_loaded', array( $this, 'is_woocommerce_loaded' ) );
        add_filter( 'plugin_row_meta', array( $this, 'plugin_row_meta' ), 10, 2 );
        add_action( 'init', array( $this, 'migrate_from_previous_version' ) );
    }

    /**
     * Placeholder for activation function.
     *
     * @return void
     */
    public function activate() {
        new Install();

        if ( ! get_option( Utill::MULTIVENDORX_OTHER_SETTINGS['installed'] ) ) {
            add_option( Utill::MULTIVENDORX_OTHER_SETTINGS['installed'], true );
            add_option( Utill::MULTIVENDORX_OTHER_SETTINGS['plugin_activated'], true );
        }
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
        $this->load_plugin_textdomain();
        $this->init_classes();

        add_action( 'init', array( $this, 'multivendorx_register_setup_wizard' ) );

        add_filter( 'woocommerce_email_classes', array( $this, 'setup_email_class' ) );

        do_action( 'multivendorx_loaded' );
    }


    /**
     * Init all MultiVendorX classess.
     * Access this classes using magic method.
     *
     * @return void
     */
    public function init_classes() {
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
        $this->container['cron']            = new Cron();
        $this->container['block']           = new Block();
        $this->container['notifications']   = new Notifications\Notifications();
        $this->container['widgets']         = new Widgets();
        $this->container['pattern']         = new Pattern();

        // Load all active modules.
        $this->container['modules']->load_active_modules();

        $this->initialize_multivendorx_log();

        flush_rewrite_rules();
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
            return;
        }
        add_action( 'admin_notices', array( $this, 'woocommerce_admin_notice' ) );
    }

    /**
     * Migrate data from previous version.
     */
    public function migrate_from_previous_version() {
        $previous_version = get_option( Utill::MULTIVENDORX_OTHER_SETTINGS['plugin_db_version'], '' );

        if ( version_compare( $previous_version, MultiVendorX()->version, '<' ) ) {
            new Install();
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
     * Admin notice for woocommerce inactive.
     *
     * @return void
     */
    public static function woocommerce_admin_notice() {
        ?>
        <div id="message" class="error">
            <p>
                <?php
                printf(
                    // translators: 1: Opening strong tag, 2: Closing strong tag, 3: Opening WooCommerce link, 4: Closing link, 5: Opening install link, 6: Closing install link.
                    esc_html__(
                        '%1$sMultivendorX is inactive.%2$s The %3$sWooCommerce plugin%4$s must be active for the MultivendorX to work. Please %5$sinstall & activate WooCommerce%6$s',
                        'multivendorx'
                    ),
                    '<strong>',
                    '</strong>',
                    '<a target="_blank" href="' . esc_url( 'https://wordpress.org/plugins/woocommerce/' ) . '">',
                    '</a>',
                    '<a href="' . esc_url( admin_url( 'plugins.php' ) ) . '">',
                    ' &raquo;</a>'
                );
                ?>
            </p>
        </div>
        <?php
    }

    /**
     * Set the stoct Manager settings in plugin activation page.
     *
     * @param  mixed $links all links.
     * @return array
     */
    public static function multivendorx_settings( $links ) {
        $plugin_links = array(
            '<a href="' . admin_url( 'admin.php?page=multivendorx#&tab=settings&subtab=appearance' ) . '">' . __( 'Settings', 'multivendorx' ) . '</a>',
        );

        if ( ! Utill::is_khali_dabba() ) {
            $links['go_pro'] = '<a href="' . MULTIVENDORX_PRO_SHOP_URL . '" class="multivendorx-pro-plugin" target="_blank" style="font-weight: 700;background: linear-gradient(110deg, rgb(63, 20, 115) 0%, 25%, rgb(175 59 116) 50%, 75%, rgb(219 75 84) 100%);-webkit-background-clip: text;-webkit-text-fill-color: transparent;">' . __( 'Upgrade to Pro', 'multivendorx' ) . '</a>';
        }

        return array_merge( $plugin_links, $links );
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

        $this->container['log_file']          = MultivendorX()->multivendorx_logs_dir . '/' . $log_file_name;
        $this->container['show_advanced_log'] = in_array( 'multivendorx_adv_log', MultivendorX()->setting->get_setting( 'multivendorx_adv_log', array() ), true );
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

        return new \WP_Error( sprintf( 'Call to unknown class %s.', $class ) );
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


