<?php
/**
 * CartService class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Cart\Application;

use VuloCart\Application\AssetService;
use VuloCart\Cart\Domain\Cart;
use VuloCart\Cart\Domain\CartItem;
use VuloCart\Cart\Domain\CartRepositoryInterface;
use VuloCart\Events\EventDispatcher;
use VuloCart\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Cart module CartService.
 *
 * Where Cart business logic actually lives — Rest calls only this class,
 * mirroring VuloCart\Application\AssetService's role for Assets. Depends
 * on the core plugin's AssetService (not the asset repository directly)
 * so an added line item's price/currency is snapshotted through the same
 * business rules any other Asset consumer goes through.
 *
 * @class       CartService class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class CartService {

    /**
     * The bound repository implementation.
     *
     * @var CartRepositoryInterface Resolved via VuloCart's ServiceContainer, not `new`d directly.
     */
    private $repository;

    /**
     * Used to validate an asset exists and to snapshot its current price.
     *
     * @var AssetService
     */
    private $asset_service;

    /**
     * Broadcasts what happened after each mutation.
     *
     * @var EventDispatcher
     */
    private $events;

    /**
     * CartService constructor.
     *
     * @param CartRepositoryInterface $repository    Resolved via VuloCart's ServiceContainer, not `new`d directly.
     * @param AssetService            $asset_service  Used to validate an asset exists and to snapshot its current price.
     * @param EventDispatcher         $events         Broadcasts what happened; never decides what should happen.
     */
    public function __construct( CartRepositoryInterface $repository, AssetService $asset_service, EventDispatcher $events ) {
        $this->repository    = $repository;
        $this->asset_service = $asset_service;
        $this->events        = $events;
    }

    /**
     * Finds a cart by token without creating one — used for read-only
     * lookups (e.g. GET /cart for a token that was never actually used to
     * add anything) so an anonymous page view doesn't write a row.
     *
     * @param string $token Opaque client-held cart identity.
     * @return Cart|null
     */
    public function find_cart( $token ) {
        return $this->repository->find_by_token( $token );
    }

    /**
     * Finds a cart by token, creating an empty one if none exists yet.
     *
     * @param string $token Opaque client-held cart identity.
     * @return Cart
     */
    public function get_or_create_cart( $token ) {
        $cart = $this->repository->find_by_token( $token );

        if ( $cart ) {
            return $cart;
        }

        $cart = new Cart( null, $token, Utill::SETTINGS_DEFAULTS['default_currency'] );

        return $this->repository->insert( $cart );
    }

    /**
     * Adds a quantity of an asset to a cart, or increments an existing
     * line item for the same asset. Throws if the asset doesn't exist —
     * the caller (Rest) turns that into a 400 WP_Error rather than
     * silently adding a bogus line item.
     *
     * @param string $token    Opaque client-held cart identity.
     * @param int    $asset_id VuloCart\Domain\Asset\Asset id.
     * @param int    $quantity Quantity to add (must be >= 1).
     * @return Cart
     * @throws \InvalidArgumentException If no asset with $asset_id exists.
     */
    public function add_item( $token, $asset_id, $quantity ) {
        $asset = $this->asset_service->get_asset( $asset_id );

        if ( ! $asset ) {
            throw new \InvalidArgumentException( 'Unknown asset.' );
        }

        $cart     = $this->get_or_create_cart( $token );
        $existing = $this->repository->find_item( $cart->id, $asset_id );

        if ( $existing ) {
            $existing->quantity += $quantity;
            $this->repository->update_item( $existing );
        } else {
            $item = new CartItem(
                null,
                $cart->id,
                $asset_id,
                $quantity,
                null === $asset->price ? 0.0 : $asset->price,
                $asset->currency ? $asset->currency : $cart->currency
            );

            $this->repository->insert_item( $item );
        }

        $this->repository->touch( $cart->id );
        $this->events->dispatch( 'cart_updated', array( 'cart_token' => $token ) );

        return $this->repository->find_by_token( $token );
    }

    /**
     * Sets a line item's quantity, removing it entirely if the new
     * quantity is zero or less.
     *
     * @param string $token    Opaque client-held cart identity.
     * @param int    $item_id  Line item id.
     * @param int    $quantity New quantity.
     * @return Cart
     */
    public function update_item_quantity( $token, $item_id, $quantity ) {
        $cart = $this->get_or_create_cart( $token );

        if ( $quantity <= 0 ) {
            $this->repository->delete_item( $cart->id, $item_id );
        } else {
            foreach ( $cart->items as $item ) {
                if ( $item->id === $item_id ) {
                    $item->quantity = $quantity;
                    $this->repository->update_item( $item );
                    break;
                }
            }
        }

        $this->repository->touch( $cart->id );
        $this->events->dispatch( 'cart_updated', array( 'cart_token' => $token ) );

        return $this->repository->find_by_token( $token );
    }

    /**
     * Removes one line item from a cart.
     *
     * @param string $token   Opaque client-held cart identity.
     * @param int    $item_id Line item id.
     * @return Cart
     */
    public function remove_item( $token, $item_id ) {
        $cart = $this->get_or_create_cart( $token );

        $this->repository->delete_item( $cart->id, $item_id );
        $this->repository->touch( $cart->id );
        $this->events->dispatch( 'cart_updated', array( 'cart_token' => $token ) );

        return $this->repository->find_by_token( $token );
    }

    /**
     * Removes every line item from a cart.
     *
     * @param string $token Opaque client-held cart identity.
     * @return Cart
     */
    public function clear_cart( $token ) {
        $cart = $this->get_or_create_cart( $token );

        $this->repository->delete_items( $cart->id );
        $this->repository->touch( $cart->id );
        $this->events->dispatch( 'cart_updated', array( 'cart_token' => $token ) );

        return $this->repository->find_by_token( $token );
    }

    /**
     * Computes a cart's totals.
     *
     * `total` === `subtotal` today — there is no tax or shipping engine
     * yet (both are separate, not-yet-built modules per the vision), so
     * this deliberately doesn't fake a tax/shipping figure; once those
     * exist, this method is where they'd be added in.
     *
     * @param Cart $cart Cart to total.
     * @return array{currency: string|null, item_count: int, subtotal: float, total: float}
     */
    public function get_totals( Cart $cart ) {
        $subtotal   = 0.0;
        $item_count = 0;

        foreach ( $cart->items as $item ) {
            $subtotal   += $item->unit_price * $item->quantity;
            $item_count += $item->quantity;
        }

        return array(
            'currency'   => $cart->currency,
            'item_count' => $item_count,
            'subtotal'   => round( $subtotal, 2 ),
            'total'      => round( $subtotal, 2 ),
        );
    }
}
