<?php
/**
 * ImagesScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags image attachments with no alt text set. Bounded to the most
 * recent batch of attachments (per performance.md — an unbounded
 * media-library scan on every run doesn't scale on large sites) rather
 * than the whole media library every time.
 *
 * @class       ImagesScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ImagesScanner extends AbstractBasicScanner {

    /**
     * How many of the most recent image attachments to check per run.
     */
    private const BATCH_SIZE = 100;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'images';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Images', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_category(): string {
        return 'images';
    }

    /**
     * @inheritDoc
     */
    public function scan(): array {
        $findings    = array();
        $attachments = get_posts(
            array(
                'post_type'      => 'attachment',
                'post_mime_type' => 'image',
                'post_status'    => 'inherit',
                'posts_per_page' => self::BATCH_SIZE,
                'orderby'        => 'date',
                'order'          => 'DESC',
                'meta_query'     => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
                    array(
                        'key'     => '_wp_attachment_image_alt',
                        'compare' => 'NOT EXISTS',
                    ),
                ),
                'fields'         => 'ids',
            )
        );

        foreach ( $attachments as $attachment_id ) {
            $findings[] = new Finding(
                sprintf(
                    /* translators: %s is the image filename. */
                    __( 'Image missing alt text: %s', 'vulopilot' ),
                    wp_basename( get_attached_file( $attachment_id ) )
                ),
                Severity::LOW,
                $this->get_category(),
                __( 'Alt text helps search engines and screen reader users understand what an image shows.', 'vulopilot' ),
                'attachment',
                (string) $attachment_id
            );
        }

        return $findings;
    }
}
