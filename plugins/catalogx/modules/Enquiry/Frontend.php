<?php
/**
 * Enquiry module Frontend class file
 *
 * @package CatalogX
 */

namespace CatalogX\Enquiry;

use CatalogX\FrontendScripts;
use CatalogX\Utill;

/**
 * CatalogX Enquiry Module Frontend class
 *
 * @class       Frontend class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Frontend {
    /**
     * Frontend class constructor function.
     */
    public function __construct() {
        // Check the exclution.
        if ( ! Util::is_available() ) {
			return;
        }

        $display_enquiry_button = CatalogX()->setting->get_setting( 'enquiry_user_permission', array() );
        if ( ! empty( $display_enquiry_button ) && ! is_user_logged_in() ) {
            return;
        }

        if ( empty( CatalogX()->setting->get_setting( 'enable_cart_checkout' ) ) ) {
            add_action( 'woocommerce_after_shop_loop_item', array( $this, 'add_button_in_shop_page' ) );
        }

        add_action( 'display_shop_page_button', array( $this, 'catalogx_add_enquiry_button' ) );

        // Hook for exclusion.
        add_action( 'woocommerce_single_product_summary', array( $this, 'enquiry_button_exclusion' ), 5 );

        add_action( 'wp_enqueue_scripts', array( $this, 'frontend_scripts' ) );

        // Enquiry button shortcode.
        add_shortcode( 'catalogx_enquiry_button', array( $this, 'catalogx_enquiry_button_shortcode' ) );
    }

    /**
     * Adds enquiry button on shop page via hook.
     *
     * @return void
     */
    public function catalogx_add_enquiry_button() {
        global $product;
        if ( empty( trim( CatalogX()->render_enquiry_btn_via ) ) ) {
            CatalogX()->render_enquiry_btn_via = 'hook';
            $this->add_enquiry_button( $product->get_id() );
        }
    }

    /**
     * Add enquiry button in single product page and shop page
     *
     * @param int|\WC_Product|null $product_obj Product object or ID. Falls back to global $product if null.
     * @return void
     */
    public function add_enquiry_button( $product_obj ) {
        global $product;
        $product_obj = is_int( $product_obj ) ? wc_get_product( $product_obj ) : ( $product_obj ? $product_obj : $product );

        if ( empty( $product_obj ) ) {
            return;
        }

        if ( apply_filters( 'catalogx_enable_multiple_product_enquiry', false ) ) {
            return;
        }

        $button_settings  = CatalogX()->setting->get_setting( 'enquiry_button', array() );
        $button_css       = Utill::get_button_styles( $button_settings );
        $button_hover_css = Utill::get_button_styles( $button_settings, true );

        if ( $button_hover_css ) {
            echo '<style>
                .catalogx-enquiry-btn:hover{
                ' . esc_html( $button_hover_css ) . '
                } 
            </style>';
        }

        $additional_css_settings = CatalogX()->setting->get_setting( 'custom_css_product_page' );
        if ( isset( $additional_css_settings ) && ! empty( $additional_css_settings ) ) {
            $button_css .= $additional_css_settings;
        }

        $button_settings['button_text'] = ! empty( $button_settings['button_text'] ) ? $button_settings['button_text'] : \CatalogX\Utill::get_translated_string( 'send_an_enquiry', 'Send an enquiry' );
        $button_position_settings       = CatalogX()->setting->get_setting( 'shop_page_button_position_setting', array() );
        $position                       = array_search( 'enquiry_button', $button_position_settings, true );
        $position                       = false !== $position ? $position : 0;

        ?>
        <div id="catalogx-enquiry">
        <?php
		if ( CatalogX()->setting->get_setting( 'is_enable_out_of_stock' ) ) {
			if ( ! $product_obj->managing_stock() && ! $product_obj->is_in_stock() ) {
                ?>
                <div position = "<?php echo esc_attr( $position ); ?>">
                    <button class="catalogx-enquiry-btn button demo btn btn-primary btn-large wp-block-button__link" style="<?php echo esc_attr( $button_css ); ?>" href="#catalogx-modal"><?php echo esc_html( $button_settings['button_text'] ); ?></button>
                </div>
                <?php
			}
        } else {
			?>
                <div position = "<?php echo esc_attr( $position ); ?>">
                    <button class="catalogx-enquiry-btn button demo btn btn-primary btn-large wp-block-button__link" style="<?php echo esc_attr( $button_css ); ?>" href="#catalogx-modal"><?php echo esc_html( $button_settings['button_text'] ); ?></button>
                </div>
                <?php
		}
		?>
            <input type="hidden" name="product_name_for_enquiry" id="product-name-for-enquiry" value="<?php echo esc_html( $product_obj->get_name() ); ?>" />
            <input type="hidden" name="product_url_for_enquiry" id="product-url-for-enquiry" value="<?php echo esc_url( get_permalink( $product_obj->get_id() ) ); ?>" />
            <input type="hidden" name="product_id_for_enquiry" id="product-id-for-enquiry" value="<?php echo esc_html( $product_obj->get_id() ); ?>" />
            <input type="hidden" name="enquiry_product_type" id="enquiry-product-type" value="
            <?php
			if ( $product_obj && $product_obj->is_type( 'variable' ) ) {
				echo 'variable';
			}
			?>
                " />
            <input type="hidden" name="user_id_for_enquiry" id="user-id-for-enquiry" value="<?php echo esc_html( get_current_user_id() ); ?>" />  			
        </div>
        <div id="catalogx-modal" style="display: none;" class="catalogx-modal <?php echo ( CatalogX()->setting->get_setting( 'is_disable_popup' ) === 'popup' ) ? 'popup-enable' : ''; ?>">
        </div>	
        <?php
    }

    /**
     * Enquiry button exclusion
     *
     * @return void
     */
    public function enquiry_button_exclusion() {
        global $post;

        if ( ! Util::is_available_for_product( $post->ID ) ) {
            remove_action( 'display_shop_page_button', array( $this, 'catalogx_add_enquiry_button' ) );
        } else {
            add_action( 'display_shop_page_button', array( $this, 'catalogx_add_enquiry_button' ) );
        }
    }

    /**
     * Enqueue script
     *
     * @return void
     */
    public function frontend_scripts() {
        FrontendScripts::load_scripts();
        FrontendScripts::localize_scripts( 'catalogx-enquiry-frontend-script' );
        FrontendScripts::localize_scripts( 'catalogx-enquiry-form-script' );

        if ( is_product() || CatalogX()->render_enquiry_btn_via = 'shortcode' ) {
            FrontendScripts::enqueue_style( 'catalogx-enquiry-form-style' );
            FrontendScripts::enqueue_style( 'catalogx-frontend-style' );
            FrontendScripts::enqueue_script( 'catalogx-enquiry-frontend-script' );
            FrontendScripts::enqueue_script( 'catalogx-enquiry-form-script' );

            // additional css.
            $additional_css_settings = CatalogX()->setting->get_setting( 'custom_css_product_page' );
            if ( isset( $additional_css_settings ) && ! empty( $additional_css_settings ) ) {
                wp_add_inline_style( 'catalogx-enquiry-form-style', $additional_css_settings );
            }
        }
    }

    /**
     * Get the free form field settings for the enquiry form.
     *
     * @return array List of freeform field settings.
     */
    public static function catalogx_free_form_settings() {
        $form_settings = CatalogX()->setting->get_option( 'catalogx_enquiry_form_customization_settings', array() );

        if ( function_exists( 'icl_t' ) ) {
            foreach ( $form_settings['freefromsetting'] as &$free_field ) {
                if ( isset( $free_field['label'] ) ) {
                    $free_field['label'] = icl_t( 'catalogx', 'free_form_label_' . $free_field['key'], $free_field['label'] );
                }
            }
        }

        return $form_settings['freefromsetting'];
    }

    /**
     * Get the pro form field settings for the enquiry form.
     *
     * @return array List of pro enquiry form field settings.
     */
    public static function catalogx_pro_form_settings() {
        $form_settings = CatalogX()->setting->get_option( 'catalogx_enquiry_form_customization_settings', array() );

        if ( function_exists( 'icl_t' ) ) {
            foreach ( $form_settings['formsettings']['formfieldlist'] as &$field ) {
                if ( isset( $field['label'] ) ) {
                    $field['label'] = icl_t( 'catalogx', 'form_field_label_' . $field['id'], $field['label'] );
                }
                if ( isset( $field['placeholder'] ) ) {
                    $field['placeholder'] = icl_t( 'catalogx', 'form_field_placeholder_' . $field['id'], $field['placeholder'] );
                }
                if ( isset( $field['options'] ) ) {
                    foreach ( $field['options'] as &$option ) {
                        $option['label'] = icl_t( 'catalogx', 'form_field_option_' . $field['id'] . '_' . $option['value'], $option['label'] );
                    }
                }
            }
        }

        return $form_settings['formsettings'];
    }

    /**
     * Enquiry button shortcode
     *
     * @param array $attr Shortcode attribute.
     * @return string
     */
    public function catalogx_enquiry_button_shortcode( $attr ) {
        global $product;
        if ( empty( trim( CatalogX()->render_enquiry_btn_via ) ) ) {
            CatalogX()->render_enquiry_btn_via = 'shortcode';
            ob_start();
            $product_id = isset( $attr['product_id'] ) ? (int) $attr['product_id'] : $product->get_id();
            $this->add_enquiry_button( $product_id );
            return ob_get_clean();
        }
    }

    /**
     * Add enquiry button in shop page
     *
     * @return void
     */
    public function add_button_in_shop_page() {
        global $product;
        if ( ! Util::is_available_for_product( $product->get_id() ) ) {
            return;
        }

        if ( ! empty( CatalogX()->setting->get_setting( 'is_enable_out_of_stock' ) ) ) {
            if ( $product->is_in_stock() ) {
                return;
            }
        }

        if ( apply_filters( 'catalogx_enable_multiple_product_enquiry', false ) ) {
            return;
        }

        $button_settings  = CatalogX()->setting->get_setting( 'enquiry_button', array() );
        $button_css       = Utill::get_button_styles( $button_settings );
        $button_hover_css = Utill::get_button_styles( $button_settings, true );
        if ( $button_hover_css ) {
            echo '<style>
                .single_add_to_cart_button:hover{
                ' . esc_html( $button_hover_css ) . '
                } 
            </style>';
        }

        $additional_css_settings = CatalogX()->setting->get_setting( 'custom_css_product_page' );
        if ( isset( $additional_css_settings ) && ! empty( $additional_css_settings ) ) {
            $button_css .= $additional_css_settings;
        }
        $button_text = ! empty( $button_settings['button_text'] ) ? $button_settings['button_text'] : \CatalogX\Utill::get_translated_string( 'send_an_enquiry', 'Send an enquiry' );
        if ( is_shop() ) {
            $product_link = get_permalink( $product->get_id() );
            echo '<a href="' . esc_url( $product_link ) . '" class="single_add_to_cart_button button wp-block-button__link" style="' . esc_attr( $button_css ) . '">' . esc_html( $button_text ) . '</a>';
        }
    }
}