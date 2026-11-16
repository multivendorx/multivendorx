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
 * Exactly two shared options are used: `multivendorx_engagement_settings` (static
 * configuration) and `multivendorx_engagement_data` (dynamic state) - see CLAUDE spec section 5.
 * Both are site-scoped (not network/multisite-wide): each site decides its own notice/campaign
 * state and telemetry consent independently, matching how `get_option()`/`update_option()`
 * already behave for every other option in this codebase.
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
        $settings = get_option( self::SETTINGS_OPTION, null );

        if ( ! is_array( $settings ) ) {
            $settings = self::default_settings();
            $this->save_settings( $settings );
            return $settings;
        }

        $settings = $this->merge_recursive( self::default_settings(), $settings );

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
        $data = get_option( self::DATA_OPTION, null );

        if ( ! is_array( $data ) ) {
            $data = self::default_data();
            $this->save_data( $data );
            return $data;
        }

        return $this->merge_recursive( self::default_data(), $data );
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
     * Shallow-merge defaults under stored values, one level deep per top-level key, so a
     * missing nested key (e.g. a new `telemetry_consent` field added in a later version)
     * gets its default without discarding other stored values.
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
