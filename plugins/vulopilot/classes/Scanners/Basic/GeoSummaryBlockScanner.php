<?php
/**
 * GeoSummaryBlockScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;


use VuloPilot\ValueObjects\Finding;
use VuloPilot\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags long-form published posts/pages with no upfront summary. AI
 * answer engines favor content they can extract a direct answer from
 * quickly — a well-known GEO practice is a short summary or "key
 * takeaways" list near the top, rather than making a reader (or crawler)
 * work through the full article first. Checked as a real, bounded text
 * search within the first SUMMARY_WINDOW_CHARS characters for either a
 * common summary marker phrase or an early bullet/numbered list, not a
 * semantic judgment of whether the summary is any good.
 *
 * @class       GeoSummaryBlockScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class GeoSummaryBlockScanner extends AbstractBasicScanner {

    private const BATCH_SIZE              = 50;
    private const MIN_WORD_COUNT_TO_CHECK = 300;

    /**
     * Rough average English word length (letters + trailing space) used
     * to convert Scanning → GEO's `answer_first_words` setting (a word
     * count, matching how the field is actually labeled/described to an
     * admin) into the character-based window has_early_summary() scans —
     * a real character count is needed since summary markers/list tags
     * are found via substring/regex, not word-by-word parsing.
     */
    private const CHARS_PER_WORD = 6;

    private const SUMMARY_MARKERS = array( 'tl;dr', 'tldr', 'key takeaways', 'in summary', 'quick summary', 'summary:' );

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'geo-summary-block';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Summary Blocks', 'vulopilot' );
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
        $settings = wp_parse_args( get_option( \VuloPilot\Utill::VULOPILOT_SETTINGS_KEY, array() ), \VuloPilot\Utill::VULOPILOT_SETTINGS_DEFAULTS );

        // GEO has no whole-category kill switch (unlike SEO/Accessibility/
        // WooCommerce) — this is this one scanner's own on/off switch,
        // letting an admin turn off just this check while every other GEO
        // check keeps running.
        if ( empty( $settings['flag_missing_ai_summary'] ) ) {
            return array();
        }

        $window_chars = absint( $settings['answer_first_words'] ?? 200 ) * self::CHARS_PER_WORD;

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

            if ( $word_count < self::MIN_WORD_COUNT_TO_CHECK || $this->has_early_summary( $post->post_content, $window_chars ) ) {
                continue;
            }

            $findings[] = new Finding(
                sprintf(
                    /* translators: %s is the post/page title. */
                    __( 'No upfront summary found: %s', 'vulopilot' ),
                    get_the_title( $post )
                ),
                Severity::LOW,
                $this->get_category(),
                __( 'AI answer engines favor content with a short summary or key-takeaways list near the top, rather than requiring the full article to be read first.', 'vulopilot' ),
                'post',
                (string) $post->ID,
                array(
                    'word_count'            => $word_count,
                    'missing_summary_block' => true,
                )
            );
        }

        return $findings;
    }

    /**
     * @param string $content      Post content (raw HTML).
     * @param int    $window_chars How many characters from the top count as "early".
     * @return bool
     */
    private function has_early_summary( string $content, int $window_chars ): bool {
        $window = mb_substr( $content, 0, $window_chars );

        if ( preg_match( '/<(ul|ol)[\s>]/i', $window ) ) {
            return true;
        }

        $plain_window = mb_strtolower( wp_strip_all_tags( $window ) );

        foreach ( self::SUMMARY_MARKERS as $marker ) {
            if ( false !== strpos( $plain_window, $marker ) ) {
                return true;
            }
        }

        return false;
    }
}
