<?php
namespace MultiVendorX\Elementor\Tags;
use Elementor\Controls_Manager;
use Elementor\Core\DynamicTags\Tag;
use Elementor\Modules\DynamicTags\Module;
use MultiVendorX\Elementor\StoreHelper;

class StoreBanner extends Tag {
    use StoreHelper;

    /**
     * Class constructor
     *
     * @since 1.0.0
     *
     * @param array $data
     */
    public function __construct( $data = [] ) {
        parent::__construct( $data );
    }

    /**
     * Tag name
     *
     * @since 1.0.0
     *
     * @return string
     */
    public function get_name() {
        return 'mvx-store-banner';
    }

    public function get_group() {
        return 'multivendorx'; // must match group ID
    }

    /**
     * Tag title
     *
     * @since 1.0.0
     *
     * @return string
     */
    public function get_title() {
        return __( 'Store Banner', 'multivendorx' );
    }

    /**
     * Tag categories
     *
     * @since 1.0.0
     *
     * @return array
     */
    public function get_categories() {
        return [ Module::IMAGE_CATEGORY ];
    }

    /**
     * Store profile picture
     *
     * @since 1.0.0
     *
     * @return void
     */
    protected function get_value() {
        $store = $this->get_store_data();
        $banner = ! empty( $store['storeBanner'] ) ? $store['storeBanner'] : '';
        
        if ( is_numeric( $banner ) ) {
			$banner = wp_get_attachment_url( $banner );
		}
        
        if ( empty( $banner ) ) {
            $settings = $this->get_settings();

            if ( ! empty( $settings['fallback']['id'] ) ) {
                $banner = $settings['fallback'];
            }
        }

        return $banner;
    }

    /**
     * Register tag controls
     *
     * @since 1.0.0
     *
     * @return void
     */
    protected function _register_controls() {
    	  
        $this->add_control(
            'fallback',
            [
                'label' => __( 'Fallback', 'multivendorx' ),
                'type' => Controls_Manager::MEDIA,
                'default' => [
                    'url' => '',
                ]
            ]
        );
    }
}
