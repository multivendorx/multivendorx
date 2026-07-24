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
 * loops `register_routes()` on `rest_api_init`. All of VuloPilot's own
 * controllers are plugin-level (none are module-scoped yet, since no
 * module has its own REST needs), so they all live here rather than
 * self-hooking individually.
 *
 * `vulopilot_rest_controllers` (Sdk\ExtensionManager, ARCHITECTURE.md's
 * Prompt 15) is the REST extension point for anything that'd rather add
 * itself to this central dispatcher than self-hook `rest_api_init`
 * independently — both are valid, same "module-level controllers can
 * self-hook independently" posture rest-api.md already documents, just
 * with this filter as the second option instead of the only one.
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
     * Instantiates every controller (own + filtered-in) and registers its
     * routes. A filtered-in controller that isn't already an instance, or
     * doesn't extend \WP_REST_Controller, is silently skipped — same
     * defensive posture every other discovery-by-filter registry in this
     * codebase already uses for a broken third-party registration.
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
            'automation_runs'       => new Controllers\AutomationRuns(),
            'reports'               => new Controllers\Reports(),
            'report_schedules'      => new Controllers\ReportSchedules(),
            'ai_history'            => new Controllers\AiHistory(),
            'ai_action_runs'        => new Controllers\AiActionRuns(),
            'geo_analysis'          => new Controllers\GeoAnalysis(),
            'activity_logs'         => new Controllers\ActivityLogs(),
            'settings'              => new Controllers\Settings(),
        );

        $extra_controllers = apply_filters( 'vulopilot_rest_controllers', array() );

        foreach ( $extra_controllers as $key => $controller ) {
            if ( $controller instanceof \WP_REST_Controller ) {
                $this->controllers[ $key ] = $controller;
            }
        }

        foreach ( $this->controllers as $controller ) {
            $controller->register_routes();
        }
    }
}
