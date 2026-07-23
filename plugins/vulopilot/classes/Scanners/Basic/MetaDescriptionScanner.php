<?php
/**
 * MetaDescriptionScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags published posts/pages with no excerpt set. A dedicated
 * meta-description field can't be checked generically — its meta key
 * varies by whichever SEO plugin, if any, is active (SeoScanner's
 * docblock notes the same constraint for why it checks title length
 * instead) — but `post_excerpt` is a native WordPress field every
 * install has, and it's what most themes and SEO plugins fall back to
 * for the meta description when no dedicated field is filled in. An
 * empty excerpt is therefore a real, always-checkable proxy for "no
 * description configured," not a guess at a third-party plugin's schema.
 *
 * @class       MetaDescriptionScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class MetaDescriptionScanner extends AbstractBasicScanner {

    private const BATCH_SIZE = 50;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'meta-description';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Meta Descriptions', 'vulopilot' );
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
        $posts    = get_posts(
            array(
                'post_type'      => array( 'post', 'page' ),
                'post_status'    => 'publish',
                'posts_per_page' => self::BATCH_SIZE,
                'orderby'        => 'modified',
                'order'          => 'DESC',
            )
        );

        foreach ( $posts as $post ) {
            if ( '' !== trim( $post->post_excerpt ) ) {
                continue;
            }

            $findings[] = new Finding(
                sprintf(
                    /* translators: %s is the post/page title. */
                    __( 'No meta description set: %s', 'vulopilot' ),
                    get_the_title( $post )
                ),
                Severity::LOW,
                $this->get_category(),
                __( 'This post has no excerpt set. Most themes and SEO plugins fall back to the excerpt for the search-result description when no dedicated description is configured.', 'vulopilot' ),
                'post',
                (string) $post->ID,
                array( 'missing_description' => true )
            );
        }

        return $findings;
    }
}
