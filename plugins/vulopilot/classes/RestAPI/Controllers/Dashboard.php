<?php
/**
 * Dashboard controller file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\RestAPI\Controllers;

use VuloPilotCore\ValueObjects\Severity;
use VuloPilot\Repositories\ActionRunRepository;
use VuloPilot\Repositories\AutomationRepository;
use VuloPilot\Repositories\FindingRepository;

defined( 'ABSPATH' ) || exit;

/**
 * GET /dashboard — the summary object the Dashboard page's widgets read
 * (src/dashboard-widgets/registry.ts's DashboardSummary interface). This
 * is one aggregate payload rather than one REST call per widget
 * (performance.md's "prefer a single query" guidance, applied to the
 * frontend's fetch pattern too) — every number here is a cheap,
 * index-backed COUNT/GROUP BY, not a computed-per-request table scan.
 *
 * List-shaped widgets (Recent Activity, Latest Reports, Pending Approval,
 * Automation Status's row list, Health Timeline) deliberately do NOT live
 * in this payload — they call the existing dedicated list endpoints
 * (`/activity-logs`, `/reports`, `/ai-action-runs`, `/automations`,
 * `/site-health-snapshots`) directly, the same endpoints their full list
 * pages already use, rather than duplicating that data here.
 *
 * @class       Dashboard controller
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Dashboard extends \WP_REST_Controller {

    /**
     * @var string
     */
    protected $rest_base = 'dashboard';

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
        $findings    = new FindingRepository();
        $automations = new AutomationRepository();
        $action_runs = new ActionRunRepository();

        return rest_ensure_response(
            array(
                'overall_score'      => $this->calculate_overall_score( $findings ),
                'open_findings'      => $this->count_open_findings( $findings ),
                'critical_findings'  => $findings->count_by_severity( Severity::CRITICAL ),
                'active_automations' => $automations->count_enabled(),
                // AI provider usage isn't tracked yet — no AIProviders usage-metering
                // subsystem writes here (see AI-ARCHITECTURE.md's "What's not here
                // yet": quota enforcement). Reporting 0/0 honestly rather than
                // fabricating a number.
                'ai_jobs_used'       => 0,
                'ai_jobs_quota'      => 0,
                'category_scores'    => $this->build_category_scores( $findings ),
                'quick_fixes'        => $this->count_quick_fixes( $findings ),
                'pending_approvals'  => (int) $action_runs->find_all(
                    array(
						'status'   => 'pending_approval',
						'per_page' => 1,
					)
                )['total'],
                'automation_status'  => $automations->get_status_counts(),
            )
        );
    }

    /**
     * Per-domain widget scores (SEO/Performance/Security/Accessibility/
     * WooCommerce). `vulopilot_site_health_snapshots` already has
     * `seo_score`/`performance_score`/`security_score` columns, but
     * nothing in this codebase computes or writes them yet
     * (ScanPersistenceListener::refresh_todays_snapshot() only ever
     * upserts overall_score) — reading those columns here would silently
     * always return null, which is indistinguishable from "not
     * implemented" and would be exactly the kind of fabricated-looking
     * number this controller's docblock already warns against for AI
     * usage. Instead each score is computed live, using the identical
     * weighting calculate_overall_score() uses, just scoped to one
     * category's open findings — a real, honest derived score computable
     * from data that already exists.
     *
     * @param FindingRepository $findings Repository to read category breakdowns from.
     * @return array<string, int|null> Category id => 0-100 score, or null where the category doesn't apply to this site (WooCommerce inactive).
     */
    private function build_category_scores( FindingRepository $findings ): array {
        $categories = array( 'seo', 'performance', 'security', 'accessibility' );
        $scores     = array();

        foreach ( $categories as $category ) {
            $scores[ $category ] = $this->calculate_category_score( $findings, $category );
        }

        $scores['woocommerce'] = class_exists( 'WooCommerce' )
            ? $this->calculate_category_score( $findings, 'woocommerce' )
            : null;

        return $scores;
    }

    /**
     * Same weighting as calculate_overall_score(), scoped to one category.
     *
     * @param FindingRepository $findings Repository to read the breakdown from.
     * @param string            $category One of the scanner category strings (SCANNERS.md).
     * @return int 0-100.
     */
    private function calculate_category_score( FindingRepository $findings, string $category ): int {
        $breakdown = $findings->get_severity_breakdown_for_category( $category );

        $score = 100
            - ( $breakdown['critical'] * 15 )
            - ( $breakdown['high'] * 8 )
            - ( $breakdown['medium'] * 3 )
            - ( $breakdown['low'] * 1 );

        return max( 0, min( 100, $score ) );
    }

    /**
     * "Quick Fixes" = open findings in a category that has a matching
     * one-click AIAction already registered, by the same by-convention id
     * match AI-ACTIONS.md's "Recommendations as an input source" section
     * documents (`images` findings ↔ the `generate-alt` action). This
     * isn't a general "all auto-fixable findings" count — there's no
     * formal Recommendation → Action mapping yet (AI-ACTIONS.md's "What's
     * not here yet"), so counting anything beyond the one real pairing
     * that exists today would overstate what VuloPilot can actually do.
     *
     * @param FindingRepository $findings Repository to count from.
     * @return int
     */
    private function count_quick_fixes( FindingRepository $findings ): int {
        if ( ! VuloPilot()->ai_action_registry->get_action( 'generate-alt' ) ) {
            return 0;
        }

        return $findings->count_by_category( 'images' );
    }

    /**
     * @param FindingRepository $findings Repository to sum severities from.
     * @return int
     */
    private function count_open_findings( FindingRepository $findings ): int {
        $total = 0;

        foreach ( Severity::all() as $severity ) {
            $total += $findings->count_by_severity( $severity );
        }

        return $total;
    }

    /**
     * Same weighting ScanPersistenceListener uses when it upserts the
     * daily snapshot — kept identical so the dashboard's headline score
     * always matches what the trend chart's most recent point says.
     *
     * @param FindingRepository $findings Repository to read counts from.
     * @return int 0-100.
     */
    private function calculate_overall_score( FindingRepository $findings ): int {
        $score = 100
            - ( $findings->count_by_severity( Severity::CRITICAL ) * 15 )
            - ( $findings->count_by_severity( Severity::HIGH ) * 8 )
            - ( $findings->count_by_severity( Severity::MEDIUM ) * 3 )
            - ( $findings->count_by_severity( Severity::LOW ) * 1 );

        return max( 0, min( 100, $score ) );
    }
}
