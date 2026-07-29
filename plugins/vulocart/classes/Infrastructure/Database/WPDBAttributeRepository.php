<?php
/**
 * WPDBAttributeRepository class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Infrastructure\Database;

use VuloCart\Domain\Attribute\ProductAttribute;
use VuloCart\Domain\Attribute\AttributeRepositoryInterface;
use VuloCart\Domain\Attribute\AttributeValue;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart WPDBAttributeRepository.
 *
 * The only class that runs SQL against `vulocart_attributes`/
 * `vulocart_attribute_values` — implements
 * Domain\Attribute\AttributeRepositoryInterface, bound in
 * VuloCart::init_classes().
 *
 * @class       WPDBAttributeRepository class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class WPDBAttributeRepository implements AttributeRepositoryInterface {

    /**
     * Resolves the fully-prefixed `vulocart_attributes` table name.
     *
     * @return string
     */
    private function get_attributes_table() {
        global $wpdb;
        return $wpdb->prefix . 'vulocart_attributes';
    }

    /**
     * Resolves the fully-prefixed `vulocart_attribute_values` table name.
     *
     * @return string
     */
    private function get_values_table() {
        global $wpdb;
        return $wpdb->prefix . 'vulocart_attribute_values';
    }

    /**
     * Loads every value belonging to an attribute, in insertion order.
     *
     * @param int $attribute_id Owning attribute id.
     * @return AttributeValue[]
     */
    private function load_values( $attribute_id ) {
        global $wpdb;

        $rows = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$this->get_values_table()} WHERE attribute_id = %d ORDER BY id ASC", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                $attribute_id
            ),
            ARRAY_A
        );

        return array_map(
            function ( $row ) {
                return new AttributeValue( (int) $row['id'], (int) $row['attribute_id'], $row['value'], $row['created_at'] );
            },
            $rows ? $rows : array()
        );
    }

    /**
     * Converts a raw `$wpdb` row into a domain ProductAttribute object.
     *
     * @param array<string, mixed> $row A raw `vulocart_attributes` row.
     * @return ProductAttribute
     */
    private function hydrate( $row ) {
        return new ProductAttribute(
            (int) $row['id'],
            $row['name'],
            $row['slug'],
            $this->load_values( (int) $row['id'] ),
            $row['created_at'],
            $row['updated_at']
        );
    }

    /**
     * Finds one attribute by id, with its values loaded.
     *
     * @param int $id ProductAttribute id.
     * @return ProductAttribute|null Null if no attribute with this id exists.
     */
    public function find( int $id ): ?ProductAttribute {
        global $wpdb;

        $row = $wpdb->get_row(
            $wpdb->prepare( "SELECT * FROM {$this->get_attributes_table()} WHERE id = %d", $id ), // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            ARRAY_A
        );

        return $row ? $this->hydrate( $row ) : null;
    }

    /**
     * Finds one attribute by slug.
     *
     * @param string $slug URL/key-safe slug.
     * @return ProductAttribute|null
     */
    public function find_by_slug( string $slug ): ?ProductAttribute {
        global $wpdb;

        $row = $wpdb->get_row(
            $wpdb->prepare( "SELECT * FROM {$this->get_attributes_table()} WHERE slug = %s", $slug ), // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            ARRAY_A
        );

        return $row ? $this->hydrate( $row ) : null;
    }

    /**
     * Returns every attribute, with values loaded.
     *
     * @return ProductAttribute[]
     */
    public function list(): array {
        global $wpdb;

        $rows = $wpdb->get_results( "SELECT * FROM {$this->get_attributes_table()} ORDER BY name ASC", ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- static SQL, no user input.

        return array_map( array( $this, 'hydrate' ), $rows ? $rows : array() );
    }

    /**
     * Persists a new attribute.
     *
     * @param ProductAttribute $attribute An attribute with $id === null.
     * @return ProductAttribute The same attribute, with $id (and timestamps) populated.
     */
    public function insert( ProductAttribute $attribute ): ProductAttribute {
        global $wpdb;

        $wpdb->insert(
            $this->get_attributes_table(),
            array(
                'name' => $attribute->name,
                'slug' => $attribute->slug,
            )
        );

        return $this->find( (int) $wpdb->insert_id );
    }

    /**
     * Persists changes to an existing attribute.
     *
     * @param ProductAttribute $attribute An attribute with a non-null $id.
     * @return ProductAttribute The same attribute, with $updated_at refreshed.
     */
    public function update( ProductAttribute $attribute ): ProductAttribute {
        global $wpdb;

        $wpdb->update(
            $this->get_attributes_table(),
            array(
                'name' => $attribute->name,
                'slug' => $attribute->slug,
            ),
            array( 'id' => $attribute->id )
        );

        return $this->find( $attribute->id );
    }

    /**
     * Deletes an attribute and every one of its values.
     *
     * @param int $id ProductAttribute id.
     * @return bool True if a row was deleted.
     */
    public function delete( int $id ): bool {
        global $wpdb;

        $wpdb->delete( $this->get_values_table(), array( 'attribute_id' => $id ) );

        return (bool) $wpdb->delete( $this->get_attributes_table(), array( 'id' => $id ) );
    }

    /**
     * Persists a new value under an attribute.
     *
     * @param AttributeValue $value A value with $id === null.
     * @return AttributeValue The same value, with $id (and timestamps) populated.
     */
    public function insert_value( AttributeValue $value ): AttributeValue {
        global $wpdb;

        $wpdb->insert(
            $this->get_values_table(),
            array(
                'attribute_id' => $value->attribute_id,
                'value'        => $value->value,
            )
        );

        $row = $wpdb->get_row(
            $wpdb->prepare( "SELECT * FROM {$this->get_values_table()} WHERE id = %d", $wpdb->insert_id ), // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            ARRAY_A
        );

        return new AttributeValue( (int) $row['id'], (int) $row['attribute_id'], $row['value'], $row['created_at'] );
    }

    /**
     * Deletes one attribute value.
     *
     * @param int $value_id Value id.
     * @return bool True if a row was deleted.
     */
    public function delete_value( int $value_id ): bool {
        global $wpdb;

        return (bool) $wpdb->delete( $this->get_values_table(), array( 'id' => $value_id ) );
    }
}
