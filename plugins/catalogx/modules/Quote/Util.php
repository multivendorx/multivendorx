<?php
/**
 * Quote module Util class file
 *
 * @package CatalogX
 */

namespace CatalogX\Quote;

/**
 * CatalogX Quote Module Util class
 *
 * @class       Util class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Util {

    /**
     * Check quotation functionality available for current user
     *
     * @return bool
     */
    public static function is_available() {
        // Get the current user.
        $current_user = wp_get_current_user();

        // Get exclusion setting.
        $quote_exclusion_setting = CatalogX()->setting->get_option(
            'catalogx_enquiry_quote_exclusion_settings',
            array()
        );

        // Get exclusion section.
        $exclusion_settings = isset( $quote_exclusion_setting['exclusion'] )
            ? $quote_exclusion_setting['exclusion']
            : array();

        // Get excluded user roles.
        $exclude_user_roles = isset( $exclusion_settings['quote_exclusion_value_userroles_list'] )
            ? $exclusion_settings['quote_exclusion_value_userroles_list']
            : array();

        // Check current user's role is excluded.
        if ( array_intersect( $exclude_user_roles, $current_user->roles ) ) {
            return false;
        }

        $exclude_user_ids = isset( $exclusion_settings['quote_exclusion_value_user_list'] )
            ? array_map( 'intval', $exclusion_settings['quote_exclusion_value_user_list'] )
            : array();

        // Check current user's role is excluded.
        if ( in_array( $current_user->ID, $exclude_user_ids, true ) ) {
            return false;
        }

        return true;
    }

    /**
     * Check quotation functionality available for product
     *
     * @param int $product_id Product ID to check availability for.
     * @return bool
     */
    public static function is_available_for_product( $product_id ) {

        $settings = CatalogX()->setting->get_option(
            'catalogx_enquiry_quote_exclusion_settings',
            array()
        );

        $settings = isset( $settings['exclusion'] )
            ? $settings['exclusion']
            : array();

        /*
        | Product exclusion

        */

        $excluded_products = isset( $settings['quote_exclusion_value_product_list'] )
            ? array_map( 'intval', $settings['quote_exclusion_value_product_list'] )
            : array();

        if ( in_array( $product_id, $excluded_products, true ) ) {
            return false;
        }

        /*
        | Category exclusion

        */

        $excluded_categories = isset( $settings['quote_exclusion_value_category_list'] )
            ? array_map( 'intval', $settings['quote_exclusion_value_category_list'] )
            : array();

        $product_categories = wp_get_post_terms(
            $product_id,
            'product_cat',
            array( 'fields' => 'ids' )
        );

        if ( array_intersect( $excluded_categories, $product_categories ) ) {
            return false;
        }

        /*
        | Tag exclusion

        */

        $excluded_tags = isset( $settings['quote_exclusion_value_tag_list'] )
            ? array_map( 'intval', $settings['quote_exclusion_value_tag_list'] )
            : array();

        $product_tags = wp_get_post_terms(
            $product_id,
            'product_tag',
            array( 'fields' => 'ids' )
        );

        if ( array_intersect( $excluded_tags, $product_tags ) ) {
            return false;
        }

        /*
        | Brand exclusion

        */

        $excluded_brands = isset( $settings['quote_exclusion_value_brand_list'] )
            ? array_map( 'intval', $settings['quote_exclusion_value_brand_list'] )
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

    /**
     * Get the user id from its email.
     * Returns 0 if no user is found.
     *
     * @param string $email The customer's email address.
     * @return int
     */
    public static function get_customer_id_by_email( $email ) {
        // Check if the customer exists.
        $user = get_user_by( 'email', $email );
        if ( $user ) {
            return $user->ID;
        } else {
            return 0; // Customer doesn't exist.
        }
    }
}
