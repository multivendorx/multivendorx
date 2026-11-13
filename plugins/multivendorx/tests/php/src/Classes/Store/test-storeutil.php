<?php
/**
 * Tests for MultiVendorX\Store\StoreUtil's pure helpers.
 *
 * Path mirrors the source file under test: classes/Store/StoreUtil.php.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\Store\StoreUtil::get_phone()'s fallback chain and
 * MultiVendorX\Store\StoreUtil::get_store_capability()'s static capability map shape.
 */
class MultiVendorX_StoreUtil_Test extends WP_UnitTestCase {

	/**
	 * A phone meta array with both a country code and a phone number is joined as "<code> <phone>".
	 *
	 * @return void
	 */
	public function test_get_phone_joins_country_code_and_phone_number() {
		$phone_meta = array(
			'country_code' => '+1',
			'phone'        => '5551234567',
		);

		$this->assertSame( '+1 5551234567', \MultiVendorX\Store\StoreUtil::get_phone( $phone_meta ) );
	}

	/**
	 * When "phone" is absent, get_phone() falls back to "whatsapp_number".
	 *
	 * @return void
	 */
	public function test_get_phone_falls_back_to_whatsapp_number_when_phone_missing() {
		$phone_meta = array(
			'country_code'    => '+44',
			'whatsapp_number' => '7911123456',
		);

		$this->assertSame( '+44 7911123456', \MultiVendorX\Store\StoreUtil::get_phone( $phone_meta ) );
	}

	/**
	 * Missing country code and phone/whatsapp still returns a string, not a notice/warning.
	 *
	 * @return void
	 */
	public function test_get_phone_returns_blank_parts_when_meta_is_empty() {
		$this->assertSame( ' ', \MultiVendorX\Store\StoreUtil::get_phone( array() ) );
	}

	/**
	 * Get_phone() accepts a serialized string, same as raw postmeta/store-meta storage would hand it.
	 *
	 * @return void
	 */
	public function test_get_phone_unserializes_a_serialized_meta_string() {
		$serialized = serialize( // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.serialize_serialize -- mirrors how store meta is actually stored/read.
			array(
				'country_code' => '+91',
				'phone'        => '9876543210',
			)
		);

		$this->assertSame( '+91 9876543210', \MultiVendorX\Store\StoreUtil::get_phone( $serialized ) );
	}

	/**
	 * Get_store_capability() returns a non-empty map of capability groups, each with the
	 * label/desc/capability shape the admin UI and capability-assignment logic rely on.
	 *
	 * @return void
	 */
	public function test_get_store_capability_returns_groups_shaped_for_the_capability_ui() {
		$capabilities = \MultiVendorX\Store\StoreUtil::get_store_capability();

		$this->assertIsArray( $capabilities );
		$this->assertArrayHasKey( 'products', $capabilities );
		$this->assertArrayHasKey( 'orders', $capabilities );

		foreach ( $capabilities as $group ) {
			$this->assertArrayHasKey( 'label', $group );
			$this->assertArrayHasKey( 'desc', $group );
			$this->assertArrayHasKey( 'capability', $group );
			$this->assertIsArray( $group['capability'] );
			$this->assertNotEmpty( $group['capability'] );
		}
	}

	/**
	 * Every "orders" capability key named in the admin capability UI must still be present.
	 *
	 * @return void
	 */
	public function test_get_store_capability_orders_group_includes_expected_capability_keys() {
		$capabilities = \MultiVendorX\Store\StoreUtil::get_store_capability();

		$this->assertArrayHasKey( 'view_shop_orders', $capabilities['orders']['capability'] );
		$this->assertArrayHasKey( 'edit_shop_orders', $capabilities['orders']['capability'] );
		$this->assertArrayHasKey( 'delete_shop_orders', $capabilities['orders']['capability'] );
	}
}
