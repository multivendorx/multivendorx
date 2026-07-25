<?php
/**
 * LlmsTxt controller file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\RestAPI\Controllers;

defined( 'ABSPATH' ) || exit;

/**
 * GET /llms-txt/preview backs src/pages/GEO/LlmsTxtCard.tsx's "Preview"
 * action — reuses GeoAnalysis\LlmsTxtGenerator::generate() directly so an
 * admin can see the current content without leaving wp-admin (the live
 * public `/llms.txt` route is served separately, by the same generator,
 * via LlmsTxtGenerator's own template_redirect hook — this controller
 * exists only so the preview doesn't have to fetch that public URL).
 *
 * @class       LlmsTxt controller
 * @version     1.0.0
 * @author      MultiVendorX
 */
class LlmsTxt extends \WP_REST_Controller {

    /**
     * @var string
     */
    protected $rest_base = 'llms-txt';

    /**
     * @inheritDoc
     */
    public function register_routes() {
        register_rest_route(
            VuloPilot()->rest_namespace,
            '/' . $this->rest_base . '/preview',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_preview' ),
                    'permission_callback' => array( $this, 'get_preview_permissions_check' ),
                ),
            )
        );
    }

    /**
     * @param \WP_REST_Request $request Full request object.
     * @return bool
     */
    public function get_preview_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response
     */
    public function get_preview( $request ) {
        return rest_ensure_response( array( 'content' => VuloPilot()->llms_txt_generator->generate() ) );
    }
}
