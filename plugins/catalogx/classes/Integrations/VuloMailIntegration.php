<?php
/**
 * VuloMail integration class.
 *
 * @package CatalogX
 */

namespace CatalogX\Integrations;

defined( 'ABSPATH' ) || exit;

/**
 * Registers CatalogX with VuloMail's central "Email Templates" screen —
 * `vulomail_email_sources` is read once, client-side, when vulomail's
 * admin script is localized, so the React app knows which
 * `rest_namespace` to call for CatalogX's own `email-templates`/
 * `email-templates/{id}` endpoints
 * (`classes/RestAPI/Controllers/EmailTemplates.php`). Mirrors
 * MultiVendorX's own `classes/Integrations/VuloMailMigration.php`
 * registration — CatalogX's data never moves into vulomail, this only
 * tells vulomail where to find it.
 *
 * @class       VuloMailIntegration class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class VuloMailIntegration {

	/**
	 * Integration constructor.
	 */
	public function __construct() {
		add_filter( 'vulomail_email_sources', array( $this, 'register_email_source' ) );
	}

	/**
	 * Registers CatalogX as a vulomail email-template source.
	 *
	 * @param array $sources Existing registered sources.
	 * @return array
	 */
	public function register_email_source( $sources ) {
		$sources[] = array(
			'plugin'         => 'catalogx',
			'label'          => __( 'CatalogX', 'catalogx' ),
			'rest_namespace' => CatalogX()->rest_namespace,
		);

		return $sources;
	}
}
