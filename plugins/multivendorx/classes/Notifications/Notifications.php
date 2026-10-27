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
	 * Option flagging that an SMS notification couldn't be sent because VuloMail has no
	 * usable SMS connection (or isn't installed/active). render_vulomail_sms_notice() shows
	 * a prompt once this is set, and clears it after the admin dismisses or fixes it.
	 *
	 * @var string
	 */
	const VULOMAIL_SMS_NOT_READY_OPTION = 'multivendorx_vulomail_sms_not_ready';

	/**
	 * Constructor
	 *
	 * @return void
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'register_notification_hooks' ) );
		add_action( 'multivendorx_clear_notifications', array( $this, 'multivendorx_clear_notifications' ) );
		add_action( 'admin_notices', array( $this, 'render_vulomail_sms_notice' ) );
	}

	/**
	 * Give unitless lengths in inline styles a unit.
	 *
	 * Notifications saved by earlier versions store sizes like `margin-bottom:3`
	 * or `font-size:1.313` (rem, with the unit left off). Without a unit the
	 * browser/mail client drops the declaration, so spacing and font sizes are
	 * lost. Values that already carry a unit are left alone.
	 *
	 * @param string $html Email HTML.
	 * @return string
	 */
	private function add_missing_css_units( $html ) {
		$html = preg_replace_callback(
			'/\b(font-size|padding(?:-top|-right|-bottom|-left)?|margin(?:-top|-right|-bottom|-left)?|border-radius):(\d*\.?\d+)(?=[;\'"])/',
			static function ( $matches ) {
				// Earlier versions meant rem; px is what mail clients handle reliably.
				return $matches[1] . ':' . round( (float) $matches[2] * 16, 2 ) . 'px';
			},
			$html
		);

		// Every table full width. Some mail viewers drop the `width` attribute,
		// so it is also set in the inline style.
		$html = preg_replace_callback(
			'/<table\b([^>]*)>/i',
			function ( $matches ) {
				$attributes = $matches[1];
				if ( preg_match( '/\bwidth\s*=\s*[\'"]?+(?!100%)/i', $attributes ) ) {
					return $matches[0]; // A fixed-width table on purpose.
				}
				return '<table' . $this->add_inline_style( $attributes, 'width:100%;', 'width' ) . '>';
			},
			$html
		);

		// Headings with no margin of their own would get the browser's large
		// default margins, ignoring a 0 margin chosen in the editor.
		return preg_replace_callback(
			'/<(h[1-6])\b([^>]*)>/i',
			function ( $matches ) {
				return '<' . $matches[1] . $this->add_inline_style( $matches[2], 'margin:0;', 'margin' ) . '>';
			},
			$html
		);
	}

	/**
	 * Prepend a CSS declaration to a tag's inline style unless that property
	 * is already set (so anything the editor chose still wins).
	 *
	 * @param string $attributes Tag attributes.
	 * @param string $declaration Declaration to add, e.g. `width:100%;`.
	 * @param string $property    Property name to look for.
	 * @return string Attributes with the declaration added.
	 */
	private function add_inline_style( $attributes, $declaration, $property ) {
		if ( preg_match( '/style\s*=\s*([\'"])(.*?)\1/is', $attributes, $style ) ) {
			if ( preg_match( '/(^|;)\s*' . preg_quote( $property, '/' ) . '(-[a-z]+)?\s*:/i', $style[2] ) ) {
				return $attributes;
			}
			return str_replace( $style[0], 'style=' . $style[1] . $declaration . $style[2] . $style[1], $attributes );
		}
		return $attributes . ' style="' . $declaration . '"';
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
					'name'                   => __( 'Store pending approval', 'multivendorx' ),
					'desc'                   => __( 'Triggered when a new store application is submitted and placed under admin review.', 'multivendorx' ),
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => true,
					'system_enabled'         => true,
					'email_subject'          => 'Your store application is under review',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#e8fbea;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e8fbea;font-size:21px'>Store pending approval</h1>
								<div style='color:#555555;font-size:15px'>Your store application is awaiting review</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>Your store [store_name] has been successfully submitted on [marketplace_name] and is currently pending admin approval.</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>The store will become visible to customers once the review process is completed and approval is granted.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#eeeded;margin-top:32px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:21px'>What happens next</h1>
								<div style='font-size:15px;padding-left:14px;padding-top:10px'>i) The admin will review your store details and submitted information</div>
								<div style='padding-top:5px;padding-left:14px;font-size:15px'>ii) You may be contacted if additional details are required</div>
								<div style='font-size:15px;padding-top:5px;padding-left:14px'>iii) You will receive a notification once your store is approved or if changes are needed</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>No action is required at this moment. We will notify you once the review process is completed.</div>",
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
					'name'                   => __( 'Store rejected', 'multivendorx' ),
					'desc'                   => __( 'Admin rejected the store application.', 'multivendorx' ),
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Your store application was rejected',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#f2cfcf;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:21px'>Store application rejected</h1>
								<div style='color:#e92525;font-size:15px'>Changes are required before resubmission</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello [store_name],</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>We've reviewed your store <strong>[store_name]</strong> on <strong>[marketplace_name]</strong>, and it does not meet our current marketplace requirements.</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>This usually happens when some details are incomplete or do not align with our policies.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#eeeded;margin-top:32px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:21px'>What you can do next</h1>
								<div style='font-size:15px;padding-left:14px;padding-top:10px'>i) Review your store details and descriptions</div>
								<div style='padding-top:5px;padding-left:14px;font-size:15px'>ii) Update any missing or incorrect information</div>
								<div style='font-size:15px;padding-top:5px;padding-left:14px'>iii) Ensure your store follows marketplace policies before resubmitting</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>Once you've made the necessary updates, you can submit your application again for review.</div>",
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
					'name'                   => __( 'Store permanently rejected', 'multivendorx' ),
					'desc'                   => __( 'Permanent rejection of a store application by the admin', 'multivendorx' ),
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => true,
					'system_enabled'         => true,
					'email_subject'          => 'Your store application has been permanently rejected',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#f2cfcf;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:21px'>Store application permanently rejected</h1>
								<div style='color:#e92525;font-size:15px'>This decision cannot be reversed</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>We've reviewed your store [store_name] on [marketplace_name], and it has been permanently rejected due to policy violations.</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>This means the application does not meet our marketplace requirements and cannot be approved or resubmitted.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#eeeded;margin-top:32px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:21px'>What this means</h1>
								<div style='font-size:15px;padding-left:14px;padding-top:10px'>i) The store cannot be activated on the marketplace</div>
								<div style='padding-top:5px;padding-left:14px;font-size:15px'>ii) This decision is final and cannot be changed</div>
								<div style='font-size:15px;padding-top:5px;padding-left:14px'>iii) You will not be able to reapply for this store</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>If you believe this decision requires clarification, you may contact the marketplace administrator for more details.</div>",
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
					'name'                   => __( 'Store account created by admin', 'multivendorx' ),
					'desc'                   => __( 'Admin manually created store account.', 'multivendorx' ),
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Your store account has been created – [store_name]',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#e8fbea;margin-bottom:48px;border-radius:5px;color:#703333'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e8fbea;font-size:21px'>Store account created</h1>
								<div style='color:#555555;font-size:15px'>Your store account is now active</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello, </h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>An account for your store [store_name] has been created by the admin on [marketplace_name].</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>You can now access your store dashboard and start setting up your store details, products, and preferences.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#eeeded;margin-top:32px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:21px'>Common reasons for rejection</h1>
								<div style='font-size:15px;padding-left:14px;padding-top:10px'>i) Log in to your store dashboard using your account credentials</div>
								<div style='padding-top:5px;padding-left:14px;font-size:15px'>ii) Complete your store profile and business information</div>
								<div style='font-size:15px;padding-top:5px;padding-left:14px'>iii) Start adding products and configuring your store settings</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>No further action is required to activate your account. You can begin managing your store immediately.</div>",
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
					'name'                   => __( 'Store activated', 'multivendorx' ),
					'desc'                   => __( 'Store activated and ready to start selling.', 'multivendorx' ),
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Your store "[store_name]" is now active',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#e8fbea;margin-bottom:48px;border-radius:5px;color:#703333'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e8fbea;font-size:21px'>Store account created</h1>
								<div style='color:#555555;font-size:15px'>Your store account is now active</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>An account for your store [store_name] has been created by the admin on [marketplace_name].</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>You can now access your store dashboard and start setting up your store details, products, and preferences.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#eeeded;margin-top:32px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:21px'>What you can do now</h1>
								<div style='font-size:15px;padding-left:14px;padding-top:10px'>i) Log in to your store dashboard using your account credentials</div>
								<div style='padding-top:5px;padding-left:14px;font-size:15px'>ii) Complete your store profile and business information</div>
								<div style='font-size:15px;padding-top:5px;padding-left:14px'>iii) Start adding products and configuring your store settings</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>No further action is required to activate your account. You can begin managing your store immediately.</div>",
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
					'name'                   => __( 'Store under review', 'multivendorx' ),
					'desc'                   => __( 'Store temporarily placed under admin review.', 'multivendorx' ),
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => true,
					'system_enabled'         => true,
					'email_subject'          => 'Your store "[store_name]" is under review',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#fffce8;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#d4b86a;background-color:#fffce8;font-size:21px'>Store under review</h1>
								<div style='color:#555555;font-size:15px'>Your store application is being reviewed</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>Your store [store_name] has been successfully submitted on [marketplace_name] and is currently under review.</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>Our team is carefully checking your store details to ensure everything meets our marketplace standards and policies.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#eeeded;margin-top:32px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:21px'>What you can do now</h1>
								<div style='font-size:15px;padding-left:14px;padding-top:10px'>i) The admin will review your store information and documents</div>
								<div style='padding-top:5px;padding-left:14px;font-size:15px'>ii) You may be contacted if any additional details are required</div>
								<div style='font-size:15px;padding-top:5px;padding-left:14px'>iii) You will receive a notification once the review is completed</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>No action is required from your side at this moment. We will notify you as soon as your store status is updated.</div>",
					'available_placeholders' => array(
						'[store_name]',
						'[marketplace_name]',
					),
					'system_message'         => 'Your store has been placed under review.',
					'tag'                    => 'Store',
					'category'               => 'activity',
				),
				'store_suspended'                     => array(
					'name'                   => __( 'Store suspended', 'multivendorx' ),
					'desc'                   => __( 'Store temporarily suspended by the admin.', 'multivendorx' ),
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => true,
					'system_enabled'         => true,
					'email_subject'          => 'Your store "[store_name]" has been suspended',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#e6f4ff;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6e9fd1;background-color:#e6f4ff;font-size:21px'>Store suspended</h1>
								<div style='color:#555555;font-size:15px'>Your store has been temporarily suspended</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>We would like to inform you that your store [store_name] on [marketplace_name] has been temporarily suspended by the admin due to policy or compliance reasons.</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>During this period, your store will not be visible to customers, and new orders cannot be placed.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#eeeded;margin-top:32px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:21px'>What you can do now</h1>
								<div style='font-size:15px;padding-left:14px;padding-top:10px'>i) Your store is temporarily hidden from the marketplace</div>
								<div style='padding-top:5px;padding-left:14px;font-size:15px'>ii) Product listings and sales activities are paused</div>
								<div style='font-size:15px;padding-top:5px;padding-left:14px'>iii) Existing orders (if any) will be handled as per marketplace policy</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>If you believe this action was taken in error or wish to resolve the issue, please contact the marketplace support team for further assistance.</div>",
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
					'name'                   => __( 'Store permanently deactivated', 'multivendorx' ),
					'desc'                   => __( 'Admin permanently deactivated the store.', 'multivendorx' ),
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => true,
					'system_enabled'         => true,
					'email_subject'          => 'Your store "[store_name]" has been permanently deactivated',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#f2cfcf;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:21px'>Store permanently deactivated</h1>
								<div style='color:#e92525;font-size:15px'>Your store is no longer active on the marketplace</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>We would like to inform you that your store [store_name] on [marketplace_name] has been permanently deactivated by the admin due to policy or compliance reasons.</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>This action is final, and the store will no longer be available on the marketplace.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#eeeded;margin-top:32px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:21px'>What you can do now</h1>
								<div style='font-size:15px;padding-left:14px;padding-top:10px'>i) Your store has been permanently removed from the marketplace</div>
								<div style='padding-top:5px;padding-left:14px;font-size:15px'>ii) All product listings and store activities have been disabled</div>
								<div style='font-size:15px;padding-top:5px;padding-left:14px'>iii) Customers will no longer be able to view or purchase from your store</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>If you need clarification regarding this decision, you may contact the marketplace support team for assistance.</div>",
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
					'name'                   => __( 'Store account deactivation request', 'multivendorx' ),
					'desc'                   => __( 'Store owner requests deactivation of their store account.', 'multivendorx' ),
					'customer_enabled'       => false,
					'store_enabled'          => false,
					'admin_enabled'          => true,
					'system_enabled'         => true,
					'email_subject'          => 'Store deactivation request – [store_name]',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#f2cfcf;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:21px'>Store deactivation request received</h1>
								<div style='color:#e92525;font-size:15px'>We are processing your store deactivation request</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>We have received your request to deactivate your store [store_name] on [marketplace_name].</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>Our team is currently reviewing your request to ensure all pending activities are properly handled before deactivation.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#eeeded;margin-top:32px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:21px'>What you can do now</h1>
								<div style='font-size:15px;padding-left:14px;padding-top:10px'>i) Your store details and ongoing orders will be reviewed</div>
								<div style='padding-top:5px;padding-left:14px;font-size:15px'>ii) You may be contacted if any clarification or action is required</div>
								<div style='font-size:15px;padding-top:5px;padding-left:14px'>iii) You will be notified once the deactivation process is completed</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>No action is required from your side at this moment. We will update you once your request has been processed.</div>",
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
					'name'                   => __( 'Store deactivation rejected', 'multivendorx' ),
					'desc'                   => __( 'Store deactivation request rejected by the admin.', 'multivendorx' ),
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Your store "[store_name]" deactivation request has been rejected',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#f2cfcf;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:21px'>Store deactivation rejected</h1>
								<div style='color:#e92525;font-size:15px'>Your store deactivation request was not approved</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>We would like to inform you that your request to deactivate your store [store_name] has been reviewed and was not approved by the admin.</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>Your store will continue to remain active on the marketplace.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#eeeded;margin-top:32px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:21px'>Common reasons for rejection</h1>
								<div style='font-size:15px;padding-left:14px;padding-top:10px'>i) There are pending orders or ongoing transactions in your store</div>
								<div style='padding-top:5px;padding-left:14px;font-size:15px'>ii) Required information or actions are still incomplete</div>
								<div style='font-size:15px;padding-top:5px;padding-left:14px'>iii) The store does not currently meet deactivation conditions as per marketplace policy</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>If you need further assistance, please contact the marketplace support team for more details or guidance.</div>",
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
					'name'                   => __( 'New order received', 'multivendorx' ),
					'desc'                   => __( 'New order received by the store.', 'multivendorx' ),
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => true,
					'system_enabled'         => true,
					'email_subject'          => 'New order received – Order #[order_id]',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#e8fbea;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e8fbea;font-size:21px'>New order received</h1>
								<div style='color:#555555;font-size:15px'>You have received a new order</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>Good news! You have received a new order from a customer on your store [store_name]</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>Please review the order details and proceed with fulfillment as soon as possible.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#eeeded;margin-top:32px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:21px'>What you can do now</h1>
								<div style='font-size:15px;padding-left:14px;padding-top:10px'>i) A new order has been placed in your store dashboard</div>
								<div style='padding-top:5px;padding-left:14px;font-size:15px'>ii) Customer details and order items are available for review</div>
								<div style='font-size:15px;padding-top:5px;padding-left:14px'>iii) Please confirm and process the order within the expected handling time</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>Prompt action is recommended to ensure timely delivery and a smooth customer experience.</div>",
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
					'name'                   => __( 'Order processing', 'multivendorx' ),
					'desc'                   => __( 'An order status is changed to processing.', 'multivendorx' ),
					'store_enabled'          => true,
					'customer_enabled'       => true,
					'email_subject'          => 'Order processing started',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#fffce8;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#d4b86a;background-color:#fff7ec;font-size:21px'>Order processing started</h1>
								<div style='color:#555555;font-size:15px'>Your order is now being prepared</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>Your order #[order_id] from [store_name] is now being processed by the seller.</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>This means your items are being prepared, packed, and readied for shipment.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#eeeded;margin-top:32px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:21px'>What happens next</h1>
								<div style='font-size:15px;padding-left:14px;padding-top:10px'>i) The store will prepare and pack order items</div>
								<div style='padding-top:5px;padding-left:14px;font-size:15px'>ii) Order will be handed over to the delivery partner</div>
								<div style='font-size:15px;padding-top:5px;padding-left:14px'>iii) Customer will receive tracking details once the order is shipped</div>
							</td>
						</tr>
					</tr></table>",
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
					'name'                   => __( 'Order completed', 'multivendorx' ),
					'desc'                   => __( 'An order is completed successfully.', 'multivendorx' ),
					'store_enabled'          => true,
					'customer_enabled'       => true,
					'email_subject'          => 'Order completed',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#e8fbea;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e8fbea;font-size:21px'>Order completed</h1>
								<div style='color:#555555;font-size:15px'>Your order has been successfully delivered</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>We're happy to inform you that your order #[order_id] from [store_name] on [marketplace_name] has been successfully completed.</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>We hope you are satisfied with your purchase.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#eeeded;margin-top:32px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:21px'>What's next</h1>
								<div style='font-size:15px;padding-left:14px;padding-top:10px'>i) You can view your order details in your account</div>
								<div style='padding-top:5px;padding-left:14px;font-size:15px'>ii) You may download your invoice if needed</div>
								<div style='font-size:15px;padding-top:5px;padding-left:14px'>iii) You can leave a review for the product and store experience</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>Thank you for shopping with us. We look forward to serving you again.</div>",
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
					'name'                   => __( 'Order cancelled', 'multivendorx' ),
					'desc'                   => __( 'An order is cancelled by the customer or admin.', 'multivendorx' ),
					'store_enabled'          => true,
					'customer_enabled'       => true,
					'admin_enabled'          => true,
					'email_subject'          => 'Order cancelled',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#f2cfcf;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:21px'>Order cancelled</h1>
								<div style='color:#e92525;font-size:15px'>Your order has been cancelled</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>We would like to inform you that your order #[order_id] from [store_name] on [marketplace_name] has been cancelled.</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>If any payment was made, the refund (if applicable) will be processed as per the marketplace refund policy.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#eeeded;margin-top:32px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:21px'>Common reasons for rejection</h1>
								<div style='font-size:15px;padding-left:14px;padding-top:10px'>i) The order will not be processed or shipped</div>
								<div style='padding-top:5px;padding-left:14px;font-size:15px'>ii) Any payment made will be refunded if eligible</div>
								<div style='font-size:15px;padding-top:5px;padding-left:14px'>iii) You can place a new order anytime</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>If you have any questions, please contact our support team for assistance.</div>",
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
					'name'                   => __( 'Order refunded', 'multivendorx' ),
					'desc'                   => __( 'A refund is issued for an order.', 'multivendorx' ),
					'store_enabled'          => true,
					'customer_enabled'       => true,
					'email_subject'          => 'Order refunded',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#f2cfcf;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:21px'>Order refunded</h1>
								<div style='color:#e92525;font-size:15px'>Your refund has been successfully processed</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>We're happy to inform you that your refund for order #[order_id] from [store_name] on [marketplace_name] has been successfully processed.</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>The refunded amount has been returned to your original payment method.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#eeeded;margin-top:32px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:21px'>Refund details</h1>
								<div style='font-size:15px;padding-left:14px;padding-top:10px'>i) Refund has been initiated for the eligible amount</div>
								<div style='padding-top:5px;padding-left:14px;font-size:15px'>ii) It may take a few business days to reflect in your account depending on your payment provider</div>
								<div style='font-size:15px;padding-top:5px;padding-left:14px'>iii) You can check the refund status in your order history</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>If you do not see the refund after the expected time, please contact our support team for assistance.</div>",
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
					'name'                   => __( 'Shipment tracking added', 'multivendorx' ),
					'desc'                   => __( 'Tracking details added for the order shipment.', 'multivendorx' ),
					'customer_enabled'       => true,
					'store_enabled'          => false,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Tracking added – Order #[order_id]',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#f2cfcf;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:21px'>Shipment tracking updated</h1>
								<div style='color:#e92525;font-size:15px'>Your order has been shipped and tracking is now available</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>Good news! Your order #[order_id] from [store_name] on [marketplace_name] has been shipped. You can now track your shipment using the details below.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#eeeded;margin-top:32px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:21px'>Tracking details</h1>
								<div style='font-size:15px;padding-left:14px;padding-top:10px'>Shipping Provider: [shipping_provider_name]</div>
								<div style='padding-top:5px;padding-left:14px;font-size:15px'>Tracking ID: [tracking_id]</div>
								<div style='font-size:15px;padding-top:5px;padding-left:14px'>Tracking URL: [shipping_url]</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>You can use the tracking link above to check real-time delivery updates. We'll also keep you informed about major status changes.</div>",
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
					'name'                   => __( 'Order delivered', 'multivendorx' ),
					'desc'                   => __( 'Order marked as delivered.', 'multivendorx' ),
					'customer_enabled'       => true,
					'store_enabled'          => true,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Order #[order_id] delivered',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#f2cfcf;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:21px'>Order delivered</h1>
								<div style='color:#e92525;font-size:15px'>Your order has been successfully delivered</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>We're happy to inform you that your order #[order_id] from [store_name] on [marketplace_name] has been successfully delivered.</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>We hope your package has reached you safely.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#eeeded;margin-top:32px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:21px'>Common reasons for rejection</h1>
								<div style='font-size:15px;padding-left:14px;padding-top:10px'>i) Confirm that all items are received in good condition</div>
								<div style='padding-top:5px;padding-left:14px;font-size:15px'>ii) Download your invoice from your order history if needed</div>
								<div style='font-size:15px;padding-top:5px;padding-left:14px'>iii) Leave a review for the product and seller experience</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>Thank you for shopping with us. We hope to see you again soon.</div>",
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
					'name'                   => __( 'Refund requested', 'multivendorx' ),
					'desc'                   => __( 'Refund request submitted for the order.', 'multivendorx' ),
					'customer_enabled'       => true,
					'store_enabled'          => true,
					'admin_enabled'          => true,
					'system_enabled'         => true,
					'email_subject'          => 'Refund requested – Order #[order_id]',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#f2cfcf;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:21px'>Refund requested</h1>
								<div style='color:#e92525;font-size:15px'>Your refund request has been received</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>We have received your refund request for order #[order_id] from [store_name] on [marketplace_name].</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>Our team will review your request based on the marketplace refund policy and order details.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#eeeded;margin-top:32px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:21px'>What happens next</h1>
								<div style='font-size:15px;padding-left:14px;padding-top:10px'>i) The refund request will be reviewed by the admin or store owner</div>
								<div style='padding-top:5px;padding-left:14px;font-size:15px'>ii) You may be contacted if additional information is required</div>
								<div style='font-size:15px;padding-top:5px;padding-left:14px'>iii) You will receive an update once the review is completed</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>Once you've addressed the relevant requirements, you're welcome to resubmit your application through the Play Console.</div>",
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
					'name'                   => __( 'Refund accepted', 'multivendorx' ),
					'desc'                   => __( 'Refund request approved for the order.', 'multivendorx' ),
					'customer_enabled'       => true,
					'store_enabled'          => true,
					'admin_enabled'          => true,
					'system_enabled'         => true,
					'email_subject'          => 'Refund approved – Order #[order_id]',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#e8fbea;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e8fbea;font-size:21px'>Refund approved</h1>
								<div style='color:#555555;font-size:15px'>Your refund request has been accepted</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>Good news! Your refund request for order #[order_id] from [store_name] on [marketplace_name] has been approved.</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>The refund process has now been initiated as per the marketplace refund policy.</div>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>If you have any questions, please contact our support team for further assistance.</div>",
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
					'name'                   => __( 'Refund rejected', 'multivendorx' ),
					'desc'                   => __( 'Refund request rejected for the order.', 'multivendorx' ),
					'customer_enabled'       => true,
					'store_enabled'          => true,
					'admin_enabled'          => true,
					'system_enabled'         => true,
					'email_subject'          => 'Refund rejected – Order #[order_id]',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#f2cfcf;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:21px'>Refund rejected</h1>
								<div style='color:#e92525;font-size:15px'>Your refund request was not approved</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>We would like to inform you that your refund request for order #[order_id] from [store_name] on [marketplace_name] has been reviewed and was not approved as per our refund policy.</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>To help you understand next steps, please review the key areas below before reapplying</div>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>If you need more clarification, please contact our support team for assistance.</div>",
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
					'name'                   => __( 'New store review', 'multivendorx' ),
					'desc'                   => __( 'New customer review submitted for the store.', 'multivendorx' ),
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'New review received for your store',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#e8fbea;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e8fbea;font-size:21px'>New store review received</h1>
								<div style='color:#555555;font-size:15px'>A customer has left a review for your store</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>You have received a new review for your store [store_name] on [marketplace_name].</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>Customer feedback helps improve your store reputation and build trust with future buyers.</div>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>Keep up the great work and continue delivering a great shopping experience.</div>",
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
					'name'                   => __( 'Admin replied to review', 'multivendorx' ),
					'desc'                   => __( 'Marketplace admin replies to a review.', 'multivendorx' ),
					'customer_enabled'       => true,
					'store_enabled'          => false,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Marketplace response to your review – [product_name]',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#fff7ec;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#d4b86a;background-color:#fff7ec;font-size:21px'>Admin replied to your review</h1>
								<div style='color:#555555;font-size:15px'>Your review has received a response</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>The admin has responded to your review for store [store_name] on [marketplace_name].</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>You can view the full reply and any additional details in your account.</div>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>Thank you for sharing your feedback. It helps improve the marketplace experience for everyone.</div>",
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
					'name'                   => __( 'Product submitted', 'multivendorx' ),
					'desc'                   => __( 'Product submitted for admin review.', 'multivendorx' ),
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => true,
					'system_enabled'         => true,
					'email_subject'          => 'Product "[product_name]" submitted for approval',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#e8fbea;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e8fbea;font-size:21px'>Product submitted for approval</h1>
								<div style='color:#555555;font-size:15px'>A new product is waiting for review</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>A new product has been submitted by store [store_name] on [marketplace_name] and is currently awaiting your approval.</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>The product will be visible to customers only after it is approved.</div>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>Please review the submission and approve or reject it based on marketplace guidelines.</div>",
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
					'name'                   => __( 'Product approved', 'multivendorx' ),
					'desc'                   => __( 'Product approved and published.', 'multivendorx' ),
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Your product "[product_name]" has been approved',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#e8fbea;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e6fbea;font-size:21px'>Product approved</h1>
								<div style='color:#555555;font-size:15px'>Your product is now live on the marketplace</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>Good news! Your product [product_name] submitted for [store_name] on [marketplace_name] has been reviewed and approved by the admin.</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>The product is now visible to customers and available for purchase on the marketplace.</div>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>Your product is now live. Continue adding great products to grow your store.</div>",
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
					'name'                   => __( 'Product rejected', 'multivendorx' ),
					'desc'                   => __( 'Product rejected after review.', 'multivendorx' ),
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Product "[product_name]" was rejected',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#f2cfcf;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:21px'>Product rejected</h1>
								<div style='color:#e92525;font-size:15px'>Your product was not approved for publishing</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>We would like to inform you that your product [product_name] submitted from store [store_name] on [marketplace_name] has been reviewed and was not approved by the admin.</div>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>You may review the product details, make the necessary updates, and submit it again for approval.</div>",
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
					'name'                   => __( 'Product low stock', 'multivendorx' ),
					'desc'                   => __( 'Product stock running low.', 'multivendorx' ),
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Low stock alert – [product_name]',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#f2cfcf;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:21px'>Product low stock alert</h1>
								<div style='color:#e92525;font-size:15px'>Your product inventory is running low</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>This is a quick reminder that the stock for your product [product_name] in store [store_name] on [marketplace_name] is running low.</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>To avoid missing potential sales, we recommend updating your inventory soon.</div>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>Keeping your inventory updated helps ensure a smooth shopping experience for your customers.</div>",
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
					'name'                   => __( 'Product out of stock', 'multivendorx' ),
					'desc'                   => __( 'Product is currently unavailable due to no stock.', 'multivendorx' ),
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Product out of stock – [product_name]',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#f2cfcf;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:21px'>Product out of stock</h1>
								<div style='color:#e92525;font-size:15px'>Your product is currently unavailable for purchase</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>The product [product_name] from your store [store_name] on [marketplace_name] is now out of stock.</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>Customers will not be able to purchase this product until the inventory is updated.</div>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>Update the product inventory from your store dashboard to make it available for customers again.</div>",
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
					'name'                   => __( 'Product question submitted', 'multivendorx' ),
					'desc'                   => __( 'Customer submits a question on a product.', 'multivendorx' ),
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => true,
					'system_enabled'         => true,
					'email_subject'          => 'New product question – [product_name]',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#e8fbea;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e8fbea;font-size:21px'>New product question received</h1>
								<div style='color:#555555;font-size:15px'>A customer has asked a question about your product.</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>A customer has submitted a question for the product [product_name] from your store [store_name] on [marketplace_name].</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>Responding promptly can help customers make informed purchase decisions</div>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>Providing clear and timely answers helps build trust and improve the shopping experience.</div>",
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
					'name'                   => __( 'Store replied to product question', 'multivendorx' ),
					'desc'                   => __( 'Store owner replies to a product question.', 'multivendorx' ),
					'customer_enabled'       => true,
					'store_enabled'          => false,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Answer to your question – [product_name]',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#e6f4ff;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6e9fd1;background-color:#e6f4ff;font-size:21px'>Store replied to your question</h1>
								<div style='color:#555555;font-size:15px'></div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>The store [store_name] has replied to your question about the product [product_name] on [marketplace_name].</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>You can now view the response and continue the conversation if needed.</div>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>Thank you for engaging with the store. We hope the response helps you make an informed purchase decision.</div>",
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
					'name'                   => __( 'Payout received', 'multivendorx' ),
					'desc'                   => __( 'A payment is received for an order.', 'multivendorx' ),
					'store_enabled'          => true,
					'admin_enabled'          => true,
					'email_subject'          => 'Payout received',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#e8fbea;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e8fbea;font-size:21px'>Payout received</h1>
								<div style='color:#555555;font-size:15px'>Your earnings have been successfully transferred</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>Good news! A payout for your earnings from [store_name] on [marketplace_name] has been successfully processed.</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>The amount has been transferred to your registered payout account.</div>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>You can check your earnings and payout history anytime from your dashboard.</div>",
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
					'name'                   => __( 'Payout failed', 'multivendorx' ),
					'desc'                   => __( 'A payout processing attempt has failed.', 'multivendorx' ),
					'admin_enabled'          => true,
					'email_subject'          => 'Payout failed',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#f2cfcf;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:21px'>Payout failed</h1>
								<div style='color:#e92525;font-size:15px'>We were unable to process your payout</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>We attempted to process a payout for your earnings from [store_name] on [marketplace_name], but the transaction could not be completed.</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>This may have occurred due to an issue with the payout account or payment details.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#eeeded;margin-top:32px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:21px'>What you can do next</h1>
								<div style='font-size:15px;padding-left:14px;padding-top:10px'>i) Review and update your payout account details in the store dashboard</div>
								<div style='padding-top:5px;padding-left:14px;font-size:15px'>ii) Ensure your payment information is correct and active</div>
								<div style='font-size:15px;padding-top:5px;padding-left:14px'>iii) Contact marketplace support if the issue continues</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>Once the payout details are updated, the payout can be processed again.</div>",
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
					'name'                   => __( 'Withdrawal requested', 'multivendorx' ),
					'desc'                   => __( 'A withdrawal request is submitted by a store.', 'multivendorx' ),
					'admin_enabled'          => true,
					'store_enabled'          => true,
					'email_subject'          => 'Withdrawal request submitted',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#e8fbea;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e8fbea;font-size:21px'>Withdrawal request received</h1>
								<div style='color:#555555;font-size:15px'>Your payout withdrawal request is under review</div>
							</td>
						</tr>
					<tr>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>We have received your withdrawal request for earnings from your store [store_name] on [marketplace_name].</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>The request is now being reviewed by the admin before the payout is processed.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#eeeded;margin-top:32px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:21px'>What happens next</h1>
								<div style='font-size:15px;padding-left:14px;padding-top:10px'>i) The admin will review your withdrawal request</div>
								<div style='padding-top:5px;padding-left:14px;font-size:15px'>ii) The payout will be processed once the request is approved</div>
								<div style='font-size:15px;padding-top:5px;padding-left:14px'>iii) You will receive a notification when the payout is completed</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>No action is required from your side at this moment. We will notify you once there is an update on your request.</div>",
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
					'name'                   => __( 'Withdrawal released', 'multivendorx' ),
					'desc'                   => __( 'A withdrawal is released successfully.', 'multivendorx' ),
					'store_enabled'          => true,
					'email_subject'          => 'Withdrawal released',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#e8fbea;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e8fbea;font-size:21px'>Withdrawal released</h1>
								<div style='color:#555555;font-size:15px'>Your withdrawal request has been processed</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>Your withdrawal request for earnings from your store [store_name] on [marketplace_name] has been approved and the payout has been released.</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>The amount has been transferred to your registered payout account.</div>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>You can review your earnings and withdrawal history anytime from your dashboard.</div>",
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
					'name'                   => __( 'Withdrawl rejected', 'multivendorx' ),
					'desc'                   => __( 'A withdrawl request is rejected by the admin.', 'multivendorx' ),
					'store_enabled'          => true,
					'email_subject'          => 'Withdrawl rejected',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#f2cfcf;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:21px'>Withdrawl rejected</h1>
								<div style='color:#e92525;font-size:15px'>Your withdrawal request was not approved</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>We would like to inform you that your withdrawal request for earnings from your store [store_name] on [marketplace_name] has been reviewed and was not approved by the admin.</div>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>Please review your payout details and requirements in the dashboard before submitting a new withdrawal request.</div>",
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
					'name'                   => __( 'Report abuse submitted', 'multivendorx' ),
					'desc'                   => __( 'A product is reported for abuse by a customer.', 'multivendorx' ),
					'admin_enabled'          => true,
					'store_enabled'          => true,
					'customer_enabled'       => true,
					'email_subject'          => 'Product reported',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#e8fbea;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6ddf8f;background-color:#e8fbea;font-size:21px'>Abuse report received</h1>
								<div style='color:#555555;font-size:15px'>A customer has reported a product for review</div>
							</td>
						</tr>
					<tr>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>A customer has submitted an abuse report for the product [product_name] from store [store_name] on [marketplace_name].</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>The report has been recorded and may require your review to ensure marketplace policies are maintained.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#eeeded;margin-top:32px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:21px'>Report details</h1>
								<div style='font-size:15px;padding-left:14px;padding-top:10px'>i) A customer has reported a product for abuse or policy violation</div>
								<div style='padding-top:5px;padding-left:14px;font-size:15px'>ii) The reported product details are available in the admin panel</div>
								<div style='font-size:15px;padding-top:5px;padding-left:14px'>iii) You can review the report and take appropriate action if necessary</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>Please review the report and take the necessary action according to marketplace guidelines.</div>",
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
					'name'                   => __( 'System announcement', 'multivendorx' ),
					'desc'                   => __( 'A system-wide announcement is published by the admin.', 'multivendorx' ),
					'store_enabled'          => true,
					'admin_enabled'          => true,
					'email_subject'          => 'New announcement',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#fff7ec;margin-bottom:48px;border-radius:5px;color:#d88c5c'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#d88c5c;background-color:#fff7ec;font-size:21px'>System announcement</h1>
								<div style='color:#555555;font-size:15px'>Important update from the marketplace</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello [user_name],</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>We would like to inform you about an important update from [marketplace_name].</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>Please review the details below to stay informed about the latest changes or announcements.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#eeeded;margin-top:32px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:21px'>Announcement details</h1>
								<div style='font-size:15px;padding-left:14px;padding-top:10px'>i) [announcement_point_1]</div>
								<div style='padding-top:5px;padding-left:14px;font-size:15px'>ii) [announcement_point_2]</div>
								<div style='font-size:15px;padding-top:5px;padding-left:14px'>iii) [announcement_point_3]</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>If you have any questions or need further clarification, please feel free to contact our support team.</div>",
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
					'name'                   => __( 'Store followed', 'multivendorx' ),
					'desc'                   => __( 'Customer started following the store.', 'multivendorx' ),
					'customer_enabled'       => false,
					'store_enabled'          => true,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'You have a new store follower',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#e8fbea;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e8fbea;font-size:21px'>New store follower</h1>
								<div style='color:#555555;font-size:15px'>A customer has followed your store</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello [customer_name],</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>A customer has started following your store [store_name] on [marketplace_name].</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>Followers can receive updates about your store activities, products, and announcements.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#eeeded;margin-top:32px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:21px'>What this means</h1>
								<div style='font-size:15px;padding-left:14px;padding-top:10px'>i) A customer has followed your store</div>
								<div style='padding-top:5px;padding-left:14px;font-size:15px'>ii) They may receive updates about your products and store announcements</div>
								<div style='font-size:15px;padding-top:5px;padding-left:14px'>iii) Store followers can help increase visibility and engagement</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>Keep your store updated with products and offers to engage your followers.</div>",
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
					'name'                   => __( 'New product from followed store', 'multivendorx' ),
					'desc'                   => __( 'New product published by a followed store.', 'multivendorx' ),
					'customer_enabled'       => true,
					'store_enabled'          => false,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'New product from "[store_name]"',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#e8fbea;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e8fbea;font-size:21px'>New product from your followed store</h1>
								<div style='color:#555555;font-size:15px'>Discover the latest addition from a store you follow</div>
							</td>
						</tr>
					<tr>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello [customer_name],</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>Good news! A new product has just been added by [store_name], a store you follow on [marketplace_name].</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>Be among the first to explore and purchase this latest offering.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#eeeded;margin-top:32px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:21px'>Product highlights</h1>
								<div style='font-size:15px;padding-left:14px;padding-top:10px'>i) Product Name: [product_name]</div>
								<div style='padding-top:5px;padding-left:14px;font-size:15px'>ii) Category: [product_category]</div>
								<div style='font-size:15px;padding-top:5px;padding-left:14px'>iii) Price: [product_price]</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>Visit the store now to check out this new product and stay updated with the latest arrivals.</div>",
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
					'name'                   => __( 'New coupon from followed store', 'multivendorx' ),
					'desc'                   => __( 'New coupon created by a followed store.', 'multivendorx' ),
					'customer_enabled'       => true,
					'store_enabled'          => false,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'New coupon from "[store_name]"',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#e8fbea;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e9fbea;font-size:21px'>New coupon from your followed store</h1>
								<div style='color:#555555;font-size:15px'>Enjoy exclusive savings from your favorite store</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello [customer_name],</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>Great news! A new coupon has been offered by [store_name], a store you follow on [marketplace_name].</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>Use this coupon to enjoy special discounts on your next purchase.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#eeeded;margin-top:32px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:21px'>Coupon details</h1>
								<div style='font-size:15px;padding-left:14px;padding-top:10px'>i) Coupon Code: [coupon_code]</div>
								<div style='padding-top:5px;padding-left:14px;font-size:15px'>ii) Discount: [discount_details]</div>
								<div style='font-size:15px;padding-top:5px;padding-left:14px'>iii) Valid Until: [expiry_date]</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>Don't miss out on this limited-time offer. Visit the store and start saving today!</div>",
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
					'name'                   => __( 'Store vacation alert', 'multivendorx' ),
					'desc'                   => __( 'Followed store marked as on vacation.', 'multivendorx' ),
					'customer_enabled'       => true,
					'store_enabled'          => false,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Store "[store_name]" is on vacation',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#fffce8;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#d4b86a;background-color:#fffce8;font-size:21px'>Store on vacation</h1>
								<div style='color:#555555;font-size:15px'>The store is temporarily unavailable</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello [customer_name],</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>Please note that the store [store_name] on [marketplace_name] is currently on vacation and is temporarily not accepting new orders.</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'><br></div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#eeeded;margin-top:32px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:21px'>What this means</h1>
								<div style='font-size:15px;padding-left:14px;padding-top:10px'>i) New orders cannot be placed with this store at the moment</div>
								<div style='padding-top:5px;padding-left:14px;font-size:15px'>ii) The store will resume operations after the vacation period ends</div>
								<div style='font-size:15px;padding-top:5px;padding-left:14px'><br></div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>We appreciate your understanding and encourage you to check back once the store is active again.</div>",
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
					'name'                   => __( 'Wholesale buyer approved', 'multivendorx' ),
					'desc'                   => __( 'User request for wholesale access has been approved.', 'multivendorx' ),
					'customer_enabled'       => true,
					'store_enabled'          => false,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Your wholesale access has been approved',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#e8fbea;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6bbf8f;background-color:#e8fbea;font-size:21px'>Wholesale buyer approved</h1>
								<div style='color:#555555;font-size:15px'>Your wholesale account is now active</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello [customer_name],</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>Great news! Your request to become a wholesale buyer on [marketplace_name] has been successfully approved.</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>You can now access wholesale pricing, place bulk orders, and enjoy exclusive benefits available to wholesale customers.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#eeeded;margin-top:32px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:21px'>What you can do now</h1>
								<div style='font-size:15px;padding-left:14px;padding-top:10px'>i) Log in to your account and explore wholesale pricing</div>
								<div style='padding-top:5px;padding-left:14px;font-size:15px'>ii) Place bulk orders with eligible products</div>
								<div style='font-size:15px;padding-top:5px;padding-left:14px'><br></div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>Your wholesale access is now active. Start exploring and make the most of your wholesale benefits.</div>",
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
					'name'                   => __( 'Wholesale buyer rejected', 'multivendorx' ),
					'desc'                   => __( 'User request for wholesale access has been rejected.', 'multivendorx' ),
					'customer_enabled'       => true,
					'store_enabled'          => false,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Wholesale access request not approved',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#f2cfcf;margin-bottom:48px;border-radius:5px'>
						<td>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#e92525;background-color:#f2cfcf;font-size:21px'>Wholesale buyer rejected</h1>
								<div style='color:#e92525;font-size:15px'>Your wholesale account request was not approved</div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello,</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>We would like to inform you that your request to become a wholesale buyer on [marketplace_name] has been reviewed and was not approved by the admin.</div>
					<div style='line-height:1.25;font-size:15px;padding-top:24px;font-weight:500'>Your account will remain active as a regular customer account.</div>
					<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#eeeded;margin-top:32px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='font-size:21px'>Reason for rejection</h1>
								<div style='font-size:15px;padding-left:14px;padding-top:10px'>i) The submitted details did not meet wholesale eligibility requirements</div>
								<div style='padding-top:5px;padding-left:14px;font-size:15px'>ii) Some required information or documents may be incomplete</div>
								<div style='font-size:15px;padding-top:5px;padding-left:14px'>iii) The application does not currently align with marketplace policies</div>
							</td>
						</tr>
					</table>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>If you have any questions or wish to reapply, please contact the marketplace support team for further guidance.</div>",
					'available_placeholders' => array(
						'[marketplace_name]',
					),
					'sms_content'            => 'Your wholesale buyer request was not approved. Please contact support for details.',
					'system_message'         => 'Your wholesale buyer request has been rejected.',
					'tag'                    => 'Wholesale',
					'category'               => 'notification',
				),
				'store_support_reply'                 => array(
					'name'                   => __( 'Store replied to support ticket', 'multivendorx' ),
					'desc'                   => __( 'Store owner replies to a support ticket.', 'multivendorx' ),
					'customer_enabled'       => true,
					'store_enabled'          => false,
					'admin_enabled'          => false,
					'system_enabled'         => true,
					'email_subject'          => 'Reply to your support ticket – [subject]',
					'email_body'             => "<table width='100%' cellpadding='0' cellspacing='0' style='padding-top:16px;padding-bottom:16px;padding-right:16px;padding-left:16px;background-color:#e6f4ff;margin-bottom:48px;border-radius:5px'>
						<tr>
							<td valign='top' style='padding:10px;'>
								<h1 style='color:#6e9fd1;background-color:#e6f4ff;font-size:21px'>Store replied to your support ticket</h1>
								<div style='color:#555555;font-size:15px'></div>
							</td>
						</tr>
					</table>
					<h1 style='font-size:20px;padding-bottom:16px'>Hello [name],</h1>
					<div style='font-size:16px;line-height:1.25;padding-top:20px'>The store has replied to your support ticket <strong>[subject]</strong>.</div>
					<div style='background-color:#f7fafc;padding:15px;margin-top:15px;margin-bottom:15px;border-radius:5px'>
						<div style='font-size:15px;font-weight:500;margin-bottom:8px'>Store reply:</div>
						<div style='font-size:15px;line-height:1.5'>[reply]</div>
					</div>
					<div style='color:#2d3748;font-size:16px;margin-top:64px;line-height:1.125;margin-bottom:48px'>Thank you for contacting the store.</div>",
					'available_placeholders' => array(
						'[name]',
						'[subject]',
						'[reply]',
					),
					'sms_content'            => 'The store has replied to your support ticket: [reply]',
					'system_message'         => 'Support ticket reply received.',
					'tag'                    => 'Store Support',
					'category'               => 'notification',
				),
			)
		);

		if ( ! $is_new ) {
			$table = $wpdb->prefix . Utill::TABLES['system_events'];
			$count = $wpdb->get_var( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
				$wpdb->prepare( 'SELECT COUNT(*) FROM %i', $table )
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
				'SELECT * FROM %i WHERE system_action = %s',
				$table,
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
			$message = $this->add_missing_css_units( $message );
			$headers = array( 'Content-Type: text/html; charset=UTF-8' );

			// VuloMail intercepts every wp_mail() call sitewide via its own pre_wp_mail hook
			// when it's ready, and falls back to WordPress's default mailer otherwise -- calling
			// wp_mail() directly here is all that's needed; it works the same with or without
			// VuloMail installed/active, without this file depending on VuloMail's own API.
			wp_mail( $to, $subject, $message, $headers );
		}

		if ( $event->sms_enabled ) {
			$receivers = array();

			if ( $event->admin_enabled ) {
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
				if ( is_array( $value ) ) {
					$value = implode( ' ', $value );
				}
				$message = str_replace( '[' . $key . ']', $value, $message );
			}

			if ( function_exists( 'vulomail_is_sms_ready' ) && vulomail_is_sms_ready() ) {
				foreach ( array_filter( $receivers ) as $number ) {
					vulomail_send_sms( $number, $message );
				}
			} else {
				// VuloMail is the only SMS delivery path now -- nothing to fall back to, so
				// flag it instead of silently dropping the message. render_vulomail_sms_notice()
				// surfaces this once as a dismissible admin notice with a link to fix it.
				update_option( self::VULOMAIL_SMS_NOT_READY_OPTION, 1 );
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
					'SELECT * FROM %i WHERE id = %d',
					$table,
					$id
				)
			);
		} else {
			$events = $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM %i', $table ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
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

		return $wpdb->query( $wpdb->prepare( 'DELETE FROM %i', $table ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
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

		if ( ! empty( $args ) ) {
			$filter_by_id     = isset( $args['ID'] ) ? 1 : 0;
			$notification_ids = array_merge( array( 0 ), array_map( 'intval', (array) ( $args['ID'] ?? 0 ) ) ); // 0 keeps IN () valid for an empty list.
			$category         = (string) ( $args['category'] ?? '' );
			$store_id         = intval( $args['store_id'] ?? 0 );
			$by_dates         = ( isset( $args['start_date'] ) && isset( $args['end_date'] ) ) ? 1 : 0;
			$start_date       = (string) ( $args['start_date'] ?? '' );
			$end_date         = (string) ( $args['end_date'] ?? '' );
			$filter_values    = array( $filter_by_id, isset( $args['category'] ) ? 1 : 0, $category, ...array_fill( 0, 2, $store_id ), $by_dates, $start_date, $end_date );

			// Every filter is always present in the literal query; an unused one is a no-op.
			if ( isset( $args['count'] ) ) {
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
				$results = $wpdb->get_var(
					$wpdb->prepare(
						'SELECT COUNT(*) FROM %i
						WHERE ( %d = 0 OR ID IN (' . esc_sql( implode( ',', $notification_ids ) ) . ') )
						AND ( %d = 0 OR category = %s )
						AND ( %d = 0 OR store_id = %d )
						AND ( %d = 0 OR created_at BETWEEN %s AND %s )
						AND is_dismissed = 0 AND is_read = 0',
						$table,
						...$filter_values
					)
				);
				return $results ?? 0;
			}

			$has_limit = isset( $args['limit'] ) && isset( $args['offset'] );
			$limit     = $has_limit ? intval( $args['limit'] ) : PHP_INT_MAX;
			$offset    = $has_limit ? intval( $args['offset'] ) : 0;

			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$results = $wpdb->get_results(
				$wpdb->prepare(
					'SELECT * FROM %i
					WHERE ( %d = 0 OR ID IN (' . esc_sql( implode( ',', $notification_ids ) ) . ') )
					AND ( %d = 0 OR category = %s )
					AND ( %d = 0 OR store_id = %d )
					AND ( %d = 0 OR created_at BETWEEN %s AND %s )
					AND is_dismissed = 0 AND is_read = 0
					LIMIT %d OFFSET %d',
					$table,
					...array_merge( $filter_values, array( $limit, $offset ) )
				),
				ARRAY_A
			);
			return $results ?? array();
		}

		// No filters requested: fall back to the plain, non-dismissed list.
		$events = $wpdb->get_results( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->prepare(
				'SELECT * FROM %i WHERE is_dismissed = %d',
				$table,
				0
			)
		);

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

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->query(
			$wpdb->prepare(
                '
		DELETE FROM %i
		WHERE (expires_at IS NOT NULL AND expires_at < %s)
		OR (created_at < DATE_SUB(%s, INTERVAL %d DAY))
		',
                $table,
                $current_date,
                $current_date,
                $days
			)
		);
	}

	/**
	 * Renders a one-time, dismissible admin notice prompting the admin to install VuloMail
	 * (if it's not active at all) or set up an SMS connection in it (if it is active but
	 * has none configured), after an SMS notification couldn't be sent because of either.
	 *
	 * @return void
	 */
	public function render_vulomail_sms_notice() {
		if ( ! get_option( self::VULOMAIL_SMS_NOT_READY_OPTION ) || ! current_user_can( 'manage_options' ) ) {
			return;
		}

		if ( is_plugin_active( 'vulomail/vulomail.php' ) ) {
			$message = __( 'MultiVendorX could not send an SMS notification because VuloMail has no SMS gateway connected yet.', 'multivendorx' );
			$url     = admin_url( 'admin.php?page=vulomail' );
			$cta     = __( 'Set up SMS in VuloMail', 'multivendorx' );
		} else {
			$message = __( 'MultiVendorX could not send an SMS notification because VuloMail, the plugin it relies on for SMS delivery, isn\'t installed.', 'multivendorx' );
			$url     = admin_url( 'plugin-install.php?s=vulomail&tab=search&type=term' );
			$cta     = __( 'Install VuloMail', 'multivendorx' );
		}

		printf(
			'<div class="notice notice-warning is-dismissible"><p>%s</p><p><a href="%s" class="button">%s</a></p></div>',
			esc_html( $message ),
			esc_url( $url ),
			esc_html( $cta )
		);

		delete_option( self::VULOMAIL_SMS_NOT_READY_OPTION );
	}

	/**
	 * Where admin SMS alerts go, now that the "Receiver phone number" field has moved
	 * out of MultiVendorX's own settings. VuloMail owns it as `sms_admin_phone` (its
	 * "Admin phone" setting) — there's no MultiVendorX-side fallback once VuloMail is
	 * the delivery path, since the UI to configure one no longer exists.
	 *
	 * @return string Phone number in the format VuloMail's "Admin phone" setting stores it, or ''.
	 */
	private function get_sms_admin_recipient() {
		if ( ! function_exists( 'VuloMail' ) || ! isset( VuloMail()->settings ) ) {
			return '';
		}

		return (string) VuloMail()->settings->get( 'sms_admin_phone' );
	}

	/**
	 * Build the common notification payload and fire the event's trigger hook.
	 *
	 * Merges admin/store/customer contact info derived from $store and $order
	 * with any event-specific $extra data, then fires
	 * `multivendorx_notify_{$type}` for `register_notification_hooks()` to pick up.
	 *
	 * @param string      $type  Event key (system_action), e.g. 'order_processing'.
	 * @param object|null $store Store object, if the event is store-scoped.
	 * @param object|null $order WC_Order object, if the event is order-scoped.
	 * @param array       $extra Additional payload fields merged in (e.g. 'order_id', 'category').
	 * @return void
	 */
	public function send_notification_helper( $type, $store = null, $order = null, $extra = array() ) {
		$store_name     = '';
		$store_email    = '';
		$store_phone    = '';
		$customer_email = '';
		$customer_phone = '';

		if ( $store ) {
			$store_name       = $store->get( Utill::STORE_SETTINGS_KEYS['name'] );
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
				'admin_phone'      => $this->get_sms_admin_recipient(),
				'store_name'       => $store_name,
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
