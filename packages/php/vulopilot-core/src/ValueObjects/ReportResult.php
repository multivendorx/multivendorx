<?php
/**
 * ReportResult file.
 *
 * @package VuloPilotCore
 */

namespace VuloPilotCore\ValueObjects;

/**
 * The output of a single Contracts\Report\ReportTypeInterface::generate()
 * call — what Reports\ReportGenerator hands to a
 * Contracts\Report\ReportExporterInterface to render into a file, and what
 * gets JSON-encoded into `vulopilot_reports.meta` for provenance.
 *
 * @class       ReportResult class
 * @version     1.0.0
 * @author      MultiVendorX
 */
final class ReportResult {

    /**
     * @var string
     */
    private string $report_type;

    /**
     * @var string
     */
    private string $label;

    /**
     * @var string Y-m-d.
     */
    private string $period_start;

    /**
     * @var string Y-m-d.
     */
    private string $period_end;

    /**
     * @var array<string, int|float|string> Headline metrics shown at the top of the report.
     */
    private array $summary;

    /**
     * @var array<string, array<int, array<string, mixed>>> Section id => rows.
     */
    private array $sections;

    /**
     * @var array<string, array{current: int|float, previous: int|float, change_percent: float|null}>
     */
    private array $trend;

    /**
     * @param string                                                                             $report_type  The generating ReportTypeInterface's own get_id().
     * @param string                                                                              $label        Human-readable report title.
     * @param string                                                                              $period_start Y-m-d.
     * @param string                                                                              $period_end   Y-m-d.
     * @param array<string, int|float|string>                                                    $summary      Headline metrics.
     * @param array<string, array<int, array<string, mixed>>>                                     $sections     Section id => rows.
     * @param array<string, array{current: int|float, previous: int|float, change_percent: float|null}> $trend  Metric id => current/previous/change_percent, vs. the immediately preceding period of equal length.
     */
    public function __construct(
        string $report_type,
        string $label,
        string $period_start,
        string $period_end,
        array $summary,
        array $sections,
        array $trend = array()
    ) {
        $this->report_type  = $report_type;
        $this->label        = $label;
        $this->period_start = $period_start;
        $this->period_end   = $period_end;
        $this->summary      = $summary;
        $this->sections     = $sections;
        $this->trend        = $trend;
    }

    /**
     * @return string
     */
    public function get_report_type(): string {
        return $this->report_type;
    }

    /**
     * @return string
     */
    public function get_label(): string {
        return $this->label;
    }

    /**
     * @return string
     */
    public function get_period_start(): string {
        return $this->period_start;
    }

    /**
     * @return string
     */
    public function get_period_end(): string {
        return $this->period_end;
    }

    /**
     * @return array<string, int|float|string>
     */
    public function get_summary(): array {
        return $this->summary;
    }

    /**
     * @return array<string, array<int, array<string, mixed>>>
     */
    public function get_sections(): array {
        return $this->sections;
    }

    /**
     * @return array<string, array{current: int|float, previous: int|float, change_percent: float|null}>
     */
    public function get_trend(): array {
        return $this->trend;
    }

    /**
     * @return array<string, mixed>
     */
    public function to_array(): array {
        return array(
            'report_type'  => $this->report_type,
            'label'        => $this->label,
            'period_start' => $this->period_start,
            'period_end'   => $this->period_end,
            'summary'      => $this->summary,
            'sections'     => $this->sections,
            'trend'        => $this->trend,
        );
    }
}
