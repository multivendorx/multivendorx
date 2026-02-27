<?php
namespace MultiVendorX\Elementor\Tags;
use Elementor\Core\DynamicTags\Tag;
use Elementor\Modules\DynamicTags\Module;
use MultiVendorX\Elementor\StoreHelper;

class StoreTabs extends Tag {
    use StoreHelper;

    /**
     * Tag name
     *
     * @since 1.0.0
     *
     * @return string
     */
    public function get_name() {
        return 'multivendorx-store-tabs';
    }

    /**
     * Tag title
     *
     * @since 1.0.0
     *
     * @return string
     */
    public function get_title() {
        return __( 'Store Tabs', 'multivendorx' );
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

        if ( get_query_var( 'store' ) ) {
            $store = $this->get_store_data();
            $store_tab_items = MultiVendorX()->store->storeutil->get_store_tabs( $store['storeId'] );
        } else {
            $store_tab_items = $this->get_store_tab_items();
        }

        $tab_items = [];

        foreach ( $store_tab_items as $item ) {

            $url = ! empty( $item['url'] ) ? $item['url'] : '#';

            $tab_items[] = [
                'text' => $item['title'],

                // IMPORTANT: Icon List expects this format
                'link' => [
                    'url' => $url,
                    'is_external' => false,
                    'nofollow' => false,
                ],

                // Disable icon properly
                'selected_icon' => [
                    'value' => '',
                    'library' => '',
                ],
            ];
        }

        return $tab_items;
    }
    
    protected function render() {
        $value = $this->get_value();

        if ( empty( $value ) ) {
            return;
        }

        echo wp_json_encode( $value );
    }

    /**
     * Store tab items for Elementor Builder
     *
     * @since 2.9.14
     *
     * @return array
     */
    protected function get_store_tab_items() {
        return [
            [
                'id'              => 'products',
                'title' => __( 'Products', 'multivendorx' ),
                'show'        => true,
                'url'   => '#',
            ],
            [
                'id'              => 'policies',
                'title' => __( 'Policies', 'multivendorx' ),
                'show'        => true,
                'url'   => '#',
            ],
            [
                'id'              => 'reviews',
                'title' => __( 'Reviews', 'multivendorx' ),
                'show'        => true,
                'url'   => '#'
            ],
        ];
    }

}
