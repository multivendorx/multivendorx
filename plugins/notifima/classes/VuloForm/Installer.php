<?php
/**
 * Installer class file.
 *
 * @package Notifima
 */

namespace Notifima\VuloForm;

use Notifima\FrontendScripts;
use Notifima\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Silently installs and activates the "vuloform" WordPress.org plugin on an admin page load,
 * if it isn't already active.
 */
class Installer {

    /**
     * Option recording that an install attempt was made, so a failure is not retried forever.
     */
    const ATTEMPTED_OPTION = 'notifima_vuloform_install_attempted';

    /**
     * Option holding the last install/activation failure message, if any.
     */
    const FAILURE_OPTION = 'notifima_vuloform_install_failed';

    /**
     * Installer constructor.
     */
    public function __construct() {
        add_action( 'admin_init', array( $this, 'maybe_install' ) );
        add_action( 'admin_notices', array( $this, 'installation_failed_notice' ) );
        add_action( 'admin_notices', array( $this, 'inactive_notice' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_deactivation_confirm_assets' ) );
        add_action( 'admin_footer-plugins.php', array( $this, 'print_deactivation_confirm_root' ) );
    }

    /**
     * Installs/activates VuloForm the first time, only. Deliberately does not force it back on
     * if a site owner later deactivates it -- `inactive_notice()` warns them instead.
     *
     * @return void
     */
    public function maybe_install() {
        if ( class_exists( '\VuloForm\VuloForm' ) ) {
            delete_option( self::FAILURE_OPTION );
            return;
        }

        // Already attempted once (installed, activated, or deliberately deactivated since) --
        // don't keep reinstalling/reactivating it out from under the site owner.
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
     * @return string Main plugin file (relative to the plugins dir) if VuloForm is already
     *                installed, whether active or not; '' otherwise.
     */
    private function installed_plugin_file() {
        require_once ABSPATH . 'wp-admin/includes/plugin.php';

        foreach ( array_keys( get_plugins() ) as $plugin_file ) {
            if ( 'vuloform.php' === basename( $plugin_file ) ) {
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
     * Downloads VuloForm from WordPress.org (slug "vuloform") and activates it.
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
                'slug'   => 'vuloform',
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
            $message = is_wp_error( $result ) ? $result->get_error_message() : __( 'VuloForm could not be installed.', 'notifima' );
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
                        __( 'Notifima could not automatically install the VuloForm plugin needed for subscription forms: %s. Please install and activate "VuloForm" manually from the Plugins screen.', 'notifima' ),
                        $message
                    )
                );
                ?>
            </p>
        </div>
        <?php
    }

    /**
     * Admin notice shown whenever VuloForm is installed but currently inactive (e.g. a site
     * owner deactivated it deliberately) -- the subscription form won't render on the frontend
     * without it.
     *
     * @return void
     */
    public function inactive_notice() {
        if ( class_exists( '\VuloForm\VuloForm' ) || ! $this->installed_plugin_file() ) {
            return;
        }

        if ( ! current_user_can( 'activate_plugins' ) ) {
            return;
        }
        ?>
        <div class="notice notice-warning is-dismissible">
            <p>
                <?php
                esc_html_e( 'VuloForm is deactivated. Notifima\'s subscription form will not render on the frontend until you reactivate it.', 'notifima' );
                ?>
            </p>
        </div>
        <?php
    }

    /**
     * On the Plugins screen, loads Notifima's own admin bundle (same one its settings page
     * uses) so the deactivation-confirm dialog can be a real zyra `PopupComponent`, not a
     * hand-rolled one.
     *
     * @return void
     */
    public function enqueue_deactivation_confirm_assets() {
        $plugin_file = $this->installed_plugin_file();
        $screen      = get_current_screen();

        if ( ! $screen || 'plugins' !== $screen->id || ! class_exists( '\VuloForm\VuloForm' ) || ! $plugin_file || ! current_user_can( 'activate_plugins' ) ) {
            return;
        }

        FrontendScripts::enqueue_admin_bundle();

        wp_localize_script(
            'notifima-admin-script',
            'vuloformDeactivateLocalizer',
            array(
                'plugin_file' => $plugin_file,
                'title'       => __( 'Before you deactivate VuloForm, please note:', 'notifima' ),
                'description' => __( 'The back-in-stock subscription form on your out-of-stock product pages is powered by VuloForm. If you deactivate it, this form will no longer be displayed, and customers will not be able to subscribe to back-in-stock notifications.', 'notifima' ),
                'question'    => __( 'Do you still want to proceed with deactivating VuloForm?', 'notifima' ),
                'cancel'      => __( 'Cancel', 'notifima' ),
                'confirm'     => __( 'Deactivate anyway', 'notifima' ),
            )
        );
    }

    /**
     * Prints the mount point `src/index.tsx` renders the deactivation-confirm popup into.
     *
     * @return void
     */
    public function print_deactivation_confirm_root() {
        if ( ! wp_script_is( 'notifima-admin-script', 'enqueued' ) ) {
            return;
        }

        echo '<div id="notifima-vuloform-deactivate-root"></div>';
    }
}
