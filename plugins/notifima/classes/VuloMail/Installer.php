<?php
/**
 * Installer class file.
 *
 * @package Notifima
 */

namespace Notifima\VuloMail;

use Notifima\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Silently installs and activates the "vulomail" WordPress.org plugin on an admin page load, if
 * it isn't already active. Same transport-only integration MultiVendorX uses
 * (`MultiVendorX\Integrations\VuloMailMigration`): Notifima's own WC_Email classes are
 * untouched -- once VuloMail has an active email connection configured, it transparently
 * intercepts every `wp_mail()` call site-wide (including `WC_Email::send()`'s), so Notifima's
 * emails deliver through VuloMail without any code here needing to call it directly.
 */
class Installer {

    /**
     * Option recording that an install attempt was made, so a failure is not retried forever.
     */
    const ATTEMPTED_OPTION = 'notifima_vulomail_install_attempted';

    /**
     * Option holding the last install/activation failure message, if any.
     */
    const FAILURE_OPTION = 'notifima_vulomail_install_failed';

    /**
     * Installer constructor.
     */
    public function __construct() {
        add_action( 'admin_init', array( $this, 'maybe_install' ) );
        add_action( 'admin_notices', array( $this, 'installation_failed_notice' ) );
    }

    /**
     * Installs/activates VuloMail the first time, only. Deliberately does not force it back on
     * if a site owner later deactivates it.
     *
     * @return void
     */
    public function maybe_install() {
        if ( class_exists( '\VuloMail\VuloMail' ) ) {
            delete_option( self::FAILURE_OPTION );
            return;
        }

        if ( get_option( self::ATTEMPTED_OPTION ) ) {
            return;
        }

        if ( ! current_user_can( 'install_plugins' ) || ! current_user_can( 'activate_plugins' ) ) {
            return;
        }

        update_option( self::ATTEMPTED_OPTION, time() );

        $plugin_file = $this->installed_plugin_file();

        if ( $plugin_file ) {
            $this->activate( $plugin_file );
            return;
        }

        $this->install_and_activate();
    }

    /**
     * @return string Main plugin file (relative to the plugins dir) if VuloMail is already
     *                installed, whether active or not; '' otherwise.
     */
    private function installed_plugin_file() {
        require_once ABSPATH . 'wp-admin/includes/plugin.php';

        foreach ( array_keys( get_plugins() ) as $plugin_file ) {
            if ( 'vulomail.php' === basename( $plugin_file ) ) {
                return $plugin_file;
            }
        }

        return '';
    }

    /**
     * @param string $plugin_file Main plugin file, relative to the plugins dir.
     * @return void
     */
    private function activate( $plugin_file ) {
        $activated = activate_plugin( $plugin_file );

        if ( is_wp_error( $activated ) ) {
            update_option( self::FAILURE_OPTION, $activated->get_error_message() );
            Utill::log( $activated );
            return;
        }

        delete_option( self::FAILURE_OPTION );
    }

    /**
     * Downloads VuloMail from WordPress.org (slug "vulomail") and activates it.
     *
     * @return void
     */
    private function install_and_activate() {
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/plugin-install.php';
        require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';

        $api = plugins_api(
            'plugin_information',
            array(
                'slug'   => 'vulomail',
                'fields' => array( 'sections' => false ),
            )
        );

        if ( is_wp_error( $api ) ) {
            update_option( self::FAILURE_OPTION, $api->get_error_message() );
            Utill::log( $api );
            return;
        }

        $skin     = new \Automatic_Upgrader_Skin();
        $upgrader = new \Plugin_Upgrader( $skin );
        $result   = $upgrader->install( $api->download_link );

        if ( is_wp_error( $result ) || ! $result ) {
            $message = is_wp_error( $result ) ? $result->get_error_message() : __( 'VuloMail could not be installed.', 'notifima' );
            update_option( self::FAILURE_OPTION, $message );
            Utill::log( $result );
            return;
        }

        $plugin_file = $upgrader->plugin_info();

        if ( $plugin_file ) {
            $this->activate( $plugin_file );
        }
    }

    /**
     * Admin notice shown only when the silent install/activation failed.
     *
     * @return void
     */
    public function installation_failed_notice() {
        $message = get_option( self::FAILURE_OPTION );

        if ( ! $message || ! current_user_can( 'install_plugins' ) ) {
            return;
        }
        ?>
        <div class="notice notice-warning is-dismissible">
            <p>
                <?php
                echo esc_html(
                    sprintf(
                        /* translators: %s: error message. */
                        __( 'Notifima could not automatically install the VuloMail plugin needed to deliver its emails: %s. Please install and activate "VuloMail" manually from the Plugins screen.', 'notifima' ),
                        $message
                    )
                );
                ?>
            </p>
        </div>
        <?php
    }
}
