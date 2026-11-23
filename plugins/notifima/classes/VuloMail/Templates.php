<?php
/**
 * Templates class file.
 *
 * @package Notifima
 */

namespace Notifima\VuloMail;

defined( 'ABSPATH' ) || exit;

/**
 * Registers Notifima's transactional emails with VuloMail (`vulomail_email_templates`), so their
 * subject/content are editable there -- the single source of truth `Mailer::send()` reads from,
 * instead of a `WC_Email` template file.
 */
class Templates {

    const PRODUCT_BACK_IN_STOCK   = 'notifima/product-back-in-stock';
    const ADMIN_NEW_SUBSCRIBER    = 'notifima/admin-new-subscriber';
    const SUBSCRIBER_CONFIRMATION = 'notifima/subscriber-confirmation';
    const SUBSCRIBER_REPORT       = 'notifima/subscriber-report';

    /**
     * Templates constructor.
     */
    public function __construct() {
        add_filter( 'vulomail_email_templates', array( $this, 'add_templates' ) );
        add_filter( 'vulomail_email_template_categories', array( $this, 'add_category' ) );
    }

    /**
     * @param array $templates Existing templates, `plugin/name` => {title, description, category, ...}.
     * @return array
     */
    public function add_templates( $templates ) {
        return array_merge( $templates, self::defaults() );
    }

    /**
     * @param array $categories Existing categories, slug => label.
     * @return array
     */
    public function add_category( $categories ) {
        $categories['notifima'] = __( 'Notifima', 'notifima' );

        return $categories;
    }

    /**
     * The default subject/content for every email `Mailer::send()` knows how to send -- used to
     * register them with VuloMail, and as the fallback when VuloMail isn't active.
     *
     * @return array `plugin/name` => {title, category, group, recipients, subject, content}
     */
    public static function defaults() {
        return array(
            self::PRODUCT_BACK_IN_STOCK   => array(
                'title'       => __( 'Back in stock notification', 'notifima' ),
                'description' => __( 'Sent to a customer when a product they subscribed to is back in stock.', 'notifima' ),
                'category'    => 'notifima',
                'group'       => __( 'Subscriptions', 'notifima' ),
                'recipients'  => array( 'customer' ),
                'subject'     => __( 'Your subscribed product on {site_title} is available now', 'notifima' ),
                'content'     => '<h2>' . esc_html__( 'Welcome to {site_title}', 'notifima' ) . '</h2><p>' . esc_html__( 'Good news! {product_name} is back in stock.', 'notifima' ) . '</p><p><a href="{product_url}">{product_name}</a> &mdash; {product_price}</p><p>' . esc_html__( 'This notification was sent to {customer_email}.', 'notifima' ) . '</p>',
            ),
            self::ADMIN_NEW_SUBSCRIBER    => array(
                'title'       => __( 'New subscriber (admin notification)', 'notifima' ),
                'description' => __( 'Sent to the site owner (and vendor, if MultiVendorX is active) when a customer subscribes to an out-of-stock product.', 'notifima' ),
                'category'    => 'notifima',
                'group'       => __( 'Subscriptions', 'notifima' ),
                'recipients'  => array( 'admin', 'store' ),
                'subject'     => __( 'A customer has subscribed to a product on {site_title}', 'notifima' ),
                'content'     => '<h2>' . esc_html__( 'Welcome to {site_title}', 'notifima' ) . '</h2><p><a href="{product_url}">{product_name}</a> &mdash; {product_price}</p><p>' . esc_html__( 'Subscribed by {customer_email}.', 'notifima' ) . '</p>',
            ),
            self::SUBSCRIBER_CONFIRMATION => array(
                'title'       => __( 'Subscription confirmation', 'notifima' ),
                'description' => __( 'Sent to a customer confirming their back-in-stock subscription.', 'notifima' ),
                'category'    => 'notifima',
                'group'       => __( 'Subscriptions', 'notifima' ),
                'recipients'  => array( 'customer' ),
                'subject'     => __( 'You have subscribed to a product on {site_title}', 'notifima' ),
                'content'     => '<h2>' . esc_html__( 'Welcome to {site_title}', 'notifima' ) . '</h2><p><a href="{product_url}">{product_name}</a> &mdash; {product_price}</p><p>' . esc_html__( 'We will email {customer_email} when it is back in stock.', 'notifima' ) . '</p>',
            ),
            self::SUBSCRIBER_REPORT       => array(
                'title'       => __( 'Subscriber report', 'notifima' ),
                'description' => __( 'Periodic report of product subscriptions, sent to the site admin.', 'notifima' ),
                'category'    => 'notifima',
                'group'       => __( 'Reports', 'notifima' ),
                'recipients'  => array( 'admin' ),
                'subject'     => __( 'Subscriber report ({start_date} - {end_date})', 'notifima' ),
                'content'     => '<h2>' . esc_html__( 'Subscriber report', 'notifima' ) . '</h2><table border="1" cellpadding="6" cellspacing="0"><thead><tr><th>' . esc_html__( 'Product', 'notifima' ) . '</th><th>' . esc_html__( 'Subscribers', 'notifima' ) . '</th></tr></thead><tbody>{subscriber_rows}</tbody></table><p>' . esc_html__( 'Total: {total_subscribers}', 'notifima' ) . '</p>',
            ),
        );
    }
}
