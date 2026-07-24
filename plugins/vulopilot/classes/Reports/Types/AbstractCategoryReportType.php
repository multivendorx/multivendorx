<?php
/**
 * AbstractCategoryReportType class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Reports\Types;

use VuloPilot\Reports\AbstractReportType;
use VuloPilot\Repositories\FindingRepository;
use VuloPilotCore\ValueObjects\ReportResult;

defined( 'ABSPATH' ) || exit;

/**
 * Base for every report type that's just "one scanner category's findings,
 * for one period" — SeoReport/WooCommerceReport/SecurityReport/
 * AccessibilityReport are identical in shape and differ only in which
 * category string they read (SCANNERS.md's category list), so the actual
 * generate() logic belongs here once rather than copy-pasted four times.
 *
 * @class       AbstractCategoryReportType class
 * @version     1.0.0
 * @author      MultiVendorX
 */
abstract class AbstractCategoryReportType extends AbstractReportType {

    /**
     * @return string One of the scanner category strings (SCANNERS.md).
     */
    abstract protected function get_category(): string;

    /**
     * @inheritDoc
     */
    public function generate( string $period_start, string $period_end ): ReportResult {
        $findings = new FindingRepository();
        $category = $this->get_category();

        [ $previous_start, $previous_end ] = $this->get_previous_period( $period_start, $period_end );

        $stats          = $findings->get_stats_for_period( $period_start, $period_end, $category );
        $previous_stats = $findings->get_stats_for_period( $previous_start, $previous_end, $category );
        $top_findings   = $findings->get_top_findings_for_period( $period_start, $period_end, $category, 15 );

        return new ReportResult(
            $this->get_id(),
            $this->get_label(),
            $period_start,
            $period_end,
            array(
                'total_findings'    => $stats['total'],
                'open_findings'     => $stats['by_status']['open'] ?? 0,
                'resolved_findings' => $stats['by_status']['resolved'] ?? 0,
                'critical_findings' => $stats['by_severity']['critical'] ?? 0,
                'high_findings'     => $stats['by_severity']['high'] ?? 0,
            ),
            array(
                'findings_by_severity' => $stats['by_severity'],
                'top_findings'         => $top_findings,
            ),
            $this->build_trend(
                array(
					'total_findings'    => $stats['total'],
					'critical_findings' => $stats['by_severity']['critical'] ?? 0,
                ),
                array(
					'total_findings'    => $previous_stats['total'],
					'critical_findings' => $previous_stats['by_severity']['critical'] ?? 0,
                )
            )
        );
    }
}
