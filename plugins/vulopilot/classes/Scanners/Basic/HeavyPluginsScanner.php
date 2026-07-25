<?php
/**
 * HeavyPluginsScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilot\ValueObjects\Finding;
use VuloPilot\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags a high total active-plugin count — a simple, defensible, O(1)
 * heuristic (get_option('active_plugins') is already loaded on every
 * request) rather than measuring each active plugin's on-disk size or
 * asset count, which would mean walking every plugin's directory on
 * every scan and would violate the bounded-work discipline every other
 * scanner here follows (performance.md).
 *
 * @class       HeavyPluginsScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class HeavyPluginsScanner extends AbstractBasicScanner {

    /**
     * Active plugin count above which this is worth flagging.
     */
    private const ACTIVE_PLUGIN_THRESHOLD = 40;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'heavy-plugins';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Heavy Plugins', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_category(): string {
        return 'performance';
    }

    /**
     * @inheritDoc
     */
    public function scan(): array {
        $active_plugins = (array) get_option( 'active_plugins', array() );
        $plugin_count   = count( $active_plugins );

        if ( $plugin_count <= self::ACTIVE_PLUGIN_THRESHOLD ) {
            return array();
        }

        return array(
            new Finding(
                sprintf(
                    /* translators: %d is the number of active plugins. */
                    __( '%d active plugins', 'vulopilot' ),
                    $plugin_count
                ),
                Severity::LOW,
                $this->get_category(),
                __( 'A large number of active plugins increases the odds of conflicts and can slow down every admin and frontend request.', 'vulopilot' ),
                'table',
                'active_plugins',
                array( 'plugin_count' => $plugin_count )
            ),
        );
    }
}
