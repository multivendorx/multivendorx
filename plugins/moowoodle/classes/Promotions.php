<?php

namespace MooWoodle;

defined( 'ABSPATH' ) || exit;
/**
 * @class       MooWoodle Promotions Class
 *
 * @version     PRODUCT_VERSION
 * @package     DualCube
 * @author      DualCube
 */
class Promotions {

    private string $pro_shop_url;
    public function __construct() {
        $this->pro_shop_url = MOOWOODLE_PRO_SHOP_URL;
        add_action( 'admin_notices', array( $this, 'display_product_type_warning' ) );
    }

    /**
     * Display admin notice for unsupported WooCommerce extensions
     * in MooWoodle free version.
     *
     * @return void
     */
    public function display_product_type_warning() {
        if ( ! MooWoodle()->util->is_khali_dabba() ) {
            return;
        }

        $plugins_to_check = array(
			'woocommerce-subscriptions/woocommerce-subscriptions.php'     => 'WooCommerce Subscription',
			'woocommerce-product-bundles/woocommerce-product-bundles.php' => 'WooCommerce Product Bundles',
		);

        $active_plugins = (array) get_option( 'active_plugins', array() );

        // Merge network active plugins in multisite.
        if ( is_multisite() ) {
            $network_plugins = array_keys(
                (array) get_site_option( 'active_sitewide_plugins', array() )
            );

            $active_plugins = array_merge( $active_plugins, $network_plugins );
        }

        $unsupported_plugins = array();
        foreach ( $plugins_to_check as $plugin_file => $plugin_name ) {
            if ( in_array( $plugin_file, $active_plugins, true ) ) {
                $unsupported_plugins[] = $plugin_name;
            }
        }

        if ( empty( $unsupported_plugins ) ) {
            return;
        }

        $message = sprintf(
            /* translators: %s: Plugin names */
            esc_html__(
                '%s are supported only in MooWoodle Pro.',
                'moowoodle'
            ),
            esc_html( implode( ', ', $unsupported_plugins ) )
        );

        ?>
        <div class="notice notice-warning is-dismissible">
            <p>
                <?php echo wp_kses_post( $message ); ?>
                <a href="<?php echo esc_url( $this->pro_shop_url ); ?>" target="_blank">
                    <?php esc_html_e( 'Upgrade to MooWoodle Pro', 'moowoodle' ); ?>
                </a>
            </p>
        </div>
        <?php
    }
}