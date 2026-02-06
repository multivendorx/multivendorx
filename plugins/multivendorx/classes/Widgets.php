<?php

namespace MultiVendorX;

defined( 'ABSPATH' ) || exit;

class Widgets {


    public function __construct() {
        add_action( 'widgets_init', array( $this, 'register_sidebar' ) );
    }

    public function register_sidebar() {
        register_sidebar(
            array(
				'name'          => __( 'MultiVendorX Store Sidebar', 'multivendorx' ),
				'id'            => 'multivendorx-store-sidebar',
				'description'   => __( 'Widgets for MultiVendorX store pages only.', 'multivendorx' ),
				'before_widget' => '<div class="multivendorx-widget %2$s">',
				'after_widget'  => '</div>',
				'before_title'  => '<h3 class="multivendorx-widget-title">',
				'after_title'   => '</h3>',
            )
        );
    }
}
