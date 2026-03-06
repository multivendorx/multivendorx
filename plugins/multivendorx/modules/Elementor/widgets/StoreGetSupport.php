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
                'dynamic'   => [
                    'default' => \Elementor\Plugin::instance()
											->dynamic_tags
											->tag_data_to_tag_text(null, 'multivendorx-store-get-support-tag'),
                    'active'  => true,
                ],
                'selectors' => [
                    '{{WRAPPER}} > .elementor-widget-container > .elementor-button-wrapper > .mvx-store-get-support-btn' => 'width: auto; margin: 0;',
                ]
            ]
        );
    }

    protected function render() {
        $store = $this->get_store_data();
        if (!$store) {
            return;
        }

        echo '<button>';
        echo esc_html(__('Get Support', 'multivendorx'));
        echo '</button>';
    }
}