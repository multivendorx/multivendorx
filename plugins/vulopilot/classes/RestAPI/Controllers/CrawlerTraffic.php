<?php
/**
 * CrawlerTraffic controller file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\RestAPI\Controllers;

use VuloPilot\Repositories\CrawlerVisitRepository;

defined( 'ABSPATH' ) || exit;

/**
 * Backs src/pages/CrawlerTraffic/CrawlerTraffic.tsx (AI Crawler Traffic
 * Monitoring, readme.txt). `GET /crawler-traffic` is the paginated raw
 * visit log + filter-pill bar, same shape as ActivityLogs.php.
 * `GET /crawler-traffic/summary` is a separate, lightweight route for the
 * page's aggregate section (last-seen per bot, most-crawled pages, daily
 * volume) rather than bloating the paginated list response.
 *
 * @class       CrawlerTraffic controller
 * @version     1.0.0
 * @author      MultiVendorX
 */
class CrawlerTraffic extends \WP_REST_Controller {

    /**
     * @var string
     */
    protected $rest_base = 'crawler-traffic';

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

        register_rest_route(
            VuloPilot()->rest_namespace,
            '/' . $this->rest_base . '/summary',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_summary' ),
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
        $repository = new CrawlerVisitRepository();

        $result                    = $repository->find_all(
            array(
                'page'     => absint( $request->get_param( 'page' ) ) ?: 1,
                'per_page' => absint( $request->get_param( 'per_page' ) ) ?: 20,
                'bot_name' => sanitize_text_field( (string) $request->get_param( 'bot_name' ) ),
                'search'   => sanitize_text_field( (string) $request->get_param( 'search' ) ),
                'orderby'  => sanitize_key( (string) $request->get_param( 'orderby' ) ),
                'order'    => sanitize_key( (string) $request->get_param( 'order' ) ),
            )
        );
        $result['bot_name_counts'] = $repository->get_bot_counts();

        return rest_ensure_response( $result );
    }

    /**
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response
     */
    public function get_summary( $request ) {
        $repository = new CrawlerVisitRepository();
        $days       = absint( $request->get_param( 'days' ) ) ?: 30;

        return rest_ensure_response(
            array(
                'bot_last_seen'      => $repository->get_bot_last_seen(),
                'most_crawled_pages' => $repository->get_most_crawled_pages(),
                'daily_volume'       => $repository->get_daily_volume( $days ),
            )
        );
    }
}
