<?php
/**
 * Term class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Domain\Term;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Term entity.
 *
 * Plain domain object — same shape/rules as Domain\Offering\Offering. Backs
 * Categories/Brands/Collections (Taxonomy's own docblock explains why
 * one shape covers all three). `$parent_id` is only meaningful for
 * `Taxonomy::CATEGORY` (a brand/collection is always flat); `$meta` is
 * where taxonomy-specific extras live (e.g. a brand's logo media item),
 * same extensible-JSON-bag pattern `Offering::$meta` already uses, rather
 * than adding columns only one taxonomy would ever populate.
 *
 * @class       Term class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Term {

    /**
     * Term id.
     *
     * @var int|null Null for a term not yet persisted.
     */
    public $id;

    /**
     * One of Taxonomy's constants.
     *
     * @var string
     */
    public $taxonomy;

    /**
     * Display name.
     *
     * @var string
     */
    public $name;

    /**
     * URL-safe slug, unique within its taxonomy (not globally).
     *
     * @var string
     */
    public $slug;

    /**
     * Parent term id — `Taxonomy::CATEGORY` only; null for a top-level
     * category or any brand/collection.
     *
     * @var int|null
     */
    public $parent_id;

    /**
     * Description.
     *
     * @var string|null
     */
    public $description;

    /**
     * Taxonomy-specific extras (e.g. a brand's logo media item).
     *
     * @var array<string, mixed>
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
     * Term constructor.
     *
     * @param int|null             $id          Null for a term not yet persisted.
     * @param string               $taxonomy    One of Taxonomy's constants.
     * @param string               $name        Display name.
     * @param string               $slug        URL-safe slug, unique within its taxonomy.
     * @param int|null             $parent_id   Parent term id — `Taxonomy::CATEGORY` only.
     * @param string|null          $description Description.
     * @param array<string, mixed> $meta        Taxonomy-specific extras.
     * @param string|null          $created_at  MySQL datetime string, once persisted.
     * @param string|null          $updated_at  MySQL datetime string, once persisted.
     */
    public function __construct(
        $id,
        $taxonomy,
        $name,
        $slug,
        $parent_id = null,
        $description = null,
        $meta = array(),
        $created_at = null,
        $updated_at = null
    ) {
        $this->id          = $id;
        $this->taxonomy    = $taxonomy;
        $this->name        = $name;
        $this->slug        = $slug;
        $this->parent_id   = $parent_id;
        $this->description = $description;
        $this->meta        = $meta;
        $this->created_at  = $created_at;
        $this->updated_at  = $updated_at;
    }
}
