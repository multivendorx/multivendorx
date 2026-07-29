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
 * The vision: "Every Offering automatically owns a Passport" — authenticity,
 * serial number, manufacturer, warranty, carbon footprint, owner/service
 * history, and more, all "extensible". This class is only the shared
 * shape (an offering id plus an open `attributes` bag) so free-tier code can
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
     * The Offering this passport belongs to.
     *
     * @var int The Offering this passport belongs to.
     */
    public $offering_id;

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
     * @param int                  $offering_id   The Offering this passport belongs to.
     * @param array<string, mixed> $attributes Open bag of passport fields.
     */
    public function __construct( $offering_id, $attributes = array() ) {
        $this->offering_id = $offering_id;
        $this->attributes  = $attributes;
    }
}
