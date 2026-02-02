<?php
/**
 * Modules class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Announcement;

/**
 * MultiVendorX Announcement module.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Frontend {
    /**
     * Initialize the class.
     */
    public function __construct() {
        // Hook into the filter that defines the admin submenus.
        add_filter( 'multivendorx_submenus', array( $this, 'add_announcement_menu' ), 20 );
    }

    /**
     * Add Advertisement submenu at the correct position.
     *
     * @param array $submenus Existing submenu array.
     * @return array Modified submenu array.
     */
    public function add_announcement_menu( $submenus ) {
        $new_item = array(
            'announcements' => array(
                'name'     => __( 'Announcements', 'multivendorx' ),
                'subtab'   => '',
                'priority' => 105,
            ),
        );

        return array_merge( $submenus, $new_item );
    }
}
