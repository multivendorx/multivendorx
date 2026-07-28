<?php
/**
 * CartRepositoryInterface class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Cart\Domain;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Cart module CartRepositoryInterface.
 *
 * The contract Application\CartService depends on — bound to a concrete
 * implementation only in Module::init_classes() (via VuloCart's own
 * ServiceContainer), same seam VuloCart\Domain\Asset\AssetRepositoryInterface
 * already establishes for the storage-engine-is-replaceable principle.
 *
 * @class       CartRepositoryInterface interface
 * @version     1.0.0
 * @author      MultiVendorX
 */
interface CartRepositoryInterface {

    /**
     * Finds one cart by its client-held token, with its items loaded.
     *
     * @param string $token Opaque client-held cart identity.
     * @return Cart|null Null if no cart with this token exists.
     */
    public function find_by_token( string $token ): ?Cart;

    /**
     * Persists a new, empty cart.
     *
     * @param Cart $cart A cart with $id === null.
     * @return Cart The same cart, with $id (and timestamps) populated.
     */
    public function insert( Cart $cart ): Cart;

    /**
     * Finds the line item for a given asset already in a cart, if any —
     * lets Application\CartService increment quantity instead of inserting
     * a duplicate row for the same asset.
     *
     * @param int $cart_id  Owning cart id.
     * @param int $asset_id VuloCart\Domain\Asset\Asset id.
     * @return CartItem|null
     */
    public function find_item( int $cart_id, int $asset_id ): ?CartItem;

    /**
     * Persists a new line item.
     *
     * @param CartItem $item An item with $id === null.
     * @return CartItem The same item, with $id (and timestamps) populated.
     */
    public function insert_item( CartItem $item ): CartItem;

    /**
     * Persists changes (typically just quantity) to an existing line item.
     *
     * @param CartItem $item An item with a non-null $id.
     * @return CartItem The same item, with $updated_at refreshed.
     */
    public function update_item( CartItem $item ): CartItem;

    /**
     * Deletes one line item from a cart.
     *
     * @param int $cart_id Owning cart id.
     * @param int $item_id Item id.
     * @return bool True if a row was deleted.
     */
    public function delete_item( int $cart_id, int $item_id ): bool;

    /**
     * Deletes every line item from a cart — used by "clear cart".
     *
     * @param int $cart_id Owning cart id.
     * @return void
     */
    public function delete_items( int $cart_id ): void;

    /**
     * Bumps a cart's `updated_at` — called after any item mutation so a
     * cart's own timestamp reflects its contents changing, without every
     * caller needing to re-fetch and re-save the whole Cart entity just to
     * touch one column.
     *
     * @param int $cart_id Cart id.
     * @return void
     */
    public function touch( int $cart_id ): void;
}
