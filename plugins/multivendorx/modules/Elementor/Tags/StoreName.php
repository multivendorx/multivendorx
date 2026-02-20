<?php
namespace MultiVendorX\Elementor\Tags;

use Elementor\Core\DynamicTags\Tag;
use Elementor\Modules\DynamicTags\Module;

class StoreName extends Tag {

    public function get_name() {
        return 'mvx-store-name';
    }

    public function get_title() {
        return __( 'Store Name', 'multivendorx' );
    }

    public function get_group() {
        return 'multivendorx'; // must match group ID
    }

    public function get_categories() {
        return array( Module::TEXT_CATEGORY );
    }

    public function render() {
        echo 'storeeee';
    }
}
