<?php
/**
 * MultiVendorX Elementor Admin
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Elementor;

/**
 * MultiVendorX Elementor Admin class.
 *
 * @class       Admin class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Admin {

    /**
     * Constructor.
     */
    public function __construct() {
        // Elementor support - Register custom document type
        add_action( 'elementor/documents/register', [ $this, 'register_elementor_document_type' ] );
        add_filter( 'multivendorx_store_elementor_template', [ $this, 'elementor_template_filter' ], 10 );
    }

     /**
     * Register custom Elementor document type
     */
    public function register_elementor_document_type( $documents_manager ) {
        $documents_manager->register_document_type( 'multivendorx-store', 'StoreDocument' );
    }

    public function elementor_template_filter( $template ) {

        if ( ! did_action( 'elementor/loaded' ) ) {
            return $template;
        }

        $elementor_template_id = $this->get_elementor_template();

        if ( ! $elementor_template_id ) {
            return $template;
        }

        add_filter( 'body_class', function ( $classes ) {
            $classes[] = 'elementor-page';
            return $classes;
        });

        $canvas = MultiVendorX()->util->get_template('elementor-canvas.php');

        return file_exists( $canvas ) ? $canvas : $template;
    }

    /**
     * Get active Elementor template for store
     */
    private function get_elementor_template() {
        if ( ! did_action( 'elementor/loaded' ) ) {
            return false;
        }
        
        // Find template with our custom document type
        $args = [
            'post_type' => 'elementor_library',
            'posts_per_page' => 1,
            'post_status' => 'publish',
            'meta_query' => [
                [
                    'key' => '_elementor_template_type',
                    'value' => 'multivendorx-store',
                ]
            ]
        ];
        
        $templates = get_posts( $args );
        return ! empty( $templates ) ? $templates[0]->ID : false;
    }


}