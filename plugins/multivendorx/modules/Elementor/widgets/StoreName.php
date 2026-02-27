<?php
namespace MultiVendorX\Elementor\Widgets;

defined( 'ABSPATH' ) || exit;

use Elementor\Widget_Heading;
use MultiVendorX\Elementor\StoreHelper;

class Store_Name extends Widget_Heading {
    use StoreHelper;

    public function get_name() {
        return 'multivendorx_store_name';
    }

    public function get_title() {
        return __( 'Store Name', 'multivendorx' );
    }

    public function get_icon() {
        return 'eicon-store';
    }

    public function get_categories() {
        return array( 'multivendorx' );
    }

    protected function register_controls() {

        parent::register_controls();

        $dynamic_default = \Elementor\Plugin::instance()
            ->dynamic_tags
            ->tag_data_to_tag_text( null, 'multivendorx-store-name' );

        $this->update_control(
            'title',
            [
                'dynamic' => [
                    'default' => $dynamic_default,
                ],
            ],
            [
                'recursive' => true,
            ]
        );

        $this->update_control(
            'header_size',
            [
                'default' => 'h1',
            ]
        );

        $this->remove_control( 'link' );
    }

    protected function render() {
        $store = $this->get_store_data();
        if ( ! $store ) {
            return;
        }

        $settings = $this->get_settings_for_display();
        
        // 5. Logic: Use the dynamic store name
        $name = ! empty( $store['storeName'] ) ? $store['storeName'] : $settings['title'];

        $tag = $settings['header_size'];

        printf(
            '<%1$s class="multivendorx-store-name elementor-heading-title">%2$s</%1$s>',
            esc_attr( $tag ),
            esc_html( $name )
        );
    }
}