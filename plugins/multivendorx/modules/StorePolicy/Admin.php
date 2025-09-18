<?php
/**
 * MultiVendorX Admin class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\StorePolicy;

/**
 * MultiVendorX Store Policy Admin class
 *
 * @class       Admin class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Admin {

    public function __construct() {
        add_filter( 'woocommerce_product_data_tabs', array( $this, 'add_policy_tab_in_product' ) );
        add_action( 'woocommerce_product_data_panels', array( $this, 'add_policy_product_data_panels' ) );
        add_action( 'woocommerce_process_product_meta', array( $this, 'save_policy_in_product' ) );
    }

    public function add_policy_tab_in_product( $product_data_tabs ) {
		$product_data_tabs['policy'] = array(
			'label'  => __( 'Policy', 'multivendorx' ),
			'target' => 'multivendorx-policy-tab',
		);
		return $product_data_tabs;
	}

    public function add_policy_product_data_panels() {
        global $post;

        $shipping_policy = get_post_meta( $post->ID, 'multivendorx_shipping_policy', true );
        $refund_policy = get_post_meta( $post->ID, 'multivendorx_refund_policy', true );
        $cancellation_policy = get_post_meta( $post->ID, 'multivendorx_cancellation_policy', true );
        ?>
        <div id="multivendorx-policy-tab" class="panel woocommerce_options_panel hidden">
            <div class="options_group">
                <p class="form-field">
                    <?php
                    if ( function_exists( 'wp_editor' ) ) { ?>
                        <label><?php _e( 'Shipping Policy', 'multivendorx' ); ?></label>
                        <?php
                        // Show TinyMCE editor
                        wp_editor( 
                            $shipping_policy, 
                            'shipping_policy', 
                            array(
                                'textarea_name' => 'shipping_policy',
                                'textarea_rows' => 10,
                                'media_buttons' => false,
                                'teeny'         => false,
                            ) 
                        );
                    } else {
                        woocommerce_wp_text_input(
                            array(
                                'id'          => 'shipping_policy',
                                'label'       => __( 'Shipping Policy', 'multivendorx' ),
                                'description' => __( 'Shipping Policy.', 'multivendorx' ),
                                'desc_tip'    => true,
                                'value'       => $shipping_policy ?? '',
                            )
                        );
                    }
                    ?>
                </p>
            </div>
            <div class="options_group">
                <p class="form-field">
                    <?php
                    if ( function_exists( 'wp_editor' ) ) {
                        ?>
                        <label><?php _e( 'Refund Policy', 'multivendorx' ); ?></label>
                        <?php
                        // Show TinyMCE editor
                        wp_editor( 
                            $refund_policy, 
                            'refund_policy', 
                            array(
                                'textarea_name' => 'refund_policy',
                                'textarea_rows' => 10,
                                'media_buttons' => false,
                                'teeny'         => false,
                            ) 
                        );
                    } else {
                        woocommerce_wp_text_input(
                            array(
                                'id'          => 'multivendorx_refund_policy',
                                'label'       => __( 'Refund Policy', 'multivendorx' ),
                                'description' => __( 'Refund Policy.', 'multivendorx' ),
                                'desc_tip'    => true,
                                'value'       => $refund_policy ?? '',
                            )
                        );
                    }
                    ?>
                </p>
            </div>
            <div class="options_group">
                <p class="form-field">

                    <?php
                    if ( function_exists( 'wp_editor' ) ) { ?>
                        <label><?php _e( 'Cancellation Policy', 'multivendorx' ); ?></label>
                        <?php
                        // Show TinyMCE editor
                        wp_editor( 
                            $cancellation_policy, 
                            'cancellation_policy', 
                            array(
                                'textarea_name' => 'cancellation_policy',
                                'textarea_rows' => 10,
                                'media_buttons' => false,
                                'teeny'         => false,
                            ) 
                        );
                    } else {
                        woocommerce_wp_text_input(
                            array(
                                'id'          => 'cancellation_policy',
                                'label'       => __( 'Cancellation Policy', 'multivendorx' ),
                                'description' => __( 'Cancellation Policy.', 'multivendorx' ),
                                'desc_tip'    => true,
                                'value'       => $cancellation_policy ?? '',
                            )
                        );
                    }
                    ?>
                </p>
            </div>
        </div>
        <?php

    }

    public function save_policy_in_product($post_id) {
        $shipping_policy     = wp_kses_post( filter_input( INPUT_POST, 'shipping_policy', FILTER_UNSAFE_RAW ) );
        $refund_policy       = wp_kses_post( filter_input( INPUT_POST, 'refund_policy', FILTER_UNSAFE_RAW ) );
        $cancellation_policy = wp_kses_post( filter_input( INPUT_POST, 'cancellation_policy', FILTER_UNSAFE_RAW ) );

        if ( $shipping_policy ) {
            update_post_meta( $post_id, 'multivendorx_shipping_policy', $shipping_policy );
        }

        if ( $refund_policy ) {
            update_post_meta( $post_id, 'multivendorx_refund_policy', $refund_policy );
        }

        if ( $cancellation_policy ) {
            update_post_meta( $post_id, 'multivendorx_cancellation_policy', $cancellation_policy );
        }
    }
}