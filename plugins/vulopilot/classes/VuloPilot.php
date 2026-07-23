<?php
/**
 * VuloPilot class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot;

defined( 'ABSPATH' ) || exit;

/**
 * VuloPilot Class.
 *
 * Plugin bootstrap singleton — same plain-array-container + magic
 * __get/__set shape as MultiVendorX\MultiVendorX. VuloPilot is not
 * WooCommerce-bound (unlike the multivendorx family), so unlike
 * MultiVendorX::init_plugin() this does not gate on 'woocommerce_loaded'
 * or declare HPOS compatibility — it boots on 'plugins_loaded' directly.
 *
 * @class       VuloPilot class
 * @version     1.0.0
 * @author      MultiVendorX
 */
final class VuloPilot {

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
        $this->container['version']        = VULOPILOT_PLUGIN_VERSION;
        $this->container['rest_namespace'] = 'vulopilot/v1';
        $this->container['plugin_slug']    = VULOPILOT_PLUGIN_SLUG;

        register_activation_hook( $file, array( $this, 'activate' ) );
        register_deactivation_hook( $file, array( $this, 'deactivate' ) );

        add_action( 'plugins_loaded', array( $this, 'init_plugin' ) );
        add_action( 'init', array( $this, 'load_plugin_textdomain' ) );
    }

    /**
     * Runs on plugin activation. Sets a flag rather than creating tables
     * directly — register_activation_hook() fires before 'plugins_loaded',
     * earlier than dbDelta()'s upgrade.php include and Utill's autoloaded
     * class are guaranteed available, so table creation is deferred to
     * init_plugin() where that's no longer a concern.
     *
     * @return void
     */
    public function activate() {
        add_option( Utill::VULOPILOT_OTHER_SETTINGS['run_installer'], true );
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

        if ( get_option( Utill::VULOPILOT_OTHER_SETTINGS['run_installer'] ) ) {
            new Install();
            delete_option( Utill::VULOPILOT_OTHER_SETTINGS['run_installer'] );
        }
    }

    /**
     * Initializes VuloPilot classes and fires 'vulopilot_loaded', the hook
     * VuloPilot Pro (and any third-party extension) gates its own boot on —
     * the equivalent of multivendorx_loaded for this product line.
     *
     * @return void
     */
    public function init_classes() {
        $this->container['util']            = new Utill();
        $this->container['admin']           = new Admin();
        $this->container['frontendScripts'] = new FrontendScripts();

        // Module loader (module-architecture.md) — loaded before every
        // registry below so a module's own constructor (e.g. registering
        // itself via `vulopilot_scanner_sources`) runs before those
        // registries' own `init` priority 20 hooks read those filters.
        $this->container['modules'] = new Modules();
        $this->container['modules']->load_active_modules();

        $this->container['scanner_registry'] = new Scanners\ScannerRegistry();
        $this->container['scan_runner']      = new Scanners\ScanRunner( $this->container['scanner_registry'] );

        $this->container['rule_registry'] = new RuleEngine\RuleRegistry();
        $this->container['rule_engine']   = new RuleEngine\RuleEngine( $this->container['rule_registry'] );

        $this->container['scan_persistence'] = new Services\ScanPersistenceListener();

        $this->container['scheduler'] = new Scheduler\Scheduler( $this->container['scan_runner'] );

        $this->container['automation_trigger_registry'] = new AutomationEngine\TriggerRegistry();
        $this->container['automation_action_registry']  = new AutomationEngine\ActionRegistry();
        $this->container['automation_engine']           = new AutomationEngine\AutomationEngine(
            $this->container['automation_trigger_registry'],
            $this->container['automation_action_registry'],
            $this->container['rule_engine']
        );

        $this->container['report_type_registry']     = new Reports\ReportTypeRegistry();
        $this->container['report_exporter_registry'] = new Reports\ReportExporterRegistry();
        $this->container['report_generator']         = new Reports\ReportGenerator(
            $this->container['report_type_registry'],
            $this->container['report_exporter_registry']
        );
        $this->container['scheduled_report_runner']  = new Reports\ScheduledReportRunner( $this->container['report_generator'] );

        $this->container['rest'] = new RestAPI\Rest();

        $this->container['ai_provider_registry'] = new AIProviders\ProviderRegistry();
        $this->container['ai_safety_validator']  = new AIProviders\Safety\AISafetyValidator();
        $this->container['ai_request_sender']    = new AIProviders\Support\SafeRequestSender(
            $this->container['ai_provider_registry'],
            $this->container['ai_safety_validator']
        );

        $this->container['ai_action_registry'] = new AIActions\ActionRegistry();
        $this->container['ai_action_runner']   = new AIActions\ActionRunner(
            $this->container['ai_action_registry'],
            $this->container['ai_request_sender']
        );

        // GEO module (GEO-MODULE.md) — reuses the same ai_request_sender
        // every AIAction goes through, not a second AI-calling path.
        $this->container['geo_analyzer'] = new GeoAnalysis\GeoAnalyzer( $this->container['ai_request_sender'] );

        // Extension SDK (ARCHITECTURE.md's Prompt 15) — vulopilot-pro and
        // any third-party plugin register here (`vulopilot_extension_sources`),
        // one tick before ScannerRegistry/RuleRegistry/etc. (all `init`
        // priority 20) read the per-concern filters an extension's own
        // register() call adds classes to.
        $this->container['extension_manager'] = new Sdk\ExtensionManager();

        if ( defined( 'WP_CLI' ) && WP_CLI ) {
            add_action( 'cli_init', array( Cli\VuloPilotCommand::class, 'register' ) );
        }

        $previous_version = get_option( Utill::VULOPILOT_OTHER_SETTINGS['plugin_db_version'], '' );
        if ( version_compare( $previous_version, $this->container['version'], '<' ) ) {
            new Install();
        }

        do_action( 'vulopilot_loaded' );
    }

    /**
     * Loads translation files.
     *
     * @return void
     */
    public function load_plugin_textdomain() {
        if ( version_compare( $GLOBALS['wp_version'], '6.7', '<' ) ) {
            load_plugin_textdomain( 'vulopilot', false, plugin_basename( dirname( $this->file ) ) . '/languages' );
        } else {
            load_textdomain( 'vulopilot', WP_LANG_DIR . '/plugins/vulopilot-' . determine_locale() . '.mo' );
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
