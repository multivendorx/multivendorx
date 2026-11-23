<?php
/**
 * Installer class file.
 *
 * @package CatalogX
 */

namespace CatalogX\VuloMail;

use CatalogX\Integrations\PluginInstaller;

defined( 'ABSPATH' ) || exit;

/**
 * Silently installs and activates the "vulomail" WordPress.org plugin on an admin page load,
 * if it isn't already active. Same pattern as `VuloForm\Installer`.
 */
class Installer extends PluginInstaller {

    /**
     * VuloMail's wordpress.org slug.
     *
     * @return string
     */
    protected function get_plugin_slug() {
        return 'vulomail';
    }

    /**
     * VuloMail's main class.
     *
     * @return string
     */
    protected function get_plugin_class() {
        return '\VuloMail\VuloMail';
    }

    /**
     * Translated failure notice text for VuloMail.
     *
     * @param string $error_message The install/activation failure message.
     * @return string
     */
    protected function get_failure_message( $error_message ) {
        return sprintf(
            /* translators: %s: error message. */
            __( 'CatalogX could not automatically install the VuloMail plugin needed for email templates: %s. Please install and activate "VuloMail" manually from the Plugins screen.', 'catalogx' ),
            $error_message
        );
    }
}
