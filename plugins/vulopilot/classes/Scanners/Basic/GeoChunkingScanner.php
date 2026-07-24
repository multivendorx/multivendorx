<?php
/**
 * GeoChunkingScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags published posts/pages containing a single paragraph over
 * MAX_PARAGRAPH_WORD_COUNT words. AI answer engines retrieve and quote
 * content in small chunks (often paragraph-sized) — a wall-of-text
 * paragraph is harder to cleanly extract a single relevant chunk from
 * than the same information broken into several shorter paragraphs, even
 * though the total content length is identical. Distinct from
 * HeadingStructureScanner's separate SEO check (whether *any* subheading
 * exists at all) — this checks paragraph-level granularity within
 * whatever sections already exist.
 *
 * @class       GeoChunkingScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class GeoChunkingScanner extends AbstractBasicScanner {

    private const BATCH_SIZE               = 50;
    private const MAX_PARAGRAPH_WORD_COUNT = 150;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'geo-chunking';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Chunking', 'vulopilot' );
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
            $longest_paragraph_words = $this->longest_paragraph_word_count( $post->post_content );

            if ( $longest_paragraph_words <= self::MAX_PARAGRAPH_WORD_COUNT ) {
                continue;
            }

            $findings[] = new Finding(
                sprintf(
                    /* translators: %s is the post/page title. */
                    __( 'Contains an overly long paragraph: %s', 'vulopilot' ),
                    get_the_title( $post )
                ),
                Severity::LOW,
                $this->get_category(),
                __( 'AI answer engines retrieve and quote content in small chunks. A very long paragraph is harder to cleanly extract than the same information split into shorter ones.', 'vulopilot' ),
                'post',
                (string) $post->ID,
                array( 'longest_paragraph_words' => $longest_paragraph_words )
            );
        }

        return $findings;
    }

    /**
     * @param string $content Post content (raw HTML).
     * @return int Word count of the longest single <p> block, or of the whole content if there are no <p> tags at all.
     */
    private function longest_paragraph_word_count( string $content ): int {
        if ( ! preg_match_all( '#<p[^>]*>(.*?)</p>#is', $content, $matches ) ) {
            return str_word_count( wp_strip_all_tags( $content ) );
        }

        $longest = 0;

        foreach ( $matches[1] as $paragraph ) {
            $longest = max( $longest, str_word_count( wp_strip_all_tags( $paragraph ) ) );
        }

        return $longest;
    }
}
