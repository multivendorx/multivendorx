<?php
/**
 * OfferingRepositoryInterface class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Domain\Offering;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart OfferingRepositoryInterface.
 *
 * The contract Application\OfferingService depends on — bound to a concrete
 * implementation only in VuloCart::init_classes() (via ServiceContainer),
 * never referenced by class name anywhere else. This is what makes the
 * storage engine replaceable in practice, not just in principle.
 *
 * @class       OfferingRepositoryInterface interface
 * @version     1.0.0
 * @author      MultiVendorX
 */
interface OfferingRepositoryInterface {

    /**
     * Finds one offering by id.
     *
     * @param int $id Offering id.
     * @return Offering|null Null if no offering with this id exists.
     */
    public function find( int $id ): ?Offering;

    /**
     * Returns a page of offerings, optionally filtered.
     *
     * @param array{page?: int, per_page?: int, type?: string, status?: string} $args Pagination/filter args.
     * @return array{data: Offering[], total: int}
     */
    public function paginate( array $args = array() ): array;

    /**
     * Persists a new offering.
     *
     * @param Offering $offering An offering with $id === null.
     * @return Offering The same offering, with $id (and timestamps) populated.
     */
    public function insert( Offering $offering ): Offering;

    /**
     * Persists changes to an existing offering.
     *
     * @param Offering $offering An offering with a non-null $id.
     * @return Offering The same offering, with $updated_at refreshed.
     */
    public function update( Offering $offering ): Offering;

    /**
     * Deletes one offering by id.
     *
     * @param int $id Offering id.
     * @return bool True if a row was deleted.
     */
    public function delete( int $id ): bool;

    /**
     * Counts offerings in each OfferingType bucket — backs the Offerings menu's
     * "Offering Types" reference page (`src/pages/OfferingTypes/`), same
     * pattern Order's own `count_by_fulfillment_status()` establishes.
     *
     * @return array<string, int> Type value => count.
     */
    public function count_by_type(): array;
}
