<?php
namespace MultiVendorX\Elementor\Tags;

use Elementor\Core\DynamicTags\Tag;
use Elementor\Modules\DynamicTags\Module;

class StoreGetSupport extends Tag {

    /**
     * Class constructor
     *
     * @since 3.7
     *
     * @param array $data
     */
    public function __construct( $data = array() ) {
        parent::__construct( $data );
    }

    /**
     * Tag name
     *
     * @since 3.7
     *
     * @return string
     */
    public function get_name() {
        return 'mvx-store-get-support-tag';
    }

    public function get_group() {
        return 'multivendorx'; // must match group ID
    }

    public function get_categories() {
        return array( Module::TEXT_CATEGORY );
    }

    /**
     * Tag title
     *
     * @since 3.7
     *
     * @return string
     */
    public function get_title() {
        return __( 'Store Get Support Button', 'multivendorx' );
    }

    /**
     * Render tag
     *
     * @since 3.7
     *
     * @return void
     */
    public function render() {
    	global $MVX;
        // if (mvx_is_store_page()) {
        	echo esc_html_e( 'Get Support', 'multivendorx' );
        // } else {
        // return;
        // }
    }
}
