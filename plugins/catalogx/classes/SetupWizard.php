<?php
/**
 * Setup Wizard class file
 *
 * @package CatalogX
 */

namespace CatalogX;

defined( 'ABSPATH' ) || exit;

/**
 * CatalogX SetupWizard class
 *
 * @class       SetupWizard
 * @version     6.0.0
 * @package     CatalogX
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
        add_dashboard_page( '', '', 'manage_options', 'catalogx-setup', array( $this, 'render_setup_wizard' ) );
    }

    /**
	 * Render the root div for React setup wizard app.
	 *
	 * @return void
	 */
    public function render_setup_wizard() {
        ?>
        <div id="catalogx-setup-wizard">
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

        if ( 'dashboard_page_catalogx-setup' === $current_screen->id ) {
            wp_enqueue_script( 'setup-wizard-script', CatalogX()->plugin_url . FrontendScripts::get_build_path_name() . 'js/block/setupWizard/index.js', array( 'jquery', 'jquery-blockui', 'wp-element', 'wp-i18n', 'react-jsx-runtime' ), CatalogX()->version, true );
            wp_set_script_translations( 'setup-wizard-script', 'catalogx' );
            wp_enqueue_style( 'setup-wizard-style', CatalogX()->plugin_url . FrontendScripts::get_build_path_name() . 'styles/block/setupWizard/index.css', array(), CatalogX()->version );
            wp_localize_script(
                'setup-wizard-script',
                'appLocalizer',
                array(
					'apiUrl'       => untrailingslashit( get_rest_url() ),
					'nonce'        => wp_create_nonce( 'wp_rest' ),
					'restUrl'      => CatalogX()->rest_namespace,
					'redirect_url' => admin_url() . 'admin.php?page=catalogx#&tab=modules',
				)
            );
        }
    }
}
