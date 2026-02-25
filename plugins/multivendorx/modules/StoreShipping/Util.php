<?php
/**
 * MultiVendorX Store Shipping Util
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\StoreShipping;

use WC_Data_Store;
use WC_Shipping_Zone;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Store Shipping Util.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Util {
    /**
     * Get Zones
     *
     * @param int $store_id The ID of the store.
     */
    public static function get_zones( $store_id ) {
        $data_store = WC_Data_Store::load( 'shipping-zone' );
        $raw_zones  = $data_store->get_zones();
        $zones      = array();
        foreach ( $raw_zones as $raw_zone ) {
            $zone            = new WC_Shipping_Zone( $raw_zone );
            $enabled_methods = $zone->get_shipping_methods( true );

            $methods_id = wp_list_pluck( $enabled_methods, 'id' );

            if ( in_array( 'multivendorx_store_shipping', $methods_id, true ) ) {
                $zones[ $zone->get_id() ]                            = $zone->get_data();
                $zones[ $zone->get_id() ]['zone_id']                 = $zone->get_id();
                $zones[ $zone->get_id() ]['formatted_zone_location'] = $zone->get_formatted_location();
                $zones[ $zone->get_id() ]['shipping_methods']        = self::get_shipping_methods( $zone->get_id(), $store_id );
            }
        }
        // Everywhere zone if has method called vendor shipping.
        $overall_zone    = new WC_Shipping_Zone( 0 );
        $enabled_methods = $overall_zone->get_shipping_methods( true );
        $methods_id      = wp_list_pluck( $enabled_methods, 'id' );

        if ( in_array( 'multivendorx_store_shipping', $methods_id, true ) ) {
            $zones[ $overall_zone->get_id() ]                            = $overall_zone->get_data();
            $zones[ $overall_zone->get_id() ]['zone_id']                 = $overall_zone->get_id();
            $zones[ $overall_zone->get_id() ]['formatted_zone_location'] = $overall_zone->get_formatted_location();
            $zones[ $overall_zone->get_id() ]['shipping_methods']        = self::get_shipping_methods( $overall_zone->get_id(), $store_id );
        }

        return $zones;
    }

    /**
     * Get Shipping Methods
     *
     * @param int $zone_id The ID of the shipping zone.
     * @param int $store_id The ID of the store.
     */
    public static function get_shipping_methods( $zone_id, $store_id ) {
        $store = new \MultiVendorX\Store\Store( $store_id );

        $all_meta = $store->get_all_meta();

        $methods = array();

        foreach ( $all_meta as $key => $value ) {
            // Match keys ending with _{zone_id}.
            if ( preg_match( '/_(\d+)$/', $key, $matches ) && intval( $matches[1] ) === $zone_id ) {
                $method_id = str_replace( '_' . $zone_id, '', $key );

                // Ensure $value is array (decode if JSON).
                if ( is_string( $value ) ) {
                    $value = json_decode( $value, true );
                }

                $methods[] = array(
                    'id'       => $method_id,
                    'title'    => isset( $value['title'] ) ? $value['title'] : $method_id,
                    'settings' => $value,
                    'enabled'  => 'yes',
                );
            }
        }

        return $methods;
    }

    /**
     * Get Shipping Method
     *
     * @param int    $store_id The ID of the store.
     * @param string $method_id The ID of the shipping method.
     * @param int    $zone_id The ID of the shipping zone.
     */
    public static function get_shipping_method( $store_id, $method_id, $zone_id ) {
        $store = new \MultiVendorX\Store\Store( $store_id );

        $meta_key = $method_id . '_' . $zone_id;
        $settings = $store->get_meta( $meta_key );

        if ( empty( $settings ) ) {
            return new \WP_Error(
                'shipping_method_not_found',
                __( 'Shipping method not found.', 'multivendorx' ),
                array( 'status' => 404 )
            );
        }

        // Proper way for WP meta
        $settings = maybe_unserialize( $settings );

        return array(
            'method_id' => $method_id,
            'zone_id'   => $zone_id,
            'settings'  => $settings,
            'enabled'   => 'yes',
        );
    }

    /**
     * Delete Shipping Method
     *
     * @param int    $store_id The ID of the store.
     * @param int    $zone_id The ID of the shipping zone.
     * @param string $method_id The ID of the shipping method to delete.
     */
    public static function delete_shipping_method( $store_id, $zone_id, $method_id ) {
        $store    = new \MultiVendorX\Store\Store( $store_id );
        $meta_key = $method_id . '_' . $zone_id; // Same key format as update_shipping_method.

        // Check if the shipping method exists.
        $existing = $store->get_meta( $meta_key );
        if ( ! $existing ) {
            return new \WP_Error(
                'shipping_method_not_found',
                __( 'Shipping method not found', 'multivendorx' ),
                array( 'status' => 404 )
            );
        }

        // Delete the method from store meta.
        $store->delete_meta( $meta_key );

        return true;
    }

    /**
     * Update Shipping Method Settings
     *
     * @param array $args An associative array containing the following keys:
     *                     - store_id: The ID of the store.
     *                     - method_id: The ID of the shipping method being updated.
     *                     - zone_id: The ID of the shipping zone this method belongs to.
     *                     - settings: An associative array representing the new settings for this shipping method.
     */
    public static function update_shipping_method( $args ) {
        $store    = new \MultiVendorX\Store\Store( $args['store_id'] );
        $meta_key = $args['method_id'] . '_' . $args['zone_id']; // Key format: methodId_zoneId.
        $store->update_meta( $meta_key, $args['settings'] );

        return array(
            'method_id' => $args['method_id'],
            'zone_id'   => $args['zone_id'],
            'store_id'  => $args['store_id'],
            'settings'  => $args['settings'],
        );
    }
}