<?php
/**
 * ScanResult file.
 *
 * @package VuloPilotCore
 */

namespace VuloPilotCore\ValueObjects;

/**
 * The outcome of running a single ScannerInterface — fired as
 * `do_action('vulopilot_scan_completed', $result)` by Scanners\ScanRunner.
 *
 * @class       ScanResult class
 * @version     1.0.0
 * @author      MultiVendorX
 */
final class ScanResult {

    const STATUS_COMPLETED = 'completed';
    const STATUS_FAILED    = 'failed';

    /**
     * @var string
     */
    private string $scanner_id;

    /**
     * @var string One of STATUS_COMPLETED/STATUS_FAILED.
     */
    private string $status;

    /**
     * @var Finding[]
     */
    private array $findings;

    /**
     * @var float
     */
    private float $duration_ms;

    /**
     * @var string|null
     */
    private ?string $error_message;

    /**
     * @param string      $scanner_id    Scanner that produced this result.
     * @param string      $status        One of STATUS_COMPLETED/STATUS_FAILED.
     * @param Finding[]   $findings      Findings produced by the scan.
     * @param float       $duration_ms   How long the scan took.
     * @param string|null $error_message Set when $status is STATUS_FAILED.
     */
    public function __construct(
        string $scanner_id,
        string $status,
        array $findings,
        float $duration_ms,
        ?string $error_message = null
    ) {
        $this->scanner_id    = $scanner_id;
        $this->status        = $status;
        $this->findings      = $findings;
        $this->duration_ms   = $duration_ms;
        $this->error_message = $error_message;
    }

    /**
     * @return string
     */
    public function get_scanner_id(): string {
        return $this->scanner_id;
    }

    /**
     * @return string
     */
    public function get_status(): string {
        return $this->status;
    }

    /**
     * @return float
     */
    public function get_duration_ms(): float {
        return $this->duration_ms;
    }

    /**
     * @return string|null
     */
    public function get_error_message(): ?string {
        return $this->error_message;
    }

    /**
     * @return Finding[]
     */
    public function get_findings(): array {
        return $this->findings;
    }

    /**
     * Counts by severity/category, computed on demand rather than stored.
     *
     * @return array{by_severity: array<string, int>, by_category: array<string, int>, total: int}
     */
    public function get_summary(): array {
        $by_severity = array();
        $by_category = array();

        foreach ( $this->findings as $finding ) {
            $severity = $finding->get_severity();
            $category = $finding->get_category();

            $by_severity[ $severity ] = ( $by_severity[ $severity ] ?? 0 ) + 1;
            $by_category[ $category ] = ( $by_category[ $category ] ?? 0 ) + 1;
        }

        return array(
            'by_severity' => $by_severity,
            'by_category' => $by_category,
            'total'       => count( $this->findings ),
        );
    }
}
