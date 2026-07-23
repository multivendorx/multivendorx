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
 * without a bespoke query.
 *
 * @class       FindingRepository class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class FindingRepository extends AbstractRepository {

    /**
     * @var string[]
     */
    protected array $filterable_columns = array( 'category', 'severity', 'status', 'object_ref' );

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
}
