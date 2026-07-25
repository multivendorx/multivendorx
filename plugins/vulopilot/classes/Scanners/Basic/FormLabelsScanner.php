<?php
/**
 * FormLabelsScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilot\ValueObjects\Finding;
use VuloPilot\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags <input>/<textarea>/<select> elements in published content with no
 * associated label — no <label for="...">, aria-label, or
 * aria-labelledby. Screen readers can't announce what an unlabeled field
 * is for. Same bounded recent-posts batch and regex-over-post_content
 * approach as AccessibilityScanner, just checking a different pattern.
 *
 * @class       FormLabelsScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class FormLabelsScanner extends AbstractBasicScanner {

    /**
     * How many of the most recently published posts/pages to check per run.
     */
    private const BATCH_SIZE = 50;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'form-labels';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Form Labels', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_category(): string {
        return 'accessibility';
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
            $unlabeled_count = $this->count_unlabeled_fields( $post->post_content );

            if ( 0 === $unlabeled_count ) {
                continue;
            }

            $findings[] = new Finding(
                sprintf(
                    /* translators: 1: number of unlabeled form fields, 2: the post/page title. */
                    __( '%1$d unlabeled form field(s): %2$s', 'vulopilot' ),
                    $unlabeled_count,
                    get_the_title( $post )
                ),
                Severity::MEDIUM,
                $this->get_category(),
                __( 'Every <input>/<textarea>/<select> needs an associated <label>, aria-label, or aria-labelledby so screen reader users know what it is for.', 'vulopilot' ),
                'post',
                (string) $post->ID,
                array( 'unlabeled_count' => $unlabeled_count )
            );
        }

        return $findings;
    }

    /**
     * @param string $content Raw post_content HTML.
     * @return int Number of form fields with no detectable label.
     */
    private function count_unlabeled_fields( string $content ): int {
        if ( ! preg_match_all( '/<(input|textarea|select)\b([^>]*)>/i', $content, $matches, PREG_SET_ORDER ) ) {
            return 0;
        }

        $unlabeled = 0;

        foreach ( $matches as $match ) {
            $tag        = strtolower( $match[1] );
            $attributes = $match[2];

            if ( 'input' === $tag && preg_match( '/type=["\'](hidden|submit|button|image)["\']/i', $attributes ) ) {
                continue;
            }

            if ( preg_match( '/\baria-label(ledby)?=["\'][^"\']+["\']/i', $attributes ) ) {
                continue;
            }

            if ( preg_match( '/\bid=["\']([^"\']+)["\']/i', $attributes, $id_match )
                && preg_match( '/<label\b[^>]*\bfor=["\']' . preg_quote( $id_match[1], '/' ) . '["\']/i', $content ) ) {
                continue;
            }

            ++$unlabeled;
        }

        return $unlabeled;
    }
}
