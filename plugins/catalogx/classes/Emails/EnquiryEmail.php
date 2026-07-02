<?php

namespace CatalogX\Emails;

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

    public $product_id;
    public $attachments;
    public $enquiry_data;
    public $cust_name;
    public $cust_email;

    /**
     * Constructor
     */
    public function __construct() {		
        $this->id          = 'catalogx_enquiry_sent';
        $this->title       = __( 'Enquiry sent', 'catalogx' );
        $this->description = __( 'Admin will get an email when a customer enquires about a product.', 'catalogx' );

        $base_template_path = apply_filters('catalogx_email_template_base_path', CatalogX()->plugin_path . 'templates/' );
        
        // Set the appropriate template paths
        $this->template_html  = 'emails/enquiry-email.php';
        $this->template_plain = 'emails/plain/enquiry-email.php';
        $this->template_base  = $base_template_path;

        // Call parent constructor
        parent::__construct();
    }    

    /**
     * Trigger the email.
     */
    public function trigger($recipient, $enquiry_data, $attachments) {
        $this->recipient    = $recipient;
        $this->attachments  = $attachments;
        $this->product_id   = $enquiry_data['product_id'];
        $this->enquiry_data = $enquiry_data;
        $this->cust_name    = $enquiry_data['user_name'];
        $this->cust_email   = $enquiry_data['user_email'];
        $this->customer_email = $this->cust_email;

        if (!$this->is_enabled() || !$this->get_recipient()) {
            return false;
        }

        // $this->add_store_emails();

        $product = wc_get_product(key($this->product_id));
        $this->find = ['{PRODUCT_NAME}', '{USER_NAME}'];
        $this->replace = [
            is_array($this->product_id) && count($this->product_id) > 1 ? 'MULTIPLE PRODUCTS' : $product->get_title(),
            $this->cust_name
        ];

        return $this->send($this->get_recipient(), $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments());
    }

    /**
     * Add vendor emails to the recipient list.
     */
    // protected function add_store_emails() {
    //     if (!Utill::is_active_plugin('multivendorx')) return;

    //     foreach ( $this->product_id as $product_id => $quantity ) {
    //         $store_id = get_post_meta( $product_id, 'multivendorx_store_id', true );
    //         $store = new MultiVendorX\Store\Store( $store_id );
            
    //         if ( $store ) {
    //             $store_email     = sanitize_email( $store->get('email') );
    //             $this->recipient .= ', ' . $store_email;

    //             if ( strpos( $this->recipient, $store_email ) !== false ) {
    //                 $email_setting       = get_user_meta( $store->id, 'vendor_enquiry_settings', true )['selected_email_tpl'] ?? '';
    //                 $this->template_html = $this->args['template_map'][ $email_setting ] ?? $this->args['default_html'];
    //             }
    //         }
    //     }
    // }

    /**
     * Get email subject.
     */
    public function get_default_subject() {
        return apply_filters('catalogx_enquiry_admin_email_subject', __('Product Enquiry for {PRODUCT_NAME} by {USER_NAME}', 'catalogx'), $this->object);
    }

    /**
     * Get email heading.
     */
    public function get_default_heading() {
        return apply_filters('catalogx_enquiry_admin_email_heading', __('Enquiry for {PRODUCT_NAME}', 'catalogx'), $this->object);
    }

    /**
     * Get email attachments.
     */
    public function get_attachments() {
        return apply_filters('catalogx_enquiry_admin_email_attachments', $this->attachments, $this->id, $this->object);
    }

    /**
     * Get email headers.
     */
    public function get_headers() {
        $header = "Content-Type: " . $this->get_content_type() . "\r\n";
        $header .= 'Reply-to: ' . $this->cust_name . ' <' . $this->cust_email . ">\r\n";
        return apply_filters('catalogx_enquiry_admin_email_headers', $header, $this->id, $this->object);
    }

    /**
     * Get HTML content.
     */
    public function get_content_html() {
        ob_start();

        $template_loader = apply_filters( 'catalogx_template_loader', array( 'object' => CatalogX()->util, 'method' => 'get_template'), $this->template_html, $this->get_template_args() );
        call_user_func( array( $template_loader['object'], $template_loader['method'] ), $this->template_html, $this->get_template_args());
        return ob_get_clean();
    }

    /**
     * Get plain content.
     */
    public function get_content_plain() {
        ob_start();
        CatalogX()->util->get_template($this->template_plain, $this->get_template_args());
        return ob_get_clean();
    }

    /**
     * Get template arguments.
     */
    protected function get_template_args() {
        return [
            'email_heading'   => $this->get_heading(),
            'product_id'      => $this->product_id,
            'enquiry_data'    => $this->enquiry_data,
            'customer_email'  => $this->customer_email,
            'sent_to_admin'   => true,
            'plain_text'      => false
        ];
    }
}