<?php
/**
 * MultiVendorX Frontend class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Refund;

use MultiVendorX\Utill;
use MultiVendorX\Store\Store;

/**
 * MultiVendorX Refund Frontend class
 *
 * @class       Frontend class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Frontend {

    /**
     * Frontend class constructor function.
     */
    public function __construct() {
        add_action( 'woocommerce_order_details_after_order_table', array( $this, 'multivendorx_refund_btn_customer_my_account' ), 10 );
        add_action( 'wp_enqueue_scripts', array( $this, 'add_scripts' ) );
        add_action( 'wp', array( $this, 'multivendorx_handler_cust_requested_refund' ) );
    }

    /**
     * Add refund button on customer my account order view page
     *
     * @param object $order Order object.
     */
    public function multivendorx_refund_btn_customer_my_account( $order ) {
        if ( ! is_wc_endpoint_url( 'view-order' ) ) {
            return;
        }
        if ( ! MultiVendorX()->order->is_multivendorx_order( $order->get_id() ) ) {
            return;
        }
        $allowed_statuses = MultiVendorX()->setting->get_setting( 'customer_refund_status', array() );
        // Get current order status.
        $order_status = $order->get_status(); // e.g., 'pending', 'completed'
        // Check if current order status is allowed.
        if ( ! in_array( $order_status, $allowed_statuses, true ) ) {
            return; // Don't show button.
        }
        $refund_days = (int) MultiVendorX()->setting->get_setting( 'refund_days', 0 );

        if ( $refund_days > 0 ) {
        
            $order_date = $order->get_date_created();
            if ( ! $order_date ) {
                return;
            }
        
            // Order created timestamp
            $order_ts = $order_date->getTimestamp();
        
            // Expiry timestamp
            $expiry_ts = strtotime( "+{$refund_days} days", $order_ts );
        
            // Current WP time
            $now_ts = current_time( 'timestamp' );
        
            // If expired → stop (no button)
            if ( $now_ts > $expiry_ts ) {
                return;
            }
        }
        

        $refund_settings       = MultiVendorX()->setting->get_option( 'multivendorx_order_actions_refunds_settings', array() );
        $refund_reason_options = MultiVendorX()->setting->get_setting( 'refund_reasons', array() );
        $refund_button_text    = apply_filters( 'mvx_customer_my_account_refund_request_button_text', __( 'Request a refund', 'multivendorx' ), $order );
        // Print refund messages, if any.
        $msg_data = $this->multivendorx_get_customer_refund_order_msg( $order, $refund_settings );

        if ( $msg_data ) {
            $type = isset( $msg_data['type'] ) ? sanitize_key( $msg_data['type'] ) : 'info';
            ?>
            <div class="woocommerce-Message woocommerce-Message--<?php echo esc_attr( $type ); ?> woocommerce-<?php echo esc_attr( $type ); ?>">
                <?php echo wp_kses_post( $msg_data['msg'] ); ?>
            </div>
            <?php
            return;
        }
        ?>
        <p><button type="button" class="button wp-element-button" id="cust-request-refund-btn" name="cust-request-refund-btn"
                value="<?php echo esc_attr( $refund_button_text ); ?>">
                <?php echo esc_html( $refund_button_text ); ?></button></p>
        <div id="multivendorx-myac-order-refund-wrap" class="multivendorx-myac-order-refund-wrap multivendorx-popup" style="display:none;">
            <form method="POST" enctype="multipart/form-data" class="multivendorx-popup-content">
                <span class="popup-close"><i class="dashicons dashicons-no-alt"></i></span>
                <?php wp_nonce_field( 'customer_request_refund', 'cust-request-refund-nonce' ); ?>
                <p class=" form-row form-row-wide">

                <label class="section-heading">
                    <?php echo esc_html__( 'Choose the product(s) you want a refund for', 'multivendorx' ); ?>
                </label>
                    <?php
                    foreach ( $order->get_items() as $item ) {
                        $product = $item->get_product();
                        if ( $product ) {
                            $product_image = $product->get_image();
                            ?>
                        <div class="order-refund-product-list">
                            <input class="product-select-tag" type="checkbox" name="refund_product[]" id="refund_product"
                                value="<?php echo esc_attr( $product->get_id() ); ?>">
                            <label>
                                <?php echo wp_kses_post( $product_image ); ?>
                                <?php echo esc_html( $product->get_name() ); ?>
                            </label>
                        </div>
							<?php
                        }
                    }
                    ?>
                </p>
                <p class=" form-row form-row-wide">
                <label
                    class="section-heading">
                    <?php
                    echo esc_html(
                        apply_filters(
                            'mvx_customer_my_account_refund_reason_label',
                            __( 'Please mention your reason for refund', 'multivendorx' ),
                            $order
                        )
                    );
					?>
                </label>
                <?php
                if ( $refund_reason_options ) {
                    foreach ( $refund_reason_options as $index => $reason ) {
                        echo '<p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                            <label class="refund_reason_option" for="refund_reason_option-' . esc_attr( $index ) . '">
                                <input type="radio" class="woocommerce-Input input-radio" name="refund_reason_option" id="refund_reason_option-' . esc_attr( $index ) . '" value="' . esc_attr( $index ) . '" />
                                ' . esc_html( $reason['label'] ) . '
                            </label></p>';
                    }
                    // Add others reason.
                    echo '<p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                        <label class="refund_reason_option" for="refund_reason_option-other">
                            <input type="radio" class="woocommerce-Input input-radio" name="refund_reason_option" id="refund_reason_option-other" value="others" />
                            ' . esc_html__( 'Others reason', 'multivendorx' ) . '
                        </label></p>';
                    ?>
                    <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide cust-rr-other">
                        <label for="refund_reason_other"><?php esc_html_e( 'Refund reason', 'multivendorx' ); ?></label>
                        <input type="text" class="woocommerce-Input input-text" name="refund_reason_other" id="refund_reason_other"
                            autocomplete="off" />
                    </p>
                    <?php
                } else {
                    ?>
                    <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                        <label for="refund_reason_other"><?php esc_html_e( 'Refund reason', 'multivendorx' ); ?></label>
                        <input type="text" class="woocommerce-Input input-text" name="refund_reason_other" id="refund_reason_other"
                            autocomplete="off" />
                    </p>
                    <?php
                }
                ?>
                </p>
                <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                    <label for="additional_info"><?php echo esc_html__( 'Provide additional information', 'multivendorx' ); ?></label>
                    <textarea class="woocommerce-Input input-text" name="refund_request_addi_info"
                        id="refund_request_addi_info"></textarea>
                </p>
                <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                    <label for="product_img"><?php echo esc_html__( 'Upload an image of the product', 'multivendorx' ); ?></label>
                    <input type="file" class="woocommerce-Input input-img" name="product_img[]" id="product_img"
                        accept="image/jpeg, image/png, image/gif, image/webp" multiple>
                    <small
                        style="display:block; color:#666;"><?php echo esc_html__( 'You can select multiple images.', 'multivendorx' ); ?></small>
                </p>

                <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                    <button type="submit" class="button wp-element-button" name="cust_request_refund_sbmt"
                        value="<?php echo esc_attr__( 'Submit', 'multivendorx' ); ?>"><?php echo esc_html__( 'Submit', 'multivendorx' ); ?></button>
                </p>
            </form>
        </div>
        <?php
    }

    /**
     * Add scripts
     */
    public function add_scripts() {
        wp_add_inline_script(
            'woocommerce',
            '( function( $ ) {
            $("#multivendorx-myac-order-refund-wrap").hide();
            $("#multivendorx-myac-order-refund-wrap .cust-rr-other").hide();
            $("#multivendorx-myac-order-refund-wrap .refund_reason_option input").on("click", function(){
                var others_checked = $("input:radio[name=refund_reason_option]:checked").val();
                if(others_checked == "others"){
                    $("#multivendorx-myac-order-refund-wrap .cust-rr-other").show();
                }else{
                    $("#multivendorx-myac-order-refund-wrap .cust-rr-other").hide();
                }
            });
			$("#cust-request-refund-btn").click(function(){
				$("#multivendorx-myac-order-refund-wrap").slideToggle();
			});
		} )( jQuery );'
        );
    }

    /**
     * Get customer refund order messages
     *
     * @param object $order Order object.
     * @param array  $settings Settings array.
     */
    public function multivendorx_get_customer_refund_order_msg( $order, $settings = array() ) {
        if ( ! $order ) {
            return false;
        }
        $default_msg = apply_filters(
            'mvx_customer_my_account_refund_order_messages',
            array(
				'order_status_not_allowed'      => __( 'Refund is not allowed for the current order status.', 'multivendorx' ),
				'order_refund_period_overed'    => __( 'Your refund period has expired', 'multivendorx' ),
				'order_refund_rejected'         => __( '*** Your request has been rejected ***', 'multivendorx' ),
				'order_refund_request_pending'  => __( 'Your request is pending.', 'multivendorx' ),
				'order_refund_request_accepted' => __( '*** Your request has been accepted. *** ', 'multivendorx' ),
            ),
            $order,
            $settings
        );

        $cust_refund_status = $order->get_meta( '_customer_refund_order', true ) ? $order->get_meta( '_customer_refund_order', true ) : '';
        $refund_days_limit  = MultiVendorX()->setting->get_setting( 'refund_days' ) ? absint( MultiVendorX()->setting->get_setting( 'refund_days' ) ) : apply_filters( 'mvx_customer_refund_order_default_days_limit', 10, $order );
        $order_date         = $order->get_date_created()->format( 'Y-m-d' );
        $order_place_days   = time() - strtotime( $order_date );
        $message            = array();

        if ( abs( round( $order_place_days / 86400 ) ) > $refund_days_limit ) {
            $message['type'] = 'info';
            $message['msg']  = isset( $default_msg['order_refund_period_overed'] ) ? $default_msg['order_refund_period_overed'] : __( 'Your refund period has expired.', 'multivendorx' );
        }
        if ( ! in_array( $order->get_status(), MultiVendorX()->setting->get_setting( 'customer_refund_status', array() ), true ) ) {
            $message['type'] = 'info';
            $message['msg']  = isset( $default_msg['order_status_not_allowed'] ) ? $default_msg['order_status_not_allowed'] : __( 'Refund is not allowed for the current order status.', 'multivendorx' );
        }
        if ( 'refund_reject' === $cust_refund_status ) {
            $message['type'] = 'error';
            $message['msg']  = isset( $default_msg['order_refund_rejected'] ) ? $default_msg['order_refund_rejected'] : __( 'Sorry!! Your request has been rejected', 'multivendorx' );
        } elseif ( 'refund_request' === $cust_refund_status ) {
            $message['type'] = 'warning';
            $message['msg']  = isset( $default_msg['order_refund_request_pending'] ) ? $default_msg['order_refund_request_pending'] : __( 'Your request is pending.', 'multivendorx' );
        } elseif ( 'refund_accept' === $cust_refund_status ) {
            $message['type'] = 'success';
            $message['msg']  = isset( $default_msg['order_refund_request_accepted'] ) ? $default_msg['order_refund_request_accepted'] : __( 'Congratulation: *** Your request has been accepted. *** ', 'multivendorx' );
        }

        return $message;
    }

    /**
     * Handle customer requested refund action.
     *
     * @return void
     */
    public function multivendorx_handler_cust_requested_refund() {
        global $wp;

        // Sanitize POST data.
        $data = filter_input_array(
            INPUT_POST,
            array(
                'cust-request-refund-nonce' => FILTER_SANITIZE_FULL_SPECIAL_CHARS,
                'refund_product'            => array(
                    'filter' => FILTER_SANITIZE_FULL_SPECIAL_CHARS,
                    'flags'  => FILTER_REQUIRE_ARRAY,
                ),
                'refund_reason_option'      => FILTER_SANITIZE_FULL_SPECIAL_CHARS,
                'refund_reason_other'       => FILTER_SANITIZE_FULL_SPECIAL_CHARS,
                'refund_request_addi_info'  => FILTER_SANITIZE_FULL_SPECIAL_CHARS,
            )
        );

        $nonce_value = $data['cust-request-refund-nonce'] ?? '';

        if ( ! wp_verify_nonce( $nonce_value, 'customer_request_refund' ) ) {
            return;
        }

        if ( empty( $data['refund_product'] ) ) {
            wc_add_notice( __( 'Kindly choose a product', 'multivendorx' ), 'error' );
            return;
        }

        if ( empty( $data['refund_reason_option'] ) ) {
            wc_add_notice( __( 'Kindly choose a refund reason', 'multivendorx' ), 'error' );
            return;
        }

        if ( ! isset( $wp->query_vars['view-order'] ) ) {
            return;
        }

        $order_id = absint( $wp->query_vars['view-order'] );
        $order    = wc_get_order( $order_id );

        // Clean request values.
        $reason_option            = wc_clean( $data['refund_reason_option'] ?? '' );
        $refund_reason_other      = wc_clean( $data['refund_reason_other'] ?? '' );
        $refund_request_addi_info = wc_clean( $data['refund_request_addi_info'] ?? '' );
        $refund_product           = array_map( 'wc_clean', (array) ( $data['refund_product'] ?? array() ) );

        // Build refund reason.
        $refund_reason_options = MultiVendorX()->setting->get_setting( 'refund_reasons', array() );
        $refund_reason         = ( 'others' === $reason_option )
            ? $refund_reason_other
            : ( $refund_reason_options[ $reason_option ]['label'] ?? '' );

        $uploaded_image_urls = array();
        $attach_ids          = array();

        /**
         * Handle uploaded images safely.
         *
         * PHPCS: The $_FILES superglobal cannot be sanitized using filter_input().
         * All indexes are validated, mime types checked, filenames sanitized.
         */
        /* phpcs:disable WordPress.Security.ValidatedSanitizedInput.InputNotSanitized */
        if ( isset( $_FILES['product_img'] ) ) {
            $file_names  = isset( $_FILES['product_img']['name'] ) ? (array) $_FILES['product_img']['name'] : array();
            $file_types  = isset( $_FILES['product_img']['type'] ) ? (array) $_FILES['product_img']['type'] : array();
            $file_tmp    = isset( $_FILES['product_img']['tmp_name'] ) ? (array) $_FILES['product_img']['tmp_name'] : array();
            $file_errors = isset( $_FILES['product_img']['error'] ) ? (array) $_FILES['product_img']['error'] : array();
            $file_sizes  = isset( $_FILES['product_img']['size'] ) ? (array) $_FILES['product_img']['size'] : array();

            require_once ABSPATH . 'wp-admin/includes/file.php';
            require_once ABSPATH . 'wp-admin/includes/image.php';

            $max_file_size = 10 * 1024 * 1024; // 10MB
            $allowed_mimes = array(
                'jpg|jpeg|jpe' => 'image/jpeg',
                'gif'          => 'image/gif',
                'png'          => 'image/png',
                'webp'         => 'image/webp',
            );

            foreach ( $file_names as $index => $name ) {
                if (
                    empty( $name ) ||
                    ! isset(
                        $file_errors[ $index ],
                        $file_sizes[ $index ],
                        $file_types[ $index ],
                        $file_tmp[ $index ]
                    )
                ) {
                    continue;
                }

                $sanitized_name = sanitize_file_name( $name );

                if ( UPLOAD_ERR_OK !== (int) $file_errors[ $index ] ) {
                    continue;
                }

                if ( (int) $file_sizes[ $index ] > $max_file_size ) {
                    continue;
                }

                $file_type = wp_check_filetype( $sanitized_name, $allowed_mimes );
                if ( empty( $file_type['type'] ) ) {
                    continue;
                }

                $file = array(
                    'name'     => $sanitized_name,
                    'type'     => sanitize_mime_type( $file_types[ $index ] ),
                    'tmp_name' => $file_tmp[ $index ],
                    'error'    => (int) $file_errors[ $index ],
                    'size'     => (int) $file_sizes[ $index ],
                );

                $upload = wp_handle_upload( $file, array( 'test_form' => false ) );

                if ( $upload && ! isset( $upload['error'] ) ) {
                    $uploaded_image_urls[] = esc_url_raw( $upload['url'] );

                    $attachment = array(
                        'guid'           => $upload['url'],
                        'post_mime_type' => $upload['type'],
                        'post_title'     => sanitize_text_field( pathinfo( $sanitized_name, PATHINFO_FILENAME ) ),
                        'post_content'   => '',
                        'post_status'    => 'inherit',
                    );

                    $attach_id = wp_insert_attachment( $attachment, $upload['file'] );

                    if ( $attach_id ) {
                        $attach_data = wp_generate_attachment_metadata( $attach_id, $upload['file'] );
                        wp_update_attachment_metadata( $attach_id, $attach_data );
                        $attach_ids[] = $attach_id;
                    }
                }
            }
        }
        /* phpcs:enable WordPress.Security.ValidatedSanitizedInput.InputNotSanitized */

        // Save order meta.
        $order->update_meta_data( Utill::ORDER_META_SETTINGS['customer_refund_order'], 'refund_request' );
        $order->update_meta_data( Utill::ORDER_META_SETTINGS['customer_refund_reason'], $refund_reason );
        $order->update_meta_data( Utill::ORDER_META_SETTINGS['customer_refund_product'], $refund_product );
        $order->update_meta_data( Utill::ORDER_META_SETTINGS['customer_refund_product_imgs'], $uploaded_image_urls );
        $order->update_meta_data( Utill::ORDER_META_SETTINGS['customer_refund_product_img_ids'], $attach_ids );
        $order->update_meta_data( Utill::ORDER_META_SETTINGS['customer_refund_addi_info'], $refund_request_addi_info );

        $order->set_status( 'refund-requested' );
        $order->save();

        $store_id = $order->get_meta( Utill::POST_META_SETTINGS['store_id'], true );
        $store = new Store($store_id);

        do_action(
            'multivendorx_notify_refund_requested',
                'refund_requested',
                array(
                    'admin_email' => MultiVendorX()->setting->get_setting( 'sender_email_address' ),
                    'admin_phn' => MultiVendorX()->setting->get_setting( 'sms_receiver_phone_number' ),
                    'store_phn' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['phone'] ),
                    'store_email' => $store->get_meta( Utill::STORE_SETTINGS_KEYS['primary_email'] ),
                    'customer_email' => $order->get_billing_email(),
                    'customer_phn' => $order->get_billing_phone(),
                    'order_id'    => $order->get_id(),
                    'category'    => 'activity',
                )
            );

        // Add order note with proper escaping.
        $user_info = get_userdata( get_current_user_id() );

        $comment_id = $order->add_order_note(
            sprintf(
                'Customer requested a refund for order %d.',
                (int) $order_id
            )
        );

        wp_update_comment(
            array(
                'comment_ID'           => $comment_id,
                'comment_author'       => sanitize_text_field( $user_info->user_login ),
                'comment_author_email' => sanitize_email( $user_info->user_email ),
            )
        );

        // Handle parent order.
        $parent_order_id = $order->get_parent_id();
        if ( $parent_order_id ) {
            $parent_order = wc_get_order( $parent_order_id );

            $comment_parent = $parent_order->add_order_note(
                sprintf(
                    'Customer requested a refund for child order %d.',
                    (int) $order_id
                )
            );

            wp_update_comment(
                array(
                    'comment_ID'           => $comment_parent,
                    'comment_author'       => sanitize_text_field( $user_info->user_login ),
                    'comment_author_email' => sanitize_email( $user_info->user_email ),
                )
            );
        }

        wc_add_notice( __( 'Refund request successfully submitted.', 'multivendorx' ) );
    }
}
