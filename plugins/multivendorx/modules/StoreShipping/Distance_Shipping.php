<?php
/**
 * MultiVendorX Distance Shipping Module
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\StoreShipping;

use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Distance Shipping Module.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Distance_Shipping extends \WC_Shipping_Method {


    /**
     * Constructor for the shipping class
     */
    public function __construct() {
        $this->id = 'multivendorx-distance-shipping';

        $shipping_modules        = MultiVendorX()->setting->get_setting( 'shipping_modules', array() );
        $distance_based_shipping = $shipping_modules['distance-based-shipping'] ?? array();

        // Enable / disable module.
        $this->enabled = ( ! empty( $distance_based_shipping['enable'] ) && $distance_based_shipping['enable'] )
            ? 'yes'
            : 'no';

        // Set title from module setting OR WooCommerce saved option.
        $this->title = $distance_based_shipping['distance_shipping_method_name']
            ?? $this->get_option( 'title' );

        if ( empty( $this->title ) ) {
            $this->title = __( 'Shipping Cost', 'multivendorx' );
        }

        // Taxable setting.
        $taxable_shipping = MultiVendorX()->setting->get_setting( 'taxable', array() );
        $this->tax_status = ( ! empty( $taxable_shipping ) && in_array( 'taxable', $taxable_shipping, true ) )
            ? 'taxable'
            : 'none';
    }
    /**
     * Override admin options to show a custom message instead of settings
     */
    public function admin_options() {
        // Dynamic URL to your MultiVendorX shipping settings.
        $url = admin_url( 'admin.php?page=multivendorx#&tab=settings&subtab=shipping' );
		?>
        <h2><?php echo esc_html( $this->method_title ); ?></h2>
        <p>
            <?php
            // Translation-ready message with a dynamic URL.
            echo wp_kses_post(
                sprintf(
                    /* translators: %s: URL to MultiVendorX shipping settings page */
                    __( 'This shipping method is fully managed in the <a href="%s" target="_blank">MultiVendorX Shipping Settings</a>.', 'multivendorx' ),
                    esc_url( $url )
                )
            );
            ?>
        </p>
		<?php
    }

    /**
     * Check if shipping is enabled
     */
    public function is_method_enabled() {
        return 'yes' === $this->enabled;
    }

    /**
     * Calculate shipping for each store
     *
     * @param array $package Array of package data.
     */
    public function calculate_shipping( $package = array() ) {

        if ( empty( $package['contents'] ) ) {
            return;
        }

        $store_id = (int) ( $package['store_id'] ?? 0 );
        if ( ! $store_id || ! self::is_shipping_enabled_for_seller( $store_id ) ) {
            return;
        }

        $products = $package['contents'];

        $user_lat = $package[ Utill::USER_SETTINGS_KEYS['multivendorx_user_location_lat'] ] ?? '';
        $user_lng = $package[ Utill::USER_SETTINGS_KEYS['multivendorx_user_location_lng'] ] ?? '';

        if ( ! $user_lat || ! $user_lng ) {
            return;
        }

        $store = new \MultiVendorX\Store\Store( $store_id );
        $meta  = $store->meta_data;

        $store_lat            = (float) ( $meta[ Utill::STORE_SETTINGS_KEYS['location_lat'] ] ?? 0 );
        $store_lng            = (float) ( $meta[ Utill::STORE_SETTINGS_KEYS['location_lng'] ] ?? 0 );
        $default_cost         = (float) ( $meta[ Utill::STORE_SETTINGS_KEYS['distance_default_cost'] ] ?? 0 );
        $max_distance         = (float) ( $meta[ Utill::STORE_SETTINGS_KEYS['distance_max'] ] ?? 0 );
        $local_pickup_cost    = (float) ( $meta[ Utill::STORE_SETTINGS_KEYS['distance_local_pickup_cost'] ] ?? 0 );
        $distance_type        = ( $meta[ Utill::STORE_SETTINGS_KEYS['distance_type'] ] ?? 'K' );
        $distance_rules       = ! empty( $meta[ Utill::STORE_SETTINGS_KEYS['distance_rules'] ] )
            ? json_decode( $meta[ Utill::STORE_SETTINGS_KEYS['distance_rules'] ], true )
            : array();

        if ( ! $store_lat || ! $store_lng ) {
            return;
        }

        $distance = self::multivendorx_get_latlng_distance(
            $user_lat,
            $user_lng,
            $store_lat,
            $store_lng,
            $distance_type
        );

        if ( ! $distance ) {
            return;
        }

        if ( $max_distance && $distance > $max_distance ) {
            static $notice_added = false;

            if ( ! $notice_added ) {
                wc_add_notice(
                    __( 'Some cart item(s) are not deliverable to your location.', 'multivendorx' ),
                    'error'
                );
                $notice_added = true;
            }

            return;
        }

        $store_amount = $this->calculate_per_seller(
            $products,
            $distance,
            $default_cost,
            $distance_rules,
            true
        );

        $tax_rate = ( 'none' === $this->tax_status ) ? false : '';
        $tax_rate = apply_filters( 'multivendorx_is_apply_tax_on_shipping_rates', $tax_rate );

        $label = ( $store_amount > 0 )
            ? $this->title
            : __( 'Free Shipping', 'multivendorx' );

        $this->add_rate(
            array(
				'id'    => $this->id . ':' . $store_id,
				'label' => $label,
				'cost'  => $store_amount,
				'taxes' => $tax_rate,
            )
        );

        $this->maybe_add_local_pickup_rate( $store_id, $local_pickup_cost, $tax_rate );
    }

    /**
     * Add local pickup rate
     *
     * @param int   $store_id Store ID.
     * @param float $local_pickup_cost Local pickup cost.
     * @param bool  $tax_rate Tax rate.
     */
    public function maybe_add_local_pickup_rate( $store_id, $local_pickup_cost = 0, $tax_rate = false ) {
        if ( ! $local_pickup_cost ) {
            return;
        }

        $rate = array(
            'id'    => 'local_pickup:' . $store_id,
            'label' => __( 'Pickup from Store', 'multivendorx' ),
            'cost'  => $local_pickup_cost,
            'taxes' => $tax_rate,
        );

        $this->add_rate( $rate );
    }

    /**
     * Check if shipping is enabled for a seller
     *
     * @param int $store_id Store ID.
     * @return bool
     */
    public static function is_shipping_enabled_for_seller( $store_id ) {
        $store            = new \MultiVendorX\Store\Store( $store_id );
        $shipping_options = $store->meta_data[ Utill::STORE_SETTINGS_KEYS['shipping_options'] ] ?? '';
        return Utill::STORE_SETTINGS_KEYS['shipping_by_distance'] === $shipping_options;
    }

    /**
     * Distance calculation (Haversine formula)
     *
     * @param float  $lat1 Latitude of point 1.
     * @param float  $lon1 Longitude of point 1.
     * @param float  $lat2 Latitude of point 2.
     * @param float  $lon2 Longitude of point 2.
     * @param string $unit Unit of distance ('M' for miles, 'K' for kilometers).
     * @return float
     */
    public static function multivendorx_get_latlng_distance( $lat1, $lon1, $lat2, $lon2, $unit = 'K' ) {
        // Normalize unit.
        $unit = strtoupper( $unit );
        if ( ! in_array( $unit, array( 'M', 'K' ), true ) ) {
            $unit = 'K'; // Safe default.
        }

        // Haversine formula.
        $theta = $lon1 - $lon2;
        $dist  = sin( deg2rad( $lat1 ) ) * sin( deg2rad( $lat2 ) )
            + cos( deg2rad( $lat1 ) ) * cos( deg2rad( $lat2 ) ) * cos( deg2rad( $theta ) );

        // Floating-point safety.
        $dist = min( 1, max( -1, $dist ) );

        $dist  = acos( $dist );
        $dist  = rad2deg( $dist );
        $miles = $dist * 60 * 1.1515;

        // Return unit-specific distance.
        return ( 'K' === $unit )
            ? $miles * 1.609344
            : $miles;
    }

    /**
     * Shipping cost calculation logic (unchanged)
     *
     * @param array $products Array of products.
     * @param float $total_distance Total distance.
     * @param float $default_cost Default cost.
     * @param array $distance_rules Array of distance rules.
     * @param bool  $is_consider_free_threshold Whether to consider free shipping threshold.
     * @return float
     */
    public function calculate_per_seller( $products = array(), $total_distance = 0, $default_cost = 0, $distance_rules = array(), $is_consider_free_threshold = false ) {
        $amount = floatval( $default_cost );

        $products_total_cost = 0;
        foreach ( $products as $product ) {
            $line_subtotal      = (float) $product['line_subtotal'];
            $line_total         = (float) $product['line_total'];
            $discount_total     = $line_subtotal - $line_total;
            $line_subtotal_tax  = (float) $product['line_subtotal_tax'];
            $line_total_tax     = (float) $product['line_tax'];
            $discount_tax_total = $line_subtotal_tax - $line_total_tax;

            $total = apply_filters( 'multivendorx_free_shipping_threshold_consider_tax', true ) ? $line_subtotal + $line_subtotal_tax : $line_subtotal;

            $products_total_cost += WC()->cart->display_prices_including_tax()
                ? round( $total - ( $discount_total + $discount_tax_total ), wc_get_price_decimals() )
                : round( $total - $discount_total, wc_get_price_decimals() );
        }

        if ( ! empty( $distance_rules ) ) {
            foreach ( $distance_rules as $rule ) {
                $max_distance = floatval( $rule['max_distance'] ?? 0 );
                $cost         = floatval( $rule['cost'] ?? 0 );

                if ( $total_distance <= $max_distance ) {
                    $amount += $cost;
                    break;
                }
            }
        }

        return apply_filters( 'multivendorx_shipping_distance_calculate_amount', $amount, $products, $total_distance, $default_cost, $distance_rules );
    }
}
