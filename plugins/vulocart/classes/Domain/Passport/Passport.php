<?php
/**
 * Passport class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Domain\Passport;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Passport value object.
 *
 * The vision: "Every Asset automatically owns a Passport" — authenticity,
 * serial number, manufacturer, warranty, carbon footprint, owner/service
 * history, and more, all "extensible". This class is only the shared
 * shape (an asset id plus an open `attributes` bag) so free-tier code can
 * type-hint against it; vulocart-pro's Passport module owns the actual
 * persistence (its own `vulocart_passports` table) and REST surface — see
 * plugins/vulocart-pro/ARCHITECTURE.md. Free does not persist Passport
 * data itself.
 *
 * @class       Passport class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Passport {

    /**
     * The Asset this passport belongs to.
     *
     * @var int The Asset this passport belongs to.
     */
    public $asset_id;

    /**
     * Open bag of passport fields.
     *
     * @var array<string, mixed> Open bag — serial_number, manufacturer,
     *      warranty, carbon_footprint, owner_history, etc. New fields
     *      never require a schema change, only a new key here.
     */
    public $attributes;

    /**
     * Passport constructor.
     *
     * @param int                  $asset_id   The Asset this passport belongs to.
     * @param array<string, mixed> $attributes Open bag of passport fields.
     */
    public function __construct( $asset_id, $attributes = array() ) {
        $this->asset_id   = $asset_id;
        $this->attributes = $attributes;
    }
}
