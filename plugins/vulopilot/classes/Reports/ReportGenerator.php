<?php
/**
 * ReportGenerator class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Reports;

use VuloPilot\Repositories\ReportRepository;
use VuloPilot\Utill;
use VuloPilotCore\Contracts\Report\ReportTypeInterface;

defined( 'ABSPATH' ) || exit;

/**
 * Orchestrates one report generation end to end: resolves the requested
 * report type (or builds Types\CustomReport on the fly for 'custom'),
 * generates its ReportResult, hands it to the requested exporter, writes
 * the file under wp-content/uploads/vulopilot-reports/, and updates the
 * `vulopilot_reports` row's status/file_path/meta. What Controllers\Reports's
 * create_item() and Reports\ScheduledReportRunner both call into — kept out
 * of the controller so it stays thin (ARCHITECTURE.md's Services/ layer
 * convention: "Orchestration layer REST controllers call into").
 *
 * Runs synchronously (no queue — root CLAUDE.md's "Out of scope"): every
 * report type here reads bounded, already-aggregated SQL (COUNT/GROUP BY,
 * capped top-N lists), not a per-row export of an unbounded table, so a
 * request-cycle generation stays fast (performance.md).
 *
 * @class       ReportGenerator class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ReportGenerator {

    /**
     * @var ReportTypeRegistry
     */
    private ReportTypeRegistry $report_types;

    /**
     * @var ReportExporterRegistry
     */
    private ReportExporterRegistry $exporters;

    /**
     * @var ReportRepository
     */
    private ReportRepository $reports;

    /**
     * @param ReportTypeRegistry     $report_types Registry to resolve a report_type id against.
     * @param ReportExporterRegistry $exporters    Registry to resolve a format against.
     * @param ReportRepository|null  $reports      Defaults to a new instance — injectable for tests.
     */
    public function __construct( ReportTypeRegistry $report_types, ReportExporterRegistry $exporters, ?ReportRepository $reports = null ) {
        $this->report_types = $report_types;
        $this->exporters    = $exporters;
        $this->reports      = $reports ?? new ReportRepository();
    }

    /**
     * Inserts a `generating`-status row, runs the generation, and updates
     * the row to `ready` (with file_path/meta) or `failed` (with the error
     * in meta) — never leaves a row permanently stuck at `generating`.
     *
     * @param string $report_type_id One of ReportTypeRegistry's ids, or 'custom'.
     * @param string $format         One of ReportExporterRegistry's ids, e.g. 'pdf'.
     * @param string $period_start   Y-m-d, inclusive.
     * @param string $period_end     Y-m-d, inclusive.
     * @param array  $params         Extra params — currently only 'included_types' (string[]), used when $report_type_id is 'custom'.
     * @param int    $generated_by   User id, or 0 for system-generated (scheduled reports).
     * @return int The `vulopilot_reports` row id.
     */
    public function generate( string $report_type_id, string $format, string $period_start, string $period_end, array $params = array(), int $generated_by = 0 ): int {
        $report_id = $this->reports->insert(
            array(
                'report_type'  => $report_type_id,
                'format'       => $format,
                'period_start' => $period_start,
                'period_end'   => $period_end,
                'status'       => 'generating',
                'generated_by' => $generated_by ?: null,
            )
        );

        try {
            $this->run( $report_id, $report_type_id, $format, $period_start, $period_end, $params );
        } catch ( \Throwable $exception ) {
            $this->reports->update(
                $report_id,
                array(
                    'status' => 'failed',
                    'meta'   => wp_json_encode( array( 'error' => $exception->getMessage() ) ),
                )
            );

            $this->maybe_log_debug( $exception, $report_id );
        }

        return $report_id;
    }

    /**
     * @param int    $report_id      The already-inserted `generating` row's id.
     * @param string $report_type_id One of ReportTypeRegistry's ids, or 'custom'.
     * @param string $format         One of ReportExporterRegistry's ids.
     * @param string $period_start   Y-m-d, inclusive.
     * @param string $period_end     Y-m-d, inclusive.
     * @param array  $params         Extra params, see generate().
     * @return void
     * @throws \InvalidArgumentException When $report_type_id or $format isn't registered.
     */
    private function run( int $report_id, string $report_type_id, string $format, string $period_start, string $period_end, array $params ): void {
        $report_type = $this->resolve_report_type( $report_type_id, $params );

        if ( ! $report_type ) {
            throw new \InvalidArgumentException( esc_html( sprintf( 'Unknown report type: %s', $report_type_id ) ) );
        }

        $exporter = $this->exporters->get_exporter( $format );

        if ( ! $exporter ) {
            throw new \InvalidArgumentException( esc_html( sprintf( 'Unknown report format: %s', $format ) ) );
        }

        $result = $report_type->generate( $period_start, $period_end );

        $directory = $this->get_reports_directory();
        wp_mkdir_p( $directory );

        $file_name = sprintf( '%s-%s-%d.%s', $report_type_id, gmdate( 'Ymd-His' ), $report_id, $format );

        $exporter->export( $result, trailingslashit( $directory ) . $file_name );

        $this->reports->update(
            $report_id,
            array(
                'status'    => 'ready',
                // Deliberately just the basename, never the full filesystem path
                // (DATABASE.md: "never a web-reachable URL returned directly") —
                // Controllers\Reports's download route resolves the directory
                // itself rather than trusting a client-visible path.
                'file_path' => $file_name,
                'meta'      => wp_json_encode(
                    array(
						'summary' => $result->get_summary(),
						'trend'   => $result->get_trend(),
						'params'  => $params,
                    )
                ),
            )
        );
    }

    /**
     * @param string $report_type_id One of ReportTypeRegistry's ids, or 'custom'.
     * @param array  $params         Extra params, see generate().
     * @return ReportTypeInterface|null
     */
    private function resolve_report_type( string $report_type_id, array $params ): ?ReportTypeInterface {
        if ( 'custom' === $report_type_id ) {
            $included_type_ids = array_map( 'sanitize_key', (array) ( $params['included_types'] ?? array() ) );

            return new Types\CustomReport( $this->report_types, $included_type_ids );
        }

        return $this->report_types->get_report_type( $report_type_id );
    }

    /**
     * @param string $file_name The basename stored in a `vulopilot_reports.file_path` column.
     * @return string Absolute filesystem path — only ever used server-side (e.g. the download route), never returned to a client.
     */
    public function resolve_file_path( string $file_name ): string {
        return trailingslashit( $this->get_reports_directory() ) . $file_name;
    }

    /**
     * @return string Absolute path to VuloPilot's own reports directory under wp-content/uploads.
     */
    private function get_reports_directory(): string {
        $upload_dir = wp_upload_dir();

        return trailingslashit( $upload_dir['basedir'] ) . 'vulopilot-reports';
    }

    /**
     * Settings screen's Advanced tab (`enable_debug_logging`, default off)
     * — a generation failure always gets recorded in the report row's own
     * `meta.error` regardless of this setting, but that's only visible if
     * an admin opens the Reports page; this additionally writes to the
     * server's own error log for anyone debugging via server logs/WP_DEBUG_LOG.
     *
     * @param \Throwable $exception The failure that made generate() fail.
     * @param int        $report_id The report row this failure belongs to.
     * @return void
     */
    private function maybe_log_debug( \Throwable $exception, int $report_id ): void {
        $settings = wp_parse_args( get_option( Utill::VULOPILOT_SETTINGS_KEY, array() ), Utill::VULOPILOT_SETTINGS_DEFAULTS );

        if ( empty( $settings['enable_debug_logging'] ) ) {
            return;
        }

        // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- gated behind an explicit, opt-in admin setting (Advanced tab), not left on by default.
        error_log( sprintf( '[VuloPilot] Report #%d generation failed: %s', $report_id, $exception->getMessage() ) );
    }
}
