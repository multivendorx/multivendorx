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
            'announcement' => array(
                'name'   => __( 'Announcement', 'multivendorx' ),
                'subtab' => '',
            ),
        );

        $ordered = array();
        foreach ( $submenus as $key => $menu ) {
            // Copy existing menu.
            $ordered[ $key ] = $menu;

            // Insert advertisement right after "status-tools".
            if ( 'status-tools' === $key ) {
                $ordered = array_merge( $ordered, $new_item );
            }
        }

        return $ordered;
    }
}
