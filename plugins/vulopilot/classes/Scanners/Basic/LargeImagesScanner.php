<?php
/**
 * LargeImagesScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilot\ValueObjects\Finding;
use VuloPilot\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags oversized image attachments — distinct from ImagesScanner, which
 * only checks for missing alt text and never inspects file size. Same
 * bounded media-library query shape as ImagesScanner, just checking
 * filesize() instead of the alt-text meta key.
 *
 * @class       LargeImagesScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class LargeImagesScanner extends AbstractBasicScanner {

    /**
     * How many of the most recent image attachments to check per run.
     */
    private const BATCH_SIZE = 100;

    /**
     * File size, in bytes, above which an image is worth flagging.
     */
    private const SIZE_THRESHOLD_BYTES = 512000; // 500KB.

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'large-images';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Large Images', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_category(): string {
        return 'performance';
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
                'fields'         => 'ids',
            )
        );

        foreach ( $attachments as $attachment_id ) {
            $file_path = get_attached_file( $attachment_id );

            if ( ! $file_path || ! file_exists( $file_path ) ) {
                continue;
            }

            $file_size = filesize( $file_path );

            if ( $file_size <= self::SIZE_THRESHOLD_BYTES ) {
                continue;
            }

            $findings[] = new Finding(
                sprintf(
                    /* translators: 1: image filename, 2: formatted file size, e.g. "1.4 MB". */
                    __( 'Large image: %1$s (%2$s)', 'vulopilot' ),
                    wp_basename( $file_path ),
                    size_format( $file_size )
                ),
                Severity::LOW,
                $this->get_category(),
                __( 'Large images slow down page loads, especially on mobile connections — consider compressing or resizing.', 'vulopilot' ),
                'attachment',
                (string) $attachment_id,
                array( 'file_size_bytes' => $file_size )
            );
        }

        return $findings;
    }
}
