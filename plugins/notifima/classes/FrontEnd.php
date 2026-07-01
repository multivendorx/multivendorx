<?php
/**
 * Frontend class file.
 *
 * @package Notifima
 */

namespace Notifima;

defined( 'ABSPATH' ) || exit;

/**
 * Notifima Frontend class
 *
 * @class       Frontend class
 * @version     3.0.0
 * @author      MultiVendorX
 */
class FrontEnd {
    /**
     * Allowed HTML tags and attributes for frontend output.
     *
     * @var array
     */
    public static $allowed_html = array(
        'div'    => array(
            'class' => true,
            'style' => true,
        ),
        'h5'     => array(
            'class' => true,
            'style' => true,
        ),
        'p'      => array(),
        'input'  => array(
            'type'        => true,
            'name'        => true,
            'value'       => true,
            'class'       => true,
            'id'          => true,
            'placeholder' => true,
        ),
        'button' => array(
            'type'  => true,
            'class' => true,
            'style' => true,
            'name'  => true,
        ),
        'script' => array(
            'src' => true,
        ),
    );

    /**
     * Frontend constructor.
     */
    public function __construct() {
        // enqueue scripts.
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_frontend_scripts' ) );
        // enqueue styles.
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_frontend_styles' ) );

        add_action( 'wp', array( $this, 'load_subscription_form' ) );

        // Hover style.
        add_action( 'wp_head', array( $this, 'frontend_hover_styles' ) );

        add_filter( 'notifima_display_product_lead_time', array( $this, 'display_product_lead_time' ), 10 );
        add_action( 'woocommerce_simple_add_to_cart', array( $this, 'display_product_subscription_form' ), 31 );
        add_action( 'woocommerce_after_variations_form', array( $this, 'display_product_subscription_form' ), 31 );
    }

    /**
     * Add the product subscription form in single product page.
     */
    public function load_subscription_form() {
        if ( ! is_product() ) {
            return;
        }

        // support for grouped products.
        add_filter( 'woocommerce_grouped_product_list_column_price', array( $this, 'append_grouped_product_subscription_form' ), 10, 2 );
    }

    /**
     * Enqueue frontend JavaScript. And Send Localize data.
     *
     * @return void
     */
    public function enqueue_frontend_scripts() {
        FrontendScripts::load_scripts();
        FrontendScripts::localize_scripts( 'notifima-frontend-script' );
        if ( is_product() || is_shop() || is_product_category() ) {
            // Enqueue your frontend javascript from here.
            wp_enqueue_script( 'notifima-frontend-script' );
            FrontendScripts::enqueue_script( 'notifima-frontend-script' );
        }
        if( is_product() ) {
            FrontendScripts::admin_load_scripts();
            FrontendScripts::enqueue_script( 'notifima-components-script' );
			FrontendScripts::enqueue_style( 'notifima-components-style' );
            
			FrontendScripts::enqueue_script( 'notifima-subscribe-form' );
            FrontendScripts::localize_scripts( 'notifima-subscribe-form' );
        }
    }

    /**
     * Enqueue fronted css.
     *
     * @return void
     */
    public function enqueue_frontend_styles() {
        FrontendScripts::load_scripts();
        if ( is_product() ) {
            // Enqueue your frontend stylesheet from here.
            FrontendScripts::enqueue_style( 'notifima-frontend-style' );
        }
    }

    /**
     * Set frontend's button hover style on 'wp_head' hook.
     *
     * @return void
     */
    public function frontend_hover_styles() {
        $settings_array       = Utill::get_form_settings_array();
        $button_settings      = $settings_array['customize_btn'];
        $button_onhover_style = '';
        $border_size          = '';
        $border_size          = ( ! empty( $button_settings['button_border_size'] ) ) ? $button_settings['button_border_size'] . 'px' : '1px';

        if ( ! empty( $button_settings['button_background_color_onhover'] ) ) {
            $button_onhover_style .= ! empty( $button_settings['button_background_color_onhover'] ) ? 'background: ' . $button_settings['button_background_color_onhover'] . ' !important;' : '';
        }
        if ( ! empty( $button_settings['button_text_color_onhover'] ) ) {
            $button_onhover_style .= ! empty( $button_settings['button_text_color_onhover'] ) ? ' color: ' . $button_settings['button_text_color_onhover'] . ' !important;' : '';
        }
        if ( ! empty( $button_settings['button_border_color_onhover'] ) ) {
            $button_onhover_style .= ! empty( $button_settings['button_border_color_onhover'] ) ? 'border: ' . $border_size . ' solid' . $button_settings['button_border_color_onhover'] . ' !important;' : '';
        }
        if ( $button_onhover_style ) {
            echo '<style>
                button.subscribe-button-hover:hover, button.unsubscribe_button:hover {
                ' . esc_html( $button_onhover_style ) . '
                } 
            </style>';
        }
    }

    /**
     * Get styles for the button on the frontend.
     *
     * @return string
     */
    public function subscribe_button_styles() {
        $settings_array  = Utill::get_form_settings_array();
        $button_settings = $settings_array['customize_btn'];

        $border_size = ( ! empty( $button_settings['button_border_size'] ) ) ? $button_settings['button_border_size'] . 'px' : '1px';

        $button_css = '';
        if ( ! empty( $button_settings['button_background_color'] ) ) {
            $button_css .= 'background:' . $button_settings['button_background_color'] . '; ';
        }
        if ( ! empty( $button_settings['button_text_color'] ) ) {
            $button_css .= 'color:' . $button_settings['button_text_color'] . '; ';
        }
        if ( ! empty( $button_settings['button_border_color'] ) ) {
            $button_css .= 'border: ' . $border_size . ' solid ' . $button_settings['button_border_color'] . '; ';
        }
        if ( ! empty( $button_settings['button_font_size'] ) ) {
            $button_css .= 'font-size:' . $button_settings['button_font_size'] . 'px; ';
        }
        if ( ! empty( $button_settings['button_border_radious'] ) ) {
            $button_css .= 'border-radius:' . $button_settings['button_border_radious'] . 'px;';
        }
        if ( ! empty( $button_settings['button_font_width'] ) ) {
            $button_css .= 'font-weight: ' . esc_html( $button_settings['button_font_width'] ) . 'px;';
        }
        if ( ! empty( $button_settings['button_padding'] ) ) {
            $button_css .= 'padding: ' . esc_html( $button_settings['button_padding'] ) . 'px;';
        }
        if ( ! empty( $button_settings['button_margin'] ) ) {
            $button_css .= 'margin: ' . esc_html( $button_settings['button_margin'] ) . 'px;';
        }

        return $button_css;
    }

    /**
     * Display product subscription form if product is out of stock
     *
     * @param   WC_Product|null $product_obj The WooCommerce product object. Defaults to global product if null.
     * @return  void
     */
    public function display_product_subscription_form( $product_obj = null ) {
        global $product;

        $product_obj = is_int( $product_obj ) ? wc_get_product( $product_obj ) : ( $product_obj ? $product_obj : $product );

        if ( empty( $product_obj ) ) {
            return;
        }

        if( 'yes' === $product_obj->get_meta(Utill::NOTIFIMA_PRODUCT_META['product_discontinued'])){
            return;
        }

        $guest_subscription_enabled = Notifima()->setting->get_setting( 'is_guest_subscriptions_enable','' );
        if ( 'logged_in' === $guest_subscription_enabled && ! is_user_logged_in() ) {
            return;
        }

        $backorders_enabled = Notifima()->setting->get_setting( 'is_enable_backorders','' );

        $stock_status = $product_obj->get_stock_status();
        if ( 'onbackorder' === $stock_status && 'out_of_stock' === $backorders_enabled ) {
            return;
        }

        if ( $product_obj->is_type( 'variable' ) ) {
            $get_variations = count( $product_obj->get_children() ) <= apply_filters( 'woocommerce_ajax_variation_threshold', 30, $product_obj );
            $get_variations = $get_variations ? $product_obj->get_available_variations() : false;
            if ( $get_variations ) {
                echo '<div class="notifima-shortcode-subscribe-form" data-product-id="' . esc_attr( $product_obj->get_id() ) . '"></div>';
            } else {
                echo $this->get_subscribe_form( $product_obj );
            }
        } else {
            echo $this->get_subscribe_form( $product_obj );
        }
    }

    /**
     * Display Request Stock Form for grouped product.
     *
     * @param string $value default html.
     * @param object $child individual child of grouped product.
     */
    public function append_grouped_product_subscription_form( $value, $child ) {
        $value = $value . $this->get_subscribe_form( $child );

        return $value;
    }

    /**
     * Get subscribe form HTML content for a particular product.
     * If the product is not outofstock it return empty string.
     *
     * @param  mixed $product   product variable.
     * @param  mixed $variation variation variable default null.
     * @return string HTML of subscribe form.
     */
    public function get_subscribe_form( $product, $variation = null ) {
        if ( ! Subscriber::is_product_outofstock( $variation ? $variation : $product ) ) {
            return '';
        }

        if ( $variation && 'yes' === $variation->get_meta( Utill::NOTIFIMA_PRODUCT_META['product_discontinued'] ) ) {
            return '';
        }
        $user_email = '';

        if ( is_user_logged_in() ) {
            $user_email = Notifima()->current_user->user_email;
        }
        $settings_array         = Utill::get_form_settings_array();
        $shown_interest_text    = $settings_array['shown_interest_text'];
        $is_enable_no_interest  = Notifima()->setting->get_setting( 'is_enable_no_interest', '' );
        $interested_person      = max( 0, (int) get_post_meta($variation ? $variation->get_id() : $product->get_id(), 'no_of_subscribers',true ));

        $shown_interest = '';

        if ( 'show_count' === $is_enable_no_interest && $interested_person > 0 &&$shown_interest_text ) {
            $shown_interest = str_replace( '%no_of_subscribed%',$interested_person,$shown_interest_text);
        }
        
        return sprintf(
            '<div
                id="notifima-subscribe-form"
                data-product-id="%d"
                data-variation-id="%d"
                data-product-title="%s"
                data-user-email="%s"
                data-shown-interest="%s"
            ></div>',
            esc_attr( $product->get_id() ),
            esc_attr( $variation ? $variation->get_id() : 0 ),
            esc_attr( $product->get_title() ),
            esc_attr( $user_email ),
            esc_attr( $shown_interest )
        );
    }

    /**
     * Get the lead time text for the current product.
     *
     * @return string
     */
    public function get_product_lead_time() {
        global $product;

        if ( empty( $product ) ) {
            return '';
        }

        $display_lead_times = Notifima()->setting->get_setting( 'display_lead_times', array() );

        if (
            ! empty( $display_lead_times ) &&
            in_array( $product->get_stock_status(), $display_lead_times, true )
        ) {
            return Notifima()->setting->get_setting( 'lead_time_static_text', '' );
        }

        return '';
    }
}
