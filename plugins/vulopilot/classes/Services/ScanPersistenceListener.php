<?php
/**
 * ScanPersistenceListener class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Services;

use VuloPilotCore\ValueObjects\ScanResult;
use VuloPilotCore\ValueObjects\Severity;
use VuloPilot\Repositories\ActivityLogRepository;
use VuloPilot\Repositories\FindingRepository;
use VuloPilot\Repositories\ScanRepository;
use VuloPilot\Repositories\SiteHealthSnapshotRepository;

defined( 'ABSPATH' ) || exit;

/**
 * VuloPilot ScanPersistenceListener class.
 *
 * The first real occupant of the "Services" layer ARCHITECTURE.md
 * describes — self-hooks `vulopilot_scan_completed` (fired by
 * Scanners\ScanRunner, which deliberately never persists anything itself;
 * see its own docblock) and is the thing that turns a ScanResult into
 * real vulopilot_scans/vulopilot_scan_findings rows. Neither ScanRunner
 * nor RuleEngine has any idea this class exists — the hook is the only
 * coupling, same one-way-dependency shape used throughout.
 *
 * Also recalculates and upserts today's site-health snapshot after every
 * scan, so the dashboard's trend chart has something real to plot without
 * needing a separate scheduled job for it yet.
 *
 * @class       ScanPersistenceListener class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ScanPersistenceListener {

    private ScanRepository $scans;
    private FindingRepository $findings;
    private SiteHealthSnapshotRepository $snapshots;
    private ActivityLogRepository $activity_logs;

    /**
     * ScanPersistenceListener constructor.
     */
    public function __construct() {
        $this->scans         = new ScanRepository();
        $this->findings       = new FindingRepository();
        $this->snapshots      = new SiteHealthSnapshotRepository();
        $this->activity_logs = new ActivityLogRepository();

        add_action( 'vulopilot_scan_completed', array( $this, 'handle_scan_completed' ) );
    }

    /**
     * @param ScanResult $scan_result The completed scan.
     * @return void
     */
    public function handle_scan_completed( ScanResult $scan_result ): void {
        $scan_id = $this->scans->insert(
            array(
                'scanner_id'    => $scan_result->get_scanner_id(),
                'status'        => $scan_result->get_status(),
                'duration_ms'   => (int) $scan_result->get_duration_ms(),
                'summary'       => wp_json_encode( $scan_result->get_summary() ),
                'error_message' => $scan_result->get_error_message(),
                'started_at'    => current_time( 'mysql', true ),
                'finished_at'   => current_time( 'mysql', true ),
            )
        );

        foreach ( $scan_result->get_findings() as $finding ) {
            $this->findings->insert(
                array(
                    'scan_id'     => $scan_id,
                    'scanner_id'  => $scan_result->get_scanner_id(),
                    'severity'    => $finding->get_severity(),
                    'category'    => $finding->get_category(),
                    'title'       => $finding->get_title(),
                    'description' => $finding->get_description(),
                    'object_type' => $finding->get_object_type(),
                    'object_ref'  => $finding->get_object_ref(),
                    'meta'        => wp_json_encode( $finding->get_meta() ),
                )
            );
        }

        $this->activity_logs->log(
            'scan.completed',
            sprintf(
                /* translators: 1: scanner id, 2: number of findings. */
                __( 'Scan "%1$s" completed with %2$d finding(s).', 'vulopilot' ),
                $scan_result->get_scanner_id(),
                count( $scan_result->get_findings() )
            ),
            ScanResult::STATUS_FAILED === $scan_result->get_status() ? Severity::HIGH : Severity::INFO,
            'system',
            'scan',
            (string) $scan_id
        );

        $this->refresh_todays_snapshot();
    }

    /**
     * Recalculates today's overall health score from every currently
     * open finding (not just this scan's) and upserts it. The weighting
     * (critical costs the most, info costs nothing) is a deliberately
     * simple, documented heuristic — not presented as a precise formula.
     *
     * @return void
     */
    private function refresh_todays_snapshot(): void {
        $critical = $this->findings->count_by_severity( Severity::CRITICAL );
        $high     = $this->findings->count_by_severity( Severity::HIGH );
        $medium   = $this->findings->count_by_severity( Severity::MEDIUM );
        $low      = $this->findings->count_by_severity( Severity::LOW );

        $score = 100 - ( $critical * 15 ) - ( $high * 8 ) - ( $medium * 3 ) - ( $low * 1 );
        $score = max( 0, min( 100, $score ) );

        $this->snapshots->upsert_today( $score, $critical, $high, $medium, $low );
    }
}
