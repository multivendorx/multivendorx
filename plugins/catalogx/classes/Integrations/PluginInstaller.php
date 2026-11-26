<?php
/**
 * PluginInstaller class file.
 *
 * @package CatalogX
 */

namespace CatalogX\Integrations;

use CatalogX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Silently installs/activates a companion plugin (VuloMail, VuloForm) if it isn't already active.
 * One shared class for both -- construct with the plugin's slug/class/failure-message instead of
 * a per-plugin installer subclass.
 */
class PluginInstaller {

    /**
     * The companion's wordpress.org slug, e.g. 'vulomail'.
     *
     * @var string
     */
    private $plugin_slug;

    /**
     * The companion's fully-qualified main class, e.g. '\VuloMail\VuloMail'. Used as the "is it
     * active" check -- its classes only autoload while active.
     *
     * @var string
     */
    private $plugin_class;

    /**
     * Builds the translated failure notice text from an error message.
     *
     * @var callable
     */
    private $failure_message;

    /**
     * Option recording that an install attempt was made, so a failure is not retried forever.
     *
     * @return string
     */
    protected function get_attempted_option() {
        return 'catalogx_' . $this->plugin_slug . '_install_attempted';
    }

    /**
     * Option holding the last install/activation failure message, if any.
     *
     * @return string
     */
    protected function get_failure_option() {
        return 'catalogx_' . $this->plugin_slug . '_install_failed';
    }

    /**
     * PluginInstaller constructor.
     *
     * @param string   $plugin_slug     The companion's wordpress.org slug, e.g. 'vulomail'.
     * @param string   $plugin_class    The companion's fully-qualified main class, e.g. '\VuloMail\VuloMail'.
     * @param callable $failure_message Translated failure notice text builder: `function( string $error_message ): string`.
     */
    public function __construct( $plugin_slug, $plugin_class, callable $failure_message ) {
        $this->plugin_slug     = $plugin_slug;
        $this->plugin_class    = $plugin_class;
        $this->failure_message = $failure_message;

        add_action( 'admin_init', array( $this, 'maybe_install' ) );
        add_action( 'admin_notices', array( $this, 'installation_failed_notice' ) );
    }

    /**
     * Installs/activates the companion the first time, only. Deliberately does not force it
     * back on if a site owner later deactivates it.
     *
     * @return void
     */
    public function maybe_install() {
        if ( class_exists( $this->plugin_class ) ) {
            delete_option( $this->get_failure_option() );
            return;
        }

        if ( get_option( $this->get_attempted_option() ) ) {
            return;
        }

        if ( ! current_user_can( 'install_plugins' ) || ! current_user_can( 'activate_plugins' ) ) {
            return;
        }

        update_option( $this->get_attempted_option(), time() );

        $plugin_file = $this->installed_plugin_file();

        if ( $plugin_file ) {
            $this->activate( $plugin_file );
            return;
        }

        $this->install_and_activate();
    }

    /**
     * Main plugin file (relative to the plugins dir) if the companion is already installed,
     * whether active or not; '' otherwise.
     *
     * @return string
     */
    protected function installed_plugin_file() {
        require_once ABSPATH . 'wp-admin/includes/plugin.php';

        $main_file = $this->plugin_slug . '.php';

        foreach ( array_keys( get_plugins() ) as $plugin_file ) {
            if ( basename( $plugin_file ) === $main_file ) {
                return $plugin_file;
            }
        }

        return '';
    }

    /**
     * Activates the companion and clears any recorded failure once it succeeds.
     *
     * @param string $plugin_file Main plugin file, relative to the plugins dir.
     * @return void
     */
    protected function activate( $plugin_file ) {
        $activated = activate_plugin( $plugin_file );

        if ( is_wp_error( $activated ) ) {
            update_option( $this->get_failure_option(), $activated->get_error_message() );
            Utill::log( $activated );
            return;
        }

        delete_option( $this->get_failure_option() );
    }

    /**
     * Downloads the companion from WordPress.org and activates it.
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
                'slug'   => $this->plugin_slug,
                'fields' => array( 'sections' => false ),
            )
        );

        if ( is_wp_error( $api ) ) {
            update_option( $this->get_failure_option(), $api->get_error_message() );
            Utill::log( $api );
            return;
        }

        $skin     = new \Automatic_Upgrader_Skin();
        $upgrader = new \Plugin_Upgrader( $skin );
        $result   = $upgrader->install( $api->download_link );

        if ( is_wp_error( $result ) || ! $result ) {
            $message = is_wp_error( $result )
                ? $result->get_error_message()
                /* translators: %s: companion plugin slug, e.g. vulomail. */
                : sprintf( __( '%s could not be installed.', 'catalogx' ), $this->plugin_slug );

            update_option( $this->get_failure_option(), $message );
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
        $message = get_option( $this->get_failure_option() );

        if ( ! $message || ! current_user_can( 'install_plugins' ) ) {
            return;
        }
        ?>
        <div class="notice notice-warning is-dismissible">
            <p><?php echo esc_html( call_user_func( $this->failure_message, $message ) ); ?></p>
        </div>
        <?php
    }
}
