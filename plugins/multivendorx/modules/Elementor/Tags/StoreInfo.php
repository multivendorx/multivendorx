<?php
namespace MultiVendorX\Elementor\Tags;

use Elementor\Core\DynamicTags\Tag;
use Elementor\Modules\DynamicTags\Module;

use Elementor\Controls_Manager;

class StoreInfo extends Tag {

    /**
     * Tag name
     *
     * @since 1.0.0
     *
     * @return string
     */
    public function get_name() {
        return 'mvx-store-info';
    }

    /**
     * Tag title
     *
     * @since 1.0.0
     *
     * @return string
     */
    public function get_title() {
        return __( 'Store Info', 'multivendorx' );
    }

    public function get_group() {
        return 'multivendorx'; // must match group ID
    }

    public function get_categories() {
        return array( Module::TEXT_CATEGORY );
    }

    /**
     * Render Tag
     *
     * @since 1.0.0
     *
     * @return void
     */
    protected function get_value() {
    	// global $mvx_elementor;
        // $store_data = $mvx_elementor->get_mvx_store_data();

        // $store_info = [
        // [
        // 'key'         => 'address',
        // 'title'       => __( 'Address', 'multivendorx' ),
        // 'text'        => $store_data['address'],
        // 'icon'        => 'mvx-font ico-location-icon',
        // 'show'        => true,
        // '__dynamic__' => [
        // 'text' => $store_data['address'],
        // ]
        // ],
        // [
        // 'key'         => 'email',
        // 'title'       => __( 'Email', 'multivendorx' ),
        // 'text'        => $store_data['email'],
        // 'icon'        => 'mvx-font ico-mail-icon',
        // 'show'        => true,
        // '__dynamic__' => [
        // 'text' => $store_data['email'],
        // ]
        // ],
        // [
        // 'key'         => 'phone',
        // 'title'       => __( 'Phone No', 'multivendorx' ),
        // 'text'        => $store_data['phone'],
        // 'icon'        => 'mvx-font ico-call-icon',
        // 'show'        => true,
        // '__dynamic__' => [
        // 'text' => $store_data['phone'],
        // ]
        // ],
        // [
        // 'key'         => 'store_description',
        // 'title'       => __( 'Store Description', 'multivendorx' ),
        // 'text'        => $store_data['store_description'],
        // 'icon'        => 'mvx-font ico-location-icon',
        // 'show'        => true,
        // '__dynamic__' => [
        // 'text' => $store_data['store_description'],
        // ]
        // ],
        // ];

        // return apply_filters( 'mvx_elementor_tags_store_info_value', $store_info );
        return array();
    }

    protected function render() {
        // echo json_encode( $this->get_value() );
        echo 'hellooooo';
    }
}
