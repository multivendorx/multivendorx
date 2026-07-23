<?php
/**
 * ActionRunRepository class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Repositories;

defined( 'ABSPATH' ) || exit;

/**
 * Persistence for vulopilot_ai_action_runs (see AI-ACTIONS.md) — the
 * record of one AIAction going through propose → approve/reject →
 * execute → rollback. `input`/`output`/`preview`/`snapshot` are stored as
 * JSON; AIActions\ActionRunner is the only code that encodes/decodes
 * them, this repository just persists strings.
 *
 * @class       ActionRunRepository class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ActionRunRepository extends AbstractRepository {

    /**
     * @var string[]
     */
    protected array $filterable_columns = array( 'action_id', 'status', 'object_type' );

    /**
     * @inheritDoc
     */
    protected function get_table_key(): string {
        return 'ai_action_run';
    }
}
