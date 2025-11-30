<?php

namespace MultiVendorX;

use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Store\Products;

/**
 * MultiVendorX Frontend class
 *
 * @class       Frontend class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Frontend {
    /**
     * Frontend class construct function
     */
    public function __construct() {
        add_filter( 'template_include', array( $this, 'vendor_dashboard_template' ) );

        // if ( current_user_can( 'edit_products' ) ) {
        //     add_action( 'mvx_process_product_object', array( $this, 'mvx_save_generated_sku') );
        // }

        add_action( 'woocommerce_after_shop_loop_item', array( $this, 'add_text_in_shop_and_single_product_page' ), 6 );
        add_action( 'woocommerce_product_meta_start', array( $this, 'add_text_in_shop_and_single_product_page' ), 25 );
        add_action( 'woocommerce_get_item_data', array( $this, 'add_sold_by_text_cart' ), 30, 2 );
        add_filter( 'woocommerce_product_tabs', array( $this, 'product_store_tab' ) );

        add_filter( 'woocommerce_related_products', array( $this, 'show_related_products' ), 99, 3 );

        if ( ! empty( MultiVendorX()->setting->get_setting( 'store_order_display' ) ) ) {
            add_action( 'woocommerce_before_calculate_totals', array( $this, 'cart_items_sort_by_store' ), 10 );
            add_action( 'woocommerce_before_cart', array( $this, 'message_multiple_vendors_cart' ), 10 );
            add_filter( 'render_block_woocommerce/cart-line-items-block', array( $this, 'message_multiple_vendors_cart_block' ), 10 );
        }

        add_action( 'woocommerce_product_query', array( $this, 'restrict_store_products_from_shop' ) );
        add_action( 'woocommerce_cart_loaded_from_session', array( $this, 'restrict_products_already_in_cart' ) );
        add_filter( 'woocommerce_add_to_cart_validation', array( $this, 'restrict_products_from_cart' ), 10, 2 );
        add_action( 'woocommerce_checkout_process', array( $this, 'restrict_products_from_checkout' ) );
    }

    public function restrict_store_products_from_shop( $q ) {

        $products = wc_get_products(
            array(
				'limit'  => -1,
				'return' => 'ids',
            )
        );

        $exclude = array();

        foreach ( $products as $product_id ) {
            if ( StoreUtil::get_excluded_products( $product_id ) ) {
                $exclude[] = $product_id;
            }
        }

        if ( ! empty( $exclude ) ) {
            $q->set( 'post__not_in', $exclude );
        }
    }

    public function restrict_products_from_cart( $passed, $product_id ) {

        if ( StoreUtil::get_excluded_products( $product_id ) ) {
            wc_add_notice( __( 'This product cannot be purchased at the moment.', 'multivendorx' ), 'error' );
            return false;
        }

        return $passed;
    }

    public function restrict_products_already_in_cart( $cart ) {
        foreach ( $cart->get_cart() as $cart_key => $item ) {
            $product_id = $item['product_id'];

            if ( StoreUtil::get_excluded_products( $product_id ) ) {
                $cart->remove_cart_item( $cart_key );
            }
        }
    }

    public function restrict_products_from_checkout() {

        foreach ( WC()->cart->get_cart() as $item ) {
            $product_id = $item['product_id'];

            if ( StoreUtil::get_excluded_products( $product_id ) ) {
                wc_add_notice( __( 'Checkout blocked: your cart contains products from a restricted store.', 'multivendorx' ), 'error' );
                break;
            }
        }
    }

    public function show_store_info( $product_id ) {
        $store_details = MultiVendorX()->setting->get_setting( 'store_branding_details', array() );

        if ( in_array( 'show_store_name', $store_details ) ) {
            $store = StoreUtil::get_products_store( $product_id );
            if ( ! $store ) {
				return;
            }

            $store_user_ids   = StoreUtil::get_store_users( $store->get_id() );
            $store_owner_id   = null;
            $store_owner_name = '';

            // Find store owner
            if ( ! empty( $store_user_ids ) && is_array( $store_user_ids ) ) {
                foreach ( $store_user_ids as $user_id ) {
                    $user = get_userdata( $user_id );
                    if ( $user && in_array( 'store_owner', (array) $user->roles, true ) ) {
                        $store_owner_id   = $user->ID;
                        $store_owner_name = $user->display_name;
                        break;
                    }
                }
            }

            $name        = $store->get( 'name' );
            $description = $store->get( 'description' );
            $phone       = $store->get_meta( 'phone' ) ?? '';
            $email       = $store->get_meta( 'email' ) ?? '';
            $address_1   = $store->get_meta( 'address_1' ) ?? '';

            $logo_html = '';
            if ( in_array( 'show_store_logo_next_to_products', $store_details ) ) {
                $logo_url  = $store->get_meta( 'image' ) ?? MultiVendorX()->plugin_url . 'assets/images/default-store.jpg';
                $logo_html = '<img src="' . esc_url( $logo_url ) . '" alt="' . esc_attr( $name ) . '" />';
            }

            return array(
                'id'          => $store->get_id(),
                'name'        => $name,
                'description' => $description,
                'logo_html'   => $logo_html,
                'owner_id'    => $store_owner_id,
                'owner_name'  => $store_owner_name,
                'phone'       => $phone,
                'email'       => $email,
                'address'     => $address_1,
            );
        }
    }

    public function add_text_in_shop_and_single_product_page() {
        global $post;

        if ( apply_filters( 'mvx_sold_by_text_after_products_shop_page', true, $post->ID ) ) {
            $details = $this->show_store_info( ( $post->ID ) );

            if ( ! empty( $details ) ) {
                $sold_by_text = apply_filters( 'mvx_sold_by_text', __( 'Sold By', 'multivendorx' ), $post->ID );

                echo '<a class="by-store-name-link" style="display:block;" target="_blank" href="'
                    . esc_url( MultiVendorX()->store->storeutil->get_store_url( $details['id'] ) ) . '">'
                    . esc_html( $sold_by_text ) . ' '
                    // . $details['logo_html']
                    . esc_html( $details['name'] )
                    . '</a>';
            }
        }
    }
    public function add_sold_by_text_cart( $array, $cart_item ) {
        if ( apply_filters( 'mvx_sold_by_text_in_cart_checkout', true, $cart_item['product_id'] ) ) {
            $product_id = $cart_item['product_id'];
            $details    = $this->show_store_info( ( $product_id ) );

            if ( ! empty( $details ) ) {
                $sold_by_text = apply_filters( 'mvx_sold_by_text', __( 'Sold By', 'multivendorx' ), $product_id );
                $array[]      = array(
                    'name'  => esc_html( $sold_by_text ),
                    'value' => esc_html( $details['name'] ),
                    // 'display' => $details['logo_html'] . esc_html( $details['name'] ),
                );
            }
        }

        return $array;
    }

    public function product_store_tab( $tabs ) {
        global $product;
        if ( $product ) {
            $store = StoreUtil::get_products_store( $product->get_id() );
            if ( $store ) {
                $title         = __( 'Store', 'multivendorx' );
                $tabs['store'] = array(
                    'title'    => $title,
                    'priority' => 20,
                    'callback' => array( $this, 'woocommerce_product_store_tab' ),
                );
            }
        }
        return $tabs;
    }

    public function woocommerce_product_store_tab() {
        MultiVendorX()->util->get_template( 'store/store-single-product-tab.php' );
    }

    /**
     * Show related products or not
     *
     * @return array
     */
    public function show_related_products( $query, $product_id, $args ) {
        if ( $product_id ) {
            $store   = StoreUtil::get_products_store( $product_id ) ?? '';
            $related = MultiVendorX()->setting->get_setting( 'recommendation_source', '' );
            if ( ! empty( $related ) && 'none' == $related ) {
                return array();
            } elseif ( ! empty( $related ) && 'all_stores' == $related ) {
                return $query;
            } elseif ( ! empty( $related ) && 'same_store' == $related && $store && ! empty( $store->get_id() ) ) {
                $query = get_posts(
                    array(
						'post_type'   => 'product',
						'post_status' => 'publish',
						'fields'      => 'ids',
						'exclude'     => $product_id,
						'meta_query'  => array(
							array(
								'key'     => 'multivendorx_store_id',
								'value'   => $store->get_id(),
								'compare' => '=',
							),
						),
						'orderby'     => 'rand',
                    )
                );
                if ( $query ) {
                    return $query;
                }
            }
        }
        return $query;
    }

    public function message_multiple_vendors_cart() {
        $stores_in_cart = $this->get_stores_in_cart();
        if ( count( $stores_in_cart ) > 1 ) {
            wc_print_notice( esc_html__( 'Your cart has products from various stores. They’ll be processed and shipped individually, so expect more than one delivery.', 'multivendorx' ), 'notice' );
        }
    }

    public function message_multiple_vendors_cart_block( $block_content ) {
        $message        = '';
        $stores_in_cart = $this->get_stores_in_cart();
        if ( count( $stores_in_cart ) > 1 ) {
            $message = __( 'Your cart has products from various stores. They’ll be processed and shipped individually, so expect more than one delivery.', 'multivendorx' );
        }
        return $message . $block_content;
    }

    public function get_stores_in_cart() {
        $cart   = WC()->cart;
        $stores = array();
        if ( is_object( $cart ) ) {
            foreach ( $cart->get_cart() as $cart_item ) {
                $store = StoreUtil::get_products_store( $cart_item['product_id'] );
                if ( $store ) {
                    $store_id = $store->get_id();
                    if ( ! empty( $store_id ) ) {
                        array_push( $stores, $store_id );
                    }
                }
            }
        }
        return array_unique( array_filter( $stores ) );
    }

    public function cart_items_sort_by_store( $cart ) {
        $store_groups   = array();
        $admin_products = array();

        foreach ( $cart->get_cart() as $cart_item_key => $cart_item ) {
            $store = StoreUtil::get_products_store( $cart_item['product_id'] );

            if ( $store ) {
                $store_groups[ $store->get_id() ][ $cart_item_key ] = $cart_item;
            } else {
                $admin_products[ $cart_item_key ] = $cart_item;
            }
        }

        $new_cart = array();

        foreach ( $store_groups as $cart_item_key => $items ) {
            foreach ( $items as $key => $item ) {
                $new_cart[ $key ] = $item;
            }
        }

        foreach ( $admin_products as $key => $item ) {
            $new_cart[ $key ] = $item;
        }

        $cart->cart_contents = $new_cart;
    }

    public function vendor_dashboard_template( $template ) {
        $user = wp_get_current_user();

        //checking change later when all function ready
        // if ( is_user_logged_in() && Utill::is_store_dashboard() && in_array( 'store_owner', $user->roles, true ) ) {
        if ( is_user_logged_in() && is_page() && has_shortcode(get_post()->post_content, 'multivendorx_store_dashboard')  ) {
            return MultiVendorX()->plugin_path . 'templates/store/store-dashboard.php';
        }
        return $template;
    }

    //Generate a simple / parent product SKU from the product slug or ID.
    protected function generate_product_sku( $product ) {
        if ( $product ) {
            switch ( MultiVendorX()->setting->get_setting( 'sku_generator', '' ) ) {
                case 'slugs':
                    $product_sku = $product->get_slug();
                    break;

                case 'ids':
                    $product_sku = $product->get_id();
                    break;

                // use the original product SKU if we're not generating it
                default:
                    $product_sku = $product->get_sku();
            }
        }
        return $product_sku;
    }

    // Generate a product variation SKU using the product slug or ID.
    protected function generate_variation_sku( $variation = array() ) {
        if ( $variation ) {
            $variation_sku = '';
            if ( 'slugs' === MultiVendorX()->setting->get_setting( 'sku_generator', '' ) ) {
                // replace spaces in attributes depending on settings
                switch ( MultiVendorX()->setting->get_setting( 'sku_generator_attribute_spaces', '' ) ) {
                    case 'underscore':
                        $variation['attributes'] = str_replace( ' ', '_', $variation['attributes'] );
                        break;

                    case 'dash':
                        $variation['attributes'] = str_replace( ' ', '-', $variation['attributes'] );
                        break;

                    case 'none':
                        $variation['attributes'] = str_replace( ' ', '', $variation['attributes'] );
                        break;
                }
                $separator     = apply_filters( 'sku_generator_attribute_separator', $this->get_sku_separator() );
                $variation_sku = implode( $separator, $variation['attributes'] );
                $variation_sku = str_replace( 'attribute_', '', $variation_sku );
            }
            if ( 'ids' === MultiVendorX()->setting->get_setting( 'sku_generator', '' ) ) {
                $variation_sku = $variation['variation_id'] ? $variation['variation_id'] : '';
            }
        }
        return $variation_sku;
    }

    // Get the separator to use between parent / variation SKUs
    private function get_sku_separator() {
        // Filters the separator used between parent / variation SKUs
        return apply_filters( 'sku_generator_sku_separator', '-' );
    }

    // generate the variation SKU.
    protected function mvx_save_variation_sku( $variation_id, $parent, $parent_sku = null ) {
        $variation  = wc_get_product( $variation_id );
        $parent_sku = $parent_sku ? $parent_sku : $parent->get_sku();
        if ( $variation ) {
            if ( $variation instanceof WC_Product && $variation->is_type( 'variation' ) || ! empty( $parent_sku ) ) {
                $variation_data = $parent->get_available_variation( $variation );
                if ( ! empty( $variation_data ) ) {
                    $variation_sku = $this->generate_variation_sku( $variation_data );
                    $sku           = $parent_sku . $this->get_sku_separator() . $variation_sku;
                    try {
                        $sku = wc_product_generate_unique_sku( $variation_id, $sku );
                        $variation->set_sku( $sku );
                        $variation->save();
                    } catch ( WC_Data_Exception $exception ) {
                        wc_add_notice( __( 'Variation SKU is not generated!', 'multivendorx' ), 'error' );
                    }
                }
            }
        }
    }

    // public function add_sku_column_in_product_list( $products_table_headers ) {
    // $products_table_headers['sku'] = __( 'SKU', 'multivendorx' );
    // return $products_table_headers;
    // }

    // public function display_value_into_sku_column( $row, $product ) {
    // $row['sku'] = '<td>' . $product->get_sku() . '</td>';
    // return $row;
    // }

    // Update the product with the generated SKU.
    public function mvx_save_generated_sku( $product ) {
        if ( is_numeric( $product ) ) {
            $product = wc_get_product( absint( $product ) );
        }
        if ( $product ) {
            $product_sku = $this->generate_product_sku( $product );
            if ( $product->is_type( 'variable' ) && 'never' !== MultiVendorX()->setting->get_setting( 'sku_generator', '' ) ) {
                $variations = $product->get_children();
                if ( $variations ) {
                    foreach ( $variations as $variation_id ) {
                        $this->mvx_save_variation_sku( $variation_id, $product, $product_sku );
                    }
                }
            }
            if ( 'never' !== MultiVendorX()->setting->get_setting( 'sku_generator', '' ) ) {
                $product_sku = wc_product_generate_unique_sku( $product->get_id(), $product_sku );
                try {
                    $product->set_sku( $product_sku );
                    $product->save();
                } catch ( \WC_Data_Exception $exception ) {
                    wc_add_notice( __( 'SKU is not generated!', 'multivendorx' ), 'error' );
                }
            }
        }
    }
}
