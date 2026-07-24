<?php
/**
 * ReportExporterRegistry class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Reports;

use VuloPilotCore\Contracts\Report\ReportExporterInterface;

defined( 'ABSPATH' ) || exit;

/**
 * Collects every registered report exporter and instantiates it. Free
 * ships csv/json/pdf; a premium/third-party exporter (e.g. xlsx) is added
 * via the `vulopilot_report_exporter_sources` filter — same
 * discovery-by-filter shape as ReportTypeRegistry.
 *
 * @class       ReportExporterRegistry class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ReportExporterRegistry {

    /**
     * Instantiated exporters, keyed by their own get_format().
     *
     * @var array<string, ReportExporterInterface>
     */
    private array $exporters = array();

    /**
     * ReportExporterRegistry constructor.
     */
    public function __construct() {
        add_action( 'init', array( $this, 'register_exporters' ), 20 );
    }

    /**
     * @return void
     */
    public function register_exporters(): void {
        $exporter_classes = apply_filters( 'vulopilot_report_exporter_sources', $this->get_default_exporter_classes() );

        foreach ( $exporter_classes as $exporter_class ) {
            if ( ! is_string( $exporter_class ) || ! class_exists( $exporter_class ) ) {
                continue;
            }

            $exporter = new $exporter_class();

            if ( ! $exporter instanceof ReportExporterInterface ) {
                continue;
            }

            $this->exporters[ $exporter->get_format() ] = $exporter;
        }
    }

    /**
     * @return string[] Fully-qualified class names implementing ReportExporterInterface.
     */
    private function get_default_exporter_classes(): array {
        return array(
            Exporters\CsvExporter::class,
            Exporters\JsonExporter::class,
            Exporters\PdfExporter::class,
        );
    }

    /**
     * @param string $format A report format string, e.g. 'csv'.
     * @return ReportExporterInterface|null
     */
    public function get_exporter( string $format ): ?ReportExporterInterface {
        return $this->exporters[ $format ] ?? null;
    }

    /**
     * @return array<string, ReportExporterInterface>
     */
    public function get_all(): array {
        return $this->exporters;
    }
}
