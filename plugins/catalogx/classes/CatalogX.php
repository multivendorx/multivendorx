<?php
/**
 * CatalogX class file
 *
 * @package CatalogX
 */

namespace CatalogX;

use Automattic\WooCommerce\Utilities\FeaturesUtil;

defined( 'ABSPATH' ) || exit;

/**
 * CatalogX class main function
 *
 * @class       CatalogX class
 * @version     6.0.0
 * @author      MultiVendorX
 */
final class CatalogX {

    /**
     * The single instance of the class.
     *
     * @var CatalogX|null
     */
    private static $instance = null;

    /**
     * Path to the main plugin file.
     *
     * @var string
     */
    private $file = '';

    /**
     * Internal container for plugin-wide values.
     *
     * @var array
     */
    private $container = array();

    /**
     * CatalogX class constructor function
     *
     * @param mixed $file plugin's main file.
     */
    public function __construct( $file ) {
        require_once trailingslashit( dirname( $file ) ) . '/config.php';

        $this->file                                = $file;
        $this->container['plugin_url']             = trailingslashit( plugins_url( '', $plugin = $file ) );
        $this->container['plugin_path']            = trailingslashit( dirname( $file ) );
        $this->container['plugin_base']            = plugin_basename( $file );
        $this->container['version']                = CATALOGX_PLUGIN_VERSION;
        $this->container['rest_namespace']         = 'catalogx/v1';
        $this->container['block_paths']            = array();
        $this->container['admin_email']            = get_option( 'admin_email' );
        $this->container['render_enquiry_btn_via'] = '';
        $this->container['render_quote_btn_via']   = '';
        $this->container['is_dev']                 = defined( 'WP_ENV' ) && WP_ENV === 'development';

        register_activation_hook( $file, array( $this, 'activate' ) );
        register_deactivation_hook( $file, array( $this, 'deactivate' ) );

        add_action( 'before_woocommerce_init', array( $this, 'declare_compatibility' ) );
        add_action( 'woocommerce_loaded', array( $this, 'init_plugin' ) );
        add_action( 'plugins_loaded', array( $this, 'is_woocommerce_loaded' ) );

        add_action( 'init', array( $this, 'migrate_from_previous' ) );
        // Major update notice.
		add_action( 'in_plugin_update_message-woocommerce-catalog-enquiry/Woocommerce_Catalog_Enquiry.php', array( $this, 'catalogx_plugin_update_message' ) );
    }

    /**
     * Show a plugin update message on the plugin update screen for major versions.
     *
     * This is hooked to display a custom admin notice when the installed version is less than 6.0.0.
     *
     * @return void
     */
    public function catalogx_plugin_update_message() {
        if ( version_compare( get_option( 'catalogx_plugin_version' ), '6.0.0', '<' ) ) {
            echo '<p><strong>Heads up!</strong> 6.0.0 is a major update. Make a full site backup and before upgrading your marketplace to avoid any undesirable situations.</p>';
            exit;
        }
    }

    /**
     * Add High Performance Order Storage Support
     *
     * @return void
     */
    public function declare_compatibility() {
        FeaturesUtil::declare_compatibility( 'custom_order_tables', WP_CONTENT_DIR . '/plugins/woocommerce-catalog-enquiry/Woocommerce_Catalog_Enquiry.php', true );
    }

    /**
     * Handle migration tasks for previous plugin versions.
     *
     * If the current plugin version is newer than the saved version,
     * initiate the Install routine to perform necessary updates.
     *
     * @return void
     */
    public function migrate_from_previous() {
        if ( version_compare( get_option( 'catalogx_plugin_version' ), CatalogX()->version, '<' ) ) {
            new Install();
        }
    }

    /**
     * Initialize the CatalogX plugin after WooCommerce is loaded.
     *
     * Loads text domain, hooks plugin links in admin, initializes core classes,
     * registers plugin strings for translation, sets up wizard, and registers
     * custom email classes.
     *
     * @return void
     */
    public function init_plugin() {

        $this->load_plugin_textdomain();

        if ( is_admin() && ! defined( 'DOING_AJAX' ) ) {
            add_filter( 'plugin_action_links_' . plugin_basename( $this->file ), array( $this, 'plugin_link' ) );
            add_filter( 'plugin_row_meta', array( $this, 'plugin_row_meta' ), 10, 2 );
        }

        $this->init_classes();

        add_action( 'init', array( $this, 'catalogx_register_strings_and_setup_wizard' ) );

        do_action( 'catalogx_loaded' );

        add_filter( 'woocommerce_email_classes', array( $this, 'load_emails' ) );
    }

    /**
     * Load setup class and register string
     */
    public function catalogx_register_strings_and_setup_wizard() {
        new SetupWizard();
        if ( get_option( 'catalogx_plugin_activated' ) ) {
            delete_option( 'catalogx_plugin_activated' );
            wp_safe_redirect( admin_url( 'admin.php?page=catalogx-setup' ) );
            exit;
        }

        if ( ! function_exists( 'icl_register_string' ) ) {
            return;
        }

        $strings = array(
            'add_to_quote'    => 'Add to Quote',
            'view_quote'      => 'View Quote',
            'send_an_enquiry' => 'Send an enquiry',
        );

        foreach ( $strings as $key => $value ) {
            icl_register_string( 'catalogx', $key, $value );
        }

        $form_settings = CatalogX()->setting->get_option( 'catalogx_enquiry_form_customization_settings' );

        if ( function_exists( 'icl_register_string' ) ) {
            foreach ( $form_settings['formsettings']['formfieldlist'] as $field ) {
                if ( isset( $field['label'] ) ) {
                    icl_register_string( 'catalogx', 'form_field_label_' . $field['id'], $field['label'] );
                }
                if ( isset( $field['placeholder'] ) ) {
                    icl_register_string( 'catalogx', 'form_field_placeholder_' . $field['id'], $field['placeholder'] );
                }
                if ( isset( $field['options'] ) ) {
                    foreach ( $field['options'] as $option ) {
                        icl_register_string( 'catalogx', 'form_field_option_' . $field['id'] . '_' . $option['value'], $option['label'] );
                    }
                }
            }

            foreach ( $form_settings['freefromsetting'] as $free_field ) {
                if ( isset( $free_field['label'] ) ) {
                    icl_register_string( 'catalogx', 'free_form_label_' . $free_field['key'], $free_field['label'] );
                }
            }
        }

        if ( function_exists( 'pll_register_string' ) ) {
            pll_register_string( 'my-quote', 'my-quote', 'catalogx' );
        }

        // Save the form settings to the options table.
        update_option( 'catalogx_enquiry_form_customization_settings', $form_settings );
    }

    /**
     * Initialize and load all core plugin classes into the container.
     *
     * This includes settings, admin/backend logic, frontend handling,
     * REST API endpoints, utilities, modules, shortcodes, session management,
     * quote cart logic, Gutenberg blocks, and frontend scripts.
     *
     * @return void
     */
    public function init_classes() {
        $this->container['setting']   = new Setting();
        $this->container['admin']     = new Admin();
        $this->container['frontend']  = new Frontend();
        $this->container['restapi']   = new Rest();
        $this->container['util']      = new Utill();
        $this->container['modules']   = new Modules();
        $this->container['shortcode'] = new Shortcode();
        $this->container['session']   = new Core\Session();
        $this->container['quotecart'] = new Core\QuoteCart();

        // Load all active modules.
        $this->container['modules']->load_active_modules();

        $this->container['block']           = new Block();
        $this->container['frontendscripts'] = new FrontendScripts();
    }

    /**
     * Add custom action links to the plugin on the plugins page.
     *
     * Adds "Settings", "Support", and optionally "Upgrade to Pro" links.
     *
     * @param array $links Existing plugin action links.
     * @return array Modified plugin action links with CatalogX links.
     */
    public function plugin_link( $links ) {
        $plugin_links = array(
            '<a href="' . admin_url( 'admin.php?page=catalogx#&tab=settings&subtab=general' ) . '">' . __( 'Settings', 'catalogx' ) . '</a>',
        );
        $links        = array_merge( $plugin_links, $links );
        if ( ! Utill::is_khali_dabba() ) {
            $links[] = '<a href="' . esc_url( CATALOGX_PRO_SHOP_URL ) . '" class="catalogx-pro-plugin" target="_blank" style="font-weight: 700;background: linear-gradient(110deg, rgb(63, 20, 115) 0%, 25%, rgb(175 59 116) 50%, 75%, rgb(219 75 84) 100%);-webkit-background-clip: text;-webkit-text-fill-color: transparent;">' . __( 'Upgrade to Pro', 'catalogx' ) . '</a>';
        }
        return $links;
    }

    /**
     * Add custom metadata links below the plugin description on the Plugins page.
     *
     * This typically shows small links like "Upgrade to Pro" in the plugin row footer.
     *
     * @param array  $links An array of the existing plugin metadata links.
     * @param string $file  Path to the plugin file relative to the plugins directory.
     * @return array Modified array of plugin metadata links.
     */
    public function plugin_row_meta( $links, $file ) {
        if ( CatalogX()->plugin_base === $file ) {
            $row_meta = array(
                'docs'    => '<a href="https://catalogx.com/docs/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx" target="_blank">' . esc_html__( 'Docs', 'catalogx' ) . '</a>',
                'support' => '<a href="https://catalogx.com/support/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx" target="_blank">' . __( 'Support', 'catalogx' ) . '</a>',
            );

            if ( ! Utill::is_khali_dabba() ) {
                $row_meta['pro'] = '<a href="' . esc_url( CATALOGX_PRO_SHOP_URL ) . '" class="catalogx-pro-plugin" target="_blank" style="font-weight: 700;background: linear-gradient(110deg, rgb(63, 20, 115) 0%, 25%, rgb(175 59 116) 50%, 75%, rgb(219 75 84) 100%);-webkit-background-clip: text;-webkit-text-fill-color: transparent;" title="' . esc_attr( __( 'Upgrade to Pro', 'catalogx' ) ) . '">' . __( 'Upgrade to Pro', 'catalogx' ) . '</a>';
            }

            return array_merge( $links, $row_meta );
        } else {
            return $links;
        }
    }

    /**
     * Take action based on if woocommerce is not loaded
     *
     * @return void
     */
    public function is_woocommerce_loaded() {
        if ( ! did_action( 'woocommerce_loaded' ) && is_admin() ) {
            add_action( 'admin_notices', array( $this, 'woocommerce_admin_notice' ) );
        }
    }

    /**
     * Display Woocommerce inactive notice.
     *
     * @return void
     */
    public function woocommerce_admin_notice() {
        ?>
        <div class="error">
            <p>
                <?php
                printf(
                    /* translators: 1. Opening <strong> tag, 2. Closing </strong> tag, 3. Opening <a> tag for WooCommerce plugin link, 4. Closing </a> tag, 5. Opening <a> tag for plugin activation link, 6. Closing </a> tag */
                    esc_html__( '%1$sCatalogX is inactive.%2$s The %3$sWooCommerce plugin%4$s must be active for CatalogX to work. Please %5$sinstall & activate WooCommerce%6$s', 'catalogx' ),
                    '<strong>',
                    '</strong>',
                    '<a target="_blank" href="http://wordpress.org/extend/plugins/woocommerce/">',
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
     * CatalogX emails
     *
     * @param array $emails Array of default WooCommerce email classes.
     * @return array Modified array with CatalogX email classes added.
     */
    public function load_emails( $emails ) {
        $emails['EnquiryEmail']          = new Emails\EnquiryEmail();
        $emails['requestQuoteSendEmail'] = new Emails\RequestQuoteSendEmail();
        return $emails;
    }

    /**
     * Catalog enquery activation function.
     *
     * @return void
     */
    public function activate() {
        ob_start();
        $this->container['install'] = new Install();

        if ( ! get_option( 'catalogx_plugin_installed' ) ) {
            add_option( 'catalogx_plugin_installed', true );
            add_option( 'catalogx_plugin_activated', true );
        }

        if ( ! get_option( 'catalogx_tour_active' ) ) {
            add_option( 'catalogx_tour_active', true );
            add_option( 'catalogx_tour_version', CatalogX()->version );
        }
        flush_rewrite_rules();
        ob_end_clean();
    }

    /**
     * Catalog enquery deactivation function.
     *
     * @return void
     */
    public function deactivate() {
        // Nothing to do write now.
    }

    /**
     * Load Localisation files.
     * Note: the first-loaded translation file overrides any following ones if the same translation is present
     *
     * @return void
     */
    public function load_plugin_textdomain() {
        if ( version_compare( $GLOBALS['wp_version'], '6.7', '<' ) ) {
            load_plugin_textdomain( 'catalogx', false, plugin_basename( dirname( __DIR__ ) ) . '/languages' );
        } else {
            load_textdomain( 'catalogx', WP_LANG_DIR . '/plugins/catalogx-' . determine_locale() . '.mo' );
        }
    }

    /**
     * Magic getter function to get the reference of class.
     * Accept class name, If valid return reference, else Wp_Error.
     *
     * @param   mixed $class The key name of the class to retrieve from the container.
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
     * Initializes the catalog enquiry class.
     * Checks for an existing instance
     * And if it doesn't find one, create it.
     *
     * @param mixed $file The full path to the plugin's main file.
     * @return object | null
     */
    public static function init( $file ) {
        if ( null === self::$instance ) {
            self::$instance = new self( $file );
        }

        return self::$instance;
    }
}
