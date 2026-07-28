<?php
/**
 * CanonicalUrlManager class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Services;

use VuloPilot\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Scanning → SEO's "Add canonical URL tags" toggle — the mechanical fix
 * behind Scanners\Basic\CanonicalUrlScanner's finding. That scanner's own
 * docblock explains WordPress core already outputs a canonical tag by
 * default (`rel_canonical()` on `wp_head`); its absence almost always
 * means a theme has removed `wp_head()` entirely or a caching/
 * optimization plugin is stripping head tags — something this plugin
 * can't safely repair in the theme/other-plugin's own code. What it CAN
 * safely do is add its own, independent canonical tag as a backup, so the
 * page has one regardless of what stripped core's. Same "wrap a safety
 * net around a WP-core behavior" shape as SitemapManager/RobotsTxtManager,
 * just for a tag instead of a route.
 *
 * Defaults OFF (Utill::VULOPILOT_SETTINGS_DEFAULTS) since most sites don't
 * need this — core's own tag already covers them; this exists specifically
 * for the site that doesn't, discoverable either from Settings → SEO
 * directly or via vulopilot-pro's OneClickFix "Fix" action on this
 * scanner's finding.
 *
 * Self-registers its own hook in the constructor (php-wordpress.md) and
 * is constructed unconditionally in VuloPilot::init_classes() — the
 * `canonical_url_enabled` setting gates OUTPUT, not construction, same as
 * SitemapManager/RobotsTxtManager.
 *
 * @class       CanonicalUrlManager class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class CanonicalUrlManager {

    /**
     * CanonicalUrlManager constructor.
     */
    public function __construct() {
        add_action( 'wp_head', array( $this, 'maybe_output_canonical' ), 5 );

        // The post-editor metabox's Advanced tab canonical override — this
        // filters WP core's OWN wp_get_canonical_url()/rel_canonical()
        // output directly, so a per-post override always takes effect
        // regardless of the canonical_url_enabled setting above (that
        // setting only gates this class's OWN safety-net tag for sites
        // where core's canonical is missing entirely; an explicit per-post
        // override is a deliberate human action, not something that should
        // silently no-op because a separate, unrelated toggle is off).
        add_filter( 'get_canonical_url', array( $this, 'maybe_override_canonical' ), 10, 2 );
    }

    /**
     * Substitutes the post-editor metabox's per-post canonical override, if one is set.
     *
     * @param string   $canonical_url Core's own resolved canonical URL.
     * @param \WP_Post $post          The post being resolved.
     * @return string
     */
    public function maybe_override_canonical( string $canonical_url, \WP_Post $post ): string {
        $override = get_post_meta( $post->ID, PostSeoMetaFields::META_KEYS['canonical_url'], true );

        return $override ? $override : $canonical_url;
    }

    /**
     * Outputs the safety-net canonical tag on wp_head, if the setting is enabled.
     *
     * @return void
     */
    public function maybe_output_canonical(): void {
        $settings = wp_parse_args( get_option( Utill::VULOPILOT_SETTINGS_KEY, array() ), Utill::VULOPILOT_SETTINGS_DEFAULTS );

        if ( empty( $settings['canonical_url_enabled'] ) ) {
            return;
        }

        $url = $this->get_canonical_url();

        if ( ! $url ) {
            return;
        }

        echo '<link rel="canonical" href="' . esc_url( $url ) . '" />' . "\n";
    }

    /**
     * Resolves the canonical URL for the current singular/front-page request.
     *
     * @return string|null
     */
    private function get_canonical_url(): ?string {
        if ( is_singular() ) {
            $permalink = get_permalink( get_queried_object_id() );
            return $permalink ? $permalink : null;
        }

        if ( is_front_page() || is_home() ) {
            return home_url( '/' );
        }

        return null; // Archives/search/404 — core's own rel_canonical() already skips these too.
    }
}
