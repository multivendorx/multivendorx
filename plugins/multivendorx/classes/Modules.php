<?php
/**
 * Modules class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

use MultiVendorX\Utill;

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
    public function __construct() {}

    /**
     * Convert camel case string to kebab case.
     *
     * @param string $string_param The camel case string to convert.
     * @return string The converted kebab case string.
     */
    private function camel_to_kebab( string $string_param ): string {
        return strtolower(
            preg_replace( '/(?<!^)[A-Z]/', '-$0', $string_param )
        );
    }
    /**
     * Get all modules dynamically from /modules directory
     */
    public function get_all_modules(): array {

        if ( ! empty( $this->modules ) ) {
            return $this->modules;
        }

        $sources = apply_filters(
            'multivendorx_module_sources',
            array(
                array(
                    'path'      => trailingslashit( MultiVendorX()->plugin_path . 'modules' ),
                    'namespace' => 'MultiVendorX',
                ),
            )
        );

        foreach ( $sources as $source ) {
            $base_path = $source['path'];
            $namespace = $source['namespace'];

            if ( ! is_dir( $base_path ) ) {
                continue;
            }

            $folders = scandir( $base_path );

            foreach ( $folders as $folder ) {
                if ( in_array( $folder, array( '.', '..' ), true ) ) {
                    continue;
                }

                $module_file = $base_path . $folder . '/Module.php';

                if ( ! is_dir( $base_path . $folder ) || ! file_exists( $module_file ) ) {
                    continue;
                }

                $module_id = $this->camel_to_kebab( $folder );

                $key = array_key_exists($module_id, $this->modules)
                    ? $namespace . '_' . $module_id
                    : $module_id;

                $this->modules[$key] = array(
                    'id'           => $module_id,
                    'module_file'  => $module_file,
                    'module_class' => "{$namespace}\\{$folder}\\Module",
                );
            }
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

        return MultiVendorX()->setting->get_option( Utill::ACTIVE_MODULES_DB_KEY, array() );
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

        $active_modules = $this->get_active_modules();
        $all_modules    = $this->get_all_modules();

        $validated_active = [];
        foreach ( $active_modules as $module_id ) {
            foreach ( $all_modules as $key => $module ) {
                // Match same module id (free + pro both)
                if ( empty( $module['id'] ) || $module['id'] !== $module_id ) {
                    continue;
                }
                if ( ! $this->is_module_available( $module ) ) {
                    continue;
                }

                require_once $module['module_file'];

                try {
                    $class = $module['module_class'];
                    $this->container[ $key ] = new $class(); 
                } catch ( \Throwable $e ) {
                    MultiVendorX()->util->log( $e );
                    continue;
                }

                do_action(
                    "multivendorx_activated_module_{$module_id}",
                    $this->container[ $key ]
                );
            }

            $validated_active[] = $module_id;
        }

        if ( $validated_active !== $active_modules ) {
            update_option( Utill::ACTIVE_MODULES_DB_KEY, $validated_active );
            $this->active_modules = $validated_active;
        }

        self::$module_activated = true;
    }

	/**
	 * Check a particular module is available or not.
	 *
	 * @param array $module The module configuration array.
	 * @return bool
	 */
    private function is_module_available( $module ) {
        if ( ! file_exists( $module['module_file'] ) ) {
            return false;
        }

        require_once $module['module_file'];

        $class = $module['module_class'];

        if ( class_exists( $class ) && method_exists( $class, 'is_compatible' ) ) {
            if ( ! $class::is_compatible() ) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get list of all module's id
     *
     * @return array
     */
    public function get_all_modules_ids() {
        return array_keys( $this->get_all_modules() );
    }

    /**
     * Get all available modules.
     *
     * @return array
     */
    public function get_available_modules(): array {
        $available = array();

        foreach ( $this->get_all_modules() as $id => $module ) {
            if ( $this->is_module_available( $module ) ) {
                $available[] = $id;
            }
        }

        return $available;
    }

    /**
     * Activate modules
     *
     * @param array $modules The module name to activate.
     * @return array|mixed
     */
    public function activate_modules( $modules ) {
        $active_modules       = $this->get_active_modules();
        $this->active_modules = array_unique( array_merge( $active_modules, $modules ) );

        update_option( Utill::ACTIVE_MODULES_DB_KEY, $this->active_modules );

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
    public function deactivate_modules( array $modules ): array {

        $this->active_modules = array_values(
            array_diff( $this->get_active_modules(), $modules )
        );

        update_option( Utill::ACTIVE_MODULES_DB_KEY, $this->active_modules );

        add_action(
            'shutdown',
            function () use ( $modules ) {
                foreach ( $modules as $module_id ) {
                    if ( isset( $this->container[ $module_id ] ) ) {
                        do_action(
                            "multivendorx_deactivated_module_{$module_id}",
                            $this->container[ $module_id ]
                        );
                    }
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
