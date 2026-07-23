<?php
/**
 * ReportTypeInterface file.
 *
 * @package VuloPilotCore
 */

namespace VuloPilotCore\Contracts\Report;

use VuloPilotCore\ValueObjects\ReportResult;

/**
 * Every report type — Free's own (scan summary, SEO, WooCommerce, security,
 * accessibility, health, automation, AI usage, custom/report-builder) or a
 * premium/third-party one registered via the `vulopilot_report_type_sources`
 * filter — implements this so Reports\ReportTypeRegistry/ReportGenerator can
 * generate either kind without knowing which side authored it. Mirrors
 * Contracts\Scanner\ScannerInterface's extension shape (module-architecture.md's
 * "discovery-by-filter" pattern, applied here instead of a folder-scan).
 *
 * @class       ReportTypeInterface interface
 * @version     1.0.0
 * @author      MultiVendorX
 */
interface ReportTypeInterface {

    /**
     * @return string Unique, stable report type id (matches `vulopilot_reports.report_type`).
     */
    public function get_id(): string;

    /**
     * @return string Human-readable label.
     */
    public function get_label(): string;

    /**
     * Collects and aggregates this report's data for one period. Reads
     * whatever repositories/tables the concrete report type needs — the
     * contract itself stays storage-agnostic, same posture as
     * ScannerInterface::scan() returning Finding value objects rather than
     * exposing $wpdb.
     *
     * @param string $period_start Y-m-d, inclusive.
     * @param string $period_end   Y-m-d, inclusive.
     * @return ReportResult
     */
    public function generate( string $period_start, string $period_end ): ReportResult;
}
