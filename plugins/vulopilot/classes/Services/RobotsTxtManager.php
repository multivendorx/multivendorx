<?php
/**
 * RobotsTxtManager class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Services;

use VuloPilot\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Scanning → SEO's "Auto-generate robots.txt" toggle. Not a from-scratch
 * robots.txt file generator — WordPress core already serves a virtual
 * robots.txt (`do_robots()`, filterable via `robots_txt`) at every
 * install's /robots.txt, which is exactly the URL
 * Scanners\Basic\RobotsTxtScanner already checks. When this setting is
 * on, appends a `Sitemap:` line pointing at core's own sitemap (see
 * SitemapManager) so crawlers that read robots.txt for a sitemap
 * reference find one — the one thing WordPress core's own virtual
 * robots.txt never adds by itself.
 *
 * Self-registers its own hook in the constructor (php-wordpress.md) and
 * is constructed unconditionally in VuloPilot::init_classes().
 *
 * @class       RobotsTxtManager class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class RobotsTxtManager {

    /**
     * RobotsTxtManager constructor.
     */
    public function __construct() {
        add_filter( 'robots_txt', array( $this, 'maybe_append_sitemap_line' ), 20, 2 );
    }

    /**
     * @param string $output       The robots.txt content built so far.
     * @param bool   $is_public    Whether the site is set to be publicly indexed.
     * @return string
     */
    public function maybe_append_sitemap_line( $output, $is_public ) {
        $settings = wp_parse_args( get_option( Utill::VULOPILOT_SETTINGS_KEY, array() ), Utill::VULOPILOT_SETTINGS_DEFAULTS );

        if ( empty( $settings['robots_auto_generate'] ) || ! $is_public ) {
            return $output;
        }

        if ( false !== strpos( $output, 'Sitemap:' ) ) {
            return $output; // Another plugin/theme already added one — don't duplicate.
        }

        return rtrim( $output ) . "\nSitemap: " . home_url( '/wp-sitemap.xml' ) . "\n";
    }
}
