<?php
/**
 * Category class file.
 *
 * @package MooWoodle
 */

namespace MooWoodle\Core;

use MooWoodle\Util;

/**
 * MooWoodle Category class
 *
 * @class       Category class
 * @version     3.3.0
 * @author      DualCube
 */
class Category {

	/**
	 * Retrieve course categories by ID(s).
	 *
	 * Accepts a single ID or an array of IDs. If the input is invalid or empty,
	 * all categories will be returned.
	 *
	 * @param int|int[] $args A single category ID or an array of IDs.
	 * @return array List of course categories as associative arrays.
	 */
	public static function get_course_categories( $args ) {
        global $wpdb;
		$category_ids = array();

		if ( is_numeric( $args ) ) {
			$category_ids = array( (int) $args );
		} elseif ( is_array( $args ) ) {
			$category_ids = array_map( 'intval', $args );
		}

        $table = $wpdb->prefix . Util::TABLES['category'];
		$query = "SELECT * FROM {$table}";
        if ( ! empty( $category_ids ) ) {
            $in     = implode( ',', $category_ids );
            $query .= " WHERE id IN ($in)";
        }
		$categories = $wpdb->get_results( $query, ARRAY_A ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
		return $categories;
    }

	/**
	 * Insert or update a category based on moodle category id.
	 *
	 * @param array $args {
	 *     Array of category data.
	 *
	 *     @type int    $id Required. Moodle category ID.
	 *     @type string $name               Required. Category name.
	 *     @type int    $parent_id          Optional. Parent category ID.
	 * }
	 * @return int|false, number of rows affected on success.
	 */
	public static function update_course_category( $args ) {
		global $wpdb;

		if ( empty( $args['id'] ) ) {
			return false;
		}

		$table = $wpdb->prefix . Util::TABLES['category'];

		$category_record = array(
			'id'        => (int) $args['id'],
			'name'      => sanitize_text_field( $args['name'] ?? '' ),
			'parent_id' => (int) ( $args['parent_id'] ?? 0 ),
		);

		return $wpdb->replace( $table, $category_record ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
	}

	/**
	 * Insert or update multiple course categories in the local table.
	 *
	 * For each category, adds a new row or updates it based on the category ID.
	 * Also increments the course sync count for tracking.
	 *
	 * @param array $categories Each item should include:
	 *   - 'id' (int): Unique category ID (e.g., Moodle category ID).
	 *   - 'name' (string): Category name.
	 *   - 'parent' (int): Optional parent category ID.
	 */
	public static function update_course_categories( $categories ) {
		if ( empty( $categories ) ) {
			return;
		}

		foreach ( $categories as $category ) {
			if ( empty( $category['id'] ) || empty( $category['name'] ) ) {
				continue;
			}

			$args = array(
				'id'        => $category['id'],
				'name'      => $category['name'],
				'parent_id' => $category['parent'] ?? 0,
			);

			self::update_course_category( $args );
			Util::increment_sync_count( 'course' );
		}
	}

	/**
	 * Returns term by Moodle category ID.
	 *
	 * @param int         $category_id Moodle category ID.
	 * @param string|null $taxonomy    Optional. Taxonomy name. Default null.
	 * @return \WP_Term|null Term object on success, or null if not found.
	 */
	public static function get_product_category( $category_id, $taxonomy = '' ) {
		if ( ! $category_id || empty( $taxonomy ) || ! taxonomy_exists( $taxonomy ) ) {
			return null;
		}

		// Get terms using the Moodle category ID.
		$product_category_term = get_terms(
            array(
				'taxonomy'   => $taxonomy,
				'hide_empty' => false,
				'meta_query' => array(
					array(
						'key'     => Util::MOOWOODLE_TERM_META['category_id'],
						'value'   => $category_id,
						'compare' => '=',
					),
				),
            )
        );

		if ( is_wp_error( $product_category_term ) ) {
			return null;
		}

		return $product_category_term[0] ?? null;
	}

	/**
	 * Update a single category. If the category does not exist, create a new category.
	 *
	 * @param array  $category Category data to update or create.
	 * @param string $taxonomy Taxonomy name.
	 * @return int|null Category ID on success, or null on failure.
	 */
	public static function update_product_category( $category, $taxonomy ) {

		$term = self::get_product_category( $category['id'], $taxonomy );
		$slug = sanitize_title( $category['name'] . '-' . $category['id'] );

		// Update the term if it already exists.
		if ( $term ) {
			$term = wp_update_term(
				$term->term_id,
				$taxonomy,
				array(
					'name'        => $category['name'],
					'slug'        => $slug,
					'description' => $category['description'],
				)
			);
		} else {
			// Create the term if it does not exist.
			$term = wp_insert_term(
				$category['name'],
				$taxonomy,
				array(
					'description' => $category['description'],
					'slug'        => $slug,
				)
			);

			if ( ! empty( $term ) && ! is_wp_error( $term ) ) {
				add_term_meta( $term['term_id'], Util::MOOWOODLE_TERM_META['category_id'], $category['id'], true );
            }
		}

		// In success on update or insert sync meta data.
		if ( ! empty( $term ) && ! is_wp_error( $term ) ) {
			update_term_meta( $term['term_id'], Util::MOOWOODLE_TERM_META['parent_id'], $category['parent'] );
			update_term_meta( $term['term_id'], Util::MOOWOODLE_TERM_META['category_path'], $category['path'] );

			return $category['id'];
		}

		if ( is_wp_error( $term ) ) {
			Util::log( 'MooWoodle category sync error: ' . $term->get_error_message() );
		}

		return null;
	}

    /**
	 * Update Moodle course categories in WordPress site.
	 *
	 * @param array  $categories List of categories to update.
	 * @param string $taxonomy   Taxonomy name.
	 * @return void
	 */
	public static function update_product_categories( $categories, $taxonomy ) {
		if ( empty( $taxonomy ) || ! taxonomy_exists( $taxonomy ) || empty( $categories ) ) {
			return;
		}

		$synced_category_ids = array();

		foreach ( $categories as $category ) {
			$category_id = self::update_product_category( $category, $taxonomy );
			if ( ! empty( $category_id ) ) {
				$synced_category_ids[] = $category_id;
			}

			Util::increment_sync_count( 'course' );
		}

		// Remove all term exclude updated ids.
		self::cleanup_unsynced_categories( $synced_category_ids, $taxonomy );
	}

	/**
	 * Remove all categories except the provided IDs.
	 *
	 * @param array  $exclude_ids IDs of categories to exclude from removal.
	 * @param string $taxonomy    Taxonomy name.
	 * @return void
	 */
	private static function cleanup_unsynced_categories( $exclude_ids, $taxonomy ) {
		if ( empty( $taxonomy ) || ! taxonomy_exists( $taxonomy ) ) {
			return;
		}

		$terms = get_terms(
            array(
				'taxonomy'   => $taxonomy,
				'hide_empty' => false,
				'meta_query' => array(
					array(
						'key'     => Util::MOOWOODLE_TERM_META['category_id'],
						'compare' => 'EXISTS',
					),
				),
            )
        );

		if ( empty( $terms ) || is_wp_error( $terms ) ) {
			return;
        }

		// Link with parent or delete term.
		foreach ( $terms as $term ) {
			$category_id = (int) get_term_meta( $term->term_id, Util::MOOWOODLE_TERM_META['category_id'], true );
			if ( ! in_array( $category_id, $exclude_ids, true ) ) {
				// delete term if category is not moodle category.
				wp_delete_term( $term->term_id, $taxonomy );
				continue;
			}

			$parent_category_id = get_term_meta( $term->term_id, Util::MOOWOODLE_TERM_META['parent_id'], true );
			if ( empty( $parent_category_id ) ) {
				continue;
			}

			// get parent term id and continue if not exist.
			$parent_term = self::get_product_category( $parent_category_id, $taxonomy );
			if ( empty( $parent_term ) ) {
				continue;
			}

			wp_update_term( $term->term_id, $taxonomy, array( 'parent' => $parent_term->term_id ) );
		}
	}
}
