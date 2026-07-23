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
 * Read-only — rows are only ever written by the (not yet built)
 * AIProviders subsystem, never by this controller.
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

        return rest_ensure_response(
            $repository->find_all(
                array(
                    'page'     => absint( $request->get_param( 'page' ) ) ?: 1,
                    'per_page' => absint( $request->get_param( 'per_page' ) ) ?: 20,
                    'provider' => sanitize_key( (string) $request->get_param( 'provider' ) ),
                )
            )
        );
    }
}
