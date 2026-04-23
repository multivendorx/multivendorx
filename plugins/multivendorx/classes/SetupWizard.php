<?php
/**
 * Setup Wizard class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX SetupWizard class
 *
 * @class       SetupWizard
 * @version     5.0.0
 * @package     MultiVendorX
 * @author      MultiVendorX
 */
class SetupWizard {

    /**
	 * Constructor for SetupWizard class.
	 */
    public function __construct() {
        // Add menu page for setup wizard.
        add_action( 'admin_menu', array( $this, 'admin_menus' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'admin_scripts' ) );
    }

    /**
     * Add admin menus/screens.
     *
     * @return void
     */
    public function admin_menus() {
        add_dashboard_page( '', '', 'manage_options', 'multivendorx-setup', array( $this, 'render_setup_wizard' ) );
    }

    /**
	 * Render the root div for React setup wizard app.
	 *
	 * @return void
	 */
    public function render_setup_wizard() {
        ?>
        <div id="multivendorx-setup-wizard">
        </div>
        <?php
    }

    /**
	 * Enqueue scripts and styles for the setup wizard screen.
	 *
	 * @return void
	 */
    public function admin_scripts() {
        $current_screen = get_current_screen();

        if ( 'dashboard_page_multivendorx-setup' === $current_screen->id ) {
            FrontendScripts::enqueue_script( 'multivendorx-vendor-script' );
            wp_enqueue_script( 'setup-wizard-script', MultiVendorX()->plugin_url . FrontendScripts::get_build_path_name() . 'js/block/setup-wizard/index.js', array( 'jquery', 'jquery-blockui', 'wp-element', 'wp-i18n', 'react-jsx-runtime' ), MultiVendorX()->version, true );
            wp_set_script_translations( 'setup-wizard-script', 'multivendorx' );
            wp_localize_script(
                'setup-wizard-script',
                'appLocalizer',
                array(
					'apiUrl'       => untrailingslashit( get_rest_url() ),
					'nonce'        => wp_create_nonce( 'wp_rest' ),
					'restUrl'      => MultiVendorX()->rest_namespace,
					'redirect_url' => admin_url() . 'admin.php?page=multivendorx#&tab=modules',
                    'admin_url'    => admin_url(),
				)
            );
        }
    }
}
