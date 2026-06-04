<?php
/**
 * Store Name Elementor Widget
 *
 * @package MultiVendorX\Elementor\Widgets
 */

namespace MultiVendorX\Elementor\Widgets;

defined( 'ABSPATH' ) || exit;

use Elementor\Widget_Heading;
use MultiVendorX\Elementor\StoreHelper;

/**
 * Store Name widget class
 *
 * Displays the store name in Elementor
 */
class StoreName extends Widget_Heading {
    use StoreHelper;

    /**
     * Get widget name
     *
     * @return string
     */
    public function get_name() {
        return 'multivendorx_store_name';
    }

    /**
     * Get widget title
     *
     * @return string
     */
    public function get_title() {
        return __( 'Store Name', 'multivendorx' );
    }

    /**
     * Get widget icon
     *
     * @return string
     */
    public function get_icon() {
        return 'eicon-heading';
    }

    /**
     * Get widget categories
     *
     * @return array
     */
    public function get_categories() {
        return array( 'multivendorx' );
    }

    /**
     * Register widget controls
     *
     * @return void
     */
    protected function register_controls() {

        parent::register_controls();

        $dynamic_default = \Elementor\Plugin::instance()
            ->dynamic_tags
            ->tag_data_to_tag_text( null, 'multivendorx-store-name' );

        $this->update_control(
            'title',
            array(
                'dynamic' => array(
                    'default' => $dynamic_default,
                ),
            ),
            array(
                'recursive' => true,
            )
        );

        $this->update_control(
            'header_size',
            array(
                'default' => 'h1',
            )
        );

        $this->remove_control( 'link' );
    }

    /**
     * Render widget output
     *
     * @return void
     */
    protected function render() {
        $store = $this->get_store_data();
        if ( ! $store ) {
            return;
        }

        $settings = $this->get_settings_for_display();

        $name = ! empty( $store['storeName'] ) ? $store['storeName'] : $settings['title'];

        $tag = $settings['header_size'];

        printf(
            '<%1$s class="multivendorx-store-name elementor-heading-title">%2$s</%1$s>',
            esc_attr( $tag ),
            esc_html( $name )
        );
    }
}
