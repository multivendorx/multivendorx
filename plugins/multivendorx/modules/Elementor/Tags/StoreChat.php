<?php
namespace MultiVendorX\Elementor\Tags;
use Elementor\Core\DynamicTags\Tag;
use Elementor\Modules\DynamicTags\Module;

class StoreChat extends Tag {

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
        return 'multivendorx-store-chat-tag';
    }

    /**
     * Tag title
     *
     * @since 3.7
     *
     * @return string
     */
    public function get_title() {
        return __( 'Store Chat Button', 'multivendorx' );
    }

    public function get_group() {
        return 'multivendorx'; // must match group ID
    }

    public function get_categories() {
        return [ Module::TEXT_CATEGORY ];
    }


    /**
     * Render tag
     *
     * @since 3.7
     *
     * @return void
     */
    public function render() {
        if ( ! MultiVendorX()->modules->is_active( 'live-chat' ) ) {
            esc_html_e( 'Chat module is not active', 'multivendorx' );
            return;
        }
        return esc_html_e('Chat Now', 'multivendorx');
    }
}
