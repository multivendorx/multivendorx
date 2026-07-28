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
            (int) $row['asset_id'],
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
     * Finds the line item for a given asset already in a cart, if any.
     *
     * @param int $cart_id  Owning cart id.
     * @param int $asset_id VuloCart\Domain\Asset\Asset id.
     * @return CartItem|null
     */
    public function find_item( int $cart_id, int $asset_id ): ?CartItem {
        global $wpdb;

        $row = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM {$this->get_cart_items_table()} WHERE cart_id = %d AND asset_id = %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $cart_id,
                $asset_id
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
                'cart_id'    => $item->cart_id,
                'asset_id'   => $item->asset_id,
                'quantity'   => $item->quantity,
                'unit_price' => $item->unit_price,
                'currency'   => $item->currency,
                'meta'       => wp_json_encode( $item->meta ),
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
}
