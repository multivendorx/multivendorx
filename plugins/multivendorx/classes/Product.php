<?php
/**
 * Product class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

use MultiVendorX\Store\Store;
use MultiVendorX\Store\StoreUtil;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Product class
 *
 * Adds a "Store" column to the products list in admin.
 *
 * @class   Product
 * @version PRODUCT_VERSION
 */
class Product {

    /**
     * Constructor: Add hooks.
     */
    public function __construct() {
        add_filter( 'manage_edit-product_columns', array( $this, 'add_store_column_to_product_list' ), 10 );
        add_action( 'manage_product_posts_custom_column', array( $this, 'display_store_column_content' ), 10, 2 );

        add_action( 'restrict_manage_posts', array( $this, 'restrict_manage_posts' ) );
        add_action( 'parse_query', array( $this, 'filter_products_by_store_query' ) );

        add_action( 'woocommerce_product_bulk_edit_end', array( $this, 'add_product_store_bulk_edit' ) );
        add_action( 'woocommerce_product_bulk_edit_save', array( $this, 'save_product_store_bulk_edit' ) );
    }

    /**
     * Add the 'Store' column header after 'Name'.
     *
     * @param array $columns Existing columns.
     * @return array Modified columns.
     */
    public function add_store_column_to_product_list( $columns ) {
        $new_columns = array();
        foreach ( $columns as $key => $title ) {
            $new_columns[ $key ] = $title;

            // Insert the custom column 'store_id' after 'name'
            if ( 'name' === $key ) {
                $new_columns['store_id'] = __( 'Store', 'multivendorx' );
            }
        }
        return $new_columns;
    }

    /**
     * Display the 'Store' column content for each product.
     *
     * @param string $column Column ID.
     * @param int    $post_id Product post ID.
     */
    public function display_store_column_content( $column, $post_id ) {
        if ( 'store_id' !== $column ) {
            return;
        }

        $store_id = get_post_meta( $post_id, Utill::POST_META_SETTINGS['store_id'], true );

        if ( ! $store_id ) {
            echo '<span style="color: #999;">— N/A —</span>';
            return;
        }

        $store = new \MultiVendorX\Store\Store( $store_id );

        if ( $store ) {
            echo esc_html( $store->get( 'name' ) );
        } else {
            echo '<span style="color: #999;">— N/A —</span>';
        }
    }

    public function restrict_manage_posts() {
        global $typenow;

        // Only show on Products admin list
        if ( $typenow !== 'product' ) {
            return;
        }

        $products = wc_get_products(
            array(
				'limit'        => -1,
				'return'       => 'ids',
				'meta_key'     => 'multivendorx_store_id',
				'meta_compare' => 'EXISTS',
            )
        );

        $store_ids = array();
        foreach ( $products as $product_id ) {
            $store_id = get_post_meta( $product_id, Utill::POST_META_SETTINGS['store_id'], true );
            if ( ! empty( $store_id ) ) {
                $store_ids[ $store_id ] = $store_id;
            }
        }

        if ( empty( $store_ids ) ) {
            return;
        }

        // Build dropdown
        $selected_store = sanitize_text_field( filter_input( INPUT_GET, Utill::POST_META_SETTINGS['store_id'], FILTER_DEFAULT ) ) ?: '';

        echo '<select name="multivendorx_store_id">';
        echo '<option value="">Filter by Store</option>';

        foreach ( $store_ids as $store_id ) {
            $store = Store::get_store_by_id( $store_id );
            printf(
                '<option value="%s" %s>%s</option>',
                esc_attr( $store_id ),
                selected( $selected_store, $store_id, false ),
                esc_html( $store->get( 'name' ) )
            );
        }

        echo '</select>';
    }

    /**
     * Filter products list by Store ID
     */
    public function filter_products_by_store_query( $query ) {
        global $typenow, $pagenow;
        $store_id = filter_input( INPUT_GET, 'multivendorx_store_id', FILTER_SANITIZE_NUMBER_INT );

        if (
            $pagenow === 'edit.php' &&
            ! empty( $store_id ) &&
            'product' == $typenow
        ) {
            $meta_query = array(
                array(
                    'key'   => 'multivendorx_store_id',
                    'value' => $store_id,
                ),
            );
            $query->set( 'meta_query', $meta_query );
        }
    }

    public function add_product_store_bulk_edit() {
        $stores = StoreUtil::get_store(); // fetch stores
        ?>
        <div class="inline-edit-group">
            <label class="alignleft">
                <span class="title"><?php esc_html_e( 'Assign Store', 'multivendorx' ); ?></span>
                <select name="multivendorx_store_id">
                    <option value=""><?php esc_html_e( '— No change —', 'multivendorx' ); ?></option>
                    <?php
                    if ( ! empty( $stores ) ) {
                        foreach ( $stores as $store ) {
                            echo '<option value="' . esc_attr( $store['ID'] ) . '">' . $store['name'] . '</option>';
                        }
                    }
                    ?>
                </select>
            </label>
        </div>
        <?php
    }

    public function save_product_store_bulk_edit( $product ) {
        $store_id = filter_input( INPUT_GET, 'multivendorx_store_id', FILTER_SANITIZE_NUMBER_INT );

        if ( $store_id ) {
            update_post_meta( $product->get_id(), 'multivendorx_store_id', $store_id );
        }
    }
}
