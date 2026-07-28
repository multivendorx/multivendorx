<?php
/**
 * NotFoundLogRepository class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Repositories;

defined( 'ABSPATH' ) || exit;

/**
 * Persistence for vulopilot_not_found_logs — one row per unique missing
 * URL visitors actually hit, not one row per visit (Install.php's own
 * schema: `requested_path` is UNIQUE). log_or_increment() is the only way
 * rows are ever written to this table (Services\NotFoundLogger), keeping
 * the upsert-by-unique-key logic in one place rather than duplicated at
 * the call site.
 *
 * @class       NotFoundLogRepository class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class NotFoundLogRepository extends AbstractRepository {

    /**
     * Columns an incoming `search` arg is matched against.
     *
     * @var string[]
     */
    protected array $searchable_columns = array( 'requested_path' );

    /**
     * Utill::TABLES key this repository owns.
     *
     * @inheritDoc
     */
    protected function get_table_key(): string {
        return 'not_found_log';
    }

    /**
     * Looks up a 404 log row by its exact requested path.
     *
     * @param string $requested_path Already-normalized path (RedirectRepository::normalize_path()).
     * @return array<string, mixed>|null
     */
    public function find_by_requested_path( string $requested_path ): ?array {
        global $wpdb;

        $row = $wpdb->get_row(
            $wpdb->prepare( "SELECT * FROM {$this->get_table()} WHERE requested_path = %s", $requested_path ), // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            ARRAY_A
        );

        return $row ? $row : null;
    }

    /**
     * Records one 404 visit — inserts a new row for a path seen for the
     * first time, or bumps `hit_count`/`last_seen_at` on an existing one.
     * Deliberately not a raw `INSERT ... ON DUPLICATE KEY UPDATE` — this
     * only ever runs once per real 404 page load (Services\NotFoundLogger's
     * own template_redirect hook), nowhere near the request volume that
     * would make the extra find-then-write round trip a real concern, and
     * it keeps this class consistent with every other repository's
     * plain find()/insert()/update() calls rather than introducing the
     * only raw upsert statement in this codebase.
     *
     * @param string      $requested_path Already-normalized path.
     * @param string|null $referrer       The visit's HTTP referrer, if any.
     * @return void
     */
    public function log_or_increment( string $requested_path, ?string $referrer ): void {
        $existing = $this->find_by_requested_path( $requested_path );

        if ( $existing ) {
            $this->update(
                (int) $existing['id'],
                array(
                    'hit_count'    => (int) $existing['hit_count'] + 1,
                    'referrer'     => $referrer,
                    'last_seen_at' => current_time( 'mysql' ),
                )
            );

            return;
        }

        $this->insert(
            array(
                'requested_path' => $requested_path,
                'referrer'       => $referrer,
                'hit_count'      => 1,
                'last_seen_at'   => current_time( 'mysql' ),
            )
        );
    }
}
