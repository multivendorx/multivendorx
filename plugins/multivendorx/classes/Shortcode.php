<?php

namespace MultiVendorX;

use MultiVendorX\Store\StoreUtil;

/**
 * MultiVendorX Shortcode class
 *
 * @class 		Shortcode class
 * @version		PRODUCT_VERSION
 * @author 		MultiVendorX
 */
class Shortcode {
    /**
     * Shortcode class construct function
     */
    public function __construct() {
        add_shortcode( 'multivendorx_store_dashboard', [ $this, 'display_store_dashboard' ] );
        add_shortcode( 'multivendorx_store_registration', [ $this, 'display_store_registration' ] );
        add_action( 'wp_enqueue_scripts', array($this, 'frontend_scripts'));

        // add_action('wp_print_styles', array($this, 'dequeue_all_styles_on_page'), 99);
        
        add_shortcode( 'multivendorx_stores_list', array( $this, 'display_stores_list' ) );

    }

    public function frontend_scripts() {
        if (is_page() && has_shortcode(get_post()->post_content, 'multivendorx_store_dashboard')) {
            wp_deregister_style('wc-blocks-style');
        }
        wp_enqueue_script( 'wp-element' );
        wp_enqueue_media();
        FrontendScripts::load_scripts();
        FrontendScripts::enqueue_script( 'multivendorx-dashboard-components-script' );
        FrontendScripts::enqueue_script( 'multivendorx-dashboard-script' );
        FrontendScripts::localize_scripts( 'multivendorx-dashboard-script' );
        FrontendScripts::enqueue_style( 'multivendorx-dashboard-style' );

        FrontendScripts::enqueue_script( 'multivendorx-registration-form-script' );
        FrontendScripts::localize_scripts( 'multivendorx-registration-form-script' );

        FrontendScripts::enqueue_script( 'multivendorx-store-dashboard-script' );
        FrontendScripts::localize_scripts( 'multivendorx-store-dashboard-script' );
        FrontendScripts::enqueue_style( 'multivendorx-store-product-style' );

        ?>
        <style>
            <?php 
            echo MultiVendorX()->setting->get_setting('custom_css_product_page', []);?>
        </style>
        <?php
    }

    public static function dequeue_all_styles_on_page()
    {
        if (is_page() && has_shortcode(get_post()->post_content, 'multivendorx_store_dashboard') && is_user_logged_in() && in_array( 'store_owner', wp_get_current_user()->roles, true )) {
            global $wp_styles;
            $wp_styles->queue = array('multivendorx-dashboard-style', 'multivendorx-store-product-style');
            // print_r($wp_styles);
        }
    }

    public function display_store_dashboard() {
        $this->frontend_scripts();
        ob_start();
        global $wpdb;

        // <div id="multivendorx-vendor-dashboard">
        // </div> 

        $user = wp_get_current_user();
         if (!is_user_logged_in()) {
            if (( 'no' === get_option('woocommerce_registration_generate_password') && !is_user_logged_in())) {
                wp_enqueue_script('wc-password-strength-meter');
            }
            echo '<div class="mvx-dashboard woocommerce">';
            wc_get_template('myaccount/form-login.php');
            echo '</div>';
        } else if ( in_array( 'store_owner', $user->roles, true ) ) {
            MultiVendorX()->util->get_template( 'store/store-dashboard.php', [] );
        } else {
    
            $stores = StoreUtil::get_store_by_primary_owner('rejected');
            $pending_stores = StoreUtil::get_store_by_primary_owner('pending');

            echo '<div class="mvx-dashboard-message">';
            if ( ! empty( $stores ) ) {
                $reapply_url = get_permalink( MultiVendorX()->setting->get_setting( 'store_registration_page' ) );
                printf(
                    esc_html__( 'Your application is rejected by admin. %s', 'multivendorx' ),
                    '<a href="' . esc_url( $reapply_url ) . '">' . esc_html__( 'Click here to reapply.', 'multivendorx' ) . '</a>'
                );
            } elseif (!empty($pending_stores)) {
                echo MultiVendorX()->setting->get_setting('pending_msg');
            } else {
                echo esc_html__('Signup has been disabled.', 'multivendorx');
            }
            echo '</div>';
        }

        return ob_get_clean();
    }

    public function display_store_registration() {
        // Enqueue frontend scripts
        $this->frontend_scripts();
    
        // Start output buffering
        ob_start();
        if (is_user_logged_in()) {
            ?>
            <div id="multivendorx-registration-form" class="woocommerce">
                <?php
                // Here you can render the actual registration form if needed
                // Example: echo do_shortcode('[multivendorx_store_registration]');
                ?>
            </div>
            <?php
        } else {
            echo 'Kindly login before registration';
            echo '<div class="mvx-dashboard woocommerce">';
            wc_get_template('myaccount/form-login.php');
            echo '</div>';            
        }
    
        // Return the output buffer content
        return ob_get_clean();
    }

    public function display_stores_list(){
        ob_start();
        ?>
        <div id="multivendorx-stores-list">
        </div>
        <?php
        return ob_get_clean();
    }
    
    
} 