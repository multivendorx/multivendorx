<?php
/**
 * AiHistoryRepository class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Repositories;

defined( 'ABSPATH' ) || exit;

/**
 * Persistence for vulopilot_ai_history (DATABASE.md).
 *
 * @class       AiHistoryRepository class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class AiHistoryRepository extends AbstractRepository {

    /**
     * @var string[]
     */
    protected array $filterable_columns = array( 'provider' );

    /**
     * @inheritDoc
     */
    protected function get_table_key(): string {
        return 'ai_history';
    }
}
