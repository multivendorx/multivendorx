<?php
/**
 * FindingRepository class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Repositories;

defined( 'ABSPATH' ) || exit;

/**
 * Persistence for vulopilot_scan_findings (DATABASE.md). category/severity/
 * status are exactly the filters the admin UI's FindingsTable component
 * (Health/SEO/GEO/WooCommerce/Dashboard pages) already sends. object_ref
 * was added in GEO-MODULE.md's pass so GeoAnalysis\GeoAnalyzer can read
 * every 'geo'-category finding already known about one specific post
 * without a bespoke query. object_type was added alongside it so
 * AutomationEngine\Actions\ResolveFindingAction can look up the one open
 * finding a Recommendation actually came from (object_ref alone isn't
 * unique across object types — e.g. post id 12 and attachment id 12).
 *
 * @class       FindingRepository class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class FindingRepository extends AbstractRepository {

    /**
     * @var string[]
     */
    protected array $filterable_columns = array( 'category', 'severity', 'status', 'object_type', 'object_ref' );

    /**
     * @inheritDoc
     */
    protected function get_table_key(): string {
        return 'scan_finding';
    }

    /**
     * Counts findings by severity across every scan — what the dashboard's
     * summary cards and site-health scoring read, without pulling every
     * row into PHP to count them (performance.md).
     *
     * @param string $severity One of Severity's constants.
     * @return int
     */
    public function count_by_severity( string $severity ): int {
        global $wpdb;

        return (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM {$this->get_table()} WHERE severity = %s AND status = 'open'", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $severity
            )
        );
    }

    /**
     * Counts open findings in one category — what each domain dashboard
     * widget (SEO/Performance/Security/Accessibility/WooCommerce) reads,
     * same shape as count_by_severity() above.
     *
     * @param string $category One of the scanner category strings (SCANNERS.md).
     * @return int
     */
    public function count_by_category( string $category ): int {
        global $wpdb;

        return (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM {$this->get_table()} WHERE category = %s AND status = 'open'", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $category
            )
        );
    }

    /**
     * Open-finding counts by severity within a single category, in one
     * grouped query rather than four count_by_severity()-style calls —
     * this is what Dashboard controller's per-category widget score
     * (SEO/Performance/Security/Accessibility/WooCommerce) is computed
     * from, using the same weighting Overall Health already uses, just
     * scoped down (performance.md: prefer one query over several).
     *
     * @param string $category One of the scanner category strings (SCANNERS.md).
     * @return array{critical: int, high: int, medium: int, low: int}
     */
    public function get_severity_breakdown_for_category( string $category ): array {
        global $wpdb;

        $counts = array_fill_keys( array( 'critical', 'high', 'medium', 'low' ), 0 );

        $rows = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT severity, COUNT(*) AS total FROM {$this->get_table()} WHERE category = %s AND status = 'open' GROUP BY severity", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $category
            ),
            ARRAY_A
        );

        foreach ( (array) $rows as $row ) {
            if ( array_key_exists( $row['severity'], $counts ) ) {
                $counts[ $row['severity'] ] = (int) $row['total'];
            }
        }

        return $counts;
    }

    /**
     * Aggregate counts for one date range — what every Reports\Types\*
     * report reads instead of pulling every row in the period into PHP to
     * count them (performance.md). $category narrows to one scanner
     * category (e.g. 'seo', 'security'); null means every category, used
     * by Reports\Types\ScanSummaryReport/HealthReport.
     *
     * @param string      $period_start Y-m-d, inclusive.
     * @param string      $period_end   Y-m-d, inclusive.
     * @param string|null $category     One of the scanner category strings (SCANNERS.md), or null for all.
     * @return array{total: int, by_severity: array<string, int>, by_category: array<string, int>, by_status: array<string, int>}
     */
    public function get_stats_for_period( string $period_start, string $period_end, ?string $category = null ): array {
        global $wpdb;

        $where  = 'WHERE DATE(created_at) BETWEEN %s AND %s';
        $values = array( $period_start, $period_end );

        if ( null !== $category ) {
            $where   .= ' AND category = %s';
            $values[] = $category;
        }

        $by_severity = array_fill_keys( array( 'critical', 'high', 'medium', 'low', 'info' ), 0 );

        $severity_rows = $wpdb->get_results(
            $wpdb->prepare( "SELECT severity, COUNT(*) AS total FROM {$this->get_table()} {$where} GROUP BY severity", ...$values ), // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare -- $where's %s count matches $values' size at runtime.
            ARRAY_A
        );

        foreach ( (array) $severity_rows as $row ) {
            if ( array_key_exists( $row['severity'], $by_severity ) ) {
                $by_severity[ $row['severity'] ] = (int) $row['total'];
            }
        }

        $by_category = array();

        if ( null === $category ) {
            $category_rows = $wpdb->get_results(
                $wpdb->prepare( "SELECT category, COUNT(*) AS total FROM {$this->get_table()} {$where} GROUP BY category", ...$values ), // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare -- same runtime-sized-array case as above.
                ARRAY_A
            );

            foreach ( (array) $category_rows as $row ) {
                $by_category[ $row['category'] ] = (int) $row['total'];
            }
        }

        $status_rows = $wpdb->get_results(
            $wpdb->prepare( "SELECT status, COUNT(*) AS total FROM {$this->get_table()} {$where} GROUP BY status", ...$values ), // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare -- same runtime-sized-array case as above.
            ARRAY_A
        );

        $by_status = array();

        foreach ( (array) $status_rows as $row ) {
            $by_status[ $row['status'] ] = (int) $row['total'];
        }

        return array(
            'total'       => array_sum( $by_severity ),
            'by_severity' => $by_severity,
            'by_category' => $by_category,
            'by_status'   => $by_status,
        );
    }

    /**
     * The highest-severity findings opened in one date range — what a
     * report's "top issues" section reads, ordered worst-first rather than
     * newest-first.
     *
     * @param string      $period_start Y-m-d, inclusive.
     * @param string      $period_end   Y-m-d, inclusive.
     * @param string|null $category     One of the scanner category strings, or null for all.
     * @param int         $limit        Max rows to return.
     * @return array<int, array<string, mixed>>
     */
    public function get_top_findings_for_period( string $period_start, string $period_end, ?string $category = null, int $limit = 10 ): array {
        global $wpdb;

        $where  = 'WHERE DATE(created_at) BETWEEN %s AND %s';
        $values = array( $period_start, $period_end );

        if ( null !== $category ) {
            $where   .= ' AND category = %s';
            $values[] = $category;
        }

        $values[] = max( 1, $limit );

        $rows = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT title, severity, category, status, created_at FROM {$this->get_table()} {$where} ORDER BY FIELD(severity, 'critical', 'high', 'medium', 'low', 'info') ASC, created_at DESC LIMIT %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare -- $where's %s count matches $values' size at runtime.
                ...$values
            ),
            ARRAY_A
        );

        return $rows ?: array();
    }
}
