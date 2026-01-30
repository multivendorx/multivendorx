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
        // Add custom role.
        add_action( 'init', array( $this, 'multivendorx_add_custom_role' ) );
        // Assign custom capability to logged in user.
        add_filter( 'user_has_cap', array( $this, 'assign_cap_authenticate_user' ) );
        // Assign specific capability.
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
     * @param array $allcaps All capabilities.
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
     * @param array  $caps Capabilities.
     * @param string $cap Capability.
     * @param int    $user_id User ID.
     *
     * @return array
     */
    public function specific_capability( $caps, $cap, $user_id ) {
        if ( is_user_logged_in() ) {
            $user = get_userdata( $user_id );

            if ( $user && in_array( 'store_owner', (array) $user->roles, true ) ) {
                if ( 'edit_posts' === $cap ) {
                    $request_uri  = $_SERVER['REQUEST_URI'] ?? '';
                    $is_edit_page = strpos( $request_uri, 'element=edit' ) !== false || strpos( $request_uri, '/edit/' ) !== false;

                    if ( defined( 'DOING_AJAX' ) && DOING_AJAX || $is_edit_page ) {
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
