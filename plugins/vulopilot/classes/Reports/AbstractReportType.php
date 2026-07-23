<?php
/**
 * AbstractReportType class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Reports;

use VuloPilotCore\Contracts\Report\ReportTypeInterface;

defined( 'ABSPATH' ) || exit;

/**
 * Base class for every report type under Reports/Types/. Every report
 * needs the same "compare this period against the immediately preceding
 * period of equal length" trend math (Prompt 13's "trend analysis"
 * requirement) — that's genuinely shared behavior, unlike
 * get_id()/get_label()/generate() which differ per report and stay
 * abstract.
 *
 * @class       AbstractReportType class
 * @version     1.0.0
 * @author      MultiVendorX
 */
abstract class AbstractReportType implements ReportTypeInterface {

    /**
     * @inheritDoc
     */
    abstract public function get_id(): string;

    /**
     * @inheritDoc
     */
    abstract public function get_label(): string;

    /**
     * @inheritDoc
     */
    abstract public function generate( string $period_start, string $period_end ): \VuloPilotCore\ValueObjects\ReportResult;

    /**
     * The date range immediately preceding [$period_start, $period_end],
     * of the same inclusive day length — what every report's trend
     * comparison is measured against.
     *
     * @param string $period_start Y-m-d, inclusive.
     * @param string $period_end   Y-m-d, inclusive.
     * @return array{0: string, 1: string} [previous_start, previous_end], both Y-m-d.
     */
    protected function get_previous_period( string $period_start, string $period_end ): array {
        $start = new \DateTimeImmutable( $period_start );
        $end   = new \DateTimeImmutable( $period_end );
        $days  = (int) $start->diff( $end )->days + 1;

        $previous_end   = $start->modify( '-1 day' );
        $previous_start = $previous_end->modify( '-' . ( $days - 1 ) . ' days' );

        return array( $previous_start->format( 'Y-m-d' ), $previous_end->format( 'Y-m-d' ) );
    }

    /**
     * @param int|float $current  This period's value.
     * @param int|float $previous Previous period's value.
     * @return float|null Percentage change, or null when $previous is 0 (no meaningful percentage to show).
     */
    protected function calculate_change_percent( $current, $previous ): ?float {
        if ( 0 == $previous ) { // phpcs:ignore Universal.Operators.StrictComparisons.LooseEqual -- deliberately loose: catches both int 0 and float 0.0 from either metric type.
            return null;
        }

        return round( ( ( $current - $previous ) / $previous ) * 100, 1 );
    }

    /**
     * Builds a trend array from two same-shape metric maps (current period
     * vs. previous period) — the shape Reports\ReportResult::get_trend()
     * documents.
     *
     * @param array<string, int|float> $current_metrics  This period's metrics.
     * @param array<string, int|float> $previous_metrics Previous period's metrics.
     * @return array<string, array{current: int|float, previous: int|float, change_percent: float|null}>
     */
    protected function build_trend( array $current_metrics, array $previous_metrics ): array {
        $trend = array();

        foreach ( $current_metrics as $key => $current_value ) {
            $previous_value = $previous_metrics[ $key ] ?? 0;

            $trend[ $key ] = array(
                'current'        => $current_value,
                'previous'       => $previous_value,
                'change_percent' => $this->calculate_change_percent( $current_value, $previous_value ),
            );
        }

        return $trend;
    }
}
