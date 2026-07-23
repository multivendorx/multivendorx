<?php
/**
 * ReportExporterInterface file.
 *
 * @package VuloPilotCore
 */

namespace VuloPilotCore\Contracts\Report;

use VuloPilotCore\ValueObjects\ReportResult;

/**
 * Renders a generated ReportResult to a file in one specific format.
 * Free ships csv/json/pdf (Reports\Exporters\*); a premium/third-party
 * exporter (e.g. xlsx) registers via the `vulopilot_report_exporter_sources`
 * filter, same extension shape as every other *Interface in this package.
 *
 * @class       ReportExporterInterface interface
 * @version     1.0.0
 * @author      MultiVendorX
 */
interface ReportExporterInterface {

    /**
     * @return string Format id this exporter handles (matches `vulopilot_reports.format`), e.g. 'csv', 'json', 'pdf'.
     */
    public function get_format(): string;

    /**
     * Renders $result and writes it to $file_path. The caller (Reports\ReportGenerator)
     * owns deciding the destination path and its permission-checked download —
     * this only ever writes to the exact path it's given.
     *
     * @param ReportResult $result    The generated report data.
     * @param string       $file_path Absolute filesystem path to write to.
     * @return void
     */
    public function export( ReportResult $result, string $file_path ): void;
}
