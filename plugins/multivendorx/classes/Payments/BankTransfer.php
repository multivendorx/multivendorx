<?php
/**
 * Bank transfer payment gateway class.
 *
 * @package MultiVendorX\Payments
 */

namespace MultiVendorX\Payments;

use MultiVendorX\Store\Store;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Bank transfer payment gateway.
 *
 * @class       Module class
 * @version     5.0.0
 * @author      MultiVendorX
 */
class BankTransfer {

    /**
     * Constructor.
     */
    public function __construct() {
        add_action( 'multivendorx_process_bank-transfer_payment', array( $this, 'process_payment' ), 10, 6 );
    }

    /**
     * Get payment gateway id.
     *
     * @return string
     */
    public function get_id() {
        return 'bank-transfer';
    }

    /**
     * Get payment gateway settings.
     *
     * @return array
     */
    public function get_settings() {
        return array(
            'icon'       => 'bank',
            'id'         => $this->get_id(),
            'label'      => 'Bank Transfer',
            'disableBtn' => true,
            'desc'       => 'Transfer payouts directly to store’s bank accounts.',
            'formFields' => array(
                array(
                    'key'            => 'bank_details',
                    'type'           => 'checkbox',
                    'selectDeselect' => true,
                    'addNewBtnText'  => __( 'Add custom field', 'multivendorx' ),

                    'label'          => __( 'Bank details required from the store', 'multivendorx' ),
                    'options'        => array(
                        array(
                            'key'   => 'bank_name',
                            'label' => __( 'Bank name', 'multivendorx' ),
                            'value' => 'bank_name',
                            'edit'  => false,
                        ),
                        array(
                            'key'   => 'account_holder_name',
                            'label' => __( 'Account holder Name', 'multivendorx' ),
                            'value' => 'account_holder_name',
                            'edit'  => false,
                        ),
                        array(
                            'key'   => 'account_number',
                            'label' => __( 'Account number', 'multivendorx' ),
                            'value' => 'account_number',
                            'edit'  => false,
                        ),
                        array(
                            'key'   => 'routing_number',
                            'label' => __( 'ABA routing number', 'multivendorx' ),
                            'value' => 'routing_number',
                            'edit'  => false,
                        ),
                        array(
                            'key'   => 'destination_currency',
                            'label' => __( 'Destination currency', 'multivendorx' ),
                            'value' => 'destination_currency',
                            'edit'  => false,
                        ),
                        array(
                            'key'   => 'bank_address',
                            'label' => __( 'Bank address', 'multivendorx' ),
                            'value' => 'bank_address',
                            'edit'  => false,
                        ),
                        array(
                            'key'   => 'iban',
                            'label' => __( 'IBAN', 'multivendorx' ),
                            'value' => 'iban',
                            'edit'  => false,
                        ),
                    ),
                ),
            ),
        );
    }

    /**
     * Get store payment settings.
     */
    public function get_store_payment_settings() {
        $payment_admin_settings = MultiVendorX()->setting->get_setting( 'payment_methods', array() );

        $settings = ! empty( $payment_admin_settings['bank-transfer'] ) ? $payment_admin_settings['bank-transfer'] : array();

        if ( ! empty( $settings ) && $settings['enable'] ) {
            $fields = array(
                array(
                    'key'     => 'account_type',
                    'type'    => 'choice-toggle',
                    'label'   => __( 'Account type', 'multivendorx' ),
                    'options' => array(
                        array(
                            'key'   => 'current',
                            'label' => __( 'Current', 'multivendorx' ),
                            'value' => 'current',
                        ),
                        array(
                            'key'   => 'savings',
                            'label' => __( 'Savings', 'multivendorx' ),
                            'value' => 'savings',
                        ),
                    ),
                ),
            );

            $bank_details = $settings['bank_details'] ?? array();

            if ( in_array( 'bank_name', $bank_details ) ) {
                $fields[] = array(
                    'key'   => 'bank_name',
                    'type'  => 'text',
                    'label' => 'Bank name',
                );
            }

            if ( in_array( 'account_holder_name', $bank_details ) ) {
                $fields[] = array(
                    'key'   => 'account_holder_name',
                    'type'  => 'text',
                    'label' => 'Account holder name',
                );
            }

            if ( in_array( 'account_number', $bank_details ) ) {
                $fields[] = array(
                    'key'   => 'account_number',
                    'type'  => 'text',
                    'label' => 'Account number',
                );
            }

            if ( in_array( 'bank_address', $bank_details ) ) {
                $fields[] = array(
                    'key'   => 'bank_address',
                    'type'  => 'textarea',
                    'label' => 'Bank address',
                );
            }

            if ( in_array( 'routing_number', $bank_details ) ) {
                $fields[] = array(
                    'key'   => 'routing_number',
                    'type'  => 'text',
                    'label' => 'ABA routing number',
                );
            }

            if ( in_array( 'iban', $bank_details ) ) {
                $fields[] = array(
                    'key'   => 'iban',
                    'type'  => 'text',
                    'label' => 'IBAN',
                );
            }

            if ( in_array( 'destination_currency', $bank_details ) ) {
                $fields[] = array(
                    'key'   => 'destination_currency',
                    'type'  => 'text',
                    'label' => 'Destination currency',
                );
            }

            // Custom bank details the admin added with "Add custom field".
            $known_keys = wp_list_pluck( $fields, 'key' );
            foreach ( (array) ( $settings['bank_details_options'] ?? array() ) as $custom_option ) {
                $custom_key = sanitize_key( $custom_option['value'] ?? '' );
                if ( '' === $custom_key || in_array( $custom_key, $known_keys, true ) || ! in_array( $custom_key, $bank_details, true ) ) {
                    continue;
                }
                $known_keys[] = $custom_key;
                $fields[]     = array(
                    'key'   => $custom_key,
                    'type'  => 'text',
                    'label' => sanitize_text_field( $custom_option['label'] ?? $custom_key ),
                );
            }

            return array(
                'id'     => $this->get_id(),
                'label'  => __( 'Bank Transfer', 'multivendorx' ),
                'fields' => $fields,
            );
        }
    }

    /**
     * Process payment.
     *
     * @param int    $store_id Store id.
     * @param float  $amount Payment amount.
     * @param int    $order_id Order id.
     * @param string $transaction_id Transaction id.
     * @param string $note Payment note.
     */
    public function process_payment( $store_id, $amount, $order_id = null, $transaction_id = null, $note = null, $additional_receiver = 0 ) {

        $status = 'success';
        do_action(
            'multivendorx_after_payment_complete',
            $store_id,
            'Bank Transfer',
            $status,
            $order_id,
            $transaction_id,
            $note,
            $amount,
            $additional_receiver
        );
    }
}