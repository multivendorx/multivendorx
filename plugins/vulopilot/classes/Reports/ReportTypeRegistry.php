<?php
/**
 * ReportTypeRegistry class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Reports;

use VuloPilotCore\Contracts\Report\ReportTypeInterface;

defined( 'ABSPATH' ) || exit;

/**
 * Collects every registered report type and instantiates it. Free's own 8
 * report types always exist; a premium/third-party report type is added on
 * top via the `vulopilot_report_type_sources` filter — same
 * discovery-by-filter shape as Scanners\ScannerRegistry/
 * AutomationEngine\TriggerRegistry (a plain class-name filter, not
 * Modules.php's folder-scan/reflection discovery — module-architecture.md's
 * reasoning for why scanners/report-types don't need their own folder
 * applies here too).
 *
 * Types\CustomReport is deliberately NOT in the default list — it's the
 * "report builder" and is parameterized per generation request, so
 * Reports\ReportGenerator constructs it directly rather than resolving it
 * from here (see its own docblock).
 *
 * @class       ReportTypeRegistry class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ReportTypeRegistry {

    /**
     * Instantiated report types, keyed by their own get_id().
     *
     * @var array<string, ReportTypeInterface>
     */
    private array $report_types = array();

    /**
     * ReportTypeRegistry constructor.
     */
    public function __construct() {
        add_action( 'init', array( $this, 'register_report_types' ), 20 );
    }

    /**
     * Instantiates every registered report type class and indexes it by id.
     * A class that doesn't exist, or doesn't implement ReportTypeInterface,
     * is silently skipped rather than fataling the whole registry — same
     * defensive posture as ScannerRegistry::register_scanners().
     *
     * @return void
     */
    public function register_report_types(): void {
        $report_type_classes = apply_filters( 'vulopilot_report_type_sources', $this->get_default_report_type_classes() );

        foreach ( $report_type_classes as $report_type_class ) {
            if ( ! is_string( $report_type_class ) || ! class_exists( $report_type_class ) ) {
                continue;
            }

            $report_type = new $report_type_class();

            if ( ! $report_type instanceof ReportTypeInterface ) {
                continue;
            }

            $this->report_types[ $report_type->get_id() ] = $report_type;
        }
    }

    /**
     * Free's own always-available report types.
     *
     * @return string[] Fully-qualified class names implementing ReportTypeInterface.
     */
    private function get_default_report_type_classes(): array {
        return array(
            Types\ScanSummaryReport::class,
            Types\SeoReport::class,
            Types\WooCommerceReport::class,
            Types\SecurityReport::class,
            Types\AccessibilityReport::class,
            Types\HealthReport::class,
            Types\AutomationReport::class,
            Types\AiUsageReport::class,
        );
    }

    /**
     * @param string $id A report type's get_id().
     * @return ReportTypeInterface|null
     */
    public function get_report_type( string $id ): ?ReportTypeInterface {
        return $this->report_types[ $id ] ?? null;
    }

    /**
     * @return array<string, ReportTypeInterface>
     */
    public function get_all(): array {
        return $this->report_types;
    }
}
