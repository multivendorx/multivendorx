<?php
/**
 * ThemesScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags installed-but-inactive themes — the same dormant-code concern
 * PluginsScanner checks for plugins, applied to themes. The active theme
 * and, when present, its parent theme are excluded.
 *
 * @class       ThemesScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ThemesScanner extends AbstractBasicScanner {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'themes';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Themes', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_category(): string {
        return 'themes';
    }

    /**
     * @inheritDoc
     */
    public function scan(): array {
        $findings     = array();
        $active_theme = wp_get_theme();

        $in_use = array( $active_theme->get_stylesheet() );
        if ( $active_theme->parent() ) {
            $in_use[] = $active_theme->parent()->get_stylesheet();
        }

        foreach ( wp_get_themes() as $stylesheet => $theme ) {
            if ( in_array( $stylesheet, $in_use, true ) ) {
                continue;
            }

            $findings[] = new Finding(
                sprintf(
                    /* translators: %s is the theme name. */
                    __( 'Inactive theme installed: %s', 'vulopilot' ),
                    $theme->get( 'Name' )
                ),
                Severity::LOW,
                $this->get_category(),
                __( 'Inactive themes still occupy disk space and can carry known vulnerabilities. Remove themes you no longer use.', 'vulopilot' ),
                'theme',
                $stylesheet
            );
        }

        return $findings;
    }
}
