<?php
/**
 * Tests for MultiVendorX\Coupon's cross-store coupon restriction.
 *
 * Path mirrors the source file under test: classes/Coupon.php.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\Coupon::restrict_coupon_by_product_store().
 */
class MultiVendorX_Coupon_Test extends WP_UnitTestCase {

	/**
	 * A coupon with no store_id meta at all (a marketplace-wide coupon)
	 * doesn't restrict anything - the original validity is passed through.
	 *
	 * @return void
	 */
	public function test_restrict_coupon_passes_through_for_marketplace_wide_coupon() {
		$coupon = new \WC_Coupon();
		$coupon->save();
		$product = new \WC_Product_Simple();
		$product->save();

		$result = ( new \MultiVendorX\Coupon() )->restrict_coupon_by_product_store( true, $product, $coupon, array() );

		$this->assertTrue( $result );
	}

	/**
	 * A store-restricted coupon applied to a product from a different store
	 * is invalid for that product.
	 *
	 * @return void
	 */
	public function test_restrict_coupon_invalid_for_different_store_product() {
		$coupon = new \WC_Coupon();
		$coupon->save();
		update_post_meta( $coupon->get_id(), \MultiVendorX\Utill::POST_META_SETTINGS['store_id'], 10 );

		$product = new \WC_Product_Simple();
		$product->save();
		update_post_meta( $product->get_id(), \MultiVendorX\Utill::POST_META_SETTINGS['store_id'], 20 );

		$result = ( new \MultiVendorX\Coupon() )->restrict_coupon_by_product_store( true, $product, $coupon, array() );

		$this->assertFalse( $result );
	}

	/**
	 * A store-restricted coupon applied to a matching-store product remains valid.
	 *
	 * @return void
	 */
	public function test_restrict_coupon_valid_for_same_store_product() {
		$coupon = new \WC_Coupon();
		$coupon->save();
		update_post_meta( $coupon->get_id(), \MultiVendorX\Utill::POST_META_SETTINGS['store_id'], 10 );

		$product = new \WC_Product_Simple();
		$product->save();
		update_post_meta( $product->get_id(), \MultiVendorX\Utill::POST_META_SETTINGS['store_id'], 10 );

		$result = ( new \MultiVendorX\Coupon() )->restrict_coupon_by_product_store( true, $product, $coupon, array() );

		$this->assertTrue( $result );
	}

	/**
	 * A store-restricted coupon applied to a product variation is checked
	 * against the parent product's store, not the variation's own (usually
	 * unset) meta.
	 *
	 * @return void
	 */
	public function test_restrict_coupon_checks_variation_parent_store() {
		$coupon = new \WC_Coupon();
		$coupon->save();
		update_post_meta( $coupon->get_id(), \MultiVendorX\Utill::POST_META_SETTINGS['store_id'], 10 );

		$parent = new \WC_Product_Variable();
		$parent->save();
		update_post_meta( $parent->get_id(), \MultiVendorX\Utill::POST_META_SETTINGS['store_id'], 10 );

		$variation = new \WC_Product_Variation();
		$variation->set_parent_id( $parent->get_id() );
		$variation->save();

		$result = ( new \MultiVendorX\Coupon() )->restrict_coupon_by_product_store( true, $variation, $coupon, array() );

		$this->assertTrue( $result );
	}
}
