<?php
namespace MultiVendorX\Elementor\Tags;
use Elementor\Core\DynamicTags\Tag;
use Elementor\Modules\DynamicTags\Module;
use MultiVendorX\Elementor\StoreHelper;

class StoreSocial extends Tag {
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
        return 'multivendorx-store-social-tag';
    }

    /**
     * Tag title
     *
     * @since 1.0.0
     *
     * @return string
     */
    public function get_title() {
        return __( 'Store Social', 'multivendorx' );
    }

    public function get_group() {
        return 'multivendorx'; // must match group ID
    }

    public function get_categories() {
        return [ Module::TEXT_CATEGORY ];
    }

    /**
     * Render tag
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function render() {
        $links       = [];
        $network_map = [
                'fb'        => 'fab fa-facebook',
                'gplus'     => 'fab fa-google-plus',
                'twitter'   => 'fab fa-twitter',
                'linkedin'  => 'fab fa-linkedin',
                'youtube'   => 'fab fa-youtube',
                'instagram' => 'fab fa-instagram',
                'pinterest'	=> 'fab fa-pinterest'
			];

     
        $social_info = $this->get_social_profiles();

        foreach ( $network_map as $mvx_name => $elementor_name ) {
            if ( ! empty( $social_info[ $mvx_name ] ) ) {
                $links[ $elementor_name ] = $social_info[ $mvx_name ];
            }
        }

        echo $links;
    }

    protected function get_social_profiles() {
        $store = $this->get_store_data();
        $store_infos = array();
        $store_infos['fb'] = $store['facebook'];  
        $store_infos['twitter'] = $store['twitter'];
        $store_infos['linkedin'] = $store['linkedin'];
        $store_infos['youtube'] = $store['youtube'];
        $store_infos['instagram'] = $store['instagram'];
        $store_infos['pinterest'] = $store['pinterest'];
        return $store_infos;
    }

}
