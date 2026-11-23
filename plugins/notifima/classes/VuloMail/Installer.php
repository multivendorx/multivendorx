<?php
/**
 * Installer class file.
 *
 * @package Notifima
 */

namespace Notifima\VuloMail;

use Notifima\Integrations\PluginInstaller;

defined( 'ABSPATH' ) || exit;

/**
 * Silently installs and activates the "vulomail" WordPress.org plugin on an admin page load, if
 * it isn't already active. Same transport-only integration MultiVendorX uses
 * (`MultiVendorX\Integrations\VuloMailMigration`): Notifima's own WC_Email classes are
 * untouched -- once VuloMail has an active email connection configured, it transparently
 * intercepts every `wp_mail()` call site-wide (including `WC_Email::send()`'s), so Notifima's
 * emails deliver through VuloMail without any code here needing to call it directly.
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
            __( 'Notifima could not automatically install the VuloMail plugin needed to deliver its emails: %s. Please install and activate "VuloMail" manually from the Plugins screen.', 'notifima' ),
            $error_message
        );
    }
}
