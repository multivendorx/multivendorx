<?php
/**
 * Templates class file.
 *
 * @package CatalogX
 */

namespace CatalogX\VuloMail;

defined( 'ABSPATH' ) || exit;

/**
 * Registers CatalogX's transactional emails with VuloMail (`vulomail_email_templates`), so their
 * subject/content are editable there -- the single source of truth `Mailer::send()` reads from,
 * instead of a `WC_Email` template file.
 *
 * Every template is plain HTML `content` -- the same fallback used when VuloMail isn't active.
 * VuloMail owns turning that into its own block-based preview/editor; this class never builds a
 * blocks array or renders one to HTML itself.
 */
class Templates {

	const ENQUIRY               = 'catalogx/enquiry';
	const ENQUIRY_CARD          = 'catalogx/enquiry-card';
	const ENQUIRY_PURPLE_BANNER = 'catalogx/enquiry-purple-banner';
	const ENQUIRY_MINIMAL       = 'catalogx/enquiry-minimal';
	const ENQUIRY_ALERT         = 'catalogx/enquiry-alert';
	const ENQUIRY_SIDEBAR       = 'catalogx/enquiry-sidebar';
	const ENQUIRY_REPORT        = 'catalogx/enquiry-report';
	const QUOTE_REQUEST         = 'catalogx/quote-request';

	/**
	 * Templates constructor.
	 */
	public function __construct() {
		add_filter( 'vulomail_email_templates', array( $this, 'add_templates' ) );
		add_filter( 'vulomail_email_template_categories', array( $this, 'add_category' ) );
	}

	/**
	 * Adds CatalogX's own templates to VuloMail's registered list.
	 *
	 * @param array $templates Existing templates, `plugin/name` => {title, description, category, ...}.
	 * @return array
	 */
	public function add_templates( $templates ) {
		foreach ( self::defaults() as $name => $template ) {
			$templates[ $name ] = $template;
		}

		return $templates;
	}

	/**
	 * Adds CatalogX's own category to VuloMail's registered list.
	 *
	 * @param array $categories Existing categories, slug => label.
	 * @return array
	 */
	public function add_category( $categories ) {
		$categories['catalogx'] = __( 'CatalogX', 'catalogx' );

		return $categories;
	}

	/**
	 * The default subject/content for every email `Mailer::send()` knows how to send -- used to
	 * register them with VuloMail, and as the fallback when VuloMail isn't active. Each `content`
	 * is plain HTML, written inline here -- no blocks array, no separate renderer.
	 *
	 * @return array `plugin/name` => {title, description, category, group, recipients, subject, content}
	 */
	public static function defaults() {
		$enquiry_subject = __( 'New enquiry for {product_name} from {user_name}', 'catalogx' );
		$card_open       = '<div style="background:#f8fafc;padding:32px 12px;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;"><div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:36px 32px;color:#334155;line-height:1.6;">';
		$card_close      = '</div></div>';

		return array(
			self::ENQUIRY               => array(
				'title'       => __( 'Enquiry notification', 'catalogx' ),
				'description' => __( 'Sent to the site owner (and vendor, if MultiVendorX is active) when a customer sends a product enquiry.', 'catalogx' ),
				'category'    => 'catalogx',
				'group'       => __( 'Enquiry', 'catalogx' ),
				'recipients'  => array( 'admin', 'store' ),
				'subject'     => $enquiry_subject,
				'content'     => $card_open
					. '<div style="margin-top:0px;margin-bottom:6px;color:#4f46e5;font-size:13px;font-weight:700;">' . esc_html__( 'New enquiry', 'catalogx' ) . '</div>'
					. '<h1 style="line-height:1.25;margin-top:0px;margin-bottom:16px;color:#0f172a;font-size:28px;font-weight:800;">' . esc_html__( 'You have a new product enquiry', 'catalogx' ) . '</h1>'
					. '<div style="margin-top:0px;margin-bottom:6px;color:#0f172a;font-size:16px;font-weight:700;">' . esc_html__( 'Hi {user_name},', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:24px;color:#334155;font-size:16px;">' . esc_html__( 'Someone is interested in {product_name}. Here is everything you need to follow up.', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:0px;background-color:#eef2ff;color:#4f46e5;font-size:12px;font-weight:600;padding-top:16px;padding-right:18px;padding-bottom:2px;padding-left:18px;">' . esc_html__( 'Product', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:8px;background-color:#eef2ff;color:#312e81;font-size:16px;font-weight:700;padding-top:2px;padding-right:18px;padding-bottom:16px;padding-left:18px;">{product_name}</div>'
					. '<div style="margin-top:0px;margin-bottom:0px;background-color:#f8fafc;color:#64748b;font-size:12px;font-weight:600;padding-top:16px;padding-right:18px;padding-bottom:2px;padding-left:18px;">' . esc_html__( 'Customer', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:8px;background-color:#f8fafc;color:#0f172a;font-size:16px;font-weight:700;padding-top:2px;padding-right:18px;padding-bottom:16px;padding-left:18px;">{user_name}</div>'
					. '<div style="margin-top:0px;margin-bottom:0px;background-color:#f8fafc;color:#64748b;font-size:12px;font-weight:600;padding-top:16px;padding-right:18px;padding-bottom:2px;padding-left:18px;">' . esc_html__( 'Email', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:8px;background-color:#f8fafc;color:#4f46e5;font-size:16px;font-weight:700;padding-top:2px;padding-right:18px;padding-bottom:16px;padding-left:18px;">{user_email}</div>'
					. '<div style="margin-top:16px;margin-bottom:6px;color:#64748b;font-size:12px;font-weight:700;">' . esc_html__( 'Message', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:8px;background-color:#f8fafc;color:#334155;font-size:15px;border-radius:12px;padding-top:20px;padding-right:20px;padding-bottom:20px;padding-left:20px;">{enquiry_details}</div>'
					. '<hr style="border:none;border-top:1px solid #e2e8f0;margin-top:28px;margin-bottom:16px;">'
					. '<div style="margin-top:0px;margin-bottom:8px;text-align:center;color:#64748b;font-size:12px;">' . esc_html__( 'You are receiving this email because product enquiries are enabled on your store.', 'catalogx' ) . '</div>'
					. $card_close,
			),
			self::ENQUIRY_CARD          => array(
				'title'       => __( 'Enquiry notification (card style)', 'catalogx' ),
				'description' => __( 'Same enquiry notification, with a soft hero panel and stacked detail cards.', 'catalogx' ),
				'category'    => 'catalogx',
				'group'       => __( 'Enquiry', 'catalogx' ),
				'recipients'  => array( 'admin', 'store' ),
				'subject'     => $enquiry_subject,
				'content'     => $card_open
					. '<h1 style="line-height:1.25;margin-top:0px;margin-bottom:24px;text-align:center;color:#312e81;background-color:#eef2ff;font-size:28px;font-weight:800;border-radius:16px;padding-top:40px;padding-right:24px;padding-bottom:40px;padding-left:24px;">' . esc_html__( 'New product enquiry', 'catalogx' ) . '</h1>'
					. '<div style="margin-top:0px;margin-bottom:6px;color:#0f172a;font-size:16px;font-weight:700;text-align:center;">' . esc_html__( 'Hi {user_name},', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:24px;color:#334155;font-size:16px;text-align:center;">' . esc_html__( 'A customer has asked about {product_name}. Their details are below.', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:0px;background-color:#f8fafc;color:#64748b;font-size:12px;font-weight:600;padding-top:16px;padding-right:18px;padding-bottom:2px;padding-left:18px;">' . esc_html__( 'Product', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:8px;background-color:#f8fafc;color:#0f172a;font-size:16px;font-weight:700;padding-top:2px;padding-right:18px;padding-bottom:16px;padding-left:18px;">{product_name}</div>'
					. '<div style="margin-top:0px;margin-bottom:0px;background-color:#f8fafc;color:#64748b;font-size:12px;font-weight:600;padding-top:16px;padding-right:18px;padding-bottom:2px;padding-left:18px;">' . esc_html__( 'Customer', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:8px;background-color:#f8fafc;color:#0f172a;font-size:16px;font-weight:700;padding-top:2px;padding-right:18px;padding-bottom:16px;padding-left:18px;">{user_name}</div>'
					. '<div style="margin-top:0px;margin-bottom:0px;background-color:#f8fafc;color:#64748b;font-size:12px;font-weight:600;padding-top:16px;padding-right:18px;padding-bottom:2px;padding-left:18px;">' . esc_html__( 'Email', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:8px;background-color:#f8fafc;color:#4f46e5;font-size:16px;font-weight:700;padding-top:2px;padding-right:18px;padding-bottom:16px;padding-left:18px;">{user_email}</div>'
					. '<div style="margin-top:16px;margin-bottom:6px;color:#64748b;font-size:12px;font-weight:700;">' . esc_html__( 'Message', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:8px;background-color:#f8fafc;color:#334155;font-size:15px;border-radius:12px;padding-top:20px;padding-right:20px;padding-bottom:20px;padding-left:20px;">{enquiry_details}</div>'
					. '<hr style="border:none;border-top:1px solid #e2e8f0;margin-top:28px;margin-bottom:16px;">'
					. '<div style="margin-top:0px;margin-bottom:8px;text-align:center;color:#64748b;font-size:12px;">' . esc_html__( 'Reply to the customer directly to follow up on this enquiry.', 'catalogx' ) . '</div>'
					. $card_close,
			),
			self::ENQUIRY_PURPLE_BANNER => array(
				'title'       => __( 'Enquiry notification (purple banner)', 'catalogx' ),
				'description' => __( 'Same enquiry notification, with a bold indigo hero banner.', 'catalogx' ),
				'category'    => 'catalogx',
				'group'       => __( 'Enquiry', 'catalogx' ),
				'recipients'  => array( 'admin', 'store' ),
				'subject'     => $enquiry_subject,
				'content'     => $card_open
					. '<h1 style="line-height:1.25;margin-top:0px;margin-bottom:24px;text-align:center;color:#ffffff;background-color:#312e81;font-size:28px;font-weight:800;border-radius:16px;padding-top:40px;padding-right:24px;padding-bottom:40px;padding-left:24px;">' . esc_html__( 'New enquiry received', 'catalogx' ) . '</h1>'
					. '<div style="margin-top:0px;margin-bottom:6px;color:#0f172a;font-size:16px;font-weight:700;">' . esc_html__( 'Hi {user_name},', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:24px;color:#334155;font-size:16px;">' . esc_html__( 'A customer has submitted a new enquiry for {product_name}. Please review the details below.', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:16px;background-color:#eef2ff;color:#312e81;font-size:14px;font-weight:700;border-radius:10px;padding-top:12px;padding-right:16px;padding-bottom:12px;padding-left:16px;">' . esc_html__( 'Enquiry details', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:0px;background-color:#f5f3ff;color:#64748b;font-size:12px;font-weight:600;padding-top:16px;padding-right:18px;padding-bottom:2px;padding-left:18px;">' . esc_html__( 'Customer name', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:8px;background-color:#f5f3ff;color:#0f172a;font-size:16px;font-weight:700;padding-top:2px;padding-right:18px;padding-bottom:16px;padding-left:18px;">{user_name}</div>'
					. '<div style="margin-top:0px;margin-bottom:0px;background-color:#f5f3ff;color:#64748b;font-size:12px;font-weight:600;padding-top:16px;padding-right:18px;padding-bottom:2px;padding-left:18px;">' . esc_html__( 'Email address', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:8px;background-color:#f5f3ff;color:#4f46e5;font-size:16px;font-weight:700;padding-top:2px;padding-right:18px;padding-bottom:16px;padding-left:18px;">{user_email}</div>'
					. '<div style="margin-top:16px;margin-bottom:6px;color:#64748b;font-size:12px;font-weight:700;">' . esc_html__( 'Message', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:8px;background-color:#f8fafc;color:#334155;font-size:15px;border-radius:12px;padding-top:20px;padding-right:20px;padding-bottom:20px;padding-left:20px;">{enquiry_details}</div>'
					. '<hr style="border:none;border-top:1px solid #e2e8f0;margin-top:28px;margin-bottom:16px;">'
					. '<div style="margin-top:0px;margin-bottom:8px;text-align:center;color:#64748b;font-size:12px;">' . esc_html__( 'This is an automated notification.', 'catalogx' ) . '</div>'
					. $card_close,
			),
			self::ENQUIRY_MINIMAL       => array(
				'title'       => __( 'Enquiry notification (minimal)', 'catalogx' ),
				'description' => __( 'Same enquiry notification, typography only with no colored backgrounds.', 'catalogx' ),
				'category'    => 'catalogx',
				'group'       => __( 'Enquiry', 'catalogx' ),
				'recipients'  => array( 'admin', 'store' ),
				'subject'     => $enquiry_subject,
				'content'     => $card_open
					. '<h2 style="line-height:1.25;margin-top:0px;margin-bottom:16px;color:#0f172a;font-size:22px;font-weight:800;">' . esc_html__( 'New product enquiry', 'catalogx' ) . '</h2>'
					. '<div style="margin-top:0px;margin-bottom:6px;color:#0f172a;font-size:16px;font-weight:700;">' . esc_html__( 'Hi {user_name},', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:0px;color:#334155;font-size:16px;">' . esc_html__( 'A customer has submitted an enquiry for {product_name}.', 'catalogx' ) . '</div>'
					. '<hr style="border:none;border-top:1px solid #e2e8f0;margin-top:20px;margin-bottom:20px;">'
					. '<div style="margin-top:0px;margin-bottom:6px;color:#64748b;font-size:12px;font-weight:700;">' . esc_html__( 'Product', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:16px;color:#0f172a;font-size:16px;font-weight:600;">{product_name}</div>'
					. '<div style="margin-top:0px;margin-bottom:6px;color:#64748b;font-size:12px;font-weight:700;">' . esc_html__( 'Name', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:16px;color:#0f172a;font-size:16px;font-weight:600;">{user_name}</div>'
					. '<div style="margin-top:0px;margin-bottom:6px;color:#64748b;font-size:12px;font-weight:700;">' . esc_html__( 'Email', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:16px;color:#0f172a;font-size:16px;font-weight:600;">{user_email}</div>'
					. '<div style="margin-top:0px;margin-bottom:6px;color:#64748b;font-size:12px;font-weight:700;">' . esc_html__( 'Message', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:8px;color:#334155;font-size:15px;">{enquiry_details}</div>'
					. $card_close,
			),
			self::ENQUIRY_ALERT         => array(
				'title'       => __( 'Enquiry notification (alert badge)', 'catalogx' ),
				'description' => __( 'Same enquiry notification, with an orange "new" alert strip and timestamp.', 'catalogx' ),
				'category'    => 'catalogx',
				'group'       => __( 'Enquiry', 'catalogx' ),
				'recipients'  => array( 'admin', 'store' ),
				'subject'     => $enquiry_subject,
				'content'     => $card_open
					. '<div style="margin-top:0px;margin-bottom:24px;background-color:#fff7ed;color:#c2410c;font-size:12px;font-weight:700;border-radius:10px;padding-top:12px;padding-right:16px;padding-bottom:12px;padding-left:16px;">' . esc_html__( '● New enquiry  ·  Received {date_time}', 'catalogx' ) . '</div>'
					. '<h1 style="line-height:1.25;margin-top:0px;margin-bottom:16px;color:#0f172a;font-size:28px;font-weight:800;">' . esc_html__( 'Product enquiry for {product_name}', 'catalogx' ) . '</h1>'
					. '<div style="margin-top:0px;margin-bottom:6px;color:#0f172a;font-size:16px;font-weight:700;">' . esc_html__( 'Hi {user_name},', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:24px;color:#334155;font-size:16px;">' . esc_html__( 'A customer is waiting to hear back from you. Here is what they sent.', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:0px;background-color:#f8fafc;color:#64748b;font-size:12px;font-weight:600;padding-top:16px;padding-right:18px;padding-bottom:2px;padding-left:18px;">' . esc_html__( 'Customer', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:8px;background-color:#f8fafc;color:#0f172a;font-size:16px;font-weight:700;padding-top:2px;padding-right:18px;padding-bottom:16px;padding-left:18px;">{user_name}</div>'
					. '<div style="margin-top:0px;margin-bottom:0px;background-color:#f8fafc;color:#64748b;font-size:12px;font-weight:600;padding-top:16px;padding-right:18px;padding-bottom:2px;padding-left:18px;">' . esc_html__( 'Email', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:8px;background-color:#f8fafc;color:#ea580c;font-size:16px;font-weight:700;padding-top:2px;padding-right:18px;padding-bottom:16px;padding-left:18px;">{user_email}</div>'
					. '<div style="margin-top:16px;margin-bottom:6px;color:#64748b;font-size:12px;font-weight:700;">' . esc_html__( 'Message', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:8px;background-color:#f8fafc;color:#334155;font-size:15px;border-radius:12px;padding-top:20px;padding-right:20px;padding-bottom:20px;padding-left:20px;">{enquiry_details}</div>'
					. '<hr style="border:none;border-top:1px solid #e2e8f0;margin-top:28px;margin-bottom:16px;">'
					. '<div style="margin-top:0px;margin-bottom:8px;text-align:center;color:#64748b;font-size:12px;">' . esc_html__( 'This is an automated notification. Please do not reply to this email — reply to the customer at {user_email} instead.', 'catalogx' ) . '</div>'
					. $card_close,
			),
			self::ENQUIRY_SIDEBAR       => array(
				'title'       => __( 'Enquiry notification (accent sidebar)', 'catalogx' ),
				'description' => __( 'Same enquiry notification, as a key/value sheet with a tinted label column.', 'catalogx' ),
				'category'    => 'catalogx',
				'group'       => __( 'Enquiry', 'catalogx' ),
				'recipients'  => array( 'admin', 'store' ),
				'subject'     => $enquiry_subject,
				'content'     => $card_open
					. '<div style="margin-top:0px;margin-bottom:6px;color:#6d28d9;font-size:13px;font-weight:700;">' . esc_html__( 'New enquiry', 'catalogx' ) . '</div>'
					. '<h1 style="line-height:1.25;margin-top:0px;margin-bottom:16px;color:#0f172a;font-size:28px;font-weight:800;">' . esc_html__( 'New product enquiry', 'catalogx' ) . '</h1>'
					. '<div style="margin-top:0px;margin-bottom:6px;color:#0f172a;font-size:16px;font-weight:700;">' . esc_html__( 'Hi {user_name},', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:24px;color:#334155;font-size:16px;">' . esc_html__( 'A customer has submitted an enquiry for {product_name}. Here are the full details.', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:0px;background-color:#f5f3ff;color:#6d28d9;font-size:12px;font-weight:700;border-radius:8px;padding-top:10px;padding-right:16px;padding-bottom:2px;padding-left:16px;">' . esc_html__( 'Product', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:8px;background-color:#f8fafc;color:#0f172a;font-size:15px;font-weight:600;border-radius:8px;padding-top:2px;padding-right:16px;padding-bottom:12px;padding-left:16px;">{product_name}</div>'
					. '<div style="margin-top:0px;margin-bottom:0px;background-color:#f5f3ff;color:#6d28d9;font-size:12px;font-weight:700;border-radius:8px;padding-top:10px;padding-right:16px;padding-bottom:2px;padding-left:16px;">' . esc_html__( 'Name', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:8px;background-color:#f8fafc;color:#0f172a;font-size:15px;font-weight:600;border-radius:8px;padding-top:2px;padding-right:16px;padding-bottom:12px;padding-left:16px;">{user_name}</div>'
					. '<div style="margin-top:0px;margin-bottom:0px;background-color:#f5f3ff;color:#6d28d9;font-size:12px;font-weight:700;border-radius:8px;padding-top:10px;padding-right:16px;padding-bottom:2px;padding-left:16px;">' . esc_html__( 'Email', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:8px;background-color:#f8fafc;color:#0f172a;font-size:15px;font-weight:600;border-radius:8px;padding-top:2px;padding-right:16px;padding-bottom:12px;padding-left:16px;">{user_email}</div>'
					. '<div style="margin-top:16px;margin-bottom:6px;color:#6d28d9;font-size:12px;font-weight:700;">' . esc_html__( 'Message', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:8px;background-color:#f5f3ff;color:#334155;font-size:15px;border-radius:12px;padding-top:20px;padding-right:20px;padding-bottom:20px;padding-left:20px;">{enquiry_details}</div>'
					. '<hr style="border:none;border-top:1px solid #e2e8f0;margin-top:28px;margin-bottom:16px;">'
					. '<div style="margin-top:0px;margin-bottom:8px;text-align:center;color:#64748b;font-size:12px;">' . esc_html__( 'Sent automatically when a customer submits a product enquiry.', 'catalogx' ) . '</div>'
					. $card_close,
			),
			self::ENQUIRY_REPORT        => array(
				'title'       => __( 'Enquiry report', 'catalogx' ),
				'description' => __( 'Periodic report of product enquiries, sent to the site admin.', 'catalogx' ),
				'category'    => 'catalogx',
				'group'       => __( 'Enquiry', 'catalogx' ),
				'recipients'  => array( 'admin' ),
				'subject'     => __( 'Your enquiry report: {start_date} – {end_date}', 'catalogx' ),
				'content'     => $card_open
					. '<h1 style="line-height:1.25;margin-top:0px;margin-bottom:24px;text-align:center;color:#ffffff;background-color:#312e81;font-size:28px;font-weight:800;border-radius:16px;padding-top:40px;padding-right:24px;padding-bottom:12px;padding-left:24px;">' . esc_html__( 'Your enquiry summary', 'catalogx' ) . '</h1>'
					. '<div style="margin-top:0px;margin-bottom:24px;background-color:#eef2ff;color:#312e81;font-size:14px;font-weight:700;border-radius:10px;padding-top:12px;padding-right:16px;padding-bottom:12px;padding-left:16px;text-align:center;">' . esc_html__( 'Reporting period: {start_date} – {end_date}', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:24px;color:#334155;font-size:16px;">' . esc_html__( 'Here is how many enquiries each of your products received during this period.', 'catalogx' ) . '</div>'
					. '<table style="width:100%;"><tr>'
					. '<td style="width:49%;vertical-align:top;"><div style="margin-top:0px;margin-bottom:0px;background-color:#f8fafc;color:#64748b;font-size:12px;font-weight:700;padding-top:12px;padding-right:16px;padding-bottom:12px;padding-left:16px;">' . esc_html__( 'Product', 'catalogx' ) . '</div></td>'
					. '<td style="width:2%;font-size:0;line-height:0;">&nbsp;</td>'
					. '<td style="width:49%;vertical-align:top;"><div style="margin-top:0px;margin-bottom:0px;background-color:#f8fafc;color:#64748b;font-size:12px;font-weight:700;padding-top:12px;padding-right:16px;padding-bottom:12px;padding-left:16px;text-align:right;">' . esc_html__( 'Enquiries', 'catalogx' ) . '</div></td>'
					. '</tr></table>'
					. '<table style="width:100%;margin-top:0px;margin-bottom:8px;color:#0f172a;font-size:15px;"><tbody>{enquiry_rows}</tbody></table>'
					. '<hr style="border:none;border-top:1px solid #e2e8f0;margin-top:28px;margin-bottom:16px;">'
					. '<div style="margin-top:0px;margin-bottom:8px;text-align:center;color:#64748b;font-size:12px;">' . esc_html__( 'This report is generated automatically by CatalogX.', 'catalogx' ) . '</div>'
					. $card_close,
			),
			self::QUOTE_REQUEST         => array(
				'title'       => __( 'New quote request', 'catalogx' ),
				'description' => __( 'Sent to the site admin when a customer submits a quote request.', 'catalogx' ),
				'category'    => 'catalogx',
				'group'       => __( 'Quote', 'catalogx' ),
				'recipients'  => array( 'admin' ),
				'subject'     => __( 'New quote request from {customer_name}', 'catalogx' ),
				'content'     => $card_open
					. '<div style="margin-top:0px;margin-bottom:24px;background-color:#ecfdf5;color:#047857;font-size:12px;font-weight:700;border-radius:10px;padding-top:12px;padding-right:16px;padding-bottom:12px;padding-left:16px;">' . esc_html__( '● New quote request', 'catalogx' ) . '</div>'
					. '<h1 style="line-height:1.25;margin-top:0px;margin-bottom:16px;color:#0f172a;font-size:28px;font-weight:800;">' . esc_html__( '{customer_name} is requesting a quote', 'catalogx' ) . '</h1>'
					. '<div style="margin-top:0px;margin-bottom:24px;color:#334155;font-size:16px;">' . esc_html__( 'Review the requested products below and send your best price to the customer.', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:6px;color:#64748b;font-size:12px;font-weight:700;">' . esc_html__( 'Requested products', 'catalogx' ) . '</div>'
					. '<table style="width:100%;"><tr>'
					. '<td style="width:49%;vertical-align:top;"><div style="margin-top:0px;margin-bottom:0px;background-color:#f8fafc;color:#64748b;font-size:12px;font-weight:700;padding-top:12px;padding-right:16px;padding-bottom:12px;padding-left:16px;">' . esc_html__( 'Product', 'catalogx' ) . '</div></td>'
					. '<td style="width:2%;font-size:0;line-height:0;">&nbsp;</td>'
					. '<td style="width:49%;vertical-align:top;"><div style="margin-top:0px;margin-bottom:0px;background-color:#f8fafc;color:#64748b;font-size:12px;font-weight:700;padding-top:12px;padding-right:16px;padding-bottom:12px;padding-left:16px;text-align:right;">' . esc_html__( 'Quantity', 'catalogx' ) . '</div></td>'
					. '</tr></table>'
					. '<table style="width:100%;margin-top:0px;margin-bottom:8px;color:#0f172a;font-size:15px;"><tbody>{quote_rows}</tbody></table>'
					. '<div style="margin-top:24px;margin-bottom:6px;color:#64748b;font-size:12px;font-weight:700;">' . esc_html__( 'Customer', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:0px;background-color:#f8fafc;color:#64748b;font-size:12px;font-weight:600;padding-top:16px;padding-right:18px;padding-bottom:2px;padding-left:18px;">' . esc_html__( 'Email', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:8px;background-color:#f8fafc;color:#047857;font-size:16px;font-weight:700;padding-top:2px;padding-right:18px;padding-bottom:16px;padding-left:18px;">{customer_email}</div>'
					. '<div style="margin-top:0px;margin-bottom:0px;background-color:#f8fafc;color:#64748b;font-size:12px;font-weight:600;padding-top:16px;padding-right:18px;padding-bottom:2px;padding-left:18px;">' . esc_html__( 'Phone', 'catalogx' ) . '</div>'
					. '<div style="margin-top:0px;margin-bottom:8px;background-color:#f8fafc;color:#0f172a;font-size:16px;font-weight:700;padding-top:2px;padding-right:18px;padding-bottom:16px;padding-left:18px;">{customer_phone}</div>'
					. '<div style="margin-top:0px;margin-bottom:8px;background-color:#f8fafc;color:#334155;font-size:15px;border-radius:12px;padding-top:20px;padding-right:20px;padding-bottom:20px;padding-left:20px;">{customer_details}</div>'
					. '<hr style="border:none;border-top:1px solid #e2e8f0;margin-top:28px;margin-bottom:16px;">'
					. '<div style="margin-top:0px;margin-bottom:8px;text-align:center;color:#64748b;font-size:12px;">' . esc_html__( 'You are receiving this email because quote requests are enabled on your store.', 'catalogx' ) . '</div>'
					. $card_close,
			),
		);
	}
}
