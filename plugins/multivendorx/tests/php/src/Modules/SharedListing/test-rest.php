<?php
/**
 * Tests for MultiVendorX\SharedListing\Rest's duplicate-product mapping.
 *
 * Path mirrors the source file under test: modules/SharedListing/Rest.php.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\SharedListing\Rest::add_additional_data_in_product().
 */
class MultiVendorX_SharedListing_Rest_Test extends WP_UnitTestCase {

	/**
	 * When the product is being updated (not created), nothing happens.
	 *
	 * @return void
	 */
	public function test_does_nothing_when_not_creating() {
		$rest    = new \MultiVendorX\SharedListing\Rest();
		$product = self::factory()->post->create_and_get( array( 'post_type' => 'product' ) );
		$request = new \WP_REST_Request();
		$request->set_param( 'original_id', 5 );

		$rest->add_additional_data_in_product( $product, $request, false );

		$this->assertEmpty( get_post_meta( $product->ID, \MultiVendorX\Utill::POST_META_SETTINGS['shared_listing_id'], true ) );
	}

	/**
	 * With no original_id in the request, nothing happens.
	 *
	 * @return void
	 */
	public function test_does_nothing_when_original_id_missing() {
		$rest    = new \MultiVendorX\SharedListing\Rest();
		$product = self::factory()->post->create_and_get( array( 'post_type' => 'product' ) );
		$request = new \WP_REST_Request();

		$rest->add_additional_data_in_product( $product, $request, true );

		$this->assertEmpty( get_post_meta( $product->ID, \MultiVendorX\Utill::POST_META_SETTINGS['shared_listing_id'], true ) );
	}

	/**
	 * The first time a product is duplicated, a new mapping row is created
	 * and both the original and duplicate get the same mapping-row ID in meta.
	 *
	 * @return void
	 */
	public function test_creates_new_mapping_row_on_first_duplication() {
		$rest        = new \MultiVendorX\SharedListing\Rest();
		$original_id = self::factory()->post->create( array( 'post_type' => 'product' ) );
		$duplicate   = self::factory()->post->create_and_get( array( 'post_type' => 'product' ) );

		$request = new \WP_REST_Request();
		$request->set_param( 'original_id', $original_id );

		$rest->add_additional_data_in_product( $duplicate, $request, true );

		$map_id = get_post_meta( $duplicate->ID, \MultiVendorX\Utill::POST_META_SETTINGS['shared_listing_id'], true );
		$this->assertNotEmpty( $map_id );
		$this->assertSame( $map_id, get_post_meta( $original_id, \MultiVendorX\Utill::POST_META_SETTINGS['shared_listing_id'], true ) );
	}

	/**
	 * Duplicating a second time from the same original appends to the
	 * existing mapping row rather than creating a second one.
	 *
	 * @return void
	 */
	public function test_appends_to_existing_mapping_row_on_second_duplication() {
		$rest        = new \MultiVendorX\SharedListing\Rest();
		$original_id = self::factory()->post->create( array( 'post_type' => 'product' ) );

		$first_duplicate = self::factory()->post->create_and_get( array( 'post_type' => 'product' ) );
		$request_one     = new \WP_REST_Request();
		$request_one->set_param( 'original_id', $original_id );
		$rest->add_additional_data_in_product( $first_duplicate, $request_one, true );

		$map_id = get_post_meta( $first_duplicate->ID, \MultiVendorX\Utill::POST_META_SETTINGS['shared_listing_id'], true );

		$second_duplicate = self::factory()->post->create_and_get( array( 'post_type' => 'product' ) );
		$request_two      = new \WP_REST_Request();
		$request_two->set_param( 'original_id', $original_id );
		$rest->add_additional_data_in_product( $second_duplicate, $request_two, true );

		// Same mapping row reused, not a second one created.
		$this->assertSame( $map_id, get_post_meta( $second_duplicate->ID, \MultiVendorX\Utill::POST_META_SETTINGS['shared_listing_id'], true ) );

		global $wpdb;
		$row      = $wpdb->get_row(
			$wpdb->prepare( 'SELECT listing_products FROM %i WHERE ID = %d', $wpdb->prefix . \MultiVendorX\Utill::TABLES['shared_listing'], $map_id ) // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- test assertion against this plugin's own table.
		);
		$products = maybe_unserialize( $row->listing_products );

		$this->assertContains( $second_duplicate->ID, $products );
	}
}
