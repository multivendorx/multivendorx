<?php
/**
 * Setting class file
 *
 * @package CatalogX
 */

namespace CatalogX;

use CatalogX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * CatalogX Setting API class
 *
 * @class       Setting class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Setting {
    /**
     * Container store global setting
     *
     * @var array
     */
    private $settings_cache = array();

    /**
     * Contain global key of all settings
     *
     * @var array
     */
    private $registered_setting_keys = array();

    /**
     * Construct function for load setting
     */
    public function __construct() {

        // Load all settings.
        $this->initialize_settings();
    }

    /**
     * Load all setting from option table
     *
     * @param bool $force_reload Whether to force reload the settings even if already loaded.
     * @return void
     */
    private function initialize_settings( $force_reload = true ) {

        // If settings are loaded previously and not force_reload to load.
        if ( ! $force_reload && $this->settings_cache ) {
            return;
        }

        $setting_keys = $this->get_registered_setting_keys();

        foreach ( $setting_keys as $key ) {
            $this->settings_cache[ $key ] = get_option( $key, array() );
        }
    }

    /**
     * Get all register setting key
     *
     * @return array
     */
    private function get_registered_setting_keys() {

        // Settings key are available.
        if ( ! empty( $this->registered_setting_keys ) ) {
            return $this->registered_setting_keys;
        }

        /**
         * Filter for register settings key's
         *
         * @var array setting keys
         */
        $this->registered_setting_keys = apply_filters(
            'catalogx_register_settings_keys',
            array_merge(
                array(
                    'catalogx_extra_settings',
                ),
                array_values( Utill::CATALOGX_SETTINGS )
            )
        );

        return $this->registered_setting_keys;
    }

    /**
     * Get the setting that was previously added.
     * If setting is not present it return defalult value
     *
     * @param string $key setting key.
     * @param string $default_value setting value.
     * @param mixed  $option_key option table's key.
     * @return mixed
     */
    public function get_setting( $key, $default_value = '', $option_key = null ) {

        // If option key is not provided.
        if ( ! $option_key ) {
            $option_key = $this->get_option_key( $key );
        }

        $setting = $this->settings_cache[ $option_key ] ?? array();

        return $setting[ $key ] ?? $default_value;
    }

    /**
     * Update the setting that was already added.
     *
     * @param string $key setting key.
     * @param string $value setting value.
     * @param string $option_key option table's key.
     * @return void
     */
    public function update_setting( $key, $value, $option_key = null ) {

        // If option key is not provided.
        if ( ! $option_key ) {
            $option_key = $this->get_option_key( $key );
        }

        // Get the setting array from setting settings container.
        $setting = $this->settings_cache[ $option_key ] ?? array();

        // Update setting in setting container.
        $setting[ $key ]                     = $value;
        $this->settings_cache[ $option_key ] = $setting;

        // Update the setting in database.
        update_option( $option_key, $setting );
    }

    /**
     * Get the option
     *
     * @param string $key The key for the setting to retrieve.
     * @return mixed value
     */
    public function get_option( $key ) {

        // Check key exist in register settings keys.
        if ( in_array( $key, $this->get_registered_setting_keys(), true ) ) {
            return $this->settings_cache[ $key ];
        }

        return get_option( $key, array() );
    }

    /**
     * Update the value in option table.
     * If key doesn't exist it create it.
     *
     * @param string $key The option key to update.
     * @param mixed  $value The value to set for the given key.
     * @return void
     */
    public function update_option( $key, $value ) {

        // Check key exist in register settings keys.
        if ( in_array( $key, $this->get_registered_setting_keys(), true ) ) {

            // Update the container.
            $this->settings_cache[ $key ] = $value;
        }

        // Update the option.
        update_option( $key, $value );
    }

    /**
     * Find option key from setting container
     *
     * @param mixed $key setting key.
     * @return string
     */
    private function get_option_key( $key ) {
        foreach ( $this->settings_cache as $option_key => $setting ) {
            // Key exist in a particular setting.
            if ( is_array( $setting ) && array_key_exists( $key, $setting ) ) {
                return $option_key;
            }
        }

        return Utill::CATALOGX_SETTINGS['extra'];
    }
}
