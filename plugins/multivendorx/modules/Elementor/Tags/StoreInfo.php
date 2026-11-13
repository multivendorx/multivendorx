<?php
/**
 * Elementor Dynamic Tag: Store Info
 *
 * Provides store information (address, email, phone) for use in Elementor dynamic tags.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Elementor\Tags;

use Elementor\Core\DynamicTags\Tag;
use Elementor\Modules\DynamicTags\Module;
use MultiVendorX\Elementor\StoreHelper;

defined( 'ABSPATH' ) || exit;

/**
 * StoreInfo Dynamic Tag.
 *
 * Retrieves store address, email, and phone for Elementor.
 */
class StoreInfo extends Tag {
    use StoreHelper;

    /**
     * Tag name (unique identifier).
     *
     * @return string
     */
    public function get_name() {
        return 'multivendorx-store-info';
    }

    /**
     * Tag title (display name).
     *
     * @return string
     */
    public function get_title() {
        return __( 'Store Info', 'multivendorx' );
    }

    /**
     * Tag group ID.
     *
     * @return string
     */
    public function get_group() {
        return 'multivendorx';
    }

    /**
     * Tag categories.
     *
     * @return array
     */
    public function get_categories() {
        return array( Module::TEXT_CATEGORY );
    }

    /**
     * Retrieve store info value.
     *
     * Returns structured array of store address, email, and phone.
     *
     * @return array
     */
    protected function get_value() {
        $store_data = $this->get_store_data();

        $store_info = array(
            array(
                'key'         => 'address',
                'title'       => __( 'Address', 'multivendorx' ),
                'text'        => $store_data['storeAddress'],
                'icon'        => 'multivendorx-font ico-location-icon',
                'show'        => true,
                '__dynamic__' => array(
                    'text' => $store_data['storeAddress'],
                ),
            ),
            array(
                'key'         => 'email',
                'title'       => __( 'Email', 'multivendorx' ),
                'text'        => $store_data['storeEmail'],
                'icon'        => 'multivendorx-font ico-mail-icon',
                'show'        => true,
                '__dynamic__' => array(
                    'text' => $store_data['storeEmail'],
                ),
            ),
            array(
                'key'         => 'phone',
                'title'       => __( 'Phone No.', 'multivendorx' ),
                'text'        => $store_data['storePhone'],
                'icon'        => 'multivendorx-font ico-call-icon',
                'show'        => true,
                '__dynamic__' => array(
                    'text' => $store_data['storePhone'],
                ),
            ),
        );

        return apply_filters( 'multivendorx_elementor_tags_store_info_value', $store_info );
    }

    /**
     * Render tag output.
     *
     * @return void
     */
    protected function render() {
        echo wp_json_encode( $this->get_value() );
    }
}
