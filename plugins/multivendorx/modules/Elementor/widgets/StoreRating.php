<?php
namespace MultiVendorX\Elementor\Widgets;

defined( 'ABSPATH' ) || exit;

use Elementor\Widget_Base;
use Elementor\Controls_Manager;
use Elementor\Group_Control_Typography;
use MultiVendorX\Elementor\StoreHelper;

class Store_Rating extends Widget_Base {

    use StoreHelper;

    public function get_name() {
        return 'multivendorx_store_rating';
    }

    public function get_title() {
        return __( 'Store Rating', 'multivendorx' );
    }

    public function get_icon() {
        return 'eicon-rating';
    }

    public function get_categories() {
        return [ 'multivendorx' ];
    }

    public function get_keywords() {
        return [ 'multivendorx', 'store', 'rating', 'stars', 'reviews' ];
    }

    protected function register_controls() {
        // Content Section
        $this->start_controls_section(
            'section_content',
            [
                'label' => __( 'Content', 'multivendorx' ),
                'tab'   => Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_control(
            'rating',
            [
                'label' => __( 'Rating', 'multivendorx' ),
                'type' => Controls_Manager::NUMBER,
                'min' => 0,
                'max' => 5,
                'step' => 0.1,
                'default' => 0,
                'dynamic' => [
                    'active' => true,
                    'default' => '{{multivendorx-store-rating-tag}}'
                ],
            ]
        );

        $this->add_control(
            'rating_scale',
            [
                'label' => __( 'Rating Scale', 'multivendorx' ),
                'type' => Controls_Manager::SELECT,
                'options' => [
                    '5' => '0 - 5',
                ],
                'default' => '5',
            ]
        );

        $this->add_control(
            'show_rating_text',
            [
                'label' => __( 'Show Rating Text', 'multivendorx' ),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => __( 'Show', 'multivendorx' ),
                'label_off' => __( 'Hide', 'multivendorx' ),
                'return_value' => 'yes',
                'default' => 'yes',
            ]
        );

        $this->end_controls_section();

        // Style Section
        $this->start_controls_section(
            'section_style',
            [
                'label' => __( 'Style', 'multivendorx' ),
                'tab'   => Controls_Manager::TAB_STYLE,
            ]
        );

        $this->add_control(
            'star_color',
            [
                'label' => __( 'Star Color', 'multivendorx' ),
                'type' => Controls_Manager::COLOR,
                'default' => '#ffcc00',
                'selectors' => [
                    '{{WRAPPER}} .star-rating span' => 'color: {{VALUE}};',
                ],
            ]
        );

        $this->add_control(
            'unmarked_star_color',
            [
                'label' => __( 'Unmarked Star Color', 'multivendorx' ),
                'type' => Controls_Manager::COLOR,
                'default' => '#d3ced2',
                'selectors' => [
                    '{{WRAPPER}} .star-rating::before' => 'color: {{VALUE}};',
                ],
            ]
        );

        $this->add_control(
            'star_size',
            [
                'label' => __( 'Star Size', 'multivendorx' ),
                'type' => Controls_Manager::SLIDER,
                'range' => [
                    'px' => [
                        'min' => 10,
                        'max' => 50,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 16,
                ],
                'selectors' => [
                    '{{WRAPPER}} .star-rating' => 'font-size: {{SIZE}}{{UNIT}};',
                    '{{WRAPPER}} .star-rating span' => 'padding-top: {{SIZE}}{{UNIT}};',
                ],
            ]
        );

        $this->add_responsive_control(
            'stars_spacing',
            [
                'label' => __( 'Stars Spacing', 'multivendorx' ),
                'type' => Controls_Manager::SLIDER,
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 20,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 2,
                ],
                'selectors' => [
                    '{{WRAPPER}} .star-rating' => 'letter-spacing: {{SIZE}}{{UNIT}};',
                    '{{WRAPPER}} .star-rating span' => 'letter-spacing: {{SIZE}}{{UNIT}};',
                ],
            ]
        );

        $this->add_group_control(
            Group_Control_Typography::get_type(),
            [
                'name' => 'text_typography',
                'label' => __( 'Text Typography', 'multivendorx' ),
                'selector' => '{{WRAPPER}} .star-rating-text',
                'condition' => [
                    'show_rating_text' => 'yes',
                ],
            ]
        );

        $this->add_control(
            'text_color',
            [
                'label' => __( 'Text Color', 'multivendorx' ),
                'type' => Controls_Manager::COLOR,
                'default' => '#333333',
                'selectors' => [
                    '{{WRAPPER}} .star-rating-text' => 'color: {{VALUE}};',
                ],
                'condition' => [
                    'show_rating_text' => 'yes',
                ],
            ]
        );

        $this->add_responsive_control(
            'text_spacing',
            [
                'label' => __( 'Text Spacing', 'multivendorx' ),
                'type' => Controls_Manager::SLIDER,
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 20,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 5,
                ],
                'selectors' => [
                    '{{WRAPPER}} .multivendorx-store-rating' => 'gap: {{SIZE}}{{UNIT}};',
                ],
                'condition' => [
                    'show_rating_text' => 'yes',
                ],
            ]
        );

        $this->add_responsive_control(
            'alignment',
            [
                'label' => __( 'Alignment', 'multivendorx' ),
                'type' => Controls_Manager::CHOOSE,
                'options' => [
                    'left' => [
                        'title' => __( 'Left', 'multivendorx' ),
                        'icon' => 'eicon-text-align-left',
                    ],
                    'center' => [
                        'title' => __( 'Center', 'multivendorx' ),
                        'icon' => 'eicon-text-align-center',
                    ],
                    'right' => [
                        'title' => __( 'Right', 'multivendorx' ),
                        'icon' => 'eicon-text-align-right',
                    ],
                ],
                'default' => 'left',
                'selectors' => [
                    '{{WRAPPER}} .multivendorx-store-rating' => 'justify-content: {{VALUE}};',
                ],
            ]
        );

        $this->end_controls_section();
    }

    protected function render() {
        $settings = $this->get_settings_for_display();
        $store = $this->get_store_data();
        
        // Get rating from settings (dynamic tag will populate this)
        $rating = isset( $settings['rating'] ) ? floatval( $settings['rating'] ) : 0;
        
        // Ensure rating is between 0 and 5
        $rating = max(0, min(5, $rating));
        
        // Calculate width percentage for stars
        $width = ( $rating / 5 ) * 100;
        
        $show_text = isset( $settings['show_rating_text'] ) && $settings['show_rating_text'] === 'yes';
        
        // WooCommerce star rating structure
        ?>
        <div class="multivendorx-store-rating">
            <div class="star-rating" role="img" aria-label="<?php echo sprintf( __( 'Rated %s out of 5', 'multivendorx' ), number_format( $rating, 1 ) ); ?>">
                <span style="width: <?php echo esc_attr( $width ); ?>%;">
                    <strong class="rating"><?php echo esc_html( number_format( $rating, 1 ) ); ?></strong> <?php esc_html_e( 'out of 5', 'multivendorx' ); ?>
                </span>
            </div>
            
            <?php if ( $show_text ) : ?>
                <span class="star-rating-text">(<?php echo esc_html( number_format( $rating, 1 ) ); ?>)</span>
            <?php endif; ?>
        </div>
        <?php
    }

    protected function content_template() {
        ?>
        <#
        var rating = settings.rating || 0;
        rating = Math.max(0, Math.min(5, rating));
        var width = (rating / 5) * 100;
        var showText = settings.show_rating_text === 'yes';
        #>
        
        <div class="multivendorx-store-rating">
            <div class="star-rating" role="img" aria-label="Rated {{ rating.toFixed(1) }} out of 5">
                <span style="width: {{ width }}%;">
                    <strong class="rating">{{ rating.toFixed(1) }}</strong> out of 5
                </span>
            </div>
            
            <# if (showText) { #>
                <span class="star-rating-text">({{ rating.toFixed(1) }})</span>
            <# } #>
        </div>
        <?php
    }
}