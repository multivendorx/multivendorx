<?php
/**
 * SeoScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags published post/page titles outside the length search engines
 * reliably display in full (roughly 10-60 characters) — a title with no
 * dedicated meta-description field can't be checked generically (that
 * field's meta key varies by whichever SEO plugin, if any, is active),
 * but the title itself is always a plain post field every install has.
 *
 * @class       SeoScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class SeoScanner extends AbstractBasicScanner {

    private const TITLE_MIN_LENGTH = 10;
    private const TITLE_MAX_LENGTH = 60;
    private const BATCH_SIZE       = 50;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'seo';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'SEO', 'vulopilot' );
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
            $title_length = mb_strlen( trim( $post->post_title ) );

            if ( $title_length >= self::TITLE_MIN_LENGTH && $title_length <= self::TITLE_MAX_LENGTH ) {
                continue;
            }

            $findings[] = new Finding(
                $title_length < self::TITLE_MIN_LENGTH
                    ? sprintf(
                        /* translators: %s is the post/page title. */
                        __( 'Title is too short for search results: %s', 'vulopilot' ),
                        get_the_title( $post )
                    )
                    : sprintf(
                        /* translators: %s is the post/page title. */
                        __( 'Title may be truncated in search results: %s', 'vulopilot' ),
                        get_the_title( $post )
                    ),
                Severity::LOW,
                $this->get_category(),
                sprintf(
                    /* translators: 1: minimum recommended title length, 2: maximum recommended title length. */
                    __( 'Search engines display roughly %1$d–%2$d characters of a title before truncating.', 'vulopilot' ),
                    self::TITLE_MIN_LENGTH,
                    self::TITLE_MAX_LENGTH
                ),
                'post',
                (string) $post->ID,
                array( 'title_length' => $title_length )
            );
        }

        return $findings;
    }
}
