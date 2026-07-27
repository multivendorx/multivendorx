<?php
/**
 * ThinContentScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;


use VuloPilot\ValueObjects\Finding;
use VuloPilot\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags published posts/pages under a minimum word count. "Thin content"
 * (too little substance for a search engine to meaningfully rank) is a
 * well-established SEO concept; a plain word count is a real, cheap,
 * always-computable proxy for it — not a claim about content quality,
 * which no scanner here can judge (scanners never use AI, SCANNERS.md).
 *
 * @class       ThinContentScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ThinContentScanner extends AbstractBasicScanner {

    private const BATCH_SIZE = 50;

    /**
     * Fallback only — the real threshold is Scanning → SEO's
     * `thin_content_word_threshold` setting (Utill::VULOPILOT_SETTINGS_DEFAULTS
     * defaults it to this same value), read fresh in scan() so a site
     * owner's saved threshold takes effect without a code change.
     */
    private const DEFAULT_MIN_WORD_COUNT = 300;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'thin-content';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Thin Content', 'vulopilot' );
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
        $settings  = wp_parse_args( get_option( \VuloPilot\Utill::VULOPILOT_SETTINGS_KEY, array() ), \VuloPilot\Utill::VULOPILOT_SETTINGS_DEFAULTS );
        $min_words = absint( $settings['thin_content_word_threshold'] ?? self::DEFAULT_MIN_WORD_COUNT ) ?: self::DEFAULT_MIN_WORD_COUNT;

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

            if ( $word_count >= $min_words ) {
                continue;
            }

            $findings[] = new Finding(
                sprintf(
                    /* translators: 1: post/page title, 2: word count. */
                    __( 'Thin content (%2$d words): %1$s', 'vulopilot' ),
                    get_the_title( $post ),
                    $word_count
                ),
                Severity::LOW,
                $this->get_category(),
                sprintf(
                    /* translators: %d is the recommended minimum word count. */
                    __( 'Search engines generally rank substantive content higher. Consider expanding this to at least %d words.', 'vulopilot' ),
                    $min_words
                ),
                'post',
                (string) $post->ID,
                array( 'word_count' => $word_count )
            );
        }

        return $findings;
    }
}
