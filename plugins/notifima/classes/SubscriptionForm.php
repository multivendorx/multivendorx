<?php
/**
 * Subscription form class file.
 *
 * @package Notifima
 */

namespace Notifima;

defined( 'ABSPATH' ) || exit;

/**
 * The "notify me when back in stock" subscription form, built on VuloForm.
 *
 * @class       SubscriptionForm
 * @version     3.2.0
 * @author      MultiVendorX
 */
class SubscriptionForm {

	/**
	 * Option holding the id of the VuloForm form used for the subscription form.
	 */
	const FORM_OPTION = 'notifima_subscription_form_id';

	/**
	 * VuloForm template the form is created from.
	 */
	const TEMPLATE = 'notifima_subscription';

	/**
	 * What the last accepted submission came to, for the response that follows it in the same request.
	 *
	 * @var array|null
	 */
	private static $last_result = null;

	/**
	 * SubscriptionForm constructor.
	 */
	public function __construct() {
		add_filter( 'vuloform_templates', array( $this, 'add_template' ) );
		add_filter( 'vuloform_refuse_submission', array( $this, 'refuse_invalid_request' ), 10, 2 );
		add_action( 'vuloform_submission_created', array( $this, 'subscribe' ), 10, 3 );
		add_filter( 'vuloform_submission_result', array( $this, 'answer' ), 10, 3 );
	}

	/**
	 * Whether VuloForm is available.
	 *
	 * @return bool
	 */
	public static function is_available() {
		return Utill::is_vuloform_installed();
	}

	/**
	 * Adds the Subscription form template to VuloForm's picker.
	 *
	 * @param array $templates VuloForm templates.
	 * @return array
	 */
	public function add_template( $templates ) {
		$settings                      = \VuloForm\Forms\Schema::default_settings();
		$settings['template']          = self::TEMPLATE;
		$settings['submit_label']      = __( 'Notify Me', 'notifima' );
		$settings['store_submissions'] = false;
		$settings['notifications']     = array();

		$templates[ self::TEMPLATE ] = array(
			'title'    => __( 'Back in stock subscription', 'notifima' ),
			'desc'     => __( 'Asks for an email address so Notifima can tell the visitor when a product is back in stock.', 'notifima' ),
			'icon'     => 'mail',
			'category' => __( 'Notifima', 'notifima' ),
			'schema'   => \VuloForm\Forms\Schema::sanitize(
				array(
					'fields'   => array(
						array(
							'type'        => 'email',
							'label'       => __( 'Email', 'notifima' ),
							'key'         => 'email',
							'required'    => true,
							'placeholder' => (string) Notifima()->default_value['email_placeholder_text'],
						),
					),
					'settings' => $settings,
				)
			),
		);

		return $templates;
	}

	/**
	 * The subscription form's id, creating the form from its template the first time.
	 *
	 * @return int 0 when VuloForm is not available or the form could not be created.
	 */
	public static function form_id() {
		if ( ! self::is_available() ) {
			return 0;
		}

		$form_id = (int) get_option( self::FORM_OPTION, 0 );

		if ( $form_id && vuloform_get_form( $form_id ) ) {
			return $form_id;
		}

		$templates = \VuloForm\Forms\Templates::all();

		if ( ! isset( $templates[ self::TEMPLATE ] ) ) {
			return 0;
		}

		$form_id = (int) VuloForm()->forms->create(
			$templates[ self::TEMPLATE ]['title'],
			$templates[ self::TEMPLATE ]['schema'],
			'published'
		);

		if ( $form_id ) {
			update_option( self::FORM_OPTION, $form_id );
		}

		return $form_id;
	}

	/**
	 * The form's HTML for one product, ready for a product page, the shortcode or the block.
	 *
	 * @param \WC_Product         $product       Product the visitor wants to hear about.
	 * @param int[]               $variation_ids Out-of-stock variations of a variable product, empty for others.
	 * @param string              $user_email    Logged-in visitor's email, '' for a guest.
	 * @param array<int, string>  $interest      "N people are waiting" line by product or variation id.
	 * @param string              $lead_time     Expected restock text, '' for none.
	 * @return string
	 */
	public static function render( $product, array $variation_ids = array(), $user_email = '', array $interest = array(), $lead_time = '' ) {
		if ( ! self::is_available() ) {
			return self::activation_notice();
		}

		$form_id = self::form_id();

		if ( ! $form_id ) {
			return '';
		}

		$html = vuloform_render( $form_id );

		if ( '' === $html ) {
			return '';
		}

		$hidden = sprintf(
			'<input type="hidden" name="notifima_context" value="%1$s"><input type="hidden" name="notifima_variation_id" value="0"><input type="hidden" name="notifima_product_title" value="%2$s">',
			esc_attr( self::context_token( $product->get_id(), get_current_user_id() ) ),
			esc_attr( $product->get_title() )
		);

		$html = preg_replace( '#</form>#', $hidden . '</form>', $html, 1 );
		$text = '';

		if ( '' !== $lead_time ) {
			$text .= '<p class="notifima-lead-time">' . esc_html( $lead_time ) . '</p>';
		}

		if ( $interest ) {
			$text .= '<p class="notifima-interest"></p>';
		}

		$display_type = Notifima()->setting->get_setting( 'display_subscription_form_as', 'inline' );
		$content      = $text . $html;

		if ( 'popup' === $display_type ) {
			$content = sprintf(
				'<button type="button" class="notifima-open-popup woocommerce-button button wp-element-button wp-block-button__link">%1$s</button>
				<div class="notifima-popup-overlay">
					<div class="notifima-popup">
						<button type="button" class="notifima-popup-close" aria-label="%2$s">&times;</button>
						%3$s
					</div>
				</div>',
				esc_html( Notifima()->default_value['subscribe_button_text'] ),
				esc_attr__( 'Close', 'notifima' ),
				$content
			);
		}

		return sprintf(
			'<div class="notifima-subscribe-form" data-product-id="%1$d" data-variations="%2$s" data-interest="%3$s" data-user-email="%4$s" data-display="%5$s">%6$s</div>',
			(int) $product->get_id(),
			esc_attr( wp_json_encode( array_values( array_map( 'intval', $variation_ids ) ) ) ),
			esc_attr( wp_json_encode( (object) $interest ) ),
			esc_attr( $user_email ),
			esc_attr( $display_type ),
			$content
		);
	}

	/**
	 * What a visitor sees in place of the form while VuloForm is off.
	 *
	 * @return string
	 */
	public static function activation_notice() {
		if ( empty( true === Utill::current_user_has_capability( 'activate_plugins' ) ) ) {
			return '';
		}

		return sprintf(
			'<p class="notifima-activate-vuloform">%1$s <a href="%2$s">%3$s</a></p>',
			esc_html__( 'The back in stock form is built with VuloForm.', 'notifima' ),
			esc_url( admin_url( 'plugins.php' ) ),
			esc_html__( 'Activate VuloForm to show it.', 'notifima' )
		);
	}

	/**
	 * Whether a VuloForm form is the subscription form.
	 *
	 * @param array $form VuloForm form.
	 * @return bool
	 */
	private static function is_subscription_form( $form ) {
		return (int) ( $form['id'] ?? 0 ) === (int) get_option( self::FORM_OPTION, 0 );
	}

	/**
	 * Reads what the product page sent along with the form.
	 *
	 * @return array|null Null when it is missing or altered.
	 */
	private static function request_context() {
		// phpcs:disable WordPress.Security.NonceVerification.Missing -- a public form; the signed context token below is the proof.
		$token = sanitize_text_field( wp_unslash( $_POST['notifima_context'] ?? '' ) );
		$parts = explode( '.', $token );

		if ( 4 !== count( $parts ) || (int) $parts[2] < time() ) {
			return null;
		}

		if ( ! hash_equals( wp_hash( 'notifima_context|' . (int) $parts[0] . '|' . (int) $parts[1] . '|' . (int) $parts[2] ), $parts[3] ) ) {
			return null;
		}

		$product_id   = (int) $parts[0];
		$variation_id = absint( wp_unslash( $_POST['notifima_variation_id'] ?? 0 ) );
		$title        = sanitize_text_field( wp_unslash( $_POST['notifima_product_title'] ?? '' ) );
		// phpcs:enable WordPress.Security.NonceVerification.Missing

		$product = wc_get_product( $product_id );

		if ( ! $product ) {
			return null;
		}

		if ( $variation_id && ! in_array( $variation_id, array_map( 'intval', $product->get_children() ), true ) ) {
			$variation_id = 0;
		}

		return array(
			'product_id'   => $product_id,
			'variation_id' => $variation_id,
			'user_id'      => (int) $parts[1],
			'title'        => $title,
		);
	}

	/**
	 * A signed token proving which product a form was shown for and who was looking.
	 *
	 * @param int $product_id Product id.
	 * @param int $user_id    Visitor's user id, 0 for a guest.
	 * @return string
	 */
	private static function context_token( $product_id, $user_id ) {
		$expires = time() + DAY_IN_SECONDS;

		return $product_id . '.' . $user_id . '.' . $expires . '.' . wp_hash( 'notifima_context|' . $product_id . '|' . $user_id . '|' . $expires );
	}

	/**
	 * Refuses a submission with no valid product, or that the site does not allow guests to make.
	 *
	 * @param string $message Current refusal, '' to accept.
	 * @param array  $form    VuloForm form.
	 * @return string
	 */
	public function refuse_invalid_request( $message, $form ) {
		if ( '' !== $message || ! self::is_subscription_form( $form ) ) {
			return $message;
		}

		$context = self::request_context();

		if ( ! $context ) {
			return __( 'Invalid product.', 'notifima' );
		}

		if ( 'logged_in' === Notifima()->setting->get_setting( 'is_guest_subscriptions_enable', '' ) && ! $context['user_id'] ) {
			return __( 'Please log in to be notified when this product is back in stock.', 'notifima' );
		}

		return '';
	}

	/**
	 * Subscribes the visitor from an accepted submission.
	 *
	 * @param int   $submission_id Submission id.
	 * @param array $values        Field key => value.
	 * @param array $form          VuloForm form.
	 * @return void
	 */
	public function subscribe( $submission_id, $values, $form ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found
		if ( ! self::is_subscription_form( $form ) ) {
			return;
		}

		$context = self::request_context();

		if ( ! $context ) {
			return;
		}

		self::$last_result = Subscriber::subscribe_customer(
			sanitize_email( (string) ( $values['email'] ?? '' ) ),
			$context['product_id'],
			$context['title'],
			$context['variation_id'],
			sanitize_text_field( (string) ( $values['phone'] ?? '' ) )
		);
	}

	/**
	 * Answers with Notifima's own messages instead of the form's generic confirmation.
	 *
	 * @param array $result Result of the submission.
	 * @param array $values Field key => value.
	 * @param array $form   VuloForm form.
	 * @return array
	 */
	public function answer( $result, $values, $form ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found
		if ( ! self::is_subscription_form( $form ) || null === self::$last_result ) {
			return $result;
		}

		$outcome           = self::$last_result;
		self::$last_result = null;

		$already_subscribed = ! empty( $outcome['already_subscribed'] );

		$result['success'] = ! empty( $outcome['status'] ) || $already_subscribed;
		$result['message'] = wp_kses_post( (string) ( $outcome['message'] ?? '' ) );

		if ( $already_subscribed ) {
			$result['message'] .= self::unsubscribe_button( $outcome );
		}

		return $result;
	}

	/**
	 * The unsubscribe button shown to a visitor who is already subscribed.
	 *
	 * @param array $outcome Result from Subscriber::subscribe_customer().
	 * @return string
	 */
	private static function unsubscribe_button( $outcome ) {
		return sprintf(
			'<button type="button" class="notifima-unsubscribe woocommerce-button button wp-element-button wp-block-button__link" data-customer-email="%1$s" data-product-id="%2$d" data-variation-id="%3$d">%4$s</button>',
			esc_attr( $outcome['customer_email'] ?? '' ),
			(int) ( $outcome['product_id'] ?? 0 ),
			(int) ( $outcome['variation_id'] ?? 0 ),
			esc_html( $outcome['unsubscribe_button']['text'] ?? __( 'Unsubscribe', 'notifima' ) )
		);
	}
}
