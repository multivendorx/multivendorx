<?php
/**
 * Notifima REST API subscription form controller.
 *
 * @package Notifima
 */

namespace Notifima\RestAPI\Controllers;

use Notifima\SubscriptionForm as SubscriptionFormService;

defined( 'ABSPATH' ) || exit;

/**
 * What the subscription form settings tab shows: a preview of the VuloForm form and a link to edit it.
 *
 * @class       SubscriptionForm class
 * @version     3.2.0
 * @author      MultiVendorX
 */
class SubscriptionForm extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'subscription-form';

	/**
	 * Register the routes.
	 *
	 * @return void
	 */
	public function register_routes() {
		register_rest_route(
			Notifima()->rest_namespace,
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
	 * Only site managers see the form's preview and editor link.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return bool
	 */
	public function permissions_check( $request ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found
		return current_user_can( 'manage_options' );
	}

	/**
	 * The subscription form for the settings preview.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function get_items( $request ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found
		$form_id = SubscriptionFormService::form_id();

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

		$available = SubscriptionFormService::is_available();

		return rest_ensure_response(
			array(
				'installed'  => $installed,
				'plugin_url' => $installed ? admin_url( 'plugins.php' ) : admin_url( 'plugin-install.php?s=VuloForm&tab=search&type=term' ),
				'available'  => $available,
				'form_id'    => $form_id,
				'edit_url'   => $form_id ? admin_url( 'admin.php?page=vuloform#&tab=forms&form=' . $form_id ) : '',
				'style_url'  => $available ? VuloForm()->plugin_url . 'assets/styles/public/vuloform-form.min.css' : '',
				'html'       => $form_id ? vuloform_render( $form_id ) : '',
			)
		);
	}
}
