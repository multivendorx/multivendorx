<?php
/**
 * Util class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\StorePolicy;

use MultiVendorX\Utill;
use MultiVendorX\Store\Store;

/**
 * MultiVendorX Store Policy Util class
 *
 * @class       Util class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Util {

    /**
     * Get store policies with optional product-level overrides.
     *
     * @param int $store_id
     * @param int $product_id
     * @return array
     */
    public static function get_store_policies( $store_id = 0, $product_id = 0 ) {
        $policies = array();

        // Global defaults
        $store_policy        = MultiVendorX()->setting->get_setting( 'store_policy', array() );
        $shipping_policy     = MultiVendorX()->setting->get_setting( 'shipping_policy', array() );
        $refund_policy       = MultiVendorX()->setting->get_setting( 'refund_policy', array() );
        $cancellation_policy = MultiVendorX()->setting->get_setting( 'cancellation_policy', array() );

        /**
         * Product-level override
         */
        if ( $product_id ) {
            $shipping_override     = get_post_meta( $product_id, Utill::POST_META_SETTINGS['shipping_policy'], true );
            $refund_override       = get_post_meta( $product_id, Utill::POST_META_SETTINGS['refund_policy'], true );
            $cancellation_override = get_post_meta( $product_id, Utill::POST_META_SETTINGS['cancellation_policy'], true );

            if ( ! empty( $shipping_override ) ) {
                $shipping_policy = $shipping_override;
            }
            if ( ! empty( $refund_override ) ) {
                $refund_policy = $refund_override;
            }
            if ( ! empty( $cancellation_override ) ) {
                $cancellation_policy = $cancellation_override;
            }

            if ( ! $store_id ) {
                $store_id = get_post_meta( $product_id, Utill::POST_META_SETTINGS['store_id'], true );
            }
        }

        /**
         * Store-level override
         */
        if ( $store_id ) {
            $store                     = new Store( $store_id );
            $privacy_override_settings = MultiVendorX()->setting->get_setting( 'store_policy_override', array() );
            if ( in_array( 'store', $privacy_override_settings, true ) ) {
                $store_policy = $store->get_meta( Utill::STORE_SETTINGS_KEYS['store_policy'] );
            }

            if ( in_array( 'shipping', $privacy_override_settings, true ) ) {
                $shipping_policy = $store->get_meta( Utill::STORE_SETTINGS_KEYS['shipping_policy'] );
            }

            if ( in_array( 'refund', $privacy_override_settings, true ) ) {
                $refund_policy       = $store->get_meta( Utill::STORE_SETTINGS_KEYS['refund_policy'] );
            }
            
            if ( in_array( 'cancellation_return', $privacy_override_settings, true ) ) {
                $cancellation_policy = $store->get_meta( Utill::STORE_SETTINGS_KEYS['cancellation_policy'] );
            }
        }

        // Normalize response
        if ( ! empty( $store_policy ) ) {
            $policies['store_policy'] = $store_policy;
        }
        if ( ! empty( $shipping_policy ) ) {
            $policies['shipping_policy'] = $shipping_policy;
        }
        if ( ! empty( $refund_policy ) ) {
            $policies['refund_policy'] = $refund_policy;
        }
        if ( ! empty( $cancellation_policy ) ) {
            $policies['cancellation_policy'] = $cancellation_policy;
        }

        return $policies;
    }
}