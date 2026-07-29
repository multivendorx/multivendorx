<?php
/**
 * AttributeValue class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Domain\Attribute;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart AttributeValue entity.
 *
 * One value belonging to an Attribute (e.g. "Red" under "Color").
 *
 * @class       AttributeValue class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class AttributeValue {

    /**
     * Value id.
     *
     * @var int|null Null for a value not yet persisted.
     */
    public $id;

    /**
     * Owning attribute id.
     *
     * @var int
     */
    public $attribute_id;

    /**
     * The value itself, e.g. "Red".
     *
     * @var string
     */
    public $value;

    /**
     * Creation timestamp.
     *
     * @var string|null MySQL datetime string, once persisted.
     */
    public $created_at;

    /**
     * AttributeValue constructor.
     *
     * @param int|null    $id           Null for a value not yet persisted.
     * @param int         $attribute_id Owning attribute id.
     * @param string      $value        The value itself, e.g. "Red".
     * @param string|null $created_at   MySQL datetime string, once persisted.
     */
    public function __construct( $id, $attribute_id, $value, $created_at = null ) {
        $this->id           = $id;
        $this->attribute_id = $attribute_id;
        $this->value        = $value;
        $this->created_at   = $created_at;
    }
}
