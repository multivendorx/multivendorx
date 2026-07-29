<?php
/**
 * TermRepositoryInterface class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Domain\Term;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart TermRepositoryInterface.
 *
 * The contract Application\TermService depends on — bound to a concrete
 * implementation only in VuloCart::init_classes(), same seam
 * Domain\Offering\OfferingRepositoryInterface already establishes.
 *
 * @class       TermRepositoryInterface interface
 * @version     1.0.0
 * @author      MultiVendorX
 */
interface TermRepositoryInterface {

    /**
     * Finds one term by id.
     *
     * @param int $id Term id.
     * @return Term|null Null if no term with this id exists.
     */
    public function find( int $id ): ?Term;

    /**
     * Finds one term by taxonomy + slug — used to enforce slug uniqueness
     * within a taxonomy (two different taxonomies may reuse the same slug).
     *
     * @param string $taxonomy One of Taxonomy's constants.
     * @param string $slug     URL-safe slug.
     * @return Term|null
     */
    public function find_by_slug( string $taxonomy, string $slug ): ?Term;

    /**
     * Returns every term in a taxonomy, optionally filtered by search text.
     *
     * @param string                                  $taxonomy One of Taxonomy's constants.
     * @param array{search?: string, parent_id?: int} $args     Filter args.
     * @return Term[]
     */
    public function list( string $taxonomy, array $args = array() ): array;

    /**
     * Persists a new term.
     *
     * @param Term $term A term with $id === null.
     * @return Term The same term, with $id (and timestamps) populated.
     */
    public function insert( Term $term ): Term;

    /**
     * Persists changes to an existing term.
     *
     * @param Term $term A term with a non-null $id.
     * @return Term The same term, with $updated_at refreshed.
     */
    public function update( Term $term ): Term;

    /**
     * Deletes a term.
     *
     * @param int $id Term id.
     * @return bool True if a row was deleted.
     */
    public function delete( int $id ): bool;

    /**
     * Counts how many offerings currently reference a term's slug in their
     * own `meta` bag (categories/brand_id/collection_ids — see
     * Application\TermService's own docblock for why this is a live count
     * over Offering.meta rather than a maintained join table).
     *
     * @param Term $term The term to count offerings for.
     * @return int
     */
    public function count_offerings_for_term( Term $term ): int;
}
