<?php
/**
 * Enquiry module Frontend class file
 *
 * @package CatalogX
 */

namespace CatalogX\Enquiry;

use CatalogX\FrontendScripts;

/**
 * CatalogX Enquiry Module Frontend class
 *
 * @class       Frontend class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Frontend {
    private $enquiry_user_permission;
    private $enable_out_of_stock;

    /**
     * Frontend class constructor function.
     */
    public function __construct() {
        // Enquiry button shortcode.
        add_shortcode( 'catalogx_enquiry_button', array( $this, 'render_enquiry_button_shortcode' ) );
        
        // Check the exclusion.
        if ( ! Util::is_available() ) {
            return;
        }
        $this->enquiry_user_permission = CatalogX()->setting->get_setting( 'enquiry_user_permission', array() );
        if ( ! empty( $this->enquiry_user_permission ) && ! is_user_logged_in() ) {
            return;
        }
        $this->enable_out_of_stock      = CatalogX()->setting->get_setting( 'is_enable_out_of_stock' );

        if ( empty( CatalogX()->setting->get_setting( 'enable_cart_checkout' ) ) ) {
            add_action( 'woocommerce_after_shop_loop_item', array( $this, 'render_button_in_shop_page' ) );
        }

        add_action( 'woocommerce_single_product_summary', array( $this, 'catalogx_add_enquiry_button' ) );

        add_action( 'wp_enqueue_scripts', array( $this, 'frontend_scripts' ) );
    }

    /**
     * Adds enquiry button on shop page via hook.
     *
     * @return void
     */
    public function catalogx_add_enquiry_button() {
        global $product;
        if ( ! Util::is_available_for_product( $product->get_id() ) ) {
            return;
        }
        if ( empty( trim( CatalogX()->render_enquiry_btn_via ) ) ) {
            CatalogX()->render_enquiry_btn_via = 'hook';
            $this->render_product_enquiry_button( $product );
        }
    }

    /**
     * Add enquiry button in single product page and shop page
     *
     * @param int|\WC_Product|null $product_obj Product object or ID. Falls back to global $product if null.
     * @return void
     */
    public function render_product_enquiry_button( $product_obj ) {
        global $product;
        $product_obj = is_int( $product_obj ) ? wc_get_product( $product_obj ) : ( $product_obj ? $product_obj : $product );        
        if ( empty( $product_obj ) ) {
            return;
        }

        if ( apply_filters( 'catalogx_enable_multiple_product_enquiry', false ) ) {
            return;
        }

        $button_text = \CatalogX\Utill::get_translated_string( 'catalogx', 'send_an_enquiry', 'Send an enquiry' );

        ?>
        <div id="catalogx-enquiry">
        <?php
		$show_button = true;
        if ( $this->enable_out_of_stock ) {
            $show_button = ! $product_obj->managing_stock() && ! $product_obj->is_in_stock();
        }       
		if ( $show_button ) {
            ?>
                <button class="catalogx-enquiry-btn button wp-block-button__link update-cart-button"><?php echo esc_html( $button_text ); ?></button>
            <?php
		}
		?>
            <input type="hidden" name="product_id_for_enquiry" id="product-id-for-enquiry" value="<?php echo esc_html( $product_obj->get_id() ); ?>" />
            <input type="hidden" name="enquiry_product_type" id="enquiry-product-type" value="
            <?php
			if ( $product_obj && $product_obj->is_type( 'variable' ) ) {
				echo esc_html( 'variable' );
			}
			?>
                " />
            <input type="hidden" name="user_id_for_enquiry" id="user-id-for-enquiry" value="<?php echo esc_html( get_current_user_id() ); ?>" />  			
        </div>
        <div id="catalogx-modal" style="display: none;" class="catalogx-modal <?php echo ( CatalogX()->setting->get_setting( 'is_disable_popup' ) === 'popup' ) ? 'popup-enable' : ''; ?>">
            <span class="dashicons dashicons-no-alt"></span>
        </div>	
        <?php
    }

    /**
     * Enqueue script
     *
     * @return void
     */
    public function frontend_scripts() {
        if ( is_product() || CatalogX()->render_enquiry_btn_via === 'shortcode' || CatalogX()->render_enquiry_btn_via === 'block') {
            FrontendScripts::enqueue_frontend_assets();
            FrontendScripts::enqueue_style( 'catalogx-enquiry-form-style' );
            FrontendScripts::enqueue_style( 'catalogx-frontend-style' );
            FrontendScripts::enqueue_script( 'catalogx-enquiry-frontend-script' );
            FrontendScripts::localize_scripts( 'catalogx-enquiry-frontend-script' );
            FrontendScripts::enqueue_script( 'catalogx-enquiry-form-script' );
            FrontendScripts::localize_scripts( 'catalogx-enquiry-form-script' );

            // additional css.
            $custom_css = CatalogX()->setting->get_setting( 'custom_css_product_page' );
		if ( ! empty( $custom_css ) ) {
			wp_add_inline_style( 'catalogx-enquiry-form-style', $custom_css );
		}
        }
    }

    /**
     * Get the free form field settings for the enquiry form.
     *
     * @return array List of freeform field settings.
     */
    public static function catalogx_free_form_settings() {
        $form_settings = CatalogX()->setting->get_option(
            'catalogx_enquiry_form_customization_settings',
            array()
        );

        $free_form_settings = isset( $form_settings['enquiry_form_tabs']['free_enquiry_form'] ) &&
            is_array( $form_settings['enquiry_form_tabs']['free_enquiry_form'] )
            ? $form_settings['enquiry_form_tabs']['free_enquiry_form']
            : array();

        if ( function_exists( 'icl_t' ) ) {
            foreach ( $free_form_settings as &$free_field ) {
                if ( isset( $free_field['label'] ) ) {
                    $free_field['label'] = icl_t(
                        'catalogx',
                        'free_form_label_' . $free_field['key'],
                        $free_field['label']
                    );
                }
            }
        }

        return $free_form_settings;
    }

    /**
     * Get the pro form field settings for the enquiry form.
     *
     * @return array List of pro enquiry form field settings.
     */
    public static function catalogx_pro_form_settings() {
        $form_settings = CatalogX()->setting->get_option(
            'catalogx_enquiry_form_customization_settings',
            array()
        );

        $pro_form_settings = isset( $form_settings['enquiry_form_tabs']['enquiry_form_builder'] ) &&
            is_array( $form_settings['enquiry_form_tabs']['enquiry_form_builder'] )
            ? $form_settings['enquiry_form_tabs']['enquiry_form_builder']
            : array();

        $form_field_list = isset( $pro_form_settings['formfieldlist'] ) &&
            is_array( $pro_form_settings['formfieldlist'] )
            ? $pro_form_settings['formfieldlist']
            : array();
        $form_field_list = array_map(
            function ( $field ) {

                if ( isset( $field['type'] ) ) {
                    $field['key'] = $field['type'];
                }

                $field['active'] = true;

                return $field;
            },
            $form_field_list
        );

        if ( function_exists( 'icl_t' ) ) {
            foreach ( $form_field_list as &$field ) {
                if ( isset( $field['label'] ) ) {
                    $field['label'] = icl_t(
                        'catalogx',
                        'form_field_label_' . $field['id'],
                        $field['label']
                    );
                }

                if ( isset( $field['placeholder'] ) ) {
                    $field['placeholder'] = icl_t(
                        'catalogx',
                        'form_field_placeholder_' . $field['id'],
                        $field['placeholder']
                    );
                }

                if ( isset( $field['options'] ) && is_array( $field['options'] ) ) {
                    foreach ( $field['options'] as &$option ) {
                        $option['label'] = icl_t(
                            'catalogx',
                            'form_field_option_' . $field['id'] . '_' . $option['value'],
                            $option['label']
                        );
                    }
                }
            }
        }

        return $form_field_list;
    }

    /**
     * Enquiry button shortcode
     *
     * @param array $shortcode_attributes Shortcode attribute.
     * @return string
     */
    public function render_enquiry_button_shortcode( $shortcode_attributes ) {
        global $product;

        if ( ! Util::is_available() ) {
            return '';
        }

        $display_enquiry_button = $this->enquiry_user_permission;
        if ( ! empty( $display_enquiry_button ) && ! is_user_logged_in() ) {
            return '';
        }

        CatalogX()->render_enquiry_btn_via = 'shortcode';

        ob_start();

        $product_id = 0;

        if ( ! empty( $shortcode_attributes['product_id'] ) ) {
            $product_id = absint( $shortcode_attributes['product_id'] );
        } elseif ( $product instanceof \WC_Product ) {
            $product_id = $product->get_id();
        }

        if ( $product_id ) {
            $this->render_product_enquiry_button( $product_id );
        }

        return ob_get_clean();
    }

    /**
     * Add enquiry button in shop page
     *
     * @return void
     */
    public function render_button_in_shop_page() {
        global $product;
        if ( ! Util::is_available_for_product( $product->get_id() ) ) {
            return;
        }

        if ( ! empty( $this->enable_out_of_stock ) && $product->is_in_stock() ) {
            return;
        }

        if ( apply_filters( 'catalogx_enable_multiple_product_enquiry', false ) ) {
            return;
        }

        $button_text = \CatalogX\Utill::get_translated_string( 'catalogx', 'send_an_enquiry', 'Send an enquiry' );
        if ( is_shop() ) {
            $product_link = get_permalink( $product->get_id() );
            echo '<a href="' . esc_url( $product_link ) . '" class="enquiry-btn single_add_to_cart_button button wp-block-button__link" >' . esc_html( $button_text ) . '</a>';
        }
    }
}