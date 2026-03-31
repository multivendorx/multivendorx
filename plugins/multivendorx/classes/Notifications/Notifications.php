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
        add_action( 'multivendorx_clear_notifications', array( $this, 'multivendorx_clear_notifications' ) );
    }

    /**
     * Register notification hooks
     *
     * @return void
     */
    public function register_notification_hooks() {
        $this->events = $this->get_all_events();
        foreach ( $this->events as $value ) {
            $event = $value->system_action;
            add_action( "multivendorx_notify_{$event}", array( $this, 'trigger_notifications' ), 10, 2 );
        }
    }

	/**
	 * Insert system events.
	 *
	 * This function inserts system events, optionally only new ones.
	 *
	 * @param bool $is_new Optional. Whether to insert only new events. Default false.
	 * @return void
	 */
    public function insert_system_events( $is_new = false ) {
        global $wpdb;

        $this->events = apply_filters(
            'multivendorx_system_events',
            array(
				// Store Registration & Approval.
				'store_pending_approval'             => array(
					'name'             => 'Store pending approval',
					'desc' => 'Triggered when a new store application is submitted and placed under admin review.', 	
					'customer_enabled' => false,
					'store_enabled'    => true,
					'admin_enabled'    => true,
					'system_enabled'   => true,
					'email_subject'    => 'Your store application is under review',
					'email_body'       => '
						<p>Hello,</p>
						<p>Your store <strong>[store_name]</strong> has been successfully submitted.</p>
						<p>The marketplace team is reviewing your application. You will be notified once the review process is completed.</p>
						<p>Thank you for your patience.</p>',
					'sms_content'      => 'Store [store_name] is pending approval.',
					'system_message'   => 'Your store is currently under admin review.',
					'tag'              => 'Store',
					'category'         => 'activity',
				),

				'store_rejected'                     => array(
					'name'             => 'Store rejected',
					'desc'             => 'Admin rejected the store application.',
					'customer_enabled' => false,
					'store_enabled'    => true,
					'admin_enabled'    => false,
					'system_enabled'   => true,
					'email_subject'    => 'Your store application was rejected',
					'email_body'       => '<p>Hello,</p>
											<p>Unfortunately your store application <strong>[store_name]</strong> has been rejected.</p>
											<p>Please review marketplace requirements and reapply if applicable.</p>',
					'sms_content'      => 'Store application rejected.',
					'system_message'   => 'Your store application has been rejected.',
					'tag'              => 'Store',
					'category'         => 'activity',
				),

				'store_permanently_rejected'         => array(
					'name'             => 'Store permanently rejected',
					'desc' => 'Permanent rejection of a store application by the admin',
					'customer_enabled' => false,
					'store_enabled'    => true,
					'admin_enabled'    => true,
					'system_enabled'   => true,
					'email_subject'    => 'Your store application has been permanently rejected',
					'email_body'       => '<p>Hello,</p><p>Your store application <strong>[store_name]</strong> has been permanently rejected due to policy violations.</p>',
					'sms_content'      => 'Store application permanently rejected.',
					'system_message'   => 'Your store application has been permanently rejected.',
					'tag'              => 'Store',
					'category'         => 'activity',
				),
				'store_account_created_by_admin'     => array(
					'name'             => 'Store account created by admin',
					'desc'             => 'Admin manually created store account.',
					'customer_enabled' => false,
					'store_enabled'    => true,
					'admin_enabled'    => false,
					'system_enabled'   => true,
					'email_subject'    => 'Your store account has been created – [store_name]',
					'email_body'       => '<p>Hello [store_owner_name],</p><p>An account has been created for you on <strong>[marketplace_name]</strong> to manage the store <strong>[store_name]</strong>.</p>
											<p>You can now log in and start setting up your store.</p><p>
											<strong>Login URL:</strong> <a href="[login_url]">[login_url]</a><br>
											<strong>Username:</strong> [store_owner_name]
											</p>
											<p>After logging in, you can:</p>
											<ul>
											<li>Update your store profile</li>
											<li>Add products</li>
											<li>Configure shipping and payment settings</li>
											</ul>
											<p>If you did not expect this account creation, please contact the marketplace administrator.</p>',
					'sms_content'      => 'Your store account for [store_name] has been created. Please log in to get started.',
					'system_message'   => 'Your store account for [store_name] has been created by the marketplace admin.',
					'tag'              => 'Store',
					'category'         => 'notification',
				),
				// POST ACTIVATION FLOW.
				'store_activated'                    => array(
					'name'             => 'Store activated',
					'desc'             => 'Store activated and ready to start selling.',
					'customer_enabled' => false,
					'store_enabled'    => true,
					'admin_enabled'    => false,
					'system_enabled'   => true,
					'email_subject'    => 'Your store "[store_name]" is now active',
					'email_body'       => '<p>Hello,</p>
									<p>Your store <strong>[store_name]</strong> is now active and visible to customers.</p>
									<p>You can now add products and begin receiving orders.</p>',
					'sms_content'      => 'Store [store_name] is now active.',
					'system_message'   => 'Your store has been activated.',
					'tag'              => 'Store',
					'category'         => 'activity',
				),

				'store_under_review'                 => array(
					'name'             => 'Store under review',
					'desc'             => 'Store temporarily placed under admin review.',
					'customer_enabled' => false,
					'store_enabled'    => true,
					'admin_enabled'    => true,
					'system_enabled'   => true,
					'email_subject'    => 'Your store "[store_name]" is under review',
					'email_body'       => '<p>Hello,</p>
										<p>Your store <strong>[store_name]</strong> has been placed under administrative review.</p>',
					'sms_content'      => 'Store [store_name] under review.',
					'system_message'   => 'Your store has been placed under review.',
					'tag'              => 'Store',
					'category'         => 'activity',
				),

				'store_suspended'                    => array(
					'name'             => 'Store suspended',
					'desc'             => 'Store temporarily suspended by the admin.',
					'customer_enabled' => false,
					'store_enabled'    => true,
					'admin_enabled'    => true,
					'system_enabled'   => true,
					'email_subject'    => 'Your store "[store_name]" has been suspended',
					'email_body'       => '<p>Hello,</p>
											<p>Your store <strong>[store_name]</strong> has been temporarily suspended.</p>
											<p>Please contact marketplace support for more information.</p>',
					'sms_content'      => 'Store [store_name] suspended.',
					'system_message'   => 'Your store has been suspended.',
					'tag'              => 'Store',
					'category'         => 'activity',
				),

				'store_permanently_deactivated'      => array(
					'name'             => 'Store permanently deactivated',
					'desc'             => 'Admin permanently deactivated the store.',
					'customer_enabled' => false,
					'store_enabled'    => true,
					'admin_enabled'    => true,
					'system_enabled'   => true,
					'email_subject'    => 'Your store "[store_name]" has been permanently deactivated',
					'email_body'       => '<p>Hello,</p>
											<p>Your store <strong>[store_name]</strong> has been permanently deactivated.</p>
											',
					'sms_content'      => 'Store [store_name] permanently deactivated.',
					'system_message'   => 'Your store has been permanently deactivated.',
					'tag'              => 'Store',
					'category'         => 'activity',
				),

				'store_account_deactivation_request' => array(
					'name'             => 'Store account deactivation request',
					'desc'             => 'Store owner requests deactivation of their store account.',
					'customer_enabled' => false,
					'store_enabled'    => false,
					'admin_enabled'    => true,
					'system_enabled'   => true,
					'email_subject'    => 'Store deactivation request – [store_name]',
					'email_body'       => '<p>Hello Admin,</p><p>The store <strong>[store_name]</strong> has submitted a request to deactivate their store account.</p> <p>Please review the request and take the appropriate action from the admin dashboard.</p>',
					'sms_content'      => 'Store [store_name] requested account deactivation.',
					'system_message'   => 'Store [store_name] has requested to deactivate their store account.',
					'tag'              => 'Store',
					'category'         => 'activity',
				),
				// didi.
				'store_deactivation_request_rejected' => array(
					'name'             => 'Store deactivation rejected',
					'desc'             => 'Store deactivation request rejected by the admin.',
					'customer_enabled' => false,
					'store_enabled'    => true,
					'admin_enabled'    => false,
					'system_enabled'   => true,
					'email_subject'    => 'Your store "[store_name]" deactivation request has been rejected',
					'email_body'       => '<p>Hello,</p>
						<p>Your store <strong>[store_name]</strong> has been permanently deactivated.</p>
						',
					'sms_content'      => 'Store [store_name] deactivation request has been rejected',
					'system_message'   => 'Your store deactivation request has been rejected.',
					'tag'              => 'Store',
					'category'         => 'activity',
				),
				// ORDER NOTIFICATIONS.
				'new_order_store'                    => array(
					'name'             => 'New order received',
					'desc'             => 'New order received by the store.',
					'customer_enabled' => false,
					'store_enabled'    => true,
					'admin_enabled'    => true,
					'system_enabled'   => true,
					'email_subject'    => 'New order received – Order #[order_id]',
					'email_body'       => '<p>Hello,</p>
											<p>You have received a new order.</p>
											<p><strong>Order Number:</strong> #[order_id]</p>
											',
					'sms_content'      => 'New order #[order_id] received.',
					'system_message'   => 'New order received.',
					'tag'              => 'Order',
					'category'         => 'activity',
				),

				'order_processing'                   => array(
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

				'order_completed'                    => array(
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

				'order_cancelled'                    => array(
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

				'order_refunded'                     => array(
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

				// SHIPMENT TRACKING.
				'shipment_tracking_added'            => array(
					'name'             => 'Shipment tracking added',
					'desc'             => 'Tracking details added for the order shipment.',
					'customer_enabled' => true,
					'store_enabled'    => false,
					'admin_enabled'    => false,
					'system_enabled'   => true,
					'email_subject'    => 'Tracking added – Order #[order_id]',
					'email_body'       => '
										<p>Hello,</p>
										<p>Tracking information has been added for your order <strong>#[order_id]</strong>.</p>
										',
					'sms_content'      => 'Tracking added for order #[order_id].',
					'system_message'   => 'Tracking information added to your order.',
					'tag'              => 'Shipping',
					'category'         => 'notification',
				),
				// Pro.
				'order_delivered'                    => array(
					'name'             => 'Order delivered',
					'desc'             => 'Order marked as delivered.',
					'customer_enabled' => true,
					'store_enabled'    => true,
					'admin_enabled'    => false,
					'system_enabled'   => true,
					'email_subject'    => 'Order #[order_id] delivered',
					'email_body'       => '<p>Hello,</p><p>Your order <strong>#[order_id]</strong> has been delivered successfully.</p>',
					'sms_content'      => 'Order #[order_id] delivered successfully.',
					'system_message'   => 'Your order #[order_id] has been delivered.',
					'tag'              => 'Shipping',
					'category'         => 'notification',
				),
				// REFUND NOTIFICATIONS.

				'refund_requested'                   => array(
					'name'             => 'Refund requested',
					'desc' => 'Refund request submitted for the order.',
					'customer_enabled' => true,
					'store_enabled'    => true,
					'admin_enabled'    => true,
					'system_enabled'   => true,
					'email_subject'    => 'Refund requested – Order #[order_id]',
					'email_body'       => '
									<p>Hello,</p><p>A refund request has been submitted for <strong>Order #[order_id]</strong>.</p>
									',
					'sms_content'      => 'Refund requested for order #[order_id].',
					'system_message'   => 'Refund request submitted.',
					'tag'              => 'Refund',
					'category'         => 'activity',
				),

				'refund_accepted'                    => array(
					'name'             => 'Refund accepted',
					'desc'             => 'Refund request approved for the order.',
					'customer_enabled' => true,
					'store_enabled'    => true,
					'admin_enabled'    => true,
					'system_enabled'   => true,
					'email_subject'    => 'Refund approved – Order #[order_id]',
					'email_body'       => '
										<p>Hello,</p>
										<p>The refund request for <strong>Order #[order_id]</strong> has been approved.</p>
										',
					'sms_content'      => 'Refund approved for #[order_id].',
					'system_message'   => 'Refund approved.',
					'tag'              => 'Refund',
					'category'         => 'activity',
				),

				'refund_rejected'                    => array(
					'name'             => 'Refund rejected',
					'desc'             => 'Refund request rejected for the order.',
					'customer_enabled' => true,
					'store_enabled'    => true,
					'admin_enabled'    => true,
					'system_enabled'   => true,
					'email_subject'    => 'Refund rejected – Order #[order_id]',
					'email_body'       => '<p>Hello,</p>
											<p>The refund request for <strong>Order #[order_id]</strong> has been rejected.</p>
											',
					'sms_content'      => 'Refund rejected for #[order_id].',
					'system_message'   => 'Refund rejected.',
					'tag'              => 'Refund',
					'category'         => 'activity',
				),

				// REVIEWS.
				'new_store_review'                   => array(
					'name'             => 'New store review',
					'desc' => 'New customer review submitted for the store.',
					'customer_enabled' => false,
					'store_enabled'    => true,
					'admin_enabled'    => false,
					'system_enabled'   => true,
					'email_subject'    => 'New review received for your store',
					'email_body'       => '<p>Hello,</p><p>A customer has submitted a new review for your store.</p>',
					'sms_content'      => 'New review received for your store.',
					'system_message'   => 'Your store received a new customer review.',
					'tag'              => 'Review',
					'category'         => 'activity',
				),
				// didi product_name remove and text final and review_url remove.
				'review_reply'                       => array(
					'name'             => 'Admin replied to review',
					'desc'             => 'Marketplace admin replies to a review.',
					'customer_enabled' => true,
					'store_enabled'    => false,
					'admin_enabled'    => false,
					'system_enabled'   => true,
					'email_subject'    => 'Marketplace response to your review – [product_name]',
					'email_body'       => '<p>Hello [customer_name],</p><p>The marketplace team has responded to your review for <strong>[store_name]</strong>.</p><p><a href="[review_url]">View reply</a></p>',
					'sms_content'      => 'Marketplace replied to your review.',
					'system_message'   => 'Admin has replied to your review.',
					'tag'              => 'Review',
					'category'         => 'activity',
				),

				// PRODUCT NOTIFICATIONS.
				'product_submitted'                  => array(
					'name'             => 'Product submitted',
					'desc' => 'Product submitted for admin review.',
					'customer_enabled' => false,
					'store_enabled'    => true,
					'admin_enabled'    => true,
					'system_enabled'   => true,
					'email_subject'    => 'Product "[product_name]" submitted for approval',
					'email_body'       => '<p>Hello,</p><p>Your product <strong>[product_name]</strong> has been submitted for review.</p>',
					'sms_content'      => 'Product [product_name] submitted for approval.',
					'system_message'   => 'Your product has been submitted for admin review.',
					'tag'              => 'Product',
					'category'         => 'activity',
				),

				'product_approved'                   => array(
					'name'             => 'Product approved',
					'desc'             => 'Product approved and published.',
					'customer_enabled' => false,
					'store_enabled'    => true,
					'admin_enabled'    => false,
					'system_enabled'   => true,
					'email_subject'    => 'Your product "[product_name]" has been approved',
					'email_body'       => '<p>Hello,</p><p>Your product <strong>[product_name]</strong> is now live on the marketplace.</p>
',
					'sms_content'      => 'Product [product_name] approved.',
					'system_message'   => 'Your product is now live.',
					'tag'              => 'Product',
					'category'         => 'activity',
				),

				'product_rejected'                   => array(
					'name'             => 'Product rejected',
					'desc'             => 'Product rejected after review.',
					'customer_enabled' => false,
					'store_enabled'    => true,
					'admin_enabled'    => false,
					'system_enabled'   => true,
					'email_subject'    => 'Product "[product_name]" was rejected',
					'email_body'       => '<p>Hello,</p><p>Your product <strong>[product_name]</strong> has been rejected after review.</p>
',
					'sms_content'      => 'Product [product_name] rejected.',
					'system_message'   => 'Your product submission was rejected.',
					'tag'              => 'Product',
					'category'         => 'activity',
				),
				// PRO.
				'product_low_stock'                  => array(
					'name'             => 'Product low stock',
					'desc'             => 'Product stock running low.',
					'customer_enabled' => false,
					'store_enabled'    => true,
					'admin_enabled'    => false,
					'system_enabled'   => true,
					'email_subject'    => 'Low stock alert – [product_name]',
					'email_body'       => '<p>Hello,</p><p>Your product <strong>[product_name]</strong> is running low on stock.</p>
',
					'sms_content'      => 'Low stock alert for [product_name].',
					'system_message'   => 'Your product stock is running low.',
					'tag'              => 'Product',
					'category'         => 'notification',
				),
				// PRO.
				'product_out_of_stock'               => array(
					'name'             => 'Product out of stock',
					'desc'             => 'Product is currently unavailable due to no stock.',
					'customer_enabled' => false,
					'store_enabled'    => true,
					'admin_enabled'    => false,
					'system_enabled'   => true,
					'email_subject'    => 'Product out of stock – [product_name]',
					'email_body'       => '<p>Hello,</p><p>Your product <strong>[product_name]</strong> is currently out of stock.</p>
',
					'sms_content'      => 'Product [product_name] is out of stock.',
					'system_message'   => 'Your product is currently out of stock.',
					'tag'              => 'Product',
					'category'         => 'notification',
				),
				// PRODUCT QUESTIONS (Q&A).
				// didi remove question_url.
					'product_question_submitted'     => array(
						'name'             => 'Product question submitted',
						'desc'             => 'Customer submits a question on a product.',
						'customer_enabled' => false,
						'store_enabled'    => true,
						'admin_enabled'    => true,
						'system_enabled'   => true,
						'email_subject'    => 'New product question – [product_name]',
						'email_body'       => '<p>Hello,</p><p>A customer has asked a question about the product <strong>[product_name]</strong>.</p>
<p><strong>Customer:</strong> [customer_name]</p><p>Please review the question and provide a response.</p>
<p><a href="[question_url]">View question</a></p>',
						'sms_content'      => 'New product question.',
						'system_message'   => 'Customer asked a question.',
						'tag'              => 'Product',
						'category'         => 'notification',
					),
				// didi content change.
				'product_question_reply'             => array(
					'name'             => 'Store replied to product question',
					'desc'             => 'Store owner replies to a product question.',
					'customer_enabled' => true,
					'store_enabled'    => false,
					'admin_enabled'    => false,
					'system_enabled'   => true,
					'email_subject'    => 'Answer to your question – [product_name]',
					'email_body'       => '<p>Hello [customer_name],</p><p>The store <strong>[store_name]</strong> has replied to your question regarding <strong>[product_name]</strong>.</p>
<p><a href="[question_url]">View reply</a></p>',
					'sms_content'      => 'Reply to your product question.',
					'system_message'   => 'Question reply received.',
					'tag'              => 'Product',
					'category'         => 'notification',
				),

				// PAYOUT & WITHDRAWAL.
				'payout_received'                    => array(
					'name'           => 'Payout received',
					'desc'           => 'A payment is received for an order.',
					'store_enabled'  => true,
					'admin_enabled'  => true,
					'email_subject'  => 'Payout received',
					'email_body'     => 'Payout for order [order_id] has been received successfully.',
					'sms_content'    => 'Payout received for [order_id].',
					'system_message' => 'Payout for [order_id] received.',
					'tag'            => 'Payment',
					'category'       => 'activity',
				),

				'payout_failed'                      => array(
					'name'           => 'Payout failed',
					'desc'           => 'A payout processing attempt has failed.',
					'admin_enabled'  => true,
					'email_subject'  => 'Payout failed',
					'email_body'     => 'Payout of [amount] for store [store_name] failed.',
					'sms_content'    => 'Payout failed for [store_name].',
					'system_message' => 'Payout error for [store_name].',
					'tag'            => 'Payment',
					'category'       => 'activity',
				),

				'withdrawal_requested'               => array(
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

				'withdrawal_released'                => array(
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

				'withdrawl_rejected'                 => array(
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
				'report_abuse_submitted'             => array(
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

				// ========== ANNOUNCEMENTS ==========
				'system_announcement'                => array(
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

				// STORE FOLLOWER NOTIFICATIONS.
				'store_followed'                     => array(
					'name'             => 'Store followed',
					'desc'             => 'Customer started following the store.',
					'customer_enabled' => false,
					'store_enabled'    => true,
					'admin_enabled'    => false,
					'system_enabled'   => true,
					'email_subject'    => 'You have a new store follower',
					'email_body'       => '
										<p>Hello,</p>
										<p>A customer has started following your store <strong>[store_name]</strong>.</p>
										',
					'sms_content'      => 'You have a new store follower.',
					'system_message'   => 'A customer started following your store.',
					'tag'              => 'Follower',
					'category'         => 'activity',
				),

				'store_new_product_to_followers'     => array(
					'name'             => 'New product from followed store',
					'desc'             => 'New product published by a followed store.',
					'customer_enabled' => true,
					'store_enabled'    => false,
					'admin_enabled'    => false,
					'system_enabled'   => true,
					'email_subject'    => 'New product from "[store_name]"',
					'email_body'       => '
										<p>Hello,</p>
										<p>A store you follow has added a new product <strong>[product_name]</strong>.</p>
										',
					'sms_content'      => 'New product from store you follow.',
					'system_message'   => 'A followed store added a new product.',
					'tag'              => 'Follower',
					'category'         => 'notification',
				),

				'store_new_coupon_to_followers'      => array(
					'name'             => 'New coupon from followed store',
					'desc'             => 'New coupon created by a followed store.',
					'customer_enabled' => true,
					'store_enabled'    => false,
					'admin_enabled'    => false,
					'system_enabled'   => true,
					'email_subject'    => 'New coupon from "[store_name]"',
					'email_body'       => '
											<p>Hello,</p>
											<p>A store you follow has created a new coupon <strong>[coupon_code]</strong>.</p>
											',
					'sms_content'      => 'New coupon available from followed store.',
					'system_message'   => 'A store you follow created a new coupon.',
					'tag'              => 'Follower',
					'category'         => 'notification',
				),
				// Pro.
				'store_vacation_alert_to_followers'  => array(
					'name'             => 'Store vacation alert',
					'desc'             => 'Followed store marked as on vacation.',
					'customer_enabled' => true,
					'store_enabled'    => false,
					'admin_enabled'    => false,
					'system_enabled'   => true,
					'email_subject'    => 'Store "[store_name]" is on vacation',
					'email_body'       => '
											<p>Hello,</p>
											<p>The store you follow <strong>[store_name]</strong> is currently on vacation.</p>
											',
					'sms_content'      => 'Store you follow is on vacation.',
					'system_message'   => 'A store you follow is currently on vacation.',
					'tag'              => 'Follower',
					'category'         => 'notification',
				),

				// WHOLESALE BUYER.(PRO).
				'wholesale_buyer_approved'           => array(
					'name'             => 'Wholesale buyer approved',
					'desc'             => 'User request for wholesale access has been approved.',
					'customer_enabled' => true,
					'store_enabled'    => false,
					'admin_enabled'    => false,
					'system_enabled'   => true,
					'email_subject'    => 'Your wholesale access has been approved',
					'email_body'       => '
										<p>Hello [customer_name],</p>
										<p>Your request for <strong>wholesale buyer access</strong> has been approved.</p>
										<p>You can now log in to your account and view <strong>wholesale pricing</strong> on eligible products across the marketplace.</p>
										<p><a href="[account_url]">Go to your account</a></p>
										',
					'sms_content'      => 'Your wholesale access request has been approved. You can now view wholesale prices.',
					'system_message'   => 'Your wholesale buyer request has been approved. Wholesale pricing is now available to you.',
					'tag'              => 'Wholesale',
					'category'         => 'notification',
				),

				'wholesale_buyer_rejected'           => array(
					'name'             => 'Wholesale buyer rejected',
					'desc'             => 'User request for wholesale access has been rejected.',
					'customer_enabled' => true,
					'store_enabled'    => false,
					'admin_enabled'    => false,
					'system_enabled'   => true,
					'email_subject'    => 'Wholesale access request not approved',
					'email_body'       => '
											<p>Hello [customer_name],</p>
											<p>Your request to register as a <strong>wholesale buyer</strong> could not be approved at this time.</p>
											<p>If you believe this decision was made in error or need further clarification, please contact our support team.</p>
											<p><a href="[support_url]">Contact support</a></p>
										',
					'sms_content'      => 'Your wholesale buyer request was not approved. Please contact support for details.',
					'system_message'   => 'Your wholesale buyer request has been rejected.',
					'tag'              => 'Wholesale',
					'category'         => 'notification',
				),
            )
        );

		if ( ! $is_new ) {
			$table = $wpdb->prefix . Utill::TABLES['system_events'];
			$count = $wpdb->get_var( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
				"SELECT COUNT(*) FROM {$table}" // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			);

			if ( $count > 0 ) {
				return;
			}
		}

		foreach ( $this->events as $key => $event ) {
			$wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
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

		$table = $wpdb->prefix . Utill::TABLES['system_events'];
		$event = $wpdb->get_row( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->prepare(
                "SELECT * FROM {$table} WHERE system_action = %s", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $action_name
            )
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
				if ( is_array( $value ) ) {
					$value = implode( ' ', $value );
				}
				$message = str_replace( '[' . $key . ']', $value, $message );
			}
			$headers = array( 'Content-Type: text/html; charset=UTF-8' );

			wp_mail( $to, $subject, $message, $headers );
		}

		if ( $event->sms_enabled ) {
			$receivers = array();

			if ( $event->admin_enabled ) {
				$parameters['admin_phone'] = $parameters['admin_phone']['country_code'] . $parameters['admin_phone']['sms_receiver_phone_number'];
				$receivers[]               = $parameters['admin_phone'];
			}

			if ( $event->store_enabled ) {
				$receivers[] = $parameters['store_phone'];
			}

			if ( $event->customer_enabled ) {
				$receivers[] = $parameters['customer_phone'];
			}

			$message = $event->sms_content;
			foreach ( $parameters as $key => $value ) {
				if ( is_array( $value ) ) {
					$value = implode( ' ', $value );
				}
				$message = str_replace( '[' . $key . ']', $value, $message );
			}

			$gateway = $this->active_gateway();
			if ( $gateway ) {
				foreach ( array_filter( $receivers ) as $number ) {
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

		$wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
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

		if ( ! empty( $id ) ) {
			$events = $wpdb->get_results( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $wpdb->prepare(
                    "SELECT * FROM $table WHERE id = %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                    $id
                )
			);
		} else {
			$events = $wpdb->get_results( "SELECT * FROM $table" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
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

		return $wpdb->query( "DELETE FROM $table" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
	}

	/**
	 * Sync events with database
	 *
	 * @return void
	 */
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
				$wpdb->delete( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                    "{$wpdb->prefix}" . Utill::TABLES['system_events'],
                    array( 'system_action' => $system_action ),
                    array( '%s' )
				);
			}
		}

		foreach ( $all_events as $key => $event ) {
			if ( array_key_exists( $key, $existing_map ) ) {
				$update_fields = array();

				if ( ! empty( $override_fields ) && in_array( 'override_notifiers', $override_fields, true ) ) {
					$update_fields['admin_enabled']    = $event['admin_enabled'] ?? false;
					$update_fields['customer_enabled'] = $event['customer_enabled'] ?? false;
					$update_fields['store_enabled']    = $event['store_enabled'] ?? false;
				}

				if ( ! empty( $override_fields ) && in_array( 'override_custom', $override_fields, true ) ) {
					$update_fields['custom_emails'] = wp_json_encode( $event['custom_emails'] ?? array() );
				}

				if ( ! empty( $override_fields ) && in_array( 'override_email_content', $override_fields, true ) ) {
					$update_fields['email_subject'] = $event['email_subject'] ?? null;
					$update_fields['email_body']    = $event['email_body'] ?? null;
				}

				if ( ! empty( $override_fields ) && in_array( 'override_sms_content', $override_fields, true ) ) {
					$update_fields['sms_content'] = $event['sms_content'] ?? null;
				}

				if ( ! empty( $override_fields ) && in_array( 'override_system_content', $override_fields, true ) ) {
					$update_fields['system_message'] = $event['system_message'] ?? null;
				}

				if ( ! empty( $update_fields ) ) {
					$wpdb->update( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                        "{$wpdb->prefix}" . Utill::TABLES['system_events'],
                        $update_fields,
                        array( 'system_action' => $key )
					);
				}
			} else {
				$wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
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
	 * @param array $args Query arguments.
	 * @return array|object
	 */
	public function get_all_notifications( $args = array() ) {
		global $wpdb;
		$table = $wpdb->prefix . Utill::TABLES['notifications'];

		$events = $wpdb->get_results( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->prepare(
                "SELECT * FROM $table WHERE is_dismissed = %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                0
            )
		);

		if ( ! empty( $args ) ) {
			$where = array();

			if ( isset( $args['ID'] ) ) {
				$ids     = is_array( $args['ID'] ) ? $args['ID'] : array( $args['ID'] );
				$ids     = implode( ',', array_map( 'intval', $ids ) );
				$where[] = "ID IN ($ids)"; // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
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

			$table   = $wpdb->prefix . Utill::TABLES['notifications'];
			$where[] = 'is_dismissed = 0 AND is_read = 0';

			if ( isset( $args['count'] ) ) {
				$query = "SELECT COUNT(*) FROM {$table}"; // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			} else {
				$query = "SELECT * FROM {$table}"; // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			}

			if ( ! empty( $where ) ) {
				$condition = $args['condition'] ?? ' AND ';
				$query    .= ' WHERE ' . implode( $condition, $where );
			}

			// Keep your pagination logic.
			if ( isset( $args['limit'] ) && isset( $args['offset'] ) && empty( $args['count'] ) ) {
				$limit  = intval( $args['limit'] );
				$offset = intval( $args['offset'] );
				$query .= $wpdb->prepare( ' LIMIT %d OFFSET %d', $limit, $offset );
			}

			if ( isset( $args['count'] ) ) {
				$results = $wpdb->get_var( $query ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
				return $results ?? 0;
			} else {
				$results = $wpdb->get_results( $query, ARRAY_A ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
				return $results ?? array();
			}
		}

		return $events;
	}

	/**
	 * Clear notifications based on settings.
	 *
	 * Deletes notifications that are expired or older than the configured number of days.
	 *
	 * @return void
	 */
	public function multivendorx_clear_notifications() {
		global $wpdb;

		$days  = MultiVendorX()->setting->get_setting( 'clear_notifications' );
		$table = $wpdb->prefix . Utill::TABLES['notifications'];

		$current_date = current_time( 'mysql' );

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$query = $wpdb->prepare(
            "
        DELETE FROM {$table}
        WHERE (expires_at IS NOT NULL AND expires_at < %s)
        OR (created_at < DATE_SUB(%s, INTERVAL %d DAY))
        ",
            $current_date,
            $current_date,
            $days
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared

		$wpdb->query( $query ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
	}

	/**
	 * Get the active SMS gateway instance.
	 *
	 * This function retrieves the SMS gateway selected in the MultiVendorX settings.
	 * It applies the 'multivendorx_available_sms_gateways' filter to allow custom gateways.
	 *
	 * @return object|false Returns an instance of the selected gateway class, or false if none is selected.
	 */
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
