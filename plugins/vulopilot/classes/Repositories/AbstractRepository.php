<?php
/**
 * AbstractRepository class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Repositories;

use VuloPilot\Contracts\Repository\RepositoryInterface;
use VuloPilot\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Shared $wpdb CRUD implementation for every VuloPilot custom table.
 * Concrete repositories only declare which Utill::TABLES key they own and
 * which columns find_all() may filter on by exact match — the actual
 * prepare()/query boilerplate lives here once instead of being repeated
 * per entity (database.md's "always $wpdb->prepare() for any query with a
 * variable", applied uniformly).
 *
 * Per-id in-request cache follows the same pattern database.md points to
 * (Store.php's static-cache-by-id) rather than introducing a new caching
 * layer.
 *
 * @class       AbstractRepository class
 * @version     1.0.0
 * @author      MultiVendorX
 */
abstract class AbstractRepository implements RepositoryInterface {

    /**
     * @var array<int, array<string, mixed>|null>
     */
    private array $cache = array();

    /**
     * @var string[] Columns find_all() accepts as exact-match filters.
     */
    protected array $filterable_columns = array();

    /**
     * @var string[] Text columns an incoming `search` arg is LIKE-matched against (OR'd together).
     */
    protected array $searchable_columns = array();

    /**
     * @return string Utill::TABLES key this repository owns.
     */
    abstract protected function get_table_key(): string;

    /**
     * @return string Fully-prefixed table name.
     */
    protected function get_table(): string {
        global $wpdb;
        return $wpdb->prefix . Utill::TABLES[ $this->get_table_key() ];
    }

    /**
     * @inheritDoc
     */
    public function find( int $id ): ?array {
        if ( array_key_exists( $id, $this->cache ) ) {
            return $this->cache[ $id ];
        }

        global $wpdb;

        $row = $wpdb->get_row(
            $wpdb->prepare( "SELECT * FROM {$this->get_table()} WHERE id = %d", $id ), // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            ARRAY_A
        );

        $this->cache[ $id ] = $row ?: null;

        return $this->cache[ $id ];
    }

    /**
     * @inheritDoc
     */
    public function find_all( array $args = array() ): array {
        global $wpdb;

        $table    = $this->get_table();
        $page     = max( 1, (int) ( $args['page'] ?? 1 ) );
        $per_page = max( 1, min( 100, (int) ( $args['per_page'] ?? 20 ) ) );
        $offset   = ( $page - 1 ) * $per_page;
        $orderby  = preg_replace( '/[^a-zA-Z_]/', '', (string) ( ! empty( $args['orderby'] ) ? $args['orderby'] : 'id' ) );
        $order    = 'asc' === strtolower( (string) ( $args['order'] ?? 'desc' ) ) ? 'ASC' : 'DESC';

        $where_clauses = array();
        $where_values  = array();

        foreach ( $this->filterable_columns as $column ) {
            if ( isset( $args[ $column ] ) && '' !== $args[ $column ] ) {
                $where_clauses[] = "`{$column}` = %s";
                $where_values[]  = (string) $args[ $column ];
            }
        }

        if ( ! empty( $args['search'] ) && $this->searchable_columns ) {
            $like              = '%' . $wpdb->esc_like( (string) $args['search'] ) . '%';
            $search_conditions = array();

            foreach ( $this->searchable_columns as $column ) {
                $search_conditions[] = "`{$column}` LIKE %s";
                $where_values[]      = $like;
            }

            $where_clauses[] = '(' . implode( ' OR ', $search_conditions ) . ')';
        }

        $where_sql = $where_clauses ? ( 'WHERE ' . implode( ' AND ', $where_clauses ) ) : '';

        if ( $where_values ) {
            $count_sql = $wpdb->prepare( "SELECT COUNT(*) FROM {$table} {$where_sql}", ...$where_values ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare -- $where_sql's %s count matches $where_values' size at runtime; the sniff can't see that statically.
            $rows_sql  = $wpdb->prepare( // phpcs:ignore WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber -- same runtime-sized-array case as above.
                "SELECT * FROM {$table} {$where_sql} ORDER BY {$orderby} {$order} LIMIT %d OFFSET %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                ...array_merge( $where_values, array( $per_page, $offset ) )
            );
        } else {
            $count_sql = "SELECT COUNT(*) FROM {$table}"; // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
            $rows_sql  = $wpdb->prepare(
                "SELECT * FROM {$table} ORDER BY {$orderby} {$order} LIMIT %d OFFSET %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $per_page,
                $offset
            );
        }

        $total = (int) $wpdb->get_var( $count_sql ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $rows  = $wpdb->get_results( $rows_sql, ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching

        return array(
            'data'  => $rows ?: array(),
            'total' => $total,
        );
    }

    /**
     * Row counts grouped by one column, scoped by any other already-declared
     * filterable_columns present in $args (e.g. scoping a findings status
     * breakdown to one category) — never scoped by $column itself (that's
     * what's being counted) or by 'search' (count badges reflect the fixed
     * dataset, not the search box, matching the sibling multivendorx plugin's
     * StoreTable.tsx/Stores.php, which also computes its status counts
     * unconditionally on every list fetch).
     *
     * @param string               $column Column to GROUP BY.
     * @param array<string, mixed> $args   Same shape as find_all()'s $args.
     * @return array<string, int> value => count, only for values with >=1 row.
     */
    public function count_by_column( string $column, array $args = array() ): array {
        global $wpdb;

        $table         = $this->get_table();
        $safe_column   = preg_replace( '/[^a-zA-Z_]/', '', $column );
        $where_clauses = array();
        $where_values  = array();

        foreach ( $this->filterable_columns as $filter_column ) {
            if ( $filter_column === $column ) {
                continue;
            }

            if ( isset( $args[ $filter_column ] ) && '' !== $args[ $filter_column ] ) {
                $where_clauses[] = "`{$filter_column}` = %s";
                $where_values[]  = (string) $args[ $filter_column ];
            }
        }

        $where_sql = $where_clauses ? ( 'WHERE ' . implode( ' AND ', $where_clauses ) ) : '';

        if ( $where_values ) {
            $sql = $wpdb->prepare( "SELECT `{$safe_column}` AS bucket, COUNT(*) AS total FROM {$table} {$where_sql} GROUP BY `{$safe_column}`", ...$where_values ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare -- $where_sql's %s count matches $where_values' size at runtime.
        } else {
            $sql = "SELECT `{$safe_column}` AS bucket, COUNT(*) AS total FROM {$table} GROUP BY `{$safe_column}`"; // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
        }

        $rows = $wpdb->get_results( $sql, ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching

        $counts = array();

        foreach ( (array) $rows as $row ) {
            $counts[ $row['bucket'] ] = (int) $row['total'];
        }

        return $counts;
    }

    /**
     * @inheritDoc
     */
    public function insert( array $data ): int {
        global $wpdb;

        $wpdb->insert( $this->get_table(), $data );

        return (int) $wpdb->insert_id;
    }

    /**
     * @inheritDoc
     */
    public function update( int $id, array $data ): bool {
        global $wpdb;

        unset( $this->cache[ $id ] );

        return false !== $wpdb->update( $this->get_table(), $data, array( 'id' => $id ) );
    }

    /**
     * Applies the same update to a bounded set of rows (e.g. rows checked
     * via a table's bulk-action UI) — loops the existing single-row
     * update() rather than building a fresh bulk SQL statement, since the
     * id list is always small (whatever fits on one page) and this reuses
     * update()'s own cache-invalidation for free.
     *
     * @param int[]                $ids  Row ids to update.
     * @param array<string, mixed> $data Column => value pairs to set on every row.
     * @return int Number of rows actually updated.
     */
    public function bulk_update( array $ids, array $data ): int {
        $updated_count = 0;

        foreach ( $ids as $id ) {
            if ( $this->update( (int) $id, $data ) ) {
                ++$updated_count;
            }
        }

        return $updated_count;
    }

    /**
     * @inheritDoc
     */
    public function delete( int $id ): bool {
        global $wpdb;

        unset( $this->cache[ $id ] );

        return false !== $wpdb->delete( $this->get_table(), array( 'id' => $id ) );
    }
}
