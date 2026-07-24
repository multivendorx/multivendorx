<?php
/**
 * BrokenLinksScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Extracts links from the most recently published posts/pages and checks
 * each one for a non-2xx/3xx HTTP response, flagging ones that appear
 * broken.
 *
 * Bounded on two axes deliberately (posts scanned, and total links
 * checked) — an unbounded crawl of the entire site's content on every
 * scan run is exactly the kind of unbounded operation performance.md
 * warns against, and would make a single scan run take arbitrarily long
 * on a large site. A HEAD request that returns a non-2xx/3xx status is
 * treated as broken; a small number of servers reject HEAD requests
 * outright (405) even though the URL is fine — that's a known,
 * accepted false-positive source for this first-pass check, not
 * something this pass tries to fully eliminate.
 *
 * @class       BrokenLinksScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class BrokenLinksScanner extends AbstractBasicScanner {

    private const POSTS_BATCH_SIZE        = 20;
    private const MAX_LINKS_PER_RUN       = 40;
    private const REQUEST_TIMEOUT_SECONDS = 5;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'broken-links';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Broken Links', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_category(): string {
        return 'links';
    }

    /**
     * @inheritDoc
     */
    public function scan(): array {
        $findings = array();
        $links    = $this->extract_links_from_recent_content();

        foreach ( $links as $url => $post_id ) {
            $status = $this->check_link( $url );

            if ( null === $status ) {
                continue;
            }

            $findings[] = new Finding(
                sprintf(
                    /* translators: %s is the broken URL. */
                    __( 'Broken link: %s', 'vulopilot' ),
                    $url
                ),
                Severity::MEDIUM,
                $this->get_category(),
                sprintf(
                    /* translators: %s is an HTTP status or error description. */
                    __( 'Request failed with: %s', 'vulopilot' ),
                    $status
                ),
                'post',
                (string) $post_id,
                array( 'url' => $url )
            );
        }

        return $findings;
    }

    /**
     * Pulls every http(s) link out of the most recently published
     * content, deduped, capped at MAX_LINKS_PER_RUN.
     *
     * @return array<string, int> URL => the post ID it was found in.
     */
    private function extract_links_from_recent_content(): array {
        $posts = get_posts(
            array(
                'post_type'      => array( 'post', 'page' ),
                'post_status'    => 'publish',
                'posts_per_page' => self::POSTS_BATCH_SIZE,
                'orderby'        => 'modified',
                'order'          => 'DESC',
            )
        );

        $links = array();

        foreach ( $posts as $post ) {
            if ( count( $links ) >= self::MAX_LINKS_PER_RUN ) {
                break;
            }

            if ( ! preg_match_all( '/<a\s[^>]*href=["\']([^"\']+)["\']/i', $post->post_content, $matches ) ) {
                continue;
            }

            foreach ( $matches[1] as $url ) {
                if ( count( $links ) >= self::MAX_LINKS_PER_RUN ) {
                    break;
                }

                if ( 0 !== strpos( $url, 'http://' ) && 0 !== strpos( $url, 'https://' ) ) {
                    continue;
                }

                if ( ! isset( $links[ $url ] ) ) {
                    $links[ $url ] = $post->ID;
                }
            }
        }

        return $links;
    }

    /**
     * @param string $url URL to check.
     * @return string|null A description of the failure, or null if the link looks fine.
     */
    private function check_link( string $url ): ?string {
        $response = wp_remote_head(
            $url,
            array(
                'timeout'     => self::REQUEST_TIMEOUT_SECONDS,
                'redirection' => 5,
                'sslverify'   => false,
            )
        );

        if ( is_wp_error( $response ) ) {
            return $response->get_error_message();
        }

        $status_code = wp_remote_retrieve_response_code( $response );

        if ( $status_code >= 200 && $status_code < 400 ) {
            return null;
        }

        return sprintf( 'HTTP %d', $status_code );
    }
}
