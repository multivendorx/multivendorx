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
 * @version     5.0.0
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
				'store_pending_approval'              => array(
					'name'                   => 'Store pending approval',
					'desc'                   => 'Triggered when a new store application is submitted and placed under admin review.',
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => true,
					'system_enabled'         => true,
					'email_subject'          => 'Your store application is under review',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#e8fbea;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e8fbea;font-size:1.313'>Store pending approval</h1>
								<div style='color:#555555;font-size:0.95'>Your store application is awaiting review</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>Your store [store_name] has been successfully submitted on [marketplace_name] and is currently pending admin approval.</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>The store will become visible to customers once the review process is completed and approval is granted.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#eeeded;margin-top:2;border-radius:0.31'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:1.313'>What happens next</h1>
								<div style='font-size:0.95;padding-left:0.85;padding-top:0.625'>i) The admin will review your store details and submitted information</div>
								<div style='padding-top:0.313;padding-left:0.85;font-size:0.95'>ii) You may be contacted if additional details are required</div>
								<div style='font-size:0.95;padding-top:0.313;padding-left:0.85'>iii) You will receive a notification once your store is approved or if changes are needed</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>No action is required at this moment. We will notify you once the review process is completed.</div>",
					'sms_content'            => 'Store [store_name] is pending approval.',
					'available_placeholders' => array(
						'[store_name]',
						'[marketplace_name]',
					),
					'system_message'         => 'Your store is currently under admin review.',
					'tag'                    => 'Store',
					'category'               => 'activity',
				),
				'store_rejected'                      => array(
					'name'                   => 'Store rejected',
					'desc'                   => 'Admin rejected the store application.',
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Your store application was rejected',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#f2cfcf;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:1.313'>Store application rejected</h1>
								<div style='color:#e92525;font-size:0.95'>Changes are required before resubmission</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello [store_name],</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>We've reviewed your store <strong>[store_name]</strong> on <strong>[marketplace_name]</strong>, and it does not meet our current marketplace requirements.</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>This usually happens when some details are incomplete or do not align with our policies.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#eeeded;margin-top:2;border-radius:0.31'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:1.313'>What you can do next</h1>
								<div style='font-size:0.95;padding-left:0.85;padding-top:0.625'>i) Review your store details and descriptions</div>
								<div style='padding-top:0.313;padding-left:0.85;font-size:0.95'>ii) Update any missing or incorrect information</div>
								<div style='font-size:0.95;padding-top:0.313;padding-left:0.85'>iii) Ensure your store follows marketplace policies before resubmitting</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>Once you've made the necessary updates, you can submit your application again for review.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[marketplace_name]',
					),
					'sms_content'            => 'Store application rejected.',
					'system_message'         => 'Your store application has been rejected.',
					'tag'                    => 'Store',
					'category'               => 'activity',
				),
				'store_permanently_rejected'          => array(
					'name'                   => 'Store permanently rejected',
					'desc'                   => 'Permanent rejection of a store application by the admin',
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => true,
					'system_enabled'         => true,
					'email_subject'          => 'Your store application has been permanently rejected',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#f2cfcf;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:1.313'>Store application permanently rejected</h1>
								<div style='color:#e92525;font-size:0.95'>This decision cannot be reversed</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>We've reviewed your store [store_name] on [marketplace_name], and it has been permanently rejected due to policy violations.</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>This means the application does not meet our marketplace requirements and cannot be approved or resubmitted.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#eeeded;margin-top:2;border-radius:0.31'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:1.313'>What this means</h1>
								<div style='font-size:0.95;padding-left:0.85;padding-top:0.625'>i) The store cannot be activated on the marketplace</div>
								<div style='padding-top:0.313;padding-left:0.85;font-size:0.95'>ii) This decision is final and cannot be changed</div>
								<div style='font-size:0.95;padding-top:0.313;padding-left:0.85'>iii) You will not be able to reapply for this store</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>If you believe this decision requires clarification, you may contact the marketplace administrator for more details.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[marketplace_name]',
					),
					'sms_content'            => 'Store application permanently rejected.',
					'system_message'         => 'Your store application has been permanently rejected.',
					'tag'                    => 'Store',
					'category'               => 'activity',
				),
				'store_account_created_by_admin'      => array(
					'name'                   => 'Store account created by admin',
					'desc'                   => 'Admin manually created store account.',
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Your store account has been created – [store_name]',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#e8fbea;margin-bottom:3;border-radius:0.313;color:#703333'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e8fbea;font-size:1.313'>Store account created</h1>
								<div style='color:#555555;font-size:0.95'>Your store account is now active</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello, </h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>An account for your store [store_name] has been created by the admin on [marketplace_name].</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>You can now access your store dashboard and start setting up your store details, products, and preferences.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#eeeded;margin-top:2;border-radius:0.31'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:1.313'>Common reasons for rejection</h1>
								<div style='font-size:0.95;padding-left:0.85;padding-top:0.625'>i) Log in to your store dashboard using your account credentials</div>
								<div style='padding-top:0.313;padding-left:0.85;font-size:0.95'>ii) Complete your store profile and business information</div>
								<div style='font-size:0.95;padding-top:0.313;padding-left:0.85'>iii) Start adding products and configuring your store settings</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>No further action is required to activate your account. You can begin managing your store immediately.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[marketplace_name]',
					),
					'sms_content'            => 'Your store account for [store_name] has been created. Please log in to get started.',
					'system_message'         => 'Your store account for [store_name] has been created by the marketplace admin.',
					'tag'                    => 'Store',
					'category'               => 'notification',
				),
				// POST ACTIVATION FLOW.
				'store_activated'                     => array(
					'name'                   => 'Store activated',
					'desc'                   => 'Store activated and ready to start selling.',
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Your store "[store_name]" is now active',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#e8fbea;margin-bottom:3;border-radius:0.313;color:#703333'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e8fbea;font-size:1.313'>Store account created</h1>
								<div style='color:#555555;font-size:0.95'>Your store account is now active</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>An account for your store [store_name] has been created by the admin on [marketplace_name].</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>You can now access your store dashboard and start setting up your store details, products, and preferences.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#eeeded;margin-top:2;border-radius:0.31'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:1.313'>What you can do now</h1>
								<div style='font-size:0.95;padding-left:0.85;padding-top:0.625'>i) Log in to your store dashboard using your account credentials</div>
								<div style='padding-top:0.313;padding-left:0.85;font-size:0.95'>ii) Complete your store profile and business information</div>
								<div style='font-size:0.95;padding-top:0.313;padding-left:0.85'>iii) Start adding products and configuring your store settings</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>No further action is required to activate your account. You can begin managing your store immediately.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[marketplace_name]',
					),
					'sms_content'            => 'Store [store_name] is now active.',
					'system_message'         => 'Your store has been activated.',
					'tag'                    => 'Store',
					'category'               => 'activity',
				),
				'store_under_review'                  => array(
					'name'                   => 'Store under review',
					'desc'                   => 'Store temporarily placed under admin review.',
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => true,
					'system_enabled'         => true,
					'email_subject'          => 'Your store "[store_name]" is under review',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#fffce8;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#d4b86a;background-color:#fffce8;font-size:1.313'>Store under review</h1>
								<div style='color:#555555;font-size:0.95'>Your store application is being reviewed</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>Your store [store_name] has been successfully submitted on [marketplace_name] and is currently under review.</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>Our team is carefully checking your store details to ensure everything meets our marketplace standards and policies.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#eeeded;margin-top:2;border-radius:0.31'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:1.313'>What you can do now</h1>
								<div style='font-size:0.95;padding-left:0.85;padding-top:0.625'>i) The admin will review your store information and documents</div>
								<div style='padding-top:0.313;padding-left:0.85;font-size:0.95'>ii) You may be contacted if any additional details are required</div>
								<div style='font-size:0.95;padding-top:0.313;padding-left:0.85'>iii) You will receive a notification once the review is completed</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>No action is required from your side at this moment. We will notify you as soon as your store status is updated.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[marketplace_name]',
					),
					'system_message'         => 'Your store has been placed under review.',
					'tag'                    => 'Store',
					'category'               => 'activity',
				),
				'store_suspended'                     => array(
					'name'                   => 'Store suspended',
					'desc'                   => 'Store temporarily suspended by the admin.',
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => true,
					'system_enabled'         => true,
					'email_subject'          => 'Your store "[store_name]" has been suspended',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#e6f4ff;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6e9fd1;background-color:#e6f4ff;font-size:1.313'>Store suspended</h1>
								<div style='color:#555555;font-size:0.95'>Your store has been temporarily suspended</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>We would like to inform you that your store [store_name] on [marketplace_name] has been temporarily suspended by the admin due to policy or compliance reasons.</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>During this period, your store will not be visible to customers, and new orders cannot be placed.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#eeeded;margin-top:2;border-radius:0.31'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:1.313'>What you can do now</h1>
								<div style='font-size:0.95;padding-left:0.85;padding-top:0.625'>i) Your store is temporarily hidden from the marketplace</div>
								<div style='padding-top:0.313;padding-left:0.85;font-size:0.95'>ii) Product listings and sales activities are paused</div>
								<div style='font-size:0.95;padding-top:0.313;padding-left:0.85'>iii) Existing orders (if any) will be handled as per marketplace policy</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>If you believe this action was taken in error or wish to resolve the issue, please contact the marketplace support team for further assistance.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[marketplace_name]',
					),
					'sms_content'            => 'Store [store_name] suspended.',
					'system_message'         => 'Your store has been suspended.',
					'tag'                    => 'Store',
					'category'               => 'activity',
				),
				'store_permanently_deactivated'       => array(
					'name'                   => 'Store permanently deactivated',
					'desc'                   => 'Admin permanently deactivated the store.',
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => true,
					'system_enabled'         => true,
					'email_subject'          => 'Your store "[store_name]" has been permanently deactivated',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#f2cfcf;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:1.313'>Store permanently deactivated</h1>
								<div style='color:#e92525;font-size:0.95'>Your store is no longer active on the marketplace</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>We would like to inform you that your store [store_name] on [marketplace_name] has been permanently deactivated by the admin due to policy or compliance reasons.</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>This action is final, and the store will no longer be available on the marketplace.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#eeeded;margin-top:2;border-radius:0.31'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:1.313'>What you can do now</h1>
								<div style='font-size:0.95;padding-left:0.85;padding-top:0.625'>i) Your store has been permanently removed from the marketplace</div>
								<div style='padding-top:0.313;padding-left:0.85;font-size:0.95'>ii) All product listings and store activities have been disabled</div>
								<div style='font-size:0.95;padding-top:0.313;padding-left:0.85'>iii) Customers will no longer be able to view or purchase from your store</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>If you need clarification regarding this decision, you may contact the marketplace support team for assistance.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[marketplace_name]',
					),
					'sms_content'            => 'Store [store_name] permanently deactivated.',
					'system_message'         => 'Your store has been permanently deactivated.',
					'tag'                    => 'Store',
					'category'               => 'activity',
				),
				'store_account_deactivation_request'  => array(
					'name'                   => 'Store account deactivation request',
					'desc'                   => 'Store owner requests deactivation of their store account.',
					'customer_enabled'       => false,
					'store_enabled'          => false,
					'admin_enabled'          => true,
					'system_enabled'         => true,
					'email_subject'          => 'Store deactivation request – [store_name]',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#f2cfcf;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:1.313'>Store deactivation request received</h1>
								<div style='color:#e92525;font-size:0.95'>We are processing your store deactivation request</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>We have received your request to deactivate your store [store_name] on [marketplace_name].</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>Our team is currently reviewing your request to ensure all pending activities are properly handled before deactivation.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#eeeded;margin-top:2;border-radius:0.31'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:1.313'>What you can do now</h1>
								<div style='font-size:0.95;padding-left:0.85;padding-top:0.625'>i) Your store details and ongoing orders will be reviewed</div>
								<div style='padding-top:0.313;padding-left:0.85;font-size:0.95'>ii) You may be contacted if any clarification or action is required</div>
								<div style='font-size:0.95;padding-top:0.313;padding-left:0.85'>iii) You will be notified once the deactivation process is completed</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>No action is required from your side at this moment. We will update you once your request has been processed.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[marketplace_name]',
					),
					'sms_content'            => 'Store [store_name] requested account deactivation.',
					'system_message'         => 'Store [store_name] has requested to deactivate their store account.',
					'tag'                    => 'Store',
					'category'               => 'activity',
				),
				'store_deactivation_request_rejected' => array(
					'name'                   => 'Store deactivation rejected',
					'desc'                   => 'Store deactivation request rejected by the admin.',
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Your store "[store_name]" deactivation request has been rejected',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#f2cfcf;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:1.313'>Store deactivation rejected</h1>
								<div style='color:#e92525;font-size:0.95'>Your store deactivation request was not approved</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>We would like to inform you that your request to deactivate your store [store_name] has been reviewed and was not approved by the admin.</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>Your store will continue to remain active on the marketplace.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#eeeded;margin-top:2;border-radius:0.31'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:1.313'>Common reasons for rejection</h1>
								<div style='font-size:0.95;padding-left:0.85;padding-top:0.625'>i) There are pending orders or ongoing transactions in your store</div>
								<div style='padding-top:0.313;padding-left:0.85;font-size:0.95'>ii) Required information or actions are still incomplete</div>
								<div style='font-size:0.95;padding-top:0.313;padding-left:0.85'>iii) The store does not currently meet deactivation conditions as per marketplace policy</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>If you need further assistance, please contact the marketplace support team for more details or guidance.</div>",
					'available_placeholders' => array(
						'[store_name]',
					),
					'sms_content'            => 'Store [store_name] deactivation request has been rejected',
					'system_message'         => 'Your store deactivation request has been rejected.',
					'tag'                    => 'Store',
					'category'               => 'activity',
				),
				// ORDER NOTIFICATIONS.
				'new_order_store'                     => array(
					'name'                   => 'New order received',
					'desc'                   => 'New order received by the store.',
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => true,
					'system_enabled'         => true,
					'email_subject'          => 'New order received – Order #[order_id]',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#e8fbea;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e8fbea;font-size:1.313'>New order received</h1>
								<div style='color:#555555;font-size:0.95'>You have received a new order</div>
							</td>
						</tr>
					</tr>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>Good news! You have received a new order from a customer on your store [store_name]</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>Please review the order details and proceed with fulfillment as soon as possible.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#eeeded;margin-top:2;border-radius:0.31'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:1.313'>What you can do now</h1>
								<div style='font-size:0.95;padding-left:0.85;padding-top:0.625'>i) A new order has been placed in your store dashboard</div>
								<div style='padding-top:0.313;padding-left:0.85;font-size:0.95'>ii) Customer details and order items are available for review</div>
								<div style='font-size:0.95;padding-top:0.313;padding-left:0.85'>iii) Please confirm and process the order within the expected handling time</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>Prompt action is recommended to ensure timely delivery and a smooth customer experience.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[order_id]',
					),
					'sms_content'            => 'New order #[order_id] received.',
					'system_message'         => 'New order received.',
					'tag'                    => 'Order',
					'category'               => 'activity',
				),
				'order_processing'                    => array(
					'name'                   => 'Order processing',
					'desc'                   => 'An order status is changed to processing.',
					'store_enabled'          => true,
					'customer_enabled'       => true,
					'email_subject'          => 'Order processing started',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#fffce8;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#d4b86a;background-color:#fff7ec;font-size:1.313'>Order processing started</h1>
								<div style='color:#555555;font-size:0.95'>Your order is now being prepared</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>Your order #[order_id] from [store_name] is now being processed by the seller.</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>This means your items are being prepared, packed, and readied for shipment.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#eeeded;margin-top:2;border-radius:0.31'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:1.313'>What happens next</h1>
								<div style='font-size:0.95;padding-left:0.85;padding-top:0.625'>i) The store will prepare and pack order items</div>
								<div style='padding-top:0.313;padding-left:0.85;font-size:0.95'>ii) Order will be handed over to the delivery partner</div>
								<div style='font-size:0.95;padding-top:0.313;padding-left:0.85'>iii) Customer will receive tracking details once the order is shipped</div>
							</td>
						</tr>
					</tr>",
					'available_placeholders' => array(
						'[store_name]',
						'[order_id]',
					),
					'sms_content'            => 'Order [order_id] is now processing.',
					'system_message'         => 'Order [order_id] status: Processing.',
					'tag'                    => 'Order',
					'category'               => 'activity',
				),
				'order_completed'                     => array(
					'name'                   => 'Order completed',
					'desc'                   => 'An order is completed successfully.',
					'store_enabled'          => true,
					'customer_enabled'       => true,
					'email_subject'          => 'Order completed',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#e8fbea;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e8fbea;font-size:1.313'>Order completed</h1>
								<div style='color:#555555;font-size:0.95'>Your order has been successfully delivered</div>
							</td>
						</tr>
					</td>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>We're happy to inform you that your order #[order_id] from [store_name] on [marketplace_name] has been successfully completed.</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>We hope you are satisfied with your purchase.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#eeeded;margin-top:2;border-radius:0.31'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:1.313'>What's next</h1>
								<div style='font-size:0.95;padding-left:0.85;padding-top:0.625'>i) You can view your order details in your account</div>
								<div style='padding-top:0.313;padding-left:0.85;font-size:0.95'>ii) You may download your invoice if needed</div>
								<div style='font-size:0.95;padding-top:0.313;padding-left:0.85'>iii) You can leave a review for the product and store experience</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>Thank you for shopping with us. We look forward to serving you again.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[order_id]',
						'[marketplace_name]',
					),
					'sms_content'            => 'Order [order_id] completed successfully.',
					'system_message'         => 'Order [order_id] marked as completed.',
					'tag'                    => 'Order',
					'category'               => 'activity',
				),
				'order_cancelled'                     => array(
					'name'                   => 'Order cancelled',
					'desc'                   => 'An order is cancelled by the customer or admin.',
					'store_enabled'          => true,
					'customer_enabled'       => true,
					'admin_enabled'          => true,
					'email_subject'          => 'Order cancelled',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#f2cfcf;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:1.313'>Order cancelled</h1>
								<div style='color:#e92525;font-size:0.95'>Your order has been cancelled</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>We would like to inform you that your order #[order_id] from [store_name] on [marketplace_name] has been cancelled.</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>If any payment was made, the refund (if applicable) will be processed as per the marketplace refund policy.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#eeeded;margin-top:2;border-radius:0.31'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:1.313'>Common reasons for rejection</h1>
								<div style='font-size:0.95;padding-left:0.85;padding-top:0.625'>i) The order will not be processed or shipped</div>
								<div style='padding-top:0.313;padding-left:0.85;font-size:0.95'>ii) Any payment made will be refunded if eligible</div>
								<div style='font-size:0.95;padding-top:0.313;padding-left:0.85'>iii) You can place a new order anytime</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>If you have any questions, please contact our support team for assistance.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[order_id]',
						'[marketplace_name]',
					),
					'sms_content'            => 'Order [order_id] cancelled successfully.',
					'system_message'         => 'Order [order_id] cancelled.',
					'tag'                    => 'Order',
					'category'               => 'activity',
				),
				'order_refunded'                      => array(
					'name'                   => 'Order refunded',
					'desc'                   => 'A refund is issued for an order.',
					'store_enabled'          => true,
					'customer_enabled'       => true,
					'email_subject'          => 'Order refunded',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#f2cfcf;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:1.313'>Order refunded</h1>
								<div style='color:#e92525;font-size:0.95'>Your refund has been successfully processed</div>
							</td>
						</tr>
					</tr>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>We're happy to inform you that your refund for order #[order_id] from [store_name] on [marketplace_name] has been successfully processed.</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>The refunded amount has been returned to your original payment method.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#eeeded;margin-top:2;border-radius:0.31'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:1.313'>Refund details</h1>
								<div style='font-size:0.95;padding-left:0.85;padding-top:0.625'>i) Refund has been initiated for the eligible amount</div>
								<div style='padding-top:0.313;padding-left:0.85;font-size:0.95'>ii) It may take a few business days to reflect in your account depending on your payment provider</div>
								<div style='font-size:0.95;padding-top:0.313;padding-left:0.85'>iii) You can check the refund status in your order history</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>If you do not see the refund after the expected time, please contact our support team for assistance.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[order_id]',
						'[marketplace_name]',
					),
					'sms_content'            => 'Refund for [order_id] processed.',
					'system_message'         => 'Order [order_id] refunded.',
					'tag'                    => 'Order',
					'category'               => 'activity',
				),
				// SHIPMENT TRACKING.
				'shipment_tracking_added'             => array(
					'name'                   => 'Shipment tracking added',
					'desc'                   => 'Tracking details added for the order shipment.',
					'customer_enabled'       => true,
					'store_enabled'          => false,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Tracking added – Order #[order_id]',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#f2cfcf;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:1.313'>Shipment tracking updated</h1>
								<div style='color:#e92525;font-size:0.95'>Your order has been shipped and tracking is now available</div>
							</td>
						</tr>
					</tr>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>Good news! Your order #[order_id] from [store_name] on [marketplace_name] has been shipped. You can now track your shipment using the details below.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#eeeded;margin-top:2;border-radius:0.31'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:1.313'>Tracking details</h1>
								<div style='font-size:0.95;padding-left:0.85;padding-top:0.625'>Shipping Provider: [shipping_provider_name]</div>
								<div style='padding-top:0.313;padding-left:0.85;font-size:0.95'>Tracking ID: [tracking_id]</div>
								<div style='font-size:0.95;padding-top:0.313;padding-left:0.85'>Tracking URL: [shipping_url]</div>
							</td>
						</tr>
					</tr>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>You can use the tracking link above to check real-time delivery updates. We'll also keep you informed about major status changes.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[order_id]',
						'[marketplace_name]',
						'[shipping_provider_name]',
						'[tracking_id]',
						'[shipping_url]',
					),
					'sms_content'            => 'Tracking added for order #[order_id].',
					'system_message'         => 'Tracking information added to your order.',
					'tag'                    => 'Shipping',
					'category'               => 'notification',
				),
				// Pro.
				'order_delivered'                     => array(
					'name'                   => 'Order delivered',
					'desc'                   => 'Order marked as delivered.',
					'customer_enabled'       => true,
					'store_enabled'          => true,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Order #[order_id] delivered',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#f2cfcf;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:1.313'>Order delivered</h1>
								<div style='color:#e92525;font-size:0.95'>Your order has been successfully delivered</div>
							</td>
						</tr>
					</tr>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>We're happy to inform you that your order #[order_id] from [store_name] on [marketplace_name] has been successfully delivered.</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>We hope your package has reached you safely.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#eeeded;margin-top:2;border-radius:0.31'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:1.313'>Common reasons for rejection</h1>
								<div style='font-size:0.95;padding-left:0.85;padding-top:0.625'>i) Confirm that all items are received in good condition</div>
								<div style='padding-top:0.313;padding-left:0.85;font-size:0.95'>ii) Download your invoice from your order history if needed</div>
								<div style='font-size:0.95;padding-top:0.313;padding-left:0.85'>iii) Leave a review for the product and seller experience</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>Thank you for shopping with us. We hope to see you again soon.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[order_id]',
						'[marketplace_name]',
					),
					'sms_content'            => 'Order #[order_id] delivered successfully.',
					'system_message'         => 'Your order #[order_id] has been delivered.',
					'tag'                    => 'Shipping',
					'category'               => 'notification',
				),
				// REFUND NOTIFICATIONS.
				'refund_requested'                    => array(
					'name'                   => 'Refund requested',
					'desc'                   => 'Refund request submitted for the order.',
					'customer_enabled'       => true,
					'store_enabled'          => true,
					'admin_enabled'          => true,
					'system_enabled'         => true,
					'email_subject'          => 'Refund requested – Order #[order_id]',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#f2cfcf;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:1.313'>Refund requested</h1>
								<div style='color:#e92525;font-size:0.95'>Your refund request has been received</div>
							</td>
						</tr>
					</tr>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>We have received your refund request for order #[order_id] from [store_name] on [marketplace_name].</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>Our team will review your request based on the marketplace refund policy and order details.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#eeeded;margin-top:2;border-radius:0.31'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:1.313'>What happens next</h1>
								<div style='font-size:0.95;padding-left:0.85;padding-top:0.625'>i) The refund request will be reviewed by the admin or store owner</div>
								<div style='padding-top:0.313;padding-left:0.85;font-size:0.95'>ii) You may be contacted if additional information is required</div>
								<div style='font-size:0.95;padding-top:0.313;padding-left:0.85'>iii) You will receive an update once the review is completed</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>Once you've addressed the relevant requirements, you're welcome to resubmit your application through the Play Console.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[order_id]',
						'[marketplace_name]',
					),
					'sms_content'            => 'Refund requested for order #[order_id].',
					'system_message'         => 'Refund request submitted.',
					'tag'                    => 'Refund',
					'category'               => 'activity',
				),
				'refund_accepted'                     => array(
					'name'                   => 'Refund accepted',
					'desc'                   => 'Refund request approved for the order.',
					'customer_enabled'       => true,
					'store_enabled'          => true,
					'admin_enabled'          => true,
					'system_enabled'         => true,
					'email_subject'          => 'Refund approved – Order #[order_id]',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#e8fbea;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e8fbea;font-size:1.313'>Refund approved</h1>
								<div style='color:#555555;font-size:0.95'>Your refund request has been accepted</div>
							</td>
						</tr>
					</tr>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>Good news! Your refund request for order #[order_id] from [store_name] on [marketplace_name] has been approved.</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>The refund process has now been initiated as per the marketplace refund policy.</div>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>If you have any questions, please contact our support team for further assistance.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[order_id]',
						'[marketplace_name]',
					),
					'sms_content'            => 'Refund approved for #[order_id].',
					'system_message'         => 'Refund approved.',
					'tag'                    => 'Refund',
					'category'               => 'activity',
				),
				'refund_rejected'                     => array(
					'name'                   => 'Refund rejected',
					'desc'                   => 'Refund request rejected for the order.',
					'customer_enabled'       => true,
					'store_enabled'          => true,
					'admin_enabled'          => true,
					'system_enabled'         => true,
					'email_subject'          => 'Refund rejected – Order #[order_id]',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#f2cfcf;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:1.313'>Refund rejected</h1>
								<div style='color:#e92525;font-size:0.95'>Your refund request was not approved</div>
							</td>
						</tr>
					</tr>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>We would like to inform you that your refund request for order #[order_id] from [store_name] on [marketplace_name] has been reviewed and was not approved as per our refund policy.</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>To help you understand next steps, please review the key areas below before reapplying</div>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>If you need more clarification, please contact our support team for assistance.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[order_id]',
						'[marketplace_name]',
					),
					'sms_content'            => 'Refund rejected for #[order_id].',
					'system_message'         => 'Refund rejected.',
					'tag'                    => 'Refund',
					'category'               => 'activity',
				),
				// REVIEWS.
				'new_store_review'                    => array(
					'name'                   => 'New store review',
					'desc'                   => 'New customer review submitted for the store.',
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'New review received for your store',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#e8fbea;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e8fbea;font-size:1.313'>New store review received</h1>
								<div style='color:#555555;font-size:0.95'>A customer has left a review for your store</div>
							</td>
						</tr>
					</tr>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>You have received a new review for your store [store_name] on [marketplace_name].</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>Customer feedback helps improve your store reputation and build trust with future buyers.</div>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>Keep up the great work and continue delivering a great shopping experience.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[marketplace_name]',
					),
					'sms_content'            => 'New review received for your store.',
					'system_message'         => 'Your store received a new customer review.',
					'tag'                    => 'Review',
					'category'               => 'activity',
				),
				'review_reply'                        => array(
					'name'                   => 'Admin replied to review',
					'desc'                   => 'Marketplace admin replies to a review.',
					'customer_enabled'       => true,
					'store_enabled'          => false,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Marketplace response to your review – [product_name]',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#fff7ec;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#d4b86a;background-color:#fff7ec;font-size:1.313'>Admin replied to your review</h1>
								<div style='color:#555555;font-size:0.95'>Your review has received a response</div>
							</td>
						</tr>
					</tr>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>The admin has responded to your review for store [store_name] on [marketplace_name].</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>You can view the full reply and any additional details in your account.</div>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>Thank you for sharing your feedback. It helps improve the marketplace experience for everyone.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[product_name]',
						'[marketplace_name]',
					),
					'sms_content'            => 'Marketplace replied to your review.',
					'system_message'         => 'Admin has replied to your review.',
					'tag'                    => 'Review',
					'category'               => 'activity',
				),
				// PRODUCT NOTIFICATIONS.
				'product_submitted'                   => array(
					'name'                   => 'Product submitted',
					'desc'                   => 'Product submitted for admin review.',
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => true,
					'system_enabled'         => true,
					'email_subject'          => 'Product "[product_name]" submitted for approval',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#e8fbea;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e8fbea;font-size:1.313'>Product submitted for approval</h1>
								<div style='color:#555555;font-size:0.95'>A new product is waiting for review</div>
							</td>
						</tr>
					</tr>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>A new product has been submitted by store [store_name] on [marketplace_name] and is currently awaiting your approval.</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>The product will be visible to customers only after it is approved.</div>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>Please review the submission and approve or reject it based on marketplace guidelines.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[product_name]',
						'[marketplace_name]',
					),
					'sms_content'            => 'Product [product_name] submitted for approval.',
					'system_message'         => 'Your product has been submitted for admin review.',
					'tag'                    => 'Product',
					'category'               => 'activity',
				),
				'product_approved'                    => array(
					'name'                   => 'Product approved',
					'desc'                   => 'Product approved and published.',
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Your product "[product_name]" has been approved',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#e8fbea;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e6fbea;font-size:1.313'>Product approved</h1>
								<div style='color:#555555;font-size:0.95'>Your product is now live on the marketplace</div>
							</td>
						</tr>
					</tr>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>Good news! Your product [product_name] submitted for [store_name] on [marketplace_name] has been reviewed and approved by the admin.</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>The product is now visible to customers and available for purchase on the marketplace.</div>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>Your product is now live. Continue adding great products to grow your store.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[product_name]',
						'[marketplace_name]',
					),
					'sms_content'            => 'Product [product_name] approved.',
					'system_message'         => 'Your product is now live.',
					'tag'                    => 'Product',
					'category'               => 'activity',
				),
				'product_rejected'                    => array(
					'name'                   => 'Product rejected',
					'desc'                   => 'Product rejected after review.',
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Product "[product_name]" was rejected',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#f2cfcf;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:1.313'>Product rejected</h1>
								<div style='color:#e92525;font-size:0.95'>Your product was not approved for publishing</div>
							</td>
						</tr>
					</tr>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>We would like to inform you that your product [product_name] submitted from store [store_name] on [marketplace_name] has been reviewed and was not approved by the admin.</div>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>You may review the product details, make the necessary updates, and submit it again for approval.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[product_name]',
						'[marketplace_name]',
					),
					'sms_content'            => 'Product [product_name] rejected.',
					'system_message'         => 'Your product submission was rejected.',
					'tag'                    => 'Product',
					'category'               => 'activity',
				),
				// PRO.
				'product_low_stock'                   => array(
					'name'                   => 'Product low stock',
					'desc'                   => 'Product stock running low.',
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Low stock alert – [product_name]',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#f2cfcf;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:1.313'>Product low stock alert</h1>
								<div style='color:#e92525;font-size:0.95'>Your product inventory is running low</div>
							</td>
						</tr>
					</tr>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>This is a quick reminder that the stock for your product [product_name] in store [store_name] on [marketplace_name] is running low.</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>To avoid missing potential sales, we recommend updating your inventory soon.</div>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>Keeping your inventory updated helps ensure a smooth shopping experience for your customers.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[product_name]',
						'[marketplace_name]',
					),
					'sms_content'            => 'Low stock alert for [product_name].',
					'system_message'         => 'Your product stock is running low.',
					'tag'                    => 'Product',
					'category'               => 'notification',
				),
				// PRO.
				'product_out_of_stock'                => array(
					'name'                   => 'Product out of stock',
					'desc'                   => 'Product is currently unavailable due to no stock.',
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Product out of stock – [product_name]',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#f2cfcf;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:1.313'>Product out of stock</h1>
								<div style='color:#e92525;font-size:0.95'>Your product is currently unavailable for purchase</div>
							</td>
						</tr>
					</tr>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>The product [product_name] from your store [store_name] on [marketplace_name] is now out of stock.</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>Customers will not be able to purchase this product until the inventory is updated.</div>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>Update the product inventory from your store dashboard to make it available for customers again.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[product_name]',
						'[marketplace_name]',
					),
					'sms_content'            => 'Product [product_name] is out of stock.',
					'system_message'         => 'Your product is currently out of stock.',
					'tag'                    => 'Product',
					'category'               => 'notification',
				),
				// PRODUCT QUESTIONS (Q&A).
				'product_question_submitted'          => array(
					'name'                   => 'Product question submitted',
					'desc'                   => 'Customer submits a question on a product.',
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => true,
					'system_enabled'         => true,
					'email_subject'          => 'New product question – [product_name]',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#e8fbea;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e8fbea;font-size:1.313'>New product question received</h1>
								<div style='color:#555555;font-size:0.95'>A customer has asked a question about your product.</div>
							</td>
						</tr>
					</tr>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>A customer has submitted a question for the product [product_name] from your store [store_name] on [marketplace_name].</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>Responding promptly can help customers make informed purchase decisions</div>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>Providing clear and timely answers helps build trust and improve the shopping experience.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[product_name]',
						'[marketplace_name]',
					),
					'sms_content'            => 'New product question.',
					'system_message'         => 'Customer asked a question.',
					'tag'                    => 'Product',
					'category'               => 'notification',
				),
				'product_question_reply'              => array(
					'name'                   => 'Store replied to product question',
					'desc'                   => 'Store owner replies to a product question.',
					'customer_enabled'       => true,
					'store_enabled'          => false,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Answer to your question – [product_name]',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#e6f4ff;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6e9fd1;background-color:#e6f4ff;font-size:1.313'>Store replied to your question</h1>
								<div style='color:#555555;font-size:0.95'></div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>The store [store_name] has replied to your question about the product [product_name] on [marketplace_name].</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>You can now view the response and continue the conversation if needed.</div>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>Thank you for engaging with the store. We hope the response helps you make an informed purchase decision.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[product_name]',
						'[marketplace_name]',
					),
					'sms_content'            => 'Reply to your product question.',
					'system_message'         => 'Question reply received.',
					'tag'                    => 'Product',
					'category'               => 'notification',
				),
				// PAYOUT & WITHDRAWAL.
				'payout_received'                     => array(
					'name'                   => 'Payout received',
					'desc'                   => 'A payment is received for an order.',
					'store_enabled'          => true,
					'admin_enabled'          => true,
					'email_subject'          => 'Payout received',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#e8fbea;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e8fbea;font-size:1.313'>Payout received</h1>
								<div style='color:#555555;font-size:0.95'>Your earnings have been successfully transferred</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>Good news! A payout for your earnings from [store_name] on [marketplace_name] has been successfully processed.</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>The amount has been transferred to your registered payout account.</div>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>You can check your earnings and payout history anytime from your dashboard.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[marketplace_name]',
						'[order_id]',
					),
					'sms_content'            => 'Payout received for [order_id].',
					'system_message'         => 'Payout for [order_id] received.',
					'tag'                    => 'Payment',
					'category'               => 'activity',
				),
				'payout_failed'                       => array(
					'name'                   => 'Payout failed',
					'desc'                   => 'A payout processing attempt has failed.',
					'admin_enabled'          => true,
					'email_subject'          => 'Payout failed',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#f2cfcf;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:1.313'>Payout failed</h1>
								<div style='color:#e92525;font-size:0.95'>We were unable to process your payout</div>
							</td>
						</tr>
					</td>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>We attempted to process a payout for your earnings from [store_name] on [marketplace_name], but the transaction could not be completed.</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>This may have occurred due to an issue with the payout account or payment details.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#eeeded;margin-top:2;border-radius:0.31'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:1.313'>What you can do next</h1>
								<div style='font-size:0.95;padding-left:0.85;padding-top:0.625'>i) Review and update your payout account details in the store dashboard</div>
								<div style='padding-top:0.313;padding-left:0.85;font-size:0.95'>ii) Ensure your payment information is correct and active</div>
								<div style='font-size:0.95;padding-top:0.313;padding-left:0.85'>iii) Contact marketplace support if the issue continues</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>Once the payout details are updated, the payout can be processed again.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[marketplace_name]',
					),
					'sms_content'            => 'Payout failed for [store_name].',
					'system_message'         => 'Payout error for [store_name].',
					'tag'                    => 'Payment',
					'category'               => 'activity',
				),
				'withdrawal_requested'                => array(
					'name'                   => 'Withdrawal requested',
					'desc'                   => 'A withdrawal request is submitted by a store.',
					'admin_enabled'          => true,
					'store_enabled'          => true,
					'email_subject'          => 'Withdrawal request submitted',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#e8fbea;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e8fbea;font-size:1.313'>Withdrawal request received</h1>
								<div style='color:#555555;font-size:0.95'>Your payout withdrawal request is under review</div>
							</td>
						</tr>
					<tr>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>We have received your withdrawal request for earnings from your store [store_name] on [marketplace_name].</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>The request is now being reviewed by the admin before the payout is processed.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#eeeded;margin-top:2;border-radius:0.31'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:1.313'>What happens next</h1>
								<div style='font-size:0.95;padding-left:0.85;padding-top:0.625'>i) The admin will review your withdrawal request</div>
								<div style='padding-top:0.313;padding-left:0.85;font-size:0.95'>ii) The payout will be processed once the request is approved</div>
								<div style='font-size:0.95;padding-top:0.313;padding-left:0.85'>iii) You will receive a notification when the payout is completed</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>No action is required from your side at this moment. We will notify you once there is an update on your request.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[marketplace_name]',
						'[amount]',
					),
					'sms_content'            => 'Withdrawal request of [amount] submitted.',
					'system_message'         => 'Withdrawal requested by [store_name].',
					'tag'                    => 'Payment',
					'category'               => 'notification',
				),
				'withdrawal_released'                 => array(
					'name'                   => 'Withdrawal released',
					'desc'                   => 'A withdrawal is released successfully.',
					'store_enabled'          => true,
					'email_subject'          => 'Withdrawal released',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#e8fbea;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e8fbea;font-size:1.313'>Withdrawal released</h1>
								<div style='color:#555555;font-size:0.95'>Your withdrawal request has been processed</div>
							</td>
						</tr>
					</tr>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>Your withdrawal request for earnings from your store [store_name] on [marketplace_name] has been approved and the payout has been released.</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>The amount has been transferred to your registered payout account.</div>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>You can review your earnings and withdrawal history anytime from your dashboard.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[marketplace_name]',
					),
					'sms_content'            => 'Withdrawal released successfully.',
					'system_message'         => 'Withdrawal released successfully.',
					'tag'                    => 'Payment',
					'category'               => 'notification',
				),
				'withdrawl_rejected'                  => array(
					'name'                   => 'Withdrawl rejected',
					'desc'                   => 'A withdrawl request is rejected by the admin.',
					'store_enabled'          => true,
					'email_subject'          => 'Withdrawl rejected',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#f2cfcf;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:1.313'>Withdrawl rejected</h1>
								<div style='color:#e92525;font-size:0.95'>Your withdrawal request was not approved</div>
							</td>
						</tr>
					</tr>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>We would like to inform you that your withdrawal request for earnings from your store [store_name] on [marketplace_name] has been reviewed and was not approved by the admin.</div>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>Please review your payout details and requirements in the dashboard before submitting a new withdrawal request.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[marketplace_name]',
						'[amount]',
					),
					'sms_content'            => 'Withdrawl of [amount] rejected.',
					'system_message'         => 'Withdrawl Payout rejected: [amount].',
					'tag'                    => 'Payment',
					'category'               => 'activity',
				),
				// ========== REPORT ABUSE ==========
				'report_abuse_submitted'              => array(
					'name'                   => 'Report abuse submitted',
					'desc'                   => 'A product is reported for abuse by a customer.',
					'admin_enabled'          => true,
					'store_enabled'          => true,
					'customer_enabled'       => true,
					'email_subject'          => 'Product reported',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#e8fbea;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6ddf8f;background-color:#e8fbea;font-size:1.313'>Abuse report received</h1>
								<div style='color:#555555;font-size:0.95'>A customer has reported a product for review</div>
							</td>
						</tr>
					<tr>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>A customer has submitted an abuse report for the product [product_name] from store [store_name] on [marketplace_name].</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>The report has been recorded and may require your review to ensure marketplace policies are maintained.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#eeeded;margin-top:2;border-radius:0.31'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:1.313'>Report details</h1>
								<div style='font-size:0.95;padding-left:0.85;padding-top:0.625'>i) A customer has reported a product for abuse or policy violation</div>
								<div style='padding-top:0.313;padding-left:0.85;font-size:0.95'>ii) The reported product details are available in the admin panel</div>
								<div style='font-size:0.95;padding-top:0.313;padding-left:0.85'>iii) You can review the report and take appropriate action if necessary</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>Please review the report and take the necessary action according to marketplace guidelines.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[product_name]',
						'[marketplace_name]',
					),
					'sms_content'            => 'Product “[product_name]” reported.',
					'system_message'         => 'Abuse report for “[product_name]” received.',
					'tag'                    => 'Report',
					'category'               => 'notification',
				),
				// ========== ANNOUNCEMENTS ==========
				'system_announcement'                 => array(
					'name'                   => 'System announcement',
					'desc'                   => 'A system-wide announcement is published by the admin.',
					'store_enabled'          => true,
					'admin_enabled'          => true,
					'email_subject'          => 'New announcement',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#fff7ec;margin-bottom:3;border-radius:0.313;color:#d88c5c'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#d88c5c;background-color:#fff7ec;font-size:1.313'>System announcement</h1>
								<div style='color:#555555;font-size:0.95'>Important update from the marketplace</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello [user_name],</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>We would like to inform you about an important update from [marketplace_name].</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>Please review the details below to stay informed about the latest changes or announcements.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#eeeded;margin-top:2;border-radius:0.31'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:1.313'>Announcement details</h1>
								<div style='font-size:0.95;padding-left:0.85;padding-top:0.625'>i) [announcement_point_1]</div>
								<div style='padding-top:0.313;padding-left:0.85;font-size:0.95'>ii) [announcement_point_2]</div>
								<div style='font-size:0.95;padding-top:0.313;padding-left:0.85'>iii) [announcement_point_3]</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>If you have any questions or need further clarification, please feel free to contact our support team.</div>",
					'available_placeholders' => array(
						'[announcement_message]',
						'[marketplace_name]',
					),
					'sms_content'            => '[announcement_message]',
					'system_message'         => 'New announcement: [announcement_message]',
					'tag'                    => 'System',
					'category'               => 'notification',
				),
				// STORE FOLLOWER NOTIFICATIONS.
				'store_followed'                      => array(
					'name'                   => 'Store followed',
					'desc'                   => 'Customer started following the store.',
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'You have a new store follower',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#e8fbea;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e8fbea;font-size:1.313'>New store follower</h1>
								<div style='color:#555555;font-size:0.95'>A customer has followed your store</div>
							</td>
						</tr>
					</tr>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello [customer_name],</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>A customer has started following your store [store_name] on [marketplace_name].</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>Followers can receive updates about your store activities, products, and announcements.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#eeeded;margin-top:2;border-radius:0.31'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:1.313'>What this means</h1>
								<div style='font-size:0.95;padding-left:0.85;padding-top:0.625'>i) A customer has followed your store</div>
								<div style='padding-top:0.313;padding-left:0.85;font-size:0.95'>ii) They may receive updates about your products and store announcements</div>
								<div style='font-size:0.95;padding-top:0.313;padding-left:0.85'>iii) Store followers can help increase visibility and engagement</div>
							</td>
						</tr>
					</tr>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>Keep your store updated with products and offers to engage your followers.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[marketplace_name]',
					),
					'sms_content'            => 'You have a new store follower.',
					'system_message'         => 'A customer started following your store.',
					'tag'                    => 'Follower',
					'category'               => 'activity',
				),
				'store_new_product_to_followers'      => array(
					'name'                   => 'New product from followed store',
					'desc'                   => 'New product published by a followed store.',
					'customer_enabled'       => true,
					'store_enabled'          => false,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'New product from "[store_name]"',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#e8fbea;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e8fbea;font-size:1.313'>New product from your followed store</h1>
								<div style='color:#555555;font-size:0.95'>Discover the latest addition from a store you follow</div>
							</td>
						</tr>
					<tr>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello [customer_name],</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>Good news! A new product has just been added by [store_name], a store you follow on [marketplace_name].</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>Be among the first to explore and purchase this latest offering.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#eeeded;margin-top:2;border-radius:0.31'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:1.313'>Product highlights</h1>
								<div style='font-size:0.95;padding-left:0.85;padding-top:0.625'>i) Product Name: [product_name]</div>
								<div style='padding-top:0.313;padding-left:0.85;font-size:0.95'>ii) Category: [product_category]</div>
								<div style='font-size:0.95;padding-top:0.313;padding-left:0.85'>iii) Price: [product_price]</div>
							</td>
						</tr>
					</tr>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>Visit the store now to check out this new product and stay updated with the latest arrivals.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[marketplace_name]',
						'[customer_name]',
						'[product_name]',
					),
					'sms_content'            => 'New product from store you follow.',
					'system_message'         => 'A followed store added a new product.',
					'tag'                    => 'Follower',
					'category'               => 'notification',
				),
				'store_new_coupon_to_followers'       => array(
					'name'                   => 'New coupon from followed store',
					'desc'                   => 'New coupon created by a followed store.',
					'customer_enabled'       => true,
					'store_enabled'          => false,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'New coupon from "[store_name]"',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#e8fbea;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e9fbea;font-size:1.313'>New coupon from your followed store</h1>
								<div style='color:#555555;font-size:0.95'>Enjoy exclusive savings from your favorite store</div>
							</td>
						</tr>
					</tr>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello [customer_name],</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>Great news! A new coupon has been offered by [store_name], a store you follow on [marketplace_name].</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>Use this coupon to enjoy special discounts on your next purchase.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#eeeded;margin-top:2;border-radius:0.31'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:1.313'>Coupon details</h1>
								<div style='font-size:0.95;padding-left:0.85;padding-top:0.625'>i) Coupon Code: [coupon_code]</div>
								<div style='padding-top:0.313;padding-left:0.85;font-size:0.95'>ii) Discount: [discount_details]</div>
								<div style='font-size:0.95;padding-top:0.313;padding-left:0.85'>iii) Valid Until: [expiry_date]</div>
							</td>
						</tr>
					</tr>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>Don't miss out on this limited-time offer. Visit the store and start saving today!</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[marketplace_name]',
						'[customer_name]',
						'[coupon_code]',
					),
					'sms_content'            => 'New coupon available from followed store.',
					'system_message'         => 'A store you follow created a new coupon.',
					'tag'                    => 'Follower',
					'category'               => 'notification',
				),
				// Pro.
				'store_vacation_alert_to_followers'   => array(
					'name'                   => 'Store vacation alert',
					'desc'                   => 'Followed store marked as on vacation.',
					'customer_enabled'       => true,
					'store_enabled'          => false,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Store "[store_name]" is on vacation',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#fffce8;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#d4b86a;background-color:#fffce8;font-size:1.313'>Store on vacation</h1>
								<div style='color:#555555;font-size:0.95'>The store is temporarily unavailable</div>
							</td>
						</tr>
					</tr>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello [customer_name],</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>Please note that the store [store_name] on [marketplace_name] is currently on vacation and is temporarily not accepting new orders.</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'><br></div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#eeeded;margin-top:2;border-radius:0.31'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:1.313'>What this means</h1>
								<div style='font-size:0.95;padding-left:0.85;padding-top:0.625'>i) New orders cannot be placed with this store at the moment</div>
								<div style='padding-top:0.313;padding-left:0.85;font-size:0.95'>ii) The store will resume operations after the vacation period ends</div>
								<div style='font-size:0.95;padding-top:0.313;padding-left:0.85'><br></div>
							</td>
						</tr>
					</tr>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>We appreciate your understanding and encourage you to check back once the store is active again.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[marketplace_name]',
					),
					'sms_content'            => 'Store you follow is on vacation.',
					'system_message'         => 'A store you follow is currently on vacation.',
					'tag'                    => 'Follower',
					'category'               => 'notification',
				),
				// WHOLESALE BUYER.(PRO).
				'wholesale_buyer_approved'            => array(
					'name'                   => 'Wholesale buyer approved',
					'desc'                   => 'User request for wholesale access has been approved.',
					'customer_enabled'       => true,
					'store_enabled'          => false,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Your wholesale access has been approved',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#e8fbea;margin-bottom:3;border-radius:0.313'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e8fbea;font-size:1.313'>Wholesale buyer approved</h1>
								<div style='color:#555555;font-size:0.95'>Your wholesale account is now active</div>
							</td>
						</tr>
					</tr>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello [customer_name],</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>Great news! Your request to become a wholesale buyer on [marketplace_name] has been successfully approved.</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>You can now access wholesale pricing, place bulk orders, and enjoy exclusive benefits available to wholesale customers.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#eeeded;margin-top:2;border-radius:0.31'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:1.313'>What you can do now</h1>
								<div style='font-size:0.95;padding-left:0.85;padding-top:0.625'>i) Log in to your account and explore wholesale pricing</div>
								<div style='padding-top:0.313;padding-left:0.85;font-size:0.95'>ii) Place bulk orders with eligible products</div>
								<div style='font-size:0.95;padding-top:0.313;padding-left:0.85'><br></div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>Your wholesale access is now active. Start exploring and make the most of your wholesale benefits.</div>",
					'available_placeholders' => array(
						'[customer_name]',
						'[marketplace_name]',
					),
					'sms_content'            => 'Your wholesale access request has been approved. You can now view wholesale prices.',
					'system_message'         => 'Your wholesale buyer request has been approved. Wholesale pricing is now available to you.',
					'tag'                    => 'Wholesale',
					'category'               => 'notification',
				),
				'wholesale_buyer_rejected'            => array(
					'name'                   => 'Wholesale buyer rejected',
					'desc'                   => 'User request for wholesale access has been rejected.',
					'customer_enabled'       => true,
					'store_enabled'          => false,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Wholesale access request not approved',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#f2cfcf;margin-bottom:3;border-radius:0.313'>
						<td>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:1.313'>Wholesale buyer rejected</h1>
								<div style='color:#e92525;font-size:0.95'>Your wholesale account request was not approved</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:1.25;padding-bottom:1'>Hello,</h1>
					<div style='font-size:1;line-height:1.25;padding-top:1.25'>We would like to inform you that your request to become a wholesale buyer on [marketplace_name] has been reviewed and was not approved by the admin.</div>
					<div style='line-height:1.25;font-size:0.95;padding-top:1.5;font-weight:500'>Your account will remain active as a regular customer account.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:1;padding-bottom:1;padding-right:1;padding-left:1;background-color:#eeeded;margin-top:2;border-radius:0.31'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:1.313'>Reason for rejection</h1>
								<div style='font-size:0.95;padding-left:0.85;padding-top:0.625'>i) The submitted details did not meet wholesale eligibility requirements</div>
								<div style='padding-top:0.313;padding-left:0.85;font-size:0.95'>ii) Some required information or documents may be incomplete</div>
								<div style='font-size:0.95;padding-top:0.313;padding-left:0.85'>iii) The application does not currently align with marketplace policies</div>
							</td>
						</tr>
					</tr>
					<div style='color:#2d3748;font-size:1;margin-top:4;line-height:1.125;margin-bottom:3'>If you have any questions or wish to reapply, please contact the marketplace support team for further guidance.</div>",
					'available_placeholders' => array(
						'[marketplace_name]',
					),
					'sms_content'            => 'Your wholesale buyer request was not approved. Please contact support for details.',
					'system_message'         => 'Your wholesale buyer request has been rejected.',
					'tag'                    => 'Wholesale',
					'category'               => 'notification',
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
					'event_name'             => $event['name'],
					'description'            => $event['desc'],
					'admin_enabled'          => $event['admin_enabled'] ?? false,
					'customer_enabled'       => $event['customer_enabled'] ?? false,
					'store_enabled'          => $event['store_enabled'] ?? false,
					'system_enabled'         => true,
					'system_action'          => $key,
					'email_subject'          => $event['email_subject'] ?? '',
					'email_body'             => $event['email_body'] ?? '',
					'sms_content'            => $event['sms_content'] ?? '',
					'system_message'         => $event['system_message'] ?? '',
					'available_placeholders' => ! empty( $event['available_placeholders'] ) ? implode( ',', $event['available_placeholders'] ) : '',
					'status'                 => 'active',
					'custom_emails'          => wp_json_encode( array() ), // empty array.
					'tag'                    => $event['tag'] ?? '',
					'category'               => $event['category'] ?? '',
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
				$subject = str_replace( '[' . $key . ']', $value, $subject );
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

	public function send_notification_helper( $type, $store = null, $order = null, $extra = array() ) {
		$store_email    = '';
		$store_phone    = '';
		$customer_email = '';
		$customer_phone = '';

		if ( $store ) {
			$store_email_meta = $store->get_meta( Utill::STORE_SETTINGS_KEYS['store_email'] );
			$store_email      = $store_email_meta['primary'] ?? '';
			$store_phone      = $store->get_meta( Utill::STORE_SETTINGS_KEYS['phone'] );
		}

		if ( $order ) {
			$customer_email = $order->get_billing_email();
			$customer_phone = $order->get_billing_phone();
		}

		$payload = array_merge(
			array(
				'admin_email'      => MultiVendorX()->setting->get_setting( 'receiver_email_address' ),
				'admin_phone'      => MultiVendorX()->setting->get_setting( 'sms_receiver_phone_number' ),
				'store_email'      => $store_email,
				'store_phone'      => $store_phone,
				'customer_email'   => $customer_email,
				'customer_phone'   => $customer_phone,
				'marketplace_name' => get_bloginfo( 'name' ),
			),
			$extra
		);
		do_action( "multivendorx_notify_{$type}", $type, $payload );
	}
}
