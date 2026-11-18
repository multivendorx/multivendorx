<?php
/**
 * Tests for MultiVendorX\MinMax\Frontend's min/max rule resolution and validation.
 *
 * Path mirrors the source file under test: modules/MinMax/Frontend.php.
 *
 * get_rules()/validate_rules() are private - invoked here via reflection,
 * since this module's quantity/amount-limit logic is real business logic
 * worth a direct regression test, not just whatever the public WooCommerce
 * hook callbacks happen to exercise incidentally.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\MinMax\Frontend::get_rules()/validate_rules() (both private, via reflection).
 */
class MultiVendorX_MinMax_Frontend_Test extends WP_UnitTestCase {

	/**
	 * Call a private method on a Frontend instance via reflection.
	 *
	 * @param string $method Method name.
	 * @param array  $args   Positional arguments.
	 * @return mixed
	 */
	private function call_private( string $method, array $args ) {
		$frontend   = new \MultiVendorX\MinMax\Frontend();
		$reflection = new \ReflectionMethod( $frontend, $method );
		$reflection->setAccessible( true );

		return $reflection->invoke( $frontend, ...$args );
	}

	/**
	 * With no product override and no global setting configured, get_rules()
	 * returns the zeroed-out default (no limit).
	 *
	 * @return void
	 */
	public function test_get_rules_defaults_to_zero_when_nothing_configured() {
		$rules = $this->call_private( 'get_rules', array( 0, 'quantity' ) );

		$this->assertSame(
			array(
				'min' => 0,
				'max' => 0,
			),
			$rules
		);
	}

	/**
	 * Get_rules() reads the global product-quantity setting when no
	 * per-product override exists.
	 *
	 * @return void
	 */
	public function test_get_rules_reads_global_quantity_setting() {
		MultiVendorX()->setting->update_setting(
			'product_quantity_rules',
			array(
				array(
					'product_min_quantity' => 2,
					'product_max_quantity' => 10,
				),
			)
		);

		$rules = $this->call_private( 'get_rules', array( 0, 'quantity' ) );

		$this->assertSame(
			array(
				'min' => 2,
				'max' => 10,
			),
			$rules
		);
	}

	/**
	 * Get_rules() reads the global order-amount setting for the
	 * 'order_amount' context specifically, not the quantity one.
	 *
	 * @return void
	 */
	public function test_get_rules_reads_global_order_amount_setting() {
		MultiVendorX()->setting->update_setting(
			'order_amount_rules',
			array(
				array(
					'order_min_amount' => 50.5,
					'order_max_amount' => 500,
				),
			)
		);

		$rules = $this->call_private( 'get_rules', array( 0, 'order_amount' ) );

		$this->assertSame( 50.5, $rules['min'] );
		$this->assertSame( 500.0, $rules['max'] );
	}

	/**
	 * A per-product override (post meta) takes precedence over the global setting.
	 *
	 * @return void
	 */
	public function test_get_rules_prefers_per_product_override_over_global_setting() {
		MultiVendorX()->setting->update_setting(
			'product_quantity_rules',
			array(
				array(
					'product_min_quantity' => 1,
					'product_max_quantity' => 100,
				),
			)
		);

		$product_id = self::factory()->post->create( array( 'post_type' => 'product' ) );
		update_post_meta(
			$product_id,
			'multivendorx_min_max_meta',
			array(
				'min_quantity' => 5,
				'max_quantity' => 20,
			)
		);

		$rules = $this->call_private( 'get_rules', array( $product_id, 'quantity' ) );

		$this->assertSame(
			array(
				'min' => 5,
				'max' => 20,
			),
			$rules
		);
	}

	/**
	 * Validate_rules() returns an empty string (valid) when the value is
	 * within the configured min/max range.
	 *
	 * @return void
	 */
	public function test_validate_rules_returns_empty_string_when_within_range() {
		MultiVendorX()->setting->update_setting(
			'product_quantity_rules',
			array(
				array(
					'product_min_quantity' => 2,
					'product_max_quantity' => 10,
				),
			)
		);

		$result = $this->call_private( 'validate_rules', array( 5, 0, 'quantity', false ) );

		$this->assertSame( '', $result );
	}

	/**
	 * Validate_rules() returns a translated error message when the value is
	 * below the configured minimum.
	 *
	 * @return void
	 */
	public function test_validate_rules_returns_message_when_below_minimum() {
		MultiVendorX()->setting->update_setting(
			'product_quantity_rules',
			array(
				array(
					'product_min_quantity' => 5,
					'product_max_quantity' => 0,
				),
			)
		);

		$result = $this->call_private( 'validate_rules', array( 1, 0, 'quantity', false ) );

		$this->assertStringContainsString( '5', $result );
		$this->assertIsString( $result );
	}

	/**
	 * Validate_rules() with return_number=true returns the raw limit number
	 * instead of a translated message, when the value is above the maximum.
	 *
	 * @return void
	 */
	public function test_validate_rules_returns_raw_max_number_when_requested() {
		MultiVendorX()->setting->update_setting(
			'product_quantity_rules',
			array(
				array(
					'product_min_quantity' => 0,
					'product_max_quantity' => 10,
				),
			)
		);

		$result = $this->call_private( 'validate_rules', array( 50, 0, 'quantity', true ) );

		$this->assertSame( 10, $result );
	}
}
