<?php
/**
 * Product class file.
 *
 * @package MooWoodle
 */

namespace MooWoodle\Core;

use MooWoodle\Util;

/**
 * MooWoodle Product class
 *
 * @class       Product class
 * @version     3.3.0
 * @author      DualCube
 */
class Product {
    /**
     * Product class constructor function.
     */
    public function __construct() {
		// Course meta save with WooCommerce product save.
		add_action( 'woocommerce_process_product_meta', array( $this, 'save_product_meta_data' ) );

		// Support for woocommerce product custom metadata query.
		add_filter( 'woocommerce_product_data_store_cpt_get_products_query', array( $this, 'modify_custom_meta_query' ), 10, 2 );

		add_action( 'moowoodle_clean_course_previous_link', array( $this, 'clean_course_previous_link' ), 10, 1 );

		add_action( 'wp_trash_post', array( $this, 'handle_woocommerce_product_trash' ), 10, 1 );

		add_action( 'untrash_post', array( $this, 'handle_woocommerce_product_restore' ), 10, 1 );
    }

	/**
	 * Retrieves a WooCommerce product associated with a Moodle course ID.
	 *
	 * @param int|string $moodle_course_id The Moodle course ID.
	 * @return \WC_Product|null The associated product, or null if no product is found.
	 */
	public static function get_product_from_moodle_course( $moodle_course_id ) {

		// Query products with matching moodle_course_id.
		$products = wc_get_products(
            array(
				'meta_query' => array(
					array(
						'key'     => Util::MOOWOODLE_PRODUCT_META['moodle_course_id'],
						'value'   => $moodle_course_id,
						'compare' => '=',
					),
				),
				'limit'      => 1,
            )
        );

		// Return the first product or null.
		return ! empty( $products ) ? reset( $products ) : null;
	}

	/**
	 * Create or update a WooCommerce product from a Moodle course.
	 *
	 * @param array $course        Moodle course data.
	 * @param bool  $force_create  Create product if not exists.
	 * @param bool  $force_update  Force update if product exists.
	 * @return int WooCommerce product ID or 0 on failure.
	 */
	public static function update_product( $course, $force_create = true, $force_update = false ) {
		if ( empty( $course ) || empty( $course['format'] ) || 'site' === $course['format'] ) {
			return 0;
		}

		$product = self::get_product_from_moodle_course( $course['id'] );

		if ( ! $product ) {
			if ( ! $force_create ) {
				return 0;
			}

			$product = new \WC_Product_Simple();
		} elseif ( ! $force_update ) {
			return $product->get_id();
		}

        // get category term.
        $term = MooWoodle()->category->get_product_category( $course['categoryid'], 'product_cat' );

        // Set product properties.
		$product->set_name( sanitize_text_field( $course['fullname'] ?? '' ) );
		$product->set_slug( sanitize_title( $course['shortname'] ?? '' ) );
		$product->set_description( wp_kses_post( $course['summary'] ?? '' ) );
        $product->set_status( 'publish' );
		if ( $term && ! is_wp_error( $term ) ) {
			$product->set_category_ids( array( $term->term_id ) );
		}
        $product->set_virtual( true );
        $product->set_catalog_visibility( ! empty( $course['visible'] ) ? 'visible' : 'hidden' );

		// Set product's sku.
		try {
			$product->set_sku( $course['idnumber'] );
		} catch ( \Exception $error ) {
			Util::log( sprintf( 'Unable to set SKU for product #%d: %s', $product->get_id(), $error->getMessage() ) );
		}

		// get the course id linked with moodle.
        $wp_course = MooWoodle()->course->get_courses(
            array(
				'moodle_course_id' => $course['id'],
            )
        );

		$wp_course = ! empty( $wp_course ) ? reset( $wp_course ) : array();

		$meta_data = array(
			Util::MOOWOODLE_PRODUCT_META['course_startdate'] => $course['startdate'],
			Util::MOOWOODLE_PRODUCT_META['course_enddate'] => $course['enddate'],
			Util::MOOWOODLE_PRODUCT_META['moodle_course_id'] => $course['id'],
			Util::MOOWOODLE_PRODUCT_META['wordpress_course_id'] => $wp_course['id'],
		);

        // Set product meta data.
		foreach ( $meta_data as $key => $value ) {
			$product->update_meta_data( $key, $value );
		}

        $product->save();

		MooWoodle()->course->update_course(
			array(
				'moodle_course_id' => $course['id'],
				'product_id'       => $product->get_id(),
			)
		);
		return $product->get_id();
	}

    /**
     * Update All product
     *
     * @param mixed $courses all courses.
     * @return void
     */
	public static function update_products( $courses ) {
		$updated_ids = array();

		// Manage setting of product sync option.
		$product_sync_setting = MooWoodle()->setting->get_setting( 'product_sync_option', array() );

		$create_product = in_array( 'create', $product_sync_setting, true );
		$update_product = in_array( 'update', $product_sync_setting, true );

		// None of the options are chosen.
		if ( ! $create_product && ! $update_product ) {
			return;
		}

		// Update all products.
		Util::set_sync_status(
            array(
				'action' => __( 'Update Product', 'moowoodle' ),
				'total'  => max( 0, count( $courses ) - 1 ),
            ),
            'course'
        );

		foreach ( $courses as $course ) {

			// Do nothing when the course is a site course.
			if ( 'site' === $course['format'] ) {
				continue;
			}

			$product_id = self::update_product( $course, $create_product, $update_product );

			if ( $product_id ) {
				$updated_ids[] = $product_id;
			}

			Util::increment_sync_count( 'course' );
		}

		if ( ! empty( $updated_ids ) ) {
			self::draft_missing_products( $updated_ids );
		}
	}

	/**
	 * Link course to a WooCommerce product (Free version).
	 *
	 * @param int $product_id id of product.
	 * @return void
	 */
	public function save_product_meta_data( $product_id ) {
		// Verify nonce.
		$nonce = filter_input( INPUT_POST, 'product_meta_nonce' );
		if ( ! $nonce || ! wp_verify_nonce( $nonce, 'product_meta_nonce' ) ) {
			return;
		}

		$link_type    = sanitize_text_field( filter_input( INPUT_POST, 'link_type', FILTER_SANITIZE_FULL_SPECIAL_CHARS ) ?? '' );
		$link_item_id = filter_input( INPUT_POST, 'linked_item_id', FILTER_VALIDATE_INT );
		// Only process if it's a course link.
		if ( 'course' === $link_type ) {
			do_action( 'moowoodle_clean_cohort_previous_link', $product_id );

			if ( 0 === $link_item_id ) {
				$this->clean_course_previous_link( $product_id );
				return;
			}

			$prev_course_id = absint( get_post_meta( $product_id, Util::MOOWOODLE_PRODUCT_META['wordpress_course_id'], true ) );
			if ( $prev_course_id === $link_item_id ) {
				return;
			}

			$course = MooWoodle()->course->get_courses(
				array(
					'id' => $link_item_id,
				)
			);

			$course = ! empty( $course ) ? reset( $course ) : array();

			if ( empty( $course['moodle_course_id'] ) ) {
				return;
			}

			update_post_meta( $product_id, Util::MOOWOODLE_PRODUCT_META['wordpress_course_id'], $link_item_id );
			update_post_meta( $product_id, Util::MOOWOODLE_PRODUCT_META['moodle_course_id'], (int) $course['moodle_course_id'] );

			MooWoodle()->course->update_course(
				array(
					'moodle_course_id' => $course['moodle_course_id'],
					'product_id'       => $product_id,
				)
			);
		}
	}

	/**
	 * Unlinks the course from the given WooCommerce product.
	 *
	 * - Deletes the wordpress_course_id and moodle_course_id post meta.
	 * - Updates the course table to detach the product.
	 *
	 * @param int $product_id The ID of the WooCommerce product.
	 * @return void
	 */
	public function clean_course_previous_link( $product_id ) {
		delete_post_meta( $product_id, Util::MOOWOODLE_PRODUCT_META['wordpress_course_id'] );

		$moodle_course_id = absint( get_post_meta( $product_id, Util::MOOWOODLE_PRODUCT_META['moodle_course_id'], true ) );

		if ( ! empty( $moodle_course_id ) ) {
			MooWoodle()->course->update_course(
				array(
					'moodle_course_id' => $moodle_course_id,
					'product_id'       => 0,
				)
			);
		}

		delete_post_meta( $product_id, Util::MOOWOODLE_PRODUCT_META['moodle_course_id'] );
	}

	/**
	 * Custom metadata query support for WooCommerce product.
	 *
	 * @param mixed $wp_query_args   The arguments passed to WP_Query.
	 * @param mixed $query_vars      Query variables including meta_query.
	 * @return mixed Modified WP_Query arguments.
	 */
	public function modify_custom_meta_query( $wp_query_args, $query_vars ) {
		if ( ! empty( $query_vars['meta_query'] ) ) {
			$wp_query_args['meta_query'] = array_merge( $wp_query_args['meta_query'] ?? array(), $query_vars['meta_query'] );
		}

		return $wp_query_args;
	}

	/**
	 * Unlinks the Moodle course when a WooCommerce product is trashed.
	 *
	 * This sets the associated `product_id` in the Moodle course table to 0,
	 * effectively removing the product-course relationship.
	 *
	 * @param int $product_id The ID of the trashed product.
	 */
	public function handle_woocommerce_product_trash( $product_id ) {
		if ( get_post_type( $product_id ) !== 'product' ) {
			return;
		}

		$moodle_course_id = get_post_meta( $product_id, Util::MOOWOODLE_PRODUCT_META['moodle_course_id'], true );

		if ( ! empty( $moodle_course_id ) ) {
			MooWoodle()->course->update_course(
				array(
					'moodle_course_id' => $moodle_course_id,
					'product_id'       => 0,
				)
			);
		}
	}

	/**
	 * Relinks a Moodle course when a WooCommerce product is restored from trash.
	 *
	 * If the product has a linked Moodle course, it reassigns the current product ID
	 * to the course record, restoring the relationship.
	 *
	 * @param int $product_id The ID of the restored product.
	 */
	public function handle_woocommerce_product_restore( $product_id ) {
		if ( get_post_type( $product_id ) !== 'product' ) {
			return;
		}

		$moodle_course_id = get_post_meta( $product_id, Util::MOOWOODLE_PRODUCT_META['moodle_course_id'], true );

		if ( ! empty( $moodle_course_id ) ) {
			MooWoodle()->course->update_course(
				array(
					'moodle_course_id' => $moodle_course_id,
					'product_id'       => $product_id,
				)
			);
		}
	}

	/**
	 * Delete all the product which id is not present in $exclude_ids array.
     *
	 * @param array $exclude_ids product ids.
	 * @return void
	 */
	public static function draft_missing_products( $exclude_ids ) {
        // get all product except $exclude_ids array.
		$product_ids = \wc_get_products(
            array(
				'exclude'    => $exclude_ids,
				'status'     => 'publish',
				'return'     => 'ids',
				'meta_query' => array(
					array(
						'key'     => Util::MOOWOODLE_PRODUCT_META['wordpress_course_id'],
						'compare' => 'EXISTS',
					),
				),
            )
        );

		// delete product.
		foreach ( $product_ids as $product_id ) {
			wp_update_post(
				array(
					'ID'          => $product_id,
					'post_status' => 'draft',
				)
			);
		}
	}
}
