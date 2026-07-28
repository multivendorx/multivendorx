<?php
/**
 * OrderService class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Order\Application;

use VuloCart\Application\AssetService;
use VuloCart\Cart\Application\CartService;
use VuloCart\Events\EventDispatcher;
use VuloCart\Order\Domain\Order;
use VuloCart\Order\Domain\OrderItem;
use VuloCart\Order\Domain\OrderRepositoryInterface;
use VuloCart\Order\Domain\OrderStatus;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Order module OrderService.
 *
 * Where Order business logic actually lives — Rest calls only this class.
 * Depends on the Cart module's own CartService (to read + clear the
 * source cart) and the core plugin's AssetService (to snapshot each line
 * item's title at order-creation time) — a real, deliberate cross-module
 * dependency: Order genuinely cannot function without Cart, which is why
 * Module::is_compatible() gates this module's own availability on Cart
 * being active, and Module's own constructor defers building this class
 * until `vulocart_loaded` (after every module in this pass — including
 * Cart — has already been constructed), rather than assuming any
 * particular module discovery/activation order.
 *
 * @class       OrderService class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class OrderService {

    /**
     * The bound repository implementation.
     *
     * @var OrderRepositoryInterface Resolved via VuloCart's ServiceContainer, not `new`d directly.
     */
    private $repository;

    /**
     * Used to read a cart's current items and clear it once converted.
     *
     * @var CartService
     */
    private $cart_service;

    /**
     * Used to snapshot each line item's title at order-creation time.
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
     * OrderService constructor.
     *
     * @param OrderRepositoryInterface $repository    Resolved via VuloCart's ServiceContainer, not `new`d directly.
     * @param CartService              $cart_service   Used to read a cart's current items and clear it once converted.
     * @param AssetService             $asset_service  Used to snapshot each line item's title at order-creation time.
     * @param EventDispatcher          $events         Broadcasts what happened; never decides what should happen.
     */
    public function __construct(
        OrderRepositoryInterface $repository,
        CartService $cart_service,
        AssetService $asset_service,
        EventDispatcher $events
    ) {
        $this->repository    = $repository;
        $this->cart_service  = $cart_service;
        $this->asset_service = $asset_service;
        $this->events        = $events;
    }

    /**
     * Fetches one order by id, with its items loaded.
     *
     * @param int $id Order id.
     * @return Order|null
     */
    public function get_order( $id ) {
        return $this->repository->find( $id );
    }

    /**
     * The guest order-tracking lookup — an order number alone isn't
     * enough (it's sequential and guessable), the access_token is the
     * actual authorization check.
     *
     * @param string $order_number Human-facing order identifier.
     * @param string $access_token Opaque buyer-held access token.
     * @return Order|null
     */
    public function track_order( $order_number, $access_token ) {
        return $this->repository->find_by_number_and_token( $order_number, $access_token );
    }

    /**
     * Returns a page of orders, optionally filtered.
     *
     * @param array{page?: int, per_page?: int, status?: string, search?: string} $args Pagination/filter args, already sanitized by the caller.
     * @return array{data: Order[], total: int}
     */
    public function list_orders( $args = array() ) {
        return $this->repository->paginate( $args );
    }

    /**
     * Converts a cart into a placed order: snapshots every line item
     * (title, price, currency), persists the order, clears the source
     * cart, and broadcasts `order_created`.
     *
     * @param string      $cart_token     Opaque client-held cart identity.
     * @param string|null $customer_email Buyer's email, if given.
     * @param string|null $customer_name  Buyer's display name, if given.
     * @return Order
     * @throws \InvalidArgumentException If the cart doesn't exist or has no items.
     */
    public function create_from_cart( $cart_token, $customer_email = null, $customer_name = null ) {
        $cart = $this->cart_service->find_cart( $cart_token );

        if ( ! $cart || empty( $cart->items ) ) {
            throw new \InvalidArgumentException( 'Cart is empty or does not exist.' );
        }

        $totals = $this->cart_service->get_totals( $cart );

        $order = new Order(
            null,
            null,
            wp_generate_uuid4(),
            $cart_token,
            $customer_email,
            $customer_name,
            OrderStatus::PENDING,
            $cart->currency,
            $totals['subtotal'],
            $totals['total']
        );

        $order = $this->repository->insert( $order );

        foreach ( $cart->items as $cart_item ) {
            $asset = $this->asset_service->get_asset( $cart_item->asset_id );

            $this->repository->insert_item(
                new OrderItem(
                    null,
                    $order->id,
                    $cart_item->asset_id,
                    $asset ? $asset->title : '',
                    $cart_item->quantity,
                    $cart_item->unit_price,
                    $cart_item->currency
                )
            );
        }

        $this->cart_service->clear_cart( $cart_token );

        $order = $this->repository->find( $order->id );

        $this->events->dispatch( 'order_created', array( 'order' => $order ) );

        return $order;
    }

    /**
     * Transitions an order to a new status and broadcasts
     * `order_status_changed` (plus `order_refunded`, matching the vision's
     * explicit "RefundIssued" event, when the new status is 'refunded').
     *
     * @param int    $id     Order id.
     * @param string $status One of OrderStatus's constants.
     * @return Order|null Null if no order with this id exists.
     * @throws \InvalidArgumentException If $status isn't a known OrderStatus.
     */
    public function update_status( $id, $status ) {
        if ( ! in_array( $status, OrderStatus::all(), true ) ) {
            throw new \InvalidArgumentException( 'Unknown order status.' );
        }

        $order = $this->repository->find( $id );

        if ( ! $order ) {
            return null;
        }

        $order->status = $status;
        $order         = $this->repository->update( $order );

        $this->events->dispatch( 'order_status_changed', array( 'order' => $order ) );

        if ( OrderStatus::REFUNDED === $status ) {
            $this->events->dispatch( 'order_refunded', array( 'order' => $order ) );
        }

        return $order;
    }

    /**
     * Transitions many orders to the same new status in one call — backs
     * the admin grid's bulk-action dropdown (Orders.tsx). Reuses
     * update_status() per id rather than a dedicated bulk repository
     * method, so every status transition (validation, the
     * order_status_changed/order_refunded events) goes through the exact
     * same single-order code path regardless of how it was triggered.
     *
     * @param int[]  $ids    Order ids to transition.
     * @param string $status One of OrderStatus's constants.
     * @return int Number of orders actually found and updated.
     * @throws \InvalidArgumentException If $status isn't a known OrderStatus.
     */
    public function bulk_update_status( array $ids, string $status ): int {
        if ( ! in_array( $status, OrderStatus::all(), true ) ) {
            throw new \InvalidArgumentException( 'Unknown order status.' );
        }

        $updated = 0;

        foreach ( $ids as $id ) {
            if ( $this->update_status( (int) $id, $status ) ) {
                ++$updated;
            }
        }

        return $updated;
    }
}
