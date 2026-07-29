<?php
/**
 * OrderEmails class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Notifications;

use VuloCart\Utill;

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
 * `vulocart_order_payment_status_changed`/
 * `vulocart_order_fulfillment_status_changed` only ever fire when the
 * Order module itself is active and dispatching them. Order used to have
 * one flat `status`; now that it's split into `payment_status`/
 * `fulfillment_status` (PaymentStatus.php's/FulfillmentStatus.php's own
 * docblocks), this class listens to both change events and sends an
 * appropriately-worded email for whichever one fired, both still gated
 * behind the same `send_status_update_email` setting.
 *
 * The Settings screen's Email tab (src/settings/Email.ts) controls both
 * whether each email actually sends (`send_order_confirmation_email`/
 * `send_status_update_email`) and the From address used
 * (`notification_from_email`) — read fresh on every send rather than
 * cached, since this class has no other lifecycle hook to invalidate a
 * cached copy on save.
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
        add_action( 'vulocart_order_fulfillment_status_changed', array( $this, 'send_fulfillment_status_update' ) );
        add_action( 'vulocart_order_payment_status_changed', array( $this, 'send_payment_status_update' ) );
    }

    /**
     * Reads the stored settings option, defaults filled in — a small,
     * local copy of RestAPI\Controllers\Settings::get_stored_settings()
     * rather than a shared helper, since that method is `private` on a
     * REST controller with a different lifecycle/responsibility.
     *
     * @return array Stored settings, defaults filled in for any never-saved key.
     */
    private function get_settings(): array {
        return wp_parse_args( get_option( Utill::SETTINGS_KEY, array() ), Utill::SETTINGS_DEFAULTS );
    }

    /**
     * `wp_mail()`'s optional headers array, carrying a `From:` header when
     * the Email tab's `notification_from_email` is set — omitted entirely
     * when blank so `wp_mail()` falls back to its own site-default sender
     * rather than this class asserting an empty/invalid From address.
     *
     * @param array $settings Stored settings, from get_settings().
     * @return string[]
     */
    private function get_mail_headers( array $settings ): array {
        if ( empty( $settings['notification_from_email'] ) ) {
            return array();
        }

        return array( sprintf( 'From: %s', sanitize_email( $settings['notification_from_email'] ) ) );
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

        $settings = $this->get_settings();

        if ( empty( $settings['send_order_confirmation_email'] ) ) {
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

        wp_mail( $order->customer_email, $subject, $body, $this->get_mail_headers( $settings ) );
    }

    /**
     * Sends the buyer a notice whenever an admin changes their order's
     * fulfillment status (Rest::update_item()/bulk_update_fulfillment_status())
     * — never fires for the initial pending status, since
     * create_from_cart() sets that directly rather than going through
     * update_fulfillment_status().
     *
     * @param array{order: object} $payload Order\Domain\Order under the 'order' key.
     * @return void
     */
    public function send_fulfillment_status_update( $payload ) {
        $this->send_status_update_email(
            $payload['order'],
            /* translators: 1: customer name or "there", 2: order number, 3: new fulfillment status. */
            __( "Hi %1\$s,\n\nYour order %2\$s fulfillment status is now: %3\$s.", 'vulocart' ),
            $payload['order']->fulfillment_status
        );
    }

    /**
     * Sends the buyer a notice whenever an admin changes their order's
     * payment status (Rest::update_item()/bulk_update_payment_status()/
     * refund_item()) — never fires for the initial pending status.
     *
     * @param array{order: object} $payload Order\Domain\Order under the 'order' key.
     * @return void
     */
    public function send_payment_status_update( $payload ) {
        $this->send_status_update_email(
            $payload['order'],
            /* translators: 1: customer name or "there", 2: order number, 3: new payment status. */
            __( "Hi %1\$s,\n\nYour order %2\$s payment status is now: %3\$s.", 'vulocart' ),
            $payload['order']->payment_status
        );
    }

    /**
     * Shared body for send_fulfillment_status_update()/
     * send_payment_status_update() — same settings gate, same
     * silent-no-op-without-an-email rule, only the (already fully
     * translated, %1$s/%2$s/%3$s-placeholdered) body sentence and status
     * word differ.
     *
     * @param object $order         Order\Domain\Order.
     * @param string $body_template Translated body string with %1$s/%2$s/%3$s placeholders for name/order number/status.
     * @param string $status        The new status value to report.
     * @return void
     */
    private function send_status_update_email( $order, string $body_template, string $status ): void {
        if ( empty( $order->customer_email ) ) {
            return;
        }

        $settings = $this->get_settings();

        if ( empty( $settings['send_status_update_email'] ) ) {
            return;
        }

        $subject = sprintf(
        /* translators: %s: order number, e.g. VC-000042. */
            __( 'Update on your order %s', 'vulocart' ),
            $order->order_number
        );

        $body = sprintf(
            $body_template,
            $order->customer_name ? $order->customer_name : __( 'there', 'vulocart' ),
            $order->order_number,
            $status
        );

        wp_mail( $order->customer_email, $subject, $body, $this->get_mail_headers( $settings ) );
    }
}
