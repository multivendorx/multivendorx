<?php
/**
 * MultiVendorX Notifications class
 *
 * @package MultiVendorX
 */
namespace MultiVendorX\Notifications;

use MultiVendorX\Utill;
use MultiVendorX\Notifications\Gateways\Twilio;
use MultiVendorX\Notifications\Gateways\Plivo;
use MultiVendorX\Notifications\Gateways\Vonage;
use MultiVendorX\Notifications\Gateways\Clickatell;

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
    public function insert_system_events( $new = false ) {
        global $wpdb;

        $this->events = apply_filters(
            'multivendorx_system_events',
            array(
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
					'category'       => 'notification',
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
					'category'       => 'notification',
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
					'category'       => 'notification',
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
					'category'         => 'notification',
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
					'category'         => 'notification',
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
					'category'         => 'notification',
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
					'category'         => 'notification',
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
					'category'         => 'notification',
				),

				// ========== PAYMENT ==========
				'payout_received'               => array(
					'name'           => 'Payout received',
					'desc'           => 'A payment is received for an order.',
					'store_enabled'  => true,
					'admin_enabled'  => true,
					'email_subject'  => 'Payout received',
					'email_body'     => 'Payout for order [order_id] has been received successfully.',
					'sms_content'    => 'Payout received for [order_id].',
					'system_message' => 'Payout for [order_id] received.',
					'tag'            => 'Payment',
					'category'       => 'notification',
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
					'category'       => 'notification',
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
					'category'       => 'notification',
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
					'category'       => 'activity',
				),

				'product_low_stock'             => array(
					'name'           => 'Low stock alert(p)',
					'desc'           => 'A product stock level is detected below the set threshold.',
					'store_enabled'  => true,
					'email_subject'  => 'Low stock alert',
					'email_body'     => 'Your product “[product_name]” is running low on stock (only [quantity] left).',
					'sms_content'    => 'Low stock alert: “[product_name]” – [quantity] left.',
					'system_message' => 'Low stock alert for “[product_name]”.',
					'tag'            => 'Product',
					'category'       => 'activity',
				),

				'product_out_of_stock'          => array(
					'name'           => 'Out of stock alert(p)',
					'desc'           => 'A product is detected as out of stock.',
					'store_enabled'  => true,
					'email_subject'  => 'Out of stock',
					'email_body'     => 'Your product “[product_name]” is now out of stock.',
					'sms_content'    => 'Out of stock: “[product_name]”.',
					'system_message' => 'Product “[product_name]” is out of stock.',
					'tag'            => 'Product',
					'category'       => 'activity',
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
					'category'       => 'activity',
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
					'category'         => 'activity',
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
					'name'           => 'System announcement',
					'desc'           => 'A system-wide announcement is published by the admin.',
					'store_enabled'  => true,
					'admin_enabled'  => true,
					'email_subject'  => 'New announcement',
					'email_body'     => '[announcement_message]',
					'sms_content'    => '[announcement_message]',
					'system_message' => 'New announcement: [announcement_message]',
					'tag'            => 'System',
					'category'       => 'notification',
				),

				'policy_update'                 => array(
					'name'             => 'Policy update(p)',
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

				// ========== FOLLOWED STORE PRODUCT ACTIVITY ==========

				'store_new_follower' => array(
	'name'             => 'New store follower',
	'desc'             => 'A customer has started following the store.',
	'vendor_enabled'   => true,
	'email_subject'    => 'You have a new follower',
	'email_body'       => 'Customer {follower_name} has started following your store {store_name}.',
	'sms_content'      => 'New follower: {follower_name} is now following your store.',
	'system_message'   => '{follower_name} started following your store.',
	'tag'              => 'Store',
	'category'         => 'notification',
),

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
					'category'       => 'notifications',
				),

				'order_ready_to_ship'           => array(
					'name'           => 'Order ready to ship (P)',
					'desc'           => 'An order is marked as ready to ship.',
					'store_enabled'  => true,
					'email_subject'  => 'Order ready to ship',
					'email_body'     => 'Order #{order_id} is ready to ship.',
					'sms_content'    => 'Order #{order_id} ready to ship.',
					'system_message' => 'Order #{order_id} ready to ship.',
					'tag'            => 'Order',
					'category'       => 'notification',
				),

				'order_delivered_alt'           => array(
					'name'             => 'Order delivered (P)',
					'desc'             => 'An order is marked as delivered.',
					'customer_enabled' => true,
					'email_subject'    => 'Order delivered',
					'email_body'       => 'Order #{order_id} has been delivered.',
					'sms_content'      => 'Order #{order_id} delivered.',
					'system_message'   => 'Order #{order_id} delivered.',
					'tag'              => 'Order',
					'category'         => 'notification',
				),

				'order_return_requested'        => array(
					'name'             => 'Return requested',
					'desc'             => 'A return request is submitted by the customer.',
					'store_enabled'    => true,
					'customer_enabled' => true,
					'email_subject'    => 'Return requested',
					'email_body'       => 'Return request received for order #{order_id}.',
					'sms_content'      => 'Return request for order #{order_id}.',
					'system_message'   => 'Return request received for order #{order_id}.',
					'tag'              => 'Refund',
					'category'         => 'activity',
				),
				// ========== Q&A NOTIFICATION SYSTEM ==========

'question_submitted' => array(
    'name'             => 'New product question submitted',
    'desc'             => 'A customer submits a question on a product.',
    'admin_enabled'    => true,
    'store_enabled'    => true,
    'customer_enabled' => false,
    'email_subject'    => 'New question on “[product_name]”',
    'email_body'       => 'A new question has been submitted for your product “[product_name]”.',
    'sms_content'      => 'New question on [product_name].',
    'system_message'   => 'New question received for “[product_name]”.',
    'tag'              => 'Product',
    'category'         => 'activity',
),

'question_answered' => array(
    'name'             => 'Product question answered',
    'desc'             => 'A question on a product receives a reply.',
    'store_enabled'    => true,
    'customer_enabled' => true,
    'email_subject'    => 'Your question has been answered',
    'email_body'       => 'Your question on “[product_name]” has been answered.',
    'sms_content'      => 'Answer received for [product_name].',
    'system_message'   => 'Question answered for “[product_name]”.',
    'tag'              => 'Product',
    'category'         => 'notification',
),

// ========== STORE CONTACT / MESSAGING ==========

'store_contact_message' => array(
    'name'           => 'New store contact message',
    'desc'           => 'A customer sends a message to a store.',
    'store_enabled'  => true,
    'email_subject'  => 'New message from customer',
    'email_body'     => 'You have received a new message regarding your store [store_name].',
    'sms_content'    => 'New customer message received.',
    'system_message' => 'New message received for store [store_name].',
    'tag'            => 'Store',
    'category'       => 'activity',
),

'store_message_reply' => array(
    'name'             => 'Store replied to message',
    'desc'             => 'A store replies to a customer message.',
    'customer_enabled' => true,
    'email_subject'    => 'Reply from [store_name]',
    'email_body'       => '[store_name] has replied to your message.',
    'sms_content'      => 'Reply from [store_name].',
    'system_message'   => 'Reply received from [store_name].',
    'tag'              => 'Store',
    'category'         => 'notification',
),

/* =====================================================
 * WHOLESALE BUYER VERIFICATION
 * ===================================================== */

'wholesale_buyer_approved' => array(
	'name'             => 'Wholesale buyer approved (P)',
	'desc'             => 'User has been approved as a wholesale buyer.',
	'customer_enabled' => true,
	'email_subject'    => 'Your wholesale access is approved',
	'email_body'       => 'Congratulations! You have been approved as a wholesale buyer. You can now access wholesale pricing.',
	'sms_content'      => 'Wholesale access approved.',
	'system_message'   => 'Wholesale access approved.',
	'tag'              => 'Wholesale',
	'category'         => 'notification',
),

'wholesale_buyer_rejected' => array(
	'name'             => 'Wholesale buyer rejected (P)',
	'desc'             => 'User request for wholesale access has been rejected.',
	'customer_enabled' => true,
	'email_subject'    => 'Wholesale access request rejected',
	'email_body'       => 'Your request for wholesale buyer access has been rejected. Please contact support for more information.',
	'sms_content'      => 'Wholesale access rejected.',
	'system_message'   => 'Wholesale access rejected.',
	'tag'              => 'Wholesale',
	'category'         => 'notification',
),


/* =====================================================
 * SELLER VERIFICATION
 * ===================================================== */

'seller_verification_required' => array(
	'name'             => 'Seller verification required (P)',
	'desc'             => 'Store must complete identity or business verification.',
	'vendor_enabled'   => true,
	'email_subject'    => 'Complete your store verification',
	'email_body'       => 'Your store {store_name} requires verification. Please complete the required steps to avoid restrictions.',
	'sms_content'      => 'Verification required for {store_name}.',
	'system_message'   => 'Store verification required.',
	'tag'              => 'Compliance',
	'category'         => 'notification',
),

'seller_verification_submitted' => array(
	'name'             => 'Seller verification submitted (P)',
	'desc'             => 'Store submitted verification details for review.',
	'admin_enabled'    => true,
	'email_subject'    => 'Verification submitted for review',
	'email_body'       => 'Store {store_name} has submitted verification documents for approval.',
	'sms_content'      => '{store_name} submitted verification.',
	'system_message'   => 'Verification submitted.',
	'tag'              => 'Compliance',
	'category'         => 'notification',
),

'seller_verification_approved' => array(
	'name'             => 'Seller verification approved (P)',
	'desc'             => 'Store verification approved successfully.',
	'vendor_enabled'   => true,
	'email_subject'    => 'Your store is now verified',
	'email_body'       => 'Congratulations! Your store {store_name} has been verified successfully.',
	'sms_content'      => 'Store verified successfully.',
	'system_message'   => 'Store verification approved.',
	'tag'              => 'Compliance',
	'category'         => 'notification',
),

'seller_verification_rejected' => array(
	'name'             => 'Seller verification rejected (P)',
	'desc'             => 'Store verification was rejected.',
	'vendor_enabled'   => true,
	'email_subject'    => 'Store verification rejected',
	'email_body'       => 'Your verification was rejected. Please review the feedback and resubmit.',
	'sms_content'      => 'Verification rejected.',
	'system_message'   => 'Store verification rejected.',
	'tag'              => 'Compliance',
	'category'         => 'notification',
),

/* =====================================================
 * SELLER NON-COMPLIANCE ACTIONS
 * ===================================================== */

'compliance_dashboard_blocked' => array(
	'name'             => 'Dashboard access blocked  (P)',
	'desc'             => 'Dashboard access blocked due to non-compliance.',
	'vendor_enabled'   => true,
	'email_subject'    => 'Dashboard access blocked',
	'email_body'       => 'Your dashboard access has been blocked until compliance requirements are completed.',
	'sms_content'      => 'Dashboard access blocked.',
	'system_message'   => 'Dashboard access restricted.',
	'tag'              => 'Compliance',
	'category'         => 'notification',
),

'compliance_store_hidden' => array(
	'name'             => 'Store hidden from customers  (P)',
	'desc'             => 'Store visibility restricted due to compliance issue.',
	'vendor_enabled'   => true,
	'email_subject'    => 'Store hidden from customers',
	'email_body'       => 'Your store has been hidden from customers until compliance issues are resolved.',
	'sms_content'      => 'Store hidden temporarily.',
	'system_message'   => 'Store visibility restricted.',
	'tag'              => 'Compliance',
	'category'         => 'notification',
),

'compliance_product_upload_disabled' => array(
	'name'             => 'Product upload disabled  (P)',
	'desc'             => 'Product upload disabled during compliance review.',
	'vendor_enabled'   => true,
	'email_subject'    => 'Product upload disabled',
	'email_body'       => 'Product upload and order fulfillment are temporarily disabled during compliance review.',
	'sms_content'      => 'Product upload disabled.',
	'system_message'   => 'Product upload restricted.',
	'tag'              => 'Compliance',
	'category'         => 'notification',
),

'compliance_store_set_pending' => array(
	'name'             => 'Store set as pending  (P)',
	'desc'             => 'Store moved to pending due to compliance issue.',
	'vendor_enabled'   => true,
	'email_subject'    => 'Store moved to pending',
	'email_body'       => 'Your store has been moved to pending status until compliance issues are resolved.',
	'sms_content'      => 'Store set to pending.',
	'system_message'   => 'Store status changed to pending.',
	'tag'              => 'Compliance',
	'category'         => 'notification',
),

/* =====================================================
 * PRODUCT COMPLIANCE
 * ===================================================== */

'product_flagged_compliance' => array(
	'name'             => 'Product flagged for compliance review  (P)',
	'desc'             => 'Product flagged due to prohibited item or policy issue.',
	'vendor_enabled'   => true,
	'email_subject'    => 'Product flagged for review',
	'email_body'       => 'Your product {product_name} has been flagged for compliance review.',
	'sms_content'      => 'Product flagged for review.',
	'system_message'   => '{product_name} flagged for compliance.',
	'tag'              => 'Compliance',
	'category'         => 'notification',
),

'admin_product_compliance_alert' => array(
	'name'             => 'Product compliance issue reported  (P)',
	'desc'             => 'Admin notified about product compliance issue.',
	'admin_enabled'    => true,
	'email_subject'    => 'Product compliance alert',
	'email_body'       => 'Product {product_name} from {store_name} requires compliance review.',
	'sms_content'      => 'Product compliance issue reported.',
	'system_message'   => 'Product compliance alert.',
	'tag'              => 'Compliance',
	'category'         => 'notification',
),

/* =====================================================
 * FINANCIAL COMPLIANCE
 * ===================================================== */

'financial_verification_required' => array(
	'name'             => 'Financial verification required  (P)',
	'desc'             => 'Tax or bank information requires verification.',
	'vendor_enabled'   => true,
	'email_subject'    => 'Financial verification required',
	'email_body'       => 'Please complete your tax information and bank details to continue receiving payouts.',
	'sms_content'      => 'Financial verification required.',
	'system_message'   => 'Complete financial verification.',
	'tag'              => 'Compliance',
	'category'         => 'notification',
),

'payouts_disabled_compliance' => array(
	'name'             => 'Payouts disabled  (P)',
	'desc'             => 'Payouts suspended due to financial compliance issue.',
	'vendor_enabled'   => true,
	'email_subject'    => 'Payouts temporarily suspended',
	'email_body'       => 'Your payouts are suspended until financial compliance issues are resolved.',
	'sms_content'      => 'Payouts suspended temporarily.',
	'system_message'   => 'Payouts disabled due to compliance.',
	'tag'              => 'Compliance',
	'category'         => 'notification',
),

'admin_financial_compliance_alert' => array(
	'name'             => 'Financial compliance issue reported  (P)',
	'desc'             => 'Admin notified about financial compliance issue.',
	'admin_enabled'    => true,
	'email_subject'    => 'Financial compliance alert',
	'email_body'       => 'Store {store_name} has a financial compliance issue requiring review.',
	'sms_content'      => 'Financial compliance issue reported.',
	'system_message'   => 'Financial compliance alert.',
	'tag'              => 'Compliance',
	'category'         => 'notification',
),


// ========== REVIEW NOTIFICATIONS ==========

'store_review_submitted' => array(
    'name'           => 'Store review submitted  (P)',
    'desc'           => 'A customer submits a review for a store.',
    'store_enabled'  => true,
    'admin_enabled'  => true,
    'email_subject'  => 'New review for your store',
    'email_body'     => 'Your store [store_name] has received a new review.',
    'sms_content'    => 'New review received.',
    'system_message' => 'New review submitted for [store_name].',
    'tag'            => 'Review',
    'category'       => 'activity',
),

// ========== REPORTING EMAILS ==========

'store_sales_report' => array(
    'name'          => 'Store sales report',
    'desc'          => 'Periodic sales report sent to store owner.',
    'store_enabled' => true,
    'email_subject' => 'Your sales summary report',
    'email_body'    => 'Here is your sales summary. Total Orders: [total_orders], Total Revenue: [total_revenue].',
    'sms_content'   => 'Sales report available.',
    'system_message'=> 'Sales report generated.',
    'tag'           => 'Report',
    'category'      => 'notification',
),

'admin_marketplace_report' => array(
    'name'          => 'Marketplace summary report',
    'desc'          => 'Periodic marketplace performance report.',
    'admin_enabled' => true,
    'email_subject' => 'Marketplace performance report',
    'email_body'    => 'Marketplace summary: Total Orders: [total_orders], Total Revenue: [total_revenue], Active Stores: [active_stores].',
    'sms_content'   => 'Marketplace report generated.',
    'system_message'=> 'Marketplace performance report generated.',
    'tag'           => 'Report',
    'category'      => 'notification',
),

// ========== TRANSACTION-LEVEL EMAILS ==========

'transaction_recorded' => array(
    'name'           => 'Transaction recorded',
    'desc'           => 'A new transaction entry is recorded.',
    'store_enabled'  => true,
    'admin_enabled'  => true,
    'email_subject'  => 'New transaction recorded',
    'email_body'     => 'A transaction of [amount] has been recorded for order [order_id].',
    'sms_content'    => 'Transaction of [amount] recorded.',
    'system_message' => 'Transaction recorded for order [order_id].',
    'tag'            => 'Payment',
    'category'       => 'activity',
),

'bank_transfer_initiated' => array(
    'name'           => 'Bank transfer initiated',
    'desc'           => 'A manual bank transfer payout is initiated.',
    'store_enabled'  => true,
    'admin_enabled'  => true,
    'email_subject'  => 'Bank transfer initiated',
    'email_body'     => 'A bank transfer of [amount] has been initiated to your registered account.',
    'sms_content'    => 'Bank transfer initiated.',
    'system_message' => 'Bank transfer initiated for [amount].',
    'tag'            => 'Payment',
    'category'       => 'notification',
),

// ========== DEACTIVATION REQUEST WORKFLOW ==========

'store_deactivation_requested' => array(
    'name'           => 'Store deactivation requested',
    'desc'           => 'A store requests deactivation.',
    'admin_enabled'  => true,
    'store_enabled'  => true,
    'email_subject'  => 'Store deactivation request submitted',
    'email_body'     => 'Your request to deactivate store [store_name] has been submitted for review.',
    'sms_content'    => 'Deactivation request submitted.',
    'system_message' => 'Deactivation request received for [store_name].',
    'tag'            => 'Store',
    'category'       => 'activity',
),

'store_deactivation_rejected' => array(
    'name'           => 'Store deactivation rejected',
    'desc'           => 'Admin rejects store deactivation request.',
    'store_enabled'  => true,
    'email_subject'  => 'Store deactivation request rejected',
    'email_body'     => 'Your deactivation request for [store_name] has been rejected.',
    'sms_content'    => 'Deactivation request rejected.',
    'system_message' => 'Deactivation rejected for [store_name].',
    'tag'            => 'Store',
    'category'       => 'notification',
),

// ========== ADMIN COUPON CREATION ALERT ==========

'coupon_created_by_store' => array(
    'name'           => 'Coupon created by store',
    'desc'           => 'A store creates a new coupon.',
    'admin_enabled'  => true,
    'email_subject'  => 'New coupon created',
    'email_body'     => 'Store [store_name] has created a new coupon “[coupon_code]”.',
    'sms_content'    => 'New coupon created by [store_name].',
    'system_message' => 'Coupon “[coupon_code]” created by [store_name].',
    'tag'            => 'Coupon',
    'category'       => 'activity',
),

// ========== SYSTEM OPERATIONAL EMAILS ==========

'plugin_deactivated' => array(
    'name'           => 'Plugin deactivated',
    'desc'           => 'MultiVendorX plugin is deactivated.',
    'admin_enabled'  => true,
    'email_subject'  => 'MultiVendorX plugin deactivated',
    'email_body'     => 'MultiVendorX has been deactivated on your site.',
    'sms_content'    => 'MultiVendorX plugin deactivated.',
    'system_message' => 'Plugin deactivated.',
    'tag'            => 'System',
    'category'       => 'notification',
),

'system_error_alert' => array(
    'name'           => 'System error alert',
    'desc'           => 'Critical system-level error detected.',
    'admin_enabled'  => true,
    'email_subject'  => 'Critical system alert',
    'email_body'     => 'A critical error has been detected. Error Code: [error_code].',
    'sms_content'    => 'Critical system alert.',
    'system_message' => 'Critical system error detected.',
    'tag'            => 'System',
    'category'       => 'notification',
),

            )
        );

        if ( ! $new ) {
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

        if ( $event->system_enabled ) {
            $this->send_notifications( $event, $parameters );
        }

        if ( $event->email_enabled ) {
            $receivers = array();

            // System recipients.
            if ( $event->admin_enabled ) {
                $receivers[] = $parameters['admin_email'];
            }

            if ( $event->store_enabled ) {
                $receivers[] = $parameters['store_email'];
            }

            if ( $event->customer_enabled ) {
                $receivers[] = $parameters['customer_email'];
            }

            // Custom recipients.
            if ( ! empty( $event->custom_emails ) && is_array( $event->custom_emails ) ) {
                $receivers = array_merge( $receivers, $event->custom_emails );
            }

            $to      = array_unique( $receivers );
            $subject = $event->email_subject;
            $message = $event->email_body;
            foreach ( $parameters as $key => $value ) {
				$message = str_replace( '[' . $key . ']', $value, $message );
			}
            $headers = array( 'Content-Type: text/html; charset=UTF-8' );

            wp_mail( $to, $subject, $message, $headers );
        }

        if ( $event->sms_enabled ) {
            $receivers = array();

            if ( $event->admin_enabled ) {
				$parameters['admin_phone'] = $parameters['admin_phone']['country_code'] . $parameters['admin_phone']['sms_receiver_phone_number'];
                $receivers[] = $parameters['admin_phone'];
            }

            if ( $event->store_enabled ) {
                $receivers[] = $parameters['store_phone'];
            }

            if ( $event->customer_enabled ) {
                $receivers[] = $parameters['customer_phone'];
            }
			
            $message = $event->sms_content;
			foreach ( $parameters as $key => $value ) {
				$message = str_replace( '[' . $key . ']', $value, $message );
			}

            $gateway = $this->active_gateway();
			if ( $gateway ) {
                foreach ( $receivers as $number ) {
                    $gateway->send( $number, $message );
                }
            }
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
        $all_events      = $this->events;
        $override_fields = MultiVendorX()->setting->get_setting( 'override_existing_fields', array() );
        $existing_map    = array();

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
                    array( 'system_action' => $system_action ),
                    array( '%s' )
                );
            }
        }

        foreach ( $all_events as $key => $event ) {
            if ( array_key_exists( $key, $existing_map ) ) {
                $update_fields = array();

                if ( ! empty( $override_fields ) && in_array( 'override_notifiers', $override_fields ) ) {
                    $update_fields['admin_enabled']    = $event['admin_enabled'] ?? false;
                    $update_fields['customer_enabled'] = $event['customer_enabled'] ?? false;
                    $update_fields['store_enabled']    = $event['store_enabled'] ?? false;
                }

                if ( ! empty( $override_fields ) && in_array( 'override_custom', $override_fields ) ) {
                    $update_fields['custom_emails'] = wp_json_encode( $event['custom_emails'] ?? array() );
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
                        array( 'system_action' => $key )
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
    public function get_all_notifications( $args = array() ) {
        global $wpdb;
        $table = "{$wpdb->prefix}" . Utill::TABLES['notifications'];

        $events = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM $table WHERE is_dismissed = %d",
                0
            )
        );

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

            if ( isset( $args['store_id'] ) && ! empty( $args['store_id'] ) ) {
                $where[] = "store_id = '" . esc_sql( $args['store_id'] ) . "'";
            }

            if ( isset( $args['start_date'] ) && isset( $args['end_date'] ) ) {
                $where[] = "created_at BETWEEN '" . esc_sql( $args['start_date'] ) . "' AND '" . esc_sql( $args['end_date'] ) . "'";
            }

            $table = $wpdb->prefix . Utill::TABLES['notifications'];

            if ( isset( $args['count'] ) ) {
                $query   = "SELECT COUNT(*) FROM {$table}";
				$where[] = 'is_dismissed = 0 AND is_read = 0';
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

    public function active_gateway() {
        $gateways = apply_filters(
            'multivendorx_available_sms_gateways',
            array(
				'twilio'     => new Twilio(),
				'vonage'     => new Vonage(),
				'clickatell' => new Clickatell(),
				'plivo'      => new Plivo(),
			)
        );

        $gateway = MultiVendorX()->setting->get_setting( 'sms_gateway_selector' );

        if ( $gateway && array_key_exists( $gateway, $gateways ) ) {
            return new $gateways[ $gateway ]();
        }

        return false;
    }
}
