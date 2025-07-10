<?php
/**
 * Product class file.
 *
 * @package MooWoodle
 */

namespace MooWoodle\Core;

/**
 * MooWoodle Product class
 *
 * @class       Product class
 * @version     PRODUCT_VERSION
 * @author      DualCube
 */
class Product {
    /**
     * Product class constructor function.
     */
    public function __construct() {
        // Add subcription product notice.
		add_filter( 'woocommerce_product_class', array( &$this, 'product_type_warning' ), 10 );

		// Course meta save with WooCommerce product save.
		add_action( 'woocommerce_process_product_meta', array( &$this, 'save_product_meta_data' ) );

		// Support for woocommerce product custom metadata query.
		add_filter( 'woocommerce_product_data_store_cpt_get_products_query', array( &$this, 'handling_custom_meta_query_keys' ), 10, 2 );

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
						'key'     => 'moodle_course_id',
						'value'   => $moodle_course_id,
						'compare' => '=',
					),
				),
				'limit'      => 1,
            )
        );

		// Return the first product or null.
		return reset( $products ) ? reset( $products ) : null;
	}

    /**
	 * Update moodle product data in WordPress WooCommerce.
	 * If product not exist create new product.
     *
	 * @param array $course moodle course data.
	 * @param bool  $force_create create or not.
	 * @return int course id
	 */
	public static function update_product( $course, $force_create = true, $force_update = false ) {
		if ( empty( $course ) || $course['format'] === 'site' ) {
			return 0;
		}

		$product = self::get_product_from_moodle_course( $course['id'] );

		if ( ! $product && $force_create ) {
			// Create a new product if it doesn't exist and creation is allowed
			$product = new \WC_Product_Simple();
		} elseif ( $product && ! $force_update && $force_create ) {
			// If product exists, but updates are not allowed, return existing ID
			return $product->get_id();
		}
	// public static function update_product( $course, $force_create = true ) {

	// 	if ( empty( $course ) || 'site' === $course['format'] ) {
	// 		return 0;
    //     }

	// 	$product = self::get_product_from_moodle_course( $course['id'] );

	// 	// Manage setting of product sync option.
	// 	$product_sync_setting = MooWoodle()->setting->get_setting( 'product_sync_option', array() );

	// 	$update_product = in_array( 'update', $product_sync_setting, true );

	// 	// create a new product if not exist.
    //     if ( ! $product && $force_create ) {
	// 		$product = new \WC_Product_Simple();
    //     } elseif ( isset( $product ) && ! $update_product && $force_create ) {
	// 		return $product->get_id();
	// 	}

		// Product is not exist.
		if ( ! $product ) {
			return 0;
		}

        // get category term.
        $term = MooWoodle()->category->get_product_category_information( $course['categoryid'], 'product_cat' );

        // Set product properties.
        $product->set_name( $course['fullname'] );
        $product->set_slug( $course['shortname'] );
        $product->set_description( $course['summary'] );
        $product->set_status( 'publish' );
        $product->set_category_ids( array( $term->term_id ) );
        $product->set_virtual( true );
        $product->set_catalog_visibility( $course['visible'] ? 'visible' : 'hidden' );

		// Set product's sku.
		try {
			$product->set_sku( $course['idnumber'] );
		} catch ( \Exception $error ) {
			\MooWoodle\Util::log( "Unable to set product's( id=" . $product->get_id() . ') SQU.' );
		}

		// get the course id linked with moodle.
        $wp_course = MooWoodle()->course->get_course_information(
            array(
				'moodle_course_id' => $course['id'],
            )
        );

		$wp_course = reset( $wp_course );

        // Set product meta data.
        $product->update_meta_data( '_course_startdate', $course['startdate'] );
        $product->update_meta_data( '_course_enddate', $course['enddate'] );
        $product->update_meta_data( 'moodle_course_id', $course['id'] );
        $product->update_meta_data( 'linked_course_id', $wp_course['id'] );
		$product->set_status( 'publish' );
		$product->save();

		MooWoodle()->course->update_course_information(
            array(
				'moodle_course_id' => (int) $course['id'],
				'product_id'       => (int) $product->get_id(),
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
		\MooWoodle\Util::set_sync_status(
            array(
				'action'  => __( 'Update Product', 'moowoodle' ),
				'total'   => count( $courses ) - 1,
				'current' => 0,
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

			\MooWoodle\Util::increment_sync_count( 'course' );
		}

		self::remove_exclude_ids( $updated_ids );
	}

	/**
	 * Adds an admin notice if certain WooCommerce extensions are active without MooWoodle Pro.
	 *
	 * @param array $classnames The product type classnames.
	 * @return array Modified classnames.
	 */
	public function product_type_warning( $classnames ) {
		// Get all active plugins.
		$active_plugins = get_option( 'active_plugins', array() );
		if ( is_multisite() ) {
			$active_plugins = array_merge( $active_plugins, get_site_option( 'active_sitewide_plugins', array() ) );
		}

		if (
			in_array( 'woocommerce-subscriptions/woocommerce-subscriptions.php', $active_plugins, true )
			|| array_key_exists( 'woocommerce-product/woocommerce-subscriptions.php', $active_plugins )
			|| in_array( 'woocommerce-product-bundles/woocommerce-product-bundles.php', $active_plugins, true )
			|| array_key_exists( 'woocommerce-product-bundles/woocommerce-product-bundles.php', $active_plugins )
		) {
			add_action(
				'admin_notices',
				function () {
					if ( MooWoodle()->util->is_khali_dabba() ) {
						echo '<div class="notice notice-warning is-dismissible"><p>' .
							esc_html__( 'WooCommerce Subscription and WooCommerce Product Bundles is supported only with ', 'moowoodle' ) .
							'<a href="' . esc_url( MOOWOODLE_PRO_SHOP_URL ) . '">' .
							esc_html__( 'MooWoodle Pro', 'moowoodle' ) .
							'</a></p></div>';
					}
				}
			);
		}

		return $classnames;
	}

	/**
	 * Link course to a WooCommerce product (Free version).
	 *
	 * @param int $product_id id of product.
	 * @return int
	 */
	public function save_product_meta_data( $product_id ) {
		// Verify nonce.
		$nonce = filter_input( INPUT_POST, 'product_meta_nonce' );
		if ( ! $nonce || ! wp_verify_nonce( $nonce ) ) {
			return $product_id;
		}

		$link_type    = sanitize_text_field( filter_input( INPUT_POST, 'link_type', FILTER_SANITIZE_FULL_SPECIAL_CHARS ) ?? '' );
		$link_item_id = absint( filter_input( INPUT_POST, 'linked_item_id' ) );
		// Only process if it's a course link.
		if ( 'course' === $link_type ) {
			do_action( 'moowoodle_clean_cohort_previous_link', $product_id );

			if ( 0 === $link_item_id ) {
				$this->clean_course_previous_link( $product_id );
				return;
			}

			$prev_course_id = absint( get_post_meta( $product_id, 'linked_course_id', true ) );
			if ( $prev_course_id === $link_item_id ) {
				return $product_id;
			}

			$course = reset( MooWoodle()->course->get_course_information( array( 'id' => $link_item_id ) ) );

			if ( empty( $course['moodle_course_id'] ) ) {
				return;
			}

			update_post_meta( $product_id, 'linked_course_id', $link_item_id );
			update_post_meta( $product_id, 'moodle_course_id', (int) $course['moodle_course_id'] );

			MooWoodle()->course->update_course_information(
				array(
					'moodle_course_id' => (int) $course['moodle_course_id'],
					'product_id'       => (int) $product_id,
				)
			);
		}

		return $product_id;
	}

	/**
	 * Unlinks the course from the given WooCommerce product.
	 *
	 * - Deletes the linked_course_id and moodle_course_id post meta.
	 * - Updates the course table to detach the product.
	 *
	 * @param int $product_id The ID of the WooCommerce product.
	 * @return void
	 */
	public function clean_course_previous_link( $product_id ) {
		delete_post_meta( $product_id, 'linked_course_id' );

		$moodle_course_id = absint( get_post_meta( $product_id, 'moodle_course_id', true ) );

		if ( ! empty( $moodle_course_id ) ) {
			MooWoodle()->course->update_course_information(
				array(
					'moodle_course_id' => (int) $moodle_course_id,
					'product_id'       => 0,
				)
			);
		}

		delete_post_meta( $product_id, 'moodle_course_id' );
	}

	/**
	 * Custom metadata query support for WooCommerce product.
	 *
	 * @param mixed $wp_query_args   The arguments passed to WP_Query.
	 * @param mixed $query_vars      Query variables including meta_query.
	 * @return mixed Modified WP_Query arguments.
	 */
	public function handling_custom_meta_query_keys( $wp_query_args, $query_vars ) {
		if ( ! empty( $query_vars['meta_query'] ) ) {
			$wp_query_args['meta_query'][] = $query_vars['meta_query'];
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
		$product = wc_get_product( $product_id );

		if ( ! $product ) {
			return;
		}

		$moodle_course_id = get_post_meta( $product_id, 'moodle_course_id', true );

		if ( ! empty( $moodle_course_id ) ) {
			MooWoodle()->course->update_course_information(
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

		$moodle_course_id = get_post_meta( $product_id, 'moodle_course_id', true );

		if ( ! empty( $moodle_course_id ) ) {
			MooWoodle()->course->update_course_information(
				array(
					'moodle_course_id' => $moodle_course_id,
					'product_id'       => $product_id,
				)
			);
		}
	}

	/**
	 * Delete all the product which id is not prasent in $exclude_ids array.
     *
	 * @param array $exclude_ids product ids.
	 * @return void
	 */
	public static function remove_exclude_ids( $exclude_ids ) {
        // get all product except $exclude_ids array.
		$product_ids = \wc_get_products(
            array(
				'exclude'    => $exclude_ids,
				'status'     => 'publish',
				'return'     => 'ids',
				'meta_query' => array(
					array(
						'key'     => 'linked_course_id',
						'compare' => 'EXISTS',
					),
				),
            )
        );

		// delete product.
		foreach ( $product_ids as $product_id ) {
            $product = wc_get_product( $product_id );
            $product->set_status( 'draft' );
			$product->save();
		}
	}
}