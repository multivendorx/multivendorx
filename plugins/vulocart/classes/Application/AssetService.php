<?php
/**
 * AssetService class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Application;

use VuloCart\Domain\Asset\Asset;
use VuloCart\Domain\Asset\AssetRepositoryInterface;
use VuloCart\Events\EventDispatcher;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart AssetService.
 *
 * Where Asset business logic actually lives — per the vision's "business
 * logic must never exist inside React components" and "must never exist
 * inside WordPress hooks", RestAPI\Controllers\Assets calls only this
 * class, and this class is the only thing that talks to
 * AssetRepositoryInterface. Any future GraphQL resolver or MCP tool
 * (`create_asset()`, per the vision's MCP tool list) calls this same
 * service too, rather than re-implementing creation/listing logic against
 * the repository directly.
 *
 * @class       AssetService class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class AssetService {

    /**
     * The bound repository implementation.
     *
     * @var AssetRepositoryInterface Resolved via ServiceContainer, not `new`d directly.
     */
    private $repository;

    /**
     * Broadcasts what happened after each mutation.
     *
     * @var EventDispatcher Broadcasts what happened; never decides what should happen.
     */
    private $events;

    /**
     * AssetService constructor.
     *
     * @param AssetRepositoryInterface $repository Resolved via ServiceContainer, not `new`d directly.
     * @param EventDispatcher          $events     Broadcasts what happened; never decides what should happen.
     */
    public function __construct( AssetRepositoryInterface $repository, EventDispatcher $events ) {
        $this->repository = $repository;
        $this->events     = $events;
    }

    /**
     * Fetches one asset by id.
     *
     * @param int $id Asset id.
     * @return Asset|null
     */
    public function get_asset( $id ) {
        return $this->repository->find( $id );
    }

    /**
     * Returns a page of assets, optionally filtered.
     *
     * @param array{page?: int, per_page?: int, type?: string, status?: string} $args Pagination/filter args, already sanitized by the caller.
     * @return array{data: Asset[], total: int}
     */
    public function list_assets( $args = array() ) {
        return $this->repository->paginate( $args );
    }

    /**
     * Creates a new asset and broadcasts `asset_created`.
     *
     * @param array{type: string, title: string, sku?: string, status?: string, price?: float, currency?: string, meta?: array<string, mixed>} $data Already-sanitized input.
     * @return Asset
     */
    public function create_asset( $data ) {
        $asset = new Asset(
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

        $asset = $this->repository->insert( $asset );

        $this->events->dispatch( 'asset_created', array( 'asset' => $asset ) );

        return $asset;
    }

    /**
     * Updates an existing asset and broadcasts `asset_updated`.
     *
     * @param int                                                                                                                  $id   Asset id.
     * @param array{type?: string, title?: string, status?: string, price?: float, currency?: string, meta?: array<string, mixed>} $data Already-sanitized partial update.
     * @return Asset|null Null if no asset with this id exists.
     */
    public function update_asset( $id, $data ) {
        $asset = $this->repository->find( $id );

        if ( ! $asset ) {
            return null;
        }

        $asset->type     = isset( $data['type'] ) ? $data['type'] : $asset->type;
        $asset->title    = isset( $data['title'] ) ? $data['title'] : $asset->title;
        $asset->status   = isset( $data['status'] ) ? $data['status'] : $asset->status;
        $asset->price    = array_key_exists( 'price', $data ) ? (float) $data['price'] : $asset->price;
        $asset->currency = isset( $data['currency'] ) ? $data['currency'] : $asset->currency;
        $asset->meta     = isset( $data['meta'] ) ? $data['meta'] : $asset->meta;

        $asset = $this->repository->update( $asset );

        $this->events->dispatch( 'asset_updated', array( 'asset' => $asset ) );

        return $asset;
    }
}
