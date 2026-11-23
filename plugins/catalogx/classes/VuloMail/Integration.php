<?php
/**
 * Integration class file.
 *
 * @package CatalogX
 */

namespace CatalogX\VuloMail;

defined( 'ABSPATH' ) || exit;

/**
 * Wires VuloMail in as the enquiry email's editor, for every CatalogX site.
 */
class Integration {

    /**
     * Integration constructor.
     */
    public function __construct() {
        new Installer();
        new Templates();
        new PreviewRest();
    }
}
