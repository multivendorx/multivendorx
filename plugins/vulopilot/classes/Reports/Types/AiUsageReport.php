<?php
/**
 * AiUsageReport class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Reports\Types;

use VuloPilot\Reports\AbstractReportType;
use VuloPilot\Repositories\AiHistoryRepository;
use VuloPilotCore\ValueObjects\ReportResult;

defined( 'ABSPATH' ) || exit;

/**
 * AI provider call volume, token usage, and estimated cost for one period —
 * reads the permanent `vulopilot_ai_history` ledger (DATABASE.md), not the
 * `vulopilot_ai_jobs` work queue, since a report is about completed calls.
 *
 * @class       AiUsageReport class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class AiUsageReport extends AbstractReportType {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'ai_usage';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'AI Usage Report', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function generate( string $period_start, string $period_end ): ReportResult {
        $history                           = new AiHistoryRepository();
        [ $previous_start, $previous_end ] = $this->get_previous_period( $period_start, $period_end );

        $stats          = $history->get_stats_for_period( $period_start, $period_end );
        $previous_stats = $history->get_stats_for_period( $previous_start, $previous_end );
        $by_provider    = $history->get_breakdown_by_provider_for_period( $period_start, $period_end );

        return new ReportResult(
            $this->get_id(),
            $this->get_label(),
            $period_start,
            $period_end,
            array(
                'total_calls'      => $stats['total_calls'],
                'successful_calls' => $stats['successful_calls'],
                'failed_calls'     => $stats['failed_calls'],
                'total_tokens'     => $stats['prompt_tokens'] + $stats['completion_tokens'],
                'total_cost'       => $stats['total_cost'],
            ),
            array(
                'by_provider' => $by_provider,
            ),
            $this->build_trend(
                array(
					'total_calls' => $stats['total_calls'],
					'total_cost'  => $stats['total_cost'],
                ),
                array(
					'total_calls' => $previous_stats['total_calls'],
					'total_cost'  => $previous_stats['total_cost'],
                )
            )
        );
    }
}
