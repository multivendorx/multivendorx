<?php
/**
 * PostRobotsMetaManager class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Services;

defined( 'ABSPATH' ) || exit;

/**
 * The post-editor metabox's Advanced tab noindex/nofollow toggles
 * (Services\PostSeoMetaFields::META_KEYS) — filters WordPress core's own
 * `wp_robots` output (the `<meta name="robots">` tag core has generated
 * since WP 5.7) rather than echoing a second, competing robots tag. No
 * settings gate: like Services\SchemaJsonLdRenderer, there's nothing to
 * output until a post actually has one of these postmeta flags set, so
 * construction is unconditional and the filter is a no-op until then.
 *
 * @class       PostRobotsMetaManager class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class PostRobotsMetaManager {

    /**
     * PostRobotsMetaManager constructor.
     */
    public function __construct() {
        add_filter( 'wp_robots', array( $this, 'maybe_filter_robots' ) );
    }

    /**
     * Adds noindex/nofollow to core's robots directives when this post's metabox flags are set.
     *
     * @param array<string, bool> $robots Core's own robots directives array.
     * @return array<string, bool>
     */
    public function maybe_filter_robots( array $robots ): array {
        if ( ! is_singular() ) {
            return $robots;
        }

        $post_id = get_queried_object_id();

        if ( get_post_meta( $post_id, PostSeoMetaFields::META_KEYS['robots_noindex'], true ) ) {
            $robots['noindex'] = true;
        }

        if ( get_post_meta( $post_id, PostSeoMetaFields::META_KEYS['robots_nofollow'], true ) ) {
            $robots['nofollow'] = true;
        }

        return $robots;
    }
}
