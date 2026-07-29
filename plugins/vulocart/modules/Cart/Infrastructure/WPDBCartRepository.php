<?php
/**
 * WPDBCartRepository class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Cart\Infrastructure;

use VuloCart\Cart\Domain\Cart;
use VuloCart\Cart\Domain\CartItem;
use VuloCart\Cart\Domain\CartRepositoryInterface;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Cart module WPDBCartRepository.
 *
 * The only class in this codebase that runs SQL against `vulocart_carts`/
 * `vulocart_cart_items` — implements Domain\CartRepositoryInterface, bound
 * in Module::init_classes(). Table names are hardcoded here rather than
 * added to the free plugin's `Utill::TABLES` — same "module owns its own
 * table names" convention `vulocart-pro`'s Passport module already
 * establishes (`Passport\Util::get_table()`), since this data belongs to
 * this module, not the core plugin's shared registry.
 *
 * @class       WPDBCartRepository class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class WPDBCartRepository implements CartRepositoryInterface {

    /**
     * Resolves the fully-prefixed `vulocart_carts` table name.
     *
     * @return string
     */
    private function get_carts_table() {
        global $wpdb;
        return $wpdb->prefix . 'vulocart_carts';
    }

    /**
     * Resolves the fully-prefixed `vulocart_cart_items` table name.
     *
     * @return string
     */
    private function get_cart_items_table() {
        global $wpdb;
        return $wpdb->prefix . 'vulocart_cart_items';
    }

    /**
     * Converts a raw `$wpdb` cart row into a domain Cart object.
     *
     * @param array<string, mixed> $row   A raw `vulocart_carts` row.
     * @param CartItem[]           $items This cart's already-loaded line items.
     * @return Cart
     */
    private function hydrate_cart( $row, $items ) {
        return new Cart(
            (int) $row['id'],
            $row['token'],
            $row['currency'],
            $items,
            $row['meta'] ? (array) json_decode( $row['meta'], true ) : array(),
            $row['created_at'],
            $row['updated_at']
        );
    }

    /**
     * Converts a raw `$wpdb` cart item row into a domain CartItem object.
     *
     * @param array<string, mixed> $row A raw `vulocart_cart_items` row.
     * @return CartItem
     */
    private function hydrate_item( $row ) {
        return new CartItem(
            (int) $row['id'],
            (int) $row['cart_id'],
            (int) $row['offering_id'],
            (int) $row['quantity'],
            (float) $row['unit_price'],
            $row['currency'],
            $row['meta'] ? (array) json_decode( $row['meta'], true ) : array(),
            $row['created_at'],
            $row['updated_at']
        );
    }

    /**
     * Loads every line item belonging to a cart, oldest first.
     *
     * @param int $cart_id Owning cart id.
     * @return CartItem[]
     */
    private function load_items( $cart_id ) {
        global $wpdb;

        $rows = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$this->get_cart_items_table()} WHERE cart_id = %d ORDER BY id ASC", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $cart_id
            ),
            ARRAY_A
        );

        return array_map( array( $this, 'hydrate_item' ), $rows ? $rows : array() );
    }

    /**
     * Finds one cart by its client-held token, with its items loaded.
     *
     * @param string $token Opaque client-held cart identity.
     * @return Cart|null Null if no cart with this token exists.
     */
    public function find_by_token( string $token ): ?Cart {
        global $wpdb;

        $row = $wpdb->get_row(
            $wpdb->prepare( "SELECT * FROM {$this->get_carts_table()} WHERE token = %s", $token ), // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            ARRAY_A
        );

        if ( ! $row ) {
            return null;
        }

        return $this->hydrate_cart( $row, $this->load_items( (int) $row['id'] ) );
    }

    /**
     * Persists a new, empty cart.
     *
     * @param Cart $cart A cart with $id === null.
     * @return Cart The same cart, with $id (and timestamps) populated.
     */
    public function insert( Cart $cart ): Cart {
        global $wpdb;

        $wpdb->insert(
            $this->get_carts_table(),
            array(
                'token'    => $cart->token,
                'currency' => $cart->currency,
                'meta'     => wp_json_encode( $cart->meta ),
            )
        );

        return $this->find_by_token( $cart->token );
    }

    /**
     * Finds the line item for a given offering already in a cart, if any.
     *
     * @param int $cart_id  Owning cart id.
     * @param int $offering_id VuloCart\Domain\Offering\Offering id.
     * @return CartItem|null
     */
    public function find_item( int $cart_id, int $offering_id ): ?CartItem {
        global $wpdb;

        $row = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM {$this->get_cart_items_table()} WHERE cart_id = %d AND offering_id = %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $cart_id,
                $offering_id
            ),
            ARRAY_A
        );

        return $row ? $this->hydrate_item( $row ) : null;
    }

    /**
     * Persists a new line item.
     *
     * @param CartItem $item An item with $id === null.
     * @return CartItem The same item, with $id (and timestamps) populated.
     */
    public function insert_item( CartItem $item ): CartItem {
        global $wpdb;

        $wpdb->insert(
            $this->get_cart_items_table(),
            array(
                'cart_id'     => $item->cart_id,
                'offering_id' => $item->offering_id,
                'quantity'    => $item->quantity,
                'unit_price'  => $item->unit_price,
                'currency'    => $item->currency,
                'meta'        => wp_json_encode( $item->meta ),
            )
        );

        $row = $wpdb->get_row(
            $wpdb->prepare( "SELECT * FROM {$this->get_cart_items_table()} WHERE id = %d", $wpdb->insert_id ), // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            ARRAY_A
        );

        return $this->hydrate_item( $row );
    }

    /**
     * Persists changes (typically just quantity) to an existing line item.
     *
     * @param CartItem $item An item with a non-null $id.
     * @return CartItem The same item, with $updated_at refreshed.
     */
    public function update_item( CartItem $item ): CartItem {
        global $wpdb;

        $wpdb->update(
            $this->get_cart_items_table(),
            array(
                'quantity'   => $item->quantity,
                'unit_price' => $item->unit_price,
                'meta'       => wp_json_encode( $item->meta ),
            ),
            array( 'id' => $item->id )
        );

        $row = $wpdb->get_row(
            $wpdb->prepare( "SELECT * FROM {$this->get_cart_items_table()} WHERE id = %d", $item->id ), // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            ARRAY_A
        );

        return $this->hydrate_item( $row );
    }

    /**
     * Deletes one line item from a cart.
     *
     * @param int $cart_id Owning cart id.
     * @param int $item_id Item id.
     * @return bool True if a row was deleted.
     */
    public function delete_item( int $cart_id, int $item_id ): bool {
        global $wpdb;

        return false !== $wpdb->delete(
            $this->get_cart_items_table(),
            array(
                'id'      => $item_id,
                'cart_id' => $cart_id,
            )
        );
    }

    /**
     * Deletes every line item from a cart.
     *
     * @param int $cart_id Owning cart id.
     * @return void
     */
    public function delete_items( int $cart_id ): void {
        global $wpdb;

        $wpdb->delete( $this->get_cart_items_table(), array( 'cart_id' => $cart_id ) );
    }

    /**
     * Bumps a cart's `updated_at`.
     *
     * @param int $cart_id Cart id.
     * @return void
     */
    public function touch( int $cart_id ): void {
        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $wpdb->query( $wpdb->prepare( "UPDATE {$this->get_carts_table()} SET updated_at = %s WHERE id = %d", current_time( 'mysql' ), $cart_id ) );
    }

    /**
     * Deletes carts (and their items) whose `updated_at` is older than
     * $days, in bounded batches — see the interface docblock for why.
     *
     * @param int $days Age threshold, in days.
     * @return int Total number of carts deleted.
     */
    public function delete_expired( int $days ): int {
        global $wpdb;

        $batch_size    = 200;
        $total_deleted = 0;

        do {
            $ids = $wpdb->get_col( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $wpdb->prepare(
                    "SELECT id FROM {$this->get_carts_table()} WHERE updated_at < DATE_SUB(NOW(), INTERVAL %d DAY) LIMIT %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                    $days,
                    $batch_size
                )
            );

            $batch_count = count( $ids );

            if ( 0 === $batch_count ) {
                break;
            }

            $ids_placeholder = implode( ',', array_fill( 0, $batch_count, '%d' ) );

            $wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
                // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare -- $ids_placeholder's %d count matches $ids' size, built just above; the sniff can't see the interpolated placeholder count statically.
                $wpdb->prepare( "DELETE FROM {$this->get_cart_items_table()} WHERE cart_id IN ({$ids_placeholder})", $ids )
            );
            $wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
                // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare -- $ids_placeholder's %d count matches $ids' size, built just above; the sniff can't see the interpolated placeholder count statically.
                $wpdb->prepare( "DELETE FROM {$this->get_carts_table()} WHERE id IN ({$ids_placeholder})", $ids )
            );

            $total_deleted += $batch_count;
        } while ( $batch_count === $batch_size );

        return $total_deleted;
    }
}
