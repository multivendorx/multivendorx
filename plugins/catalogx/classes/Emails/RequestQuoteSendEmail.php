<?php
/**
 * Request Quote Send Email class file
 * An email will be sent to customer
 *
 * @package CatalogX
 */

namespace CatalogX\Emails;

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'RequestQuoteSendEmail' ) ) {

	/**
	 * Email to Admin for customer quote.
	 * An email will be sent to the admin when a customer sends a quote.
	 *
	 * @class RequestQuoteSendEmail class
	 * @version 6.0.0
	 * @author MultiVendorX
	 * @extends \WC_Email
	 */
    class RequestQuoteSendEmail extends \WC_Email {
		/**
		 * List of products included in the quote.
		 *
		 * @var array
		 */
        public $products;

		/**
		 * WooCommerce Email object.
		 *
		 * @var mixed
		 */
        public $object;

		/**
		 * Data submitted by the customer during quote request.
		 *
		 * @var array
		 */
        public $customer_data;

		/**
		 * Display name of the admin user.
		 *
		 * @var string
		 */
        public $admin;

        /**
         * Constructor method, used to return object of the class to WC
         *
         * @since 6.0.0
         */
        public function __construct() {
            $this->id          = 'RequestQuoteSend';
            $this->title       = __( 'Email to request a quote', 'catalogx' );
            $this->description = __( 'This email is sent when a user clicks on "Request a quote" button', 'catalogx' );

            $this->template_html  = 'emails/request-quote.php';
            $this->template_plain = 'emails/plain/request-quote.php';
            $this->template_base  = CatalogX()->plugin_path . 'templates/';

            // Call parent constuctor.
            parent::__construct();
        }

		/**
		 * Trigger the email when a customer requests a quote.
		 *
		 * @access public
		 * @param array $products      List of products included in the quote request.
		 * @param array $customer_data Data submitted by the customer.
		 * @return void
		 */
		public function trigger( $products, $customer_data ) {
			$additional_email = CatalogX()->setting->get_setting( 'additional_alert_email' );

			$this->recipient     = $additional_email;
			$this->products      = $products;
			$this->customer_data = $customer_data;
			$this->find[]        = '{customer_name}';
			$this->replace[]     = $customer_data['name'];

			$admin_email = CatalogX()->admin_email;
			// Get the user by email.
			$admin_user = get_user_by( 'email', $admin_email );
			if ( $admin_user ) {
				// Return the display name of the admin user.
				$this->admin = $admin_user->display_name;
			}

			if ( ! $this->is_enabled() || ! $this->get_recipient() ) {
				return;
			}

			$this->send( $this->get_recipient(), $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );
		}

		/**
		 * Get email subject.
		 *
		 * @access  public
		 * @return string
		 */
		public function get_default_subject() {
			return empty( $this->customer_data ) ? __( 'New Quote Request from Guest', 'catalogx' ) : apply_filters( 'catalogx_request_send_email_subject', __( 'New Quote Request from {customer_name}', 'catalogx' ), $this->object );
		}

		/**
		 * Get email heading.
		 *
		 * @access  public
		 * @return string
		 */
		public function get_default_heading() {
			return apply_filters( 'catalogx_request_send_email_heading', __( 'New Quote Submitted by {customer_name} - Please Review', 'catalogx' ), $this->object );
		}

		/**
		 * Get_content_html function.
		 *
		 * @access public
		 * @return string
		 */
		public function get_content_html() {
			ob_start();
			CatalogX()->util->get_template( $this->template_html, $this->get_template_args() );
			return ob_get_clean();
		}

		/**
		 * Get_content_plain function.
		 *
		 * @access public
		 * @return string
		 */
		public function get_content_plain() {
			ob_start();
			CatalogX()->util->get_template( $this->template_plain, $this->get_template_args() );
			return ob_get_clean();
		}

		/**
		 * Get template arguments.
		 */
		protected function get_template_args() {
			return array(
				'email_heading'  => $this->get_heading(),
				'products'       => $this->products,
				'customer_email' => $this->recipient,
				'customer_data'  => $this->customer_data,
				'admin'          => $this->admin,
				'sent_to_admin'  => false,
				'plain_text'     => true,
				'email'          => $this,
			);
		}
	}
}
