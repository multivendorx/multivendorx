<?php

/**
 * Modules class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

use MultiVendorX\Utill;

defined('ABSPATH') || exit;

/**
 * MultiVendorX Modules Class
 *
 * @class       Modules class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Modules
{
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
    public function get_all_modules()
    {
        if (! $this->modules) {
            $this->modules = apply_filters(
                'multivendorx_modules',
                array(
                    'simple'                 => array(
                        'id'           => 'simple',
                        'module_file'  => MultiVendorX()->plugin_path . 'modules/Simple/Module.php',
                        'module_class' => 'MultiVendorX\Simple\Module',
                    ),
                    'store-policy'           => array(
                        'id'           => 'store-policy',
                        'module_file'  => MultiVendorX()->plugin_path . 'modules/StorePolicy/Module.php',
                        'module_class' => 'MultiVendorX\StorePolicy\Module',
                    ),
                    'store-review'           => array(
                        'id'           => 'store-review',
                        'module_file'  => MultiVendorX()->plugin_path . 'modules/StoreReview/Module.php',
                        'module_class' => 'MultiVendorX\StoreReview\Module',
                    ),
                    'question-answer'        => array(
                        'id'           => 'question-answer',
                        'module_file'  => MultiVendorX()->plugin_path . 'modules/QuestionsAnswers/Module.php',
                        'module_class' => 'MultiVendorX\QuestionsAnswers\Module',
                    ),
                    'marketplace-refund'     => array(
                        'id'           => 'marketplace-refund',
                        'module_file'  => MultiVendorX()->plugin_path . 'modules/Refund/Module.php',
                        'module_class' => 'MultiVendorX\Refund\Module',
                    ),
                    'shared-listing'         => array(
                        'id'           => 'shared-listing',
                        'module_file'  => MultiVendorX()->plugin_path . 'modules/SPMV/Module.php',
                        'module_class' => 'MultiVendorX\SPMV\Module',
                    ),
                    'follow-store'           => array(
                        'id'           => 'follow-store',
                        'module_file'  => MultiVendorX()->plugin_path . 'modules/FollowStore/Module.php',
                        'module_class' => 'MultiVendorX\FollowStore\Module',
                    ),
                    'marketplace-compliance' => array(
                        'id'           => 'marketplace-compliance',
                        'module_file'  => MultiVendorX()->plugin_path . 'modules/Compliance/Module.php',
                        'module_class' => 'MultiVendorX\Compliance\Module',
                    ),
                    'geo-location'           => array(
                        'id'           => 'geo-location',
                        'module_file'  => MultiVendorX()->plugin_path . 'modules/GeoLocation/Module.php',
                        'module_class' => 'MultiVendorX\GeoLocation\Module',
                    ),
                    'zone-shipping'          => array(
                        'id'           => 'zone-shipping',
                        'module_file'  => MultiVendorX()->plugin_path . 'modules/ZoneShipping/Module.php',
                        'module_class' => 'MultiVendorX\ZoneShipping\Module',
                    ),
                    'country-shipping'       => array(
                        'id'           => 'zone-shipping',
                        'module_file'  => MultiVendorX()->plugin_path . 'modules/CountryShipping/Module.php',
                        'module_class' => 'MultiVendorX\CountryShipping\Module',
                    ),
                    'distance-shipping'      => array(
                        'id'           => 'zone-shipping',
                        'module_file'  => MultiVendorX()->plugin_path . 'modules/DistanceShipping/Module.php',
                        'module_class' => 'MultiVendorX\DistanceShipping\Module',
                    ),
                    'store-shipping'         => array(
                        'id'           => 'store-shipping',
                        'module_file'  => MultiVendorX()->plugin_path . 'modules/StoreShipping/Module.php',
                        'module_class' => 'MultiVendorX\StoreShipping\Module',
                    ),
                    'announcement'           => array(
                        'id'           => 'announcement',
                        'module_file'  => MultiVendorX()->plugin_path . 'modules/Announcement/Module.php',
                        'module_class' => 'MultiVendorX\Announcement\Module',
                    ),
                    'knowledgebase'          => array(
                        'id'           => 'knowledgebase',
                        'module_file'  => MultiVendorX()->plugin_path . 'modules/Knowledgebase/Module.php',
                        'module_class' => 'MultiVendorX\Knowledgebase\Module',
                    ),
                    'privacy'                => array(
                        'id'           => 'privacy',
                        'module_file'  => MultiVendorX()->plugin_path . 'modules/Privacy/Module.php',
                        'module_class' => 'MultiVendorX\Privacy\Module',
                    ),
                    'marketplace-gateway'    => array(
                        'id'           => 'marketplace-gateway',
                        'module_file'  => MultiVendorX()->plugin_path . 'modules/GatewayFee/Module.php',
                        'module_class' => 'MultiVendorX\GatewayFee\Module',
                    ),
                    'min-max'                => array(
                        'id'           => 'min-max',
                        'module_file'  => MultiVendorX()->plugin_path . 'modules/MinMax/Module.php',
                        'module_class' => 'MultiVendorX\MinMax\Module',
                    ),
                    'invoice'                => array(
                        'id'           => 'invoice',
                        'module_file'  => MultiVendorX()->plugin_path . 'modules/Invoice/Module.php',
                        'module_class' => 'MultiVendorX\Invoice\Module',
                    ),
                    'wpml'                => array(
                        'id'           => 'wpml',
                        'module_file'  => MultiVendorX()->plugin_path . 'modules/WPML/Module.php',
                        'module_class' => 'MultiVendorX\WPML\Module',
                        'requires'     => array(
                            'plugin' => array(
                                'sitepress-multilingual-cms/sitepress.php',
                                'wpml-string-translation/plugin.php',
                                'woocommerce-multilingual/wpml-woocommerce.php',
                            ),
                        ),
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
    public function get_active_modules()
    {
        // If active modules are loaded return it.
        if ($this->active_modules) {
            return $this->active_modules;
        }

        $this->active_modules = MultiVendorX()->setting->get_option(Utill::ACTIVE_MODULES_DB_KEY, array());

        return $this->active_modules;
    }

    /**
     * Load all active modules
     *
     * @return void
     */
    public function load_active_modules()
    {
        if (self::$module_activated) {
            return;
        }

        $license_active    = Utill::is_khali_dabba();
        $active_modules    = $this->get_active_modules();
        $all_modules       = $this->get_all_modules();
        $activated_modules = array();

        foreach ($active_modules as $modules_id) {
            if (! isset($all_modules[$modules_id])) {
                continue;
            }

            $module = $all_modules[$modules_id];
            // Check if the module is available.
            if (! $this->is_module_available($module, $license_active)) {
                continue;
            }

            // Store the module as active module.
            if (file_exists($module['module_file'])) {
                $activated_modules[] = $modules_id;
            }

            // Activate the module.
            if (file_exists($module['module_file']) && ! in_array($modules_id, $this->container, true)) {
                require_once $module['module_file'];

                $module_class                   = $module['module_class'];
                try {
                    $this->container[$modules_id] = new $module_class();
                } catch (\Throwable $e) {
                    MultiVendorX()->util->log($e);
                }
                /**
                 * Module activation hook
                 *
                 * @param object $name module object
                 */
                do_action('multivendorx_activated_module_' . $modules_id, $this->container[$modules_id]);
            }
        }

        // store activated module as active module.
        if ($activated_modules !== $active_modules) {
            update_option(Utill::ACTIVE_MODULES_DB_KEY, $activated_modules);
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
    private function is_module_available($module, $license_active)
    {

        if (! empty($module['requires']['plugin'])) {
            $plugins = $module['requires']['plugin'];
            foreach ($plugins as $plugin_slug) {
                if (! Utill::is_active_plugin($plugin_slug)) {
                    return false;
                }
            }
        }

        $is_pro_module = $module['pro_module'] ?? false;

        // if it is free module.
        if (! $is_pro_module) {
            return true;
        }

        // if it is pro module.
        if ($is_pro_module && $license_active) {
            return true;
        }

        return false;
    }

    /**
     * Get list of all module's id
     *
     * @return array
     */
    public function get_all_modules_ids()
    {
        $modules = $this->get_all_modules();
        return array_keys($modules);
    }

    /**
     * Get all available modules.
     *
     * @return array
     */
    public function get_available_modules()
    {
        $modules           = $this->get_all_modules();
        $license_active    = Utill::is_khali_dabba();
        $available_modules = array();

        foreach ($modules as $module_id => $module) {
            // Check if the module is available.
            if (! $this->is_module_available($module, $license_active)) {
                continue;
            }

            if (file_exists($module['module_file'])) {
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
    public function activate_modules($modules)
    {
        $active_modules       = $this->get_active_modules();
        $this->active_modules = array_unique(array_merge($active_modules, $modules));

        update_option(Utill::ACTIVE_MODULES_DB_KEY, $this->active_modules);

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
    public function deactivate_modules($modules)
    {
        $active_modules = $this->get_active_modules();

        foreach ($modules as $module_id) {
            $active_modules = array_diff($active_modules, array($module_id));
        }

        $active_modules = array_values($active_modules);

        $this->active_modules = $active_modules;

        update_option(Utill::ACTIVE_MODULES_DB_KEY, $this->active_modules);

        add_action(
            'shutdown',
            function () use ($modules) {
                foreach ($modules as $module_id) {
                    /**
                     * Module deactivation hook
                     *
                     * @param object $module deactivated module object
                     */
                    do_action('multivendorx_deactivated_module_' . $module_id, $this->container[$module_id]);
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
    public function is_available($module_id)
    {
        $available_modules = $this->get_available_modules();

        return in_array($module_id, $available_modules, true);
    }

    /**
     * Check a module is active or not
     *
     * @param mixed $module_id The id of the module to check.
     * @return bool
     */
    public function is_active($module_id)
    {
        $active_modules = $this->get_active_modules();

        return in_array($module_id, $active_modules, true);
    }
}
