<?php
/**
 * AttributeService class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Application;

use VuloCart\Domain\Attribute\ProductAttribute;
use VuloCart\Domain\Attribute\AttributeRepositoryInterface;
use VuloCart\Domain\Attribute\AttributeValue;
use VuloCart\Events\EventDispatcher;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart AttributeService.
 *
 * Where ProductAttribute business logic lives — backs
 * `classes/RestAPI/Controllers/Attributes.php`.
 *
 * @class       AttributeService class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class AttributeService {

    /**
     * The bound repository implementation.
     *
     * @var AttributeRepositoryInterface Resolved via ServiceContainer, not `new`d directly.
     */
    private $repository;

    /**
     * Broadcasts what happened after each mutation.
     *
     * @var EventDispatcher
     */
    private $events;

    /**
     * AttributeService constructor.
     *
     * @param AttributeRepositoryInterface $repository Resolved via ServiceContainer, not `new`d directly.
     * @param EventDispatcher              $events     Broadcasts what happened; never decides what should happen.
     */
    public function __construct( AttributeRepositoryInterface $repository, EventDispatcher $events ) {
        $this->repository = $repository;
        $this->events     = $events;
    }

    /**
     * Fetches one attribute by id, with its values loaded.
     *
     * @param int $id ProductAttribute id.
     * @return ProductAttribute|null
     */
    public function get_attribute( $id ) {
        return $this->repository->find( $id );
    }

    /**
     * Lists every attribute, with values loaded.
     *
     * @return ProductAttribute[]
     */
    public function list_attributes(): array {
        return $this->repository->list();
    }

    /**
     * Creates a new attribute and broadcasts `attribute_created`. Slug is
     * derived from name unless one was explicitly given, de-duplicated
     * the same way TermService::create_term() de-duplicates a term slug.
     *
     * @param array{name: string, slug?: string} $data Already-sanitized input.
     * @return ProductAttribute
     */
    public function create_attribute( array $data ): ProductAttribute {
        $slug = $this->unique_slug( ! empty( $data['slug'] ) ? $data['slug'] : sanitize_title( $data['name'] ) );

        $attribute = new ProductAttribute( null, $data['name'], $slug );
        $attribute = $this->repository->insert( $attribute );

        $this->events->dispatch( 'attribute_created', array( 'attribute' => $attribute ) );

        return $attribute;
    }

    /**
     * Updates an existing attribute and broadcasts `attribute_updated`.
     *
     * @param int                                 $id   ProductAttribute id.
     * @param array{name?: string, slug?: string} $data Already-sanitized partial update.
     * @return ProductAttribute|null Null if no attribute with this id exists.
     */
    public function update_attribute( $id, array $data ) {
        $attribute = $this->repository->find( $id );

        if ( ! $attribute ) {
            return null;
        }

        if ( isset( $data['slug'] ) && $data['slug'] !== $attribute->slug ) {
            $data['slug'] = $this->unique_slug( $data['slug'], $id );
        }

        $attribute->name = isset( $data['name'] ) ? $data['name'] : $attribute->name;
        $attribute->slug = isset( $data['slug'] ) ? $data['slug'] : $attribute->slug;

        $attribute = $this->repository->update( $attribute );

        $this->events->dispatch( 'attribute_updated', array( 'attribute' => $attribute ) );

        return $attribute;
    }

    /**
     * Deletes an attribute (and every one of its values) and broadcasts
     * `attribute_deleted`.
     *
     * @param int $id ProductAttribute id.
     * @return bool True if an attribute was found and deleted.
     */
    public function delete_attribute( $id ): bool {
        $attribute = $this->repository->find( $id );

        if ( ! $attribute ) {
            return false;
        }

        $deleted = $this->repository->delete( $id );

        if ( $deleted ) {
            $this->events->dispatch( 'attribute_deleted', array( 'attribute' => $attribute ) );
        }

        return $deleted;
    }

    /**
     * Adds a new value to an attribute.
     *
     * @param int    $attribute_id Owning attribute id.
     * @param string $value        The value itself, e.g. "Red".
     * @return AttributeValue|null Null if no attribute with this id exists.
     */
    public function add_value( $attribute_id, string $value ) {
        if ( ! $this->repository->find( $attribute_id ) ) {
            return null;
        }

        return $this->repository->insert_value( new AttributeValue( null, $attribute_id, $value ) );
    }

    /**
     * Removes a value from an attribute.
     *
     * @param int $value_id Value id.
     * @return bool True if a value was found and deleted.
     */
    public function delete_value( $value_id ): bool {
        return $this->repository->delete_value( $value_id );
    }

    /**
     * Appends `-2`/`-3`/etc to $slug until it's unique.
     *
     * @param string   $slug       Candidate slug.
     * @param int|null $exclude_id ProductAttribute id to exclude from the collision check.
     * @return string
     */
    private function unique_slug( string $slug, $exclude_id = null ): string {
        $candidate = $slug;
        $suffix    = 2;

        while ( true ) {
            $existing = $this->repository->find_by_slug( $candidate );

            if ( ! $existing || $existing->id === $exclude_id ) {
                return $candidate;
            }

            $candidate = $slug . '-' . $suffix;
            ++$suffix;
        }
    }
}
