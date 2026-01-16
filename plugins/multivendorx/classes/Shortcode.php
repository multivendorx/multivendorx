<?php
/**
 * Shortcode class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

use MultiVendorX\Utill;

/**
 * MultiVendorX Shortcode class.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Shortcode
{

    /**
     * Shortcode class construct function
     */
    public function __construct()
    {
        add_shortcode('multivendorx_store_dashboard', array($this, 'display_store_dashboard'));
        add_shortcode('multivendorx_store_registration', array($this, 'display_store_registration'));
        add_shortcode('marketplace_stores', array($this, 'marketplace_stores'));
        add_shortcode('marketplace_products', array($this, 'marketplace_products'));
        add_shortcode('marketplace_coupons', array($this, 'marketplace_coupons'));

        add_action('wp_enqueue_scripts', array($this, 'frontend_scripts'));
        add_action('wp_print_styles', array($this, 'dequeue_all_styles_on_page'), 99);
    }

    /**
     * Load frontend scripts
     */
    public function frontend_scripts() {
        FrontendScripts::load_scripts();

        FrontendScripts::enqueue_style('multivendorx-store-product-style');
        FrontendScripts::enqueue_script('multivendorx-store-name-script');
        FrontendScripts::enqueue_script('multivendorx-store-description-script');
        if (Utill::is_store_dashboard()) {
            wp_deregister_style('wc-blocks-style');
            FrontendScripts::enqueue_script('multivendorx-dashboard-components-script');
            FrontendScripts::enqueue_script('multivendorx-dashboard-script');
            FrontendScripts::localize_scripts('multivendorx-dashboard-script');
            FrontendScripts::enqueue_style('multivendorx-dashboard-style');

            wp_enqueue_script('wp-element');
            wp_enqueue_media();

            $custom_css = MultiVendorX()->setting->get_setting('custom_css_product_page', '');
            if (!empty($custom_css)) {
                wp_add_inline_style(
                    'multivendorx-dashboard-style',
                    wp_strip_all_tags($custom_css)
                );
            }
        }

        if (Utill::is_store_registration_page()) {
            FrontendScripts::enqueue_script('multivendorx-registration-form-script');
            FrontendScripts::localize_scripts('multivendorx-registration-form-script');
        }
    }

    /**
     * Dequeue all styles on page
     *
     * @return void
     */
    public static function dequeue_all_styles_on_page() {
        if (Utill::is_store_dashboard() && is_user_logged_in() && in_array('store_owner', wp_get_current_user()->roles, true)) {
            global $wp_styles;
            $wp_styles->queue = array('multivendorx-dashboard-style', 'multivendorx-store-product-style', 'media-views', 'imgareaselect');
        }
    }

    /**
     * Display store dashboard
     */
    public function display_store_dashboard() {
        ob_start();
        ?>
        <?php
        if (!is_user_logged_in()) {
            if (('no' === get_option(Utill::WOO_SETTINGS['generate_password']) && !is_user_logged_in())) {
                wp_enqueue_script('wc-password-strength-meter');
            }
            echo '<div class="mvx-dashboard woocommerce">';
            wc_get_template('myaccount/form-login.php');
            echo '</div>';
        } else {
            MultiVendorX()->util->get_template('store/store-dashboard.php', array());
        }

        return ob_get_clean();
    }

    /**
     * Display store registration form
     */
    public function display_store_registration() {
        if ( is_user_logged_in() && current_user_can( 'manage_options' ) && Utill::is_store_registration_page()) {
            wp_safe_redirect( admin_url() );
            exit;
        }

        ob_start();
        if (is_user_logged_in()) {
            ?>
            <div id="multivendorx-registration-form" class="woocommerce">
            </div>
            <?php
        } else {
            echo '<div class="mvx-dashboard woocommerce">';
            echo '<div class="woocommerce-notices-wrapper"><div class="woocommerce-error">  <div class="wc-block-components-notice-banner__content"><strong> Kindly login before registration </strong></div></div></div>';
            wc_get_template('myaccount/form-login.php');
            echo '</div>';
        }

        // Return the output buffer content.
        return ob_get_clean();
    }

    /**
     * Display stores list
     */
    public function marketplace_stores($attributes) {
        if (($attributes['orderby'] ?? null) === 'registered') {
            $attributes['orderby'] = 'create_time';
        }
        $json_attrs = esc_attr(wp_json_encode($attributes));
        FrontendScripts::load_scripts();

        FrontendScripts::enqueue_script('multivendorx-marketplace-stores-script');
        FrontendScripts::localize_scripts('multivendorx-marketplace-stores-script');

        // Use id instead of class
        return '<div id="marketplace-stores" data-attributes="' . $json_attrs . '"></div>';
    }
    /**
     * Display stores list
     */
    public function marketplace_products($attributes) {
        $json_attrs = esc_attr(wp_json_encode($attributes));
        FrontendScripts::load_scripts();

        FrontendScripts::enqueue_script('multivendorx-marketplace-products-script');
        FrontendScripts::localize_scripts('multivendorx-marketplace-products-script');

        // Use id instead of class
        return '<div id="marketplace-products" data-attributes="' . $json_attrs . '"></div>';
    }
    /**
     * Display stores list
     */
    public function marketplace_coupons($attributes) {
        $json_attrs = esc_attr(wp_json_encode($attributes));
        FrontendScripts::load_scripts();

        FrontendScripts::enqueue_script('multivendorx-marketplace-coupons-script');
        FrontendScripts::localize_scripts('multivendorx-marketplace-coupons-script');

        // Use id instead of class
        return '<div id="marketplace-coupons" data-attributes="' . $json_attrs . '"></div>';
    }
}
