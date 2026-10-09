<?php
/**
 * MultiVendorX Follow Store Frontend class
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\FollowStore;

use MultiVendorX\FrontendScripts;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

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
        // Default button on store info section.
        add_action( 'multivendorx_after_vendor_information', array( $this, 'render_follow_button' ), 10, 1 );

        add_filter( 'multivendorx_register_scripts', array( $this, 'register_script' ) );
        add_filter( 'multivendorx_localize_scripts', array( $this, 'localize_scripts' ) );
        add_filter( 'multivendorx_register_styles', array( $this, 'register_login_modal_style' ) );
        // Load scripts.
        add_action( 'wp_enqueue_scripts', array( $this, 'load_scripts' ) );
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_login_modal_style' ) );
        add_action( 'wp_footer', array( $this, 'render_login_modal' ) );
    }

    /**
     * Register the login modal's stylesheet.
     *
     * @param array $styles Existing frontend styles.
     * @return array
     */
    public function register_login_modal_style( $styles ) {
        $styles['multivendorx-follow-store-login-modal'] = array(
            'src' => FrontendScripts::get_asset_path() . 'styles/modules/FollowStore/' . MULTIVENDORX_PLUGIN_SLUG . '-login-modal.min.css',
        );
        return $styles;
    }

    /**
     * Enqueue the login modal's CSS.
     */
    public function enqueue_login_modal_style() {
        if ( Utill::is_store_page() && ! is_user_logged_in() ) {
            FrontendScripts::enqueue_style( 'multivendorx-follow-store-login-modal' );
        }
    }
	/**
	 * Register follow store frontend script
	 *
	 * @param array $scripts Scripts array.
	 * @return array Modified scripts array
	 */
    public function register_script( $scripts ) {
        $scripts['multivendorx-follow-store-frontend-script'] = array(
            'src'  => FrontendScripts::get_asset_path() . 'js/modules/FollowStore/' . MULTIVENDORX_PLUGIN_SLUG . '-frontend.min.js',
            'deps' => array( 'jquery', 'wp-i18n' ),
        );

        return $scripts;
    }
	/**
	 * Localize follow store frontend script
	 *
	 * @param array $scripts Scripts array.
	 * @return array Modified scripts array
	 */
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
        if ( Utill::is_store_page() ) {
            FrontendScripts::enqueue_script( 'multivendorx-follow-store-frontend-script' );
            FrontendScripts::localize_scripts( 'multivendorx-follow-store-frontend-script' );
        }
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

        $current_user_id = MultiVendorX()->current_user_id;

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
        // Only needed as a "log in to follow" prompt on a store page for anonymous visitors -
        // rendering it elsewhere (e.g. the vendor dashboard) unconditionally on every page's
        // wp_footer causes a flash of this unstyled WooCommerce My Account markup before the
        // modal's own CSS (display:none) has a chance to load.
        if ( ! Utill::is_store_page() || is_user_logged_in() ) {
            return;
        }
        ?>
        <div id="multivendorx-login-modal" class="multivendorx-modal">
            <div class="multivendorx-modal-content">
                <span class="multivendorx-close">&times;</span>
                <div id="multivendorx-login-form-container">
                    <?php echo do_shortcode( '[woocommerce_my_account]' ); ?>
                </div>
            </div>
        </div>
        <?php
    }
}
