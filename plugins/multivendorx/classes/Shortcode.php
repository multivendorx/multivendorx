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
 * @version     5.0.0
 * @author      MultiVendorX
 */
class Shortcode {


    /**
     * Shortcode class construct function
     */
    public function __construct() {
        add_shortcode( 'marketplace_dashboard', array( $this, 'display_store_dashboard' ) );
        add_shortcode( 'marketplace_registration', array( $this, 'display_store_registration' ) );
        add_shortcode( 'marketplace_stores', array( $this, 'marketplace_stores' ) );
        add_shortcode( 'marketplace_products', array( $this, 'marketplace_products' ) );
        add_shortcode( 'marketplace_coupons', array( $this, 'marketplace_coupons' ) );

        add_action( 'wp_enqueue_scripts', array( $this, 'frontend_scripts' ) );
        add_action( 'wp_print_styles', array( $this, 'dequeue_all_styles_on_page' ), 99 );
    }

    /**
     * Load frontend scripts.
     *
     * @return void
     */
    public function frontend_scripts() {
        global $post;
        FrontendScripts::load_scripts();
        FrontendScripts::enqueue_style( 'multivendorx-store-product-style' );
        $this->load_dashboard_assets();
        $this->load_registration_assets();

        if ( empty( $post ) || empty( $post->post_content ) ) {
            return;
        }
        $this->load_shortcode_assets( $post->post_content );
    }

    /**
     * Load dashboard assets.
     *
     * @return void
     */
    public function load_dashboard_assets() {
        if ( ! Utill::is_store_dashboard() ) {
            return;
        }

        wp_deregister_style( 'wc-blocks-style' );
        FrontendScripts::enqueue_script( 'multivendorx-vendor-script' );
        FrontendScripts::enqueue_script( 'multivendorx-dashboard-script' );
        FrontendScripts::localize_scripts( 'multivendorx-dashboard-script' );
        FrontendScripts::enqueue_style( 'multivendorx-dashboard-style' );
        wp_enqueue_script( 'wp-element' );
        wp_enqueue_media();

        $custom_css = MultiVendorX()->setting->get_setting( 'custom_css_product_page', '' );
        if ( empty( $custom_css ) ) {
            return;
        }

        wp_add_inline_style( 'multivendorx-dashboard-style', wp_strip_all_tags( $custom_css ) );
    }

    /**
     * Load registration page assets.
     *
     * @return void
     */
    public function load_registration_assets() {
        if ( ! Utill::is_store_registration_page() ) {
            return;
        }

        FrontendScripts::enqueue_script( 'multivendorx-registration-form-view-script' );
        FrontendScripts::localize_scripts( 'multivendorx-registration-form-view-script' );
        FrontendScripts::enqueue_style( 'multivendorx-store-tabs-style' );
    }

    /**
     * Load shortcode-based frontend assets.
     *
     * @param string $content Post content.
     *
     * @return void
     */
    public function load_shortcode_assets( $content ) {
        preg_match_all(
            '/' . get_shortcode_regex() . '/',
            $content,
            $matches
        );

        $detected_shortcodes = array_unique(
            $matches[2] ?? array()
        );

        $shortcode_assets = apply_filters(
            'multivendorx_shortcode_frontend_assets',
            array(
                'marketplace_stores'   => array(
                    'scripts' => array(
                        array(
                            'handle'   => 'multivendorx-marketplace-stores-view-script',
                            'localize' => true,
                        ),
                        array(
                            'handle'   => 'multivendorx-store-provider-script',
                            'localize' => true,
                        ),
                    ),
                    'styles'  => array(
                        'multivendorx-common-block-style',
                    ),
                ),

                'marketplace_products' => array(
                    'scripts' => array(
                        array(
                            'handle'   => 'multivendorx-marketplace-products-view-script',
                            'localize' => true,
                        ),
                    ),
                ),

                'marketplace_coupons'  => array(
                    'scripts' => array(
                        array(
                            'handle'   => 'multivendorx-marketplace-coupons-view-script',
                            'localize' => true,
                        ),
                    ),
                    'styles'  => array(
                        'multivendorx-common-block-style',
                    ),
                ),
            )
        );

        foreach ( $shortcode_assets as $shortcode => $assets ) {
            if ( ! in_array( $shortcode, $detected_shortcodes, true ) ) {
                continue;
            }

            foreach ( $assets['scripts'] ?? array() as $script ) {
                if ( empty( $script['handle'] ) ) {
                    continue;
                }

                FrontendScripts::enqueue_script( $script['handle'] );
                if ( ! empty( $script['localize'] ) ) {
                    FrontendScripts::localize_scripts( $script['handle'] );
                }
            }

            foreach ( $assets['styles'] ?? array() as $style_handle ) {
                FrontendScripts::enqueue_style( $style_handle );
            }
        }
    }

    /**
     * Dequeue all styles on page
     *
     * @return void
     */
    public static function dequeue_all_styles_on_page() {
        if ( Utill::is_store_dashboard() && is_user_logged_in() && in_array( 'store_owner', MultiVendorX()->current_user->roles, true ) ) {
            global $wp_styles;
            $wp_styles->queue = apply_filters( 'multivendorx_dashboard_style_queue', array( 'multivendorx-dashboard-style', 'multivendorx-store-product-style', 'media-views', 'imgareaselect' ) );
        }
    }

    /**
     * Display store dashboard
     */
    public function display_store_dashboard() {
        ob_start();
        if ( ! is_user_logged_in() ) {
            if ( ( 'no' === get_option( Utill::WOO_SETTINGS['generate_password'] ) ) ) {
                wp_enqueue_script( 'wc-password-strength-meter' );
            }
            echo '<div class="multivendorx-registration woocommerce">';
            wc_get_template( 'myaccount/form-login.php' );
            echo '</div>';
        } else {
            MultiVendorX()->util->get_template( 'store/store-dashboard.php', array() );
        }

        return ob_get_clean();
    }

    /**
     * Display store registration form
     */
    public function display_store_registration() {
        if ( is_user_logged_in() && current_user_can( 'manage_options' ) && Utill::is_store_registration_page() ) {
            wp_safe_redirect( admin_url() );
            exit;
        }

        ob_start();
        ?>
        <div id="multivendorx-registration-form" class="woocommerce">
            <div class="multivendorxstep-wizard">
				<div class="multivendorxsteps-container">
					<div class='multivendorxstep-item'>
						<span class='skeleton skeleton-circular' style="width: 2.125rem; height: 2.125rem;"> </span>
						<span class='skeleton skeleton-text' style="width: 5rem; height: 1.5rem;"></span>
					</div>

					<div class="multivendorx-step-divider"></div>
					<div class='multivendorxstep-item' >
						<span class='skeleton skeleton-circular' style="width: 2.125rem; height: 2.125rem;"> </span>
						<span class='skeleton skeleton-text' style="width: 6rem; height: 1.5rem;"></span>
					</div>

				</div>
				<div class="multivendorxprogress-bar"></div>
			</div>
			<div class="multivendorxstep-content multivendorxstep-1-content">
				<div class="multivendorxprogress-content">
					<p><span class='skeleton skeleton-text' style="width: 6rem; height: 1.5rem;"> </span></p>
					<h3><span class='skeleton skeleton-text' style="width: 14rem; height: 1.5rem;"></span></h3>
					<p><span class='skeleton skeleton-text' style="width: 80%; height: 1rem;"></span></p>
				</div>
			</div>
        </div>
        <?php
        // Return the output buffer content.
        return ob_get_clean();
    }

    /**
     * Display stores list.
     *
     * @param array $attributes Block or shortcode attributes.
     * @return string HTML container for marketplace stores.
     */
    public function marketplace_stores( $attributes ) {
        if ( ( $attributes['orderby'] ?? null ) === 'registered' ) {
            $attributes['orderby'] = 'create_time';
        }

        $attributes = $this->snake_to_camel_case( $attributes );
        $json_attrs = esc_attr( wp_json_encode( $attributes ) );

        return '<div id="marketplace-stores" data-attributes="' . $json_attrs . '"></div>';
    }
    /**
     * Display products list.
     *
     * @param array $attributes Block or shortcode attributes.
     * @return string HTML container for marketplace products.
     */
    public function marketplace_products( $attributes ) {
        $attributes = $this->snake_to_camel_case( $attributes );
        $json_attrs = esc_attr( wp_json_encode( $attributes ) );

        return '<div id="marketplace-products" data-attributes="' . $json_attrs . '"></div>';
    }
    /**
     * Display coupons list.
     *
     * @param array $attributes Block or shortcode attributes.
     * @return string HTML container for marketplace coupons.
     */
    public function marketplace_coupons( $attributes ) {
        $attributes = $this->snake_to_camel_case( $attributes );
        $json_attrs = esc_attr( wp_json_encode( $attributes ) );

        return '<div id="marketplace-coupons" data-attributes="' . $json_attrs . '"></div>';
    }

    /**
     * Convert array keys from snake_case to camelCase.
     *
     * @param array $attributes Attribute list.
     * @return array
     */
    public function snake_to_camel_case( $attributes ) {
        $result = array();
        foreach ( $attributes as $key => $value ) {
            $camel_case_key            = lcfirst( str_replace( ' ', '', ucwords( str_replace( '_', ' ', $key ) ) ) );
            $result[ $camel_case_key ] = $value;
        }

        return $result;
    }
}
