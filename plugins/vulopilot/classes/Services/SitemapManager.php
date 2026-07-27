<?php
/**
 * SitemapManager class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Services;

use VuloPilot\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Scanning → SEO's "Generate XML sitemap" / "Ping search engines on
 * update" toggles. Not a from-scratch sitemap generator — WordPress core
 * has generated a real one natively at /wp-sitemap.xml since 5.5
 * (Scanners\Basic\SitemapScanner already checks for exactly this URL);
 * `sitemap_enabled` is a real toggle over core's own `wp_sitemaps_enabled`
 * filter, turning that native feature off when unchecked rather than
 * building a second, competing sitemap implementation.
 *
 * `sitemap_ping_search_engines` pings Bing's still-supported sitemap ping
 * endpoint whenever published content is saved. Google deprecated its own
 * sitemap ping endpoint in June 2023 (Search Console / robots.txt
 * discovery are the only supported paths now) — this deliberately does
 * NOT call it: silently hitting a dead endpoint and reporting success
 * would be dishonest, the same posture CrawlerTrafficLogger's own
 * Google-Extended correction already takes for a similar Google-specific
 * gap.
 *
 * Self-registers its own hooks in the constructor (php-wordpress.md) and
 * is constructed unconditionally in VuloPilot::init_classes() — both
 * hooks read their own setting before doing anything.
 *
 * @class       SitemapManager class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class SitemapManager {

    private const BING_PING_URL = 'https://www.bing.com/ping';

    /**
     * SitemapManager constructor.
     */
    public function __construct() {
        add_filter( 'wp_sitemaps_enabled', array( $this, 'filter_sitemaps_enabled' ) );
        add_action( 'save_post', array( $this, 'maybe_ping_search_engines' ), 10, 2 );
    }

    /**
     * @param bool $enabled Core's own current wp_sitemaps_enabled value.
     * @return bool
     */
    public function filter_sitemaps_enabled( $enabled ) {
        $settings = wp_parse_args( get_option( Utill::VULOPILOT_SETTINGS_KEY, array() ), Utill::VULOPILOT_SETTINGS_DEFAULTS );

        if ( empty( $settings['sitemap_enabled'] ) ) {
            return false;
        }

        return $enabled;
    }

    /**
     * @param int      $post_id Post being saved.
     * @param \WP_Post $post    The post object.
     * @return void
     */
    public function maybe_ping_search_engines( $post_id, $post ): void {
        if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
            return;
        }

        if ( 'publish' !== $post->post_status ) {
            return;
        }

        $settings = wp_parse_args( get_option( Utill::VULOPILOT_SETTINGS_KEY, array() ), Utill::VULOPILOT_SETTINGS_DEFAULTS );

        if ( empty( $settings['sitemap_enabled'] ) || empty( $settings['sitemap_ping_search_engines'] ) ) {
            return;
        }

        wp_remote_get(
            self::BING_PING_URL . '?sitemap=' . rawurlencode( home_url( '/wp-sitemap.xml' ) ),
            array(
                'timeout'  => 5,
                'blocking' => false,
            )
        );
    }
}
