<?php
/**
 * UpdatesScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags any pending WordPress core, plugin, or theme update, using core's
 * own update-check APIs rather than re-implementing version comparison —
 * `get_core_updates()`, `get_plugin_updates()`, and `get_theme_updates()`
 * already do exactly this and are what the native Updates admin screen
 * itself calls.
 *
 * @class       UpdatesScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class UpdatesScanner extends AbstractBasicScanner {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'updates';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Updates', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_category(): string {
        return 'updates';
    }

    /**
     * @inheritDoc
     */
    public function scan(): array {
        if ( ! function_exists( 'get_core_updates' ) ) {
            require_once ABSPATH . 'wp-admin/includes/update.php';
        }

        $findings = array();

        $core_updates = get_core_updates();
        if ( is_array( $core_updates ) && isset( $core_updates[0]->response ) && 'upgrade' === $core_updates[0]->response ) {
            $findings[] = new Finding(
                sprintf(
                    /* translators: %s is the available WordPress core version. */
                    __( 'WordPress core update available (%s)', 'vulopilot' ),
                    $core_updates[0]->version
                ),
                Severity::HIGH,
                $this->get_category(),
                __( 'Running an outdated core version increases security risk and can cause plugin/theme compatibility issues.', 'vulopilot' ),
                'core',
                $core_updates[0]->version
            );
        }

        $plugin_updates = get_plugin_updates();
        foreach ( $plugin_updates as $plugin_file => $plugin_data ) {
            $findings[] = new Finding(
                sprintf(
                    /* translators: %s is the plugin name. */
                    __( 'Plugin update available: %s', 'vulopilot' ),
                    $plugin_data->Name
                ),
                Severity::MEDIUM,
                $this->get_category(),
                null,
                'plugin',
                $plugin_file
            );
        }

        $theme_updates = get_theme_updates();
        foreach ( $theme_updates as $stylesheet => $theme ) {
            $findings[] = new Finding(
                sprintf(
                    /* translators: %s is the theme name. */
                    __( 'Theme update available: %s', 'vulopilot' ),
                    $theme->get( 'Name' )
                ),
                Severity::MEDIUM,
                $this->get_category(),
                null,
                'theme',
                $stylesheet
            );
        }

        return $findings;
    }
}
