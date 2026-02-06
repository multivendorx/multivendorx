<?php
namespace MultiVendorX;

defined( 'ABSPATH' ) || exit;

class Widgets {

    public function __construct() {
        add_action( 'widgets_init', [ $this, 'register_sidebar' ] );
        add_filter('register_block_type_args',[ $this, 'attach_sidebar_render_callback' ],10,2);
        
    }

    /**
     * Register classic widget sidebar
     */
    public function register_sidebar() {
        register_sidebar( [
            'name'          => __( 'MultiVendorX Store Sidebar', 'multivendorx' ),
            'id'            => 'multivendorx-store-sidebar',
            'description'   => __( 'Widgets for MultiVendorX store pages only.', 'multivendorx' ),
            'before_widget' => '<div class="multivendorx-widget %2$s">',
            'after_widget'  => '</div>',
            'before_title'  => '<h3 class="multivendorx-widget-title">',
            'after_title'   => '</h3>',
        ] );
    }
    
    public function attach_sidebar_render_callback( $args, $block_type ) {

        if ( $block_type === 'multivendorx/store-sidebar' ) {
            $args['render_callback'] = [ $this, 'render_sidebar' ];
        }
    
        return $args;
    }
    
    /**
     * Render sidebar output (used by block templates)
     */
    public function render_sidebar() {

        if ( ! is_active_sidebar( 'multivendorx-store-sidebar' ) ) {
            return '';
        }

        ob_start();
        ?>
        <aside class="multivendorx-store-sidebar">
            <?php dynamic_sidebar( 'multivendorx-store-sidebar' ); ?>
        </aside>
        <?php
        return ob_get_clean();
    }
}
