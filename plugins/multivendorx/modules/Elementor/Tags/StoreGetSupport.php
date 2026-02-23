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
    public function __construct( $data = [] ) {
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
        return 'multivendorx-store-get-support-tag';
    }

    public function get_group() {
        return 'multivendorx'; // must match group ID
    }

    public function get_categories() {
        return [ Module::TEXT_CATEGORY ];
    }

    /**
     * Tag title
     *
     * @since 3.7
     *
     * @return string
     */
    public function get_title() {
        return __('Store Get Support Button', 'multivendorx');
    }

    /**
     * Render tag
     *
     * @since 3.7
     *
     * @return void
     */
    public function render() {
        if (get_query_var( MultiVendorX()->setting->get_setting( 'store_url', 'store' ) )) {
        	echo esc_html_e('Get Support', 'multivendorx');
        } else {
            return;
        }
    }
}
