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
        if ( get_query_var('store') ) {
        $store = $this->get_store_data();
           $store_tab_items = MultiVendorX()->store->storeutil->get_store_tabs( $store['storeId'] );
        } else {
            $store_tab_items = $this->get_store_tab_items();
        }
        
        $tab_items = [];

        foreach( $store_tab_items as $item_key => $item ) {
            $url = $item['url'];

            if ( empty( $url ) && ! $store_id ) {
                $url = '#';
            }

            $tab_items[] = [
                'key'         => $item['id'],
                'title'       => $item['title'],
                'text'        => $item['title'],
                'url'         => $url,
                'icon'        => '',
                'show'        => true,
                '__dynamic__' => [
                    'text' => $item['title'],
                    'url'  => $url,
                ]
            ];
        }

        return $tab_items;
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

    protected function render() {
        echo json_encode( $this->get_store_tab_items() );
    }
}
