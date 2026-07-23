<?php
/**
 * ActivityLogRepository class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Repositories;

defined( 'ABSPATH' ) || exit;

/**
 * Persistence for vulopilot_activity_logs (DATABASE.md).
 *
 * @class       ActivityLogRepository class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ActivityLogRepository extends AbstractRepository {

    /**
     * @var string[]
     */
    protected array $filterable_columns = array( 'actor_type', 'event_type' );

    /**
     * @inheritDoc
     */
    protected function get_table_key(): string {
        return 'activity_log';
    }

    /**
     * Records one activity log entry. A thin, descriptively-named wrapper
     * around insert() so call sites (ScanPersistenceListener and, later,
     * the Rule/Automation engines) read as "log this event" rather than a
     * bare array literal (naming-quality.md).
     *
     * @param string      $event_type e.g. 'scan.completed'.
     * @param string      $message    Human-readable description.
     * @param string      $severity   One of Severity's constants.
     * @param string      $actor_type 'user'|'system'|'automation'.
     * @param string|null $object_type What kind of thing this is about.
     * @param string|null $object_id   Identifies the specific object.
     * @return int The new row's id.
     */
    public function log( string $event_type, string $message, string $severity = 'info', string $actor_type = 'system', ?string $object_type = null, ?string $object_id = null ): int {
        return $this->insert(
            array(
                'event_type'  => $event_type,
                'message'     => $message,
                'severity'    => $severity,
                'actor_type'  => $actor_type,
                'object_type' => $object_type,
                'object_id'   => $object_id,
            )
        );
    }
}
