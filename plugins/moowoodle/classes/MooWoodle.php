<?php
/**
 * MooWoodle class file.
 *
 * @package MooWoodle
 */

namespace MooWoodle;

use Automattic\WooCommerce\Utilities\FeaturesUtil;
use MooWoodle\RestAPI\Rest;

defined( 'ABSPATH' ) || exit;

/**
 * MooWoodle Main Class
 *
 * @version     3.3.0
 * @package     MooWoodle
 * @author      DualCube
 */
final class MooWoodle {
    /**
     * Contain reference of MooWoodle class's object
     *
     * @var object | null
     */
	private static $instance = null;

    /**
     * Contain all helper class's reference
     *
     * @var array
     */
    private $services = array();

    /**
     * File path of moowoodle plugin.
     *
     * @var string | null
     */
    public $file = null;

    /**
     * MooWoodle class constructor function.
     *
     * @param string $file File path of moowoodle plugin.
     */
	public function __construct( $file ) {

        // load config file.
        require_once trailingslashit( dirname( $file ) ) . 'config.php';

        // store plugin info.
        $this->file                           = $file;
        $this->services['plugin_url']         = trailingslashit( plugins_url( '', $file ) );
        $this->services['plugin_path']        = trailingslashit( dirname( $file ) );
        $this->services['version']            = MOOWOODLE_PLUGIN_VERSION;
        $this->services['block_paths']        = array();
        $this->services['rest_namespace']     = 'moowoodle/v1';
        $this->services['moowoodle_logs_dir'] = ( trailingslashit( wp_upload_dir( null, false )['basedir'] ) . 'mw-logs' );
        $this->services['is_dev']             = defined( 'WP_ENV' ) && WP_ENV === 'development';
        $this->services['plugin_base']        = plugin_basename( $file );
        // activation and deactivation hook.
        register_activation_hook( $file, array( $this, 'activate' ) );
        register_deactivation_hook( $file, array( $this, 'deactivate' ) );

        // initialise plugin.
        add_action( 'before_woocommerce_init', array( $this, 'declare_compatibility' ) );
        add_action( 'woocommerce_loaded', array( $this, 'load_plugin' ) );
        add_action( 'init', array( $this, 'load_plugin_textdomain' ) );
        add_action( 'plugins_loaded', array( $this, 'handle_plugin_migration' ) );
        add_filter( 'plugin_row_meta', array( $this, 'plugin_row_meta' ), 10, 2 );
	}

    /**
     * Activation function.
     *
     * @return void
     */
    public function activate() {
        $this->services['install'] = new Installer();
        add_rewrite_endpoint( 'my-courses', EP_ROOT | EP_PAGES );
        flush_rewrite_rules();
    }

    /**
     * Deactivation function.
     *
     * @return void
     */
    public function deactivate() {
		// Nothing to write now.
        flush_rewrite_rules();
    }

    /**
     * Add High Performance Order Storage Support.
     *
     * @return void
     */
    public function declare_compatibility() {
        FeaturesUtil::declare_compatibility( 'custom_order_tables', WP_CONTENT_DIR . '/plugins/moowoodle/moowoodle.php', true );
    }

    /**
     * Init plugin on woocommerce_loaded hook.
     *
     * @return void
     */
    public function load_plugin() {

        // add link on pugin 'active' button.
        if ( is_admin() && ! wp_doing_ajax() ) {
            add_filter( 'plugin_action_links_' . plugin_basename( $this->file ), array( $this, 'get_plugin_action_links' ) );
        }

        add_filter( 'woocommerce_email_classes', array( $this, 'register_email_classes' ) );

        // Init required classes.
        $this->register_services();

        /**
         * Action hook after MooWoodle loads.
         */
        do_action( 'moowoodle_loaded' );
    }

    /**
     * Initialize all MooWoodle classes.
     * Access this classes using magic method.
     *
     * @return void
     */
    public function register_services() {
        $this->services['current_user_id'] = get_current_user_id();
        $this->services['current_user']    = wp_get_current_user();
        if ( is_admin() ) {
			$this->services['admin'] = new Admin();
		}

		$this->services['util']             = new Util();
        $this->services['setting']          = new Setting();
		$this->services['rest']             = new Rest();
		$this->services['course']           = new Core\Course();
		$this->services['category']         = new Core\Category();
		$this->services['product']          = new Core\Product();
        $this->services['external_service'] = new ExternalService();
		$this->services['enrollment']       = new Enrollment();
        $this->services['block']            = new Block();
        $this->services['frontendscripts']  = new FrontendScripts();
        $this->services['endpoint']         = new Endpoint();
        $this->services['promotions']       = new Promotions();
        $this->initialize_moowoodle_log();
    }

    /**
     * Take action based on if woocommerce is not loaded.
     *
     * @return void
     */
    public function handle_plugin_migration() {
        if ( did_action( 'woocommerce_loaded' ) ) {
            $previous_version = get_option( 'moowoodle_version', '' );
            if ( version_compare( $previous_version, MooWoodle()->version, '<' ) ) {
                new Installer();
            }
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
        if ( MooWoodle()->plugin_base === $file ) {
            $row_meta = array(
                'docs'    => '<a href="https://dualcube.com/docs/moowoodle-set-up-guide/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=moowoodle" aria-label="' . esc_attr__( 'View documentation', 'moowoodle' ) . '" target="_blank" rel="noopener noreferrer">' . esc_html__( 'Docs', 'moowoodle' ) . '</a>',
                'support' => '<a href="https://wordpress.org/support/plugin/moowoodle/" aria-label="' . esc_attr__( 'Visit community forums', 'moowoodle' ) . '" target="_blank" rel="noopener noreferrer">' . esc_html__( 'Support', 'moowoodle' ) . '</a>',
            );

            if ( ! Util::is_khali_dabba() ) {
                $row_meta['go_pro'] = '<a href="' . MOOWOODLE_PRO_SHOP_URL . '" class="moowoodle-pro-plugin" target="_blank" style="font-weight: 700;background: linear-gradient(110deg, rgb(63, 20, 115) 0%, 25%, rgb(175 59 116) 50%, 75%, rgb(219 75 84) 100%);-webkit-background-clip: text;-webkit-text-fill-color: transparent;">' . __( 'Upgrade to Pro', 'moowoodle' ) . '</a>';
            }

            return array_merge( $links, $row_meta );
        }

        return $links;
    }

    /**
     * Render plugin page links.
     *
     * @param array $links all links.
     * @return array
     */
    public static function get_plugin_action_links( $links ) {

        // Create moowoodle plugin page link.
        $plugin_links = array(
            '<a href="' . admin_url( 'admin.php?page=moowoodle#&tab=settings&subtab=general' ) . '">' . __( 'Settings', 'moowoodle' ) . '</a>',
        );

        // Append the link.
        $links = array_merge( $plugin_links, $links );

        if ( ! Util::is_khali_dabba() ) {
            $links[] = '<a href="' . MOOWOODLE_PRO_SHOP_URL . '" target="_blank" style="font-weight: 700;background: linear-gradient(110deg, rgb(63, 20, 115) 0%, 25%, rgb(175 59 116) 50%, 75%, rgb(219 75 84) 100%);-webkit-background-clip: text;-webkit-text-fill-color: transparent;">' . __( 'Upgrade to Pro', 'moowoodle' ) . '</a>';
        }

        return $links;
    }

	/**
	 * Load Localisation files.
	 * Note: the first-loaded translation file overrides any following ones if the same translation is present.
     *
	 * @return void
	 */
	public function load_plugin_textdomain() {
        global $wp_version;
        if ( version_compare( $wp_version, '6.7', '<' ) ) {
            load_plugin_textdomain( 'moowoodle', false, plugin_basename( dirname( __DIR__ ) ) . '/languages' );
        } else {
            load_textdomain( 'moowoodle', WP_LANG_DIR . '/plugins/moowoodle-' . determine_locale() . '.mo' );
        }
	}

    /**
     * Get moowoodle log file name.
     */
    public function initialize_moowoodle_log() {
        // The log file name is stored in the options table because it is generated with an arbitrary name.
        $log_file_name = get_option( Util::MOOWOODLE_OTHER_SETTINGS['log_file'] );

        if ( ! $log_file_name ) {
            $log_file_name = uniqid( 'error' ) . '.txt';
            update_option( Util::MOOWOODLE_OTHER_SETTINGS['log_file'], $log_file_name );
        }

        $this->services['log_file']          = MooWoodle()->moowoodle_logs_dir . '/' . $log_file_name;
        $this->services['show_advanced_log'] = in_array( 'moowoodle_adv_log', MooWoodle()->setting->get_setting( 'moowoodle_adv_log', array() ), true );
    }

	/**
     * Magic getter function to get the reference of class.
     * Accept class name, If valid return reference, else Wp_Error.
     *
     * @param   mixed $class class.
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
     * Initializes the MooWoodle class.
     * Checks for an existing instance.
     * And if it doesn't find one, create it.
     *
     * @param mixed $file file name.
     * @return object | null
     */
	public static function init( $file ) {
        if ( null === self::$instance ) {
            self::$instance = new self( $file );
        }

        return self::$instance;
    }

    /**
     * Add Enrollment Email Class
     *
     * @param array $emails List of WooCommerce email classes.
     * @return array Modified list of email classes including EnrollmentEmail.
     */
    public function register_email_classes( $emails ) {
        $emails['EnrollmentEmail'] = new Emails\EnrollmentEmail();
        return $emails;
    }

    // Alternative of __get()
    public function get_service( $service_key ) {
        return $this->services[ $service_key ] ?? null;
    }
}
