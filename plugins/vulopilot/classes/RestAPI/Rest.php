<?php
/**
 * Rest class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\RestAPI;

defined( 'ABSPATH' ) || exit;

/**
 * VuloPilot Rest class.
 *
 * Plugin-level REST dispatcher — mirrors rest-api.md's documented
 * two-tier pattern exactly: this builds a container of controllers and
 * loops `register_routes()` on `rest_api_init`. All of VuloPilot's
 * controllers are plugin-level today (none are module-scoped yet, since
 * no module has its own REST needs), so they all live here rather than
 * self-hooking individually.
 *
 * @class       Rest class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Rest {

    /**
     * @var array<string, \WP_REST_Controller>
     */
    private array $controllers = array();

    /**
     * Rest constructor.
     */
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    /**
     * Instantiates every controller and registers its routes.
     *
     * @return void
     */
    public function register_routes(): void {
        $this->controllers = array(
            'dashboard'             => new Controllers\Dashboard(),
            'dashboard_layout'      => new Controllers\DashboardLayout(),
            'scans'                 => new Controllers\Scans(),
            'findings'              => new Controllers\Findings(),
            'site_health_snapshots' => new Controllers\SiteHealthSnapshots(),
            'automations'           => new Controllers\Automations(),
            'reports'               => new Controllers\Reports(),
            'ai_history'            => new Controllers\AiHistory(),
            'ai_action_runs'        => new Controllers\AiActionRuns(),
            'geo_analysis'          => new Controllers\GeoAnalysis(),
            'activity_logs'         => new Controllers\ActivityLogs(),
            'settings'              => new Controllers\Settings(),
        );

        foreach ( $this->controllers as $controller ) {
            $controller->register_routes();
        }
    }
}
