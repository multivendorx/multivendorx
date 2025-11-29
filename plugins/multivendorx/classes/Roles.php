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
        add_action( 'init', array( $this, 'multivendorx_add_custom_role' ) );
        add_filter( 'user_has_cap', array( $this, 'assign_cap_authenticate_user' ) );
        add_filter( 'map_meta_cap', array( $this, 'specific_capability' ), 10, 4 );
    }

    /**
     * Add custom role
     */
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

    /**
     * Get all roles with labels
     *
     * @return array
     */
    public static function multivendorx_get_roles() {
        $custom_roles = array(
            'store_owner'      => __( 'Store Owner', 'multivendorx' ),
            'store_manager'    => __( 'Store Manager', 'multivendorx' ),
            'product_manager'  => __( 'Product Manager', 'multivendorx' ),
            'customer_support' => __( 'Customer Support', 'multivendorx' ),
            'order_assistant'  => __( 'Order Assistant', 'multivendorx' ),
        );
        return $custom_roles;
    }

    /**
     * Assign capability to authenticate user
     *
     * @param array $allcaps
     *
     * @return array
     */
    public function assign_cap_authenticate_user( $allcaps ) {
        if ( is_user_logged_in() ) {
            $allcaps['create_stores'] = true;

            $user = wp_get_current_user();

            if ( in_array( 'store_owner', (array) $user->roles, true ) ) {
                $allcaps['edit_posts'] = true;
            }
        }

        return $allcaps;
    }

    /**
     * Get custom capability
     *
     * @return array
     */
    public function get_custom_capability() {
        $capabilities = array(
            'create_stores',
            'edit_stores',
            'delete_stores',
        );

        return $capabilities;
    }

    /**
     * Specific capability for store owner
     *
     * @param array  $caps
     * @param string $cap
     * @param int    $user_id
     * @param array  $args
     *
     * @return array
     */
    public function specific_capability( $caps, $cap, $user_id ) {
        if ( is_user_logged_in() ) {
            $user = get_userdata( $user_id );

            if ( in_array( 'store_owner', (array) $user->roles, true ) ) {
                if ( 'edit_posts' === $cap ) {
                    // $segment = get_query_var('segment');
                    // $endpoints = MultiVendorX()->setting->get_setting('menu_manager');

                    // do not remove this code
                    // checking add later for edit product page
                    // && ($segment == $endpoints['products']['slug'] || $segment == $endpoints['settings']['slug'])
                    if ( defined( 'DOING_AJAX' ) && DOING_AJAX ) {
                        $caps = array( 'edit_posts' );
                    } else {
                        $caps = array( 'do_not_allow' );
                    }
                }
            }
        }
        return $caps;
    }
}
