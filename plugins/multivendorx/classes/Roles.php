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
    }

    public function multivendorx_add_custom_role() {
        if ( ! get_role( 'store_owner' ) ) {
            add_role(
                'store_owner',
                'Store owner',
                array(
                    'read' => true,
                )
            );
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
}