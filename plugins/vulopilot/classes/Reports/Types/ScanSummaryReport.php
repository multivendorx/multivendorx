<?php
/**
 * ScanSummaryReport class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Reports\Types;

use VuloPilot\Reports\AbstractReportType;
use VuloPilot\Repositories\FindingRepository;
use VuloPilot\Repositories\ScanRepository;
use VuloPilotCore\ValueObjects\ReportResult;

defined( 'ABSPATH' ) || exit;

/**
 * Every scanner run plus every finding raised in the period, across every
 * category — the "everything" report, same all-categories posture as the
 * Health dashboard page (SCANNERS.md).
 *
 * @class       ScanSummaryReport class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ScanSummaryReport extends AbstractReportType {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'scan_summary';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Scan Summary', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function generate( string $period_start, string $period_end ): ReportResult {
        $scans                             = new ScanRepository();
        $findings                          = new FindingRepository();
        [ $previous_start, $previous_end ] = $this->get_previous_period( $period_start, $period_end );

        $scan_stats     = $scans->get_stats_for_period( $period_start, $period_end );
        $finding_stats  = $findings->get_stats_for_period( $period_start, $period_end );
        $previous_stats = $findings->get_stats_for_period( $previous_start, $previous_end );
        $top_findings   = $findings->get_top_findings_for_period( $period_start, $period_end, null, 15 );

        return new ReportResult(
            $this->get_id(),
            $this->get_label(),
            $period_start,
            $period_end,
            array(
                'scans_run'         => $scan_stats['total'],
                'total_findings'    => $finding_stats['total'],
                'open_findings'     => $finding_stats['by_status']['open'] ?? 0,
                'resolved_findings' => $finding_stats['by_status']['resolved'] ?? 0,
                'critical_findings' => $finding_stats['by_severity']['critical'] ?? 0,
            ),
            array(
                'scans_by_status'      => $scan_stats['by_status'],
                'findings_by_severity' => $finding_stats['by_severity'],
                'findings_by_category' => $finding_stats['by_category'],
                'top_findings'         => $top_findings,
            ),
            $this->build_trend(
                array(
					'total_findings'    => $finding_stats['total'],
					'critical_findings' => $finding_stats['by_severity']['critical'] ?? 0,
                ),
                array(
					'total_findings'    => $previous_stats['total'],
					'critical_findings' => $previous_stats['by_severity']['critical'] ?? 0,
                )
            )
        );
    }
}
