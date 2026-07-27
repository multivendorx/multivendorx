<?php
/**
 * AiVisibilityReport class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Reports\Types;

defined( 'ABSPATH' ) || exit;

/**
 * Readme.txt's "Reports" → "AI Visibility (AEO/GEO)" pillar. Category
 * `geo` findings for one period — the same 9-scanner GEO category
 * SCANNERS.md/GEO-MODULE.md document, and the same category the GEO
 * dashboard page's FindingsTable filters on. Deliberately reads the
 * deterministic, already-persisted `vulopilot_scan_findings` rows (same
 * shape every other AbstractCategoryReportType subclass reports on)
 * rather than GeoAnalysis\GeoAnalyzer's per-post AI-judged score —
 * Reports\ReportGenerator's own docblock is explicit that report
 * generation runs synchronously over bounded, already-aggregated SQL,
 * never an AI call, so aggregating GeoAnalyzer's postmeta-stored scores
 * across a whole period isn't a fit here.
 *
 * @class       AiVisibilityReport class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class AiVisibilityReport extends AbstractCategoryReportType {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'ai_visibility';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'AI Visibility Report', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    protected function get_category(): string {
        return 'geo';
    }
}
