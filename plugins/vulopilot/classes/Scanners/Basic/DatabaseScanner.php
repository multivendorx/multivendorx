<?php
/**
 * DatabaseScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags excessive post-revision buildup — a classic, well-understood
 * WordPress database bloat source (every edit of every post/page keeps a
 * full revision row by default) that slows down post-list queries and
 * backups as it grows unbounded.
 *
 * @class       DatabaseScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class DatabaseScanner extends AbstractBasicScanner {

    /**
     * Revision count above which this is worth flagging.
     */
    private const REVISION_COUNT_THRESHOLD = 500;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'database';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Database', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_category(): string {
        return 'database';
    }

    /**
     * @inheritDoc
     */
    public function scan(): array {
        global $wpdb;

        $findings = array();

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $revision_count = (int) $wpdb->get_var(
            "SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'revision'"
        );

        if ( $revision_count > self::REVISION_COUNT_THRESHOLD ) {
            $findings[] = new Finding(
                sprintf(
                    /* translators: %s is the number of post revisions, formatted with thousands separators. */
                    __( '%s post revisions stored in the database', 'vulopilot' ),
                    number_format_i18n( $revision_count )
                ),
                Severity::LOW,
                $this->get_category(),
                __( 'A large number of stored revisions increases database size and can slow down post-list and search queries.', 'vulopilot' ),
                'table',
                $wpdb->posts,
                array( 'revision_count' => $revision_count )
            );
        }

        return $findings;
    }
}
