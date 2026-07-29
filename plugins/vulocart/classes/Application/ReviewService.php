<?php
/**
 * ReviewService class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Application;

use VuloCart\Domain\Review\Review;
use VuloCart\Domain\Review\ReviewRepositoryInterface;
use VuloCart\Domain\Review\ReviewStatus;
use VuloCart\Events\EventDispatcher;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart ReviewService.
 *
 * Where Review business logic lives — backs
 * `classes/RestAPI/Controllers/Reviews.php`.
 *
 * @class       ReviewService class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ReviewService {

    /**
     * The bound repository implementation.
     *
     * @var ReviewRepositoryInterface Resolved via ServiceContainer, not `new`d directly.
     */
    private $repository;

    /**
     * Used to check that a review's offering_id references a real offering.
     *
     * @var OfferingService
     */
    private $offering_service;

    /**
     * Broadcasts what happened after each mutation.
     *
     * @var EventDispatcher
     */
    private $events;

    /**
     * ReviewService constructor.
     *
     * @param ReviewRepositoryInterface $repository    Resolved via ServiceContainer, not `new`d directly.
     * @param OfferingService           $offering_service  Used to check that a review's offering_id references a real offering.
     * @param EventDispatcher           $events         Broadcasts what happened; never decides what should happen.
     */
    public function __construct( ReviewRepositoryInterface $repository, OfferingService $offering_service, EventDispatcher $events ) {
        $this->repository       = $repository;
        $this->offering_service = $offering_service;
        $this->events           = $events;
    }

    /**
     * Fetches one review by id.
     *
     * @param int $id Review id.
     * @return Review|null
     */
    public function get_review( $id ) {
        return $this->repository->find( $id );
    }

    /**
     * Returns a page of reviews, optionally filtered.
     *
     * @param array{page?: int, per_page?: int, offering_id?: int, status?: string} $args Pagination/filter args, already sanitized by the caller.
     * @return array{data: Review[], total: int}
     */
    public function list_reviews( $args = array() ) {
        return $this->repository->paginate( $args );
    }

    /**
     * Counts reviews in each ReviewStatus bucket.
     *
     * @return array<string, int>
     */
    public function count_reviews_by_status() {
        return $this->repository->count_by_status();
    }

    /**
     * Submits a new review — public, no account required (class docblock).
     * Always created as `ReviewStatus::PENDING` regardless of what the
     * caller sends, so a review only ever appears on the storefront after
     * an admin explicitly approves it (moderate_review()).
     *
     * @param array{offering_id: int, customer_name?: string, customer_email?: string, rating: int, title?: string, content?: string} $data Already-sanitized input.
     * @return Review
     * @throws \InvalidArgumentException If $data['offering_id'] doesn't reference a real offering, or $data['rating'] isn't 1-5.
     */
    public function submit_review( array $data ): Review {
        if ( ! $this->offering_service->get_offering( $data['offering_id'] ) ) {
            throw new \InvalidArgumentException( 'Unknown offering.' );
        }

        $rating = (int) $data['rating'];

        if ( $rating < 1 || $rating > 5 ) {
            throw new \InvalidArgumentException( 'Rating must be between 1 and 5.' );
        }

        $review = new Review(
            null,
            $data['offering_id'],
            isset( $data['customer_name'] ) ? $data['customer_name'] : null,
            isset( $data['customer_email'] ) ? $data['customer_email'] : null,
            $rating,
            isset( $data['title'] ) ? $data['title'] : null,
            isset( $data['content'] ) ? $data['content'] : null,
            ReviewStatus::PENDING
        );

        $review = $this->repository->insert( $review );

        $this->events->dispatch( 'review_submitted', array( 'review' => $review ) );

        return $review;
    }

    /**
     * Moderates a review (approve/reject) and broadcasts
     * `review_moderated`.
     *
     * @param int    $id     Review id.
     * @param string $status One of ReviewStatus's constants.
     * @return Review|null Null if no review with this id exists.
     * @throws \InvalidArgumentException If $status isn't a known ReviewStatus.
     */
    public function moderate_review( $id, string $status ) {
        if ( ! in_array( $status, ReviewStatus::all(), true ) ) {
            throw new \InvalidArgumentException( 'Unknown review status.' );
        }

        $review = $this->repository->find( $id );

        if ( ! $review ) {
            return null;
        }

        $review->status = $status;
        $review         = $this->repository->update( $review );

        $this->events->dispatch( 'review_moderated', array( 'review' => $review ) );

        return $review;
    }

    /**
     * Deletes a review.
     *
     * @param int $id Review id.
     * @return bool True if a review was found and deleted.
     */
    public function delete_review( $id ): bool {
        return $this->repository->delete( $id );
    }
}
