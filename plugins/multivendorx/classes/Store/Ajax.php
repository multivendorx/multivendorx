<?php

namespace MultiVendorX\Store;

use MultiVendorX\SPMV\Util;

defined( 'ABSPATH' ) || exit;

/**
 * Store Ajax class
 *
 * @version     2.2.0
 * @package     MultiVendorX
 * @author      MultiVendorX
 */

class Ajax {
    public function __construct() {
        add_action( 'wp_ajax_switch_store', array( $this, 'multivendorx_switch_store' ) );

        add_action( 'wp_ajax_mvx_product_classify_next_level_list_categories', array( $this, 'mvx_product_classify_next_level_list_categories' ) );
        add_action( 'wp_ajax_mvx_product_classify_search_category_level', array( $this, 'mvx_product_classify_search_category_level' ) );
        add_action( 'wp_ajax_show_product_classify_next_level_from_searched_term', array( $this, 'show_product_classify_next_level_from_searched_term' ) );
        add_action( 'wp_ajax_mvx_list_a_product_by_name_or_gtin', array( $this, 'mvx_list_a_product_by_name_or_gtin' ) );
        add_action( 'wp_ajax_mvx_set_classified_product_terms', array( $this, 'mvx_set_classified_product_terms' ) );

        add_action( 'wp_ajax_mvx_create_duplicate_product', array( $this, 'mvx_create_duplicate_product' ) );
        add_action( 'wp_ajax_mvx_show_all_products', array( $this, 'mvx_show_all_products' ) );

        add_action( 'wp_ajax_mvx_edit_product_attribute', array( $this, 'edit_product_attribute_callback' ) );
        add_action( 'wp_ajax_mvx_product_save_attributes', array( $this, 'save_product_attributes_callback' ) );
        add_action( 'wp_ajax_mvx_product_tag_add', array( $this, 'mvx_product_tag_add' ) );
    }

    public function multivendorx_switch_store() {
        $store_id = filter_input( INPUT_POST, 'store_id', FILTER_SANITIZE_NUMBER_INT ) ?? 0;
        $user_id  = get_current_user_id();

        if ( $user_id && $store_id ) {
            update_user_meta( $user_id, 'multivendorx_active_store', $store_id );

            $dashboard_page_id = (int) MultiVendorX()->setting->get_setting( 'store_dashboard_page' );
            if ( $dashboard_page_id ) {
                $redirect_url = get_permalink( $dashboard_page_id );
            } else {
                // fallback
                $redirect_url = home_url( '/dashboard' );
            }

            wp_send_json_success(
                array(
					'redirect' => $redirect_url,
                )
            );
        }
    }

    public function mvx_product_classify_next_level_list_categories() {
        $term_id     = isset( $_POST['term_id'] ) ? (int) $_POST['term_id'] : 0;
        $taxonomy    = isset( $_POST['taxonomy'] ) ? wc_clean( $_POST['taxonomy'] ) : '';
        $cat_level   = isset( $_POST['cat_level'] ) ? wc_clean( $_POST['cat_level'] ) : 0;
        $term        = get_term( $term_id, $taxonomy );
        $child_terms = get_term_children( $term_id, $taxonomy );
        $html_level  = '';
        $level       = $cat_level + 1;
        $final       = false;
        $hierarchy   = get_ancestors( $term_id, $taxonomy );
        $crumb       = array();
        foreach ( array_reverse( $hierarchy ) as $id ) {
            $h_term  = get_term( $id, $taxonomy );
            $crumb[] = $h_term->name;
        }
        $crumb[]        = $term->name;
        $html_hierarchy = implode( ' <i class="mvx-font ico-right-arrow-icon"></i> ', $crumb );
        if ( $child_terms ) {
            $html_level .= '<ul class="mvx-product-categories ' . $level . '-level" data-cat-level="' . $level . '">';
            $html_level .= Products::mvx_list_categories(
                apply_filters(
                    "mvx_vendor_product_classify_{$level}_level_categories",
                    array(
						'taxonomy'   => 'product_cat',
						'hide_empty' => false,
						'html_list'  => true,
						'parent'     => $term_id,
						'cat_link'   => '#',
                    )
                )
            );
            $html_level .= '</ul>';
        } else {
            $final = true;
            // $level = 'final';
            $html_level .= '<div class="final-cat-button">'
                    . '<p>' . $term->name . '<p>'
                    . '<button class="classified-pro-cat-btn btn btn-default" data-term-id="' . $term->term_id . '" data-taxonomy="' . $taxonomy . '">' . strtoupper( __( 'Select', 'multivendorx' ) ) . '</button>'
                    . '</div>';
        }
        wp_send_json(
            array(
				'html_level' => $html_level,
				'level'      => $level,
				'is_final'   => $final,
				'hierarchy'  => $html_hierarchy,
            )
        );
        die;
    }

    public function mvx_product_classify_search_category_level() {
        $keyword = isset( $_POST['keyword'] ) ? wc_clean( wp_unslash( $_POST['keyword'] ) ) : '';
        if ( ! empty( $keyword ) ) {
            $query              = apply_filters(
                'mvx_product_classify_search_category_level_args',
                array(
					'taxonomy'   => 'product_cat',
					'search'     => $keyword,
					'hide_empty' => false,
					'parent'     => '',
					'fields'     => 'ids',
                )
            );
            $search_terms       = Products::mvx_list_categories( $query );
            $html_search_result = '';
            if ( $search_terms ) {
                foreach ( $search_terms as $term_id ) {
                    $term                = get_term( $term_id, $query['taxonomy'] );
                    $hierarchy           = get_ancestors( $term_id, $query['taxonomy'] );
                    $hierarchy           = array_reverse( $hierarchy );
                    $hierarchy[]         = $term_id;
                    $html_search_result .= '<li class="list-group-item" data-term-id="' . $term->term_id . '" data-taxonomy="' . $query['taxonomy'] . '">'
                            . '<p><strong>' . $term->name . '</strong></p>'
                            . '<ul class="breadcrumb">';
                    foreach ( $hierarchy as $id ) {
                        $h_term              = get_term( $id, $query['taxonomy'] );
                        $html_search_result .= '<li>' . $h_term->name . '</li>';
                    }
                    $html_search_result .= '</ul></li>';
                }
            } else {
                $html_search_result .= '<li class="list-group-item"><p>' . __( 'No results found', 'multivendorx' ) . '</p></li>';
            }
            wp_send_json( array( 'results' => $html_search_result ) );
            die;
        }
    }

    public function mvx_list_a_product_by_name_or_gtin() {
        global $wpdb;
        $keyword = isset( $_POST['keyword'] ) ? wc_clean( wp_unslash( $_POST['keyword'] ) ) : '';
        $html    = '';
        if ( ! empty( $keyword ) ) {
            $ids   = array();
            $posts = $wpdb->get_col( $wpdb->prepare( "SELECT post_id FROM $wpdb->postmeta WHERE meta_key='_mvx_gtin_code' AND meta_value LIKE %s;", esc_sql( '%' . $keyword . '%' ) ) );
            if ( ! $posts ) {
                $data_store = \WC_Data_Store::load( 'product' );
                $ids        = $data_store->search_products( $keyword, '', false );
                $include    = array();
                foreach ( $ids as $id ) {
                    $product        = wc_get_product( $id );
                    $product_map_id = get_post_meta( $id, Utill::POST_META_SETTINGS['spmv_map_id'], true );
                    if ( $product && $product_map_id ) {
                        $results     = Util::fetch_products_map( $product_map_id );
                        $product_ids = wp_list_pluck( $results, 'product_id' );
                        if ( $product_ids ) {
                            $include[] = min( $product_ids );
                        }
                    } elseif ( $product ) {
                        $include[] = $id;
                    }
                }

                if ( $include ) {
                    $ids = array_slice( array_intersect( $ids, $include ), 0, apply_filters( 'mvx_spmv_list_product_search_number', 10 ) );
                } else {
                    $ids = array();
                }
            } else {
                $unique_gtin_arr = array();
                foreach ( $posts as $post_id ) {
                    $unique_gtin_arr[ $post_id ] = get_post_meta( $post_id, Utill::POST_META_SETTINGS['gtin_code'], true );
                }
                $ids = array_keys( array_unique( $unique_gtin_arr ) );
            }

            $product_objects = apply_filters( 'mvx_list_a_products_objects', array_map( 'wc_get_product', $ids ) );
            $user_id         = get_current_user_id();

            if ( count( $product_objects ) > 0 ) {
                foreach ( $product_objects as $product_object ) {
                    if ( $product_object ) {
                        $gtin_code = get_post_meta( $product_object->get_id(), Utill::POST_META_SETTINGS['gtin_code'], true );
                        // if (is_user_mvx_vendor($user_id) && mvx_is_product_type_avaliable($product_object->get_type())) {
                            // product cat
                            $product_cats = '';
                            $termlist     = array();
                            // $terms = wp_get_post_terms( $product_object->get_id(), 'product_cat', array( 'fields' => 'ids' ) );
                            $terms = get_the_terms( $product_object->get_id(), 'product_cat' );
						if ( ! $terms ) {
							$product_cats = '<span class="na">&ndash;</span>';
						} else {
							$terms_arr = array();
							$terms     = apply_filters( 'mvx_vendor_product_list_row_product_categories', $terms, $product_object );
							foreach ( $terms as $term ) {
								// $h_term = get_term_by('term_id', $term_id, 'product_cat');
								$terms_arr[] = $term->name;
							}
							$product_cats = implode( ' | ', $terms_arr );
						}

                            $html .= '<div class="search-result-clm">'
                                    . $product_object->get_image( apply_filters( 'mvx_searched_name_gtin_product_list_image_size', array( 98, 98 ) ) )
                                    . '<div class="result-content">'
                                    . '<p><strong><a href="' . esc_url( $product_object->get_permalink() ) . '" target="_blank">' . wp_kses_post( rawurldecode( $product_object->get_formatted_name() ) ) . '</a></strong></p>'
                                    . '<p>' . $product_object->get_price_html() . '</p>'
                                    . '<p>' . $product_cats . '</p>'
                                    . '</div>'
                                    . '<a href="javascript:void(0)" data-product_id="' . $product_object->get_id() . '" class="mvx-create-pro-duplicate-btn btn btn-default item-sell">' . __( 'Sell yours', 'multivendorx' ) . '</a>'
                                    . '</div>';
                        // } else {

                        // }
                    }
                }
            } else {
                $html .= '<div class="search-result-clm"><div class="result-content">' . __( 'No Suggestions found', 'multivendorx' ) . '</div></div>';
            }
        } else {
            $html .= '<div class="search-result-clm"><div class="result-content">' . __( 'Empty search field! Enter a text to search.', 'multivendorx' ) . '</div></div>';
        }
        wp_send_json( array( 'results' => $html ) );
        die;
    }

    public function mvx_set_classified_product_terms() {
        // $product_id = isset($_POST['productId']) ? absint($_POST['productId']) : 0;
        $term_id  = isset( $_POST['term_id'] ) ? absint( $_POST['term_id'] ) : 0;
        $taxonomy = isset( $_POST['taxonomy'] ) ? wc_clean( $_POST['taxonomy'] ) : '';
        $user_id  = get_current_user_id();
        $url      = '';
        // if (is_user_mvx_vendor($user_id)) {
            $data = array(
                'term_id'  => $term_id,
                'taxonomy' => $taxonomy,
            );
            set_transient( 'classified_product_terms_vendor' . $user_id, $data, HOUR_IN_SECONDS );

            $product_id = MultiVendorX()->store->products->create_product_draft( 'product' );
            $url        = esc_url( StoreUtil::get_endpoint_url( 'products', 'edit', $product_id ) );
			// }
			wp_send_json( array( 'url' => $url ) );
			die;
    }

    public function show_product_classify_next_level_from_searched_term() {
        $term_id    = isset( $_POST['term_id'] ) ? absint( $_POST['term_id'] ) : 0;
        $taxonomy   = isset( $_POST['taxonomy'] ) ? wc_clean( $_POST['taxonomy'] ) : '';
        $hierarchy  = get_ancestors( $term_id, $taxonomy );
        $html_level = $html_hierarchy = '';
        $level      = 1;
        $parent     = 0;
        if ( $hierarchy ) {
            foreach ( array_reverse( $hierarchy ) as $id ) {
                $html_level .= '<div class="mvx-product-cat-level ' . $level . '-level-cat cat-column" data-level="' . $level . '">'
                        . '<ul class="mvx-product-categories ' . $level . '-level" data-cat-level="' . $level . '">';
                $html_level .= Products::mvx_list_categories(
                    apply_filters(
                        'mvx_vendor_product_classify_' . $level . '_level_categories',
                        array(
							'taxonomy'   => 'product_cat',
							'hide_empty' => false,
							'html_list'  => true,
							'parent'     => $parent,
							'cat_link'   => '#',
							'selected'   => $id,
                        )
                    )
                );
                $html_level .= '</ul></div>';
                ++$level;
                $parent = $id;
            }
        }
        $html_level .= '<div class="mvx-product-cat-level ' . $level . '-level-cat cat-column" data-level="' . $level . '">'
                . '<ul class="mvx-product-categories ' . $level . '-level" data-cat-level="' . $level . '">';
        $html_level .= Products::mvx_list_categories(
            apply_filters(
                'mvx_vendor_product_classify_first_level_categories',
                array(
					'taxonomy'   => 'product_cat',
					'hide_empty' => false,
					'html_list'  => true,
					'parent'     => $parent,
					'cat_link'   => '#',
					'selected'   => $term_id,
                )
            )
        );
        $html_level .= '</ul></div>';
        // add final level step
        $level       = $level + 1;
        $h_term      = get_term( $term_id, $taxonomy );
        $html_level .= '<div class="mvx-product-cat-level ' . $level . '-level-cat cat-column select-cat-button-holder" data-level="' . $level . '">'
                . '<div class="final-cat-button">'
                . '<p>' . $h_term->name . '<p>'
                . '<button class="classified-pro-cat-btn btn btn-default" data-term-id="' . $h_term->term_id . '" data-taxonomy="' . $taxonomy . '">' . strtoupper( __( 'Select', 'multivendorx' ) ) . '</button>'
                . '</div></div>';

        wp_send_json( array( 'html_level' => $html_level ) );
        die;
    }

    public function mvx_create_duplicate_product() {
        if ( ! current_user_can( 'edit_products' ) ) {
            wp_die( -1 );
        }
        $product_id   = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;
        $tab          = sanitize_text_field( $_POST['tab'] ?? '' );
        $subtab       = sanitize_text_field( $_POST['subtab'] ?? '' );
        $parent_post  = get_post( $product_id );
        $redirect_url = isset( $_POST['redirect_url'] ) ? esc_url( $_POST['redirect_url'] ) : esc_url( StoreUtil::get_endpoint_url( 'products', 'edit' ) );
        $product      = wc_get_product( $product_id );
        if ( ! function_exists( 'duplicate_post_plugin_activation' ) ) {
            include_once WC_ABSPATH . 'includes/admin/class-wc-admin-duplicate-product.php';
        }
        $duplicate_product_class = new \WC_Admin_Duplicate_Product();
        $duplicate_product       = $duplicate_product_class->product_duplicate( $product );
        $response                = array( 'status' => false );
        if ( $duplicate_product ) {
            // if Product title have Copy string
            $title = str_replace( ' (Copy)', '', $parent_post->post_title );
            wp_update_post(
                array(
					'ID'          => $duplicate_product->get_id(),
					'post_author' => get_current_user_id(),
					'post_title'  => $title,
                )
            );

            $store_id = get_user_meta( get_current_user_id(), 'multivendorx_active_store', true );
            update_post_meta( $duplicate_product->get_id(), 'multivendorx_store_id', $store_id );

            // Add GTIN, if exists
            // $gtin_data = wp_get_post_terms($product->get_id(), $MVX->taxonomy->mvx_gtin_taxonomy);
            // if ($gtin_data) {
            // $gtin_type = isset($gtin_data[0]->term_id) ? $gtin_data[0]->term_id : '';
            // wp_set_object_terms($duplicate_product->get_id(), $gtin_type, $MVX->taxonomy->mvx_gtin_taxonomy, true);
            // }
            // $gtin_code = get_post_meta($product->get_id(), '_mvx_gtin_code', true);
            // if ($gtin_code)
            // update_post_meta($duplicate_product->get_id(), '_mvx_gtin_code', wc_clean($gtin_code));

            $has_mvx_spmv_map_id = get_post_meta( $product->get_id(), Utill::POST_META_SETTINGS['spmv_map_id'], true );
            if ( $has_mvx_spmv_map_id ) {
                $data = array(
					'product_id'     => $duplicate_product->get_id(),
					'product_map_id' => $has_mvx_spmv_map_id,
				);
                update_post_meta( $duplicate_product->get_id(), '_mvx_spmv_map_id', $has_mvx_spmv_map_id );
                Util::mvx_spmv_products_map( $data, 'insert' );
            } else {
                $data   = array( 'product_id' => $duplicate_product->get_id() );
                $map_id = Util::mvx_spmv_products_map( $data, 'insert' );

                if ( $map_id ) {
                    update_post_meta( $duplicate_product->get_id(), '_mvx_spmv_map_id', $map_id );
                    // Enroll in SPMV parent product too
                    $data = array(
						'product_id'     => $product->get_id(),
						'product_map_id' => $map_id,
					);
                    Util::mvx_spmv_products_map( $data, 'insert' );
                    update_post_meta( $product->get_id(), '_mvx_spmv_map_id', $map_id );
                }
                update_post_meta( $product->get_id(), '_mvx_spmv_product', true );
            }
            update_post_meta( $duplicate_product->get_id(), '_mvx_spmv_product', true );
            $duplicate_product->save();
            do_action( 'mvx_create_duplicate_product', $duplicate_product );

            $product_id          = $duplicate_product->get_id();
            $permalink_structure = get_option( Utill::WORDPRESS_SETTINGS['permalink'] );

            if ( ! empty( $permalink_structure ) ) {
                $redirect_url = home_url( "dashboard/{$tab}/{$subtab}/{$product_id}/" );
            } else {
                $redirect_url = add_query_arg(
                    array(
						'page_id'   => (int) MultiVendorX()->setting->get_setting( 'store_dashboard_page' ),
						'dashboard' => 1,
						'tab'       => $tab,
						'subtab'    => $subtab,
						'value'     => $product_id,
                    ),
                    home_url( '/' )
                );
            }

            $response['status']       = true;
            $response['redirect_url'] = esc_url_raw( $redirect_url );
        }
        wp_send_json( $response );
    }

    public function mvx_show_all_products() {
        $store_id = get_user_meta( get_current_user_id(), 'multivendorx_active_store', true );
        $default  = array(
            'posts_per_page' => -1,
            'post_type'      => 'product',
            'post_status'    => 'publish',
            'meta_query'     => array(
                array(
                    'key'     => 'multivendorx_store_id',
                    'value'   => $store_id,
                    'compare' => '!=',
                ),
            ),
        );
        $query    = new \WP_Query( $default );
        MultiVendorX()->util->get_template( 'product/show_products.php', array( 'query' => $query ) );
        die;
    }

    public function edit_product_attribute_callback() {
        ob_start();

        check_ajax_referer( 'add-attribute', 'security' );

        if ( ! current_user_can( 'edit_products' ) || ( ! apply_filters( 'mvx_vendor_can_add_custom_attribute', true ) && empty( sanitize_text_field( $_POST['taxonomy'] ) ) ) ) {
            wp_die( -1 );
        }

        $i             = isset( $_POST['i'] ) ? absint( $_POST['i'] ) : 0;
        $metabox_class = array();
        $attribute     = new \WC_Product_Attribute();
        $self          = new Products();

        $attribute->set_id( wc_attribute_taxonomy_id_by_name( sanitize_text_field( $_POST['taxonomy'] ) ) );
        $attribute->set_name( sanitize_text_field( $_POST['taxonomy'] ) );
        $attribute->set_visible( apply_filters( 'woocommerce_attribute_default_visibility', 1 ) );
        $attribute->set_variation( apply_filters( 'woocommerce_attribute_default_is_variation', 0 ) );

        if ( $attribute->is_taxonomy() ) {
            $metabox_class[] = 'taxonomy';
            $metabox_class[] = $attribute->get_name();
        }

        MultiVendorX()->util->get_template(
            'product/views/html-product-attribute.php',
            array(
				'attribute'     => $attribute,
				'metabox_class' => $metabox_class,
				'i'             => $i,
				'self'          => $self,
			)
        );

        wp_die();
    }

    /**
     * Save attributes
     */
    public function save_product_attributes_callback() {
        check_ajax_referer( 'save-attributes', 'security' );

        if ( ! current_user_can( 'edit_products' ) ) {
            wp_die( -1 );
        }

        parse_str( $_POST['data'], $data );

        $attr_data = isset( $data['wc_attributes'] ) ? $data['wc_attributes'] : array();

        $attributes   = Products::prepare_attributes( $attr_data );
        $product_id   = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;
        $product_type = ! empty( $_POST['product_type'] ) ? wc_clean( $_POST['product_type'] ) : 'simple';
        $classname    = \WC_Product_Factory::get_product_classname( $product_id, $product_type );
        $product      = new $classname( $product_id );

        $product->set_attributes( $attributes );
        $product->save();
        wp_die();
    }

    function mvx_product_tag_add() {
        check_ajax_referer( 'add-attribute', 'security' );
        $taxonomy = apply_filters( 'mvx_product_tag_add_taxonomy', 'product_tag' );
        $tax      = get_taxonomy( $taxonomy );
        $tag_name = '';
        $message  = '';
        $status   = false;
        if ( ! apply_filters( 'mvx_vendor_can_add_product_tag', true, get_current_user_id() ) ) {
            $message = __( "You don't have permission to add product tags", 'multivendorx' );
            wp_send_json(
                array(
					'status'   => $status,
					'tag_name' => $tag_name,
					'message'  => $message,
                )
            );
            die;
        }
        $new_tag = isset( $_POST['new_tag'] ) ? wc_clean( $_POST['new_tag'] ) : '';
        $tag     = wp_insert_term( $_POST['new_tag'], $taxonomy, array() );

        if ( ! $tag || is_wp_error( $tag ) || ( ! $tag = get_term( $tag['term_id'], $taxonomy ) ) ) {
            $message = __( 'An error has occurred. Please reload the page and try again.', 'multivendorx' );
            if ( is_wp_error( $tag ) && $tag->get_error_message() ) {
                $message = $tag->get_error_message();
            }
        } else {
            $tag_name = $tag->name;
            $status   = true;
        }
        wp_send_json(
            array(
				'status'   => $status,
				'tag'      => $tag,
				'tag_name' => $tag_name,
				'message'  => $message,
            )
        );
        die;
    }
}
