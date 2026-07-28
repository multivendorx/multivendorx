<?php
/**
 * OrderRepositoryInterface class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Order\Domain;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Order module OrderRepositoryInterface.
 *
 * The contract Application\OrderService depends on — bound to a concrete
 * implementation only in Module::wire_services() (via VuloCart's own
 * ServiceContainer), same seam every other *RepositoryInterface in this
 * codebase already establishes.
 *
 * @class       OrderRepositoryInterface interface
 * @version     1.0.0
 * @author      MultiVendorX
 */
interface OrderRepositoryInterface {

    /**
     * Finds one order by id, with its items loaded.
     *
     * @param int $id Order id.
     * @return Order|null Null if no order with this id exists.
     */
    public function find( int $id ): ?Order;

    /**
     * Finds one order by its human-facing order number and access token —
     * the guest order-tracking lookup.
     *
     * @param string $order_number Human-facing order identifier.
     * @param string $access_token Opaque buyer-held access token.
     * @return Order|null Null if no order matches both values.
     */
    public function find_by_number_and_token( string $order_number, string $access_token ): ?Order;

    /**
     * Returns a page of orders, optionally filtered.
     *
     * @param array{page?: int, per_page?: int, status?: string, search?: string} $args Pagination/filter args.
     * @return array{data: Order[], total: int}
     */
    public function paginate( array $args = array() ): array;

    /**
     * Persists a new order (without items — see insert_item()).
     *
     * @param Order $order An order with $id === null.
     * @return Order The same order, with $id (and timestamps) populated.
     */
    public function insert( Order $order ): Order;

    /**
     * Persists changes to an existing order (status, etc.).
     *
     * @param Order $order An order with a non-null $id.
     * @return Order The same order, with $updated_at refreshed.
     */
    public function update( Order $order ): Order;

    /**
     * Persists a new line item under an order.
     *
     * @param OrderItem $item An item with $id === null.
     * @return OrderItem The same item, with $id (and timestamps) populated.
     */
    public function insert_item( OrderItem $item ): OrderItem;
}
