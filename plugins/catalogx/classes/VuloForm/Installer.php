<?php
/**
 * Installer class file.
 *
 * @package CatalogX
 */

namespace CatalogX\VuloForm;

use CatalogX\Integrations\PluginInstaller;

defined( 'ABSPATH' ) || exit;

/**
 * Silently installs and activates the "vuloform" WordPress.org plugin on an admin page load,
 * if it isn't already active.
 */
class Installer extends PluginInstaller {

    /**
     * VuloForm's wordpress.org slug.
     *
     * @return string
     */
    protected function get_plugin_slug() {
        return 'vuloform';
    }

    /**
     * VuloForm's main class.
     *
     * @return string
     */
    protected function get_plugin_class() {
        return '\VuloForm\VuloForm';
    }

    /**
     * Translated failure notice text for VuloForm.
     *
     * @param string $error_message The install/activation failure message.
     * @return string
     */
    protected function get_failure_message( $error_message ) {
        return sprintf(
            /* translators: %s: error message. */
            __( 'CatalogX could not automatically install the VuloForm plugin needed for its forms: %s. Please install and activate "VuloForm" manually from the Plugins screen.', 'catalogx' ),
            $error_message
        );
    }
}
