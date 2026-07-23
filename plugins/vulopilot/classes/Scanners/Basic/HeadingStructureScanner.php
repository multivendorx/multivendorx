<?php
/**
 * HeadingStructureScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags substantial published content (over MIN_WORD_COUNT_TO_CHECK
 * words — a short post genuinely may not need subheadings) with no
 * `<h2>`-`<h6>` tags anywhere in it. A wall of unstructured text is
 * harder for both search engines and readers to parse into topics —
 * distinct from AccessibilityScanner's separate check (a *second*
 * `<h1>` competing with the theme's own title heading).
 *
 * @class       HeadingStructureScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class HeadingStructureScanner extends AbstractBasicScanner {

    private const BATCH_SIZE               = 50;
    private const MIN_WORD_COUNT_TO_CHECK  = 300;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'heading-structure';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Heading Structure', 'vulopilot' );
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
            $word_count = str_word_count( wp_strip_all_tags( $post->post_content ) );

            if ( $word_count < self::MIN_WORD_COUNT_TO_CHECK ) {
                continue;
            }

            if ( preg_match( '/<h[2-6][\s>]/i', $post->post_content ) ) {
                continue;
            }

            $findings[] = new Finding(
                sprintf(
                    /* translators: %s is the post/page title. */
                    __( 'No subheadings found in long content: %s', 'vulopilot' ),
                    get_the_title( $post )
                ),
                Severity::LOW,
                $this->get_category(),
                __( 'Breaking long content into sections with subheadings makes it easier for readers to scan and for search engines to understand its structure.', 'vulopilot' ),
                'post',
                (string) $post->ID,
                array( 'word_count' => $word_count )
            );
        }

        return $findings;
    }
}
