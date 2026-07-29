<?php
/**
 * WPDBReviewRepository class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Infrastructure\Database;

use VuloCart\Domain\Review\Review;
use VuloCart\Domain\Review\ReviewRepositoryInterface;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart WPDBReviewRepository.
 *
 * The only class that runs SQL against `vulocart_reviews` — implements
 * Domain\Review\ReviewRepositoryInterface, bound in
 * VuloCart::init_classes().
 *
 * @class       WPDBReviewRepository class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class WPDBReviewRepository implements ReviewRepositoryInterface {

    /**
     * Resolves the fully-prefixed `vulocart_reviews` table name.
     *
     * @return string
     */
    private function get_table() {
        global $wpdb;
        return $wpdb->prefix . 'vulocart_reviews';
    }

    /**
     * Converts a raw `$wpdb` row into a domain Review object.
     *
     * @param array<string, mixed> $row A raw `vulocart_reviews` row.
     * @return Review
     */
    private function hydrate( $row ) {
        return new Review(
            (int) $row['id'],
            (int) $row['offering_id'],
            $row['customer_name'],
            $row['customer_email'],
            (int) $row['rating'],
            $row['title'],
            $row['content'],
            $row['status'],
            $row['created_at'],
            $row['updated_at']
        );
    }

    /**
     * Finds one review by id.
     *
     * @param int $id Review id.
     * @return Review|null Null if no review with this id exists.
     */
    public function find( int $id ): ?Review {
        global $wpdb;

        $row = $wpdb->get_row(
            $wpdb->prepare( "SELECT * FROM {$this->get_table()} WHERE id = %d", $id ), // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            ARRAY_A
        );

        return $row ? $this->hydrate( $row ) : null;
    }

    /**
     * Returns a page of reviews, optionally filtered.
     *
     * @param array{page?: int, per_page?: int, offering_id?: int, status?: string} $args Pagination/filter args.
     * @return array{data: Review[], total: int}
     */
    public function paginate( array $args = array() ): array {
        global $wpdb;

        $table    = $this->get_table();
        $page     = max( 1, (int) ( isset( $args['page'] ) ? $args['page'] : 1 ) );
        $per_page = max( 1, min( 100, (int) ( isset( $args['per_page'] ) ? $args['per_page'] : 20 ) ) );
        $offset   = ( $page - 1 ) * $per_page;

        $where_clauses = array();
        $where_values  = array();

        if ( ! empty( $args['offering_id'] ) ) {
            $where_clauses[] = 'offering_id = %d';
            $where_values[]  = (int) $args['offering_id'];
        }

        if ( ! empty( $args['status'] ) ) {
            $where_clauses[] = 'status = %s';
            $where_values[]  = (string) $args['status'];
        }

        $where_sql = $where_clauses ? 'WHERE ' . implode( ' AND ', $where_clauses ) : '';

        if ( $where_values ) {
            $count_sql = $wpdb->prepare( "SELECT COUNT(*) FROM {$table} {$where_sql}", ...$where_values ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare -- $where_sql's %d/%s count matches $where_values' size at runtime; the sniff can't see that statically.
            // phpcs:ignore WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber -- $where_sql's own placeholder count varies (0, 1, or 2) and is included in $where_values' size at runtime; the sniff only sees the literal string's 2 placeholders statically.
            $rows_sql = $wpdb->prepare(
                "SELECT * FROM {$table} {$where_sql} ORDER BY id DESC LIMIT %d OFFSET %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                ...array_merge( $where_values, array( $per_page, $offset ) )
            );
        } else {
            $count_sql = "SELECT COUNT(*) FROM {$table}"; // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
            $rows_sql  = $wpdb->prepare(
                "SELECT * FROM {$table} ORDER BY id DESC LIMIT %d OFFSET %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $per_page,
                $offset
            );
        }

        $total = (int) $wpdb->get_var( $count_sql ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $rows  = $wpdb->get_results( $rows_sql, ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching

        return array(
            'data'  => array_map( array( $this, 'hydrate' ), $rows ? $rows : array() ),
            'total' => $total,
        );
    }

    /**
     * Persists a new review.
     *
     * @param Review $review A review with $id === null.
     * @return Review The same review, with $id (and timestamps) populated.
     */
    public function insert( Review $review ): Review {
        global $wpdb;

        $wpdb->insert(
            $this->get_table(),
            array(
                'offering_id'    => $review->offering_id,
                'customer_name'  => $review->customer_name,
                'customer_email' => $review->customer_email,
                'rating'         => $review->rating,
                'title'          => $review->title,
                'content'        => $review->content,
                'status'         => $review->status,
            )
        );

        return $this->find( (int) $wpdb->insert_id );
    }

    /**
     * Persists changes to an existing review.
     *
     * @param Review $review A review with a non-null $id.
     * @return Review The same review, with $updated_at refreshed.
     */
    public function update( Review $review ): Review {
        global $wpdb;

        $wpdb->update(
            $this->get_table(),
            array(
                'status' => $review->status,
            ),
            array( 'id' => $review->id )
        );

        return $this->find( $review->id );
    }

    /**
     * Deletes a review.
     *
     * @param int $id Review id.
     * @return bool True if a row was deleted.
     */
    public function delete( int $id ): bool {
        global $wpdb;

        return (bool) $wpdb->delete( $this->get_table(), array( 'id' => $id ) );
    }

    /**
     * Counts reviews in each ReviewStatus bucket.
     *
     * @return array<string, int> Status value => count.
     */
    public function count_by_status(): array {
        global $wpdb;

        $rows = $wpdb->get_results( "SELECT status, COUNT(*) as total FROM {$this->get_table()} GROUP BY status", ARRAY_A ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- static SQL, no user input.

        $counts = array();

        foreach ( $rows ? $rows : array() as $row ) {
            $counts[ $row['status'] ] = (int) $row['total'];
        }

        return $counts;
    }
}
