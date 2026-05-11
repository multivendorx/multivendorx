<?php
/**
 * Product class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

use MultiVendorX\Store\Store;
use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Product class
 *
 * Adds a "Store" column to the products list in admin.
 *
 * @class   Product
 * @version 5.0.0
 */
class Product {

    /**
     * Constructor: Add hooks.
     */
    public function __construct() {
        // Add and show store column in woocommerce product table.
        add_filter( 'manage_edit-product_columns', array( $this, 'add_store_column_to_product_list' ), 10 );
        add_action( 'manage_product_posts_custom_column', array( $this, 'display_store_column_content' ), 10, 2 );

        // Add store filter in products table.
        add_action( 'restrict_manage_posts', array( $this, 'restrict_manage_posts' ) );
        add_action( 'parse_query', array( $this, 'filter_products_by_store_query' ) );

        // Add store option in bulk action section.
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

            // Insert the custom column 'store_id' after 'name'.
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

    /**
     * Add the store dropdown to the products list
     */
    public function restrict_manage_posts() {
        global $typenow;

        // Only show on Products admin list.
        if ( 'product' !== $typenow ) {
            return;
        }

        // phpcs:disable WordPress.DB.SlowDBQuery.slow_db_query_meta_key
        $products = wc_get_products(
            array(
                'limit'        => -1,
                'return'       => 'ids',
                'meta_key'     => Utill::POST_META_SETTINGS['store_id'],
                'meta_compare' => 'EXISTS',
            )
        );
        // phpcs:enable WordPress.DB.SlowDBQuery.slow_db_query_meta_key

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

        // Build dropdown.
        $selected_store = sanitize_text_field( filter_input( INPUT_GET, Utill::POST_META_SETTINGS['store_id'], FILTER_DEFAULT ) ) ? sanitize_text_field( filter_input( INPUT_GET, Utill::POST_META_SETTINGS['store_id'], FILTER_DEFAULT ) ) : '';

        echo '<select name="multivendorx_store_id">';
        echo '<option value="">Filter by Store</option>';

        foreach ( $store_ids as $store_id ) {
            $store = Store::get_store( $store_id );
            if (empty($store)) {
                continue;
            }
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
     *
     * @param WP_Query $query The current query.
     */
    public function filter_products_by_store_query( $query ) {
        global $typenow, $pagenow;
        $store_id = filter_input( INPUT_GET, Utill::POST_META_SETTINGS['store_id'], FILTER_SANITIZE_NUMBER_INT );

        if (
            'edit.php' === $pagenow &&
            ! empty( $store_id ) &&
            'product' === $typenow
        ) {
            $meta_query = array(
                array(
                    'key'   => Utill::POST_META_SETTINGS['store_id'],
                    'value' => $store_id,
                ),
            );
            $query->set( 'meta_query', $meta_query );
        }
    }

    /**
     * Add the store dropdown to the bulk edit panel
     */
    public function add_product_store_bulk_edit() {
        $stores = StoreUtil::get_stores(); // Fetch stores.
        ?>
        <div class="inline-edit-group">
            <label class="alignleft">
                <span class="title"><?php esc_html_e( 'Assign Store', 'multivendorx' ); ?></span>
                <select name="multivendorx_store_id">
                    <option value=""><?php esc_html_e( '— No change —', 'multivendorx' ); ?></option>
                    <?php
                    if ( ! empty( $stores ) ) {
                        foreach ( $stores as $store ) {
                            echo '<option value="' . esc_attr( $store['ID'] ) . '">' . esc_html( $store['name'] ) . '</option>';
                        }
                    }
                    ?>
                </select>
            </label>
        </div>
        <?php
    }

    /**
     * Save the store ID when bulk editing products
     *
     * @param object $product Product object.
     */
    public function save_product_store_bulk_edit( $product ) {
        $store_id = filter_input( INPUT_GET, Utill::POST_META_SETTINGS['store_id'], FILTER_SANITIZE_NUMBER_INT );

        if ( $store_id ) {
            update_post_meta( $product->get_id(), Utill::POST_META_SETTINGS['store_id'], $store_id );
        }
    }
}
