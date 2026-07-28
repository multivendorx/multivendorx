<?php
/**
 * OrderEmails class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Notifications;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart OrderEmails.
 *
 * A pure listener on the events modules/Order/Application/OrderService.php
 * already broadcasts via Events\EventDispatcher — this class holds no
 * order business logic itself (php-wordpress.md's "hooks are transport,
 * not logic" rule), it only reacts once OrderService has already decided
 * an order was created or changed status. Registered unconditionally from
 * VuloCart::init_classes() rather than gated on the Order module being
 * active — safe either way, since `vulocart_order_created`/
 * `vulocart_order_status_changed` only ever fire when the Order module
 * itself is active and dispatching them.
 *
 * @class       OrderEmails class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class OrderEmails {

    /**
     * OrderEmails constructor.
     */
    public function __construct() {
        add_action( 'vulocart_order_created', array( $this, 'send_order_confirmation' ) );
        add_action( 'vulocart_order_status_changed', array( $this, 'send_status_update' ) );
    }

    /**
     * Renders a line-item list as plain text for the email body.
     *
     * @param object[] $items Order\Domain\OrderItem[] belonging to the order.
     * @return string
     */
    private function format_items( $items ): string {
        $lines = array();

        foreach ( $items as $item ) {
            $lines[] = sprintf(
                '  - %s x%d (%s %s)',
                $item->title,
                $item->quantity,
                number_format( (float) $item->unit_price * $item->quantity, 2 ),
                $item->currency
            );
        }

        return implode( "\n", $lines );
    }

    /**
     * Sends the buyer a confirmation email right after an order is placed.
     * Silently does nothing for orders with no email on file — a cart
     * checked out with no customer_email is a valid, real state
     * (Rest::create_item()'s `customer_email` param is optional), not an
     * error to log.
     *
     * @param array{order: object} $payload Order\Domain\Order under the 'order' key.
     * @return void
     */
    public function send_order_confirmation( $payload ) {
        $order = $payload['order'];

        if ( empty( $order->customer_email ) ) {
            return;
        }

        $subject = sprintf(
        /* translators: %s: order number, e.g. VC-000042. */
            __( 'Order %s confirmed', 'vulocart' ),
            $order->order_number
        );

        $body = sprintf(
            /* translators: 1: customer name or "there", 2: order number, 3: line items, 4: total amount, 5: currency, 6: order number (repeated for tracking), 7: access token. */
            __(
                "Hi %1\$s,\n\nThanks for your order! Here's what you ordered:\n\n%3\$s\n\nTotal: %4\$s %5\$s\n\nYour order is currently pending review. You can check on its status any time using your order number and access token below:\n\nOrder number: %6\$s\nAccess token: %7\$s",
                'vulocart'
            ),
            $order->customer_name ? $order->customer_name : __( 'there', 'vulocart' ),
            $order->order_number,
            $this->format_items( $order->items ),
            number_format( (float) $order->total, 2 ),
            $order->currency,
            $order->order_number,
            $order->access_token
        );

        wp_mail( $order->customer_email, $subject, $body );
    }

    /**
     * Sends the buyer a notice whenever an admin changes their order's
     * status (Rest::update_item()/bulk_update_status()) — never fires for
     * the initial pending status, since create_from_cart() sets that
     * directly rather than going through update_status().
     *
     * @param array{order: object} $payload Order\Domain\Order under the 'order' key.
     * @return void
     */
    public function send_status_update( $payload ) {
        $order = $payload['order'];

        if ( empty( $order->customer_email ) ) {
            return;
        }

        $subject = sprintf(
        /* translators: %s: order number, e.g. VC-000042. */
            __( 'Update on your order %s', 'vulocart' ),
            $order->order_number
        );

        $body = sprintf(
            /* translators: 1: customer name or "there", 2: order number, 3: new order status. */
            __( "Hi %1\$s,\n\nYour order %2\$s is now: %3\$s.", 'vulocart' ),
            $order->customer_name ? $order->customer_name : __( 'there', 'vulocart' ),
            $order->order_number,
            $order->status
        );

        wp_mail( $order->customer_email, $subject, $body );
    }
}
