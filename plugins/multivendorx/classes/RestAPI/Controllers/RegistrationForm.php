<?php
/**
 * Registration form REST API controller
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\RestAPI\Controllers;

use MultiVendorX\Store\Registration;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX REST API registration form controller: what the Registration settings tab shows.
 *
 * @class       RegistrationForm class
 * @version     5.0.0
 * @author      MultiVendorX
 */
class RegistrationForm extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'registration-form';

	/**
	 * Register the routes.
	 *
	 * @return void
	 */
	public function register_routes() {
		register_rest_route(
			MultiVendorX()->rest_namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
			)
		);
	}

	/**
	 * @param mixed $request Request data.
	 * @return bool
	 */
	public function permissions_check( $request ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found
		return Utill::current_user_has_capability( array( 'manage_options' ) );
	}

	/**
	 * The registration form for the settings preview.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function get_items( $request ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found
		$form_id = Registration::form_id();

		if ( ! function_exists( 'get_plugins' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		// VuloForm is either on the site but switched off (activate it on the Plugins screen) or not
		// installed at all (search for it in the plugin directory).
		$installed = false;

		foreach ( array_keys( get_plugins() ) as $file ) {
			if ( 0 === strpos( $file, 'vuloform/' ) ) {
				$installed = true;
				break;
			}
		}

		return rest_ensure_response(
			array(
				'installed' => $installed,
				'plugin_url' => $installed ? admin_url( 'plugins.php' ) : admin_url( 'plugin-install.php?s=VuloForm&tab=search&type=term' ),
				'available' => Registration::is_available(),
				'form_id'   => $form_id,
				'edit_url'  => $form_id ? admin_url( 'admin.php?page=vuloform#&tab=forms&form=' . $form_id ) : '',
				'style_url' => Registration::is_available() ? VuloForm()->plugin_url . 'assets/styles/public/vuloform-form.min.css' : '',
				'html'      => $form_id ? vuloform_render( $form_id ) : '',
			)
		);
	}
}
