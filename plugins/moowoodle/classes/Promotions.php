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
    }

    /**
     * Display the VuloMail promotion to administrators who have not activated it.
     *
     * This notice is independent of the MooWoodle Pro license state.
     *
     * @return void
     */
    public function display_vulomail_promotion_notice() {
        if ( $this->is_vulomail_active() ) {
            return;
        }

        $install_url = wp_nonce_url( self_admin_url( 'update.php?action=install-plugin&plugin=vulomail' ), 'install-plugin_vulomail' );
        ?>
        <div class="notice notice-info is-dismissible">
            <h2><?php esc_html_e( 'Track enrollment emails with VuloMail', 'moowoodle' ); ?></h2>

            <p>
                <?php esc_html_e( 'See which enrollment emails were sent to students and quickly identify emails that failed to send.', 'moowoodle' ); ?>
            </p>

            <p>
                <a class="button button-secondary" href="<?php echo esc_url( $install_url ); ?>">
                    <?php esc_html_e( 'Install VuloMail', 'moowoodle' ); ?>
                </a>

                <a href="<?php echo esc_url( MOOWOODLE_VULOMAIL_URL ); ?>" target="_blank" rel="noopener noreferrer">
                    <?php esc_html_e( 'Learn more', 'moowoodle' ); ?>
                </a>
            </p>
        </div>
        <?php
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
