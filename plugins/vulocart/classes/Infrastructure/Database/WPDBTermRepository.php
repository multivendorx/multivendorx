<?php
/**
 * WPDBTermRepository class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Infrastructure\Database;

use VuloCart\Domain\Term\Term;
use VuloCart\Domain\Term\TermRepositoryInterface;
use VuloCart\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart WPDBTermRepository.
 *
 * The only class that runs SQL against `vulocart_terms` — implements
 * Domain\Term\TermRepositoryInterface, bound in VuloCart::init_classes().
 * `count_offerings_for_term()` counts live against `vulocart_offerings.meta`
 * (a quoted-substring `LIKE` on the term's own slug) rather than a
 * maintained `term_relationships` join table — Offering.meta already stores
 * `categories`/`brand`/`collections` as plain slug arrays/strings
 * (RestAPI\Controllers\Offerings.php's existing `sanitize_offering_meta()`),
 * so a term's assignment to offerings is derived from that existing data
 * rather than a second, easy-to-drift source of truth.
 *
 * @class       WPDBTermRepository class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class WPDBTermRepository implements TermRepositoryInterface {

    /**
     * Resolves the fully-prefixed `vulocart_terms` table name.
     *
     * @return string
     */
    private function get_table() {
        global $wpdb;
        return $wpdb->prefix . 'vulocart_terms';
    }

    /**
     * Resolves the fully-prefixed `vulocart_offerings` table name — used by
     * count_offerings_for_term() only.
     *
     * @return string
     */
    private function get_offerings_table() {
        global $wpdb;
        return $wpdb->prefix . Utill::TABLES['offering'];
    }

    /**
     * Converts a raw `$wpdb` row into a domain Term object.
     *
     * @param array<string, mixed> $row A raw `vulocart_terms` row.
     * @return Term
     */
    private function hydrate( $row ) {
        return new Term(
            (int) $row['id'],
            $row['taxonomy'],
            $row['name'],
            $row['slug'],
            null === $row['parent_id'] ? null : (int) $row['parent_id'],
            $row['description'],
            $row['meta'] ? (array) json_decode( $row['meta'], true ) : array(),
            $row['created_at'],
            $row['updated_at']
        );
    }

    /**
     * Finds one term by id.
     *
     * @param int $id Term id.
     * @return Term|null Null if no term with this id exists.
     */
    public function find( int $id ): ?Term {
        global $wpdb;

        $row = $wpdb->get_row(
            $wpdb->prepare( "SELECT * FROM {$this->get_table()} WHERE id = %d", $id ), // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            ARRAY_A
        );

        return $row ? $this->hydrate( $row ) : null;
    }

    /**
     * Finds one term by taxonomy + slug.
     *
     * @param string $taxonomy One of Taxonomy's constants.
     * @param string $slug     URL-safe slug.
     * @return Term|null
     */
    public function find_by_slug( string $taxonomy, string $slug ): ?Term {
        global $wpdb;

        $row = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM {$this->get_table()} WHERE taxonomy = %s AND slug = %s", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $taxonomy,
                $slug
            ),
            ARRAY_A
        );

        return $row ? $this->hydrate( $row ) : null;
    }

    /**
     * Returns every term in a taxonomy, optionally filtered.
     *
     * @param string                                  $taxonomy One of Taxonomy's constants.
     * @param array{search?: string, parent_id?: int} $args     Filter args.
     * @return Term[]
     */
    public function list( string $taxonomy, array $args = array() ): array {
        global $wpdb;

        $where_clauses = array( 'taxonomy = %s' );
        $where_values  = array( $taxonomy );

        if ( ! empty( $args['search'] ) ) {
            $where_clauses[] = 'name LIKE %s';
            $where_values[]  = '%' . $wpdb->esc_like( (string) $args['search'] ) . '%';
        }

        if ( array_key_exists( 'parent_id', $args ) ) {
            if ( null === $args['parent_id'] ) {
                $where_clauses[] = 'parent_id IS NULL';
            } else {
                $where_clauses[] = 'parent_id = %d';
                $where_values[]  = (int) $args['parent_id'];
            }
        }

        $where_sql = 'WHERE ' . implode( ' AND ', $where_clauses );

        $sql = $wpdb->prepare( "SELECT * FROM {$this->get_table()} {$where_sql} ORDER BY name ASC", ...$where_values ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare -- $where_sql is built dynamically above; the sniff can't see its placeholders statically.

        $rows = $wpdb->get_results( $sql, ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared

        return array_map( array( $this, 'hydrate' ), $rows ? $rows : array() );
    }

    /**
     * Persists a new term.
     *
     * @param Term $term A term with $id === null.
     * @return Term The same term, with $id (and timestamps) populated.
     */
    public function insert( Term $term ): Term {
        global $wpdb;

        $wpdb->insert(
            $this->get_table(),
            array(
                'taxonomy'    => $term->taxonomy,
                'name'        => $term->name,
                'slug'        => $term->slug,
                'parent_id'   => $term->parent_id,
                'description' => $term->description,
                'meta'        => wp_json_encode( $term->meta ),
            )
        );

        return $this->find( (int) $wpdb->insert_id );
    }

    /**
     * Persists changes to an existing term.
     *
     * @param Term $term A term with a non-null $id.
     * @return Term The same term, with $updated_at refreshed.
     */
    public function update( Term $term ): Term {
        global $wpdb;

        $wpdb->update(
            $this->get_table(),
            array(
                'name'        => $term->name,
                'slug'        => $term->slug,
                'parent_id'   => $term->parent_id,
                'description' => $term->description,
                'meta'        => wp_json_encode( $term->meta ),
            ),
            array( 'id' => $term->id )
        );

        return $this->find( $term->id );
    }

    /**
     * Deletes a term.
     *
     * @param int $id Term id.
     * @return bool True if a row was deleted.
     */
    public function delete( int $id ): bool {
        global $wpdb;

        return (bool) $wpdb->delete( $this->get_table(), array( 'id' => $id ) );
    }

    /**
     * Counts offerings whose `meta` bag references this term's slug — see
     * class docblock for why this is a live `LIKE` count rather than a
     * maintained join table. Matches the slug as a quoted JSON string
     * (`"slug"`) so e.g. a "shoe" term never matches an unrelated
     * "shoes" value — safe because two JSON-encoded string values can
     * only share this exact quoted substring if they're equal.
     *
     * @param Term $term The term to count offerings for.
     * @return int
     */
    public function count_offerings_for_term( Term $term ): int {
        global $wpdb;

        return (int) $wpdb->get_var( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->prepare(
                "SELECT COUNT(*) FROM {$this->get_offerings_table()} WHERE meta LIKE %s", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                '%"' . $wpdb->esc_like( $term->slug ) . '"%'
            )
        );
    }
}
