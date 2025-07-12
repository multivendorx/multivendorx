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
 * @version     PRODUCT_VERSION
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
	public static function get_course_category_information( $args ) {
        global $wpdb;
        // Normalize input to an array.
        if ( is_int( $args ) ) {
            $args = array( $args );
        } elseif ( ! is_array( $args ) ) {
			$args = array();
		}

        $table = $wpdb->prefix . Util::TABLES['category'];
        $where = "SELECT * FROM $table";
        if ( ! empty( $args ) ) {
            $in     = implode( ',', array_map( 'intval', $args ) );
            $where .= " WHERE id IN ($in)";
        }
		$results = $wpdb->get_results( $where, ARRAY_A ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
		return $results ?? array();
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
	 * @return bool|int False on failure, number of rows affected on success.
	 */
	public static function update_course_category_information( $args ) {
        global $wpdb;

        if ( empty( $args['id'] ) ) {
            return false;
        }

        $table             = $wpdb->prefix . Util::TABLES['category'];
        $existing_category = self::get_course_category_information( $args['id'] );

		if ( ! empty( $existing_category ) ) {
            return $wpdb->update( $table, $args, array( 'id' => (int) $args['id'] ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        }

        return $wpdb->insert( $table, $args ); //phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
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
	public static function update_course_categories_information( $categories ) {
		foreach ( $categories as $category ) {
			$args = array(
				'id'        => (int) $category['id'],
				'name'      => trim( sanitize_text_field( $category['name'] ) ),
				'parent_id' => (int) ( $category['parent'] ),
			);

			self::update_course_category_information( $args );

			\MooWoodle\Util::increment_sync_count( 'course' );
		}
	}

	/**
	 * Returns term by Moodle category ID.
	 *
	 * @param int         $category_id Moodle category ID.
	 * @param string|null $taxonomy    Optional. Taxonomy name. Default null.
	 * @return object|null Term object on success, or null if not found.
	 */
	public static function get_product_category_information( $category_id, $taxonomy = '' ) {
		if ( ! $category_id || empty( $taxonomy ) || ! taxonomy_exists( $taxonomy ) ) {
			return null;
		}

		// Get the trermes basesd on moodle category id.
		$terms = get_terms(
            array(
				'taxonomy'   => $taxonomy,
				'hide_empty' => false,
				'meta_query' => array(
					array(
						'key'     => '_category_id',
						'value'   => $category_id,
						'compare' => '=',
					),
				),
            )
        );

		// Check no category found.
		if ( empty( $terms ) && is_wp_error( $terms ) ) {
			return null;
		}

		return $terms[0];
	}

	/**
	 * Update a single category. If the category does not exist, create a new category.
	 *
	 * @param array  $category Category data to update or create.
	 * @param string $taxonomy Taxonomy name.
	 * @return int|null Category ID on success, or null on failure.
	 */
	public static function update_product_category_information( $category, $taxonomy ) {

		$term = self::get_product_category_information( $category['id'], $taxonomy );

		// If term is exist update it.
		if ( $term ) {
			$term = wp_update_term(
				$term->term_id,
				$taxonomy,
				array(
					'name'        => $category['name'],
					'slug'        => "{$category['name']} {$category['id']}",
					'description' => $category['description'],
				)
			);
		} else {
			// term not exist create it.
			$term = wp_insert_term(
				$category['name'],
				$taxonomy,
				array(
					'description' => $category['description'],
					'slug'        => "{$category['name']} {$category['id']}",
				)
			);

			if ( ! empty( $term ) && ! is_wp_error( $term ) ) {
				add_term_meta( $term['term_id'], '_category_id', $category['id'], false );
            }
		}

		// In success on update or insert sync meta data.
		if ( ! empty( $term ) && ! is_wp_error( $term ) ) {
			update_term_meta( $term['term_id'], '_parent', $category['parent'], '' );
			update_term_meta( $term['term_id'], '_category_path', $category['path'], false );

			return $category['id'];
		} else {
			MooWoodle()->util->log( 'moowoodle url:' . $term->get_error_message() . "\n" );
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
	public static function update_product_categories_information( $categories, $taxonomy ) {
		if ( empty( $taxonomy ) || ! taxonomy_exists( $taxonomy ) ) {
			return;
		}

		$updated_ids = array();

		if ( $categories ) {
			foreach ( $categories as $category ) {
				// Update category.
				$categorie_id = self::update_product_category_information( $category, $taxonomy );

				// Store updated category id.
				if ( $categorie_id ) {
					$updated_ids[] = $categorie_id;
				}

				\MooWoodle\Util::increment_sync_count( 'course' );
			}
		}

		// Remove all term exclude updated ids.
		self::remove_exclude_ids( $updated_ids, $taxonomy );
	}

	/**
	 * Remove all categories except the provided IDs.
	 *
	 * @param array  $exclude_ids IDs of categories to exclude from removal.
	 * @param string $taxonomy    Taxonomy name.
	 * @return void
	 */
	private static function remove_exclude_ids( $exclude_ids, $taxonomy ) {

		$terms = get_terms(
            array(
				'taxonomy'   => $taxonomy,
				'hide_empty' => false,
				'meta_query' => array(
					array(
						'key'     => '_category_id',
						'compare' => 'EXISTS',
					),
				),
            )
        );

		if ( empty( $term ) && is_wp_error( $terms ) ) {
			return;
        }

		// Link with parent or delete term.
		foreach ( $terms as $term ) {
			$category_id = get_term_meta( $term->term_id, '_category_id', true );

			if ( in_array( $category_id, $exclude_ids, true ) ) {
				$parent_category_id = get_term_meta( $term->term_id, '_parent', true );

				// get parent term id and continue if not exist.
				$parent_term = self::get_product_category_information( $parent_category_id, $taxonomy );
				if ( empty( $parent_term ) ) {
					continue;
                }

				// sync parent term with term.
				wp_update_term( $term->term_id, $taxonomy, array( 'parent' => $parent_term->term_id ) );
			} else {
				// delete term if category is not moodle category.
				wp_delete_term( $term->term_id, $taxonomy );
			}
		}
	}
}
