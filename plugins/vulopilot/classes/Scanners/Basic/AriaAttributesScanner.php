<?php
/**
 * AriaAttributesScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilot\ValueObjects\Finding;
use VuloPilot\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags interactive-looking elements — a <div> or <span> with an onclick
 * handler — that carry no `role` attribute. Screen readers only announce
 * these as interactive when a role (e.g. "button") is present; a bare
 * onclick on a non-interactive element is invisible to assistive tech. A
 * narrow, concrete check rather than attempting general ARIA validation,
 * matching this codebase's one-thing-per-scanner convention
 * (AccessibilityScanner's own docblock makes the same choice).
 *
 * @class       AriaAttributesScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class AriaAttributesScanner extends AbstractBasicScanner {

    /**
     * How many of the most recently published posts/pages to check per run.
     */
    private const BATCH_SIZE = 50;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'aria-attributes';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'ARIA Attributes', 'vulopilot' );
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
            $count = $this->count_missing_roles( $post->post_content );

            if ( 0 === $count ) {
                continue;
            }

            $findings[] = new Finding(
                sprintf(
                    /* translators: 1: number of elements missing a role attribute, 2: the post/page title. */
                    __( '%1$d interactive element(s) missing a role attribute: %2$s', 'vulopilot' ),
                    $count,
                    get_the_title( $post )
                ),
                Severity::LOW,
                $this->get_category(),
                __( 'A <div> or <span> with a click handler but no role attribute is invisible to screen readers as an interactive element.', 'vulopilot' ),
                'post',
                (string) $post->ID,
                array( 'missing_role_count' => $count )
            );
        }

        return $findings;
    }

    /**
     * @param string $content Raw post_content HTML.
     * @return int Number of clickable <div>/<span> elements with no role attribute.
     */
    private function count_missing_roles( string $content ): int {
        if ( ! preg_match_all( '/<(div|span)\b([^>]*\bonclick=[^>]*)>/i', $content, $matches, PREG_SET_ORDER ) ) {
            return 0;
        }

        $missing = 0;

        foreach ( $matches as $match ) {
            if ( preg_match( '/\brole=["\'][^"\']+["\']/i', $match[2] ) ) {
                continue;
            }

            ++$missing;
        }

        return $missing;
    }
}
