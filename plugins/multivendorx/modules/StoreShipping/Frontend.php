<?php
/**
 * MultiVendorX Frontend class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\StoreShipping;

use MultiVendorX\FrontendScripts;
use MultiVendorX\Utill;

/**
 * MultiVendorX Store Review Frontend class
 *
 * @class       Frontend class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Frontend {

    /**
     * Frontend class constructor function
     */
    public function __construct() {
        add_filter( 'multivendorx_store_shipping_options', array( $this, 'add_shipping_options' ) );

        // Checkout fields and map.
        add_filter( 'woocommerce_checkout_fields', array( $this, 'multivendorx_checkout_user_location_fields' ), 50 );
        add_action( 'woocommerce_after_checkout_billing_form', array( $this, 'multivendorx_checkout_user_location_map' ), 50 );

        // // Save session & order meta.
        add_action( 'woocommerce_checkout_update_order_review', array( $this, 'multivendorx_checkout_user_location_session_set' ), 50 );
        add_action( 'woocommerce_checkout_update_order_meta', array( $this, 'multivendorx_checkout_user_location_save' ), 50 );

        add_filter( 'multivendorx_register_scripts', array( $this, 'register_script' ) );
        add_filter( 'multivendorx_localize_scripts', array( $this, 'localize_scripts' ) );
        // // Load Google Maps JS.
        add_action( 'wp_enqueue_scripts', array( $this, 'load_scripts' ) );
        add_filter( 'woocommerce_cart_shipping_packages', array( $this, 'add_user_location_to_shipping_package' ) );
    }

    public function register_script( $scripts ) {
        $base_url = MultiVendorX()->plugin_url . FrontendScripts::get_build_path_name();

        $scripts['multivendorx-store-shipping-frontend-script'] = array(
            'src'     => $base_url . 'modules/StoreShipping/js/' . MULTIVENDORX_PLUGIN_SLUG . '-frontend.min.js',
            'deps'    => array( 'jquery' ),
        );

        return $scripts;
    }

    public function localize_scripts( $scripts ) {

        $scripts['multivendorx-store-shipping-frontend-script'] = array(
            'object_name' => 'distanceShippingFrontend',
            'use_ajax'    => true,
            'data'        => array(
                'default_lat'  => MultiVendorX()->setting->get_setting( 'default_map_lat', '28.6139' ), // Example default lat.
                'default_lng'  => MultiVendorX()->setting->get_setting( 'default_map_lng', '77.2090' ), // Example default lng.
                'default_zoom' => 13,
                'store_icon'   => plugin_dir_url( __FILE__ ) . 'assets/images/store-icon.png',
                'icon_width'   => 40,
                'icon_height'  => 40,
                'mapbox_token' => MultiVendorX()->setting->get_setting( 'mapbox_api_key', '' ),
                'mapbox_style' => 'mapbox://styles/mapbox/streets-v11',
                'map_provider' => MultiVendorX()->setting->get_setting( 'choose_map_api', '' ),
            ),
        );

        return $scripts;
    }

    /**
     * Add shipping options without changing existing ones
     *
     * @param array $existing_options Existing shipping options.
     * @return array
     */
    public function add_shipping_options( $existing_options ) {

        // Get all shipping module settings.
        $settings = MultiVendorX()->setting->get_setting( 'shipping_modules' );

        // Check if country-wise shipping is enabled.
        $country_shipping_enabled = isset( $settings['country-wise-shipping']['enable'] )
            ? $settings['country-wise-shipping']['enable']
            : false;

        // Only add if country-wise shipping is enabled.
        if ( $country_shipping_enabled ) {
            $new_options = array(
                (object) array(
                    'key'   => 'shipping_by_country',
                    'label' => __( 'Shipping by Country', 'multivendorx' ),
                    'value' => 'shipping_by_country',
                ),
            );

            // Merge with existing options without overwriting.
            $existing_options = array_merge( $existing_options, $new_options );
        }

        $distance_based_shipping = isset( $settings['distance-based-shipping']['enable'] )
            ? $settings['distance-based-shipping']['enable']
            : false;

        // Only add if country-wise shipping is enabled.
        if ( $distance_based_shipping ) {
            $new_options = array(
                (object) array(
                    'key'   => 'shipping_by_distance',
                    'label' => __( 'Shipping by Distance', 'multivendorx' ),
                    'value' => 'shipping_by_distance',
                ),
            );

            // Merge with existing options without overwriting.
            $existing_options = array_merge( $existing_options, $new_options );
        }

        $zone_wise_shipping = isset( $settings['zone-wise-shipping']['enable'] )
            ? $settings['zone-wise-shipping']['enable']
            : false;

        // Only add if country-wise shipping is enabled.
        if ( $zone_wise_shipping ) {
            $new_options = array(
                (object) array(
                    'key'   => 'shipping_by_zone',
                    'label' => __( 'Shipping by Zone', 'multivendorx' ),
                    'value' => 'shipping_by_zone',
                ),
            );

            // Merge with existing options without overwriting.
            $existing_options = array_merge( $existing_options, $new_options );
        }

        // Return existing options if module not enabled.
        return $existing_options;
    }

    /**
     * Add user location fields to checkout
     *
     * @param array $fields Checkout fields.
     * @return array
     */
    public function multivendorx_checkout_user_location_fields( $fields ) {

        // show ONLY when distance-based shipping is used.
        if (
            WC()->cart->needs_shipping()
            && apply_filters( 'mvx_is_allow_checkout_user_location', true )
            && $this->cart_has_distance_shipping()
        ) {
            $fields['billing']['multivendorx_user_location'] = array(
                'label'       => __( 'Delivery Location', 'multivendorx' ),
                'placeholder' => _x( 'Insert your address ..', 'placeholder', 'multivendorx' ),
                'required'    => true,
                'class'       => array( 'form-row-wide' ),
                'clear'       => true,
                'priority'    => 999,
                'value'       => WC()->session->get( '_multivendorx_user_location' ),
                'type'        => 'text',
                'name'        => 'multivendorx_user_location',
            );

            $fields['billing']['multivendorx_user_location_lat'] = array(
                'required' => false,
                'class'    => array( 'input-hidden' ),
                'value'    => WC()->session->get( '_multivendorx_user_location_lat' ),
                'type'     => 'hidden',
                'name'     => 'multivendorx_user_location_lat',
            );

            $fields['billing']['multivendorx_user_location_lng'] = array(
                'required' => false,
                'class'    => array( 'input-hidden' ),
                'value'    => WC()->session->get( '_multivendorx_user_location_lng' ),
                'type'     => 'hidden',
                'name'     => 'multivendorx_user_location_lng',
            );
        }

        return $fields;
    }

    /**
     * Add map to checkout page
     */
    public function multivendorx_checkout_user_location_map() {
        if ( ( true === WC()->cart->needs_shipping() ) && apply_filters( 'mvx_is_allow_checkout_user_location', true ) ) {
            echo '<div class="woocommerce-billing-fields__field-wrapper">';
            echo '<div id="mvx-user-locaton-map" style="width:100%; height:18.75rem; margin-bottom:1.25rem;"></div>';
            echo '</div>';
			?>
            <style>
                /*Ensure map always visible even if inline CSS fails */
                #mvx-user-locaton-map {
                    width: 100%;
                    min-height: 18.75rem;
                    margin-bottom: 1.25rem;
                }
            </style>
			<?php
        }
    }

    /**
     * Set user location to session
     *
     * @param string $post_data_raw POST data.
     */
    public function multivendorx_checkout_user_location_session_set( $post_data_raw ) {
        parse_str( $post_data_raw, $post_data );
        if ( ! empty( $post_data['multivendorx_user_location'] ) ) {
            WC()->session->set( '_multivendorx_user_location', sanitize_text_field( $post_data['multivendorx_user_location'] ) );
        }
        if ( ! empty( $post_data['multivendorx_user_location_lat'] ) ) {
            WC()->session->set( '_multivendorx_user_location_lat', sanitize_text_field( $post_data['multivendorx_user_location_lat'] ) );
        }
        if ( ! empty( $post_data['multivendorx_user_location_lng'] ) ) {
            WC()->session->set( '_multivendorx_user_location_lng', sanitize_text_field( $post_data['multivendorx_user_location_lng'] ) );
        }
    }

    /**
     * Save user location to order meta
     *
     * @param int $order_id Order ID.
     */
    public function multivendorx_checkout_user_location_save( $order_id ) {
        $order = wc_get_order( $order_id );

        if ( ! empty( filter_input( INPUT_POST, 'multivendorx_user_location', FILTER_SANITIZE_SPECIAL_CHARS ) ) ) {
            $order->update_meta_data( '_multivendorx_user_location', sanitize_text_field( $location ) );
        }
        if ( ! empty( filter_input( INPUT_POST, 'multivendorx_user_location_lat', FILTER_SANITIZE_SPECIAL_CHARS ) ) ) {
            $order->update_meta_data( '_multivendorx_user_location_lat', sanitize_text_field( $location_lat ) );
        }
        if ( ! empty( filter_input( INPUT_POST, 'multivendorx_user_location_lng', FILTER_SANITIZE_SPECIAL_CHARS ) ) ) {
            $order->update_meta_data( '_multivendorx_user_location_lng', sanitize_text_field( $location_lng ) );
        }
        $order->save();
    }

    /**
     * Load frontend scripts
     */
    public function load_scripts() {
        $settings         = MultiVendorX()->setting->get_setting( 'shipping_modules', array() );
        $distance_enabled = $settings['distance-based-shipping']['enable'] ?? false;

        if ( ! $distance_enabled || ! $this->cart_has_distance_shipping() ) {
            return;
        }

        $provider = MultiVendorX()->setting->get_setting( 'choose_map_api', '' );

        // GOOGLE MAPS.
        if ( 'google_map_set' === $provider ) {
            $google_maps_api_key = MultiVendorX()->setting->get_setting( 'google_api_key', '' );
            if ( $google_maps_api_key ) {
                wp_enqueue_script(
                    'google-maps',
                    'https://maps.googleapis.com/maps/api/js?key=' . $google_maps_api_key . '&libraries=places',
                    array(),
                    'weekly',
                    true
                );
            }
        }

        // MAPBOX.
        if ( 'mapbox_api_set' === $provider ) {
            wp_enqueue_script(
                'mapbox-gl',
                'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js',
                array(),
                '2.15.0',
                true
            );

            wp_enqueue_style(
                'mapbox-gl-css',
                'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css',
                array(),
                '2.15.0'
            );
        }

        FrontendScripts::load_scripts();
        FrontendScripts::enqueue_script( 'multivendorx-store-shipping-frontend-script' );
        FrontendScripts::localize_scripts( 'multivendorx-store-shipping-frontend-script' );
    }


    /**
     * Inject user location into shipping packages
     *
     * @param array $packages Shipping packages.
     */
    public function add_user_location_to_shipping_package( $packages ) {
        foreach ( $packages as $i => $package ) {
            $packages[ $i ]['multivendorx_user_location']     = WC()->session->get( '_multivendorx_user_location' );
            $packages[ $i ]['multivendorx_user_location_lat'] = WC()->session->get( '_multivendorx_user_location_lat' );
            $packages[ $i ]['multivendorx_user_location_lng'] = WC()->session->get( '_multivendorx_user_location_lng' );
        }
        return $packages;
    }

    /**
     * Check if any product in cart belongs to a vendor using distance-based shipping.
     */
    public function cart_has_distance_shipping() {
        if ( empty( WC()->cart ) ) {
            return false;
        }

        foreach ( WC()->cart->get_cart() as $cart_item ) {
            $product_id = $cart_item['product_id'];
            $store_id   = get_post_meta( $product_id, Utill::POST_META_SETTINGS['store_id'], true );

            if ( $store_id ) {
                $store         = new \MultiVendorX\Store\Store( $store_id );
                $shipping_type = $store->meta_data['shipping_options'] ?? '';

                if ( 'shipping_by_distance' === $shipping_type ) {
                    return true;
                }
            }
        }
        return false;
    }
}
