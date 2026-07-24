<?php
/**
 * PluginsScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags plugins that are installed but not active. A dormant plugin still
 * carries its full code (and any known vulnerabilities in it) on disk and
 * is easy to lose track of — it just isn't loaded on every request, which
 * is a smaller, different concern from an active-but-outdated plugin
 * (that's UpdatesScanner's job).
 *
 * @class       PluginsScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class PluginsScanner extends AbstractBasicScanner {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'plugins';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Plugins', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_category(): string {
        return 'plugins';
    }

    /**
     * @inheritDoc
     */
    public function scan(): array {
        if ( ! function_exists( 'get_plugins' ) ) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        $findings       = array();
        $all_plugins    = get_plugins();
        $active_plugins = (array) get_option( 'active_plugins', array() );

        foreach ( $all_plugins as $plugin_file => $plugin_data ) {
            if ( in_array( $plugin_file, $active_plugins, true ) ) {
                continue;
            }

            $findings[] = new Finding(
                sprintf(
                    /* translators: %s is the plugin name. */
                    __( 'Inactive plugin installed: %s', 'vulopilot' ),
                    $plugin_data['Name']
                ),
                Severity::LOW,
                $this->get_category(),
                __( 'Inactive plugins still occupy disk space and can carry known vulnerabilities. Remove plugins you no longer use.', 'vulopilot' ),
                'plugin',
                $plugin_file
            );
        }

        return $findings;
    }
}
