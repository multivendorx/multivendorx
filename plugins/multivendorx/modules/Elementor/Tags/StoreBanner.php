<?php
namespace MultiVendorX\Elementor\Tags;
use Elementor\Controls_Manager;
use Elementor\Core\DynamicTags\Tag;
use Elementor\Modules\DynamicTags\Module;

class StoreBanner extends Tag {

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
    protected function get_value( array $options = [] ) {
    	// global $mvx_elementor;
        // $banner = $mvx_elementor->get_mvx_store_data( 'banner' );
        
        // if ( empty( $banner['id'] ) ) {
            $settings = $this->get_settings();

            if ( ! empty( $settings['fallback']['id'] ) ) {
                $banner = $settings['fallback'];
            }
        // }

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
    	// global $MVX;
    	  
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
