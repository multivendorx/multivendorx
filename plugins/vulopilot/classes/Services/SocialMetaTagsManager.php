<?php
/**
 * SocialMetaTagsManager class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Services;

use VuloPilot\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Scanning → SEO's "Add Open Graph & Twitter Card tags" toggle — the
 * mechanical fix behind Scanners\Basic\OpenGraphScanner's and
 * TwitterCardScanner's findings, both of which only check the homepage
 * for og:title/og:description/og:image and twitter:card respectively.
 * This outputs those on every singular post/page too (not just the
 * homepage the scanners check), since the same missing-preview problem
 * affects every page a site owner might share, not only the front page.
 *
 * Defaults OFF (Utill::VULOPILOT_SETTINGS_DEFAULTS) since many sites
 * already have a theme or another plugin outputting these tags — this
 * exists specifically for the site that doesn't, discoverable either from
 * Settings → SEO directly or via vulopilot-pro's OneClickFix "Fix" action
 * on either scanner's finding. Doesn't attempt to detect an existing
 * og:/twitter: tag before adding its own (unlike RobotsTxtManager's
 * `Sitemap:` dedupe, checking rendered HTML from inside a `wp_head`
 * callback isn't practical without output buffering) — a site owner
 * turning this on is expected to have confirmed via the scanner that
 * nothing is outputting these today.
 *
 * Self-registers its own hook in the constructor (php-wordpress.md) and
 * is constructed unconditionally in VuloPilot::init_classes() — the
 * `social_meta_tags_enabled` setting gates OUTPUT, not construction, same
 * as SitemapManager/RobotsTxtManager/CanonicalUrlManager.
 *
 * @class       SocialMetaTagsManager class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class SocialMetaTagsManager {

    /**
     * SocialMetaTagsManager constructor.
     */
    public function __construct() {
        add_action( 'wp_head', array( $this, 'maybe_output_tags' ), 5 );
    }

    /**
     * Outputs Open Graph/Twitter Card tags on wp_head, if enabled or overridden for this post.
     *
     * @return void
     */
    public function maybe_output_tags(): void {
        $settings = wp_parse_args( get_option( Utill::VULOPILOT_SETTINGS_KEY, array() ), Utill::VULOPILOT_SETTINGS_DEFAULTS );
        $post_id  = is_singular() ? get_queried_object_id() : 0;

        // A per-post override from the post-editor metabox's Social tab
        // is a deliberate, explicit action for THAT post — it takes effect
        // even when the sitewide toggle is off, same posture
        // CanonicalUrlManager::maybe_override_canonical() already takes
        // for its own per-post override.
        if ( empty( $settings['social_meta_tags_enabled'] ) && ! ( $post_id && $this->has_post_override( $post_id ) ) ) {
            return;
        }

        $tags = $this->build_tags();

        if ( ! $tags ) {
            return;
        }

        foreach ( $tags as $property => $content ) {
            if ( '' === $content ) {
                continue;
            }

            $attribute = ( 0 === strpos( $property, 'twitter:' ) ) ? 'name' : 'property';

            echo '<meta ' . esc_attr( $attribute ) . '="' . esc_attr( $property ) . '" content="' . esc_attr( $content ) . '" />' . "\n";
        }
    }

    /**
     * Checks whether the post-editor metabox's Social tab has any override set for this post.
     *
     * @param int $post_id Post id.
     * @return bool
     */
    private function has_post_override( int $post_id ): bool {
        return (bool) get_post_meta( $post_id, PostSeoMetaFields::META_KEYS['social_title'], true )
            || (bool) get_post_meta( $post_id, PostSeoMetaFields::META_KEYS['social_description'], true )
            || (bool) get_post_meta( $post_id, PostSeoMetaFields::META_KEYS['social_image_id'], true );
    }

    /**
     * Builds the property/name => content map to output, or null off singular/home.
     *
     * @return array<string, string>|null
     */
    private function build_tags(): ?array {
        if ( is_singular() ) {
            $post_id           = get_queried_object_id();
            $override_image_id = absint( get_post_meta( $post_id, PostSeoMetaFields::META_KEYS['social_image_id'], true ) );
            $override_title    = get_post_meta( $post_id, PostSeoMetaFields::META_KEYS['social_title'], true );
            $override_excerpt  = get_post_meta( $post_id, PostSeoMetaFields::META_KEYS['social_description'], true );

            $title   = '' !== $override_title ? $override_title : get_the_title( $post_id );
            $excerpt = '' !== $override_excerpt ? $override_excerpt : get_the_excerpt( $post_id );
            $image   = $override_image_id ? wp_get_attachment_image_url( $override_image_id, 'large' ) : get_the_post_thumbnail_url( $post_id, 'large' );
        } elseif ( is_front_page() || is_home() ) {
            $title   = get_bloginfo( 'name' );
            $excerpt = get_bloginfo( 'description' );
            $image   = get_site_icon_url( 512 );
        } else {
            return null; // Archives/search/404 — same scope CanonicalUrlManager limits itself to.
        }

        $tags = array(
            'og:title'            => $title,
            'og:description'      => $excerpt,
            'twitter:card'        => $image ? 'summary_large_image' : 'summary',
            'twitter:title'       => $title,
            'twitter:description' => $excerpt,
        );

        if ( $image ) {
            $tags['og:image']      = $image;
            $tags['twitter:image'] = $image;
        }

        return $tags;
    }
}
