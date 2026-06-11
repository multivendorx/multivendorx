<?php
/**
 * Enquiry module Rest class file
 *
 * @package CatalogX
 */

namespace CatalogX\Enquiry;

use CatalogX\Utill;
use MultiVendorX\Store\Store as Store;

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
        $current_user = wp_get_current_user();

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

        $settings = CatalogX()->setting->get_option(
            'catalogx_enquiry_quote_exclusion_settings',
            array()
        );

        $settings = isset( $settings['exclusion'] )
            ? $settings['exclusion']
            : array();

        // Product exclusion
        $excluded_products = isset( $settings['enquiry_exclusion_value_product_list'] )
            ? array_map( 'intval', $settings['enquiry_exclusion_value_product_list'] )
            : array();

        if ( in_array( $product_id, $excluded_products, true ) ) {
            return false;
        }

        if (Utill::is_active_plugin('multivendorx')) {
            $product_author = get_post_meta( $product_id, 'multivendorx_store_id', true ) ?? 0;
            $store = new Store( $product_author );
            if ($product_author) {
                $excluded_products = $store->get_meta('woocommerce_product_list') ?? [];
                if ( ! empty( $excluded_products ) && in_array( (string) $product_id, $excluded_products, true ) ) {
                    return false;
                }
            }         

            // Product categories.
            $product_categories = wp_get_post_terms(
                $product_id,
                'product_cat',
                [ 'fields' => 'ids' ]
            );

            $excluded_categories = array_map(
                'intval',
                (array) $store->get_meta( 'woocommerce_category_list' )
            );

            if ( ! empty( $excluded_categories ) && ! empty( array_intersect( $product_categories, $excluded_categories ) )) {
                return false;
            }

            // Product tags.
            $product_tags = wp_get_post_terms(
                $product_id,
                'product_tag',
                [ 'fields' => 'ids' ]
            );

            $excluded_tags = array_map(
                'intval',
                (array) $store->get_meta( 'woocommerce_tag_list' )
            );

            if ( ! empty( $excluded_tags ) && ! empty( array_intersect( $product_tags, $excluded_tags ) )) {
                return false;
            }
        }

        // Category exclusion
        $excluded_categories = isset( $settings['enquiry_exclusion_value_category_list'] )
            ? array_map( 'intval', $settings['enquiry_exclusion_value_category_list'] )
            : array();

        $product_categories = wp_get_post_terms(
            $product_id,
            'product_cat',
            array( 'fields' => 'ids' )
        );

        if ( array_intersect( $excluded_categories, $product_categories ) ) {
            return false;
        }

        // Tag exclusion
        $excluded_tags = isset( $settings['enquiry_exclusion_value_tag_list'] )
            ? array_map( 'intval', $settings['enquiry_exclusion_value_tag_list'] )
            : array();

        $product_tags = wp_get_post_terms(
            $product_id,
            'product_tag',
            array( 'fields' => 'ids' )
        );

        if ( array_intersect( $excluded_tags, $product_tags ) ) {
            return false;
        }

        // Brand exclusion
        $excluded_brands = isset( $settings['enquiry_exclusion_value_brand_list'] )
            ? array_map( 'intval', $settings['enquiry_exclusion_value_brand_list'] )
            : array();

        $product_brands = wp_get_post_terms(
            $product_id,
            'product_brand',
            array( 'fields' => 'ids' )
        );

        if ( array_intersect( $excluded_brands, $product_brands ) ) {
            return false;
        }

        return true;
    }
}
