<?php
/**
 * Taxonomy class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Domain\Term;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Taxonomy class.
 *
 * Categories/Brands/Collections share one table (`vulocart_terms`,
 * discriminated by this `taxonomy` column) and one Domain\Term\Term
 * shape — the same structural relationship WordPress core's own
 * `wp_terms`/`wp_term_taxonomy` tables have to `category`/`post_tag`/a
 * custom taxonomy, not an invented abstraction: all three are "a named
 * group an Offering can belong to", differing only in whether hierarchy
 * (`Term::$parent_id`, categories only) or a logo (`Term::$meta['logo']`,
 * brands only) apply. Attributes are deliberately NOT a fourth taxonomy
 * here — an attribute's values are a first-class sub-entity with their
 * own CRUD (Domain\Attribute\Attribute/AttributeValue), not a flat
 * name/slug/description record.
 *
 * @class       Taxonomy class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Taxonomy {

    /**
     * A hierarchical grouping (supports `Term::$parent_id`).
     *
     * @var string
     */
    const CATEGORY = 'category';

    /**
     * The manufacturer/brand a physical or digital offering comes from.
     *
     * @var string
     */
    const BRAND = 'brand';

    /**
     * A manually-curated group of offerings (e.g. "Summer Sale",
     * "Staff Picks") — flat, not hierarchical.
     *
     * @var string
     */
    const COLLECTION = 'collection';

    /**
     * Every known taxonomy.
     *
     * @return string[]
     */
    public static function all(): array {
        return array(
            self::CATEGORY,
            self::BRAND,
            self::COLLECTION,
        );
    }
}
