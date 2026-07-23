<?php
/**
 * GeoCitationOpportunityScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags published posts/pages that contain a statistic-shaped claim
 * (a percentage, or a number next to a word like "study"/"survey"/
 * "report"/"research") but link out to zero external sources anywhere in
 * the content. AI answer engines and careful readers both look for a
 * citation next to a factual claim — a real, bounded regex-based
 * heuristic for "this reads like it's citing something but isn't," not a
 * claim to verify whether any specific fact is actually true.
 *
 * @class       GeoCitationOpportunityScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class GeoCitationOpportunityScanner extends AbstractBasicScanner {

    private const BATCH_SIZE = 50;

    /**
     * Matches a percentage (e.g. "42%") or a number immediately followed
     * by one of a handful of words that typically introduce a
     * fact/statistic worth sourcing.
     */
    private const CLAIM_PATTERN = '/\d+\s*%|\d+\s+(?:percent|studies|study|survey|surveys|report|reports|research)/i';

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'geo-citation-opportunities';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Citation Opportunities', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_category(): string {
        return 'geo';
    }

    /**
     * @inheritDoc
     */
    public function scan(): array {
        $findings  = array();
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
            $plain_text = wp_strip_all_tags( $post->post_content );

            if ( ! preg_match( self::CLAIM_PATTERN, $plain_text ) ) {
                continue;
            }

            if ( $this->has_external_link( $post->post_content, $home_host ) ) {
                continue;
            }

            $findings[] = new Finding(
                sprintf(
                    /* translators: %s is the post/page title. */
                    __( 'Statistic mentioned with no source link: %s', 'vulopilot' ),
                    get_the_title( $post )
                ),
                Severity::LOW,
                $this->get_category(),
                __( 'This content mentions a statistic or study but links to no external source. AI answer engines favor content that backs up factual claims with citations.', 'vulopilot' ),
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
    private function has_external_link( string $content, ?string $home_host ): bool {
        if ( ! preg_match_all( '/<a\s[^>]*href=["\']([^"\']+)["\']/i', $content, $matches ) ) {
            return false;
        }

        foreach ( $matches[1] as $href ) {
            $link_host = wp_parse_url( $href, PHP_URL_HOST );

            if ( $link_host && $link_host !== $home_host ) {
                return true;
            }
        }

        return false;
    }
}
