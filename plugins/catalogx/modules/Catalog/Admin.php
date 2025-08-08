<?php
/**
 * CatalogX module Admin class file
 *
 * @package CatalogX
 */

namespace CatalogX\Catalog;

/**
 * CatalogX Catalog Module Admin class
 *
 * @class       Admin class
 * @version     6.0.5
 * @author      MultiVendorX
 */
class Admin {
    /**
     * Admin class constructor function.
     */
    public function __construct() {
        // Check the exclution.
        if ( ! Util::is_available() ) {
			return;
        }

        // Add and save fields product tab.
        add_filter( 'woocommerce_product_data_tabs', array( $this, 'add_catalog_tab_in_product' ) );
        add_action( 'woocommerce_product_data_panels', array( $this, 'catalog_product_data_fields' ) );
        add_action( 'woocommerce_process_product_meta', array( $this, 'save_catalog_product_data_fields' ) );
    }

    /**
     * Add custom tab in product tab.
     *
     * @param array $tabs Existing product data tabs.
     * @return array
     */
    public function add_catalog_tab_in_product( $tabs ) {
        // Add the new tab.
        $tabs['catalog'] = array(
            'label'    => __( 'Catalog', 'catalogx' ),
            'target'   => 'catalog_per_product_desc',
            'class'    => array( 'show_if_simple', 'show_if_variable', 'show_if_grouped', 'show_if_external' ),
            'priority' => 50,
        );

        return $tabs;
    }

    /**
     * Content of custom field in product tab.
     *
     * @return void
     */
    public function catalog_product_data_fields() {
        global $post;

        // Retrieve existing value from the database.
        $catalog_product_desc = get_post_meta( $post->ID, 'catalog_per_product_desc', true );

        ?>
        <div id='catalog_per_product_desc' class='panel woocommerce_options_panel'>
            <div class='options_group'>
                <?php
                woocommerce_wp_text_input(
                    array(
						'id'          => 'catalog_per_product_desc',
						'label'       => __( 'Additional Product Details', 'catalogx' ),
						'description' => __( 'Enter extra information about the product to display on the single product page. Useful for highlighting unique features, usage tips, or care instructions.', 'catalogx' ),
						'desc_tip'    => true,
						'type'        => 'text',
						'value'       => $catalog_product_desc ?? '',
                    )
                );
                ?>
            </div>
        </div>
        <?php
    }

    /**
     * Save custom product data for wholesale product.
     *
     * @param mixed $post_id The ID of the product being saved.
     * @return void
     */
    public function save_catalog_product_data_fields( $post_id ) {
        $catalog_product_desc = filter_input( INPUT_POST, 'catalog_per_product_desc', FILTER_SANITIZE_FULL_SPECIAL_CHARS ) ?? '';

        update_post_meta( $post_id, 'catalog_per_product_desc', wc_clean( $catalog_product_desc ) );
    }
}