<?php
/**
 * Tests for MultiVendorX\Modules' discovery/activation registry.
 *
 * Path mirrors the source file under test: classes/Modules.php.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\Modules::camel_to_kebab() (private, via reflection), get_all_modules(),
 * activate_modules()/deactivate_modules(), and is_active()/is_available().
 */
class MultiVendorX_Modules_Test extends WP_UnitTestCase {

	/**
	 * Call the private camel_to_kebab() method via reflection.
	 *
	 * @param string $value Input string.
	 * @return string
	 */
	private function camel_to_kebab( string $value ): string {
		$modules    = new \MultiVendorX\Modules();
		$reflection = new \ReflectionMethod( $modules, 'camel_to_kebab' );
		$reflection->setAccessible( true );

		return $reflection->invoke( $modules, $value );
	}

	/**
	 * A simple two-word PascalCase folder name converts to kebab-case.
	 *
	 * @return void
	 */
	public function test_camel_to_kebab_converts_two_word_name() {
		$this->assertSame( 'follow-store', $this->camel_to_kebab( 'FollowStore' ) );
	}

	/**
	 * An all-caps acronym (WPML) is lowercased as a single word, not split
	 * letter by letter.
	 *
	 * @return void
	 */
	public function test_camel_to_kebab_keeps_acronym_as_one_word() {
		$this->assertSame( 'wpml', $this->camel_to_kebab( 'WPML' ) );
	}

	/**
	 * A three-word name (MinMax) splits at each word boundary.
	 *
	 * @return void
	 */
	public function test_camel_to_kebab_converts_multi_word_name() {
		$this->assertSame( 'min-max', $this->camel_to_kebab( 'MinMax' ) );
	}

	/**
	 * Get_all_modules() discovers real module folders under modules/ on disk,
	 * keyed by their kebab-case id.
	 *
	 * @return void
	 */
	public function test_get_all_modules_discovers_real_modules_on_disk() {
		$modules = ( new \MultiVendorX\Modules() )->get_all_modules();

		$this->assertArrayHasKey( 'follow-store', $modules );
		$this->assertArrayHasKey( 'min-max', $modules );
		$this->assertSame( 'MultiVendorX\\FollowStore\\Module', $modules['follow-store']['module_class'] );
	}

	/**
	 * Is_active()/is_available() reflect the real active-modules option.
	 *
	 * @return void
	 */
	public function test_is_active_reflects_active_modules_option() {
		update_option( \MultiVendorX\Utill::ACTIVE_MODULES_DB_KEY, array( 'min-max' ) );

		$modules = new \MultiVendorX\Modules();

		$this->assertTrue( $modules->is_active( 'min-max' ) );
		$this->assertFalse( $modules->is_active( 'follow-store' ) );
	}

	/**
	 * Activate_modules() adds the given module ids to the active list and
	 * persists them, without dropping modules already active.
	 *
	 * @return void
	 */
	public function test_activate_modules_adds_to_active_list() {
		update_option( \MultiVendorX\Utill::ACTIVE_MODULES_DB_KEY, array( 'min-max' ) );

		$modules = new \MultiVendorX\Modules();
		$result  = $modules->activate_modules( array( 'follow-store' ) );

		$this->assertContains( 'min-max', $result );
		$this->assertContains( 'follow-store', $result );
		$this->assertContains( 'follow-store', get_option( \MultiVendorX\Utill::ACTIVE_MODULES_DB_KEY ) );
	}

	/**
	 * Deactivate_modules() removes the given module ids from the active list.
	 *
	 * @return void
	 */
	public function test_deactivate_modules_removes_from_active_list() {
		update_option( \MultiVendorX\Utill::ACTIVE_MODULES_DB_KEY, array( 'min-max', 'follow-store' ) );

		$modules = new \MultiVendorX\Modules();
		$result  = $modules->deactivate_modules( array( 'follow-store' ) );

		$this->assertNotContains( 'follow-store', $result );
		$this->assertContains( 'min-max', $result );
	}
}
