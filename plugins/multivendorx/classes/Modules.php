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
     * Get list of all multivendorX module.
     *
     * @return array
     */
    // public function get_all_modules() {
    //     if ( ! $this->modules ) {
    //         $this->modules = apply_filters(
    //             'multivendorx_modules',
    //             array(
    //                 'simple'                 => array(
    //                     'id'           => 'simple',
    //                     'module_file'  => MultiVendorX()->plugin_path . 'modules/Simple/Module.php',
    //                     'module_class' => 'MultiVendorX\Simple\Module',
    //                 ),
    //                 'store-policy'           => array(
    //                     'id'           => 'store-policy',
    //                     'module_file'  => MultiVendorX()->plugin_path . 'modules/StorePolicy/Module.php',
    //                     'module_class' => 'MultiVendorX\StorePolicy\Module',
    //                 ),
    //                 'store-review'           => array(
    //                     'id'           => 'store-review',
    //                     'module_file'  => MultiVendorX()->plugin_path . 'modules/StoreReview/Module.php',
    //                     'module_class' => 'MultiVendorX\StoreReview\Module',
    //                 ),
    //                 'question-answer'        => array(
    //                     'id'           => 'question-answer',
    //                     'module_file'  => MultiVendorX()->plugin_path . 'modules/QuestionAnswers/Module.php',
    //                     'module_class' => 'MultiVendorX\QuestionsAnswers\Module',
    //                 ),
    //                 'marketplace-refund'     => array(
    //                     'id'           => 'marketplace-refund',
    //                     'module_file'  => MultiVendorX()->plugin_path . 'modules/MarketplaceRefund/Module.php',
    //                     'module_class' => 'MultiVendorX\Refund\Module',
    //                 ),
    //                 'shared-listing'         => array(
    //                     'id'           => 'shared-listing',
    //                     'module_file'  => MultiVendorX()->plugin_path . 'modules/SharedListing/Module.php',
    //                     'module_class' => 'MultiVendorX\SharedListing\Module',
    //                 ),
    //                 'follow-store'           => array(
    //                     'id'           => 'follow-store',
    //                     'module_file'  => MultiVendorX()->plugin_path . 'modules/FollowStore/Module.php',
    //                     'module_class' => 'MultiVendorX\FollowStore\Module',
    //                 ),
    //                 'marketplace-compliance' => array(
    //                     'id'           => 'marketplace-compliance',
    //                     'module_file'  => MultiVendorX()->plugin_path . 'modules/Compliance/Module.php',
    //                     'module_class' => 'MultiVendorX\Compliance\Module',
    //                 ),
    //                 'geo-location'           => array(
    //                     'id'           => 'geo-location',
    //                     'module_file'  => MultiVendorX()->plugin_path . 'modules/GeoLocation/Module.php',
    //                     'module_class' => 'MultiVendorX\GeoLocation\Module',
    //                 ),
    //                 'store-shipping'         => array(
    //                     'id'           => 'store-shipping',
    //                     'module_file'  => MultiVendorX()->plugin_path . 'modules/StoreShipping/Module.php',
    //                     'module_class' => 'MultiVendorX\StoreShipping\Module',
    //                 ),
    //                 'announcement'           => array(
    //                     'id'           => 'announcement',
    //                     'module_file'  => MultiVendorX()->plugin_path . 'modules/Announcement/Module.php',
    //                     'module_class' => 'MultiVendorX\Announcement\Module',
    //                 ),
    //                 'knowledgebase'          => array(
    //                     'id'           => 'knowledgebase',
    //                     'module_file'  => MultiVendorX()->plugin_path . 'modules/Knowledgebase/Module.php',
    //                     'module_class' => 'MultiVendorX\Knowledgebase\Module',
    //                 ),
    //                 'privacy'                => array(
    //                     'id'           => 'privacy',
    //                     'module_file'  => MultiVendorX()->plugin_path . 'modules/Privacy/Module.php',
    //                     'module_class' => 'MultiVendorX\Privacy\Module',
    //                 ),
    //                 'marketplace-gateway'    => array(
    //                     'id'           => 'marketplace-gateway',
    //                     'module_file'  => MultiVendorX()->plugin_path . 'modules/MarketplaceGateway/Module.php',
    //                     'module_class' => 'MultiVendorX\MarketplaceGateway\Module',
    //                 ),
    //                 'min-max'                => array(
    //                     'id'           => 'min-max',
    //                     'module_file'  => MultiVendorX()->plugin_path . 'modules/MinMax/Module.php',
    //                     'module_class' => 'MultiVendorX\MinMax\Module',
    //                 ),
    //                 'elementor'              => array(
    //                     'id'           => 'elementor',
    //                     'module_file'  => MultiVendorX()->plugin_path . 'modules/Elementor/Module.php',
    //                     'module_class' => 'MultiVendorX\Elementor\Module',
    //                     'requires'     => array(
    //                         'plugin' => array(
    //                             'elementor/elementor.php',
    //                             'elementor-pro/elementor-pro.php',
    //                         ),
    //                     ),
    //                 ),
    //                 'wpml'                   => array(
    //                     'id'           => 'wpml',
    //                     'module_file'  => MultiVendorX()->plugin_path . 'modules/WPML/Module.php',
    //                     'module_class' => 'MultiVendorX\WPML\Module',
    //                     'requires'     => array(
    //                         'plugin' => array(
    //                             'sitepress-multilingual-cms/sitepress.php',
    //                             'wpml-string-translation/plugin.php',
    //                             'woocommerce-multilingual/wpml-woocommerce.php',
    //                         ),
    //                     ),
    //                 ),
    //             )
    //         );
    //     }

    //     return $this->modules;
    // }

    private function camel_to_kebab( string $string ): string {
        return strtolower(
            preg_replace( '/(?<!^)[A-Z]/', '-$0', $string )
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
            [
                [
                    'path'      => trailingslashit( MultiVendorX()->plugin_path . 'modules' ),
                    'namespace' => 'MultiVendorX',
                ],
            ]
        );

        foreach ( $sources as $source ) {

            $base_path = $source['path'];
            $namespace = $source['namespace'];

            if ( ! is_dir( $base_path ) ) {
                continue;
            }

            $folders = scandir( $base_path );

            foreach ( $folders as $folder ) {

                if ( in_array( $folder, ['.', '..'], true ) ) {
                    continue;
                }

                $module_file = $base_path . $folder . '/Module.php';

                if ( ! is_dir( $base_path . $folder ) || ! file_exists( $module_file ) ) {
                    continue;
                }

                $module_id = $this->camel_to_kebab( $folder );

                $this->modules[ $module_id ] = [
                    'id'           => $module_id,
                    'module_file'  => $module_file,
                    'module_class' => "{$namespace}\\{$folder}\\Module",
                ];
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

            if ( empty( $all_modules[ $module_id ] ) ) {
                continue;
            }

            $module = $all_modules[ $module_id ];

            if ( ! $this->is_module_available( $module ) ) {
                continue;
            }

            if ( isset( $this->container[ $module_id ] ) ) {
                $validated_active[] = $module_id;
                continue;
            }

            require_once $module['module_file'];

            try {
                $class = $module['module_class'];
                $this->container[ $module_id ] = new $class();
                $validated_active[] = $module_id;
            } catch ( \Throwable $e ) {
                MultiVendorX()->util->log( $e );
                continue;
            }

            do_action(
                "multivendorx_activated_module_{$module_id}",
                $this->container[ $module_id ]
            );
        }

        if ( $validated_active !== $active_modules ) {
            update_option( Utill::ACTIVE_MODULES_DB_KEY, $validated_active );
            $this->active_modules = $validated_active;
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
        $available      = [];

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
