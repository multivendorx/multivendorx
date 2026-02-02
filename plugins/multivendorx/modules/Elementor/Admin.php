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
        add_action( 'elementor/documents/register', array( $this, 'register_elementor_document_type' ) );
        add_filter( 'multivendorx_store_elementor_template', array( $this, 'elementor_template_filter' ), 10 );
        // Add content in elementor template.
        add_action( 'save_post_elementor_library', [ $this, 'default_store_template' ], 10, 3 );

    }

    /**
     * Register custom Elementor document type
     */
    public function register_elementor_document_type( $documents_manager ) {
        $documents_manager->register_document_type( 'multivendorx-store', StoreDocument::class );
    }

    public function elementor_template_filter( $template ) {

        if ( ! did_action( 'elementor/loaded' ) ) {
            return $template;
        }

        $elementor_template_id = $this->get_elementor_template();

        if ( ! $elementor_template_id ) {
            return $template;
        }

        add_filter(
            'body_class',
            function ( $classes ) {
				$classes[] = 'elementor-page';
				return $classes;
			}
        );

        $canvas = MultiVendorX()->util->get_template( 'elementor-canvas.php' );

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
        $args = array(
            'post_type'      => 'elementor_library',
            'posts_per_page' => 1,
            'post_status'    => 'publish',
            'meta_query'     => array(
                array(
                    'key'   => '_elementor_template_type',
                    'value' => 'multivendorx-store',
                ),
            ),
        );

        $templates = get_posts( $args );
        return ! empty( $templates ) ? $templates[0]->ID : false;
    }

    public function default_store_template( $post_id, $post, $update ) {

        // Only for new templates
        if ( $update ) {
            return;
        }

        $template_type = get_post_meta( $post_id, '_elementor_template_type', true );
        if ( $template_type !== 'multivendorx-store' ) {
            return;
        }

        // Do not overwrite if already exists
        if ( get_post_meta( $post_id, '_elementor_data', true ) ) {
            return;
        }

        update_post_meta(
            $post_id,
            '_elementor_data',
            wp_slash( $this->get_default_store_elementor_data() )
        );

        update_post_meta( $post_id, '_elementor_edit_mode', 'builder' );
    }

    private function get_default_store_elementor_data() {

        $data = [
            [
                'id'      => 'store-header',
                'elType'  => 'container',
                'settings'=> [
                    'content_width' => 'boxed',
                    'flex_direction' => 'column',
                    'gap' => '10',
                ],
                'elements'=> [
                    [
                        'id'         => 'store-name',
                        'elType'     => 'widget',
                        'widgetType' => 'multivendorx_store_name',
                        'settings'   => [
                            'html_tag' => 'h1',
                        ],
                        'elements' => [],
                    ],
                    [
                        'id'         => 'store-description',
                        'elType'     => 'widget',
                        'widgetType' => 'multivendorx_store_description',
                        'settings'   => [
                            'empty_text' => 'This store has not added a description yet.',
                        ],
                        'elements' => [],
                    ],

                ],
            ],
        ];

        return wp_json_encode( $data );
    }

}
