<?php
/**
 * Tests for MultiVendorX\Widgets' sidebar-block attachment/restriction.
 *
 * Path mirrors the source file under test: classes/Widgets.php.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\Widgets::attach_sidebar_render_callback()/restrict_store_blocks().
 */
class MultiVendorX_Widgets_Test extends WP_UnitTestCase {

	/**
	 * Attach_sidebar_render_callback() attaches the render callback only to
	 * the store-sidebar block, leaving other blocks' args untouched.
	 *
	 * @return void
	 */
	public function test_attach_sidebar_render_callback_only_for_store_sidebar_block() {
		$widgets = new \MultiVendorX\Widgets();

		$result = $widgets->attach_sidebar_render_callback( array(), 'multivendorx/store-sidebar' );
		$this->assertSame( array( $widgets, 'render_sidebar' ), $result['render_callback'] );

		$other = $widgets->attach_sidebar_render_callback( array( 'foo' => 'bar' ), 'core/paragraph' );
		$this->assertSame( array( 'foo' => 'bar' ), $other );
	}

	/**
	 * On a store page, restrict_store_blocks() passes the allowed-blocks
	 * list through unchanged.
	 *
	 * @return void
	 */
	public function test_restrict_store_blocks_passthrough_on_store_page() {
		set_query_var( 'store', 'acme' );

		$widgets = new \MultiVendorX\Widgets();
		$allowed = array( 'core/paragraph', 'core/image' );

		$this->assertSame( $allowed, $widgets->restrict_store_blocks( $allowed, null ) );
	}

	/**
	 * Off a store page, restrict_store_blocks() excludes blocks registered
	 * under the multivendorx-store-shop category.
	 *
	 * @return void
	 */
	public function test_restrict_store_blocks_excludes_store_shop_category_off_store_page() {
		set_query_var( 'store', '' );

		register_block_type(
			'multivendorx-test/store-only-block',
			array( 'category' => 'multivendorx-store-shop' )
		);

		$widgets  = new \MultiVendorX\Widgets();
		$filtered = $widgets->restrict_store_blocks( array(), null );

		$this->assertNotContains( 'multivendorx-test/store-only-block', $filtered );
		$this->assertContains( 'core/paragraph', $filtered );

		unregister_block_type( 'multivendorx-test/store-only-block' );
	}
}
