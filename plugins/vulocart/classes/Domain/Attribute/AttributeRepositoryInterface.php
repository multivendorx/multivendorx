<?php
/**
 * AttributeRepositoryInterface class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Domain\Attribute;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart AttributeRepositoryInterface.
 *
 * The contract Application\AttributeService depends on.
 *
 * @class       AttributeRepositoryInterface interface
 * @version     1.0.0
 * @author      MultiVendorX
 */
interface AttributeRepositoryInterface {

    /**
     * Finds one attribute by id, with its values loaded.
     *
     * @param int $id ProductAttribute id.
     * @return ProductAttribute|null Null if no attribute with this id exists.
     */
    public function find( int $id ): ?ProductAttribute;

    /**
     * Finds one attribute by slug.
     *
     * @param string $slug URL/key-safe slug.
     * @return ProductAttribute|null
     */
    public function find_by_slug( string $slug ): ?ProductAttribute;

    /**
     * Returns every attribute, with values loaded.
     *
     * @return ProductAttribute[]
     */
    public function list(): array;

    /**
     * Persists a new attribute (without values — see insert_value()).
     *
     * @param ProductAttribute $attribute An attribute with $id === null.
     * @return ProductAttribute The same attribute, with $id (and timestamps) populated.
     */
    public function insert( ProductAttribute $attribute ): ProductAttribute;

    /**
     * Persists changes to an existing attribute.
     *
     * @param ProductAttribute $attribute An attribute with a non-null $id.
     * @return ProductAttribute The same attribute, with $updated_at refreshed.
     */
    public function update( ProductAttribute $attribute ): ProductAttribute;

    /**
     * Deletes an attribute and every one of its values.
     *
     * @param int $id ProductAttribute id.
     * @return bool True if a row was deleted.
     */
    public function delete( int $id ): bool;

    /**
     * Persists a new value under an attribute.
     *
     * @param AttributeValue $value A value with $id === null.
     * @return AttributeValue The same value, with $id (and timestamps) populated.
     */
    public function insert_value( AttributeValue $value ): AttributeValue;

    /**
     * Deletes one attribute value.
     *
     * @param int $value_id Value id.
     * @return bool True if a row was deleted.
     */
    public function delete_value( int $value_id ): bool;
}
