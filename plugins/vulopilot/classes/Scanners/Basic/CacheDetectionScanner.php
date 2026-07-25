<?php
/**
 * CacheDetectionScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilot\ValueObjects\Finding;
use VuloPilot\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags a site with no detectable caching layer — checks a short list of
 * well-known caching plugins (the same is_plugin_active() approach
 * PluginsScanner/ThemesScanner already use for plugin detection), and
 * falls back to inspecting the homepage's own response headers for a
 * server-level caching signal (Cache-Control/ETag) before concluding
 * nothing is caching the site.
 *
 * @class       CacheDetectionScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class CacheDetectionScanner extends AbstractBasicScanner {

    /**
     * Main plugin files of well-known caching plugins.
     */
    private const KNOWN_CACHING_PLUGINS = array(
        'wp-rocket/wp-rocket.php',
        'w3-total-cache/w3-total-cache.php',
        'wp-super-cache/wp-cache.php',
        'litespeed-cache/litespeed-cache.php',
        'cache-enabler/cache-enabler.php',
        'wp-fastest-cache/wpFastestCache.php',
    );

    private const REQUEST_TIMEOUT_SECONDS = 8;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'cache-detection';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Cache Issues', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_category(): string {
        return 'performance';
    }

    /**
     * @inheritDoc
     */
    public function scan(): array {
        if ( $this->has_known_caching_plugin() || $this->homepage_sends_caching_headers() ) {
            return array();
        }

        return array(
            new Finding(
                __( 'No caching detected', 'vulopilot' ),
                Severity::LOW,
                $this->get_category(),
                __( 'No known caching plugin is active and the homepage response has no caching headers. A caching layer significantly reduces load time and server load.', 'vulopilot' ),
                'url',
                home_url( '/' )
            ),
        );
    }

    /**
     * @return bool
     */
    private function has_known_caching_plugin(): bool {
        if ( ! function_exists( 'is_plugin_active' ) ) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        foreach ( self::KNOWN_CACHING_PLUGINS as $plugin_file ) {
            if ( is_plugin_active( $plugin_file ) ) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return bool
     */
    private function homepage_sends_caching_headers(): bool {
        $response = wp_remote_get(
            home_url( '/' ),
            array(
                'timeout'   => self::REQUEST_TIMEOUT_SECONDS,
                'sslverify' => false,
            )
        );

        if ( is_wp_error( $response ) ) {
            // Can't tell either way — don't flag on an inconclusive request.
            return true;
        }

        $cache_control = wp_remote_retrieve_header( $response, 'cache-control' );
        $etag          = wp_remote_retrieve_header( $response, 'etag' );

        return ! empty( $cache_control ) || ! empty( $etag );
    }
}
