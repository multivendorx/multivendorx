<?php
/**
 * AbstractRepository class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Repositories;

use VuloPilotCore\Contracts\Repository\RepositoryInterface;
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
        $orderby  = preg_replace( '/[^a-zA-Z_]/', '', (string) ( $args['orderby'] ?? 'id' ) );
        $order    = 'asc' === strtolower( (string) ( $args['order'] ?? 'desc' ) ) ? 'ASC' : 'DESC';

        $where_clauses = array();
        $where_values  = array();

        foreach ( $this->filterable_columns as $column ) {
            if ( isset( $args[ $column ] ) && '' !== $args[ $column ] ) {
                $where_clauses[] = "`{$column}` = %s";
                $where_values[]  = (string) $args[ $column ];
            }
        }

        $where_sql = $where_clauses ? ( 'WHERE ' . implode( ' AND ', $where_clauses ) ) : '';

        if ( $where_values ) {
            $count_sql = $wpdb->prepare( "SELECT COUNT(*) FROM {$table} {$where_sql}", $where_values ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            $rows_sql  = $wpdb->prepare(
                "SELECT * FROM {$table} {$where_sql} ORDER BY {$orderby} {$order} LIMIT %d OFFSET %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                array_merge( $where_values, array( $per_page, $offset ) )
            );
        } else {
            $count_sql = "SELECT COUNT(*) FROM {$table}"; // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
            $rows_sql  = $wpdb->prepare(
                "SELECT * FROM {$table} ORDER BY {$orderby} {$order} LIMIT %d OFFSET %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $per_page,
                $offset
            );
        }

        $total = (int) $wpdb->get_var( $count_sql );
        $rows  = $wpdb->get_results( $rows_sql, ARRAY_A );

        return array(
            'data'  => $rows ?: array(),
            'total' => $total,
        );
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
     * @inheritDoc
     */
    public function delete( int $id ): bool {
        global $wpdb;

        unset( $this->cache[ $id ] );

        return false !== $wpdb->delete( $this->get_table(), array( 'id' => $id ) );
    }
}
