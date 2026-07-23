<?php
/**
 * GeoAnalysis controller file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\RestAPI\Controllers;

defined( 'ABSPATH' ) || exit;

/**
 * GET /geo-analysis/{post_id} reads back a previously generated GeoScore
 * (postmeta, no AI call, no cost) — what src/pages/GEO/GEO.tsx's score
 * card loads on mount. POST /geo-analysis/{post_id} runs a fresh
 * analysis through GeoAnalysis\GeoAnalyzer (a real AI call) and persists
 * it — separated into two routes/verbs specifically so loading the GEO
 * page never silently re-spends an AI call a site owner didn't ask for.
 *
 * @class       GeoAnalysis controller
 * @version     1.0.0
 * @author      MultiVendorX
 */
class GeoAnalysis extends \WP_REST_Controller {

    /**
     * @var string
     */
    protected $rest_base = 'geo-analysis';

    /**
     * @inheritDoc
     */
    public function register_routes() {
        register_rest_route(
            VuloPilot()->rest_namespace,
            '/' . $this->rest_base . '/(?P<post_id>\d+)',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_item' ),
                    'permission_callback' => array( $this, 'get_item_permissions_check' ),
                ),
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'create_item' ),
                    'permission_callback' => array( $this, 'create_item_permissions_check' ),
                ),
            )
        );
    }

    /**
     * @inheritDoc
     */
    public function get_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * @inheritDoc
     */
    public function create_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * @inheritDoc
     */
    public function get_item( $request ) {
        $post_id = absint( $request->get_param( 'post_id' ) );
        $score   = VuloPilot()->geo_analyzer->get_stored_score( $post_id );

        if ( null === $score ) {
            return new \WP_Error( 'vulopilot_no_geo_score', __( 'No GEO analysis has been generated for this post yet.', 'vulopilot' ), array( 'status' => 404 ) );
        }

        return rest_ensure_response( $score );
    }

    /**
     * @inheritDoc
     */
    public function create_item( $request ) {
        $post_id = absint( $request->get_param( 'post_id' ) );

        try {
            $score = VuloPilot()->geo_analyzer->analyze( $post_id );
        } catch ( \InvalidArgumentException $e ) {
            return new \WP_Error( 'vulopilot_invalid_post', $e->getMessage(), array( 'status' => 400 ) );
        } catch ( \RuntimeException $e ) {
            return new \WP_Error( 'vulopilot_geo_analysis_failed', $e->getMessage(), array( 'status' => 502 ) );
        }

        return rest_ensure_response( $score->to_array() );
    }
}
