<?php
/**
 * Roles class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Roles class
 *
 * @class       Roles class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Roles {
    /**
     * Roles class construct function
     */
    public function __construct() {
        add_action( 'init', [ $this, 'multivendorx_add_custom_role' ] );
        add_filter( 'user_has_cap', array($this, 'assign_cap_authenticate_user') );
    }

    public function multivendorx_add_custom_role() {
        global $wp_roles;
        
        if ( ! get_role( 'store_owner' ) ) {
            add_role(
                'store_owner',
                'Store owner',
                array(
                    'read' => true,
                )
            );
        }

        $all_caps = $this->get_custom_capability();
        foreach ( $all_caps as $cap ) {
            $wp_roles->add_cap( 'administrator', $cap );
            $wp_roles->add_cap( 'store_owner', $cap );
        }
    }


    public static function multivendorx_get_roles() {
        $custom_roles = [
            'store_owner'       =>  __('Store Owner', 'multivendorx'),
            'store_manager'     =>  __('Store Manager', 'multivendorx'),
            'product_manager'   =>  __('Product Manager', 'multivendorx'),
            'customer_support'  =>  __('Customer Support', 'multivendorx'),
            'order_assistant'   =>  __('Order Assistant', 'multivendorx'),
        ];
        return $custom_roles;
    }

    public function assign_cap_authenticate_user( $allcaps ) {
        if ( is_user_logged_in() ) {
            $allcaps['create_stores'] = true;
        }

        return $allcaps;
    }

    public function get_custom_capability() {
        $capabilities = [
            'create_stores',
            'edit_stores',
            'delete_stores'
        ];

        return $capabilities;
    }
}