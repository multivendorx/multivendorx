<?php
/**
 * Util class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Privacy;
use MultiVendorX\Store\Store;
use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Utill;
use MultiVendorX\StoreReview\Util as Rating;

/**
 * MultiVendorX Store Privacy Util class
 *
 * @class       Util class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Util {
    
    /**
     * Get store info
     *
     * @param int $product_id Product ID.
     * @return array
     */
    public static function show_store_info( $product_id ) {
        $store_details = MultiVendorX()->setting->get_setting( 'store_branding_details', array() );

        if ( in_array( 'show_store_name', $store_details, true ) ) {
            $store = Store::get_store( $product_id, 'product' );
            if ( ! $store ) {
				return array();
            }

            $store_user_ids   = StoreUtil::get_store_users( $store->get_id() );
            $store_owner_id   = null;
            $store_owner_name = '';

            // Find store owner.
            if ( ! empty( $store_user_ids ) ) {
                foreach ( $store_user_ids as $user_id ) {
                    $user = get_userdata( $user_id );
                    if ( $user && in_array( 'store_owner', (array) $user->roles, true ) ) {
                        $store_owner_id   = $user->ID;
                        $store_owner_name = $user->display_name;
                        break;
                    }
                }
            }    
            $name        = $store->get( Utill::STORE_SETTINGS_KEYS['name'] );
            $description = $store->get( Utill::STORE_SETTINGS_KEYS['description'] );
            $phone       = $store->get_meta( Utill::STORE_SETTINGS_KEYS['phone'] ) ?? '';
            $email       = $store->get_meta( Utill::STORE_SETTINGS_KEYS['primary_email'] ) ?? '';
            $address     = $store->get_meta( Utill::STORE_SETTINGS_KEYS['address'] ) ?? '';

            $logo_html = '';

            if ( in_array( 'show_store_logo_next_to_products', $store_details, true ) ) {
                $logo_url = $store->get_meta( 'image' );

                if ( ! empty( $logo_url ) ) {
                    $logo_html = '<img src="' . esc_url( $logo_url ) . '" alt="' . esc_attr( $name ) . '" />';
                } else {
                    $logo_html = '<i class="dashicons dashicons-store"></i>';
                }
            }


            $overall_reviews = Rating::get_overall_rating( $store->get_id() );
            $reviews         = Rating::get_reviews_by_store( $store->get_id() );

            return array(
                'id'          => $store->get_id(),
                'name'        => $name,
                'description' => $description,
                'logo_html'   => $logo_html,
                'owner_id'    => $store_owner_id,
                'owner_name'  => $store_owner_name,
                'phone'       => $phone,
                'email'       => $email,
                'address'     => $address,
                'overall_reviews'    => $overall_reviews,
                'total_reviews'      => is_array( $reviews ) ? count( $reviews ) : 0,
            );
        }
    }

}
