<?php
/**
 * DuplicateContentScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags published posts/pages that share an identical title with at
 * least one other post. Detecting true duplicate/near-duplicate *content*
 * would need a text-similarity algorithm run pairwise across every post —
 * an unbounded, expensive operation performance.md warns against for a
 * scanner that runs on demand. An exact title match is a real, cheap,
 * SQL-aggregable signal that two pages are likely competing for the same
 * search intent (a common, genuine cause of search engines picking the
 * "wrong" one, or splitting ranking signal between both) — an honest,
 * bounded proxy, not a full duplicate-content detector.
 *
 * @class       DuplicateContentScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class DuplicateContentScanner extends AbstractBasicScanner {

    /**
     * How many of the most recently modified posts/pages to consider.
     * Deliberately larger than the other content scanners' 50-post batch —
     * a duplicate pair could span an older post, and this query is a
     * single indexed aggregate, not a per-post loop, so a larger window
     * doesn't cost N times more (performance.md: prefer one query over a
     * loop for a list operation).
     */
    private const BATCH_SIZE = 200;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'duplicate-content';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Duplicate Content', 'vulopilot' );
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
        global $wpdb;

        $findings = array();

        $duplicate_titles = $wpdb->get_col(
            $wpdb->prepare(
                "SELECT post_title FROM (
                    SELECT post_title FROM {$wpdb->posts}
                    WHERE post_status = 'publish' AND post_type IN ('post', 'page')
                    ORDER BY post_modified DESC
                    LIMIT %d
                ) AS recent_posts
                GROUP BY post_title
                HAVING COUNT(*) > 1", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                self::BATCH_SIZE
            )
        );

        foreach ( (array) $duplicate_titles as $title ) {
            if ( '' === trim( (string) $title ) ) {
                continue; // An empty/untitled draft-like title isn't a meaningful duplicate.
            }

            $matching_ids = $wpdb->get_col(
                $wpdb->prepare(
                    "SELECT ID FROM {$wpdb->posts} WHERE post_title = %s AND post_status = 'publish' AND post_type IN ('post', 'page')", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                    $title
                )
            );

            $findings[] = new Finding(
                sprintf(
                    /* translators: 1: the duplicated title, 2: number of posts sharing it. */
                    __( 'Duplicate title used by %2$d posts: %1$s', 'vulopilot' ),
                    $title,
                    count( $matching_ids )
                ),
                Severity::MEDIUM,
                $this->get_category(),
                __( 'Multiple published posts share this exact title, which can split search ranking signal between them or confuse which one search engines show.', 'vulopilot' ),
                'post',
                implode( ',', $matching_ids ),
                array( 'post_ids' => array_map( 'intval', $matching_ids ) )
            );
        }

        return $findings;
    }
}
