<?php
/**
 * Storage class file.
 *
 * @package MultivendorX\Engagement
 */

namespace MultivendorX\Engagement;

defined( 'ABSPATH' ) || exit;

/**
 * Centralizes all WordPress Options API access for the Engagement Framework.
 *
 * Two shared, site-scoped options are used: `multivendorx_engagement_settings`
 * (static configuration) and `multivendorx_engagement_data` (dynamic state).
 *
 * @package MultivendorX\Engagement
 */
class Storage {

    const SETTINGS_OPTION = 'multivendorx_engagement_settings';
    const DATA_OPTION     = 'multivendorx_engagement_data';

    const SCHEMA_VERSION = '1.0.0';

    /**
     * Default shape for `multivendorx_engagement_settings`.
     *
     * @return array
     */
    private static function default_settings() {
        return array(
            'version'           => self::SCHEMA_VERSION,
            'features'          => array(
                'notices'   => true,
                'campaigns' => true,
                'events'    => true,
                'telemetry' => true,
            ),
            'frequency'         => array(
                'max_impressions' => 2,
                'cooldown_days'   => 7,
            ),
            'telemetry_consent' => array(
                'status'          => 'undecided',
                'consent_version' => 1,
                'accepted_at'     => null,
                'declined_at'     => null,
                'dismissed_at'    => null,
                'show_again_at'   => null,
                'revoked_at'      => null,
            ),
        );
    }

    /**
     * Default shape for `multivendorx_engagement_data`.
     *
     * @return array
     */
    private static function default_data() {
        return array(
            'notices'     => array(),
            'campaigns'   => array(),
            'event_queue' => array(),
        );
    }

    /**
     * Read `multivendorx_engagement_settings`, initializing and persisting defaults if missing
     * or if the stored schema version is older than the current one.
     *
     * @return array
     */
    public function get_settings() {
        $settings = $this->read_option( self::SETTINGS_OPTION, self::default_settings(), array( $this, 'save_settings' ) );

        if ( empty( $settings['version'] ) || version_compare( $settings['version'], self::SCHEMA_VERSION, '<' ) ) {
            $settings['version'] = self::SCHEMA_VERSION;
            $this->save_settings( $settings );
        }

        return $settings;
    }

    /**
     * Persist `multivendorx_engagement_settings`. Not needed on every page load, so autoload off.
     *
     * @param array $settings Full settings array.
     * @return bool
     */
    public function save_settings( array $settings ) {
        return update_option( self::SETTINGS_OPTION, $settings, false );
    }

    /**
     * Read `multivendorx_engagement_data`, initializing defaults if missing.
     *
     * @return array
     */
    public function get_data() {
        return $this->read_option( self::DATA_OPTION, self::default_data(), array( $this, 'save_data' ) );
    }

    /**
     * Persist `multivendorx_engagement_data`.
     *
     * @param array $data Full data array.
     * @return bool
     */
    public function save_data( array $data ) {
        return update_option( self::DATA_OPTION, $data, false );
    }

    /**
     * Shared read path for both options - default+persist if missing, else merge onto defaults.
     *
     * @param string   $option_key Option name.
     * @param array    $defaults   Default shape for this option.
     * @param callable $save       Callback to persist the defaults when the option is missing.
     * @return array
     */
    private function read_option( $option_key, array $defaults, callable $save ) {
        $stored = get_option( $option_key, null );

        if ( ! is_array( $stored ) ) {
            $save( $defaults );
            return $defaults;
        }

        return $this->merge_recursive( $defaults, $stored );
    }

    /**
     * Recursively fill in missing keys from defaults without discarding stored values.
     *
     * @param array $defaults Default array.
     * @param array $stored   Stored array.
     * @return array
     */
    private function merge_recursive( array $defaults, array $stored ) {
        foreach ( $defaults as $key => $value ) {
            if ( ! array_key_exists( $key, $stored ) ) {
                $stored[ $key ] = $value;
            } elseif ( is_array( $value ) && is_array( $stored[ $key ] ) && ! isset( $value[0] ) ) {
                $stored[ $key ] = $this->merge_recursive( $value, $stored[ $key ] );
            }
        }
        return $stored;
    }
}
