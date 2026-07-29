<?php
/**
 * OrderService class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Order\Application;

use VuloCart\Application\OfferingService;
use VuloCart\Cart\Application\CartService;
use VuloCart\Events\EventDispatcher;
use VuloCart\Order\Domain\FulfillmentStatus;
use VuloCart\Order\Domain\Order;
use VuloCart\Order\Domain\OrderItem;
use VuloCart\Order\Domain\OrderRepositoryInterface;
use VuloCart\Order\Domain\PaymentStatus;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Order module OrderService.
 *
 * Where Order business logic actually lives — Rest calls only this class.
 * Depends on the Cart module's own CartService (to read + clear the
 * source cart) and the core plugin's OfferingService (to snapshot each line
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
     * @var OfferingService
     */
    private $offering_service;

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
     * @param OfferingService          $offering_service  Used to snapshot each line item's title at order-creation time.
     * @param EventDispatcher          $events         Broadcasts what happened; never decides what should happen.
     */
    public function __construct(
        OrderRepositoryInterface $repository,
        CartService $cart_service,
        OfferingService $offering_service,
        EventDispatcher $events
    ) {
        $this->repository       = $repository;
        $this->cart_service     = $cart_service;
        $this->offering_service = $offering_service;
        $this->events           = $events;
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
     * @param array{page?: int, per_page?: int, payment_status?: string, fulfillment_status?: string, search?: string, date_from?: string, date_to?: string} $args Pagination/filter args, already sanitized by the caller.
     * @return array{data: Order[], total: int}
     */
    public function list_orders( $args = array() ) {
        return $this->repository->paginate( $args );
    }

    /**
     * Counts orders in each FulfillmentStatus bucket — backs the admin
     * grid's "saved view" tabs (Rest::get_items()).
     *
     * @return array<string, int>
     */
    public function count_orders_by_fulfillment_status() {
        return $this->repository->count_by_fulfillment_status();
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
            PaymentStatus::PENDING,
            FulfillmentStatus::PENDING,
            $cart->currency,
            $totals['subtotal'],
            $totals['total']
        );

        $order = $this->repository->insert( $order );

        foreach ( $cart->items as $cart_item ) {
            $offering = $this->offering_service->get_offering( $cart_item->offering_id );

            $this->repository->insert_item(
                new OrderItem(
                    null,
                    $order->id,
                    $cart_item->offering_id,
                    $offering ? $offering->title : '',
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
     * Creates a draft order directly from a merchant-picked list of
     * offerings — no cart involved. Backs the admin grid's "Add New" page
     * (OrderAdd.tsx) and the "Draft Orders" submenu
     * (`FulfillmentStatus::DRAFT`) — an admin building an order on a
     * customer's behalf (phone/email order) before it's actually placed.
     * Same item-snapshotting shape as create_from_cart(), just sourced
     * from a plain `{offering_id, quantity}[]` array instead of a Cart.
     *
     * @param array{offering_id: int, quantity: int}[] $items          Offerings and quantities to snapshot onto the order.
     * @param string|null                              $customer_email Buyer's email, if given.
     * @param string|null                              $customer_name  Buyer's display name, if given.
     * @return Order
     * @throws \InvalidArgumentException If $items is empty or references no valid offering.
     */
    public function create_manual_order( array $items, $customer_email = null, $customer_name = null ) {
        if ( empty( $items ) ) {
            throw new \InvalidArgumentException( 'At least one item is required.' );
        }

        $snapshots = array();
        $subtotal  = 0.0;
        $currency  = null;

        foreach ( $items as $item ) {
            $offering = $this->offering_service->get_offering( absint( $item['offering_id'] ) );

            if ( ! $offering ) {
                continue;
            }

            $quantity   = max( 1, absint( $item['quantity'] ) );
            $unit_price = null === $offering->price ? 0.0 : $offering->price;
            $currency   = $currency ?? $offering->currency;

            $snapshots[] = array(
                'offering_id' => $offering->id,
                'title'       => $offering->title,
                'quantity'    => $quantity,
                'unit_price'  => $unit_price,
                'currency'    => $currency,
            );

            $subtotal += $unit_price * $quantity;
        }

        if ( empty( $snapshots ) ) {
            throw new \InvalidArgumentException( 'None of the given items reference a valid offering.' );
        }

        $order = new Order(
            null,
            null,
            wp_generate_uuid4(),
            null,
            $customer_email,
            $customer_name,
            PaymentStatus::PENDING,
            FulfillmentStatus::DRAFT,
            $currency,
            $subtotal,
            $subtotal
        );

        $order = $this->repository->insert( $order );

        foreach ( $snapshots as $snapshot ) {
            $this->repository->insert_item(
                new OrderItem(
                    null,
                    $order->id,
                    $snapshot['offering_id'],
                    $snapshot['title'],
                    $snapshot['quantity'],
                    $snapshot['unit_price'],
                    $snapshot['currency']
                )
            );
        }

        $order = $this->repository->find( $order->id );

        $this->events->dispatch( 'order_created', array( 'order' => $order ) );

        return $order;
    }

    /**
     * Transitions an order's fulfillment status and broadcasts
     * `order_fulfillment_status_changed`.
     *
     * @param int    $id     Order id.
     * @param string $status One of FulfillmentStatus's constants.
     * @return Order|null Null if no order with this id exists.
     * @throws \InvalidArgumentException If $status isn't a known FulfillmentStatus.
     */
    public function update_fulfillment_status( $id, $status ) {
        if ( ! in_array( $status, FulfillmentStatus::all(), true ) ) {
            throw new \InvalidArgumentException( 'Unknown fulfillment status.' );
        }

        $order = $this->repository->find( $id );

        if ( ! $order ) {
            return null;
        }

        $order->fulfillment_status = $status;
        $order                     = $this->repository->update( $order );

        $this->events->dispatch( 'order_fulfillment_status_changed', array( 'order' => $order ) );

        return $order;
    }

    /**
     * Transitions an order's payment status and broadcasts
     * `order_payment_status_changed` (plus `order_refunded`, matching the
     * vision's explicit "RefundIssued" event, when the new status is
     * 'refunded'). Prefer refund_order() when transitioning to 'refunded'
     * with a specific amount — this method alone doesn't touch
     * `refunded_amount`.
     *
     * @param int    $id     Order id.
     * @param string $status One of PaymentStatus's constants.
     * @return Order|null Null if no order with this id exists.
     * @throws \InvalidArgumentException If $status isn't a known PaymentStatus.
     */
    public function update_payment_status( $id, $status ) {
        if ( ! in_array( $status, PaymentStatus::all(), true ) ) {
            throw new \InvalidArgumentException( 'Unknown payment status.' );
        }

        $order = $this->repository->find( $id );

        if ( ! $order ) {
            return null;
        }

        $order->payment_status = $status;
        $order                 = $this->repository->update( $order );

        $this->events->dispatch( 'order_payment_status_changed', array( 'order' => $order ) );

        if ( PaymentStatus::REFUNDED === $status ) {
            $this->events->dispatch( 'order_refunded', array( 'order' => $order ) );
        }

        return $order;
    }

    /**
     * Issues a refund: sets payment_status to 'refunded' and records the
     * refunded amount (partial or full — not validated against $total
     * here, since a merchant may legitimately record a refund alongside a
     * restocking fee or other adjustment that changes the effective
     * amount).
     *
     * @param int   $id     Order id.
     * @param float $amount Amount refunded.
     * @return Order|null Null if no order with this id exists.
     */
    public function refund_order( $id, $amount ) {
        $order = $this->repository->find( $id );

        if ( ! $order ) {
            return null;
        }

        $order->payment_status  = PaymentStatus::REFUNDED;
        $order->refunded_amount = (float) $amount;
        $order                  = $this->repository->update( $order );

        $this->events->dispatch( 'order_payment_status_changed', array( 'order' => $order ) );
        $this->events->dispatch( 'order_refunded', array( 'order' => $order ) );

        return $order;
    }

    /**
     * Transitions many orders to the same new fulfillment status in one
     * call — backs the admin grid's bulk-action dropdown (OrdersList.tsx).
     * Reuses update_fulfillment_status() per id, same reasoning
     * update_status() used to document: every transition goes through the
     * exact same single-order code path regardless of how it was
     * triggered.
     *
     * @param int[]  $ids    Order ids to transition.
     * @param string $status One of FulfillmentStatus's constants.
     * @return int Number of orders actually found and updated.
     * @throws \InvalidArgumentException If $status isn't a known FulfillmentStatus.
     */
    public function bulk_update_fulfillment_status( array $ids, string $status ): int {
        if ( ! in_array( $status, FulfillmentStatus::all(), true ) ) {
            throw new \InvalidArgumentException( 'Unknown fulfillment status.' );
        }

        $updated = 0;

        foreach ( $ids as $id ) {
            if ( $this->update_fulfillment_status( (int) $id, $status ) ) {
                ++$updated;
            }
        }

        return $updated;
    }

    /**
     * Transitions many orders to the same new payment status in one call —
     * same reasoning as bulk_update_fulfillment_status().
     *
     * @param int[]  $ids    Order ids to transition.
     * @param string $status One of PaymentStatus's constants.
     * @return int Number of orders actually found and updated.
     * @throws \InvalidArgumentException If $status isn't a known PaymentStatus.
     */
    public function bulk_update_payment_status( array $ids, string $status ): int {
        if ( ! in_array( $status, PaymentStatus::all(), true ) ) {
            throw new \InvalidArgumentException( 'Unknown payment status.' );
        }

        $updated = 0;

        foreach ( $ids as $id ) {
            if ( $this->update_payment_status( (int) $id, $status ) ) {
                ++$updated;
            }
        }

        return $updated;
    }
}
