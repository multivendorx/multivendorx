<?php
/**
 * AdminNewSubscriberEmail class file.
 *
 * @package Notifima
 */

namespace Notifima\Emails;

defined( 'ABSPATH' ) || exit; // Exit if accessed directly.

if ( ! class_exists( 'AdminNewSubscriberEmail' ) ) :

    /**
     * Email to Admin for notifima.
     *
     * An email will be sent to the admin when customer subscribe an out of stock product.
     *
     * @version     PRODUCT_VERSION
     * @author      MultivendorX
     * @extends     \WC_Email
     */
    class AdminNewSubscriberEmail extends \WC_Email {

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
         * Admin email Constructor.
         *
         * @access public
         * @return void
         */
        public function __construct() {
            $this->id             = 'notifima_subscriber_confimation_admin';
            $this->title          = __( 'Alert admin', 'notifima' );
            $this->description    = __( 'Admin will get an alert when customer subscribe any out of stock product', 'notifima' );
            $this->template_html  = 'emails/html/AdminNewSubscriberEmail.php';
            $this->template_plain = 'emails/plain/AdminNewSubscriberEmail.php';
            $this->template_base  = Notifima()->plugin_path . 'templates/';

            // Call parent constuctor.
            parent::__construct();
        }

        /**
         * Trigger function.
         *
         * @param string     $recipient      The recipient's email address.
         * @param WC_Product $product        The WooCommerce product object.
         * @param string     $customer_email The customer's email address.
         * @return void
         */
        public function trigger( $recipient, $product, $customer_email ) {

            $this->recipient      = $recipient;
            $this->product        = $product;
            $this->customer_email = $customer_email;

            if ( ! $this->is_enabled() || ! $this->get_recipient() ) {
                return;
            }

            $this->send( $this->get_recipient(), $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );
        }

        /**
         * Get email subject.
         *
         * @return string
         */
        public function get_default_subject() {
            return apply_filters( 'notifima_customer_subscription_admin_email_subject', __( 'A Customer has subscribed to a product on {site_title} ', 'notifima' ), $this->object );
        }

        /**
         * Get email heading.
         *
         * @return string
         */
        public function get_default_heading() {
            return apply_filters( 'notifima_customer_subscription_admin_email_heading', __( 'Welcome to {site_title} ', 'notifima' ), $this->object );
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
					'sent_to_admin'  => true,
					'plain_text'     => false,
					'email'          => $this,
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
					'sent_to_admin'  => true,
					'plain_text'     => false,
					'email'          => $this,
				)
            );

            return ob_get_clean();
        }
    }
endif;
