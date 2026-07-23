<?php
/**
 * AccessibilityScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags published content that contains its own `<h1>` tag. Most themes
 * already render the post title as the page's single `<h1>`, so an
 * `<h1>` inside the post body itself produces two competing top-level
 * headings on the same page — a heading-hierarchy conflict that confuses
 * screen-reader navigation (WCAG 2.4.6 territory), independent of
 * ImagesScanner's separate alt-text check.
 *
 * @class       AccessibilityScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class AccessibilityScanner extends AbstractBasicScanner {

    /**
     * How many of the most recently published posts/pages to check per run.
     */
    private const BATCH_SIZE = 50;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'accessibility';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Accessibility', 'vulopilot' );
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
            if ( ! preg_match( '/<h1[\s>]/i', $post->post_content ) ) {
                continue;
            }

            $findings[] = new Finding(
                sprintf(
                    /* translators: %s is the post/page title. */
                    __( 'Content contains its own <h1>: %s', 'vulopilot' ),
                    get_the_title( $post )
                ),
                Severity::LOW,
                $this->get_category(),
                __( 'Most themes already render the title as the page\'s <h1>. A second <h1> in the content creates a conflicting heading hierarchy for screen readers.', 'vulopilot' ),
                'post',
                (string) $post->ID
            );
        }

        return $findings;
    }
}
