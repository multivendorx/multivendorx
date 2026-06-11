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
     * @var string| null
     */
    private $file = null;

    /**
     * Internal services for plugin-wide values.
     *
     * @var array
     */
    private $services = array();

    /**
     * CatalogX class constructor function
     *
     * @param mixed $file plugin's main file.
     */
    public function __construct( $file ) {
        require_once trailingslashit( dirname( $file ) ) . '/config.php';

        $this->file                               = $file;
        $this->services['plugin_url']             = trailingslashit( plugins_url( '', $file ) );
        $this->services['plugin_path']            = trailingslashit( dirname( $file ) );
        $this->services['plugin_base']            = plugin_basename( $file );
        $this->services['version']                = CATALOGX_PLUGIN_VERSION;
        $this->services['rest_namespace']         = 'catalogx/v1';
        $this->services['block_paths']            = array();
        $this->services['admin_email']            = get_option( 'admin_email' );
        $this->services['render_enquiry_btn_via'] = '';
        $this->services['render_quote_btn_via']   = '';
        $this->services['is_dev']                 = defined( 'WP_ENV' ) && WP_ENV === 'development';
        $this->services['date_format']            = get_option( 'date_format' ) . ' ' . get_option( 'time_format' );

        register_activation_hook( $file, array( $this, 'activate' ) );
        register_deactivation_hook( $file, array( $this, 'deactivate' ) );

        add_action( 'before_woocommerce_init', array( $this, 'declare_compatibility' ) );
        add_action( 'woocommerce_loaded', array( $this, 'load_plugin' ) );
        add_action( 'plugins_loaded', array( $this, 'handle_plugin_migration' ) );

        add_action( 'init', array( $this, 'load_plugin_textdomain' ) );
    }

    /**
     * Add High Performance Order Storage Support
     *
     * @return void
     */
    public function declare_compatibility() {
        FeaturesUtil::declare_compatibility( 'custom_order_tables', plugin_basename( $this->file ), true );
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
    public function load_plugin() {
        add_action( 'init', array( $this, 'register_services' ), 0 );
        if ( get_option( Utill::CATALOGX_OTHER_SETTINGS['run_installer'] ) ) {
            new Installer();
            delete_option( Utill::CATALOGX_OTHER_SETTINGS['run_installer'] );
        }

        add_action( 'init', array( $this, 'catalogx_register_strings_and_setup_wizard' ) );

        add_filter( 'woocommerce_email_classes', array( $this, 'register_email_classes' ) );
    }

    /**
     * Load setup class and register string
     */
    public function catalogx_register_strings_and_setup_wizard() {
        new SetupWizard();
        if ( get_option( Utill::CATALOGX_OTHER_SETTINGS['plugin_activated'] ) ) {
            delete_option( Utill::CATALOGX_OTHER_SETTINGS['plugin_activated'] );
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

        $form_settings = CatalogX()->setting->get_option( Utill::CATALOGX_SETTINGS['enquiry-catalog-customization'] );

		foreach ( $form_settings['enquiry_form_tabs']['enquiry_form_builder'] as $field ) {
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

		foreach ( $form_settings['enquiry_form_tabs'] as $free_field ) {
			if ( isset( $free_field['label'] ) ) {
				icl_register_string( 'catalogx', 'free_form_label_' . $free_field['key'], $free_field['label'] );
			}
		}

        if ( function_exists( 'pll_register_string' ) ) {
            pll_register_string( 'my-quote', 'my-quote', 'catalogx' );
        }

        // Save the form settings to the options table.
        update_option( 'catalogx_enquiry_form_customization_settings', $form_settings );
    }

    /**
     * Initialize and load all core plugin classes into the services.
     *
     * This includes settings, admin/backend logic, frontend handling,
     * REST API endpoints, utilities, modules, shortcodes, session management,
     * quote cart logic, Gutenberg blocks, and frontend scripts.
     *
     * @return void
     */
    public function register_services() {
        $this->services['current_user_id'] = get_current_user_id();
        $this->services['current_user']    = wp_get_current_user();
        $this->services['setting']   = new Setting();
        $this->services['admin']     = new Admin();
        $this->services['frontend']  = new Frontend();
        $this->services['rest']      = new RestAPI\Rest();
        $this->services['util']      = new Utill();
        $this->services['modules']   = new Modules();
        $this->services['shortcode'] = new Shortcode();
        $this->services['session']   = new Core\Session();
        $this->services['quotecart'] = new Core\QuoteCart();
        $this->services['promotions']      = new Promotions();
        // Load all active modules.
        $this->services['modules']->load_active_modules();

        $this->services['block']           = new Block();
        $this->services['frontendscripts'] = new FrontendScripts();

        do_action( 'catalogx_loaded' );
        flush_rewrite_rules();
    }

    /**
     * Take action based on if woocommerce is not loaded
     *
     * @return void
     */
    public function handle_plugin_migration() {
        if ( did_action( 'woocommerce_loaded' ) || ! is_admin() ) {
            $previous_version = get_option( Utill::CATALOGX_OTHER_SETTINGS['plugin_db_version'], '' );
            if ( version_compare( $previous_version, CatalogX()->version, '<' ) ) {
                new Installer();
            }
            return;
        }
    }

    /**
     * CatalogX emails
     *
     * @param array $emails Array of default WooCommerce email classes.
     * @return array Modified array with CatalogX email classes added.
     */
    public function register_email_classes( $emails ) {
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
        add_option( Utill::CATALOGX_OTHER_SETTINGS['run_installer'], true );
        if ( ! get_option( Utill::CATALOGX_OTHER_SETTINGS['installed'] ) ) {
            add_option( Utill::CATALOGX_OTHER_SETTINGS['installed'], true );
            add_option( Utill::CATALOGX_OTHER_SETTINGS['plugin_activated'], true );
        }
    }

    /**
     * Catalog enquery deactivation function.
     *
     * @return void
     */
    public function deactivate() {
        delete_option( Utill::CATALOGX_OTHER_SETTINGS['installed'] );
        delete_option( Utill::CATALOGX_OTHER_SETTINGS['plugin_page_install'] );
        flush_rewrite_rules();
    }

    /**
     * Load Localisation files.
     * Note: the first-loaded translation file overrides any following ones if the same translation is present
     *
     * @return void
     */
    public function load_plugin_textdomain() {
        global $wp_version;
        if ( version_compare( $wp_version, '6.7', '<' ) ) {
            load_plugin_textdomain( 'catalogx', false, plugin_basename( dirname( __DIR__ ) ) . '/languages' );
        } else {
            load_textdomain( 'catalogx', WP_LANG_DIR . '/plugins/catalogx-' . determine_locale() . '.mo' );
        }
    }

    /**
     * Magic getter function to get the reference of class.
     * Accept class name, If valid return reference, else Wp_Error.
     *
     * @param   mixed $class The key name of the class to retrieve from the services.
     * @return  object | \WP_Error
     */
    public function __get( $class ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound
        if ( array_key_exists( $class, $this->services ) ) {
            return $this->services[ $class ];
        }
        return new \WP_Error( sprintf( 'Call to unknown class %s.', $class ) );
    }

    /**
     * Magic setter function to store a reference of a class.
     * Accepts a class name as the key and stores the instance in the services.
     *
     * @param string $class The class name or key to store the instance.
     * @param object $value The instance of the class to store.
     */
    public function __set( $class, $value ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound
        $this->services[ $class ] = $value;
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
