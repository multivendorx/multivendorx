<?php
/**
 * InternalLinkingScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags published posts/pages whose content contains zero links back to
 * the site's own domain. Internal links are how link equity and crawl
 * paths flow between pages — content with none is a dead end for both
 * search engine crawlers and readers, independent of BrokenLinksScanner's
 * separate concern (whether existing links, internal or external, still
 * resolve).
 *
 * @class       InternalLinkingScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class InternalLinkingScanner extends AbstractBasicScanner {

    private const BATCH_SIZE = 50;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'internal-linking';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Internal Linking', 'vulopilot' );
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
        $home_host = wp_parse_url( home_url(), PHP_URL_HOST );
        $posts     = get_posts(
            array(
                'post_type'      => array( 'post', 'page' ),
                'post_status'    => 'publish',
                'posts_per_page' => self::BATCH_SIZE,
                'orderby'        => 'modified',
                'order'          => 'DESC',
            )
        );

        foreach ( $posts as $post ) {
            if ( $this->has_internal_link( $post->post_content, $home_host ) ) {
                continue;
            }

            $findings[] = new Finding(
                sprintf(
                    /* translators: %s is the post/page title. */
                    __( 'No internal links found in content: %s', 'vulopilot' ),
                    get_the_title( $post )
                ),
                Severity::LOW,
                $this->get_category(),
                __( 'Linking to other pages on this site helps search engines discover and rank content, and helps readers find related pages.', 'vulopilot' ),
                'post',
                (string) $post->ID
            );
        }

        return $findings;
    }

    /**
     * @param string      $content   Post content to search.
     * @param string|null $home_host The site's own hostname.
     * @return bool
     */
    private function has_internal_link( string $content, ?string $home_host ): bool {
        if ( ! $home_host || ! preg_match_all( '/<a\s[^>]*href=["\']([^"\']+)["\']/i', $content, $matches ) ) {
            return false;
        }

        foreach ( $matches[1] as $href ) {
            if ( '#' === $href[0] || 0 === stripos( $href, 'mailto:' ) || 0 === stripos( $href, 'tel:' ) || 0 === stripos( $href, 'javascript:' ) ) {
                continue;
            }

            // A relative link (no host at all) is implicitly internal.
            $link_host = wp_parse_url( $href, PHP_URL_HOST );

            if ( ! $link_host || $link_host === $home_host ) {
                return true;
            }
        }

        return false;
    }
}
