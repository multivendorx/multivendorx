<?php
namespace MultiVendorX\Elementor\Widgets;

defined( 'ABSPATH' ) || exit;

use Elementor\Widget_Icon_List;
use Elementor\Controls_Manager;
use MultiVendorX\Elementor\StoreHelper;

class Store_Info extends Widget_Icon_List {

    use StoreHelper;

    public function get_name() {
        return 'multivendorx_store_info';
    }

    public function get_title() {
        return __( 'Store Info', 'multivendorx' );
    }

    public function get_icon() {
        return 'eicon-bullet-list';
    }

    public function get_categories() {
        return [ 'multivendorx' ];
    }

    public function get_keywords() {
        return [ 'multivendorx', 'store', 'info', 'address', 'location', 'phone', 'email' ];
    }

    protected function register_controls() {
        // Register parent controls first
        parent::register_controls();

        // Hide the icon_list control
        $this->update_control(
            'icon_list',
            [
                'type' => Controls_Manager::HIDDEN,
                'default' => [],
            ]
        );

        // Update section label
        $this->update_control(
            'section_icon',
            [
                'label' => __( 'Store Info Details', 'multivendorx' ),
            ]
        );

        // Start new section for store info visibility
        $this->start_controls_section(
            'store_info_settings',
            [
                'label' => __( 'Store Info Visibility', 'multivendorx' ),
                'tab' => Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_control(
            'show_address',
            [
                'label' => __( 'Show Address', 'multivendorx' ),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => __( 'Show', 'multivendorx' ),
                'label_off' => __( 'Hide', 'multivendorx' ),
                'return_value' => 'yes',
                'default' => 'yes',
            ]
        );

        $this->add_control(
            'show_email',
            [
                'label' => __( 'Show Email', 'multivendorx' ),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => __( 'Show', 'multivendorx' ),
                'label_off' => __( 'Hide', 'multivendorx' ),
                'return_value' => 'yes',
                'default' => 'yes',
            ]
        );

        $this->add_control(
            'show_phone',
            [
                'label' => __( 'Show Phone', 'multivendorx' ),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => __( 'Show', 'multivendorx' ),
                'label_off' => __( 'Hide', 'multivendorx' ),
                'return_value' => 'yes',
                'default' => 'yes',
            ]
        );

        $this->end_controls_section();
    }

    /**
     * Get store info items in the format expected by Elementor
     */
    private function get_store_info_items() {
        $store_data = $this->get_store_data();
        if (empty($store_data)) {
            return [];
        }

        $settings = $this->get_settings_for_display();
        $items = [];

        // Address
        if ($settings['show_address'] === 'yes' && !empty($store_data['storeAddress'])) {
            $items[] = [
                'text' => $store_data['storeAddress'],
                'icon' => 'fa fa-map-marker', // Using simpler icon class
                'icon_advanced' => [
                    'value' => 'fas fa-map-marker-alt',
                    'library' => 'fa-solid',
                ],
                'link' => false,
                '_id' => uniqid('address_'), // Add unique ID for each item
            ];
        }

        // Email
        if ($settings['show_email'] === 'yes' && !empty($store_data['storeEmail'])) {
            $items[] = [
                'text' => $store_data['storeEmail'],
                'icon' => 'fa fa-envelope', // Using simpler icon class
                'icon_advanced' => [
                    'value' => 'fas fa-envelope',
                    'library' => 'fa-solid',
                ],
                'link' => [
                    'url' => 'mailto:' . $store_data['storeEmail'],
                ],
                '_id' => uniqid('email_'), // Add unique ID for each item
            ];
        }

        // Phone
        if ($settings['show_phone'] === 'yes' && !empty($store_data['storePhone'])) {
            $items[] = [
                'text' => $store_data['storePhone'],
                'icon' => 'fa fa-phone', // Using simpler icon class
                'icon_advanced' => [
                    'value' => 'fas fa-phone-alt',
                    'library' => 'fa-solid',
                ],
                'link' => [
                    'url' => 'tel:' . preg_replace("/\s+/", "", $store_data['storePhone']),
                ],
                '_id' => uniqid('phone_'), // Add unique ID for each item
            ];
        }

        return $items;
    }

    protected function render() {
        $items = $this->get_store_info_items();

        if (empty($items)) {
            return;
        }

        // Set inline layout class
        $this->add_render_attribute( 'wrapper', 'class', 'elementor-icon-list-items elementor-inline-items' );
        
        // Get current settings
        $settings = $this->get_settings_for_display();
        
        // Override the icon_list with our items
        $settings['icon_list'] = $items;
        $this->set_settings($settings);
        
        // Manually render the icon list
        ?>
        <div class="elementor-icon-list-wrapper">
            <ul <?php echo $this->get_render_attribute_string( 'wrapper' ); ?>>
                <?php foreach ( $items as $index => $item ) : 
                    $repeater_setting_key = $this->get_repeater_setting_key( 'text', 'icon_list', $index );
                    $this->add_render_attribute( $repeater_setting_key, 'class', 'elementor-icon-list-text' );
                    
                    // Add item class
                    $item_class = 'elementor-icon-list-item elementor-inline-item';
                    $this->add_render_attribute( 'item-' . $index, 'class', $item_class );
                    ?>
                    <li <?php echo $this->get_render_attribute_string( 'item-' . $index ); ?>>
                        <?php if ( ! empty( $item['icon'] ) ) : ?>
                            <span class="elementor-icon-list-icon">
                                <i class="<?php echo esc_attr( $item['icon'] ); ?>" aria-hidden="true"></i>
                            </span>
                        <?php endif; ?>
                        <span <?php echo $this->get_render_attribute_string( $repeater_setting_key ); ?>>
                            <?php if ( ! empty( $item['link']['url'] ) ) : ?>
                                <a href="<?php echo esc_url( $item['link']['url'] ); ?>">
                            <?php endif; ?>
                            <?php echo wp_kses_post( $item['text'] ); ?>
                            <?php if ( ! empty( $item['link']['url'] ) ) : ?>
                                </a>
                            <?php endif; ?>
                        </span>
                    </li>
                <?php endforeach; ?>
            </ul>
        </div>
        <?php
    }

    /**
     * Render output in the editor
     */
    protected function content_template() {
        ?>
        <#
        var storeData = <?php echo json_encode($this->get_store_data()); ?>;
        var items = [];

        if (settings.show_address === 'yes' && storeData.storeAddress) {
            items.push({
                text: storeData.storeAddress,
                icon: 'fa fa-map-marker',
                icon_advanced: { value: 'fas fa-map-marker-alt', library: 'fa-solid' },
                _id: 'address_' + Math.random().toString(36).substr(2, 9)
            });
        }

        if (settings.show_email === 'yes' && storeData.storeEmail) {
            items.push({
                text: storeData.storeEmail,
                icon: 'fa fa-envelope',
                icon_advanced: { value: 'fas fa-envelope', library: 'fa-solid' },
                link: { url: 'mailto:' + storeData.storeEmail },
                _id: 'email_' + Math.random().toString(36).substr(2, 9)
            });
        }

        if (settings.show_phone === 'yes' && storeData.storePhone) {
            items.push({
                text: storeData.storePhone,
                icon: 'fa fa-phone',
                icon_advanced: { value: 'fas fa-phone-alt', library: 'fa-solid' },
                link: { url: 'tel:' + storeData.storePhone.replace(/\s+/g, '') },
                _id: 'phone_' + Math.random().toString(36).substr(2, 9)
            });
        }
        #>
        <div class="elementor-icon-list-wrapper">
            <ul class="elementor-icon-list-items elementor-inline-items">
                <# _.each( items, function( item, index ) { #>
                <li class="elementor-icon-list-item elementor-inline-item">
                    <# if ( item.icon ) { #>
                        <span class="elementor-icon-list-icon">
                            <i class="{{ item.icon }}" aria-hidden="true"></i>
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