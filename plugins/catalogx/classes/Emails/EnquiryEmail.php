<?php
/**
 * Enquiry Email class file
 *
 * @package CatalogX
 */

namespace CatalogX\Emails;

use CatalogX\Utill;

/**
 * Email to Admin for customer enquiry.
 * An email will be sent to the admin when a customer enquires about a product.
 *
 * @class EnquiryEmail class
 * @version 6.0.0
 * @author MultiVendorX
 * @extends \WC_Email
 */
class EnquiryEmail extends \WC_Email {

    /**
     * The product ID(s) related to the enquiry.
     *
     * @var int[]|int
     */
    public $product_id;

    /**
     * Email attachments, if any.
     *
     * @var array
     */
    public $attachments;

    /**
     * Enquiry data sent by the customer.
     *
     * @var array
     */
    public $enquiry_data;

    /**
     * Customer's name.
     *
     * @var string
     */
    public $cust_name;

    /**
     * Customer's email address.
     *
     * @var string
     */
    public $cust_email;

    /**
     * Email arguments.
     *
     * @var string
     */
    public $args;

    /**
     * Constructor
     */
    public function __construct() {
        $this->id          = 'catalogx_enquiry_sent';
        $this->title       = __( 'Enquiry sent', 'catalogx' );
        $this->description = __( 'Admin will get an email when a customer enquires about a product.', 'catalogx' );
        // Default values.
        $defaults   = array(
            'email_setting'   => '',
            'template_map'    => array(
                'template1' => 'emails/default-enquiry-template.php',
                'template2' => 'emails/enquiry-template1.php',
                'template3' => 'emails/enquiry-template2.php',
                'template4' => 'emails/enquiry-template3.php',
                'template5' => 'emails/enquiry-template4.php',
                'template6' => 'emails/enquiry-template5.php',
                'template7' => 'emails/enquiry-template6.php',
            ),
            'base_path'       => CatalogX()->plugin_path . 'templates/',
            'plain_template'  => 'emails/plain/enquiry-email.php',
            'default_html'    => 'emails/enquiry-email.php',
            'template_loader' => CatalogX()->util,
        );
        $this->args = apply_filters( 'catalogx_enquiry_email_template', $defaults );
        // Set the appropriate template paths.
        $this->template_loader = $this->args['template_loader'];
        $this->template_html   = $this->args['template_map'][ $this->args['email_setting'] ] ?? $this->args['default_html'];
        $this->template_plain  = $this->args['plain_template'];
        $this->template_base   = $this->args['base_path'];
        // Call parent constructor.
        parent::__construct();
    }

    /**
     * Trigger the email.
     *
     * @param string $recipient    The primary recipient email address.
     * @param array  $enquiry_data Associative array containing enquiry details.
     * @param array  $attachments  List of file paths to attach to the email.
     *
     * @return bool Whether the email was sent successfully.
     */
    public function trigger( $recipient, $enquiry_data, $attachments ) {
        $this->recipient      = $recipient;
        $this->attachments    = $attachments;
        $this->product_id     = $enquiry_data['product_id'];
        $this->enquiry_data   = $enquiry_data;
        $this->cust_name      = $enquiry_data['user_name'];
        $this->cust_email     = $enquiry_data['user_email'];
        $this->customer_email = $this->cust_email;

        if ( ! $this->is_enabled() || ! $this->get_recipient() ) {
            return false;
        }

        $this->add_vendor_emails();

        $product       = wc_get_product( key( $this->product_id ) );
        $this->find    = array( '{PRODUCT_NAME}', '{USER_NAME}' );
        $this->replace = array(
            is_array( $this->product_id ) && count( $this->product_id ) > 1 ? 'MULTIPLE PRODUCTS' : $product->get_title(),
            $this->cust_name,
        );

        return $this->send( $this->get_recipient(), $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );
    }

    /**
     * Add vendor emails to the recipient list.
     */
    protected function add_vendor_emails() {
        if ( ! Utill::is_active_plugin( 'multivendorx' ) ) {
            return;
        }

        foreach ( $this->product_id as $product_id => $quantity ) {
            $vendor = function_exists( 'get_mvx_product_vendors' ) ? get_mvx_product_vendors( $product_id ) : null;

            if ( $vendor ) {
                $vendor_email     = sanitize_email( $vendor->user_data->user_email );
                $this->recipient .= ', ' . $vendor_email;

                if ( strpos( $this->recipient, $vendor_email ) !== false ) {
                    $email_setting       = get_user_meta( $vendor->id, 'vendor_enquiry_settings', true )['selected_email_tpl'] ?? '';
                    $this->template_html = $this->args['template_map'][ $email_setting ] ?? $this->args['default_html'];
                }
            }
        }
    }

    /**
     * Get email subject.
     */
    public function get_default_subject() {
        return empty( $this->product_id ) ? __( 'Product Enquiry for Dummy Product by Guest', 'catalogx' ) : apply_filters( 'catalogx_enquiry_admin_email_subject', __( 'Product Enquiry for {PRODUCT_NAME} by {USER_NAME}', 'catalogx' ), $this->object );
    }

    /**
     * Get email heading.
     */
    public function get_default_heading() {
        return apply_filters( 'catalogx_enquiry_admin_email_heading', __( 'Enquiry for {PRODUCT_NAME}', 'catalogx' ), $this->object );
    }

    /**
     * Get email attachments.
     */
    public function get_attachments() {
        return apply_filters( 'catalogx_enquiry_admin_email_attachments', $this->attachments, $this->id, $this->object );
    }

    /**
     * Get email headers.
     */
    public function get_headers() {
        $header  = 'Content-Type: ' . $this->get_content_type() . "\r\n";
        $header .= 'Reply-to: ' . $this->cust_name . ' <' . $this->cust_email . ">\r\n";
        return apply_filters( 'catalogx_enquiry_admin_email_headers', $header, $this->id, $this->object );
    }

    /**
     * Get HTML content.
     */
    public function get_content_html() {
        ob_start();
        $this->template_loader->get_template( $this->template_html, $this->get_template_args() );
        return ob_get_clean();
    }

    /**
     * Get plain content.
     */
    public function get_content_plain() {
        ob_start();
        $this->template_loader->get_template( $this->template_plain, $this->get_template_args() );
        return ob_get_clean();
    }

    /**
     * Get template arguments.
     */
    protected function get_template_args() {
        return array(
            'email_heading'  => $this->get_heading(),
            'product_id'     => $this->product_id,
            'enquiry_data'   => $this->enquiry_data,
            'customer_email' => $this->customer_email,
            'sent_to_admin'  => true,
            'plain_text'     => false,
        );
    }
}
