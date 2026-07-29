<?php
/**
 * TermService class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Application;

use VuloCart\Domain\Term\Taxonomy;
use VuloCart\Domain\Term\Term;
use VuloCart\Domain\Term\TermRepositoryInterface;
use VuloCart\Events\EventDispatcher;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart TermService.
 *
 * Where Category/Brand/Collection business logic lives — backs
 * `classes/RestAPI/Controllers/Terms.php`'s three taxonomy-scoped route
 * sets. Same "controller never touches a repository directly" convention
 * Application\OfferingService/OrderService already establish.
 *
 * @class       TermService class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class TermService {

    /**
     * The bound repository implementation.
     *
     * @var TermRepositoryInterface Resolved via ServiceContainer, not `new`d directly.
     */
    private $repository;

    /**
     * Broadcasts what happened after each mutation.
     *
     * @var EventDispatcher
     */
    private $events;

    /**
     * TermService constructor.
     *
     * @param TermRepositoryInterface $repository Resolved via ServiceContainer, not `new`d directly.
     * @param EventDispatcher         $events     Broadcasts what happened; never decides what should happen.
     */
    public function __construct( TermRepositoryInterface $repository, EventDispatcher $events ) {
        $this->repository = $repository;
        $this->events     = $events;
    }

    /**
     * Fetches one term by id.
     *
     * @param int $id Term id.
     * @return Term|null
     */
    public function get_term( $id ) {
        return $this->repository->find( $id );
    }

    /**
     * Lists every term in a taxonomy.
     *
     * @param string                                  $taxonomy One of Taxonomy's constants.
     * @param array{search?: string, parent_id?: int} $args     Filter args, already sanitized by the caller.
     * @return Term[]
     * @throws \InvalidArgumentException If $taxonomy isn't known.
     */
    public function list_terms( string $taxonomy, array $args = array() ): array {
        if ( ! in_array( $taxonomy, Taxonomy::all(), true ) ) {
            throw new \InvalidArgumentException( 'Unknown taxonomy.' );
        }

        return $this->repository->list( $taxonomy, $args );
    }

    /**
     * Creates a new term and broadcasts `term_created`. Slug is derived
     * from name (`sanitize_title()`, same as OfferingService::create_offering()
     * does for Offering::$slug) unless one was explicitly given, and
     * de-duplicated within the taxonomy by appending `-2`/`-3`/etc — same
     * "never silently overwrite an existing record by slug collision"
     * rule Offerings' own slug handling follows.
     *
     * @param array{taxonomy: string, name: string, slug?: string, parent_id?: int, description?: string, meta?: array<string, mixed>} $data Already-sanitized input.
     * @return Term
     * @throws \InvalidArgumentException If $data['taxonomy'] isn't known.
     */
    public function create_term( array $data ): Term {
        if ( ! in_array( $data['taxonomy'], Taxonomy::all(), true ) ) {
            throw new \InvalidArgumentException( 'Unknown taxonomy.' );
        }

        $slug = $this->unique_slug(
            $data['taxonomy'],
            ! empty( $data['slug'] ) ? $data['slug'] : sanitize_title( $data['name'] )
        );

        $term = new Term(
            null,
            $data['taxonomy'],
            $data['name'],
            $slug,
            isset( $data['parent_id'] ) ? $data['parent_id'] : null,
            isset( $data['description'] ) ? $data['description'] : null,
            isset( $data['meta'] ) ? $data['meta'] : array()
        );

        $term = $this->repository->insert( $term );

        $this->events->dispatch( 'term_created', array( 'term' => $term ) );

        return $term;
    }

    /**
     * Updates an existing term and broadcasts `term_updated`.
     *
     * @param int                                                                                      $id   Term id.
     * @param array{name?: string, slug?: string, parent_id?: int, description?: string, meta?: array} $data Already-sanitized partial update.
     * @return Term|null Null if no term with this id exists.
     */
    public function update_term( $id, array $data ) {
        $term = $this->repository->find( $id );

        if ( ! $term ) {
            return null;
        }

        if ( isset( $data['slug'] ) && $data['slug'] !== $term->slug ) {
            $data['slug'] = $this->unique_slug( $term->taxonomy, $data['slug'], $id );
        }

        $term->name        = isset( $data['name'] ) ? $data['name'] : $term->name;
        $term->slug        = isset( $data['slug'] ) ? $data['slug'] : $term->slug;
        $term->parent_id   = array_key_exists( 'parent_id', $data ) ? $data['parent_id'] : $term->parent_id;
        $term->description = array_key_exists( 'description', $data ) ? $data['description'] : $term->description;
        $term->meta        = isset( $data['meta'] ) ? $data['meta'] : $term->meta;

        $term = $this->repository->update( $term );

        $this->events->dispatch( 'term_updated', array( 'term' => $term ) );

        return $term;
    }

    /**
     * Deletes a term and broadcasts `term_deleted`. Does not touch any
     * offering that currently references this term's slug in its own
     * `meta` bag — same "additive, never silently rewrite other records"
     * posture the rest of this codebase takes; an offering keeps
     * whatever slug it had, which simply stops resolving to a real term
     * (same class of harmless dangling reference `Modules::
     * load_active_modules()`'s own stored-active-id cleanup already
     * tolerates elsewhere in this codebase).
     *
     * @param int $id Term id.
     * @return bool True if a term was found and deleted.
     */
    public function delete_term( $id ): bool {
        $term = $this->repository->find( $id );

        if ( ! $term ) {
            return false;
        }

        $deleted = $this->repository->delete( $id );

        if ( $deleted ) {
            $this->events->dispatch( 'term_deleted', array( 'term' => $term ) );
        }

        return $deleted;
    }

    /**
     * Counts offerings referencing a term.
     *
     * @param Term $term The term to count offerings for.
     * @return int
     */
    public function count_offerings_for_term( Term $term ): int {
        return $this->repository->count_offerings_for_term( $term );
    }

    /**
     * Appends `-2`/`-3`/etc to $slug until it's unique within $taxonomy.
     *
     * @param string   $taxonomy   One of Taxonomy's constants.
     * @param string   $slug       Candidate slug.
     * @param int|null $exclude_id Term id to exclude from the collision check (when updating that same term's own slug).
     * @return string
     */
    private function unique_slug( string $taxonomy, string $slug, $exclude_id = null ): string {
        $candidate = $slug;
        $suffix    = 2;

        while ( true ) {
            $existing = $this->repository->find_by_slug( $taxonomy, $candidate );

            if ( ! $existing || $existing->id === $exclude_id ) {
                return $candidate;
            }

            $candidate = $slug . '-' . $suffix;
            ++$suffix;
        }
    }
}
