<?php
/**
 * Installer class file.
 *
 * @package Notifima
 */

namespace Notifima\VuloForm;

use Notifima\FrontendScripts;
use Notifima\Integrations\PluginInstaller;

defined( 'ABSPATH' ) || exit;

/**
 * Silently installs and activates the "vuloform" WordPress.org plugin on an admin page load,
 * if it isn't already active.
 */
class Installer extends PluginInstaller {

    /**
     * Installer constructor.
     */
    public function __construct() {
        parent::__construct();

        add_action( 'admin_notices', array( $this, 'inactive_notice' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_deactivation_confirm_assets' ) );
        add_action( 'admin_footer-plugins.php', array( $this, 'print_deactivation_confirm_root' ) );
    }

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
            __( 'Notifima could not automatically install the VuloForm plugin needed for subscription forms: %s. Please install and activate "VuloForm" manually from the Plugins screen.', 'notifima' ),
            $error_message
        );
    }

    /**
     * Admin notice shown whenever VuloForm is installed but currently inactive (e.g. a site
     * owner deactivated it deliberately) -- the subscription form won't render on the frontend
     * without it.
     *
     * @return void
     */
    public function inactive_notice() {
        if ( class_exists( $this->get_plugin_class() ) || ! $this->installed_plugin_file() ) {
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

        if ( ! $screen || 'plugins' !== $screen->id || ! class_exists( $this->get_plugin_class() ) || ! $plugin_file || ! current_user_can( 'activate_plugins' ) ) {
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
