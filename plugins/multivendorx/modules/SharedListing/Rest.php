<?php
/**
 * Modules class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\SharedListing;

use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX REST API SharedListing controller.
 *
 * @class       Module class
 * @version     5.0.0
 * @author      MultiVendorX
 */
class Rest {

    /**
     * Constructor.
     *
     * Hooks product insert event to add additional data
     * when a product is created or updated via the REST API.
     */
    public function __construct() {
        add_action( 'woocommerce_rest_insert_product_object', array( $this, 'add_additional_data_in_product' ), 10, 3 );
    }

    /**
     * Adds additional mapping data when a product is created via the REST API.
     *
     * This function links a newly created duplicate product with its original product
     * by storing both IDs in a custom mapping table and updating related post meta.
     *
     * @param WC_Product      $product  The product object being created.
     * @param WP_REST_Request $request  The REST API request containing product data.
     * @param bool            $creating Whether the product is being created (true) or updated (false).
     *
     * @return void
     */
    public function add_additional_data_in_product( $product, $request, $creating ) {
        if ( ! $creating ) {
            return;
        }

        global $wpdb;

        $original_id  = isset( $request['original_id'] ) ? intval( $request['original_id'] ) : 0;
        $duplicate_id = $product->get_id();

        if ( ! $original_id ) {
            return;
        }

        $table = $wpdb->prefix . Utill::TABLES['shared_listing'];

        $existing_map_id = get_post_meta( $original_id, Utill::POST_META_SETTINGS['shared_listing_id'], true );

        if ( empty( $existing_map_id ) ) {
            $map_data = array(
				$original_id,
				$duplicate_id,
			);

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->insert(
                $table,
                array(
                    'listing_products' => maybe_serialize( $map_data ),
                ),
                array( '%s' )
            );

            $insert_id = $wpdb->insert_id;

            if ( $insert_id ) {
                update_post_meta( $duplicate_id, Utill::POST_META_SETTINGS['shared_listing_id'], $insert_id );
                update_post_meta( $original_id, Utill::POST_META_SETTINGS['shared_listing_id'], $insert_id );
            }
        } else {
            $table = $wpdb->prefix . Utill::TABLES['shared_listing'];

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $sql = "SELECT * FROM {$table} WHERE ID = %d";

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $row = $wpdb->get_row(
                // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
                $wpdb->prepare( $sql, $existing_map_id )
            );

            if ( $row ) {
                $map_array = maybe_unserialize( $row->listing_products, true );

                if ( ! is_array( $map_array ) ) {
                    $map_array = array();
                }

                if ( ! in_array( $duplicate_id, $map_array, true ) ) {
                    $map_array[] = $duplicate_id;
                }

                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $wpdb->update(
                    $table,
                    array( 'listing_products' => maybe_serialize( $map_array ) ),
                    array( 'ID' => $existing_map_id ),
                    array( '%s' ),
                    array( '%d' )
                );

                update_post_meta( $duplicate_id, Utill::POST_META_SETTINGS['shared_listing_id'], $existing_map_id );
            }
        }

        if ( ! empty( $wpdb->last_error ) && MultiVendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        }
    }
}
