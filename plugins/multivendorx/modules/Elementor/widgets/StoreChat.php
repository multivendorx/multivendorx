<?php
namespace MultiVendorX\Elementor\Widgets;

defined( 'ABSPATH' ) || exit;

use Elementor\Widget_Button;
use MultiVendorX\Elementor\StoreHelper;

class Store_Chat_Button extends Widget_Button {

	use StoreHelper;

	public function get_name() {
		return 'multivendorx_store_chat';
	}

	public function get_title() {
		return __( 'Store Chat Button', 'multivendorx' );
	}

	public function get_icon() {
		return 'eicon-comments';
	}

	public function get_categories() {
		return [ 'multivendorx' ];
	}

	protected function register_controls() {
		parent::register_controls();


		$this->update_control(
			'text',
			[
				'default' => __( 'Chat with Vendor', 'multivendorx' ),
				'dynamic' => [
					'active' => true,
				],
			]
		);

		$this->update_control(
			'button_background_color',
			[
				'default' => '#17a2b8',
			]
		);

		$this->update_control(
			'link',
			[
				'dynamic' => [
					'active' => false,
					'default' => '{{multivendorx-store-chat-tag}}'
				],
				'placeholder' => __( 'Chat handled by logic', 'multivendorx' ),
			]
		);
	}

	protected function render() {
		$store = $this->get_store_data();
		if (!$store || !isset($store['storeId'])) {
			return;
		}

		do_action('multivendorx_render_livechat_button', $store['storeId'], $store['storeName']);
	}

}