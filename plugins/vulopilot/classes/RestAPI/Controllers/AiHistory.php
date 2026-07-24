<?php
/**
 * AiHistory controller file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\RestAPI\Controllers;

use VuloPilot\Repositories\AiHistoryRepository;

defined( 'ABSPATH' ) || exit;

/**
 * GET /ai-history backs src/pages/AIAssistant/AIAssistant.tsx's table.
 * Read-only — rows are only ever written by AIProviders\Decorators\
 * UsageTrackingProvider (part of every real AI provider call's fallback
 * chain), never by this controller.
 *
 * @class       AiHistory controller
 * @version     1.0.0
 * @author      MultiVendorX
 */
class AiHistory extends \WP_REST_Controller {

    /**
     * @var string
     */
    protected $rest_base = 'ai-history';

    /**
     * @inheritDoc
     */
    public function register_routes() {
        register_rest_route(
            VuloPilot()->rest_namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_items' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                ),
            )
        );
    }

    /**
     * @inheritDoc
     */
    public function get_items_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * @inheritDoc
     */
    public function get_items( $request ) {
        $repository = new AiHistoryRepository();

        $result                  = $repository->find_all(
            array(
                'page'     => absint( $request->get_param( 'page' ) ) ?: 1,
                'per_page' => absint( $request->get_param( 'per_page' ) ) ?: 20,
                'provider' => sanitize_key( (string) $request->get_param( 'provider' ) ),
                'status'   => sanitize_key( (string) $request->get_param( 'status' ) ),
                'search'   => sanitize_text_field( (string) $request->get_param( 'search' ) ),
                'orderby'  => sanitize_key( (string) $request->get_param( 'orderby' ) ),
                'order'    => sanitize_key( (string) $request->get_param( 'order' ) ),
            )
        );
        $result['status_counts'] = $repository->get_status_counts();

        return rest_ensure_response( $result );
    }
}
