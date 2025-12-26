<?php
/**
 * MultiVendorX Notifications class
 *
 * @package MultiVendorX
 */
namespace MultiVendorX\Notifications;

use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Notifications Class.
 *
 * This class handles notifications related functionality.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Notifications {

    /**
     * Events
     *
     * @var array
     */
    public $events = array();

    /**
     * Constructor
     *
     * @return void
     */
    public function __construct() {
        add_action( 'init', array( $this, 'register_notification_hooks' ) );
        $this->insert_system_events();
        add_action( 'multivendorx_clear_notifications', array( $this, 'multivendorx_clear_notifications' ) );
    }

    /**
     * Register notification hooks
     *
     * @return void
     */
    public function register_notification_hooks() {
        foreach ( $this->events as $event => $value ) {
            add_action( "multivendorx_notify_{$event}", array( $this, 'trigger_notifications' ), 10, 2 );
        }
    }

    /**
     * Insert system events
     *
     * @return void
     */
    public function insert_system_events($new = false) {
        global $wpdb;

        $this->events = apply_filters( 'multivendorx_system_events',  array(
            // ========== STORE STATUS & LIFECYCLE ==========

			'store_pending_approval'        => array(
				'name'           => 'Store pending approval',
				'desc'           => 'A store is awaiting admin approval.',
				'admin_enabled'  => true,
				'store_enabled'  => true,
				'email_subject'  => 'Store pending approval',
				'email_body'     => 'Your store [store_name] is currently pending approval. You will be notified once it is reviewed.',
				'sms_content'    => 'Store [store_name] is pending approval.',
				'system_message' => 'Store pending approval: [store_name].',
				'tag'            => 'Store',
				'category'       => 'activity',
			),

			'store_rejected'                => array(
				'name'           => 'Store rejected',
				'desc'           => 'A store application is rejected by the admin.',
				'admin_enabled'  => true,
				'store_enabled'  => true,
				'email_subject'  => 'Store application rejected',
				'email_body'     => 'Your store [store_name] has been rejected. Please review the feedback and resubmit your application.',
				'sms_content'    => 'Store [store_name] application rejected.',
				'system_message' => 'Store rejected: [store_name].',
				'tag'            => 'Store',
				'category'       => 'activity',
			),

			'store_permanently_rejected'    => array(
				'name'           => 'Store permanently rejected',
				'desc'           => 'A store application is permanently rejected by the admin.',
				'admin_enabled'  => true,
				'store_enabled'  => true,
				'email_subject'  => 'Store application permanently rejected',
				'email_body'     => 'Your store [store_name] has been permanently rejected. Please contact support for further assistance.',
				'sms_content'    => 'Store [store_name] permanently rejected.',
				'system_message' => 'Store permanently rejected: [store_name].',
				'tag'            => 'Store',
				'category'       => 'activity',
			),

			'store_activated'               => array(
				'name'           => 'Store activated',
				'desc'           => 'A store becomes active and fully operational.',
				'admin_enabled'  => true,
				'store_enabled'  => true,
				'email_subject'  => 'Store activated',
				'email_body'     => 'Congratulations! Your store [store_name] is now active and ready to sell.',
				'sms_content'    => 'Store [store_name] is now active.',
				'system_message' => 'Store activated: [store_name].',
				'tag'            => 'Store',
				'category'       => 'activity',
			),

			'store_under_review'            => array(
				'name'           => 'Store under review',
				'desc'           => 'A store is placed under review due to compliance concerns.',
				'admin_enabled'  => true,
				'store_enabled'  => true,
				'email_subject'  => 'Store under review',
				'email_body'     => 'Your store [store_name] is currently under review. Selling and payouts are temporarily paused.',
				'sms_content'    => 'Store [store_name] is under review.',
				'system_message' => 'Store under review: [store_name].',
				'tag'            => 'Store',
				'category'       => 'activity',
			),

			'store_suspended'               => array(
				'name'           => 'Store suspended',
				'desc'           => 'A store is suspended due to policy violations.',
				'admin_enabled'  => true,
				'store_enabled'  => true,
				'email_subject'  => 'Store suspended',
				'email_body'     => 'Your store [store_name] has been suspended. Please contact support to appeal.',
				'sms_content'    => 'Store [store_name] has been suspended.',
				'system_message' => 'Store suspended: [store_name].',
				'tag'            => 'Store',
				'category'       => 'activity',
			),

			'store_permanently_deactivated' => array(
				'name'           => 'Store permanently deactivated',
				'desc'           => 'A store is permanently deactivated by the admin.',
				'admin_enabled'  => true,
				'store_enabled'  => true,
				'email_subject'  => 'Store permanently deactivated',
				'email_body'     => 'Your store [store_name] has been permanently deactivated. Your data remains available in read-only mode.',
				'sms_content'    => 'Store [store_name] permanently deactivated.',
				'system_message' => 'Store permanently deactivated: [store_name].',
				'tag'            => 'Store',
				'category'       => 'activity',
			),

            // ========== ORDER EVENTS ==========
            'new_order'                     => array(
                'name'             => 'New order placed',
                'desc'             => 'A new order is placed on the marketplace.',
                'admin_enabled'    => true,
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'New order received',
                'email_body'       => 'A new order [order_id] has been placed.',
                'sms_content'      => 'New order [order_id] received.',
                'system_message'   => 'Order [order_id] placed successfully.',
                'tag'              => 'Order',
                'category'         => 'activity',
            ),

            'order_processing'              => array(
                'name'             => 'Order processing',
                'desc'             => 'An order status is changed to processing.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Order processing started',
                'email_body'       => 'Your order [order_id] is now being processed.',
                'sms_content'      => 'Order [order_id] is now processing.',
                'system_message'   => 'Order [order_id] status: Processing.',
                'tag'              => 'Order',
                'category'         => 'activity',
            ),

            'order_completed'               => array(
                'name'             => 'Order completed',
                'desc'             => 'An order is completed successfully.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Order completed',
                'email_body'       => 'Order [order_id] has been successfully completed.',
                'sms_content'      => 'Order [order_id] completed successfully.',
                'system_message'   => 'Order [order_id] marked as completed.',
                'tag'              => 'Order',
                'category'         => 'activity',
            ),

            'order_cancelled'               => array(
                'name'             => 'Order cancelled',
                'desc'             => 'An order is cancelled by the customer or admin.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'admin_enabled'    => true,
                'email_subject'    => 'Order cancelled',
                'email_body'       => 'Order [order_id] has been cancelled.',
                'sms_content'      => 'Order [order_id] cancelled successfully.',
                'system_message'   => 'Order [order_id] cancelled.',
                'tag'              => 'Order',
                'category'         => 'activity',
            ),

            'order_refunded'                => array(
                'name'             => 'Order refunded',
                'desc'             => 'A refund is issued for an order.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Order refunded',
                'email_body'       => 'Your refund for order [order_id] has been processed.',
                'sms_content'      => 'Refund for [order_id] processed.',
                'system_message'   => 'Order [order_id] refunded.',
                'tag'              => 'Order',
                'category'         => 'activity',
            ),

            // ========== PAYMENT ==========
            'payment_received'              => array(
                'name'           => 'Payment received',
                'desc'           => 'A payment is received for an order.',
                'store_enabled'  => true,
                'admin_enabled'  => true,
                'email_subject'  => 'Payment received',
                'email_body'     => 'Payment for order [order_id] has been received successfully.',
                'sms_content'    => 'Payment received for [order_id].',
                'system_message' => 'Payment for [order_id] received.',
                'tag'            => 'Payment',
                'category'       => 'activity',
            ),

            'payout_failed'                 => array(
                'name'           => 'Payout failed',
                'desc'           => 'A payout processing attempt has failed.',
                'admin_enabled'  => true,
                'store_enabled'  => true,
                'email_subject'  => 'Payout failed',
                'email_body'     => 'Payout of [amount] for store [store_name] failed.',
                'sms_content'    => 'Payout failed for [store_name].',
                'system_message' => 'Payout error for [store_name].',
                'tag'            => 'Payment',
                'category'       => 'activity',
            ),

            // ========== REFUND ==========
            'refund_requested'              => array(
                'name'             => 'Refund requested',
                'desc'             => 'A refund request is submitted by a customer.',
                'admin_enabled'    => true,
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Refund requested',
                'email_body'       => 'A refund request has been placed for order [order_id].',
                'sms_content'      => 'Refund requested for [order_id].',
                'system_message'   => 'Refund request submitted for [order_id].',
                'tag'              => 'Refund',
                'category'         => 'activity',
            ),

            'refund_approved'               => array(
                'name'             => 'Refund approved',
                'desc'             => 'A refund request is approved by the admin.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Refund approved',
                'email_body'       => 'Your refund for order [order_id] has been approved.',
                'sms_content'      => 'Refund approved for [order_id].',
                'system_message'   => 'Refund approved for [order_id].',
                'tag'              => 'Refund',
                'category'         => 'activity',
            ),

            'refund_rejected'               => array(
                'name'             => 'Refund rejected',
                'desc'             => 'A refund request is rejected by the admin.',
                'customer_enabled' => true,
                'email_subject'    => 'Refund rejected',
                'email_body'       => 'Your refund request for order [order_id] has been rejected.',
                'sms_content'      => 'Refund request rejected for [order_id].',
                'system_message'   => 'Refund rejected for [order_id].',
                'tag'              => 'Refund',
                'category'         => 'activity',
            ),

            'refund_processed'              => array(
                'name'             => 'Refund processed',
                'desc'             => 'A refund is processed and completed successfully.',
                'admin_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Refund processed',
                'email_body'       => 'Refund for order [order_id] has been processed successfully.',
                'sms_content'      => 'Refund processed for [order_id].',
                'system_message'   => 'Refund processed successfully.',
                'tag'              => 'Refund',
                'category'         => 'activity',
            ),

            // ========== PRODUCT ==========
            'product_added'                 => array(
                'name'           => 'New product added',
                'desc'           => 'A new product is added by a store.',
                'admin_enabled'  => true,
                'store_enabled'  => true,
                'email_subject'  => 'New product added',
                'email_body'     => 'New product “[product_name]” added by [store_name].',
                'sms_content'    => 'New product “[product_name]” added by [store_name].',
                'system_message' => 'Product “[product_name]” added successfully.',
                'tag'            => 'Product',
                'category'       => 'activity',
            ),

            'product_approved'              => array(
                'name'           => 'Product approved',
                'desc'           => 'A product is approved by the admin.',
                'store_enabled'  => true,
                'email_subject'  => 'Product approved',
                'email_body'     => 'Your product “[product_name]” has been approved.',
                'sms_content'    => 'Product “[product_name]” approved.',
                'system_message' => 'Product “[product_name]” approved successfully.',
                'tag'            => 'Product',
                'category'       => 'notification',
            ),

            'product_rejected'              => array(
                'name'           => 'Product rejected',
                'desc'           => 'A product is rejected during review.',
                'store_enabled'  => true,
                'email_subject'  => 'Product rejected',
                'email_body'     => 'Your product “[product_name]” was rejected. Reason: [reason].',
                'sms_content'    => 'Product “[product_name]” rejected.',
                'system_message' => 'Product “[product_name]” rejected.',
                'tag'            => 'Product',
                'category'       => 'notification',
            ),

            'product_low_stock'             => array(
                'name'           => 'Low stock alert',
                'desc'           => 'A product stock level is detected below the set threshold.',
                'store_enabled'  => true,
                'email_subject'  => 'Low stock alert',
                'email_body'     => 'Your product “[product_name]” is running low on stock (only [quantity] left).',
                'sms_content'    => 'Low stock alert: “[product_name]” – [quantity] left.',
                'system_message' => 'Low stock alert for “[product_name]”.',
                'tag'            => 'Product',
                'category'       => 'notification',
            ),

            'product_out_of_stock'          => array(
                'name'           => 'Out of stock alert',
                'desc'           => 'A product is detected as out of stock.',
                'store_enabled'  => true,
                'email_subject'  => 'Out of stock',
                'email_body'     => 'Your product “[product_name]” is now out of stock.',
                'sms_content'    => 'Out of stock: “[product_name]”.',
                'system_message' => 'Product “[product_name]” is out of stock.',
                'tag'            => 'Product',
                'category'       => 'notification',
            ),

            // ========== REVIEWS ==========
            'product_review_received'       => array(
                'name'             => 'New product review',
                'desc'             => 'A new review is submitted for a product.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'New product review received',
                'email_body'       => '[rating]-star review received for “[store_name]” by [customer_name].',
                'sms_content'      => 'New review received for “[store_name]”.',
                'system_message'   => 'New review received for “[store_name]”.',
                'tag'              => 'Review',
                'category'         => 'notification',
            ),

            // ========== WITHDRAWALS ==========
            'withdrawal_requested'          => array(
                'name'           => 'Withdrawal requested',
                'desc'           => 'A withdrawal request is submitted by a store.',
                'admin_enabled'  => true,
                'store_enabled'  => true,
                'email_subject'  => 'Withdrawal request submitted',
                'email_body'     => 'Store [store_name] requested withdrawal of [amount].',
                'sms_content'    => 'Withdrawal request of [amount] submitted.',
                'system_message' => 'Withdrawal requested by [store_name].',
                'tag'            => 'Payment',
                'category'       => 'notification',
            ),

            'withdrawal_released'           => array(
                'name'           => 'Withdrawal released',
                'desc'           => 'A withdrawal is released successfully.',
                'store_enabled'  => true,
                'email_subject'  => 'Withdrawal released',
                'email_body'     => 'Your withdrawal has been released via [payment_processor].',
                'sms_content'    => 'Withdrawal released successfully.',
                'system_message' => 'Withdrawal released successfully.',
                'tag'            => 'Payment',
                'category'       => 'notification',
            ),

            'withdrawl_rejected'            => array(
                'name'           => 'Withdrawl rejected',
                'desc'           => 'A withdrawl request is rejected by the admin.',
                'store_enabled'  => true,
                'email_subject'  => 'Withdrawl rejected',
                'email_body'     => 'A Withdrawl of [amount] has been rejected by your administrator.',
                'sms_content'    => 'Withdrawl of [amount] rejected.',
                'system_message' => 'Withdrawl Payout rejected: [amount].',
                'tag'            => 'Payment',
                'category'       => 'activity',
            ),

            // ========== REPORT ABUSE ==========
            'report_abuse_submitted'        => array(
                'name'             => 'Report abuse submitted',
                'desc'             => 'A product is reported for abuse by a customer.',
                'admin_enabled'    => true,
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Product reported',
                'email_body'       => 'Customer reported “[product_name]” for abuse.',
                'sms_content'      => 'Product “[product_name]” reported.',
                'system_message'   => 'Abuse report for “[product_name]” received.',
                'tag'              => 'Report',
                'category'         => 'notification',
            ),

            'report_abuse_action_taken'     => array(
                'name'             => 'Report abuse resolved',
                'desc'             => 'An abuse report is reviewed and resolved by the admin.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Report resolved',
                'email_body'       => 'Admin reviewed the abuse report for “[product_name]”. Action: [action_taken].',
                'sms_content'      => 'Abuse report reviewed for “[product_name]”.',
                'system_message'   => 'Abuse report resolved for “[product_name]”.',
                'tag'              => 'Report',
                'category'         => 'notification',
            ),

            // ========== ANNOUNCEMENTS ==========
            'system_announcement'           => array(
                'name'             => 'System announcement',
                'desc'             => 'A system-wide announcement is published by the admin.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'New announcement',
                'email_body'       => '[announcement_message]',
                'sms_content'      => '[announcement_message]',
                'system_message'   => 'New announcement: [announcement_message]',
                'tag'              => 'System',
                'category'         => 'notification',
            ),

            'policy_update'                 => array(
                'name'             => 'Policy update',
                'desc'             => 'Marketplace policies are updated by the admin.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Policy update',
                'email_body'       => 'Marketplace policy has been updated. Please review the new terms.',
                'sms_content'      => 'Policy update: Review new terms.',
                'system_message'   => 'Marketplace policy updated.',
                'tag'              => 'System',
                'category'         => 'notification',
            ),

            'commission_processed'          => array(
                'name'           => 'Commission processed',
                'desc'           => 'A commission payment is processed for a store.',
                'store_enabled'  => true,
                'admin_enabled'  => true,
                'email_subject'  => 'Commission processed',
                'email_body'     => 'Commission payment of [amount] processed for [store_name].',
                'sms_content'    => 'Commission processed for [store_name].',
                'system_message' => 'Commission payment processed for [store_name].',
                'tag'            => 'Commission',
                'category'       => 'activity',
            ),
            'commission_credit'             => array(
                'name'           => 'Commission Credited',
                'desc'           => 'A commission is credited for an order.',
                'store_enabled'  => true,
                'email_subject'  => 'Commission Credited',
                'email_body'     => 'Commission received for order #{order_id}.',
                'sms_content'    => 'Commission credited for order #{order_id}.',
                'system_message' => 'Commission received for order #{order_id}.',
                'tag'            => 'Commission',
                'category'       => 'notification',
            ),
            // ========== FOLLOWED STORE PRODUCT ACTIVITY ==========

			'followed_store_new_product'    => array(
				'name'           => 'New product from followed store',
				'desc'           => 'A new product is added by a store that the user follows.',
				'admin_enabled'  => false,
				'store_enabled'  => false,
				'email_subject'  => 'New product from [store_name]',
				'email_body'     => 'A new product "[product_name]" has been added by a store you follow: [store_name].',
				'sms_content'    => 'New product from [store_name]: [product_name].',
				'system_message' => 'New product added by followed store [store_name].',
				'tag'            => 'Product',
				'category'       => 'activity',
			),
			// ========== FOLLOWED STORE COUPON ACTIVITY ==========

			'followed_store_new_coupon'     => array(
				'name'           => 'New coupon from followed store',
				'desc'           => 'A new coupon is added by a store that the user follows.',
				'admin_enabled'  => false,
				'store_enabled'  => false,
				'email_subject'  => 'New coupon from [store_name]',
				'email_body'     => 'A new coupon "[coupon_code]" is now available from a store you follow: [store_name].',
				'sms_content'    => 'New coupon from [store_name]: [coupon_code].',
				'system_message' => 'New coupon added by followed store [store_name].',
				'tag'            => 'Coupon',
				'category'       => 'activity',
			),

            'order_new'                     => array(
                'name'           => 'New Order Received',
                'desc'           => 'A new order is received by the store.',
                'store_enabled'  => true,
                'email_subject'  => 'New Order Received',
                'email_body'     => 'New order #{order_id} received.',
                'sms_content'    => 'New order #{order_id} received.',
                'system_message' => 'Order #{order_id} received.',
                'tag'            => 'Order',
                'category'       => 'notification',
            ),

            'order_ready_to_ship'           => array(
                'name'           => 'Order Ready to Ship',
                'desc'           => 'An order is marked as ready to ship.',
                'store_enabled'  => true,
                'email_subject'  => 'Order Ready to Ship',
                'email_body'     => 'Order #{order_id} is ready to ship.',
                'sms_content'    => 'Order #{order_id} ready to ship.',
                'system_message' => 'Order #{order_id} ready to ship.',
                'tag'            => 'Order',
                'category'       => 'notification',
            ),

            'order_delivered_alt'           => array(
                'name'             => 'Order delivered',
                'desc'             => 'An order is marked as delivered.',
                'customer_enabled' => true,
                'email_subject'    => 'Order Delivered',
                'email_body'       => 'Order #{order_id} has been delivered.',
                'sms_content'      => 'Order #{order_id} delivered.',
                'system_message'   => 'Order #{order_id} delivered.',
                'tag'              => 'Order',
                'category'         => 'notification',
            ),

            'order_return_requested'        => array(
                'name'             => 'Return Requested',
                'desc'             => 'A return request is submitted by the customer.',
                'store_enabled'    => true,
                'customer_enabled' => true,
                'email_subject'    => 'Return Requested',
                'email_body'       => 'Return request received for order #{order_id}.',
                'sms_content'      => 'Return request for order #{order_id}.',
                'system_message'   => 'Return request received for order #{order_id}.',
                'tag'              => 'Refund',
                'category'         => 'notification',
            ),
        ));

        if ( !$new ) {
            $count = $wpdb->get_var(
                "SELECT COUNT(*) FROM {$wpdb->prefix}" . Utill::TABLES['system_events']
            );
    
            if ( $count > 0 ) {
                return;
            }
        }

        foreach ( $this->events as $key => $event ) {
            $wpdb->insert(
                "{$wpdb->prefix}" . Utill::TABLES['system_events'],
                array(
                    'event_name'       => $event['name'],
                    'description'      => $event['desc'],
                    'admin_enabled'    => $event['admin_enabled'] ?? false,
                    'customer_enabled' => $event['customer_enabled'] ?? false,
                    'store_enabled'    => $event['store_enabled'] ?? false,
                    'system_enabled'   => true,
                    'system_action'    => $key,
                    'email_subject'    => $event['email_subject'] ?? '',
                    'email_body'       => $event['email_body'] ?? '',
                    'sms_content'      => $event['sms_content'] ?? '',
                    'system_message'   => $event['system_message'] ?? '',
                    'status'           => 'active',
                    'custom_emails'    => wp_json_encode( array() ), // empty array.
                    'tag'              => $event['tag'] ?? '',
                    'category'         => $event['category'] ?? '',
                ),
                array(
                    '%s',
                    '%s',
                    '%d',
                    '%d',
                    '%d',
                    '%d',
                    '%s',
                    '%s',
                    '%s',
                    '%s',
                    '%s',
                    '%s',
                    '%s',
                    '%s',
                    '%s',
                )
            );
        }
    }

    /**
     * Trigger notifications.
     *
     * @param string $action_name Action name.
     * @param array  $parameters Parameters.
     * @return void
     */
    public function trigger_notifications( $action_name, $parameters ) {
        global $wpdb;
        $event = $wpdb->get_row(
            $wpdb->prepare( 'SELECT * FROM `' . $wpdb->prefix . Utill::TABLES['system_events'] . '` WHERE system_action = %s', $action_name )
        );

        if ( $event->admin_enabled ) {
            $admin_email = $parameters['admin_email'];
        }
        if ( $event->store_enabled ) {
            $store_email = $parameters['store_email'];
        }
        if ( $event->customer_enabled ) {
            $customer_email = $parameters['customer_email'];
        }

        if ( $event->system_enabled ) {
            $this->send_notifications( $event, $parameters );
        }

        if ( $event->email_enabled ) {
            // Call email class.
        }

        if ( $event->sms_enabled ) {
            // Call sms class.
        }
    }

    /**
     * Send notifications.
     *
     * @param object $event Event object.
     * @param array  $parameters Parameters.
     * @return void
     */
    public function send_notifications( $event, $parameters ) {

        global $wpdb;

        $wpdb->insert(
            "{$wpdb->prefix}" . Utill::TABLES['notifications'],
            array(
                'store_id' => $parameters['store_id'] ?? null,
                'category' => $parameters['category'],
                'type'     => $event->system_action,
                'title'    => $event->event_name,
                'message'  => $event->description,
            ),
            array(
                '%d',
                '%s',
                '%s',
                '%s',
                '%s',
            )
        );
    }

    /**
     * Get all events.
     *
     * @param int|null $id Event ID.
     * @return array|object
     */
    public function get_all_events( $id = null ) {
        global $wpdb;
        $table = "{$wpdb->prefix}" . Utill::TABLES['system_events'];

        $events = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $table" ) );

        if ( ! empty( $id ) ) {
            $events = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT * FROM $table WHERE id = %d",
                    $id
                )
            );
        } else {
            $events = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $table" ) );
        }

        return $events;
    }

    /**
     * Delete all events.
     *
     * @return array|object
     */
    public function delete_all_events() {
        global $wpdb;

        $table = "{$wpdb->prefix}" . Utill::TABLES['system_events'];

        return $wpdb->query( "DELETE FROM $table" );
    }

    public function sync_events() {
        global $wpdb;
        $existing_events = $this->get_all_events();
        $all_events = $this->events;
        $override_fields = MultiVendorX()->setting->get_setting( 'override_existing_fields', [] );
        $existing_map = [];

        foreach ( $existing_events as $event ) {
            if ( ! empty( $event->system_action ) ) {
                $existing_map[ $event->system_action ] = $event;
            }
        }

        // DELETE events which is not in main events array.
        $valid_keys = array_keys( $all_events );

        foreach ( $existing_map as $system_action => $existing_event ) {
            if ( ! in_array( $system_action, $valid_keys, true ) ) {
                $wpdb->delete(
                    "{$wpdb->prefix}" . Utill::TABLES['system_events'],
                    [ 'system_action' => $system_action ],
                    [ '%s' ]
                );
            }
        }

        foreach ( $all_events as $key => $event ) {
            if ( array_key_exists( $key, $existing_map ) ) {
                $update_fields = [];

                if ( ! empty( $override_fields ) && in_array( 'override_notifiers', $override_fields ) ) {
                    $update_fields['admin_enabled']    = $event['admin_enabled'] ?? false;
                    $update_fields['customer_enabled'] = $event['customer_enabled'] ?? false;
                    $update_fields['store_enabled']    = $event['store_enabled'] ?? false;
                }

                if ( ! empty( $override_fields ) && in_array( 'override_custom', $override_fields ) ) {
                    $update_fields['custom_emails'] = wp_json_encode( $event['custom_emails'] ?? [] );
                }

                if ( ! empty( $override_fields ) && in_array( 'override_email_content', $override_fields ) ) {
                    $update_fields['email_subject'] = $event['email_subject'] ?? null;
                    $update_fields['email_body']    = $event['email_body'] ?? null;
                }

                if ( ! empty( $override_fields ) && in_array( 'override_sms_content', $override_fields ) ) {
                    $update_fields['sms_content'] = $event['sms_content'] ?? null;
                }

                if ( ! empty( $override_fields ) && in_array( 'override_system_content', $override_fields ) ) {
                    $update_fields['system_message'] = $event['system_message'] ?? null;
                }

                if ( ! empty( $update_fields ) ) {
                    $wpdb->update(
                        "{$wpdb->prefix}" . Utill::TABLES['system_events'],
                        $update_fields,
                        [ 'system_action' => $key ]
                    );
                }

            } else {

                $wpdb->insert(
                    "{$wpdb->prefix}" . Utill::TABLES['system_events'],
                    array(
                        'event_name'       => $event['name'],
                        'description'      => $event['desc'],
                        'admin_enabled'    => $event['admin_enabled'] ?? false,
                        'customer_enabled' => $event['customer_enabled'] ?? false,
                        'store_enabled'    => $event['store_enabled'] ?? false,
                        'system_enabled'   => true,
                        'system_action'    => $key,
                        'email_subject'    => $event['email_subject'] ?? '',
                        'email_body'       => $event['email_body'] ?? '',
                        'sms_content'      => $event['sms_content'] ?? '',
                        'system_message'   => $event['system_message'] ?? '',
                        'status'           => 'active',
                        'custom_emails'    => wp_json_encode( array() ), // empty array.
                        'tag'              => $event['tag'] ?? '',
                        'category'         => $event['category'] ?? '',
                    )
                );
            }

        }

    }

    /**
     * Get all notifications.
     *
     * @param int|null $store_id Store ID.
     * @return array|object
     */
    public function get_all_notifications( $store_id = null, $args = array() ) {
        global $wpdb;
        $table = "{$wpdb->prefix}" . Utill::TABLES['notifications'];

        if ( ! empty( $store_id ) ) {
            $events = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT * FROM $table WHERE store_id = %d AND is_dismissed = %d",
                    $store_id,
                    0
                )
            );
        } else {
            $events = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT * FROM $table WHERE is_dismissed = %d",
                    0
                )
            );
        }

        if ( ! empty( $args ) ) {
            $where = array();

            if ( isset( $args['ID'] ) ) {
                $ids     = is_array( $args['ID'] ) ? $args['ID'] : array( $args['ID'] );
                $ids     = implode( ',', array_map( 'intval', $ids ) );
                $where[] = "ID IN ($ids)";
            }

            if ( isset( $args['category'] ) ) {
                $where[] = "category = '" . esc_sql( $args['category'] ) . "'";
            }

            if ( isset( $args['store_id'] ) ) {
                $where[] = "store_id = '" . esc_sql( $args['store_id'] ) . "'";
            }

            if ( isset( $args['start_date'] ) && isset( $args['end_date'] ) ) {
                $where[] = "create_time BETWEEN '" . esc_sql( $args['start_date'] ) . "' AND '" . esc_sql( $args['end_date'] ) . "'";
            }

            $table = $wpdb->prefix . Utill::TABLES['notifications'];

            if ( isset( $args['count'] ) ) {
                $query = "SELECT COUNT(*) FROM {$table}";
            } else {
                $query = "SELECT * FROM {$table}";
            }

            if ( ! empty( $where ) ) {
                $condition = $args['condition'] ?? ' AND ';
                $query    .= ' WHERE ' . implode( $condition, $where );
            }

            // Keep your pagination logic.
            if ( isset( $args['limit'] ) && isset( $args['offset'] ) && empty( $args['count'] ) ) {
                $limit  = intval( $args['limit'] );
                $offset = intval( $args['offset'] );
                $query .= " LIMIT $limit OFFSET $offset";
            }

            if ( isset( $args['count'] ) ) {
                $results = $wpdb->get_var( $query );
                return $results ?? 0;
            } else {
                $results = $wpdb->get_results( $query, ARRAY_A );
                return $results ?? array();
            }
        }

        return $events;
    }

    /**
     * Clear notifications based on settings.
     */
    public function multivendorx_clear_notifications() {
        global $wpdb;

        $days = MultiVendorX()->setting->get_setting( 'clear_notifications' );

        $table = "{$wpdb->prefix}" . Utill::TABLES['notifications'];

        $current_date = current_time( 'mysql' );

        // Delete data older than N days or already expired.
        $query = $wpdb->prepare(
            "
            DELETE FROM $table
            WHERE (expires_at IS NOT NULL AND expires_at < %s)
            OR (created_at < DATE_SUB(%s, INTERVAL %d DAY))
            ",
            $current_date,
            $current_date,
            $days
        );

        $wpdb->query( $query );
    }
}
