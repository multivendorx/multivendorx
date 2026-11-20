<?php
/**
 * Integration class file.
 *
 * @package CatalogX
 */

namespace CatalogX\VuloForm;

defined( 'ABSPATH' ) || exit;

/**
 * Wires VuloForm in as the enquiry form builder, for every CatalogX site.
 */
class Integration {

    /**
     * Integration constructor.
     */
    public function __construct() {
        new Installer();
        new Templates();
        new SubmissionBridge();
        new PreviewRest();
        new Migration();
    }
}
