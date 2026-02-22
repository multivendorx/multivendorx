<?php
namespace MultiVendorX\Elementor\Tags;
use Elementor\Core\DynamicTags\Tag;
use Elementor\Modules\DynamicTags\Module;
use MultiVendorX\Elementor\StoreHelper;

class StoreInfo extends Tag {
    use StoreHelper;

    /**
     * Tag name
     *
     * @since 1.0.0
     *
     * @return string
     */
    public function get_name() {
        return 'multivendorx-store-info';
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
        return [ Module::TEXT_CATEGORY ];
    }

    /**
     * Render Tag
     *
     * @since 1.0.0
     *
     * @return void
     */
    protected function get_value() {
        $store_data = $this->get_store_data();        

        $store_info = [
            [
                'key'         => 'address',
                'title'       => __( 'Address', 'multivendorx' ),
                'text'        => $store_data['storeAddress'],
                'icon'        => 'mvx-font ico-location-icon',
                'show'        => true,
                '__dynamic__' => [
                    'text' => $store_data['storeAddress'],
                ]
            ],
            [
                'key'         => 'email',
                'title'       => __( 'Email', 'multivendorx' ),
                'text'        => $store_data['storeEmail'],
                'icon'        => 'mvx-font ico-mail-icon',
                'show'        => true,
                '__dynamic__' => [
                    'text' => $store_data['storeEmail'],
                ]
            ],
            [
                'key'         => 'phone',
                'title'       => __( 'Phone No', 'multivendorx' ),
                'text'        => $store_data['storePhone'],
                'icon'        => 'mvx-font ico-call-icon',
                'show'        => true,
                '__dynamic__' => [
                    'text' => $store_data['storePhone'],
                ]
            ],
            [
                'key'         => 'store_description',
                'title'       => __( 'Store Description', 'multivendorx' ),
                'text'        => $store_data['storeDescription'],
                'icon'        => 'mvx-font ico-location-icon',
                'show'        => true,
                '__dynamic__' => [
                    'text' => $store_data['storeDescription'],
                ]
            ],
        ];

        return apply_filters( 'multivendorx_elementor_tags_store_info_value', $store_info );
    }

    protected function render() {
        echo json_encode( $this->get_value() );
    }
}
