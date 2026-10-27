<?php
/**
 * Store registration class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Store;

use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Store registration, built on VuloForm. The form, its fields and its look are VuloForm's; this
 * class only shows the form on the registration page and turns an accepted submission into a store.
 *
 * @class       Registration
 * @version     5.0.0
 * @author      MultiVendorX
 */
class Registration {

	/**
	 * Option holding the id of the VuloForm form used for store registration.
	 */
	const FORM_OPTION = 'multivendorx_store_registration_form_id';

	/**
	 * VuloForm template the form is created from.
	 */
	const TEMPLATE = 'store_registration';

	/**
	 * Registration constructor.
	 */
	public function __construct() {
		add_action( 'vuloform_submission_created', array( $this, 'register_store' ), 10, 3 );
		// VuloForm may load after this plugin, so the old form is carried over once it is available.
		add_action( 'vuloform_loaded', array( __CLASS__, 'migrate_legacy_form' ) );
		add_filter( 'vuloform_form_problems', array( $this, 'require_store_name' ), 10, 2 );
		// The template and its field library belong to this plugin: VuloForm only offers them (and
		// shows forms made from them) while MultiVendorX is active.
		add_filter( 'vuloform_templates', array( $this, 'add_template' ) );
		add_filter( 'vuloform_template_palettes', array( $this, 'add_palette' ) );
		// There is exactly one registration form. It is fixed (no delete), and is put back if it is
		// ever removed by other means.
		add_filter( 'vuloform_protected_forms', array( $this, 'protect_form' ) );
		add_action( 'vuloform_form_deleted', array( $this, 'restore_form' ) );
	}

	/**
	 * Keeps the registration form out of reach of the delete actions.
	 *
	 * @param int[] $ids Protected form ids.
	 * @return int[]
	 */
	public function protect_form( $ids ) {
		$form_id = (int) get_option( self::FORM_OPTION, 0 );

		if ( $form_id ) {
			$ids[] = $form_id;
		}

		return $ids;
	}

	/**
	 * Puts the registration form back, from the template if it is deleted by any other means.
	 *
	 * @param int $deleted_id Deleted form id.
	 * @return void
	 */
	public function restore_form( $deleted_id ) {
		if ( (int) $deleted_id !== (int) get_option( self::FORM_OPTION, 0 ) ) {
			return;
		}

		delete_option( self::FORM_OPTION );

		if ( self::is_available() ) {
			self::create_from_template();
		}
	}

	/**
	 * Adds the Store registration template to VuloForm's picker.
	 *
	 * @param array $templates VuloForm templates.
	 * @return array
	 */
	public function add_template( $templates ) {
		if ( ! class_exists( '\VuloForm\Forms\Templates' ) ) {
			return $templates;
		}

		$field = array( '\VuloForm\Forms\Templates', 'field' );

		$templates[ self::TEMPLATE ] = \VuloForm\Forms\Templates::entry(
			self::TEMPLATE,
			array(
				'title'  => __( 'Store registration', 'multivendorx' ),
				'desc'   => __( 'Marketplace store application: name, description, phone, PayPal email and address.', 'multivendorx' ),
				'icon'   => 'storefront',
				'plugin' => 'MultiVendorX',
				'single' => true,
				'fields' => array(
					call_user_func( $field, 'text', __( 'Store name', 'multivendorx' ), array( 'key' => 'store_name', 'required' => true ) ),
					call_user_func( $field, 'textarea', __( 'Store description', 'multivendorx' ), array( 'key' => 'store_description' ) ),
					call_user_func( $field, 'phone', __( 'Store phone', 'multivendorx' ), array( 'key' => 'store_phone' ) ),
					call_user_func( $field, 'email', __( 'PayPal email', 'multivendorx' ), array( 'key' => 'store_paypal_email' ) ),
					call_user_func( $field, 'address', __( 'Store address', 'multivendorx' ), array( 'key' => 'store_address' ) ),
					call_user_func(
						$field,
						'consent',
						__( 'Terms', 'multivendorx' ),
						array(
							'required'     => true,
							'consent_text' => __( 'I agree to the terms and conditions.', 'multivendorx' ),
						)
					),
				),
				'submit' => __( 'Apply for a store', 'multivendorx' ),
			)
		);

		return $templates;
	}

	/**
	 * The field library the builder shows for a Store registration form.
	 *
	 * @param array $palettes VuloForm template palettes.
	 * @return array
	 */
	public function add_palette( $palettes ) {
		$item = static function ( $id, $type, $label, $icon, array $extra = array() ) {
			return array_merge(
				array(
					'id'    => $id,
					'type'  => $type,
					'label' => $label,
					'icon'  => $icon,
				),
				$extra
			);
		};

		$once = static function ( $key, $placeholder = '' ) {
			return array(
				'key'         => $key,
				'unique'      => true,
				'placeholder' => $placeholder,
			);
		};

		$palettes[ self::TEMPLATE ] = array(
			array(
				'id'    => 'blocks',
				'label' => __( 'Blocks', 'multivendorx' ),
				'items' => array(
					$item( 'form-title', 'heading', __( 'Form Title', 'multivendorx' ), 'title' ),
					$item( 'text', 'text', __( 'Enter the text', 'multivendorx' ), 't-letter-bold', array( 'placeholder' => __( 'Enter your text here', 'multivendorx' ) ) ),
					$item( 'email', 'email', __( 'Email', 'multivendorx' ), 'unread', array( 'placeholder' => __( 'Enter your email here', 'multivendorx' ) ) ),
					$item( 'date', 'date', __( 'Date Picker', 'multivendorx' ), 'calendar' ),
					$item( 'time', 'time', __( 'Time Picker', 'multivendorx' ), 'alarm' ),
					$item( 'checkboxes', 'checkboxes', __( 'Checkbox', 'multivendorx' ), 'checkbox' ),
					$item( 'multi-select', 'checkboxes', __( 'Multi Select', 'multivendorx' ), 'multi-select' ),
					$item( 'radio', 'radio', __( 'Radio', 'multivendorx' ), 'radio' ),
					$item( 'dropdown', 'select', __( 'Dropdown', 'multivendorx' ), 'dropdown-checklist' ),
					$item( 'attachment', 'file', __( 'Attachment', 'multivendorx' ), 'submission-message' ),
					$item( 'section', 'page_break', __( 'Section', 'multivendorx' ), 'form-section' ),
					$item( 'terms', 'consent', __( 'Terms & Conditions', 'multivendorx' ), 't-letter-bold' ),
				),
			),
			array(
				'id'    => 'store',
				'label' => __( 'Store', 'multivendorx' ),
				'items' => array(
					$item( 'store-name', 'text', __( 'Store Name', 'multivendorx' ), 't-letter-bold', $once( 'store_name', __( 'Enter your store name', 'multivendorx' ) ) ),
					$item( 'store-description', 'textarea', __( 'Store Desc', 'multivendorx' ), 'text', $once( 'store_description', __( 'Enter your store description', 'multivendorx' ) ) ),
					$item( 'store-phone', 'phone', __( 'Store Phone', 'multivendorx' ), 'form-phone', $once( 'store_phone', __( 'Enter your store phone', 'multivendorx' ) ) ),
					$item( 'store-paypal', 'email', __( 'Store Paypal Email', 'multivendorx' ), 'unread', $once( 'store_paypal_email', __( 'Enter your PayPal email', 'multivendorx' ) ) ),
					$item( 'store-address', 'address', __( 'Store Address', 'multivendorx' ), 'form-address', $once( 'store_address' ) ),
				),
			),
		);

		return $palettes;
	}

	/**
	 * A store needs a name, so the registration form can't be published without the Store Name
	 * field (it was always a fixed field of the old form).
	 *
	 * @param string[] $problems Problems found.
	 * @param array    $schema   Form schema.
	 * @return string[]
	 */
	public function require_store_name( $problems, $schema ) {
		$keys = array_column( (array) ( $schema['fields'] ?? array() ), 'key' );

		if ( 'store_registration' === ( $schema['settings']['template'] ?? '' ) && ! in_array( 'store_name', $keys, true ) ) {
			$problems[] = __( 'A store registration form needs the Store Name field. Add it from the Store group on the left.', 'multivendorx' );
		}

		return $problems;
	}

	/**
	 * Old form field keys that map to a store's own data, by VuloForm key.
	 */
	const LEGACY_KEYS = array(
		'name'         => 'store_name',
		'description'  => 'store_description',
		'store-phone'  => 'store_phone',
		'store-paypal' => 'store_paypal_email',
		'address'      => 'store_address',
		'store-address' => 'store_address',
	);

	/**
	 * Whether VuloForm is available.
	 *
	 * @return bool
	 */
	public static function is_available() {
		return function_exists( 'vuloform_render' ) && function_exists( 'vuloform_get_form' );
	}

	/**
	 * The registration form's id, creating the form from VuloForm's template the first time.
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

		$form_id = self::migrate_legacy_form();

		return $form_id ? $form_id : self::create_from_template();
	}

	/**
	 * Creates the registration form from its template and remembers it.
	 *
	 * @return int Form id, 0 on failure.
	 */
	private static function create_from_template() {
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
	 * Carries the form built under Settings > Registration over to VuloForm, once. Its fields keep
	 * their names, so data submitted through the old form still lines up with the new one.
	 *
	 * @return int The VuloForm form id, 0 when there was nothing to carry over.
	 */
	public static function migrate_legacy_form() {
		if ( ! self::is_available() ) {
			return 0;
		}

		$existing = (int) get_option( self::FORM_OPTION, 0 );

		if ( $existing && vuloform_get_form( $existing ) ) {
			return $existing;
		}

		$old = get_option( Utill::MULTIVENDORX_SETTINGS['registration'], array() );
		$old = $old['store_registration_from'] ?? array();

		if ( empty( $old['formfieldlist'] ) || ! is_array( $old['formfieldlist'] ) ) {
			return 0;
		}

		$templates = \VuloForm\Forms\Templates::all();
		$base      = $templates[ self::TEMPLATE ]['schema'] ?? \VuloForm\Forms\Schema::defaults();
		$fields    = array();
		$submit    = '';
		$recaptcha = false;

		foreach ( $old['formfieldlist'] as $item ) {
			$type = (string) ( $item['type'] ?? '' );

			if ( 'button' === $type ) {
				$submit = (string) ( $item['text'] ?? '' );
				continue;
			}

			if ( 'recaptcha' === $type ) {
				$recaptcha = true;
				continue;
			}

			$field = self::convert_legacy_field( $item );

			if ( $field ) {
				$fields[] = $field;
			}
		}

		if ( ! $fields ) {
			return 0;
		}

		$base['fields'] = $fields;

		if ( '' !== $submit ) {
			$base['settings']['submit_label'] = $submit;
		}

		$base['settings']['spam']['recaptcha'] = $recaptcha;

		$form_id = (int) VuloForm()->forms->create( __( 'Store registration', 'multivendorx' ), $base, 'published' );

		if ( $form_id ) {
			update_option( self::FORM_OPTION, $form_id );
		}

		return $form_id;
	}

	/**
	 * One field of the old form as a VuloForm field.
	 *
	 * @param array $item Old field.
	 * @return array|null
	 */
	private static function convert_legacy_field( array $item ) {
		$types = array(
			'title'        => 'heading',
			'heading'      => 'heading',
			'section'      => 'heading',
			'text'         => 'text',
			'textarea'     => 'textarea',
			'email'        => 'email',
			'number'       => 'number',
			'url'          => 'url',
			'date'         => 'date',
			'time'         => 'time',
			'checkboxes'   => 'checkboxes',
			'multi-select' => 'checkboxes',
			'radio'        => 'radio',
			'dropdown'     => 'select',
			'select'       => 'select',
			'attachment'   => 'file',
			'address'      => 'address',
			'richtext'     => 'html',
		);

		$old_type = (string) ( $item['type'] ?? '' );

		if ( ! isset( $types[ $old_type ] ) ) {
			return null;
		}

		$name  = (string) ( $item['name'] ?? '' );
		$label = (string) ( $item['label'] ?? '' );
		$key   = self::LEGACY_KEYS[ $name ] ?? ( '' !== $name ? sanitize_key( $name ) : sanitize_key( $label ) );

		if ( 'address' === $old_type ) {
			$key = 'store_address';
		}

		$field = array(
			'type'        => $types[ $old_type ],
			'label'       => '' !== $label ? $label : ucfirst( $old_type ),
			'key'         => $key,
			'required'    => ! empty( $item['required'] ),
			'placeholder' => (string) ( $item['placeholder'] ?? '' ),
		);

		if ( ! empty( $item['options'] ) && is_array( $item['options'] ) ) {
			$field['options'] = array();

			foreach ( $item['options'] as $option ) {
				$field['options'][] = array(
					'label' => (string) ( $option['label'] ?? '' ),
					'value' => (string) ( $option['value'] ?? ( $option['label'] ?? '' ) ),
				);
			}
		}

		if ( 'html' === $types[ $old_type ] ) {
			$field['content'] = (string) ( $item['value'] ?? $item['content'] ?? $label );
		}

		return $field;
	}

	/**
	 * The registration form's HTML.
	 *
	 * @return string
	 */
	public static function render() {
		// The login / sign-up box for visitors, or the welcome line once logged in (see Frontend).
		$html = (string) apply_filters( 'multivendorx_add_content_before_form', '' );

		if ( ! self::is_available() ) {
			return $html . ( current_user_can( 'manage_options' )
				? '<p>' . esc_html__( 'Store registration needs the VuloForm plugin to be active.', 'multivendorx' ) . '</p>'
				: '' );
		}

		if ( is_user_logged_in() ) {
			// The form posts without cookies, so the applicant travels with it as a signed token.
			$token = '<input type="hidden" name="mvx_applicant" value="' . esc_attr( self::applicant_token( get_current_user_id() ) ) . '">';
			$html .= preg_replace( '#</form>#', $token . '</form>', vuloform_render( self::form_id() ), 1 );
		}

		return $html . (string) apply_filters( 'multivendorx_add_content_after_form', '' );
	}

	/**
	 * Creates the applicant's store from an accepted registration submission.
	 *
	 * @param int   $submission_id Submission id.
	 * @param array $values        Field key => value.
	 * @param array $form          VuloForm form.
	 * @return void
	 */
	public function register_store( $submission_id, $values, $form ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found
		if ( (int) ( $form['id'] ?? 0 ) !== (int) get_option( self::FORM_OPTION, 0 ) ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Missing, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- a signed token, verified below.
		$user_id = is_user_logged_in() ? get_current_user_id() : self::verify_applicant_token( (string) wp_unslash( $_POST['mvx_applicant'] ?? '' ) );
		$user    = $user_id ? get_userdata( $user_id ) : false;

		if ( ! $user ) {
			return;
		}

		// Admins and existing store owners don't apply; they already manage stores.
		if ( user_can( $user, 'manage_options' ) || in_array( 'store_owner', (array) $user->roles, true ) ) {
			return;
		}

		$name = sanitize_text_field( (string) ( $values['store_name'] ?? '' ) );

		// Never lose an application: a form without the Store Name field names the store after the applicant.
		if ( '' === $name ) {
			/* translators: %s: applicant's name. */
			$name = sprintf( __( "%s's store", 'multivendorx' ), $user->display_name );
		}

		$store = new Store();
		$store->set( Utill::STORE_SETTINGS_KEYS['name'], $name );
		$store->set( Utill::STORE_SETTINGS_KEYS['slug'], Store::generate_unique_store_slug( sanitize_title( $name ) ) );
		$store->set( Utill::STORE_SETTINGS_KEYS['description'], wp_kses_post( (string) ( $values['store_description'] ?? '' ) ) );
		$store->set( Utill::STORE_SETTINGS_KEYS['who_created'], $user->ID );

		$automatic = 'automatically' === MultiVendorX()->setting->get_setting( 'approve_store' );
		$store->set( Utill::STORE_SETTINGS_KEYS['status'], $automatic ? 'active' : 'pending' );

		$store_id = $store->save();

		if ( ! $store_id ) {
			return;
		}

		$address = is_array( $values['store_address'] ?? null ) ? $values['store_address'] : array();
		$meta    = array(
			Utill::STORE_SETTINGS_KEYS['phone']        => $values['store_phone'] ?? '',
			Utill::STORE_SETTINGS_KEYS['paypal_email'] => $values['store_paypal_email'] ?? '',
			Utill::STORE_SETTINGS_KEYS['address']      => $address['line1'] ?? '',
			Utill::STORE_SETTINGS_KEYS['address_2']    => $address['line2'] ?? '',
			Utill::STORE_SETTINGS_KEYS['city']         => $address['city'] ?? '',
			Utill::STORE_SETTINGS_KEYS['state']        => $address['state'] ?? '',
			Utill::STORE_SETTINGS_KEYS['zip']          => $address['zip'] ?? '',
			Utill::STORE_SETTINGS_KEYS['country']      => $address['country'] ?? '',
		);

		foreach ( $meta as $key => $value ) {
			if ( '' !== (string) $value ) {
				$store->update_meta( $key, sanitize_text_field( (string) $value ) );
			}
		}

		// Everything else the applicant filled in is kept as registration data, as before: a file as
		// a media library attachment id, a list as an array.
		$core_keys = array( 'store_name', 'store_description', 'store_phone', 'store_paypal_email', 'store_address' );
		$extra     = array();

		foreach ( $values as $key => $value ) {
			if ( in_array( $key, $core_keys, true ) || '' === $value || array() === $value ) {
				continue;
			}

			if ( is_array( $value ) && isset( $value[0]['path'] ) ) {
				$attachment_id = self::import_file( $value[0] );

				if ( $attachment_id ) {
					$extra[ $key ] = $attachment_id;
				}

				continue;
			}

			$extra[ $key ] = is_array( $value ) ? array_map( 'sanitize_text_field', $value ) : sanitize_text_field( (string) $value );
		}

		if ( $extra ) {
			$store->update_meta( Utill::STORE_SETTINGS_KEYS['registration_data'], maybe_serialize( $extra ) );
		}

		if ( $automatic ) {
			$user->set_role( 'store_owner' );
			MultiVendorX()->util->set_activity_logs( $store_id, __( 'Store registered successfully and approved automatically.', 'multivendorx' ), 'approve' );
		} else {
			$user->set_role( get_option( Utill::MULTIVENDORX_OTHER_SETTINGS['default_role'] ) );
			MultiVendorX()->util->set_activity_logs( $store_id, __( 'Store registered successfully and pending for approval.', 'multivendorx' ), 'pending' );
		}

		$store->update_meta(
			'store_email',
			array(
				'list'    => array( $user->user_email ),
				'primary' => $user->user_email,
			)
		);

		StoreUtil::set_primary_owner( $user->ID, $store_id );
		update_user_meta( $user->ID, Utill::USER_SETTINGS_KEYS['active_store'], $store_id );

		do_action( 'multivendorx_after_store_registration_complete', $user->ID, $store_id );
	}

	/**
	 * A signed, short-lived proof of who is applying, for a form that posts without cookies.
	 *
	 * @param int $user_id User id.
	 * @return string
	 */
	private static function applicant_token( $user_id ) {
		$expires = time() + DAY_IN_SECONDS;

		return $user_id . '.' . $expires . '.' . wp_hash( 'mvx_applicant|' . $user_id . '|' . $expires );
	}

	/**
	 * @param string $token Token from applicant_token().
	 * @return int User id, 0 when the token is missing, altered or expired.
	 */
	private static function verify_applicant_token( $token ) {
		$parts = explode( '.', $token );

		if ( 3 !== count( $parts ) || (int) $parts[1] < time() ) {
			return 0;
		}

		return hash_equals( wp_hash( 'mvx_applicant|' . (int) $parts[0] . '|' . (int) $parts[1] ), $parts[2] ) ? (int) $parts[0] : 0;
	}

	/**
	 * Copies a file VuloForm stored privately into the media library, so the store's application
	 * shows it the way it always did.
	 *
	 * @param array $file VuloForm file record: name, path, type.
	 * @return int Attachment id, 0 on failure.
	 */
	private static function import_file( array $file ) {
		if ( empty( $file['path'] ) || ! is_readable( $file['path'] ) ) {
			return 0;
		}

		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';

		$tmp = wp_tempnam( (string) ( $file['name'] ?? 'attachment' ) );

		if ( ! $tmp || ! copy( $file['path'], $tmp ) ) {
			return 0;
		}

		$id = media_handle_sideload(
			array(
				'name'     => sanitize_file_name( (string) ( $file['name'] ?? basename( $file['path'] ) ) ),
				'tmp_name' => $tmp,
			),
			0
		);

		if ( is_wp_error( $id ) ) {
			wp_delete_file( $tmp );
			return 0;
		}

		return (int) $id;
	}
}
