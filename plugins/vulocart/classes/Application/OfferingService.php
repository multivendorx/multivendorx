<?php
/**
 * OfferingService class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Application;

use VuloCart\Domain\Offering\Offering;
use VuloCart\Domain\Offering\OfferingRepositoryInterface;
use VuloCart\Events\EventDispatcher;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart OfferingService.
 *
 * Where Offering business logic actually lives — per the vision's "business
 * logic must never exist inside React components" and "must never exist
 * inside WordPress hooks", RestAPI\Controllers\Offerings calls only this
 * class, and this class is the only thing that talks to
 * OfferingRepositoryInterface. Any future GraphQL resolver or MCP tool
 * (`create_offering()`, per the vision's MCP tool list) calls this same
 * service too, rather than re-implementing creation/listing logic against
 * the repository directly.
 *
 * @class       OfferingService class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class OfferingService {

    /**
     * The bound repository implementation.
     *
     * @var OfferingRepositoryInterface Resolved via ServiceContainer, not `new`d directly.
     */
    private $repository;

    /**
     * Broadcasts what happened after each mutation.
     *
     * @var EventDispatcher Broadcasts what happened; never decides what should happen.
     */
    private $events;

    /**
     * OfferingService constructor.
     *
     * @param OfferingRepositoryInterface $repository Resolved via ServiceContainer, not `new`d directly.
     * @param EventDispatcher             $events     Broadcasts what happened; never decides what should happen.
     */
    public function __construct( OfferingRepositoryInterface $repository, EventDispatcher $events ) {
        $this->repository = $repository;
        $this->events     = $events;
    }

    /**
     * Fetches one offering by id.
     *
     * @param int $id Offering id.
     * @return Offering|null
     */
    public function get_offering( $id ) {
        return $this->repository->find( $id );
    }

    /**
     * Returns a page of offerings, optionally filtered.
     *
     * @param array{page?: int, per_page?: int, type?: string, status?: string} $args Pagination/filter args, already sanitized by the caller.
     * @return array{data: Offering[], total: int}
     */
    public function list_offerings( $args = array() ) {
        return $this->repository->paginate( $args );
    }

    /**
     * Counts offerings in each OfferingType bucket.
     *
     * @return array<string, int>
     */
    public function count_offerings_by_type() {
        return $this->repository->count_by_type();
    }

    /**
     * Creates a new offering and broadcasts `offering_created`.
     *
     * @param array{type: string, title: string, sku?: string, status?: string, price?: float, currency?: string, meta?: array<string, mixed>} $data Already-sanitized input.
     * @return Offering
     */
    public function create_offering( $data ) {
        $offering = new Offering(
            null,
            $data['type'],
            $data['title'],
            sanitize_title( $data['title'] ),
            isset( $data['sku'] ) ? $data['sku'] : null,
            isset( $data['status'] ) ? $data['status'] : 'draft',
            isset( $data['price'] ) ? (float) $data['price'] : null,
            isset( $data['currency'] ) ? $data['currency'] : null,
            isset( $data['meta'] ) ? $data['meta'] : array()
        );

        $offering = $this->repository->insert( $offering );

        $this->events->dispatch( 'offering_created', array( 'offering' => $offering ) );

        return $offering;
    }

    /**
     * Updates an existing offering and broadcasts `offering_updated`.
     *
     * @param int                                                                                                                  $id   Offering id.
     * @param array{type?: string, title?: string, status?: string, price?: float, currency?: string, meta?: array<string, mixed>} $data Already-sanitized partial update.
     * @return Offering|null Null if no offering with this id exists.
     */
    public function update_offering( $id, $data ) {
        $offering = $this->repository->find( $id );

        if ( ! $offering ) {
            return null;
        }

        $offering->type     = isset( $data['type'] ) ? $data['type'] : $offering->type;
        $offering->title    = isset( $data['title'] ) ? $data['title'] : $offering->title;
        $offering->status   = isset( $data['status'] ) ? $data['status'] : $offering->status;
        $offering->price    = array_key_exists( 'price', $data ) ? (float) $data['price'] : $offering->price;
        $offering->currency = isset( $data['currency'] ) ? $data['currency'] : $offering->currency;
        $offering->meta     = isset( $data['meta'] ) ? $data['meta'] : $offering->meta;

        $offering = $this->repository->update( $offering );

        $this->events->dispatch( 'offering_updated', array( 'offering' => $offering ) );

        return $offering;
    }
}
