<?php
/**
 * ScanRunner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners;

use VuloPilotCore\ValueObjects\ScanResult;

defined( 'ABSPATH' ) || exit;

/**
 * VuloPilot ScanRunner class.
 *
 * Orchestrates running one, several, or all registered scanners and wraps
 * each outcome in a ScanResult — timing and failure handling live here,
 * not in individual scanners (see ScannerInterface::scan()'s docblock),
 * so a scanner author never has to write their own try/catch/timer
 * boilerplate.
 *
 * Deliberately does not persist results itself. Writing a ScanResult into
 * vulopilot_scans/vulopilot_scan_findings is the Repositories/Services
 * layer's job (a separate, not-yet-built pass — see ARCHITECTURE.md) —
 * ScanRunner only fires `vulopilot_scan_completed` with the ScanResult,
 * so that layer (or an automation action, or anything else) can react
 * without ScanRunner needing to know it exists.
 *
 * @class       ScanRunner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ScanRunner {

    /**
     * @var ScannerRegistry
     */
    private ScannerRegistry $registry;

    /**
     * @param ScannerRegistry $registry Registry to pull scanners from.
     */
    public function __construct( ScannerRegistry $registry ) {
        $this->registry = $registry;
    }

    /**
     * Runs a single scanner by id.
     *
     * @param string $scanner_id A scanner's get_id().
     * @return ScanResult|null Null if no scanner is registered under that id.
     */
    public function run( string $scanner_id ): ?ScanResult {
        $scanner = $this->registry->get_scanner( $scanner_id );

        if ( ! $scanner ) {
            return null;
        }

        $started_at = microtime( true );

        try {
            $findings = $scanner->scan();
            $result   = new ScanResult(
                $scanner_id,
                ScanResult::STATUS_COMPLETED,
                $findings,
                ( microtime( true ) - $started_at ) * 1000
            );
        } catch ( \Throwable $exception ) {
            $result = new ScanResult(
                $scanner_id,
                ScanResult::STATUS_FAILED,
                array(),
                ( microtime( true ) - $started_at ) * 1000,
                $exception->getMessage()
            );
        }

        do_action( 'vulopilot_scan_completed', $result );

        return $result;
    }

    /**
     * Runs every registered scanner.
     *
     * @return array<string, ScanResult> Keyed by scanner id.
     */
    public function run_all(): array {
        $results = array();

        foreach ( array_keys( $this->registry->get_all_scanners() ) as $scanner_id ) {
            $results[ $scanner_id ] = $this->run( $scanner_id );
        }

        return $results;
    }

    /**
     * Runs every scanner registered under a given category.
     *
     * @param string $category e.g. 'seo', 'security'.
     * @return array<string, ScanResult> Keyed by scanner id.
     */
    public function run_category( string $category ): array {
        $results = array();

        foreach ( $this->registry->get_scanners_by_category( $category ) as $scanner_id => $scanner ) {
            $results[ $scanner_id ] = $this->run( $scanner_id );
        }

        return $results;
    }
}
