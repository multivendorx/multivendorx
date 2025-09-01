<?php
/**
 * Modules class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Modules Class
 *
 * @class       Modules class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Modules {
    /**
     * Option's table key for active module list.
     *
     * @var string
     */
    const ACTIVE_MODULES_DB_KEY = 'multivendorx_all_active_module_list';

    /**
     * List of all module.
     *
     * @var array
     */
    private $modules = array();

    /**
     * List of all active module.
     *
     * @var array
     */
    private $active_modules = array();

    /**
     * State for modules are activated or not.
     *
     * @var bool
     */
    private static $module_activated = false;

    /**
     * Container that store the object of active module
     *
     * @var array
     */

    private $container = array();

    /**
     * Constructor of Modules class
     *
     * @return void
     */
    public function __construct() {
    }

    /**
     * Get list of all multivendorX module.
     *
     * @return array
     */
    public function get_all_modules() {
        if ( ! $this->modules ) {
            $this->modules = apply_filters(
                'multivendorx_modules',
                array(
					'simple'                => array(
						'id'           => 'simple',
						'module_file'  => MultiVendorX()->plugin_path . 'modules/Simple/Module.php',
						'module_class' => 'MultiVendorX\Simple\Module',
					),
					'variable'              => array(
						'id'           => 'variable',
						'module_file'  => MultiVendorX()->plugin_path . 'modules/Variable/Module.php',
						'module_class' => 'MultiVendorX\Variable\Module',
					),
                    'identity-verification' => array(
						'id'           => 'identity-verification',
						'module_file'  => MultiVendorX()->plugin_path . 'modules/Identity/Module.php',
						'module_class' => 'MultiVendorX\Identity\Module',
					),
                    'store-policy' => array(
						'id'           => 'store-policy',
						'module_file'  => MultiVendorX()->plugin_path . 'modules/StorePolicy/Module.php',
						'module_class' => 'MultiVendorX\StorePolicy\Module',
					),
				)
            );
        }

        return $this->modules;
    }

    /**
     * Get all active modules
     *
     * @return array
     */
    public function get_active_modules() {
        // If active modules are loaded return it.
        if ( $this->active_modules ) {
            return $this->active_modules;
        }

        $this->active_modules = MultiVendorX()->setting->get_option( self::ACTIVE_MODULES_DB_KEY, array() );

        return $this->active_modules;
    }

    /**
     * Load all active modules
     *
     * @return void
     */
    public function load_active_modules() {
        if ( self::$module_activated ) {
            return;
        }

        $license_active    = Utill::is_khali_dabba();
        $active_modules    = $this->get_active_modules();
        $all_modules       = $this->get_all_modules();
        $activated_modules = array();

        foreach ( $active_modules as $modules_id ) {
            if ( ! isset( $all_modules[ $modules_id ] ) ) {
                continue;
            }

            $module = $all_modules[ $modules_id ];

            // Check if the module is available.
            if ( ! $this->is_module_available( $module, $license_active ) ) {
                continue;
            }

            // Store the module as active module.
            if ( file_exists( $module['module_file'] ) ) {
                $activated_modules[] = $modules_id;
            }

            // Activate the module.
            if ( file_exists( $module['module_file'] ) && ! in_array( $modules_id, $this->container, true ) ) {
                require_once $module['module_file'];

                $module_class                   = $module['module_class'];
                $this->container[ $modules_id ] = new $module_class();

                /**
                 * Module activation hook
                 *
                 * @param object $name module object
                 */
                do_action( 'multivendorx_activated_module_' . $modules_id, $this->container[ $modules_id ] );
            }
        }

        // store activated module as active module.
        if ( $activated_modules !== $active_modules ) {
            update_option( self::ACTIVE_MODULES_DB_KEY, $activated_modules );
        }

        self::$module_activated = true;
    }

    /**
     * Check a perticular module is available or not.
     *
     * @param array $module The module configuration array.
     * @param bool  $license_active Whether the license for pro modules is active.
     * @return bool
     */
    private function is_module_available( $module, $license_active ) {
        $is_pro_module = $module['pro_module'] ?? false;

        // if it is free module.
        if ( ! $is_pro_module ) {
            return true;
        }

        // if it is pro module.
        if ( $is_pro_module && $license_active ) {
            return true;
        }

        return false;
    }

    /**
     * Get list of all module's id
     *
     * @return array
     */
    public function get_all_modules_ids() {
        $modules = $this->get_all_modules();
        return array_keys( $modules );
    }

    /**
     * Get all available modules.
     *
     * @return array
     */
    public function get_available_modules() {
        $modules           = $this->get_all_modules();
        $license_active    = Utill::is_khali_dabba();
        $available_modules = array();

        foreach ( $modules as $module_id => $module ) {
            // Check if the module is available.
            if ( ! $this->is_module_available( $module, $license_active ) ) {
                continue;
            }

            if ( file_exists( $module['module_file'] ) ) {
                $available_modules[] = $module['id'];
            }
        }

        return $available_modules;
    }

    /**
     * Activate modules
     *
     * @param array $modules The module name to activate.
     * @return array|mixed
     */
    public function activate_modules( $modules ) {
        $active_modules = $this->get_active_modules();

        $this->active_modules = array_unique( array_merge( $active_modules, $modules ) );

        update_option( self::ACTIVE_MODULES_DB_KEY, $this->active_modules );

        self::$module_activated = false;

        $this->load_active_modules();

        return $this->active_modules;
    }

    /**
     * Defactivate modules.
     *
     * @param array $modules The module name to deactivate.
     * @return array
     */
    public function deactivate_modules( $modules ) {
        $active_modules = $this->get_active_modules();

        foreach ( $modules as $module_id ) {
            $active_modules = array_diff( $active_modules, array( $module_id ) );
        }

        $active_modules = array_values( $active_modules );

        $this->active_modules = $active_modules;

        update_option( self::ACTIVE_MODULES_DB_KEY, $this->active_modules );

        add_action(
            'shutdown',
            function () use ( $modules ) {
                foreach ( $modules as $module_id ) {
                    /**
                     * Module deactivation hook
                     *
                     * @param object $module deactivated module object
                     */
                    do_action( 'multivendorx_deactivated_module_' . $module_id, $this->container[ $module_id ] );
                }
            }
        );

        return $this->active_modules;
    }

    /**
     * Get a module is available or not.
     *
     * @param mixed $module_id The id of the module to check.
     * @return bool
     */
    public function is_available( $module_id ) {
        $available_modules = $this->get_available_modules();

        return in_array( $module_id, $available_modules, true );
    }

    /**
     * Check a module is active or not
     *
     * @param mixed $module_id The id of the module to check.
     * @return bool
     */
    public function is_active( $module_id ) {
        $active_modules = $this->get_active_modules();

        return in_array( $module_id, $active_modules, true );
    }
}
