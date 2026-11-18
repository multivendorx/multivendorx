<?php
/**
 * Tests for MultiVendorX\Store\Rewrites' store-endpoint query/title helpers.
 *
 * Path mirrors the source file under test: classes/Store/Rewrites.php.
 *
 * Only covers the pure query-var/filter methods - load_store_template() can
 * call exit() on a suspended store (not triggered here), and
 * register_rule()/flash_rewrite_rules() touch real WP rewrite rules and are
 * left for a later batch.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\Store\Rewrites::register_query_var()/prevent_store_404()/
 * set_store_page_title()/set_breadcrumbs_title()/add_sidebar_class_for_block_template().
 */
class MultiVendorX_Store_Rewrites_Test extends WP_UnitTestCase {

	/**
	 * Register_query_var() adds the custom store-url var and "segment".
	 *
	 * @return void
	 */
	public function test_register_query_var_adds_store_url_and_segment() {
		$rewrites = new \MultiVendorX\Store\Rewrites();
		$result   = $rewrites->register_query_var( array() );

		$this->assertContains( 'store', $result );
		$this->assertContains( 'segment', $result );
	}

	/**
	 * Prevent_store_404() stops the virtual 404 check when on the store endpoint.
	 *
	 * @return void
	 */
	public function test_prevent_store_404_true_when_on_store_endpoint() {
		set_query_var( 'store', 'acme' );

		$rewrites = new \MultiVendorX\Store\Rewrites();
		$this->assertTrue( $rewrites->prevent_store_404( false ) );
	}

	/**
	 * Prevent_store_404() leaves the original value untouched off the store endpoint.
	 *
	 * @return void
	 */
	public function test_prevent_store_404_passthrough_when_not_on_store_endpoint() {
		set_query_var( 'store', '' );

		$rewrites = new \MultiVendorX\Store\Rewrites();
		$this->assertFalse( $rewrites->prevent_store_404( false ) );
	}

	/**
	 * Set_store_page_title() uses the real store's name when on a real store's page.
	 *
	 * NOTE: get_current_store() caches its result in a function-static
	 * variable shared across every Rewrites instance for the life of the PHP
	 * process - once resolved, it never re-queries. This must be the first
	 * test in this run to call it; running it twice, or any later test
	 * expecting a different queried store, would see this stale cached value.
	 *
	 * @return void
	 */
	public function test_set_store_page_title_uses_store_name() {
		$store = $this->create_store( array( 'name' => 'Acme Supplies' ) );
		set_query_var( 'store', $store->get( 'slug' ) );

		$rewrites = new \MultiVendorX\Store\Rewrites();
		$this->assertSame( 'Acme Supplies', $rewrites->set_store_page_title( 'Default Title' ) );
	}

	/**
	 * Set_store_page_title() leaves the default title untouched off the store endpoint.
	 *
	 * @return void
	 */
	public function test_set_store_page_title_passthrough_when_not_on_store_endpoint() {
		set_query_var( 'store', '' );

		$rewrites = new \MultiVendorX\Store\Rewrites();
		$this->assertSame( 'Default Title', $rewrites->set_store_page_title( 'Default Title' ) );
	}

	/**
	 * Add_sidebar_class_for_block_template() appends the configured sidebar
	 * position class, replacing any stale one already present.
	 *
	 * @return void
	 */
	public function test_add_sidebar_class_replaces_stale_sidebar_class() {
		MultiVendorX()->setting->update_setting( 'store_sidebar', 'right' );

		$rewrites = new \MultiVendorX\Store\Rewrites();
		$result   = $rewrites->add_sidebar_class_for_block_template( array( 'multivendorx-sidebar-left', 'other-class' ) );

		$this->assertContains( 'multivendorx-sidebar-right', $result );
		$this->assertNotContains( 'multivendorx-sidebar-left', $result );
		$this->assertContains( 'other-class', $result );
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
