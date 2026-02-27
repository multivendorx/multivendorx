<?php
namespace MultiVendorX\Elementor\Widgets;

defined( 'ABSPATH' ) || exit;

use Elementor\Widget_Button;
use MultiVendorX\Elementor\StoreHelper;

class Store_Follow_Button extends Widget_Button {

	use StoreHelper;

	public function get_name() {
		return 'multivendorx_store_follow';
	}

	public function get_title() {
		return __( 'Store Follow Button', 'multivendorx' );
	}

	public function get_icon() {
		return 'eicon-person';
	}

	public function get_categories() {
		return [ 'multivendorx' ];
	}

	protected function register_controls() {
		parent::register_controls();
        
        $this->update_control(
            'icon_align',
            [
                'default' => 'left',
            ]
        );

        $this->update_control(
            'button_text_color',
            [
                'default' => '#ffffff',
            ]
        );

        $this->update_control(
            'background_color',
            [
                'default' => '#17a2b8',
            ]
        );

        $this->update_control(
            'border_color',
            [
                'default' => '#17a2b8',
            ]
        );

        $this->update_control(
            'text',
            [
                'dynamic'   => [
                    'default' => \Elementor\Plugin::instance()
											->dynamic_tags
											->tag_data_to_tag_text( null, 'multivendorx-store-follow-tag' ),
                    'active'  => true,
                ],
                'selectors' => [
                    '{{WRAPPER}} > .elementor-widget-container > .elementor-button-wrapper > .mvx-store-follow-btn' => 'width: auto; margin: 0;',
                ]
            ]
        );
	}

	protected function render() {
		$store = $this->get_store_data();
        if ( ! $store ) {
            return;
        }

        $store = $this->get_store_data();
        $store_id = ! empty( $store['storeId'] ) ? $store['storeId'] : '';
        
        if ( !empty($store_id) ) {
            $customer_follow_store = get_user_meta( get_current_user_id(), 'multivendorx_following_stores', true ) ?? array();
            $store_lists = !empty($customer_follow_store) ? wp_list_pluck( $customer_follow_store, 'user_id' ) : array();
            $follow_status = in_array($store_id, $store_lists) ? __( 'Unfollow', 'multivendorx' ) : __( 'Follow', 'multivendorx' );
        } 
		
        $this->add_render_attribute( 'button', 'data-store_id', $store_id );
        $this->add_render_attribute( 'button', 'data-status', $follow_status ?? '' );			
		
        parent::render();

	}
}