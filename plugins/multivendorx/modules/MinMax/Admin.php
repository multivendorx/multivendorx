<?php
/**
 * MultiVendorX Admin class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\MinMax;

use MultiVendorX\Utill;

/**
 * MultiVendorX MinMax Admin class
 *
 * @class       Admin class
 * @version     5.0.0
 * @author      MultiVendorX
 */
class Admin {
    /**
     * Admin class constructor function.
     */
    public function __construct() {
        add_action( 'woocommerce_product_options_general_product_data', array( $this, 'add_meta_fields' ) );
        add_action( 'woocommerce_process_product_meta', array( $this, 'save_min_max_data' ) );
    }
	/**
	 * Add min/max quantity and amount meta fields to product edit page
	 *
	 * @return void
	 */
    public function add_meta_fields() {
        if ( ! Utill::current_user_has_capability( array( 'manage_woocommerce' ) ) ) {
            return;
        }

        $min_max_meta = get_post_meta( get_the_ID(), 'multivendorx_min_max_meta', true );

        echo '<div class="options_group show_if_simple">';

            woocommerce_wp_text_input(
                array(
                    'id'                => 'min_quantity',
                    'value'             => isset( $min_max_meta['min_quantity'] ) ? $min_max_meta['min_quantity'] : '',
                    'type'              => 'number',
                    'custom_attributes' => array(
                        'step' => 'any',
                        'min'  => '1',
                    ),
                    'label'             => __( 'Minimum quantity to order', 'multivendorx' ),
                )
            );
            woocommerce_wp_text_input(
                array(
                    'id'                => 'max_quantity',
                    'value'             => isset( $min_max_meta['max_quantity'] ) ? $min_max_meta['max_quantity'] : '',
                    'type'              => 'number',
                    'custom_attributes' => array(
                        'step' => 'any',
                        'min'  => '1',
                    ),
                    'label'             => __( 'Maximum quantity to order', 'multivendorx' ),
                )
            );

            woocommerce_wp_text_input(
                array(
                    'id'                => 'min_amount',
                    'value'             => isset( $min_max_meta['min_amount'] ) ? $min_max_meta['min_amount'] : '',
                    'data_type'         => 'price',
                    'type'              => 'number',
                    'custom_attributes' => array(
                        'step' => 'any',
                        'min'  => '0',
                    ),
                    'label'             => __( 'Minimum amount to order', 'multivendorx' ),
                )
            );
            woocommerce_wp_text_input(
                array(
                    'id'                => 'max_amount',
                    'value'             => isset( $min_max_meta['max_amount'] ) ? $min_max_meta['max_amount'] : '',
                    'data_type'         => 'price',
                    'type'              => 'number',
                    'custom_attributes' => array(
                        'step' => 'any',
                        'min'  => '0',
                    ),
                    'label'             => __( 'Maximum amount to order', 'multivendorx' ),
                )
            );
        echo '</div>';
    }
	/**
	 * Save min/max quantity and amount meta data
	 *
	 * @param int $product_id Product ID.
	 * @return void
	 */
    public function save_min_max_data( $product_id ) {
        $product = wc_get_product( $product_id );
        if ( ! $product instanceof \WC_Product ) {
            return;
        }

        $min_max_meta                 = array();
        $min_quantity                 = filter_input( INPUT_POST, 'min_quantity', FILTER_VALIDATE_INT );
        $min_max_meta['min_quantity'] = $min_quantity && $min_quantity > 0 ? absint( $min_quantity ) : 0;

        $max_quantity                 = filter_input( INPUT_POST, 'max_quantity', FILTER_VALIDATE_INT );
        $min_max_meta['max_quantity'] = $max_quantity && $max_quantity > 0 ? absint( $max_quantity ) : 0;

        $min_amount                 = filter_input( INPUT_POST, 'min_amount', FILTER_SANITIZE_NUMBER_FLOAT );
        $min_max_meta['min_amount'] = $min_amount && floatval( $min_amount ) > 0 ? wc_format_decimal( $min_amount ) : 0;

        $max_amount                 = filter_input( INPUT_POST, 'max_amount', FILTER_SANITIZE_NUMBER_FLOAT );
        $min_max_meta['max_amount'] = $max_amount && floatval( $max_amount ) > 0 ? wc_format_decimal( $max_amount ) : 0;

        $product->update_meta_data( 'multivendorx_min_max_meta', $min_max_meta );
        $product->save();
    }
}
