<?php
/**
 * MultiVendorX Follow Store Frontend class
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\FollowStore;

use MultiVendorX\FrontendScripts;

/**
 * MultiVendorX Follow Store Frontend class
 *
 * @class       Module class
 * @version     5.0.0
 * @author      MultiVendorX
 */
class Frontend {

    /**
     * Constructor.
     */
    public function __construct() {
        // Default button on vendor info section.
        add_action( 'mvx_after_vendor_information', array( $this, 'render_follow_button' ), 10, 1 );

        add_filter( 'multivendorx_register_scripts', array( $this, 'register_script' ) );
        add_filter( 'multivendorx_localize_scripts', array( $this, 'localize_scripts' ) );
        // Load scripts.
        add_action( 'wp_enqueue_scripts', array( $this, 'load_scripts' ) );
        add_action( 'wp_footer', array( $this, 'render_login_modal' ) );
    }

    public function register_script( $scripts ) {
        $base_url = MultiVendorX()->plugin_url . FrontendScripts::get_build_path_name();

        $scripts['multivendorx-follow-store-frontend-script'] = array(
            'src'     => $base_url . 'modules/FollowStore/js/' . MULTIVENDORX_PLUGIN_SLUG . '-frontend.min.js',
            'deps'    => array( 'jquery' ),
        );

        return $scripts;
    }

    public function localize_scripts( $scripts ) {

        $scripts['multivendorx-follow-store-frontend-script'] = array(
            'object_name' => 'followStoreFrontend',
            'use_rest'    => true,
            'data'        => array(),
        );

        return $scripts;
    }


    /**
     * Load follow store JS scripts
     */
    public function load_scripts() {
        FrontendScripts::load_scripts();
        FrontendScripts::enqueue_script( 'multivendorx-follow-store-frontend-script' );
        FrontendScripts::localize_scripts( 'multivendorx-follow-store-frontend-script' );
    }

    /**
     * Render follow button (default hook)
     *
     * @param int $store_id Store ID.
     */
    public function render_follow_button( $store_id = 0 ) {
        if ( empty( $store_id ) ) {
            return;
        }

        $current_user_id = get_current_user_id();

        $html  = '<div class="follow-wrapper"> <button class="follow-btn woocommerce-button button" 
                    data-store-id="' . esc_attr( $store_id ) . '" 
                    data-user-id="' . esc_attr( $current_user_id ) . '" 
                    style="display:none;">
                    Follow
                </button>';
        $html .= ' <div class="follower-count" id="followers-count-' . esc_attr( $store_id ) . '">0 Follower</div> </div>';

        $html = apply_filters( 'multivendorx_follow_button_html', $html, $store_id, $current_user_id );

        echo wp_kses_post( $html );
    }

    /**
     * Outputs the login modal for non-logged-in users.
     *
     * Displays the WooCommerce "My Account" form inside a modal with a close button.
     *
     * @return void
     */
    public function render_login_modal() {
        ?>
        <div id="multivendorx-login-modal" class="multivendorx-modal">
            <div class="multivendorx-modal-content">
                <span class="multivendorx-close">&times;</span>
                <div id="multivendorx-login-form-container">
                    <?php echo do_shortcode( '[woocommerce_my_account]' ); ?>
                </div>
            </div>
        </div>
        <style>
        .multivendorx-modal { display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; }
        .multivendorx-modal-content { background:#fff; margin:10% auto; padding:20px; width:400px; border-radius:5px; position:relative; }
        .multivendorx-close { position:absolute; top:10px; right:15px; cursor:pointer; font-size:20px; }
        </style>
        <?php
    }
}
