<?php
/**
 * CatalogX module Util class file
 *
 * @package CatalogX
 */

namespace CatalogX\Catalog;

defined( 'ABSPATH' ) || exit;

/**
 * CatalogX Catalog Module Util class
 *
 * @class       Util class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Util {

    /**
     * Check catalog functionality available for current user
     *
     * @return bool
     */
    public static function is_available() {
        // Get the current user.
        $current_user = CatalogX()->current_user;

        // Get exclusion setting.
        $catalog_exclusion_setting = CatalogX()->setting->get_option(
            'catalogx_enquiry_quote_exclusion_settings',
            array()
        );

        // Get exclusion section.
        $exclusion_settings = isset( $catalog_exclusion_setting['exclusion'] )
            ? $catalog_exclusion_setting['exclusion']
            : array();

        // Get excluded user roles.
        $exclude_user_roles = isset( $exclusion_settings['catalog_exclusion_value_userroles_list'] )
            ? $exclusion_settings['catalog_exclusion_value_userroles_list']
            : array();

        // Check current user's role is excluded.
        if ( array_intersect( $exclude_user_roles, $current_user->roles ) ) {
            return false;
        }

        // Get excluded users.
        $exclude_user_ids = isset( $exclusion_settings['catalog_exclusion_value_user_list'] )
            ? array_map( 'intval', $exclusion_settings['catalog_exclusion_value_user_list'] )
            : array();

        // Check current user's ID is excluded.
        if ( in_array( $current_user->ID, $exclude_user_ids, true ) ) {
            return false;
        }

        return true;
    }

    /**
     * Check catalog functionality available for product
     *
     * @param int $product_id The ID of the product to check.
     * @return bool
     */
    public static function is_available_for_product( $product_id ) {
        return ! \CatalogX\Utill::is_product_excluded( $product_id, 'catalog' );
    }
}
