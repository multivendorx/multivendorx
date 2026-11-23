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
 */
class Templates {

    const ENQUIRY       = 'catalogx/enquiry';
    const ENQUIRY_REPORT = 'catalogx/enquiry-report';
    const QUOTE_REQUEST  = 'catalogx/quote-request';

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
        $categories['catalogx'] = __( 'CatalogX', 'catalogx' );

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
            self::ENQUIRY        => array(
                'title'       => __( 'Enquiry notification', 'catalogx' ),
                'description' => __( 'Sent to the site owner (and vendor, if MultiVendorX is active) when a customer sends a product enquiry.', 'catalogx' ),
                'category'    => 'catalogx',
                'group'       => __( 'Enquiry', 'catalogx' ),
                'recipients'  => array( 'admin', 'store' ),
                'subject'     => __( 'Product Enquiry for {product_name} by {user_name}', 'catalogx' ),
                'content'     => '<h2>' . esc_html__( 'Enquiry for {product_name}', 'catalogx' ) . '</h2><p>' . esc_html__( 'From: {user_name} ({user_email})', 'catalogx' ) . '</p><p>{enquiry_details}</p>',
            ),
            self::ENQUIRY_REPORT => array(
                'title'       => __( 'Enquiry report', 'catalogx' ),
                'description' => __( 'Periodic report of product enquiries, sent to the site admin.', 'catalogx' ),
                'category'    => 'catalogx',
                'group'       => __( 'Enquiry', 'catalogx' ),
                'recipients'  => array( 'admin' ),
                'subject'     => __( 'Enquiry Report ({start_date} - {end_date})', 'catalogx' ),
                'content'     => '<h2>' . esc_html__( 'Enquiry report', 'catalogx' ) . '</h2><table border="1" cellpadding="6" cellspacing="0"><thead><tr><th>' . esc_html__( 'Product', 'catalogx' ) . '</th><th>' . esc_html__( 'Enquiries', 'catalogx' ) . '</th></tr></thead><tbody>{enquiry_rows}</tbody></table>',
            ),
            self::QUOTE_REQUEST  => array(
                'title'       => __( 'New quote request', 'catalogx' ),
                'description' => __( 'Sent to the site admin when a customer submits a quote request.', 'catalogx' ),
                'category'    => 'catalogx',
                'group'       => __( 'Quote', 'catalogx' ),
                'recipients'  => array( 'admin' ),
                'subject'     => __( 'New Quote Request from {customer_name}', 'catalogx' ),
                'content'     => '<h2>' . esc_html__( 'New quote submitted by {customer_name} - please review', 'catalogx' ) . '</h2><table border="1" cellpadding="6" cellspacing="0"><thead><tr><th>' . esc_html__( 'Product', 'catalogx' ) . '</th><th>' . esc_html__( 'Quantity', 'catalogx' ) . '</th></tr></thead><tbody>{quote_rows}</tbody></table><p>' . esc_html__( 'Email: {customer_email}', 'catalogx' ) . '</p><p>' . esc_html__( 'Phone: {customer_phone}', 'catalogx' ) . '</p><p>{customer_details}</p>',
            ),
        );
    }
}
