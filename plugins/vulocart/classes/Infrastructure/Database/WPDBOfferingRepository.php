<?php
/**
 * WPDBOfferingRepository class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Infrastructure\Database;

use VuloCart\Domain\Offering\Offering;
use VuloCart\Domain\Offering\OfferingRepositoryInterface;
use VuloCart\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart WPDBOfferingRepository.
 *
 * The only class in this codebase that runs SQL against
 * `vulocart_offerings` — implements Domain\Offering\OfferingRepositoryInterface,
 * bound in VuloCart::init_classes(). Every query goes through
 * `$wpdb->prepare()` (database.md); a static in-request cache-by-id
 * follows the same pattern `database.md` already documents (Store.php's
 * cache), so repeated find() calls for the same id within one request
 * don't re-query.
 *
 * @class       WPDBOfferingRepository class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class WPDBOfferingRepository implements OfferingRepositoryInterface {

    /**
     * In-request cache of resolved offerings, keyed by id.
     *
     * @var array<int, Offering|null>
     */
    private $cache = array();

    /**
     * Resolves the fully-prefixed `vulocart_offerings` table name.
     *
     * @return string
     */
    private function get_table() {
        global $wpdb;
        return $wpdb->prefix . Utill::TABLES['offering'];
    }

    /**
     * Converts a raw `$wpdb` row into a domain Offering object.
     *
     * @param array<string, mixed> $row A raw `vulocart_offerings` row.
     * @return Offering
     */
    private function hydrate( $row ) {
        return new Offering(
            (int) $row['id'],
            $row['type'],
            $row['title'],
            $row['slug'],
            $row['sku'],
            $row['status'],
            null === $row['price'] ? null : (float) $row['price'],
            $row['currency'],
            $row['meta'] ? (array) json_decode( $row['meta'], true ) : array(),
            $row['created_at'],
            $row['updated_at']
        );
    }

    /**
     * Converts a domain Offering object into a `$wpdb`-ready row.
     *
     * @param Offering $offering Offering to convert to a `$wpdb`-ready row.
     * @return array<string, mixed>
     */
    private function to_row( Offering $offering ) {
        return array(
            'type'     => $offering->type,
            'title'    => $offering->title,
            'slug'     => $offering->slug,
            'sku'      => $offering->sku,
            'status'   => $offering->status,
            'price'    => $offering->price,
            'currency' => $offering->currency,
            'meta'     => wp_json_encode( $offering->meta ),
        );
    }

    /**
     * Finds one offering by id.
     *
     * @param int $id Offering id.
     * @return Offering|null Null if no offering with this id exists.
     */
    public function find( int $id ): ?Offering {
        if ( array_key_exists( $id, $this->cache ) ) {
            return $this->cache[ $id ];
        }

        global $wpdb;

        $row = $wpdb->get_row(
            $wpdb->prepare( "SELECT * FROM {$this->get_table()} WHERE id = %d", $id ), // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            ARRAY_A
        );

        $this->cache[ $id ] = $row ? $this->hydrate( $row ) : null;

        return $this->cache[ $id ];
    }

    /**
     * Returns a page of offerings, optionally filtered.
     *
     * @param array{page?: int, per_page?: int, type?: string, status?: string} $args Pagination/filter args.
     * @return array{data: Offering[], total: int}
     */
    public function paginate( array $args = array() ): array {
        global $wpdb;

        $table    = $this->get_table();
        $page     = max( 1, (int) ( isset( $args['page'] ) ? $args['page'] : 1 ) );
        $per_page = max( 1, min( 100, (int) ( isset( $args['per_page'] ) ? $args['per_page'] : 20 ) ) );
        $offset   = ( $page - 1 ) * $per_page;

        $where_clauses = array();
        $where_values  = array();

        if ( ! empty( $args['type'] ) ) {
            $where_clauses[] = 'type = %s';
            $where_values[]  = (string) $args['type'];
        }

        if ( ! empty( $args['status'] ) ) {
            $where_clauses[] = 'status = %s';
            $where_values[]  = (string) $args['status'];
        }

        $where_sql = $where_clauses ? ( 'WHERE ' . implode( ' AND ', $where_clauses ) ) : '';

        if ( $where_values ) {
            $count_sql = $wpdb->prepare( "SELECT COUNT(*) FROM {$table} {$where_sql}", ...$where_values ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare -- $where_sql's %s count matches $where_values' size at runtime; the sniff can't see that statically.
            $rows_sql  = $wpdb->prepare( // phpcs:ignore WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber -- same runtime-sized-array case as above.
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
     * Persists a new offering.
     *
     * @param Offering $offering An offering with $id === null.
     * @return Offering The same offering, with $id (and timestamps) populated.
     */
    public function insert( Offering $offering ): Offering {
        global $wpdb;

        $wpdb->insert( $this->get_table(), $this->to_row( $offering ) );

        return $this->find( (int) $wpdb->insert_id );
    }

    /**
     * Persists changes to an existing offering.
     *
     * @param Offering $offering An offering with a non-null $id.
     * @return Offering The same offering, with $updated_at refreshed.
     */
    public function update( Offering $offering ): Offering {
        global $wpdb;

        $wpdb->update( $this->get_table(), $this->to_row( $offering ), array( 'id' => $offering->id ) );

        unset( $this->cache[ $offering->id ] );

        return $this->find( $offering->id );
    }

    /**
     * Deletes one offering by id.
     *
     * @param int $id Offering id.
     * @return bool True if a row was deleted.
     */
    public function delete( int $id ): bool {
        global $wpdb;

        unset( $this->cache[ $id ] );

        return false !== $wpdb->delete( $this->get_table(), array( 'id' => $id ) );
    }

    /**
     * Counts offerings in each OfferingType bucket, in one query.
     *
     * @return array<string, int> Type value => count.
     */
    public function count_by_type(): array {
        global $wpdb;

        $rows = $wpdb->get_results( "SELECT type, COUNT(*) as total FROM {$this->get_table()} GROUP BY type", ARRAY_A ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- static SQL, no user input.

        $counts = array();

        foreach ( $rows ? $rows : array() as $row ) {
            $counts[ $row['type'] ] = (int) $row['total'];
        }

        return $counts;
    }
}
