<?php
/**
 * Frontend class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

use MultiVendorX\Store\Store;
use MultiVendorX\Store\StoreUtil;

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
        // Redirect store dashboard page.
        add_filter( 'template_include', array( $this, 'store_dashboard_template' ) );
        add_filter( 'woocommerce_login_redirect', array( $this, 'redirect_store_dashboard' ), 10 );
        add_filter( 'login_redirect', array( $this, 'redirect_store_dashboard' ), 10 );

        // Modify related products section in single product page.
        add_filter( 'woocommerce_related_products', array( $this, 'show_related_products' ), 99, 3 );

        // Show message in cart page for multiple stores product.
        if ( ! empty( MultiVendorX()->setting->get_setting( 'store_order_display' ) ) ) {
            add_action( 'woocommerce_before_calculate_totals', array( $this, 'cart_items_sort_by_store' ), 10 );
            add_action( 'woocommerce_before_cart', array( $this, 'message_multiple_stores_cart' ), 10 );
            add_filter( 'render_block_woocommerce/cart-line-items-block', array( $this, 'message_multiple_stores_cart_block' ), 10 );
        }

        // Restrict product visibility on shop, cart, and checkout pages.
        add_action( 'woocommerce_product_query', array( $this, 'restrict_store_products_from_shop' ) );
        add_action( 'woocommerce_cart_loaded_from_session', array( $this, 'restrict_products_already_in_cart' ) );
        add_filter( 'woocommerce_add_to_cart_validation', array( $this, 'restrict_products_from_cart' ), 10, 2 );
        add_action( 'woocommerce_checkout_process', array( $this, 'restrict_products_from_checkout' ) );

        // Store visitors stats data.
        add_action('template_redirect', array($this, 'set_multivendorx_user_cookies'), 10);
        add_action('template_redirect', array($this, 'multivendorx_store_visitors_stats'), 20);
    }

    /**
     * Restrict store products from shop
     *
     * @param object $q Query object.
     * @return void
     */
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

    /**
     * Restrict products from cart
     *
     * @param bool $passed Passed.
     * @param int  $product_id Product ID.
     * @return bool
     */
    public function restrict_products_from_cart( $passed, $product_id ) {

        if ( StoreUtil::get_excluded_products( $product_id ) ) {
            wc_add_notice( __( 'This product cannot be purchased at the moment.', 'multivendorx' ), 'error' );
            return false;
        }

        return $passed;
    }

    /**
     * Restrict products already in cart
     *
     * @param object $cart Cart object.
     * @return void
     */
    public function restrict_products_already_in_cart( $cart ) {
        foreach ( $cart->get_cart() as $cart_key => $item ) {
            $product_id = $item['product_id'];

            if ( StoreUtil::get_excluded_products( $product_id ) ) {
                $cart->remove_cart_item( $cart_key );
            }
        }
    }

    /**
     * Restrict products from checkout
     */
    public function restrict_products_from_checkout() {

        foreach ( WC()->cart->get_cart() as $item ) {
            $product_id = $item['product_id'];

            if ( StoreUtil::get_excluded_products( $product_id ) ) {
                wc_add_notice( __( 'Checkout blocked: your cart contains products from a restricted store.', 'multivendorx' ), 'error' );
                break;
            }
        }
    }


    /**
     * Show related products or not.
     *
     * @param array $query      Query args.
     * @param int   $product_id Product ID.
     * @return array Filtered related products IDs.
     */
    public function show_related_products( $query, $product_id ) {

        if ( ! $product_id ) {
            return $query;
        }

        $related = MultiVendorX()->setting->get_setting( 'recommendation_source', '' );

        if ( 'none' === $related ) {
            return array();
        }

        if ( 'all_stores' === $related ) {
            return $query;
        }

        if ( 'same_store' !== $related ) {
            return $query;
        }

        $store = Store::get_store( $product_id, 'product' );
        if ( ! $store || ! $store->get_id() ) {
            return $query;
        }

        $products = wc_get_products(
            array(
                'status'     => 'publish',
                'limit'      => -1,
                'exclude'    => array( $product_id ),
                'return'     => 'ids',
                'meta_key'   => Utill::POST_META_SETTINGS['store_id'],
                'meta_value' => $store->get_id(),
                'orderby'    => 'rand',
            )
        );

        return $products ?: $query;
    }

    /**
     * Message multiple stores cart
     */
    public function message_multiple_stores_cart() {
        $stores_in_cart = $this->get_stores_in_cart();
        if ( count( $stores_in_cart ) > 1 ) {
            wc_print_notice( esc_html__( 'Your cart has products from various stores. They’ll be processed and shipped individually, so expect more than one delivery.', 'multivendorx' ), 'notice' );
        }
    }

    /**
     * Message multiple stores cart block
     *
     * @param string $block_content Block content.
     *
     * @return string
     */
    public function message_multiple_stores_cart_block( $block_content ) {
        $message        = '';
        $stores_in_cart = $this->get_stores_in_cart();
        if ( count( $stores_in_cart ) > 1 ) {
            $message = __( 'Your cart has products from various stores. They’ll be processed and shipped individually, so expect more than one delivery.', 'multivendorx' );
        }
        return $message . $block_content;
    }

    /**
     * Get stores in cart
     *
     * @return array
     */
    public function get_stores_in_cart() {

        if ( ! is_object( WC()->cart ) ) {
            return array();
        }

        $stores = array();

        foreach ( WC()->cart->get_cart() as $cart_item ) {
            $store = Store::get_store( $cart_item['product_id'] ?? 0, 'product' );

            if ( $store && $store->get_id() ) {
                $stores[] = $store->get_id();
            }
        }

        return array_values( array_unique( $stores ) );
    }

    /**
     * Sort cart items by store
     *
     * @param object $cart Cart.
     */
    public function cart_items_sort_by_store( $cart ) {
        $store_groups   = array();
        $admin_products = array();

        foreach ( $cart->get_cart() as $cart_item_key => $cart_item ) {
            $store = Store::get_store( $cart_item['product_id'], 'product' );

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

    /**
     * Store dashboard template
     *
     * @param string $template Template.
     *
     * @return string
     */
    public function store_dashboard_template( $template ) {
        if (is_user_logged_in() && Utill::is_store_dashboard() && in_array( 'administrator', wp_get_current_user()->roles, true )) {
            wp_safe_redirect( admin_url() );
            exit;
        }
        if ( is_user_logged_in() && is_page() && Utill::is_store_dashboard() ) {
            return MultiVendorX()->plugin_path . 'templates/store/store-dashboard.php';
        }
        return $template;
    }

    /**
     * Redirect Store dashboard
     *
     * @param string $redirect redirect url.
     *
     * @return string
     */
    public function redirect_store_dashboard( $redirect ) {
        if ( in_array('store_owner', wp_get_current_user()->roles, true) && get_user_meta( get_current_user_id(), Utill::USER_SETTINGS_KEYS['active_store'], true ) ) {
            return get_permalink(MultiVendorX()->setting->get_setting( 'store_dashboard_page' ));
        }
        return $redirect;
    }

    /**
     * Set user cookies
     */
    public function set_multivendorx_user_cookies() {
        if ( is_product() || Utill::is_store_page() ) {
            $current_user_id = get_current_user_id();
            $cookie_id = '_multivendorx_user_cookie_' . $current_user_id;

            if ( ! headers_sent() ) {
                $secure = ( 'https' === parse_url( home_url(), PHP_URL_SCHEME ) );
                $cookie_value = filter_input( INPUT_COOKIE, $cookie_id );

                if ( ! $cookie_value ) {
                    $cookie_value = uniqid( 'multivendorx_cookie', true );
                }

                setcookie(
                    $cookie_id,
                    $cookie_value,
                    time() + YEAR_IN_SECONDS,
                    COOKIEPATH,
                    COOKIE_DOMAIN,
                    $secure,
                    true
                );
            }
        }
    }

    public function multivendorx_store_visitors_stats() {
        $product_store = false;

        if ( is_product() ) {
            global $post;
            $product_store = Store::get_store( $post->ID, 'product' );
        } elseif ( Utill::is_store_page() ) {
            $product_store = Utill::is_store_page();
        }

        $user_id    = get_current_user_id();
        $user_cookie = filter_input( INPUT_COOKIE, '_multivendorx_user_cookie_' . $user_id );

        if ( $product_store && $user_cookie ) {
            $ip_data = $this->get_visitor_ip_data();

            if ( ! empty( $ip_data ) && $ip_data->status === 'success' ) {
                $ip_data->user_id     = $user_id;
                $ip_data->user_cookie = $user_cookie;
                $ip_data->session_id  = session_id();

                $this->multivendorx_save_visitor_stats(
                    $product_store->get_id(),
                    $ip_data
                );
            }
        }
    }

    public function get_visitor_ip_data() {
        if (!class_exists('WC_Geolocation', false)) {
            include_once( WC_ABSPATH . 'includes/class-wc-geolocation.php' );
        }
        $e = new \WC_Geolocation();
        $ip_address = $e->get_ip_address();
        if ($ip_address) {
            if (get_transient('multivendorx_' . $ip_address)) {
                $data = get_transient('multivendorx_' . $ip_address);
                if ($data->status != 'error')
                    return $data;
            }
            $service_endpoint = 'http://ip-api.com/json/%s';
            $response = wp_safe_remote_get(sprintf($service_endpoint, $ip_address), array('timeout' => 2));
            if (!is_wp_error($response) && $response['body']) {
                set_transient('multivendorx_' . $ip_address, json_decode($response['body']), 2 * MONTH_IN_SECONDS);
                return json_decode($response['body']);
            } else {
                $data = new \stdClass();
                $data->status = 'error';
                set_transient('multivendorx_' . $ip_address, $data, 2 * MONTH_IN_SECONDS);
                return $data;
            }
        }
    }

    /**
     * Save vistor stats for store.
     * 
     * @since 3.0.0
     * @param int $store_id
     * @param array $data
     */
    public function multivendorx_save_visitor_stats($store_id, $data) {
        global $wpdb;
        $wpdb->query(
                $wpdb->prepare(
                        "INSERT INTO `{$wpdb->prefix}" . Utill::TABLES['visitors_stats'] . "` 
                        ( store_id
                        , user_id
                        , user_cookie
                        , session_id
                        , ip
                        , lat
                        , lon
                        , city
                        , zip
                        , regionCode
                        , region
                        , countryCode
                        , country
                        , isp
                        , timezone
                        ) VALUES ( %d
                        , %d
                        , %s
                        , %s
                        , %s
                        , %s
                        , %s
                        , %s
                        , %s 
                        , %s
                        , %s
                        , %s
                        , %s
                        , %s
                        , %s
                        ) ON DUPLICATE KEY UPDATE `created` = now()"
                        , $store_id
                        , $data->user_id
                        , $data->user_cookie
                        , $data->session_id
                        , $data->query
                        , $data->lat
                        , $data->lon
                        , $data->city
                        , $data->zip
                        , $data->region
                        , $data->regionName
                        , $data->countryCode
                        , $data->country
                        , $data->isp
                        , $data->timezone
                )
        );
    }
}
