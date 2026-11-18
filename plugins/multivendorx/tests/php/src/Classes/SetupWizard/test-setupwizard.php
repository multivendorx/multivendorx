<?php
/**
 * Tests for MultiVendorX\SetupWizard's React mount-point rendering.
 *
 * Path mirrors the source file under test: classes/SetupWizard.php.
 *
 * Only covers render_setup_wizard() - admin_scripts() needs a real admin
 * screen context (get_current_screen() returns null outside one) and is
 * left for a later batch.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\SetupWizard::render_setup_wizard().
 */
class MultiVendorX_SetupWizard_Test extends WP_UnitTestCase {

	/**
	 * Render_setup_wizard() echoes the fixed React mount-point div.
	 *
	 * @return void
	 */
	public function test_render_setup_wizard_echoes_mount_point() {
		$wizard = new \MultiVendorX\SetupWizard();

		ob_start();
		$wizard->render_setup_wizard();
		$output = ob_get_clean();

		$this->assertStringContainsString( 'id="multivendorx-setup-wizard"', $output );
	}
}
