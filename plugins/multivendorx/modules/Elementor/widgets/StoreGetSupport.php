<?php
namespace MultiVendorX\Elementor\Widgets;

defined( 'ABSPATH' ) || exit;

use Elementor\Widget_Button;
use MultiVendorX\Elementor\StoreHelper;

class Store_Get_Support extends Widget_Button {

    use StoreHelper;

    public function get_name() {
        return 'multivendorx_store_get_support';
    }

    public function get_title() {
        return __( 'Store Get Support Button', 'multivendorx' );
    }

    public function get_icon() {
        return 'eicon-help-solid';
    }

    public function get_categories() {
        return array( 'multivendorx' );
    }

    protected function register_controls() {
        parent::register_controls();

        $this->update_control(
            'text',
            array(
                'default' => __( 'Get Support', 'multivendorx' ),
                'dynamic' => array(
                    'active' => true,
                ),
            )
        );

        $this->update_control(
            'link',
            array(
                'dynamic'     => array( 'active' => false ),
                'placeholder' => __( 'Triggers Support Modal', 'multivendorx' ),
            )
        );
    }

    protected function render() {
        $store = $this->get_store_data();
        if (!$store) {
            return;
        }

        $settings = $this->get_settings_for_display();

        // Store name
        $name = !empty($store['storeName']) ? $store['storeName'] : $settings['title'];
        $tag  = !empty($settings['header_size']) ? $settings['header_size'] : 'h2';

        printf(
            '<%1$s class="multivendorx-store-name elementor-heading-title">%2$s</%1$s>',
            esc_attr($tag),
            esc_html($name)
        );

        // Render a single button with a data attribute for store ID
        echo '<button class="multivendorx-livechat-button button" data-store-id="' . esc_attr($store['storeId']) . '">';
        echo esc_html(__('Get Support', 'multivendorx'));
        echo '</button>';
    }
}