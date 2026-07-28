<?php
/**
 * WPDBAssetRepository class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Infrastructure\Database;

use VuloCart\Domain\Asset\Asset;
use VuloCart\Domain\Asset\AssetRepositoryInterface;
use VuloCart\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart WPDBAssetRepository.
 *
 * The only class in this codebase that runs SQL against
 * `vulocart_assets` — implements Domain\Asset\AssetRepositoryInterface,
 * bound in VuloCart::init_classes(). Every query goes through
 * `$wpdb->prepare()` (database.md); a static in-request cache-by-id
 * follows the same pattern `database.md` already documents (Store.php's
 * cache), so repeated find() calls for the same id within one request
 * don't re-query.
 *
 * @class       WPDBAssetRepository class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class WPDBAssetRepository implements AssetRepositoryInterface {

    /**
     * In-request cache of resolved assets, keyed by id.
     *
     * @var array<int, Asset|null>
     */
    private $cache = array();

    /**
     * Resolves the fully-prefixed `vulocart_assets` table name.
     *
     * @return string
     */
    private function get_table() {
        global $wpdb;
        return $wpdb->prefix . Utill::TABLES['asset'];
    }

    /**
     * Converts a raw `$wpdb` row into a domain Asset object.
     *
     * @param array<string, mixed> $row A raw `vulocart_assets` row.
     * @return Asset
     */
    private function hydrate( $row ) {
        return new Asset(
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
     * Converts a domain Asset object into a `$wpdb`-ready row.
     *
     * @param Asset $asset Asset to convert to a `$wpdb`-ready row.
     * @return array<string, mixed>
     */
    private function to_row( Asset $asset ) {
        return array(
            'type'     => $asset->type,
            'title'    => $asset->title,
            'slug'     => $asset->slug,
            'sku'      => $asset->sku,
            'status'   => $asset->status,
            'price'    => $asset->price,
            'currency' => $asset->currency,
            'meta'     => wp_json_encode( $asset->meta ),
        );
    }

    /**
     * Finds one asset by id.
     *
     * @param int $id Asset id.
     * @return Asset|null Null if no asset with this id exists.
     */
    public function find( int $id ): ?Asset {
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
     * Returns a page of assets, optionally filtered.
     *
     * @param array{page?: int, per_page?: int, type?: string, status?: string} $args Pagination/filter args.
     * @return array{data: Asset[], total: int}
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
     * Persists a new asset.
     *
     * @param Asset $asset An asset with $id === null.
     * @return Asset The same asset, with $id (and timestamps) populated.
     */
    public function insert( Asset $asset ): Asset {
        global $wpdb;

        $wpdb->insert( $this->get_table(), $this->to_row( $asset ) );

        return $this->find( (int) $wpdb->insert_id );
    }

    /**
     * Persists changes to an existing asset.
     *
     * @param Asset $asset An asset with a non-null $id.
     * @return Asset The same asset, with $updated_at refreshed.
     */
    public function update( Asset $asset ): Asset {
        global $wpdb;

        $wpdb->update( $this->get_table(), $this->to_row( $asset ), array( 'id' => $asset->id ) );

        unset( $this->cache[ $asset->id ] );

        return $this->find( $asset->id );
    }

    /**
     * Deletes one asset by id.
     *
     * @param int $id Asset id.
     * @return bool True if a row was deleted.
     */
    public function delete( int $id ): bool {
        global $wpdb;

        unset( $this->cache[ $id ] );

        return false !== $wpdb->delete( $this->get_table(), array( 'id' => $id ) );
    }
}
