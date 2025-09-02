<?php

namespace MultiVendorX;

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
    }

    public function frontend_scripts() {
        wp_enqueue_script( 'wp-element' );
        FrontendScripts::load_scripts();
        FrontendScripts::enqueue_script( 'multivendorx-dashboard-components-script' );
        FrontendScripts::localize_scripts( 'multivendorx-dashboard-components-script' );
        FrontendScripts::enqueue_script( 'multivendorx-dashboard-script' );
        FrontendScripts::localize_scripts( 'multivendorx-dashboard-components-script' );
        FrontendScripts::enqueue_style( 'multivendorx-dashboard-style' );

        FrontendScripts::enqueue_script( 'multivendorx-registration-form-script' );
        FrontendScripts::localize_scripts( 'multivendorx-registration-form-script' );
    }

    public function display_store_dashboard() {
        $this->frontend_scripts();
        ob_start();

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
            MultiVendorX()->util->get_template( 'store-dashboard.php', [] );
        } else {
            
        }

        return ob_get_clean();
    }

    public function display_store_registration() {
        // Enqueue frontend scripts
        $this->frontend_scripts();
    
        // Start output buffering
        ob_start();
        ?>
        <div id="multivendorx-registration-form">
            <?php
            // Here you can render the actual registration form if needed
            // Example: echo do_shortcode('[multivendorx_store_registration]');
            ?>
        </div>
        <?php
    
        // Return the output buffer content
        return ob_get_clean();
    }
    
    
} 