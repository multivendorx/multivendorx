<?php
/**
 * Enquiry module Rest class file
 *
 * @package CatalogX
 */

namespace CatalogX\Enquiry;

use CatalogX\Utill;
use MultiVendorX\Store\Store;

/**
 * CatalogX Enquiry Module Util class
 *
 * @class       Util class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Util {

    /**
     * Check enquiry functionality available for current user
     *
     * @return bool
     */
    public static function is_available() {
        // Get the current user.
        $current_user = CatalogX()->current_user;

        // Get exclusion setting.
        $enquiry_exclusion_setting = CatalogX()->setting->get_option(
            'catalogx_enquiry_quote_exclusion_settings',
            array()
        );

        // Get exclusion section.
        $exclusion_settings = isset( $enquiry_exclusion_setting['exclusion'] )
            ? $enquiry_exclusion_setting['exclusion']
            : array();

        // Get excluded user roles.
        $exclude_user_roles = isset( $exclusion_settings['enquiry_exclusion_value_userroles_list'] )
            ? $exclusion_settings['enquiry_exclusion_value_userroles_list']
            : array();

        // Check current user's role is excluded.
        if ( array_intersect( $exclude_user_roles, $current_user->roles ) ) {
            return false;
        }

        // Get excluded users.
        $exclude_user_ids = isset( $exclusion_settings['enquiry_exclusion_value_user_list'] )
            ? array_map( 'intval', $exclusion_settings['enquiry_exclusion_value_user_list'] )
            : array();

        // Check current user's ID is excluded.
        if ( in_array( $current_user->ID, $exclude_user_ids, true ) ) {
            return false;
        }

        return true;
    }

    /**
     * Check if enquiry functionality is available for the given product.
     *
     * @param int $product_id The product ID to check availability for.
     * @return bool True if enquiry is available, false otherwise.
     */
    public static function is_available_for_product( $product_id ) {
        if ( Utill::is_product_excluded( $product_id, 'enquiry' ) ) {
            return false;
        }

        // On a MultiVendorX marketplace, the product's store can exclude its own products, categories and tags too.
        if ( ! Utill::is_active_plugin( 'multivendorx' ) ) {
            return true;
        }

        $store_id = get_post_meta( $product_id, 'multivendorx_store_id', true );
        $store    = new Store( $store_id ?: 0 );

        if ( $store_id && in_array( (string) $product_id, (array) ( $store->get_meta( 'woocommerce_product_list' ) ?? array() ), true ) ) {
            return false;
        }

        foreach ( array( 'woocommerce_category_list' => 'product_cat', 'woocommerce_tag_list' => 'product_tag' ) as $meta_key => $taxonomy ) {
            $excluded = array_map( 'intval', (array) $store->get_meta( $meta_key ) );
            $terms    = wp_get_post_terms( $product_id, $taxonomy, array( 'fields' => 'ids' ) );

            if ( ! empty( $excluded ) && ! is_wp_error( $terms ) && array_intersect( $terms, $excluded ) ) {
                return false;
            }
        }

        return true;
    }
}
