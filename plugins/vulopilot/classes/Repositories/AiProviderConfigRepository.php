<?php
/**
 * AiProviderConfigRepository class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Repositories;

defined( 'ABSPATH' ) || exit;

/**
 * Persistence for vulopilot_ai_provider_configs (DATABASE.md). The
 * `credentials` column is always the encrypted form (Services\CredentialEncryption)
 * — this repository never decrypts; that's ProviderRegistry's job, at the
 * one point a raw key is actually needed (building an adapter instance).
 *
 * @class       AiProviderConfigRepository class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class AiProviderConfigRepository extends AbstractRepository {

    /**
     * @var string[]
     */
    protected array $filterable_columns = array( 'provider', 'is_active' );

    /**
     * @inheritDoc
     */
    protected function get_table_key(): string {
        return 'ai_provider_config';
    }

    /**
     * @param string $provider e.g. 'openai'.
     * @return array<string, mixed>|null
     */
    public function find_by_provider( string $provider ): ?array {
        global $wpdb;

        $row = $wpdb->get_row(
            $wpdb->prepare( "SELECT * FROM {$this->get_table()} WHERE provider = %s", $provider ), // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            ARRAY_A
        );

        return $row ?: null;
    }
}
