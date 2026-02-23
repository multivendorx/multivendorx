<?php
namespace MultiVendorX\Elementor\Tags;

use Elementor\Core\DynamicTags\Tag;
use Elementor\Modules\DynamicTags\Module;
use MultiVendorX\Elementor\StoreHelper;

class StoreName extends Tag {
    use StoreHelper;

    public function get_name() {
        return 'multivendorx-store-name';
    }

    public function get_title() {
        return __( 'Store Name', 'multivendorx' );
    }

    public function get_group() {
        return 'multivendorx'; // must match group ID
    }

    public function get_categories() {
        return [ Module::TEXT_CATEGORY ];
    }

    public function render() {
        $store = $this->get_store_data();
        if ( ! $store ) {
            return;
        }

        $settings = $this->get_settings_for_display();
        
        $name = ! empty( $store['storeName'] ) ? $store['storeName'] : $settings['title'];
        echo $name;
    }
}
