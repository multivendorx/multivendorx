<?php
/**
 * Subscription form class file.
 *
 * @package Notifima
 */

namespace Notifima;

defined( 'ABSPATH' ) || exit;

/**
 * The "notify me when back in stock" form, built on VuloForm. The form, its fields and its look are
 * VuloForm's; this class only offers the starter template, shows the form on product pages and turns an
 * accepted submission into a Notifima subscriber.
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
		return function_exists( 'vuloform_render' ) && function_exists( 'vuloform_get_form' ) && function_exists( 'VuloForm' );
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
		// Notifima keeps its own subscriber list, so nothing is stored or emailed by VuloForm.
		$settings['store_submissions'] = false;
		$settings['notifications']     = array();

		$templates[ self::TEMPLATE ] = array(
			'title'    => __( 'Back in stock subscription', 'notifima' ),
			'desc'     => __( 'Asks for an email address so Notifima can tell the visitor when a product is back in stock.', 'notifima' ),
			'icon'     => 'mail',
			'category' => __( 'Plugin forms', 'notifima' ),
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

		// The form posts without cookies, so what it is about travels with it as a signed token.
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

		return sprintf(
			'<div class="notifima-subscribe-form" data-product-id="%1$d" data-variations="%2$s" data-interest="%3$s" data-user-email="%4$s" data-display="%5$s">%6$s%7$s</div>',
			(int) $product->get_id(),
			esc_attr( wp_json_encode( array_values( array_map( 'intval', $variation_ids ) ) ) ),
			esc_attr( wp_json_encode( (object) $interest ) ),
			esc_attr( $user_email ),
			esc_attr( Notifima()->setting->get_setting( 'display_subscription_form_as', 'inline' ) ),
			$text, // Escaped above.
			$html // Built and escaped by VuloForm.
		);
	}

	/**
	 * What a visitor sees in place of the form while VuloForm is off: only the site's admins get the
	 * hint, since a visitor can do nothing about it.
	 *
	 * @return string
	 */
	public static function activation_notice() {
		if ( ! current_user_can( 'activate_plugins' ) ) {
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
	 * @return array{product_id: int, variation_id: int, user_id: int, title: string}|null Null when it is missing or altered.
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

		// A variation counts only if it really belongs to the product.
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
	 * A signed, day-long proof of which product a form was shown for and who was looking.
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
	 * Refuses a submission that has no valid product behind it, or that the site does not allow guests to make.
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
	 * Answers with Notifima's own messages (Settings > Customer Experience) instead of the form's
	 * generic confirmation, so a repeat sign-up or a banned address is told what happened.
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

		$result['success'] = ! empty( $outcome['status'] );
		$result['message'] = wp_kses_post( (string) ( $outcome['message'] ?? '' ) );

		return $result;
	}
}
