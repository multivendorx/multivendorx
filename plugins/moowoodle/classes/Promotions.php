<?php

namespace MooWoodle;

defined( 'ABSPATH' ) || exit;
/**
 *
 * @version     3.4.0
 * @package     DualCube
 */
class Promotions {

    private string $pro_upgrade_url;
    public function __construct() {
        $this->pro_upgrade_url = MOOWOODLE_PRO_SHOP_URL;
        add_action( 'admin_notices', array( $this, 'display_unsupported_extension_notice' ) );
        add_action( 'admin_notices', array( $this, 'display_vulomail_promotion_notice' ) );
        add_action( 'wp_ajax_moowoodle_admin_notice_action', array( $this, 'dismiss_vulomail_notice' ) );
        add_filter( 'moowoodle_admin_scripts', array( $this, 'register_notice_script' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_notice_script' ) );
    }

    /**
     * Display the VuloMail promotion to administrators who have not activated it.
     *
     * This notice is independent of the MooWoodle Pro license state.
     *
     * @return void
     */
    public function display_vulomail_promotion_notice() {
        if ( $this->is_vulomail_active() || ! $this->should_display_vulomail_notice() ) {
            return;
        }

        $install_url = wp_nonce_url( self_admin_url( 'update.php?action=install-plugin&plugin=vulomail' ), 'install-plugin_vulomail' );
        ?>
        <div class="notice notice-info is-dismissible moowoodle-vulomail-notice" >
            <h2><?php esc_html_e( 'Track enrollment emails with VuloMail', 'moowoodle' ); ?></h2>

            <p>
                <?php esc_html_e( 'See which enrollment emails were sent to students and quickly identify emails that failed to send.', 'moowoodle' ); ?>
            </p>

            <p>
                <a class="button button-secondary" href="<?php echo esc_url( $install_url ); ?>">
                    <?php esc_html_e( 'Install VuloMail', 'moowoodle' ); ?>
                </a>

                <a href="<?php echo esc_url( 'https://vulomail.com/' ); ?>" target="_blank" rel="noopener noreferrer">
                    <?php esc_html_e( 'Learn more', 'moowoodle' ); ?>
                </a>
            </p>
        </div>
        <?php
    }
    /**
     * Save the VuloMail notice dismissal timestamp.
     *
     * @return void
     */
    public function dismiss_vulomail_notice() {
        check_ajax_referer( 'dismiss_vulomail_notice', 'nonce' );

        update_option( Util::MOOWOODLE_OTHER_SETTINGS['vulomail_notice'], time(), false );

        wp_send_json_success();
    }

        /**
     * Register the admin-notice dismiss/action handling script.
     *
     * @param array $scripts Existing admin scripts.
     * @return array
     */
    public function register_notice_script( $scripts ) {
        $scripts['moowoodle-admin-notices'] = array(
            'src'  => FrontendScripts::get_asset_path() . 'js/public/' . MOOWOODLE_PLUGIN_SLUG . '-admin-notices.min.js',
            'deps' => array( 'jquery' ),
        );
        return $scripts;
    }

    /**
     * Enqueue the admin-notice dismiss/action handling script.
     */
    public function enqueue_notice_script() {
        FrontendScripts::enqueue_script( 'moowoodle-admin-notices' );
        FrontendScripts::localize_script(
            'moowoodle-admin-notices',
            'moowoodleAdminNotices',
            array(
                'action' => 'moowoodle_admin_notice_action',
                'nonce'  => wp_create_nonce( 'dismiss_vulomail_notice' ),
            )
        );
    }

    /**
     * Check whether the VuloMail notice should be displayed.
     *
     * @return bool
     */
    private function should_display_vulomail_notice() {
        $dismissed_at = (int) get_option( Util::MOOWOODLE_OTHER_SETTINGS['vulomail_notice'], 0 );

        return ! $dismissed_at || ( time() - $dismissed_at ) >= YEAR_IN_SECONDS;
    }

    /**
     * Check whether VuloMail is active on this site or network.
     *
     * @return bool
     */
    private function is_vulomail_active() {
        $active_plugins = (array) get_option( 'active_plugins', array() );

        if ( is_multisite() ) {
            $network_plugins = array_keys( (array) get_site_option( 'active_sitewide_plugins', array() ) );
            $active_plugins  = array_merge( $active_plugins, $network_plugins );
        }

        return in_array( 'vulomail/vulomail.php', $active_plugins, true );
    }

    /**
     * Display admin notice for unsupported WooCommerce extensions
     * in MooWoodle free version.
     *
     * @return void
     */
    public function display_unsupported_extension_notice() {
        if ( MooWoodle()->util->is_khali_dabba() ) {
            return;
        }

        $restricted_extensions = array(
			'woocommerce-subscriptions/woocommerce-subscriptions.php'     => 'WooCommerce Subscription',
			'woocommerce-product-bundles/woocommerce-product-bundles.php' => 'WooCommerce Product Bundles',
		);

        $active_plugins = get_option( 'active_plugins', array() );

        // Merge network active plugins in multisite.
        if ( is_multisite() ) {
            $network_plugins = array_keys(
                get_site_option( 'active_sitewide_plugins', array() )
            );

            $active_plugins = array_unique( array_merge( $active_plugins, $network_plugins ) );
        }

        $active_pro_only_extensions = array();
        foreach ( $restricted_extensions as $plugin_file => $plugin_name ) {
            if ( in_array( $plugin_file, $active_plugins, true ) ) {
                $active_pro_only_extensions[] = $plugin_name;
            }
        }

        if ( empty( $active_pro_only_extensions ) ) {
            return;
        }

        $message = sprintf(
            /* translators: %s: Plugin names */
            esc_html(
                _n(
                    '%s is supported only in MooWoodle Pro.',
                    '%s are supported only in MooWoodle Pro.',
                    count( $active_pro_only_extensions ),
                    'moowoodle'
                )
            ),
            esc_html( implode( ', ', $active_pro_only_extensions ) )
        );

        ?>
        <div class="notice notice-warning is-dismissible">
            <p>
                <?php echo esc_html( $message ); ?>
                <a href="<?php echo esc_url( $this->pro_upgrade_url ); ?>" target="_blank" rel="noopener noreferrer">
                    <?php esc_html_e( 'Upgrade to MooWoodle Pro', 'moowoodle' ); ?>
                </a>
            </p>
        </div>
        <?php
    }
}
