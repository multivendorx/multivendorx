<?php
/**
 * SeoImagesScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags published posts/pages with no featured image set. This is
 * distinct from ImagesScanner's separate, sitewide check (does an
 * *existing* attachment have alt text) — a post can pass that check
 * perfectly and still have no featured image at all, which is what
 * social platforms and search result rich snippets fall back to
 * (og:image, Twitter Card image) when a post is shared or displayed with
 * a thumbnail.
 *
 * @class       SeoImagesScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class SeoImagesScanner extends AbstractBasicScanner {

    private const BATCH_SIZE = 50;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'seo-images';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Featured Images', 'vulopilot' );
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
                'fields'         => 'ids',
            )
        );

        foreach ( $posts as $post_id ) {
            if ( has_post_thumbnail( $post_id ) ) {
                continue;
            }

            $findings[] = new Finding(
                sprintf(
                    /* translators: %s is the post/page title. */
                    __( 'No featured image set: %s', 'vulopilot' ),
                    get_the_title( $post_id )
                ),
                Severity::LOW,
                $this->get_category(),
                __( 'A featured image is used as the preview image when this page is shared on social media or shown in some search result formats.', 'vulopilot' ),
                'post',
                (string) $post_id,
                array( 'missing_featured_image' => true )
            );
        }

        return $findings;
    }
}
