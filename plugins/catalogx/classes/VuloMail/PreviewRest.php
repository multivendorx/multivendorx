<?php
/**
 * PreviewRest class file.
 *
 * @package CatalogX
 */

namespace CatalogX\VuloMail;

use CatalogX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * REST route for the Email Customizer's enquiry email preview. Self-registers on `rest_api_init`
 * instead of going through `RestAPI\Rest`. Reads VuloMail's own stored template content
 * in-process (`Templates\Registry::load()`) rather than round-tripping to VuloMail's REST API.
 */
class PreviewRest {

    /**
     * PreviewRest constructor.
     */
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    /**
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            CatalogX()->rest_namespace,
            '/vulomail-enquiry-preview',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_preview' ),
                    'permission_callback' => array( $this, 'check_permission' ),
                ),
            )
        );
    }

    /**
     * @return true|\WP_Error
     */
    public function check_permission() {
        return Utill::current_user_has_capability( array( 'manage_options' ) );
    }

    /**
     * @param \WP_REST_Request $request The REST request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function get_preview( $request ) {
        $nonce_check = Utill::validate_nonce( $request );

        if ( is_wp_error( $nonce_check ) ) {
            return $nonce_check;
        }

        // "Installed" means active -- VuloMail's classes only autoload while active.
        $installed = class_exists( '\VuloMail\VuloMail' );
        $available = $installed && class_exists( '\VuloMail\Templates\Registry' );

        $response = array(
            'installed'  => $installed,
            'plugin_url' => $installed ? admin_url( 'plugins.php' ) : admin_url( 'plugin-install.php?s=VuloMail&tab=search&type=term' ),
            'available'  => $available,
            'edit_url'   => '',
            'subject'    => '',
            'content'    => '',
        );

        if ( ! $available ) {
            return rest_ensure_response( $response );
        }

        $email = \VuloMail\Templates\Registry::load( Templates::ENQUIRY );

        if ( ! $email ) {
            return rest_ensure_response( $response );
        }

        $response['edit_url'] = admin_url( 'admin.php?page=vulomail#&tab=email-templates&template=' . Templates::ENQUIRY );
        $response['subject']  = $email['subject'] ?? '';
        $response['content']  = $email['content'] ?? '';

        return rest_ensure_response( $response );
    }
}
