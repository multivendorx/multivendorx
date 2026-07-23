<?php
/**
 * RuleEngine class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\RuleEngine;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Recommendation;
use VuloPilotCore\ValueObjects\ScanResult;

defined( 'ABSPATH' ) || exit;

/**
 * VuloPilot RuleEngine class.
 *
 * Runs every registered rule's applies_to() against a batch of Findings
 * and collects the Recommendation each match produces, sorted by
 * priority (highest first) so the dashboard/AI Assistant can just take
 * the top of the list. One rule throwing doesn't stop the batch — same
 * defensive posture as Scanners\ScanRunner toward third-party code.
 *
 * Self-hooks `vulopilot_scan_completed` (fired by Scanners\ScanRunner) so
 * every scan automatically flows into recommendations without either
 * engine needing to know about the other directly — ScanRunner has no
 * idea RuleEngine exists; RuleEngine only knows about ScanResult, a
 * shared value object, not about ScanRunner itself.
 *
 * Deliberately does not persist recommendations — same reasoning as
 * ScanRunner not persisting ScanResults (see ScanRunner's docblock):
 * that's the Repositories/Services layer's job, a separate pass.
 * RuleEngine fires `vulopilot_recommendations_generated` so that layer
 * (or anything else) can react.
 *
 * @class       RuleEngine class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class RuleEngine {

    /**
     * @var RuleRegistry
     */
    private RuleRegistry $registry;

    /**
     * @param RuleRegistry $registry Registry to pull rules from.
     */
    public function __construct( RuleRegistry $registry ) {
        $this->registry = $registry;

        add_action( 'vulopilot_scan_completed', array( $this, 'handle_scan_completed' ) );
    }

    /**
     * Runs every registered rule against every Finding in a completed
     * scan. Failed scans (ScanResult::STATUS_FAILED) have no findings to
     * process and are ignored.
     *
     * @param ScanResult $scan_result The completed scan.
     * @return void
     */
    public function handle_scan_completed( ScanResult $scan_result ): void {
        if ( ScanResult::STATUS_COMPLETED !== $scan_result->get_status() ) {
            return;
        }

        $this->generate_recommendations( $scan_result->get_findings() );
    }

    /**
     * Runs every registered rule against a batch of Findings.
     *
     * @param Finding[] $findings Findings to evaluate.
     * @return Recommendation[] Sorted by priority, highest first.
     */
    public function generate_recommendations( array $findings ): array {
        $recommendations = array();

        foreach ( $findings as $finding ) {
            foreach ( $this->registry->get_all_rules() as $rule ) {
                try {
                    if ( ! $rule->applies_to( $finding ) ) {
                        continue;
                    }

                    $recommendations[] = $rule->get_recommendation( $finding );
                } catch ( \Throwable $exception ) {
                    continue;
                }
            }
        }

        usort(
            $recommendations,
            static fn( Recommendation $a, Recommendation $b ) => $b->get_priority() <=> $a->get_priority()
        );

        do_action( 'vulopilot_recommendations_generated', $recommendations, $findings );

        return $recommendations;
    }
}
