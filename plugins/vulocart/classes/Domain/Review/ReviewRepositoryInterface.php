<?php
/**
 * ReviewRepositoryInterface class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Domain\Review;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart ReviewRepositoryInterface.
 *
 * The contract Application\ReviewService depends on.
 *
 * @class       ReviewRepositoryInterface interface
 * @version     1.0.0
 * @author      MultiVendorX
 */
interface ReviewRepositoryInterface {

    /**
     * Finds one review by id.
     *
     * @param int $id Review id.
     * @return Review|null Null if no review with this id exists.
     */
    public function find( int $id ): ?Review;

    /**
     * Returns a page of reviews, optionally filtered.
     *
     * @param array{page?: int, per_page?: int, offering_id?: int, status?: string} $args Pagination/filter args.
     * @return array{data: Review[], total: int}
     */
    public function paginate( array $args = array() ): array;

    /**
     * Persists a new review.
     *
     * @param Review $review A review with $id === null.
     * @return Review The same review, with $id (and timestamps) populated.
     */
    public function insert( Review $review ): Review;

    /**
     * Persists changes to an existing review.
     *
     * @param Review $review A review with a non-null $id.
     * @return Review The same review, with $updated_at refreshed.
     */
    public function update( Review $review ): Review;

    /**
     * Deletes a review.
     *
     * @param int $id Review id.
     * @return bool True if a row was deleted.
     */
    public function delete( int $id ): bool;

    /**
     * Counts reviews in each ReviewStatus bucket — backs the admin
     * grid's "saved view" tabs, same pattern Order's own
     * `count_by_fulfillment_status()` establishes.
     *
     * @return array<string, int> Status value => count.
     */
    public function count_by_status(): array;
}
