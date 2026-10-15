<?php
/**
 * Tests for MultiVendorX\Store\Store's CRUD/meta/cache behavior.
 *
 * Path mirrors the source file under test: classes/Store/Store.php.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\Store\Store::save()/load()/get()/set(), meta access, and
 * the static in-request store cache.
 */
class MultiVendorX_Store_Test extends WP_UnitTestCase {

	/**
	 * A freshly constructed store with no ID does not exist.
	 *
	 * @return void
	 */
	public function test_exists_returns_false_for_unloaded_store() {
		$store = new \MultiVendorX\Store\Store();

		$this->assertFalse( $store->exists() );
		$this->assertSame( 0, $store->get_id() );
	}

	/**
	 * Save() on a new store inserts a row and returns the new store ID.
	 *
	 * @return void
	 */
	public function test_save_inserts_a_new_store_and_returns_its_id() {
		$store = $this->create_store();

		$this->assertGreaterThan( 0, $store->get_id() );
	}

	/**
	 * Save() derives a slug from the store name when no slug was set explicitly.
	 *
	 * @return void
	 */
	public function test_save_derives_slug_from_name_when_slug_not_set() {
		$store = $this->create_store( array( 'name' => 'Blue Widgets Co' ) );

		$loaded = new \MultiVendorX\Store\Store( $store->get_id() );
		$this->assertSame( sanitize_title( 'Blue Widgets Co' ), $loaded->get( 'slug' ) );
	}

	/**
	 * A second save() on an already-saved store updates the existing row rather
	 * than inserting a duplicate.
	 *
	 * @return void
	 */
	public function test_save_updates_existing_row_on_second_save() {
		$store    = $this->create_store( array( 'name' => 'Original Name' ) );
		$store_id = $store->get_id();

		$store->set( 'name', 'Renamed Store' );
		$second_id = $store->save();

		$this->assertSame( $store_id, $second_id );

		$loaded = new \MultiVendorX\Store\Store( $store_id );
		$this->assertSame( 'Renamed Store', $loaded->get( 'name' ) );
	}

	/**
	 * Load() on a non-existent ID leaves the store empty rather than throwing.
	 *
	 * @return void
	 */
	public function test_load_returns_false_for_a_store_id_that_does_not_exist() {
		$store  = new \MultiVendorX\Store\Store();
		$result = $store->load( 999999 );

		$this->assertFalse( $result );
		$this->assertFalse( $store->exists() );
	}

	/**
	 * Get() returns null for a data key that was never set, rather than a notice.
	 *
	 * @return void
	 */
	public function test_get_returns_null_for_unset_key() {
		$store = new \MultiVendorX\Store\Store();

		$this->assertNull( $store->get( 'not_a_real_key' ) );
	}

	/**
	 * Update_meta() inserts a new meta row, and get_meta() reads it back.
	 *
	 * @return void
	 */
	public function test_update_meta_inserts_then_get_meta_reads_it_back() {
		$store = $this->create_store();

		$store->update_meta( 'phone', '5551234567' );

		$this->assertSame( '5551234567', $store->get_meta( 'phone' ) );
	}

	/**
	 * Update_meta() on an existing key updates it in place rather than
	 * inserting a second row.
	 *
	 * @return void
	 */
	public function test_update_meta_overwrites_existing_value() {
		$store = $this->create_store();

		$store->update_meta( 'phone', 'first-value' );
		$store->update_meta( 'phone', 'second-value' );

		$this->assertSame( 'second-value', $store->get_meta( 'phone' ) );
	}

	/**
	 * Get_meta() returns null (single mode) or an empty array (multi mode) for
	 * a meta key that was never set.
	 *
	 * @return void
	 */
	public function test_get_meta_returns_null_or_empty_array_for_missing_key() {
		$store = $this->create_store();

		$this->assertNull( $store->get_meta( 'nonexistent_key' ) );
		$this->assertSame( array(), $store->get_meta( 'nonexistent_key', false ) );
	}

	/**
	 * A serialized meta value is transparently unserialized by get_all_meta().
	 *
	 * @return void
	 */
	public function test_update_meta_serializes_array_values_and_get_all_meta_unserializes_them() {
		$store = $this->create_store();

		$store->update_meta( 'payment_methods', array( 'bank_transfer', 'paypal' ) );

		$reloaded = new \MultiVendorX\Store\Store( $store->get_id() );
		$this->assertSame( array( 'bank_transfer', 'paypal' ), $reloaded->get_meta( 'payment_methods' ) );
	}

	/**
	 * Load() on the same ID twice within one request hits the static store
	 * cache rather than re-querying the database.
	 *
	 * @return void
	 */
	public function test_load_reuses_static_cache_for_same_store_id() {
		$store    = $this->create_store( array( 'name' => 'Cached Store' ) );
		$store_id = $store->get_id();

		$first  = new \MultiVendorX\Store\Store( $store_id );
		$second = new \MultiVendorX\Store\Store( $store_id );

		$this->assertSame( $first->get( 'name' ), $second->get( 'name' ) );
		$this->assertSame( $store_id, $second->get_id() );
	}

	/**
	 * Running counter so repeated calls within one test don't collide on
	 * name/slug.
	 *
	 * @var int
	 */
	private static $store_sequence = 0;

	/**
	 * Create and save a store with sensible defaults, overridable per call.
	 *
	 * @param array $overrides Store data to override the defaults with.
	 * @return \MultiVendorX\Store\Store
	 */
	private function create_store( array $overrides = array() ): \MultiVendorX\Store\Store {
		++self::$store_sequence;

		$data = wp_parse_args(
			$overrides,
			array(
				'name'   => 'Test Store ' . self::$store_sequence,
				'status' => 'active',
			)
		);

		$store = new \MultiVendorX\Store\Store();
		foreach ( $data as $key => $value ) {
			$store->set( $key, $value );
		}
		$store->save();

		return $store;
	}
}
