<?php
/**
 * Tests for MultiVendorX\RestAPI\Controllers\Settings' settings/setup-wizard persistence.
 *
 * Path mirrors the source file under test: classes/RestAPI/Controllers/Settings.php.
 *
 * Only covers update_item() - get_modules()/set_modules() depend on the
 * Modules discovery/loader system and are left for a later batch.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\RestAPI\Controllers\Settings::update_item().
 */
class MultiVendorX_RestAPI_Settings_Test extends WP_UnitTestCase {

	/**
	 * A request without a valid nonce is rejected with a 403.
	 *
	 * @return void
	 */
	public function test_update_item_rejects_request_without_valid_nonce() {
		$rest    = new \MultiVendorX\RestAPI\Controllers\Settings();
		$request = new \WP_REST_Request();

		$result = $rest->update_item( $request );

		$this->assertWPError( $result );
		$this->assertSame( 403, $result->get_error_data()['status'] );
	}

	/**
	 * The setup-wizard path maps its step-grouped payload onto the
	 * onboarding/commissions/payouts settings keys.
	 *
	 * @return void
	 */
	public function test_update_item_setup_wizard_maps_payload_to_settings_keys() {
		$admin = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin );

		$request = new \WP_REST_Request();
		$request->set_param( 'setupWizard', true );
		$request->set_param(
			'value',
			array(
				'store_setup'       => array( 'approve_store' => 'automatically' ),
				'marketplace_setup' => array( 'store_selling_mode' => 'single_product_variation' ),
				'commission_setup'  => array(
					'commission_type'           => 'flat',
					'commission_value'          => array(
						array(
							'commission_fixed'      => '5',
							'commission_percentage' => '10',
						),
					),
					'disbursement_order_status' => array( 'completed', 'processing' ),
				),
			)
		);
		$request->add_header( 'X-WP-Nonce', wp_create_nonce( 'wp_rest' ) );

		( new \MultiVendorX\RestAPI\Controllers\Settings() )->update_item( $request );

		$onboarding  = MultiVendorX()->setting->get_option( \MultiVendorX\Utill::MULTIVENDORX_SETTINGS['onboarding'] );
		$commissions = MultiVendorX()->setting->get_option( \MultiVendorX\Utill::MULTIVENDORX_SETTINGS['commissions'] );
		$payouts     = MultiVendorX()->setting->get_option( \MultiVendorX\Utill::MULTIVENDORX_SETTINGS['payouts'] );

		$this->assertSame( 'automatically', $onboarding['approve_store'] );
		$this->assertSame( 'single_product_variation', $onboarding['store_selling_mode'] );
		$this->assertSame( 'flat', $commissions['commission_type'] );
		$this->assertSame( '5', $commissions['commission_per_flat'][0]['commission_fixed'] );
		$this->assertSame( array( 'completed', 'processing' ), $payouts['disbursement_order_status'] );
	}

	/**
	 * Changing store_permissions/user_permissions requires manage_options,
	 * even though the route's own permission_callback already requires it -
	 * this is a defense-in-depth check inside the handler itself.
	 *
	 * @return void
	 */
	public function test_update_item_rejects_permission_change_without_manage_options() {
		// Simulate a request reaching the handler without manage_options -
		// e.g. if the route's permission_callback were ever loosened.
		wp_set_current_user( 0 );

		$request = new \WP_REST_Request();
		$request->set_param( 'settingName', 'store_permissions' );
		$request->set_param( 'setting', array() );
		$request->add_header( 'X-WP-Nonce', wp_create_nonce( 'wp_rest' ) );

		$result = ( new \MultiVendorX\RestAPI\Controllers\Settings() )->update_item( $request );

		$this->assertWPError( $result );
		$this->assertSame( 'rest_forbidden', $result->get_error_code() );
	}

	/**
	 * A regular (non-permissions) setting is persisted under its own
	 * multivendorx_{name}_settings option key.
	 *
	 * @return void
	 */
	public function test_update_item_persists_regular_setting() {
		$admin = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin );

		$request = new \WP_REST_Request();
		$request->set_param( 'settingName', 'store' );
		$request->set_param( 'setting', array( 'some_key' => 'some_value' ) );
		$request->add_header( 'X-WP-Nonce', wp_create_nonce( 'wp_rest' ) );

		( new \MultiVendorX\RestAPI\Controllers\Settings() )->update_item( $request );

		$stored = MultiVendorX()->setting->get_option( \MultiVendorX\Utill::MULTIVENDORX_SETTINGS['store'] );
		$this->assertSame( 'some_value', $stored['some_key'] );
	}
}
