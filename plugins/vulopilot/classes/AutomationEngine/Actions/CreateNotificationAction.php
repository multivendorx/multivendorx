<?php
/**
 * CreateNotificationAction class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AutomationEngine\Actions;

use VuloPilotCore\Contracts\Automation\ActionInterface;
use VuloPilotCore\ValueObjects\AutomationRunResult;
use VuloPilotCore\ValueObjects\Recommendation;
use VuloPilotCore\ValueObjects\Severity;
use VuloPilot\Repositories\ActivityLogRepository;

defined( 'ABSPATH' ) || exit;

/**
 * Surfaces a recommendation as an in-app notice via the existing
 * ActivityLogRepository — the same mechanism ScanPersistenceListener and
 * AIActions\ActionRunner already log through, reused rather than a second
 * notifications table (ARCHITECTURE.md describes a richer future
 * Notifications/ subsystem; until that exists, the activity log already
 * is this codebase's "surface something to the store owner" mechanism).
 *
 * @class       CreateNotificationAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class CreateNotificationAction implements ActionInterface {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'create-notification';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Create an in-app notification', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function execute( Recommendation $recommendation, array $config ): AutomationRunResult {
        $activity_logs = new ActivityLogRepository();

        $activity_logs->log(
            'automation.recommendation_notified',
            $recommendation->get_title(),
            Severity::INFO,
            'system',
            'recommendation',
            $recommendation->get_object_ref()
        );

        return new AutomationRunResult( true, $this->get_id(), __( 'Notification logged.', 'vulopilot' ) );
    }
}
