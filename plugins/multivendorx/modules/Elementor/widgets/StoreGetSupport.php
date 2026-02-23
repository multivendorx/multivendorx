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
        return [ 'multivendorx' ];
    }

    protected function register_controls() {
        parent::register_controls();

        $this->update_control(
            'text',
            [
                'default' => __( 'Get Support', 'multivendorx' ),
                'dynamic' => [
                    'active' => true,
                    'default' => '{{multivendorx-store-get-support-tag}}'
                ],
            ]
        );

        $this->update_control(
            'link',
            [
                'dynamic' => ['active' => false],
                'placeholder' => __( 'Triggers Support Modal', 'multivendorx' ),
            ]
        );
    }

    protected function render() {
        $store = $this->get_store_data();
        if (!$store) {
            return;
        }

        // Render a single button with a data attribute for store ID
        echo '<button class="multivendorx-livechat-button button" data-store-id="' . esc_attr($store['storeId']) . '">';
        echo esc_html(__('Get Support', 'multivendorx'));
        echo '</button>';
    }
}