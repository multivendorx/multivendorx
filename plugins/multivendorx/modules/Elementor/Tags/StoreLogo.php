<?php
namespace MultiVendorX\Elementor\Tags;
use Elementor\Core\DynamicTags\Tag;
use Elementor\Modules\DynamicTags\Module;
use Elementor\Controls_Manager;
use MultiVendorX\Elementor\StoreHelper;

class StoreLogo extends Tag {
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
        return 'multivendorx-store-logo';
    }

    /**
     * Tag title
     *
     * @since 1.0.0
     *
     * @return string
     */
    public function get_title() {
        return __( 'Store Logo', 'multivendorx' );
    }

    public function get_group() {
        return 'multivendorx'; // must match group ID
    }

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
        $picture = ! empty( $store['storeLogo'] ) ? $store['storeLogo'] : '';
        
        if ( is_numeric( $picture ) ) {
			$picture = wp_get_attachment_url( $picture );
		}

        if ( empty( $picture ) ) {
            $settings = $this->get_settings();

            if ( ! empty( $settings['fallback']['id'] ) ) {
                $picture = $settings['fallback'];
            }
        }

        return $picture;
    }

    /**
     * Register tag controls
     *
     * @since 1.0.0
     *
     * @return void
     */
    protected function _register_controls() {
    	global $MVX;
    		
        $this->add_control(
            'fallback',
            [
                'label' => __( 'Fallback', 'multivendorx' ),
                'type' => Controls_Manager::MEDIA,
                'default' => [
                    'id'  => 0,
                    'url' => '',
                ]
            ]
        );
    }
}
