<?php
/**
 * LlmsTxt controller file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\RestAPI\Controllers;

defined( 'ABSPATH' ) || exit;

/**
 * GET /llms-txt/regenerate backs the "Regenerate" button on Settings → GEO
 * (src/components/Settings/Scanning/LlmsTxtCard.tsx) — returns a fresh
 * GeoAnalysis\LlmsTxtGenerator::generate() output (live pages/posts, not
 * whatever's currently saved in llms_txt_content) so the button can
 * discard a customized version and start over from what the site
 * actually looks like today. This class previously also backed a
 * "Preview" action; that's gone now that llms_txt_content is a plain
 * auto-saving textarea (see Controllers\Settings), which is its own live
 * preview.
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
            '/' . $this->rest_base . '/regenerate',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_regenerated_content' ),
                    'permission_callback' => array( $this, 'get_regenerated_content_permissions_check' ),
                ),
            )
        );
    }

    /**
     * @param \WP_REST_Request $request Full request object.
     * @return bool
     */
    public function get_regenerated_content_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response
     */
    public function get_regenerated_content( $request ) {
        return rest_ensure_response( array( 'content' => VuloPilot()->llms_txt_generator->generate() ) );
    }
}
