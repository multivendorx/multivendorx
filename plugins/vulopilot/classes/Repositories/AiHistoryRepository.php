<?php
/**
 * AiHistoryRepository class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Repositories;

defined( 'ABSPATH' ) || exit;

/**
 * Persistence for vulopilot_ai_history (DATABASE.md).
 *
 * @class       AiHistoryRepository class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class AiHistoryRepository extends AbstractRepository {

    /**
     * @var string[]
     */
    protected array $filterable_columns = array( 'provider' );

    /**
     * @inheritDoc
     */
    protected function get_table_key(): string {
        return 'ai_history';
    }

    /**
     * Call counts, token totals, and cost for one date range — what
     * Reports\Types\AiUsageReport's headline summary reads.
     *
     * @param string $period_start Y-m-d, inclusive.
     * @param string $period_end   Y-m-d, inclusive.
     * @return array{total_calls: int, successful_calls: int, failed_calls: int, prompt_tokens: int, completion_tokens: int, total_cost: float}
     */
    public function get_stats_for_period( string $period_start, string $period_end ): array {
        global $wpdb;

        $row = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT COUNT(*) AS total_calls,
                        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) AS successful_calls,
                        SUM(CASE WHEN status = 'failure' THEN 1 ELSE 0 END) AS failed_calls,
                        COALESCE(SUM(prompt_tokens), 0) AS prompt_tokens,
                        COALESCE(SUM(completion_tokens), 0) AS completion_tokens,
                        COALESCE(SUM(cost_estimate), 0) AS total_cost
                 FROM {$this->get_table()} WHERE DATE(created_at) BETWEEN %s AND %s", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $period_start,
                $period_end
            ),
            ARRAY_A
        );

        return array(
            'total_calls'       => (int) ( $row['total_calls'] ?? 0 ),
            'successful_calls'  => (int) ( $row['successful_calls'] ?? 0 ),
            'failed_calls'      => (int) ( $row['failed_calls'] ?? 0 ),
            'prompt_tokens'     => (int) ( $row['prompt_tokens'] ?? 0 ),
            'completion_tokens' => (int) ( $row['completion_tokens'] ?? 0 ),
            'total_cost'        => (float) ( $row['total_cost'] ?? 0 ),
        );
    }

    /**
     * Call counts and cost broken down per provider for one date range —
     * what the report's "by provider" section table reads.
     *
     * @param string $period_start Y-m-d, inclusive.
     * @param string $period_end   Y-m-d, inclusive.
     * @return array<int, array{provider: string, calls: int, total_cost: float}>
     */
    public function get_breakdown_by_provider_for_period( string $period_start, string $period_end ): array {
        global $wpdb;

        $rows = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT provider, COUNT(*) AS calls, COALESCE(SUM(cost_estimate), 0) AS total_cost
                 FROM {$this->get_table()} WHERE DATE(created_at) BETWEEN %s AND %s
                 GROUP BY provider ORDER BY calls DESC", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $period_start,
                $period_end
            ),
            ARRAY_A
        );

        return array_map(
            static fn( array $row ): array => array(
                'provider'   => $row['provider'],
                'calls'      => (int) $row['calls'],
                'total_cost' => (float) $row['total_cost'],
            ),
            $rows ?: array()
        );
    }
}
