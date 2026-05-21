<?php
/**
 * MooWoodle Setting file.
 *
 * @package MooWoodle
 */

namespace MooWoodle;

use MooWoodle\Util;

defined( 'ABSPATH' ) || exit;

/**
 * Handle MooWoodle Global setting.
 * Use WordPress Option table to manage setting.
 * Cache The settings for a session.
 */
class Setting {
    /**
     * Container store global setting.
     *
     * @var array
     */
    private $settings_cache = array();

    /**
     * Stores all registered setting keys.
     *
     * @var array
     */
    private $registered_setting_keys = array();

    /**
     * Construct function for load setting.
     */
    public function __construct() {

        $this->initialize_settings();
    }

    /**
     * Load all setting from option table.
     *
     * @param bool $force_reload true or false.
     * @return void
     */
    private function initialize_settings( $force_reload = true ) {

        // If settings are loaded previously and not force to load.
        if ( ! $force_reload && $this->settings_cache ) {
            return;
        }

        $setting_keys = $this->get_registered_setting_keys();

        // Get all setting from option table.
        foreach ( $setting_keys as $key ) {
            $this->settings_cache[ $key ] = get_option( $key, array() );
        }
    }

    /**
     * Get all register setting key.
     *
     * @return array
     */
    private function get_registered_setting_keys() {

        // Settings key are available.
        if ( ! empty( $this->registered_setting_keys ) ) {
            return $this->registered_setting_keys;
        }

        /**
         * Filter for register settings key's.
         *
         * @var array setting keys
         */
        $this->registered_setting_keys = apply_filters(
            'moowoodle_register_settings_keys',
            array_values( Util::MOOWOODLE_SETTINGS )
        );

        return $this->registered_setting_keys;
    }

    /**
     * Get the setting that was previously added.
     * If setting is not present it return default value
     *
     * @param string $key setting key.
     * @param mixed  $default_value setting value.
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

        update_option( $option_key, $setting );
    }

    /**
     * Get the option.
     *
     * @param string $key settings name.
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
     * If the key does not exist, it will be created.
     *
     * @param string $key settings name.
     * @param mixed  $value settings value.
     * @return void
     */
    public function update_option( $key, $value ) {

        if ( in_array( $key, $this->get_registered_setting_keys(), true ) ) {

            // Update the container.
            $this->settings_cache[ $key ] = $value;
        }

        update_option( $key, $value );
    }

    /**
     * Find option key from setting container.
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

        return '';
    }
}
