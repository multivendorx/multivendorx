<?php
/**
 * ProductBackInStockEmail class file.
 *
 * @package Notifima
 */

namespace Notifima\Emails;

defined( 'ABSPATH' ) || exit; // Exit if accessed directly.

if ( ! class_exists( 'ProductBackInStockEmail' ) ) :

    /**
     * Email for Notifima.
     *
     * An email will be sent to the customer when their subscribed product is available.
     *
     * @version     3.0.0
     * @author      MultiVendorX
     * @extends     \WC_Email
     */
    class ProductBackInStockEmail extends \WC_Email {

        /**
         * The product associated with the subscription.
         *
         * @var WC_Product|int|null
         */
        public $product;

        /**
         * The customer's email address.
         *
         * @var string
         */
        public $customer_email;

        /**
         * The email recipient. Can be overridden manually.
         *
         * @var string
         */
        public $recipient = '';

        /**
         * Constructor
         *
         * @access public
         * @return void
         */
        public function __construct() {

            $this->id             = 'notifima_product_back_stock';
            $this->title          = __( 'Alert Subscriber', 'notifima' );
            $this->description    = __( 'Alert customer when their subscribed product becomes in stock', 'notifima' );
            $this->template_html  = 'emails/html/ProductBackInStockEmail.php';
            $this->template_plain = 'emails/plain/ProductBackInStockEmail.php';
            $this->template_base  = Notifima()->plugin_path . 'templates/';

            // Call parent constuctor.
            parent::__construct();
        }

        /**
         * Trigger function.
         *
         * @param string     $recipient      The recipient's email address.
         * @param WC_Product $product        The WooCommerce product object.
         * @return void
         */
        public function trigger( $recipient, $product ) {

            $this->customer_email = $recipient;
            $this->recipient      = $recipient;
            $this->product        = $product;

            if ( class_exists( 'SitePress' ) && is_a( $product, 'WC_Product' ) ) {
                $product_language = apply_filters( 'wpml_post_language_details', null, $product->get_id() )['language_code'] ?? '';
                if ( $product_language ) {
                    do_action( 'wpml_switch_language', $product_language );
                    switch_to_locale($product_language);
                }
            }

            if ( apply_filters( 'product_backin_stock_send_admin', false ) ) {
                $this->recipient .= ', ' . get_option( 'admin_email' );
            }

            if ( ! $this->is_enabled() || ! $this->get_recipient() ) {
                return;
            }

            $this->send( $this->get_recipient(), $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );
            
            restore_previous_locale();
        }

        /**
         * Get email subject.
         *
         * @since  1.4.7
         * @return string
         */
        public function get_default_subject() {
            return apply_filters( 'notifima_subscribe_product_back_stock_email_subject', __( 'Your Subscribed product on {site_title} is available now', 'notifima' ), $this->object );
        }

        /**
         * Get email heading.
         *
         * @since  1.4.7
         * @return string
         */
        public function get_default_heading() {
            return apply_filters( 'notifima_subscribe_product_back_stock_email_heading', __( 'Welcome to {site_title} ', 'notifima' ), $this->object );
        }

        /**
         * Get content html function.
         *
         * @access public
         * @return string
         */
        public function get_content_html() {
            ob_start();
            Notifima()->util->get_template(
                $this->template_html,
                array(
					'email_heading'  => $this->get_heading(),
					'product'        => $this->product,
					'customer_email' => $this->customer_email,
					'sent_to_admin'  => false,
					'plain_text'     => true,
				)
            );

            return ob_get_clean();
        }

        /**
         * Get content plain function.
         *
         * @access public
         * @return string
         */
        public function get_content_plain() {
            ob_start();
            Notifima()->util->get_template(
                $this->template_plain,
                array(
					'email_heading'  => $this->get_heading(),
					'product'        => $this->product,
					'customer_email' => $this->customer_email,
					'sent_to_admin'  => false,
					'plain_text'     => true,
				)
            );

            return ob_get_clean();
        }
    }
endif;
