<?php
/**
 * Integration class file.
 *
 * @package Notifima
 */

namespace Notifima\Integrations\VuloForm;

use Notifima\FrontendScripts;
use Notifima\Integrations\PluginInstaller;
use Notifima\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Wires VuloForm in as Notifima's subscription form builder, auto-creating the form from the
 * starter template on first use. Installs VuloForm via the shared `PluginInstaller`, plus its own
 * admin notices/deactivation-confirm UI. Resolves/auto-creates the form id and localizes the
 * install state for the Subscription Form Designer tab's `FormPreview`.
 */
class Integration {

    /**
     * @var PluginInstaller
     */
    private $installer;

    /**
     * Integration constructor.
     */
    public function __construct() {
        $this->installer = new PluginInstaller(
            'vuloform',
            '\VuloForm\VuloForm',
            static function ( $error_message ) {
                return sprintf(
                    /* translators: %s: error message. */
                    __( 'Notifima could not automatically install the VuloForm plugin needed for subscription forms: %s. Please install and activate "VuloForm" manually from the Plugins screen.', 'notifima' ),
                    $error_message
                );
            }
        );
        new Templates();

        add_filter( 'notifima_subscribe_form_localize_data', array( $this, 'localize_data' ) );
        add_action( 'admin_notices', array( $this, 'inactive_notice' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_deactivation_confirm_assets' ) );
        add_action( 'admin_footer-plugins.php', array( $this, 'print_deactivation_confirm_root' ) );
    }

    /**
     * Admin notice shown whenever VuloForm is installed but currently inactive (e.g. a site
     * owner deactivated it deliberately) -- the subscription form won't render on the frontend
     * without it.
     *
     * @return void
     */
    public function inactive_notice() {
        if ( $this->installer->is_installed() || ! $this->installer->installed_plugin_file() ) {
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
        $plugin_file = $this->installer->installed_plugin_file();
        $screen      = get_current_screen();

        if ( ! $screen || 'plugins' !== $screen->id || ! $this->installer->is_installed() || ! $plugin_file || ! current_user_can( 'activate_plugins' ) ) {
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

    /**
     * @param array $data Data already localized to the `subscription` object.
     * @return array
     */
    public function localize_data( $data ) {
        $data['vuloform_form_id']        = (int) Notifima()->setting->get_setting( 'vuloform_subscription_form_id', 0 );
        $data['vuloform_rest_namespace'] = 'vuloform/v1';

        return $data;
    }

    /**
     * The install-state/form-id data the Subscription Form Designer settings tab's `FormPreview`
     * needs, localized into `appLocalizer` rather than fetched over REST.
     *
     * @return array {installed, plugin_url, can_activate, form_id}
     */
    public static function get_admin_localize_data() {
        // "Installed" (active) means VuloForm's classes autoload -- they only do while active.
        $installed = class_exists( '\VuloForm\VuloForm' );

        if ( $installed ) {
            return array(
                'installed'    => true,
                'plugin_url'   => '',
                'can_activate' => false,
                'form_id'      => self::resolve_form_id(),
            );
        }

        if ( ! function_exists( 'is_plugin_active' ) ) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        $plugin_file   = 'vuloform/vuloform.php';
        $file_present  = file_exists( WP_PLUGIN_DIR . '/' . $plugin_file );

        return array(
            'installed'    => false,
            'plugin_url'   => $file_present
                ? wp_nonce_url( self_admin_url( 'plugins.php?action=activate&plugin=' . $plugin_file ), 'activate-plugin_' . $plugin_file )
                : admin_url( 'plugin-install.php?s=VuloForm&tab=search&type=term' ),
            'can_activate' => $file_present,
            'form_id'      => 0,
        );
    }

    /**
     * The form to use: the one already configured, or a freshly created one from the starter
     * template.
     *
     * @return int 0 on failure.
     */
    private static function resolve_form_id() {
        $stored_id = (int) Notifima()->setting->get_setting( 'vuloform_subscription_form_id', 0 );

        if ( $stored_id && vuloform_get_form( $stored_id ) ) {
            return $stored_id;
        }

        return self::create_default_form();
    }

    /**
     * @return int 0 when VuloForm's template classes aren't available or creation failed.
     */
    private static function create_default_form() {
        if ( ! class_exists( '\VuloForm\Forms\Templates' ) ) {
            return 0;
        }

        $templates = \VuloForm\Forms\Templates::all();

        if ( ! isset( $templates['notifima_back_in_stock'] ) ) {
            return 0;
        }

        $form_id = (int) VuloForm()->forms->create(
            $templates['notifima_back_in_stock']['title'],
            $templates['notifima_back_in_stock']['schema'],
            'published'
        );

        if ( $form_id ) {
            // Explicit option key -- Setting::get_option_key() can't find one for a key saved
            // for the first time.
            Notifima()->setting->update_setting(
                'vuloform_subscription_form_id',
                $form_id,
                Utill::NOTIFIMA_SETTINGS['subscription-form-designer']
            );
        }

        return $form_id;
    }
}
