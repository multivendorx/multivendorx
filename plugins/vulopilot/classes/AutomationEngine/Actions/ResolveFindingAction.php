<?php
/**
 * ResolveFindingAction class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AutomationEngine\Actions;

use VuloPilotCore\Contracts\Automation\ActionInterface;
use VuloPilotCore\ValueObjects\AutomationRunResult;
use VuloPilotCore\ValueObjects\Recommendation;
use VuloPilot\Repositories\FindingRepository;

defined( 'ABSPATH' ) || exit;

/**
 * Marks the specific Finding a Recommendation came from as 'resolved' —
 * appropriate for an automation whose real fix already happened another
 * way (e.g. a site owner fixed it manually and just wants VuloPilot's own
 * open-findings count to reflect that) rather than one that expects
 * VuloPilot itself to have made the change. Looked up by object_type +
 * object_ref rather than a finding id, because Recommendation carries
 * neither — RuleEngine generates recommendations from in-memory Findings
 * before ScanPersistenceListener has assigned them a row id (both are
 * separate `vulopilot_scan_completed` listeners; see RuleEngine's own
 * docblock).
 *
 * @class       ResolveFindingAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ResolveFindingAction implements ActionInterface {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'resolve-finding';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Mark the finding resolved', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function execute( Recommendation $recommendation, array $config ): AutomationRunResult {
        $object_type = $recommendation->get_object_type();
        $object_ref  = $recommendation->get_object_ref();

        if ( ! $object_type || ! $object_ref ) {
            return new AutomationRunResult( false, $this->get_id(), __( 'This recommendation is not tied to a specific object; nothing to resolve.', 'vulopilot' ) );
        }

        $findings   = new FindingRepository();
        $open_match = $findings->find_all(
            array(
                'object_type' => $object_type,
                'object_ref'  => $object_ref,
                'status'      => 'open',
                'per_page'    => 1,
            )
        );

        if ( empty( $open_match['data'] ) ) {
            return new AutomationRunResult( false, $this->get_id(), __( 'No matching open finding was found.', 'vulopilot' ) );
        }

        $finding_id = (int) $open_match['data'][0]['id'];

        $updated = $findings->update(
            $finding_id,
            array(
                'status'      => 'resolved',
                'resolved_at' => current_time( 'mysql', true ),
            )
        );

        return new AutomationRunResult(
            $updated,
            $this->get_id(),
            $updated
                ? sprintf(
                    /* translators: %d is the finding's own row id. */
                    __( 'Finding #%d marked resolved.', 'vulopilot' ),
                    $finding_id
                )
                : __( 'Could not update the finding.', 'vulopilot' )
        );
    }
}
