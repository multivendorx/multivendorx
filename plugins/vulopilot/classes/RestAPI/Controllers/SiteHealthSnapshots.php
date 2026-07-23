<?php
/**
 * SiteHealthSnapshots controller file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\RestAPI\Controllers;

use VuloPilot\Repositories\SiteHealthSnapshotRepository;

defined( 'ABSPATH' ) || exit;

/**
 * GET /site-health-snapshots — the trend-chart data source for
 * src/pages/Dashboard/Dashboard.tsx. Returns a plain array (not the
 * {data, total} shape the paginated list endpoints use) because that's
 * exactly what Dashboard.tsx already expects
 * (`getApiResponse<HealthSnapshot[]>(...)`), and snapshots aren't
 * paginated — they're a fixed recent window.
 *
 * @class       SiteHealthSnapshots controller
 * @version     1.0.0
 * @author      MultiVendorX
 */
class SiteHealthSnapshots extends \WP_REST_Controller {

    /**
     * @var string
     */
    protected $rest_base = 'site-health-snapshots';

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
        $repository = new SiteHealthSnapshotRepository();
        $days       = absint( $request->get_param( 'days' ) ) ?: 30;

        return rest_ensure_response( $repository->get_recent( $days ) );
    }
}
