<?php
/**
 * CanonicalUrlScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags pages whose rendered HTML has no `<link rel="canonical">` tag.
 * WordPress core itself outputs one by default (`rel_canonical()` on
 * `wp_head`) — its absence almost always means a theme has removed
 * `wp_head()` entirely or a caching/optimization plugin is stripping
 * head tags, either of which is worth surfacing since it silently
 * affects every page on the site, not just the ones sampled here.
 *
 * Checked via real HTTP requests (same approach as SchemaScanner/
 * RestApiScanner — this is the only way to know what actually reaches a
 * visitor's browser, not just what a template function would output in
 * isolation), bounded to the homepage plus a handful of recent posts
 * rather than crawling the whole site (performance.md).
 *
 * @class       CanonicalUrlScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class CanonicalUrlScanner extends AbstractBasicScanner {

    private const POSTS_BATCH_SIZE        = 9;
    private const REQUEST_TIMEOUT_SECONDS = 8;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'canonical-url';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Canonical URLs', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_category(): string {
        return 'seo';
    }

    /**
     * @inheritDoc
     */
    public function scan(): array {
        $findings = array();

        foreach ( $this->get_urls_to_check() as $url ) {
            $body = $this->fetch_body( $url );

            if ( null === $body || false !== stripos( $body, 'rel="canonical"' ) || false !== stripos( $body, "rel='canonical'" ) ) {
                continue;
            }

            $findings[] = new Finding(
                sprintf(
                    /* translators: %s is the URL missing a canonical tag. */
                    __( 'No canonical URL tag found: %s', 'vulopilot' ),
                    $url
                ),
                Severity::LOW,
                $this->get_category(),
                __( 'A missing canonical tag can lead search engines to treat identical content reachable at multiple URLs as duplicates.', 'vulopilot' ),
                'url',
                $url
            );
        }

        return $findings;
    }

    /**
     * @return string[] Homepage plus the most recently published posts/pages, capped.
     */
    private function get_urls_to_check(): array {
        $urls  = array( home_url( '/' ) );
        $posts = get_posts(
            array(
                'post_type'      => array( 'post', 'page' ),
                'post_status'    => 'publish',
                'posts_per_page' => self::POSTS_BATCH_SIZE,
                'orderby'        => 'modified',
                'order'          => 'DESC',
                'fields'         => 'ids',
            )
        );

        foreach ( $posts as $post_id ) {
            $urls[] = get_permalink( $post_id );
        }

        return $urls;
    }

    /**
     * @param string $url URL to fetch.
     * @return string|null Response body, or null if the request failed.
     */
    private function fetch_body( string $url ): ?string {
        $response = wp_remote_get(
            $url,
            array(
                'timeout'   => self::REQUEST_TIMEOUT_SECONDS,
                'sslverify' => false,
            )
        );

        if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {
            return null;
        }

        return wp_remote_retrieve_body( $response );
    }
}
