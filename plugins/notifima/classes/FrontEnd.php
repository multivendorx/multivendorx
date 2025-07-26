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
        add_action( 'wp_enqueue_scripts', array( &$this, 'frontend_scripts' ) );
        // enqueue styles.
        add_action( 'wp_enqueue_scripts', array( &$this, 'frontend_styles' ) );

        add_action( 'wp', array( $this, 'load_subscription_form' ) );

        // Hover style.
        add_action( 'wp_head', array( $this, 'frontend_hover_styles' ) );

        add_filter( 'notifima_display_product_lead_time', array( $this, 'display_product_lead_time' ), 10 );
    }

    /**
     * Add the product subscription form in single product page.
     */
    public function load_subscription_form() {
        if ( is_product() ) {
            add_action( 'woocommerce_simple_add_to_cart', array( $this, 'display_product_subscription_form' ), 31 );
            add_action( 'woocommerce_after_variations_form', array( $this, 'display_product_subscription_form' ), 31 );
            // support for grouped products.
            add_filter( 'woocommerce_grouped_product_list_column_price', array( $this, 'display_in_grouped_product' ), 10, 2 );
        }
    }

    /**
     * Enque Frontend's JavaScript. And Send Localize data.
     *
     * @return void
     */
    public function frontend_scripts() {
        FrontendScripts::load_scripts();
        FrontendScripts::localize_scripts( 'notifima-frontend-script' );
        if ( is_product() || is_shop() || is_product_category() ) {
            // Enqueue your frontend javascript from here.
            wp_enqueue_script( 'notifima-frontend-script' );
            FrontendScripts::enqueue_script( 'notifima-frontend-script' );
        }
    }

    /**
     * Enqueue fronted css.
     *
     * @return void
     */
    public function frontend_styles() {
        FrontendScripts::load_scripts();
        if ( function_exists( 'is_product' ) ) {
            if ( is_product() ) {
                // Enqueue your frontend stylesheet from here.
                FrontendScripts::enqueue_style( 'notifima-frontend-style' );
            }
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

        if ( isset( $button_settings['button_background_color_onhover'] ) ) {
            $button_onhover_style .= ! empty( $button_settings['button_background_color_onhover'] ) ? 'background: ' . $button_settings['button_background_color_onhover'] . ' !important;' : '';
        }
        if ( isset( $button_settings['button_text_color_onhover'] ) ) {
            $button_onhover_style .= ! empty( $button_settings['button_text_color_onhover'] ) ? ' color: ' . $button_settings['button_text_color_onhover'] . ' !important;' : '';
        }
        if ( isset( $button_settings['button_border_color_onhover'] ) ) {
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
     * Display product subscription form if product is outof stock
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
        $guest_subscription_enabled = Notifima()->setting->get_setting( 'is_guest_subscriptions_enable' );
        $guest_subscription_enabled = is_array( $guest_subscription_enabled ) ? reset( $guest_subscription_enabled ) : false;
        if ( ! $guest_subscription_enabled && ! is_user_logged_in() ) {
            return;
        }

        $backorders_enabled = Notifima()->setting->get_setting( 'is_enable_backorders' );
        $backorders_enabled = is_array( $backorders_enabled ) ? reset( $backorders_enabled ) : false;

        $stock_status = $product_obj->get_stock_status();
        if ( 'onbackorder' === $stock_status && ! $backorders_enabled ) {
            return;
        }

        if ( $product_obj->is_type( 'variable' ) ) {
            $get_variations = count( $product_obj->get_children() ) <= apply_filters( 'woocommerce_ajax_variation_threshold', 30, $product_obj );
            $get_variations = $get_variations ? $product_obj->get_available_variations() : false;
            if ( $get_variations ) {
                echo '<div class="notifima-shortcode-subscribe-form" data-product-id="' . esc_attr( $product_obj->get_id() ) . '"></div>';
            } else {
                echo wp_kses( $this->get_subscribe_form( $product_obj ), self::$allowed_html );
            }
        } else {
            echo wp_kses( $this->get_subscribe_form( $product_obj ), self::$allowed_html );
        }
    }

    /**
     * Display Request Stock Form for grouped product.
     *
     * @param string $value default html.
     * @param object $child indivisual child of grouped product.
     */
    public function display_in_grouped_product( $value, $child ) {
        $value = $value . $this->get_subscribe_form( $child );

        return $value;
    }

    /**
     * Get subscribe from's HTML content for a particular product.
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
        $notifima_fields_array = array();
        $notifima_fields_html  = '';
        $user_email            = '';
        $separator             = apply_filters( 'notifima_subscription_form_fields_separator', '<br>' );
        $settings_array        = Utill::get_form_settings_array();
        $button_settings       = $settings_array['customize_btn'];

        if ( is_user_logged_in() ) {
            $current_user = wp_get_current_user();
            $user_email   = $current_user->data->user_email;
        }
        $placeholder = $settings_array['email_placeholder_text'];

        $additional_fields[] = apply_filters( 'notifima_subscription_form_additional_fields', '' );

        if ( ! empty( $additional_fields ) ) {
            foreach ( $additional_fields as $field ) {
                $notifima_fields_array[] = $field;
            }
        }

        $notifima_fields_array[] = '<input id="notifima_alert_email" type="text" name="alert_email" class="notifima-email" value="' . esc_attr( $user_email ) . '" placeholder="' . $placeholder . '" >';
        if ( $notifima_fields_array ) {
            $notifima_fields_html = implode( $separator, $notifima_fields_array );
        }

        $alert_text_html = '<h5 style="color:' . esc_html( $settings_array['alert_text_color'] ) . '" class="subscribe-for-interest-text">' . esc_html( $settings_array['alert_text'] ) . '</h5>';

        $button_css = $this->subscribe_button_styles();

        $button_html = '<button style="' . $button_css . '" class="notifima-subscribe notifima-button subscribe-button-hover">' . esc_html( $button_settings['button_text'] ) . '</button>';

        $interested_person = get_post_meta( $variation ? $variation->get_id() : $product->get_id(), 'no_of_subscribers', true );
        $interested_person = ( isset( $interested_person ) && $interested_person > 0 ) ? $interested_person : 0;

        $shown_interest_html = '';
        $shown_interest_text = esc_html( $settings_array['shown_interest_text'] );

        $is_enable_no_interest = Notifima()->setting->get_setting( 'is_enable_no_interest' );
        $is_enable_no_interest = is_array( $is_enable_no_interest ) ? reset( $is_enable_no_interest ) : false;

        if ( $is_enable_no_interest && 0 !== $interested_person && $shown_interest_text ) {
            $shown_interest_text = str_replace( '%no_of_subscribed%', $interested_person, $shown_interest_text );
            $shown_interest_html = '<p>' . $shown_interest_text . '</p>';
        }

        $lead_text_html = apply_filters( 'notifima_display_product_lead_time', $variation ? $variation : $product );

        return $lead_text_html .
        '<div class="notifima-subscribe-form" style="border-radius:10px;">
            ' . $alert_text_html . '
            <div class="fields_wrap"> ' . $notifima_fields_html . '' . $button_html . '
            </div>
            <input type="hidden" class="notifima-product-id" value="' . esc_attr( $product->get_id() ) . '" />
            <input type="hidden" class="notifima-variation-id" value="' . esc_attr( $variation ? $variation->get_id() : 0 ) . '" />
            <input type="hidden" class="notifima-product-name" value="' . esc_attr( $product->get_title() ) . '" />
            ' . $shown_interest_html . '
        </div>';
    }

    /**
     * Display lead time for a product.
     *
     * @param WC_Product $product The WooCommerce product object.
     * @return void
     */
    public function display_product_lead_time( $product ) {
        if ( empty( $product ) ) {
            return;
        }
        $display_lead_times = Notifima()->setting->get_setting( 'display_lead_times' );
        if ( ! empty( $display_lead_times ) && in_array( $product->get_stock_status(), $display_lead_times, true ) ) {
            $lead_time_static_text = Notifima()->setting->get_setting( 'lead_time_static_text' );

            return '<p>' . esc_html( $lead_time_static_text ) . '</p>';
        }

        return '';
    }
}
