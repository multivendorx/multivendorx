<?php
/**
 * HealthReport class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Reports\Types;

use VuloPilot\Reports\AbstractReportType;
use VuloPilot\Repositories\SiteHealthSnapshotRepository;
use VuloPilotCore\ValueObjects\ReportResult;

defined( 'ABSPATH' ) || exit;

/**
 * The overall-health score trend for one period, from the once-daily
 * `vulopilot_site_health_snapshots` rollup — what the dashboard's own
 * health-timeline widget reads, just scoped to a fixed report period
 * instead of "last N days from today".
 *
 * @class       HealthReport class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class HealthReport extends AbstractReportType {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'health';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Site Health Report', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function generate( string $period_start, string $period_end ): ReportResult {
        $snapshots                         = new SiteHealthSnapshotRepository();
        [ $previous_start, $previous_end ] = $this->get_previous_period( $period_start, $period_end );

        $rows          = $snapshots->get_between( $period_start, $period_end );
        $previous_rows = $snapshots->get_between( $previous_start, $previous_end );

        $latest_score   = $rows ? (int) end( $rows )['overall_score'] : 0;
        $earliest_score = $rows ? (int) $rows[0]['overall_score'] : 0;
        $previous_score = $previous_rows ? (int) end( $previous_rows )['overall_score'] : 0;
        $average_score  = $rows ? (int) round( array_sum( array_column( $rows, 'overall_score' ) ) / count( $rows ) ) : 0;

        return new ReportResult(
            $this->get_id(),
            $this->get_label(),
            $period_start,
            $period_end,
            array(
                'latest_score'   => $latest_score,
                'earliest_score' => $earliest_score,
                'average_score'  => $average_score,
                'snapshot_days'  => count( $rows ),
            ),
            array(
                'daily_scores' => array_map(
                    static fn( array $row ): array => array(
                        'date'  => $row['snapshot_date'],
                        'score' => (int) $row['overall_score'],
                    ),
                    $rows
                ),
            ),
            $this->build_trend(
                array( 'overall_score' => $latest_score ),
                array( 'overall_score' => $previous_score )
            )
        );
    }
}
