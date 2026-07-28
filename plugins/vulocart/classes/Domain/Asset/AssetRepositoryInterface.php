<?php
/**
 * AssetRepositoryInterface class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Domain\Asset;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart AssetRepositoryInterface.
 *
 * The contract Application\AssetService depends on — bound to a concrete
 * implementation only in VuloCart::init_classes() (via ServiceContainer),
 * never referenced by class name anywhere else. This is what makes the
 * storage engine replaceable in practice, not just in principle.
 *
 * @class       AssetRepositoryInterface interface
 * @version     1.0.0
 * @author      MultiVendorX
 */
interface AssetRepositoryInterface {

    /**
     * Finds one asset by id.
     *
     * @param int $id Asset id.
     * @return Asset|null Null if no asset with this id exists.
     */
    public function find( int $id ): ?Asset;

    /**
     * Returns a page of assets, optionally filtered.
     *
     * @param array{page?: int, per_page?: int, type?: string, status?: string} $args Pagination/filter args.
     * @return array{data: Asset[], total: int}
     */
    public function paginate( array $args = array() ): array;

    /**
     * Persists a new asset.
     *
     * @param Asset $asset An asset with $id === null.
     * @return Asset The same asset, with $id (and timestamps) populated.
     */
    public function insert( Asset $asset ): Asset;

    /**
     * Persists changes to an existing asset.
     *
     * @param Asset $asset An asset with a non-null $id.
     * @return Asset The same asset, with $updated_at refreshed.
     */
    public function update( Asset $asset ): Asset;

    /**
     * Deletes one asset by id.
     *
     * @param int $id Asset id.
     * @return bool True if a row was deleted.
     */
    public function delete( int $id ): bool;
}
