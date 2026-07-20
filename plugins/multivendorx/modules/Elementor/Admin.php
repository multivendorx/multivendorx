<?php
/**
 * MultiVendorX Elementor Admin.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Elementor;

/**
 * MultiVendorX Elementor Admin class.
 *
 * @class       Admin class
 * @version     5.0.0
 * @author      MultiVendorX
 */
class Admin {

    /**
     * Resolved Elementor template ID for the current request, cached to
     * avoid repeating the lookup query across the several hooks below.
     *
     * @var int|false|null
     */
    private $elementor_template_id = null;

    /**
     * Constructor.
     */
    public function __construct() {
        // Elementor support - Register custom document type.
        add_action( 'elementor/documents/register', array( $this, 'register_elementor_document_type' ) );
        add_filter( 'multivendorx_store_elementor_template', array( $this, 'elementor_template_filter' ), 10 );
        // Add content in Elementor template.
        add_action( 'save_post_elementor_library', array( $this, 'default_store_template' ), 10, 3 );
        // Make sure the store template is included in Elementor's frontend style render pass, however it gets triggered.
        add_action( 'elementor/frontend/before_enqueue_styles', array( $this, 'register_store_template_for_render' ) );
        // Trigger Elementor's own frontend style pipeline on the store page, since Elementor doesn't self-attach it there.
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_atomic_widgets_styles' ) );
    }

    /**
     * Register custom Elementor document type.
     *
     * @param \Elementor\Documents_Manager $documents_manager Documents manager instance.
     */
    public function register_elementor_document_type( $documents_manager ) {
        $documents_manager->register_document_type( 'multivendorx-store', StoreDocument::class );
    }

    /**
     * Filter Elementor template for store pages.
     *
     * @param string $template Template path.
     * @return string Template path.
     */
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

        $canvas = MultiVendorX()->plugin_path . 'templates/elementor-canvas.php';
        return file_exists( $canvas ) ? $canvas : $template;
    }

    /**
     * Register the store's Elementor template with Elementor's post/render
     * pipeline so its Atomic Elements styles are generated in whichever
     * frontend style render pass actually runs.
     *
     * Elementor's `Frontend::enqueue_styles()` only runs its body once per
     * request (guarded by an internal `static` flag) and only collects
     * Atomic Elements styles for post IDs that fired `elementor/post/render`
     * *before* that single pass executes. `elementor-canvas.php` renders the
     * store template via `get_builder_content()`, which never fires that
     * action, so hooking here - the first action `enqueue_styles()` fires,
     * before its render pass - guarantees the store template's ID is
     * included regardless of whether Elementor's own automatic hook (e.g.
     * for a real "store" page that happens to be singular) or
     * {@see self::enqueue_atomic_widgets_styles()} below is what actually
     * triggers that single pass.
     *
     * @return void
     */
    public function register_store_template_for_render() {
        if ( ! get_query_var( MultiVendorX()->store->rewrites->custom_store_url ) ) {
            return;
        }

        $elementor_template_id = $this->get_elementor_template();

        if ( $elementor_template_id ) {
            do_action( 'elementor/post/render', $elementor_template_id );
        }
    }

    /**
     * Trigger Elementor's own frontend style pipeline on the store page.
     *
     * Elementor only hooks `Frontend::enqueue_styles()` onto
     * `wp_enqueue_scripts` for `is_singular()` requests whose queried post is
     * itself built with Elementor - never for the store page's virtual query
     * (`Rewrites::make_endpoint_virtual_page()`). Without this, nothing ever
     * calls Elementor's style pipeline at all on the store page, so we call
     * its public `enqueue_styles()` method ourselves rather than manually
     * enqueuing a CSS file. Registration in {@see self::register_store_template_for_render()}
     * ensures the store template's own styles are included in this pass.
     *
     * @return void
     */
    public function enqueue_atomic_widgets_styles() {
        if ( ! class_exists( '\Elementor\Plugin' ) || ! did_action( 'elementor/loaded' ) ) {
            return;
        }

        if ( ! get_query_var( MultiVendorX()->store->rewrites->custom_store_url ) || ! $this->get_elementor_template() ) {
            return;
        }

        \Elementor\Plugin::$instance->frontend->enqueue_styles();
    }

    /**
     * Get active Elementor template for store.
     *
     * @return int|false Template ID or false if not found.
     */
    private function get_elementor_template() {
        if ( null !== $this->elementor_template_id ) {
            return $this->elementor_template_id;
        }

        if ( ! did_action( 'elementor/loaded' ) ) {
            return false;
        }

        // Find template with our custom document type.
        $args = array(
            'post_type'      => 'elementor_library',
            'posts_per_page' => 1,
            'post_status'    => 'publish',
            // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
            'meta_query'     => array(
                array(
                    'key'   => '_elementor_template_type',
                    'value' => 'multivendorx-store',
                ),
            ),
        );

        $templates = get_posts( $args );

        $this->elementor_template_id = ! empty( $templates ) ? $templates[0]->ID : false;

        return $this->elementor_template_id;
    }

    /**
     * Set default content for new store templates.
     *
     * @param int      $post_id Post ID.
     * @param \WP_Post $post    Post object.
     * @param bool     $update  True if post is being updated.
     */
    public function default_store_template( $post_id, $post, $update ) {

        // Only for new templates.
        if ( true === $update ) {
            return;
        }

        $template_type = get_post_meta( $post_id, '_elementor_template_type', true );
        if ( 'multivendorx-store' !== $template_type ) {
            return;
        }

        // Do not overwrite if already exists.
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

    /**
     * Get default Elementor data for store template.
     *
     * @return string JSON-encoded Elementor structure.
     */
    private function get_default_store_elementor_data() {

        $data = array(
            // Store banner start.
            array(
                'id'       => 'main-store-container-' . uniqid(),
                'elType'   => 'container',
                'settings' => array(
                    'content_width'  => 'boxed',
                    'flex_direction' => 'row',
                    'gap'            => '10',
                ),
                'elements' => array(
                    array(
                        'id'         => 'store-logo-' . uniqid(),
                        'elType'     => 'widget',
                        'widgetType' => 'multivendorx_store_banner',
                        'elements'   => array(),
                    ),
                ),
            ),

            // Main container.
            array(
                'id'       => 'main-store-container-' . uniqid(),
                'elType'   => 'container',
                'settings' => array(
                    'content_width'  => 'boxed',
                    'flex_direction' => 'row',
                    'gap'            => '10',
                ),
                'elements' => array(
                    // Store details container.
                    array(
                        'id'       => 'secondary-container-' . uniqid(),
                        'elType'   => 'container',
                        'settings' => array(
                            'content_width'  => 'boxed',
                            'flex_direction' => 'row',
                            'gap'            => '10',
                        ),
                        'elements' => array(
                            // Left container - store logo.
                            array(
                                'id'         => 'store-logo-' . uniqid(),
                                'elType'     => 'widget',
                                'widgetType' => 'multivendorx_store_logo',
                                'settings'   => array(
                                    'image_size' => 'thumbnail',
                                    'align'      => 'center',
                                ),
                                'elements'   => array(),
                            ),
                            // Right container - store name, info, description.
                            array(
                                'id'       => 'right-container-' . uniqid(),
                                'elType'   => 'container',
                                'settings' => array(
                                    'content_width'  => 'boxed',
                                    'flex_direction' => 'column',
                                    'width'          => array(
                                        'size' => 50,
                                        'unit' => '%',
                                    ),
                                    'gap'            => '10',
                                ),
                                'elements' => array(
                                    array(
                                        'id'         => 'store-name-' . uniqid(),
                                        'elType'     => 'widget',
                                        'widgetType' => 'multivendorx_store_name',
                                        'settings'   => array(
                                            'html_tag' => 'h1',
                                        ),
                                        'elements'   => array(),
                                    ),
                                    array(
                                        'id'         => 'store-info-widget-' . uniqid(),
                                        'elType'     => 'widget',
                                        'widgetType' => 'multivendorx_store_info',
                                        'elements'   => array(),
                                    ),
                                    array(
                                        'id'         => 'store-description-' . uniqid(),
                                        'elType'     => 'widget',
                                        'widgetType' => 'multivendorx_store_description',
                                        'settings'   => array(
                                            'empty_text' => 'This store has not added a description yet.',
                                        ),
                                        'elements'   => array(),
                                    ),
                                ),
                            ),
                        ),
                    ),
                    // Right buttons container.
                    array(
                        'id'       => 'secondary-container-' . uniqid(),
                        'elType'   => 'container',
                        'settings' => array(
                            'content_width'   => 'boxed',
                            'justify_content' => 'flex-end',
                            'align_items'     => 'center',
                            'gap'             => '10',
                        ),
                        'elements' => array(
                            array(
                                'id'         => 'store-follow-button-' . uniqid(),
                                'elType'     => 'widget',
                                'widgetType' => 'multivendorx_store_follow',
                                'settings'   => array(
                                    'text' => 'Follow',
                                ),
                                'elements'   => array(),
                            ),
                        ),
                    ),
                ),
            ),

            // Store tab start.
            array(
                'id'       => 'main-store-container-' . uniqid(),
                'elType'   => 'container',
                'settings' => array(
                    'content_width' => 'boxed',
                    'gap'           => '10',
                ),
                'elements' => array(
                    array(
                        'id'         => 'multivendorx-store-tab-' . uniqid(),
                        'elType'     => 'widget',
                        'widgetType' => 'multivendorx_Store_Tab',
                        'elements'   => array(),
                    ),
                ),
            ),
        );

        return wp_json_encode( $data );
    }
}
