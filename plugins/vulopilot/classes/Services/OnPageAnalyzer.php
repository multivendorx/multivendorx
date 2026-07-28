<?php
/**
 * OnPageAnalyzer class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Services;

use VuloPilot\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Stateless on-page SEO checklist for the post-editor metabox
 * (RestAPI\Controllers\PostSeo::analyze_item()) — modeled on RankMath's
 * "Basic SEO"/"Additional"/"Title Readability" grouping, per the readme
 * rewrite pass's research into rankmath.com/kb/on-page-seo/. Deliberately
 * NOT a Scanners\ScannerRegistry scanner: scanners run against already-
 * SAVED posts on a schedule (Scanners\ScanRunner), but this runs against
 * whatever the editor currently holds — unsaved title/content/excerpt
 * edits included — every time the metabox's fields change. Where a check
 * mirrors an existing scanner's threshold (title length matches
 * Scanners\Basic\SeoScanner/AIActions\Actions\WriteMetaTitleAction; content
 * length matches Scanners\Basic\ThinContentScanner's own setting), the
 * same constant/setting is reused rather than a second, possibly-drifting
 * copy of the number.
 *
 * Each result also says whether vulopilot-pro's "Fix with AI" can resolve
 * it (`fixable` + `action_id`) — only for checks with a real, already-
 * existing AIAction that takes nothing but a post_id (write-meta-title,
 * write-meta-description, improve-readability, add-subheadings). Checks
 * driven by the focus keyword or by simple content structure (links,
 * image alt text) have no matching action — no AIAction here takes a
 * focus keyword as input, and "fix" would mean guessing what the human
 * meant — so those are honestly reported as not fixable rather than
 * wired to an action that doesn't actually address the check.
 *
 * @class       OnPageAnalyzer class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class OnPageAnalyzer {

    /**
     * Matches SeoScanner::TITLE_MIN_LENGTH/TITLE_MAX_LENGTH and
     * WriteMetaTitleAction::MIN_LENGTH/MAX_LENGTH.
     */
    private const TITLE_MIN_LENGTH = 10;
    private const TITLE_MAX_LENGTH = 60;

    /**
     * RankMath's own recommended meta description window; the codebase's
     * only existing description-length ceiling is
     * WriteMetaDescriptionAction::MAX_LENGTH (160), used as this range's
     * upper bound too rather than inventing a second number.
     */
    private const DESCRIPTION_MIN_LENGTH = 120;
    private const DESCRIPTION_MAX_LENGTH = 160;

    /**
     * Words from the start of the content the focus keyword should appear
     * within for the "keyword in first paragraph" check — an editorial
     * analogue of GeoSummaryBlockScanner's `answer_first_words` setting,
     * kept as its own constant since it checks keyword placement, not an
     * AI-summary marker.
     */
    private const FIRST_PARAGRAPH_WORDS = 100;

    /**
     * Runs every check against the editor's current (possibly unsaved)
     * field values.
     *
     * @param array<string, string> $fields Live editor state — 'title', 'content', 'excerpt', 'slug', 'focus_keyword' — not necessarily what's saved in the DB.
     * @return array<int, array<string, mixed>> Each entry shaped like result()'s own return value.
     */
    public function analyze( array $fields ): array {
        $title         = trim( (string) ( $fields['title'] ?? '' ) );
        $content_html  = (string) ( $fields['content'] ?? '' );
        $content_text  = trim( wp_strip_all_tags( $content_html ) );
        $excerpt       = trim( (string) ( $fields['excerpt'] ?? '' ) );
        $slug          = (string) ( $fields['slug'] ?? '' );
        $focus_keyword = trim( (string) ( $fields['focus_keyword'] ?? '' ) );

        $results = array();

        $results[] = $this->check_title_length( $title );
        $results[] = $this->check_description_length( $excerpt );
        $results[] = $this->check_content_length( $content_text );
        $results[] = $this->check_subheadings( $content_html );
        $results[] = $this->check_links( $content_html );
        $results[] = $this->check_image_alt( $content_html );

        if ( '' !== $focus_keyword ) {
            $results[] = $this->check_keyword_in_title( $focus_keyword, $title );
            $results[] = $this->check_keyword_in_description( $focus_keyword, $excerpt );
            $results[] = $this->check_keyword_in_slug( $focus_keyword, $slug );
            $results[] = $this->check_keyword_in_content( $focus_keyword, $content_text );
            $results[] = $this->check_keyword_in_first_paragraph( $focus_keyword, $content_text );
            $results[] = $this->check_keyword_at_title_start( $focus_keyword, $title );
        }

        $results[] = $this->check_title_has_number( $title );

        return $results;
    }

    /**
     * Checks the SEO title's length against SeoScanner/WriteMetaTitleAction's own thresholds.
     *
     * @param string $title Current post title.
     * @return array<string, mixed>
     */
    private function check_title_length( string $title ): array {
        $length = mb_strlen( $title );

        if ( 0 === $length ) {
            return $this->result( 'title_length', 'basic', 'fail', __( 'SEO title is empty.', 'vulopilot' ), 'write-meta-title' );
        }

        if ( $length < self::TITLE_MIN_LENGTH ) {
            return $this->result( 'title_length', 'basic', 'warning', __( 'SEO title is too short — search engines may show more than this.', 'vulopilot' ), 'write-meta-title' );
        }

        if ( $length > self::TITLE_MAX_LENGTH ) {
            return $this->result( 'title_length', 'basic', 'warning', __( 'SEO title may be truncated in search results.', 'vulopilot' ), 'write-meta-title' );
        }

        return $this->result( 'title_length', 'basic', 'pass', __( 'SEO title length is good.', 'vulopilot' ) );
    }

    /**
     * Checks the meta description's length against the RankMath-style recommended window.
     *
     * @param string $excerpt Current post excerpt (this codebase's meta description field, see MetaDescriptionScanner).
     * @return array<string, mixed>
     */
    private function check_description_length( string $excerpt ): array {
        $length = mb_strlen( $excerpt );

        if ( 0 === $length ) {
            return $this->result( 'description_length', 'basic', 'fail', __( 'Meta description is empty.', 'vulopilot' ), 'write-meta-description' );
        }

        if ( $length < self::DESCRIPTION_MIN_LENGTH ) {
            return $this->result( 'description_length', 'basic', 'warning', __( 'Meta description is shorter than the recommended length.', 'vulopilot' ), 'write-meta-description' );
        }

        if ( $length > self::DESCRIPTION_MAX_LENGTH ) {
            return $this->result( 'description_length', 'basic', 'warning', __( 'Meta description may be truncated in search results.', 'vulopilot' ), 'write-meta-description' );
        }

        return $this->result( 'description_length', 'basic', 'pass', __( 'Meta description length is good.', 'vulopilot' ) );
    }

    /**
     * Checks the content's word count against the thin-content threshold setting.
     *
     * @param string $content_text Plain-text content.
     * @return array<string, mixed>
     */
    private function check_content_length( string $content_text ): array {
        $settings  = wp_parse_args( get_option( Utill::VULOPILOT_SETTINGS_KEY, array() ), Utill::VULOPILOT_SETTINGS_DEFAULTS );
        $threshold = absint( $settings['thin_content_word_threshold'] );
        $count     = str_word_count( $content_text );

        if ( $count < $threshold ) {
            return $this->result(
                'content_length',
                'basic',
                'warning',
                sprintf(
                    /* translators: 1: current word count, 2: minimum recommended word count. */
                    __( 'Content is %1$d words — aim for at least %2$d.', 'vulopilot' ),
                    $count,
                    $threshold
                ),
                'improve-readability'
            );
        }

        return $this->result( 'content_length', 'basic', 'pass', __( 'Content length is good.', 'vulopilot' ) );
    }

    /**
     * Checks whether the focus keyword appears in the SEO title.
     *
     * @param string $keyword Focus keyword.
     * @param string $title   Current post title.
     * @return array<string, mixed>
     */
    private function check_keyword_in_title( string $keyword, string $title ): array {
        // Deliberately not wired to 'write-meta-title' — see this class's
        // own docblock: that action takes no focus_keyword input (only
        // post_id, PostSeoFixRest::ACTION_ALLOWLIST), so running it
        // wouldn't reliably fix THIS check at all, just rewrite the title
        // for general length/SEO quality with no guarantee the keyword
        // ends up in it. A prior version of this method incorrectly set
        // action_id here, making "Fix with AI" change the title without
        // actually resolving the keyword-missing problem it was shown
        // next to.
        return $this->contains( $keyword, $title )
            ? $this->result( 'keyword_in_title', 'basic', 'pass', __( 'Focus keyword found in the SEO title.', 'vulopilot' ) )
            : $this->result( 'keyword_in_title', 'basic', 'fail', __( 'Focus keyword is missing from the SEO title.', 'vulopilot' ) );
    }

    /**
     * Checks whether the focus keyword appears in the meta description.
     *
     * @param string $keyword Focus keyword.
     * @param string $excerpt Current meta description.
     * @return array<string, mixed>
     */
    private function check_keyword_in_description( string $keyword, string $excerpt ): array {
        return $this->contains( $keyword, $excerpt )
            ? $this->result( 'keyword_in_description', 'basic', 'pass', __( 'Focus keyword found in the meta description.', 'vulopilot' ) )
            : $this->result( 'keyword_in_description', 'basic', 'fail', __( 'Focus keyword is missing from the meta description.', 'vulopilot' ) );
    }

    /**
     * Checks whether the focus keyword appears in the URL slug.
     *
     * @param string $keyword Focus keyword.
     * @param string $slug    Post slug.
     * @return array<string, mixed>
     */
    private function check_keyword_in_slug( string $keyword, string $slug ): array {
        return $this->contains( $keyword, str_replace( '-', ' ', $slug ) )
            ? $this->result( 'keyword_in_slug', 'basic', 'pass', __( 'Focus keyword found in the URL.', 'vulopilot' ) )
            : $this->result( 'keyword_in_slug', 'basic', 'warning', __( 'Focus keyword is missing from the URL.', 'vulopilot' ) );
    }

    /**
     * Checks whether the focus keyword appears anywhere in the content.
     *
     * @param string $keyword      Focus keyword.
     * @param string $content_text Plain-text content.
     * @return array<string, mixed>
     */
    private function check_keyword_in_content( string $keyword, string $content_text ): array {
        return $this->contains( $keyword, $content_text )
            ? $this->result( 'keyword_in_content', 'basic', 'pass', __( 'Focus keyword found in the content.', 'vulopilot' ) )
            : $this->result( 'keyword_in_content', 'basic', 'fail', __( 'Focus keyword is missing from the content.', 'vulopilot' ) );
    }

    /**
     * Checks whether the focus keyword appears within the opening words of the content.
     *
     * @param string $keyword      Focus keyword.
     * @param string $content_text Plain-text content.
     * @return array<string, mixed>
     */
    private function check_keyword_in_first_paragraph( string $keyword, string $content_text ): array {
        $words = preg_split( '/\s+/', $content_text );
        $lead  = implode( ' ', array_slice( is_array( $words ) ? $words : array(), 0, self::FIRST_PARAGRAPH_WORDS ) );

        return $this->contains( $keyword, $lead )
            ? $this->result( 'keyword_in_first_paragraph', 'additional', 'pass', __( 'Focus keyword appears early in the content.', 'vulopilot' ) )
            : $this->result( 'keyword_in_first_paragraph', 'additional', 'warning', __( 'Focus keyword does not appear in the opening paragraph.', 'vulopilot' ) );
    }

    /**
     * Checks whether the content has any h2-h6 subheadings.
     *
     * @param string $content_html Raw post content (blocks/HTML).
     * @return array<string, mixed>
     */
    private function check_subheadings( string $content_html ): array {
        return (bool) preg_match( '/<h[2-6][\s>]/i', $content_html )
            ? $this->result( 'has_subheadings', 'additional', 'pass', __( 'Content has subheadings.', 'vulopilot' ) )
            : $this->result( 'has_subheadings', 'additional', 'warning', __( 'Content has no subheadings — breaking it up improves readability and scannability.', 'vulopilot' ), 'add-subheadings' );
    }

    /**
     * Checks whether the content contains at least one link.
     *
     * @param string $content_html Raw post content.
     * @return array<string, mixed>
     */
    private function check_links( string $content_html ): array {
        return (bool) preg_match( '/<a\s[^>]*href=/i', $content_html )
            ? $this->result( 'has_links', 'additional', 'pass', __( 'Content contains at least one link.', 'vulopilot' ) )
            : $this->result( 'has_links', 'additional', 'warning', __( 'Content has no links — linking to related content or sources helps both readers and search engines.', 'vulopilot' ) );
    }

    /**
     * Checks whether every image in the content has alt text.
     *
     * @param string $content_html Raw post content.
     * @return array<string, mixed>
     */
    private function check_image_alt( string $content_html ): array {
        if ( ! preg_match_all( '/<img\s[^>]*>/i', $content_html, $images ) ) {
            return $this->result( 'image_alt', 'additional', 'pass', __( 'No images in this content.', 'vulopilot' ) );
        }

        foreach ( $images[0] as $image_tag ) {
            if ( ! preg_match( '/alt=["\'][^"\']+["\']/i', $image_tag ) ) {
                return $this->result( 'image_alt', 'additional', 'fail', __( 'One or more images are missing alt text.', 'vulopilot' ) );
            }
        }

        return $this->result( 'image_alt', 'additional', 'pass', __( 'All images have alt text.', 'vulopilot' ) );
    }

    /**
     * Checks whether the focus keyword appears near the start of the title.
     *
     * @param string $keyword Focus keyword.
     * @param string $title   Current post title.
     * @return array<string, mixed>
     */
    private function check_keyword_at_title_start( string $keyword, string $title ): array {
        $half = mb_substr( $title, 0, (int) ceil( mb_strlen( $title ) / 2 ) );

        return $this->contains( $keyword, $half )
            ? $this->result( 'keyword_at_title_start', 'title_readability', 'pass', __( 'Focus keyword appears near the beginning of the title.', 'vulopilot' ) )
            : $this->result( 'keyword_at_title_start', 'title_readability', 'warning', __( 'Focus keyword appears late in the title — titles rank slightly better with it near the start.', 'vulopilot' ) );
    }

    /**
     * RankMath's own "title contains a number" heuristic — titles with a
     * number (a year, a count, "7 ways to…") measurably get more clicks.
     *
     * @param string $title Current post title.
     * @return array<string, mixed>
     */
    private function check_title_has_number( string $title ): array {
        return (bool) preg_match( '/\d/', $title )
            ? $this->result( 'title_has_number', 'title_readability', 'pass', __( 'Title contains a number.', 'vulopilot' ) )
            : $this->result( 'title_has_number', 'title_readability', 'warning', __( 'Consider adding a number to the title (e.g. a year or a count) — these tend to attract more clicks.', 'vulopilot' ) );
    }

    /**
     * Case-insensitive substring match — every keyword check in this class
     * uses this, not a stricter word-boundary match, since a focus keyword
     * is often a multi-word phrase (RankMath's own behavior).
     *
     * @param string $keyword  Focus keyword.
     * @param string $haystack Text to search within.
     * @return bool
     */
    private function contains( string $keyword, string $haystack ): bool {
        return '' !== $keyword && false !== stripos( $haystack, $keyword );
    }

    /**
     * Builds one checklist entry in the shape every check above returns.
     *
     * @param string      $id        Stable check id the frontend keys UI state on.
     * @param string      $group     'basic'|'additional'|'title_readability'.
     * @param string      $status    'pass'|'warning'|'fail'.
     * @param string      $message   Human-readable explanation.
     * @param string|null $action_id AIActions id that can fix this, if any.
     * @return array<string, mixed>
     */
    private function result( string $id, string $group, string $status, string $message, ?string $action_id = null ): array {
        return array(
            'id'        => $id,
            'group'     => $group,
            'status'    => $status,
            'message'   => $message,
            'fixable'   => null !== $action_id,
            'action_id' => $action_id,
        );
    }
}
