<?php
/**
 * ProductAttribute class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Domain\Attribute;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart ProductAttribute entity.
 *
 * A named property offerings can be described by (e.g. "Color", "Size")
 * — deliberately NOT a Domain\Term\Term (Taxonomy's own docblock explains
 * why): an attribute's whole purpose is its list of AttributeValue
 * children, not a flat name/slug/description record a Term already is.
 * No variant/SKU-matrix generation reads this yet — OfferingEdit.tsx's
 * own "Attributes & Variations" section is still an inert placeholder
 * (documented there as a deliberately-not-faked gap) — this is the
 * attribute *definition* management layer (`src/pages/Attributes/`) that
 * a future variant system would build on top of.
 *
 * @class       ProductAttribute class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ProductAttribute {

    /**
     * Attribute id.
     *
     * @var int|null Null for an attribute not yet persisted.
     */
    public $id;

    /**
     * Display name, e.g. "Color".
     *
     * @var string
     */
    public $name;

    /**
     * URL/key-safe slug.
     *
     * @var string
     */
    public $slug;

    /**
     * This attribute's values (e.g. "Red", "Blue") — loaded alongside the
     * attribute itself, same "aggregate loaded with its children" shape
     * Order\Domain\Order::$items already uses for line items.
     *
     * @var AttributeValue[]
     */
    public $values;

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
     * ProductAttribute constructor.
     *
     * @param int|null         $id         Null for an attribute not yet persisted.
     * @param string           $name       Display name.
     * @param string           $slug       URL/key-safe slug.
     * @param AttributeValue[] $values     This attribute's values.
     * @param string|null      $created_at MySQL datetime string, once persisted.
     * @param string|null      $updated_at MySQL datetime string, once persisted.
     */
    public function __construct(
        $id,
        $name,
        $slug,
        $values = array(),
        $created_at = null,
        $updated_at = null
    ) {
        $this->id         = $id;
        $this->name       = $name;
        $this->slug       = $slug;
        $this->values     = $values;
        $this->created_at = $created_at;
        $this->updated_at = $updated_at;
    }
}
