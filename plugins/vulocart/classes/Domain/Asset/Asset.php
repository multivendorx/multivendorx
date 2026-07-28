<?php
/**
 * Asset class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Domain\Asset;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Asset entity.
 *
 * Plain domain object — no `$wpdb`, no WordPress function calls, no REST
 * request handling. `Infrastructure\Database\WPDBAssetRepository` is the
 * only class that knows how an Asset is actually stored; everything above
 * it (Application\AssetService, RestAPI\Controllers\Assets) works with
 * this object, never a raw row array.
 *
 * No constructor property promotion / named arguments (both PHP 8.0+) —
 * this repo's phpcs.xml.dist targets PHP 7.4 (testVersion, coding-standards.md),
 * so plain property declarations + constructor assignment is used
 * throughout, matching every other class in this codebase despite
 * composer.json's own `>=8.0` platform requirement.
 *
 * @class       Asset class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Asset {

    /**
     * Asset id.
     *
     * @var int|null Null for an asset not yet persisted.
     */
    public $id;

    /**
     * Asset type.
     *
     * @var string One of AssetType's constants.
     */
    public $type;

    /**
     * Display title.
     *
     * @var string Display title.
     */
    public $title;

    /**
     * URL-safe slug.
     *
     * @var string URL-safe slug.
     */
    public $slug;

    /**
     * Stock-keeping unit.
     *
     * @var string|null Stock-keeping unit, if any.
     */
    public $sku;

    /**
     * Lifecycle status.
     *
     * @var string 'draft'|'published'|'archived'.
     */
    public $status;

    /**
     * Base price.
     *
     * @var float|null Base price, in $currency's minor-agnostic decimal form.
     */
    public $price;

    /**
     * Currency code.
     *
     * @var string|null ISO 4217 currency code.
     */
    public $currency;

    /**
     * Extensible, type-specific attributes.
     *
     * @var array<string, mixed> Extensible, type-specific attributes.
     */
    public $meta;

    /**
     * Creation timestamp.
     *
     * @var string|null MySQL datetime string, once persisted.
     */
    public $created_at;

    /**
     * Last-updated timestamp.
     *
     * @var string|null MySQL datetime string, once persisted.
     */
    public $updated_at;

    /**
     * Asset constructor.
     *
     * @param int|null             $id         Null for an asset not yet persisted.
     * @param string               $type       One of AssetType's constants.
     * @param string               $title      Display title.
     * @param string               $slug       URL-safe slug.
     * @param string|null          $sku        Stock-keeping unit, if any.
     * @param string               $status     'draft'|'published'|'archived'.
     * @param float|null           $price      Base price, in $currency's minor-agnostic decimal form.
     * @param string|null          $currency   ISO 4217 currency code.
     * @param array<string, mixed> $meta       Extensible, type-specific attributes.
     * @param string|null          $created_at MySQL datetime string, once persisted.
     * @param string|null          $updated_at MySQL datetime string, once persisted.
     */
    public function __construct(
        $id,
        $type,
        $title,
        $slug,
        $sku = null,
        $status = 'draft',
        $price = null,
        $currency = null,
        $meta = array(),
        $created_at = null,
        $updated_at = null
    ) {
        $this->id         = $id;
        $this->type       = $type;
        $this->title      = $title;
        $this->slug       = $slug;
        $this->sku        = $sku;
        $this->status     = $status;
        $this->price      = $price;
        $this->currency   = $currency;
        $this->meta       = $meta;
        $this->created_at = $created_at;
        $this->updated_at = $updated_at;
    }
}
