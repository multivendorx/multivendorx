<?php
/**
 * Store Info Elementor Widget.
 *
 * Displays store contact details such as address, email, and phone.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Elementor\Widgets;

defined( 'ABSPATH' ) || exit;

use Elementor\Widget_Icon_List;
use Elementor\Controls_Manager;
use Elementor\Icons_Manager;
use MultiVendorX\Elementor\StoreHelper;

/**
 * Class Store_Info
 *
 * Elementor widget to display MultiVendorX store information.
 */
class StoreInfo extends Widget_Icon_List {

	use StoreHelper;

	/**
	 * Widget slug/name.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'multivendorx_store_info';
	}

	/**
	 * Widget title.
	 *
	 * @return string
	 */
	public function get_title() {
		return __( 'Store Info', 'multivendorx' );
	}

	/**
	 * Widget icon.
	 *
	 * @return string
	 */
	public function get_icon() {
		return 'eicon-bullet-list';
	}

	/**
	 * Widget categories.
	 *
	 * @return array
	 */
	public function get_categories() {
		return array( 'multivendorx' );
	}

	/**
	 * Widget keywords.
	 *
	 * @return array
	 */
	public function get_keywords() {
		return array( 'multivendorx', 'store', 'info', 'address', 'location', 'phone', 'email' );
	}

	/**
	 * Register widget controls.
	 */
	protected function register_controls() {
		parent::register_controls();

		$this->update_control(
			'icon_list',
			array(
				'type'    => Controls_Manager::HIDDEN,
				'default' => array(),
			)
		);

		$this->update_control(
			'section_icon',
			array(
				'label' => __( 'Store Info Details', 'multivendorx' ),
			)
		);

		$this->start_controls_section(
			'store_info_settings',
			array(
				'label' => __( 'Store Info Visibility', 'multivendorx' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			)
		);

		$this->add_control(
			'show_address',
			array(
				'label'        => __( 'Show Address', 'multivendorx' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => __( 'Show', 'multivendorx' ),
				'label_off'    => __( 'Hide', 'multivendorx' ),
				'return_value' => 'yes',
				'default'      => 'yes',
			)
		);

		$this->add_control(
			'show_email',
			array(
				'label'        => __( 'Show Email', 'multivendorx' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => __( 'Show', 'multivendorx' ),
				'label_off'    => __( 'Hide', 'multivendorx' ),
				'return_value' => 'yes',
				'default'      => 'yes',
			)
		);

		$this->add_control(
			'show_phone',
			array(
				'label'        => __( 'Show Phone', 'multivendorx' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => __( 'Show', 'multivendorx' ),
				'label_off'    => __( 'Hide', 'multivendorx' ),
				'return_value' => 'yes',
				'default'      => 'yes',
			)
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_icon_style',
			array(
				'label' => __( 'Icon', 'multivendorx' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_control(
			'icon_color',
			array(
				'label'     => __( 'Color', 'multivendorx' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '',
				'selectors' => array(
					'{{WRAPPER}} .elementor-icon-list-icon i'   => 'color: {{VALUE}};',
					'{{WRAPPER}} .elementor-icon-list-icon svg' => 'fill: {{VALUE}};',
				),
			)
		);

		$this->add_responsive_control(
			'icon_size',
			array(
				'label'     => __( 'Size', 'multivendorx' ),
				'type'      => Controls_Manager::SLIDER,
				'default'   => array(
					'size' => 14,
				),
				'range'     => array(
					'px' => array(
						'min' => 6,
					),
				),
				'selectors' => array(
					'{{WRAPPER}} .elementor-icon-list-icon'   => 'width: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .elementor-icon-list-icon i' => 'font-size: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .elementor-icon-list-icon svg' => 'width: {{SIZE}}{{UNIT}}; height: {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Get store info items.
	 *
	 * @return array
	 */
	private function get_store_info_items() {
		$store_data = $this->get_store_data();
		if ( empty( $store_data ) ) {
			return array();
		}

		$settings = $this->get_settings_for_display();
		$items    = array();

		if ( isset( $settings['show_address'] ) && 'yes' === $settings['show_address'] && ! empty( $store_data['storeAddress'] ) ) {
			$items[] = array(
				'text' => $store_data['storeAddress'],
				'icon' => array(
					'value'   => 'fas fa-map-marker-alt',
					'library' => 'fa-solid',
				),
				'link' => false,
				'_id'  => uniqid( 'address_', true ),
			);
		}

		if ( isset( $settings['show_email'] ) && 'yes' === $settings['show_email'] && ! empty( $store_data['storeEmail'] ) ) {
			$items[] = array(
				'text' => $store_data['storeEmail'],
				'icon' => array(
					'value'   => 'fas fa-envelope',
					'library' => 'fa-solid',
				),
				'link' => array(
					'url' => 'mailto:' . $store_data['storeEmail'],
				),
				'_id'  => uniqid( 'email_', true ),
			);
		}

		if ( isset( $settings['show_phone'] ) && 'yes' === $settings['show_phone'] && ! empty( $store_data['storePhone'] ) ) {
			$items[] = array(
				'text' => $store_data['storePhone'],
				'icon' => array(
					'value'   => 'fas fa-phone-alt',
					'library' => 'fa-solid',
				),
				'link' => array(
					'url' => 'tel:' . preg_replace( '/\s+/', '', $store_data['storePhone'] ),
				),
				'_id'  => uniqid( 'phone_', true ),
			);
		}

		return $items;
	}

	/**
	 * Render widget output on the frontend.
	 */
	protected function render() {
		$items = $this->get_store_info_items();
		if ( empty( $items ) ) {
			return;
		}

		$this->add_render_attribute( 'wrapper', 'class', 'elementor-icon-list-items elementor-inline-items' );

		?>
		<div class="elementor-icon-list-wrapper">
			<ul <?php echo esc_attr( $this->get_render_attribute_string( 'wrapper' ) ); ?>>
				<?php foreach ( $items as $index => $item ) : ?>
					<?php
                    if ( empty( $item['text'] ) ) {
						continue;}
					?>

					<?php
					$item_class = 'elementor-icon-list-item elementor-inline-item';
					if ( ! empty( $item['icon'] ) ) {
						$item_class .= ' elementor-icon-list-item-with-icon';
					}

					$this->add_render_attribute( 'item-' . $index, 'class', $item_class );

					if ( ! empty( $item['link']['url'] ) ) {
						$this->add_link_attributes( 'link_' . $index, $item['link'] );
					}
					?>
					<?php if ( ! empty( $item['text'] ) || ! empty( $item['icon'] ) || ! empty( $item['link']['url'] ) ) : ?>
						<li <?php echo esc_attr( $this->get_render_attribute_string( 'item-' . $index ) ); ?>>
							
							<?php if ( ! empty( $item['icon'] ) ) : ?>
								<span class="elementor-icon-list-icon">
									<?php Icons_Manager::render_icon( $item['icon'], array( 'aria-hidden' => true ) ); ?>
								</span>
							<?php endif; ?>

							<span class="elementor-icon-list-text">
								<?php if ( ! empty( $item['link']['url'] ) ) : ?>
									<a <?php echo wp_kses_post( $this->get_render_attribute_string( 'link_' . $index ) ); ?>>
								<?php endif; ?>

								<?php echo wp_kses_post( $item['text'] ); ?>

								<?php if ( ! empty( $item['link']['url'] ) ) : ?>
									</a>
								<?php endif; ?>
							</span>

						</li>
					<?php endif; ?>
				<?php endforeach; ?>
			</ul>
		</div>
		<?php
	}

	/**
	 * Render widget output in editor using JS template.
	 */
	protected function content_template() {
		$store_data      = $this->get_store_data();
		$store_data_json = wp_json_encode( $store_data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT );
		?>
    <# 
    var storeData = <?php echo wp_kses_post( $store_data_json ); ?>;
    var items = [];

    if ( settings.show_address === 'yes' && storeData.storeAddress ) {
        items.push({
            text: storeData.storeAddress,
            icon: { value: 'fas fa-map-marker-alt', library: 'fa-solid' },
            _id: 'address_' + Math.random().toString(36).substr(2, 9)
        });
    }

    if ( settings.show_email === 'yes' && storeData.storeEmail ) {
        items.push({
            text: storeData.storeEmail,
            icon: { value: 'fas fa-envelope', library: 'fa-solid' },
            link: { url: 'mailto:' + storeData.storeEmail },
            _id: 'email_' + Math.random().toString(36).substr(2, 9)
        });
    }

    if ( settings.show_phone === 'yes' && storeData.storePhone ) {
        items.push({
            text: storeData.storePhone,
            icon: { value: 'fas fa-phone-alt', library: 'fa-solid' },
            link: { url: 'tel:' + storeData.storePhone.replace(/\s+/g, '') },
            _id: 'phone_' + Math.random().toString(36).substr(2, 9)
        });
    }
    #>
    <div class="elementor-icon-list-wrapper">
        <ul class="elementor-icon-list-items elementor-inline-items">
            <# _.each( items, function( item, index ) { #>
                <li class="elementor-icon-list-item elementor-inline-item <# if ( item.icon ) { #>elementor-icon-list-item-with-icon<# } #>">
                    <# if ( item.icon ) { #>
                        <span class="elementor-icon-list-icon">
                            <#
                            var iconHTML = elementor.helpers.renderIcon( view, item.icon, { 'aria-hidden': true }, 'i' , 'object' );
                            if ( iconHTML.rendered ) { #>
                                {{{ iconHTML.value }}}
                            <# } #>
                        </span>
                    <# } #>
                    <span class="elementor-icon-list-text">
                        <# if ( item.link && item.link.url ) { #>
                            <a href="{{ item.link.url }}">
                        <# } #>
                        {{{ item.text }}}
                        <# if ( item.link && item.link.url ) { #>
                            </a>
                        <# } #>
                    </span>
                </li>
            <# }); #>
        </ul>
    </div>
		<?php
	}
}