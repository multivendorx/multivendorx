<?php
/**
 * WPDBOrderRepository class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Order\Infrastructure;

use VuloCart\Order\Domain\Order;
use VuloCart\Order\Domain\OrderItem;
use VuloCart\Order\Domain\OrderRepositoryInterface;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Order module WPDBOrderRepository.
 *
 * The only class in this codebase that runs SQL against `vulocart_orders`/
 * `vulocart_order_items` — implements Domain\OrderRepositoryInterface,
 * bound in Module::wire_services(). Table names are hardcoded here rather
 * than added to the free plugin's `Utill::TABLES` — same "module owns its
 * own table names" convention `vulocart-pro`'s Passport module already
 * establishes.
 *
 * @class       WPDBOrderRepository class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class WPDBOrderRepository implements OrderRepositoryInterface {

    /**
     * In-request cache of resolved orders, keyed by id — same pattern
     * VuloCart\Infrastructure\Database\WPDBAssetRepository already uses.
     *
     * @var array<int, Order|null>
     */
    private $cache = array();

    /**
     * Resolves the fully-prefixed `vulocart_orders` table name.
     *
     * @return string
     */
    private function get_orders_table() {
        global $wpdb;
        return $wpdb->prefix . 'vulocart_orders';
    }

    /**
     * Resolves the fully-prefixed `vulocart_order_items` table name.
     *
     * @return string
     */
    private function get_order_items_table() {
        global $wpdb;
        return $wpdb->prefix . 'vulocart_order_items';
    }

    /**
     * Converts a raw `$wpdb` order row into a domain Order object.
     *
     * @param array<string, mixed> $row   A raw `vulocart_orders` row.
     * @param OrderItem[]          $items This order's already-loaded line items.
     * @return Order
     */
    private function hydrate_order( $row, $items ) {
        return new Order(
            (int) $row['id'],
            $row['order_number'],
            $row['access_token'],
            $row['cart_token'],
            $row['customer_email'],
            $row['customer_name'],
            $row['status'],
            $row['currency'],
            (float) $row['subtotal'],
            (float) $row['total'],
            $items,
            $row['meta'] ? (array) json_decode( $row['meta'], true ) : array(),
            $row['created_at'],
            $row['updated_at']
        );
    }

    /**
     * Converts a raw `$wpdb` order item row into a domain OrderItem object.
     *
     * @param array<string, mixed> $row A raw `vulocart_order_items` row.
     * @return OrderItem
     */
    private function hydrate_item( $row ) {
        return new OrderItem(
            (int) $row['id'],
            (int) $row['order_id'],
            (int) $row['asset_id'],
            $row['title'],
            (int) $row['quantity'],
            (float) $row['unit_price'],
            $row['currency'],
            $row['meta'] ? (array) json_decode( $row['meta'], true ) : array(),
            $row['created_at']
        );
    }

    /**
     * Loads every line item belonging to an order, in insertion order.
     *
     * @param int $order_id Owning order id.
     * @return OrderItem[]
     */
    private function load_items( $order_id ) {
        global $wpdb;

        $rows = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$this->get_order_items_table()} WHERE order_id = %d ORDER BY id ASC", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $order_id
            ),
            ARRAY_A
        );

        return array_map( array( $this, 'hydrate_item' ), $rows ? $rows : array() );
    }

    /**
     * Finds one order by id, with its items loaded.
     *
     * @param int $id Order id.
     * @return Order|null Null if no order with this id exists.
     */
    public function find( int $id ): ?Order {
        if ( array_key_exists( $id, $this->cache ) ) {
            return $this->cache[ $id ];
        }

        global $wpdb;

        $row = $wpdb->get_row(
            $wpdb->prepare( "SELECT * FROM {$this->get_orders_table()} WHERE id = %d", $id ), // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            ARRAY_A
        );

        $this->cache[ $id ] = $row ? $this->hydrate_order( $row, $this->load_items( $id ) ) : null;

        return $this->cache[ $id ];
    }

    /**
     * Finds one order by its human-facing order number and access token.
     *
     * @param string $order_number Human-facing order identifier.
     * @param string $access_token Opaque buyer-held access token.
     * @return Order|null Null if no order matches both values.
     */
    public function find_by_number_and_token( string $order_number, string $access_token ): ?Order {
        global $wpdb;

        $row = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM {$this->get_orders_table()} WHERE order_number = %s AND access_token = %s", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $order_number,
                $access_token
            ),
            ARRAY_A
        );

        if ( ! $row ) {
            return null;
        }

        return $this->hydrate_order( $row, $this->load_items( (int) $row['id'] ) );
    }

    /**
     * Returns a page of orders, optionally filtered.
     *
     * @param array{page?: int, per_page?: int, status?: string, search?: string} $args Pagination/filter args.
     * @return array{data: Order[], total: int}
     */
    public function paginate( array $args = array() ): array {
        global $wpdb;

        $table    = $this->get_orders_table();
        $page     = max( 1, (int) ( isset( $args['page'] ) ? $args['page'] : 1 ) );
        $per_page = max( 1, min( 100, (int) ( isset( $args['per_page'] ) ? $args['per_page'] : 20 ) ) );
        $offset   = ( $page - 1 ) * $per_page;

        $where_clauses = array();
        $where_values  = array();

        if ( ! empty( $args['status'] ) ) {
            $where_clauses[] = 'status = %s';
            $where_values[]  = (string) $args['status'];
        }

        // Matches order number, customer email, and customer name — the
        // three fields the admin grid's search box is realistically used
        // to look someone/something up by (Orders.tsx's search prop).
        if ( ! empty( $args['search'] ) ) {
            $like            = '%' . $wpdb->esc_like( (string) $args['search'] ) . '%';
            $where_clauses[] = '(order_number LIKE %s OR customer_email LIKE %s OR customer_name LIKE %s)';
            $where_values[]  = $like;
            $where_values[]  = $like;
            $where_values[]  = $like;
        }

        $where_sql = $where_clauses ? 'WHERE ' . implode( ' AND ', $where_clauses ) : '';

        if ( $where_values ) {
            $count_sql = $wpdb->prepare( "SELECT COUNT(*) FROM {$table} {$where_sql}", ...$where_values ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare -- $where_sql's %s count matches $where_values' size at runtime; the sniff can't see that statically.
            $rows_sql  = $wpdb->prepare(
                "SELECT * FROM {$table} {$where_sql} ORDER BY id DESC LIMIT %d OFFSET %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber -- $where_sql's own %s/%d count varies (0, 1, or 3 placeholders depending on which filters are active) and is included in $where_values' size at runtime; the sniff only sees the literal string's 2 placeholders statically.
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

        $orders = array();

        foreach ( $rows ? $rows : array() as $row ) {
            $orders[] = $this->hydrate_order( $row, $this->load_items( (int) $row['id'] ) );
        }

        return array(
            'data'  => $orders,
            'total' => $total,
        );
    }

    /**
     * Persists a new order, then stamps its `order_number` from the
     * resulting auto-increment id (e.g. 'VC-000042') — a second update in
     * the same spirit as WPDBAssetRepository::insert()'s find-after-insert,
     * since the number can't be known before the row exists.
     *
     * @param Order $order An order with $id === null.
     * @return Order The same order, with $id (and timestamps) populated.
     */
    public function insert( Order $order ): Order {
        global $wpdb;

        $wpdb->insert(
            $this->get_orders_table(),
            array(
                'order_number'   => '',
                'access_token'   => $order->access_token,
                'cart_token'     => $order->cart_token,
                'customer_email' => $order->customer_email,
                'customer_name'  => $order->customer_name,
                'status'         => $order->status,
                'currency'       => $order->currency,
                'subtotal'       => $order->subtotal,
                'total'          => $order->total,
                'meta'           => wp_json_encode( $order->meta ),
            )
        );

        $id           = (int) $wpdb->insert_id;
        $order_number = sprintf( 'VC-%06d', $id );

        $wpdb->update( $this->get_orders_table(), array( 'order_number' => $order_number ), array( 'id' => $id ) );

        return $this->find( $id );
    }

    /**
     * Persists changes to an existing order.
     *
     * @param Order $order An order with a non-null $id.
     * @return Order The same order, with $updated_at refreshed.
     */
    public function update( Order $order ): Order {
        global $wpdb;

        $wpdb->update(
            $this->get_orders_table(),
            array(
                'status' => $order->status,
                'meta'   => wp_json_encode( $order->meta ),
            ),
            array( 'id' => $order->id )
        );

        unset( $this->cache[ $order->id ] );

        return $this->find( $order->id );
    }

    /**
     * Persists a new line item under an order.
     *
     * @param OrderItem $item An item with $id === null.
     * @return OrderItem The same item, with $id (and timestamps) populated.
     */
    public function insert_item( OrderItem $item ): OrderItem {
        global $wpdb;

        $wpdb->insert(
            $this->get_order_items_table(),
            array(
                'order_id'   => $item->order_id,
                'asset_id'   => $item->asset_id,
                'title'      => $item->title,
                'quantity'   => $item->quantity,
                'unit_price' => $item->unit_price,
                'currency'   => $item->currency,
                'meta'       => wp_json_encode( $item->meta ),
            )
        );

        unset( $this->cache[ $item->order_id ] );

        $row = $wpdb->get_row(
            $wpdb->prepare( "SELECT * FROM {$this->get_order_items_table()} WHERE id = %d", $wpdb->insert_id ), // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            ARRAY_A
        );

        return $this->hydrate_item( $row );
    }
}
