<?php
/**
 * CatalogX REST API Email Templates controller.
 *
 * Shared vulomail email-template contract — same route/response shape as
 * multivendorx's `classes/RestAPI/Controllers/Notifications.php` additive
 * `email-templates`/`email-events` routes, so vulomail's central "Email
 * Templates" screen can list and edit CatalogX's own quote/wholesale/
 * enquiry notification templates the same way it already does
 * MultiVendorX's. CatalogX stays backend/data only — the block-based
 * editor itself only ever renders inside vulomail.
 *
 * @package CatalogX
 */

namespace CatalogX\RestAPI\Controllers;

use CatalogX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Email Templates REST controller class.
 */
class EmailTemplates extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'email-templates';

	/**
	 * Option name storing every template row as one JSON-encoded array.
	 * CatalogX has no existing notification table with `email_subject`/
	 * `email_body` columns (its quote/wholesale/enquiry notices are plain
	 * WC_Email subclasses), so this is new storage rather than a reshape
	 * of something that already existed.
	 *
	 * @var string
	 */
	const OPTION_NAME = 'catalogx_email_templates';

	/**
	 * The three notification types this screen covers, seeded on first
	 * read if the option doesn't exist yet. `id` is stable so vulomail's
	 * `email-templates/{id}` route keeps working across requests.
	 *
	 * @return array
	 */
	private function default_templates() {
		return array(
			array(
				'id'            => 1,
				'event'         => __( 'Quote notification', 'catalogx' ),
				'description'   => __( 'Sent to the store/admin when a customer submits a quote request.', 'catalogx' ),
				'category'      => 'quote',
				'tag'           => 'quote',
				'recipients'    => array(
					array(
						'id'        => 1,
						'type'      => 'Admin',
						'label'     => 'Admin',
						'enabled'   => true,
						'canDelete' => false,
					),
				),
				'channels'      => array(
					'mail'   => true,
					'sms'    => false,
					'system' => false,
				),
				'email_subject' => __( 'New quote request received', 'catalogx' ),
				'email_body'    => '',
			),
			array(
				'id'            => 2,
				'event'         => __( 'Wholesale registration', 'catalogx' ),
				'description'   => __( 'Sent to the admin when a customer registers for a wholesale account.', 'catalogx' ),
				'category'      => 'wholesale',
				'tag'           => 'wholesale',
				'recipients'    => array(
					array(
						'id'        => 1,
						'type'      => 'Admin',
						'label'     => 'Admin',
						'enabled'   => true,
						'canDelete' => false,
					),
				),
				'channels'      => array(
					'mail'   => true,
					'sms'    => false,
					'system' => false,
				),
				'email_subject' => __( 'New wholesale registration', 'catalogx' ),
				'email_body'    => '',
			),
			array(
				'id'            => 3,
				'event'         => __( 'Enquiry message', 'catalogx' ),
				'description'   => __( 'Sent to the store when a customer sends a product enquiry.', 'catalogx' ),
				'category'      => 'enquiry',
				'tag'           => 'enquiry',
				'recipients'    => array(
					array(
						'id'        => 1,
						'type'      => 'Admin',
						'label'     => 'Admin',
						'enabled'   => true,
						'canDelete' => false,
					),
				),
				'channels'      => array(
					'mail'   => true,
					'sms'    => false,
					'system' => false,
				),
				'email_subject' => __( 'New enquiry received', 'catalogx' ),
				'email_body'    => '',
			),
		);
	}

	/**
	 * Reads the stored template rows, seeding defaults on first use.
	 *
	 * @return array
	 */
	private function get_templates() {
		$stored = get_option( self::OPTION_NAME, null );

		if ( ! is_array( $stored ) || empty( $stored ) ) {
			$stored = $this->default_templates();
			update_option( self::OPTION_NAME, $stored );
		}

		return $stored;
	}

	/**
	 * Register REST API routes.
	 *
	 * @return void
	 */
	public function register_routes() {
		register_rest_route(
			CatalogX()->rest_namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'catalogx_permissions_check' ),
				),
			)
		);

		register_rest_route(
			CatalogX()->rest_namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_item' ),
					'permission_callback' => array( $this, 'catalogx_permissions_check' ),
					'args'                => array(
						'id' => array( 'required' => true ),
					),
				),
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_item' ),
					'permission_callback' => array( $this, 'catalogx_permissions_check' ),
				),
			)
		);

		register_rest_route(
			CatalogX()->rest_namespace,
			'/email-events',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'catalogx_permissions_check' ),
				),
			)
		);
	}

	/**
	 * Check API request permissions.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return bool
	 */
	public function catalogx_permissions_check( $request ) {
		return Utill::current_user_has_capability( 'manage_options' );
	}

	/**
	 * GET /email-templates (and /email-events) — the full template list.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function get_items( $request ) {
		return rest_ensure_response( $this->get_templates() );
	}

	/**
	 * GET /email-templates/{id} — one template row.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_item( $request ) {
		$id = (int) $request->get_param( 'id' );

		foreach ( $this->get_templates() as $template ) {
			if ( (int) $template['id'] === $id ) {
				return rest_ensure_response( array( $template ) );
			}
		}

		return new \WP_Error( 'not_found', __( 'Template not found.', 'catalogx' ), array( 'status' => 404 ) );
	}

	/**
	 * POST /email-templates/{id} — updates one template's content and/or
	 * channel state. Accepts the same two payload shapes multivendorx's
	 * equivalent route does, since vulomail's Email Templates screen sends
	 * either one depending on whether it's saving the builder's content
	 * (`formData`) or toggling the "On" switch (`notifications`).
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function update_item( $request ) {
		$id        = (int) $request->get_param( 'id' );
		$templates = $this->get_templates();
		$found     = false;

		$form_data         = $request->get_param( 'formData' );
		$notification_data = $request->get_param( 'notifications' );

		foreach ( $templates as $index => $template ) {
			if ( (int) $template['id'] !== $id ) {
				continue;
			}

			$found = true;

			if ( ! empty( $form_data ) && is_array( $form_data ) ) {
				if ( isset( $form_data['email_subject'] ) ) {
					$templates[ $index ]['email_subject'] = sanitize_text_field( $form_data['email_subject'] );
				}
				if ( isset( $form_data['email_body'] ) ) {
					$templates[ $index ]['email_body'] = wp_kses_post( $form_data['email_body'] );
				}
			}

			if ( ! empty( $notification_data ) && is_array( $notification_data ) ) {
				foreach ( $notification_data as $notification ) {
					if ( (int) ( $notification['id'] ?? 0 ) !== $id ) {
						continue;
					}
					if ( ! empty( $notification['channels'] ) ) {
						$templates[ $index ]['channels'] = array_merge(
							$templates[ $index ]['channels'],
							$notification['channels']
						);
					}
					if ( ! empty( $notification['recipients'] ) ) {
						$templates[ $index ]['recipients'] = $notification['recipients'];
					}
				}
			}
		}

		if ( ! $found ) {
			return new \WP_Error( 'not_found', __( 'Template not found.', 'catalogx' ), array( 'status' => 404 ) );
		}

		update_option( self::OPTION_NAME, $templates );

		return rest_ensure_response( array( 'success' => true ) );
	}
}
