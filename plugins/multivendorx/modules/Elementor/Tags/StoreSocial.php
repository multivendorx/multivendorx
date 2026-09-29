<?php
/**
 * Elementor Dynamic Tag: Store Social
 *
 * Provides store social media links for use in Elementor dynamic tags.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Elementor\Tags;

use Elementor\Core\DynamicTags\Tag;
use Elementor\Modules\DynamicTags\Module;
use MultiVendorX\Elementor\StoreHelper;

defined( 'ABSPATH' ) || exit;

/**
 * StoreSocial Dynamic Tag
 */
class StoreSocial extends Tag {
    use StoreHelper;

    /**
     * Constructor.
     *
     * @param array $data Optional tag data.
     *
     * @phpcs:disable Generic.CodeAnalysis.UselessOverridingMethod.Found
     */
    public function __construct( $data = array() ) {
        parent::__construct( $data );
    }

    /**
     * Tag name (unique identifier).
     *
     * @return string
     */
    public function get_name() {
        return 'multivendorx-store-social-tag';
    }

    /**
     * Tag title (display name).
     *
     * @return string
     */
    public function get_title() {
        return __( 'Store Social', 'multivendorx' );
    }

    /**
     * Tag group ID.
     *
     * @return string
     */
    public function get_group() {
        return 'multivendorx';
    }

    /**
     * Tag categories.
     *
     * @return array
     */
    public function get_categories() {
        return array( Module::TEXT_CATEGORY );
    }

    /**
     * Render the tag output.
     *
     * @return void
     */
    public function render() {
        $links       = array();
        $network_map = array(
            'fb'        => 'fab fa-facebook',
            'gplus'     => 'fab fa-google-plus',
            'twitter'   => 'fab fa-twitter',
            'linkedin'  => 'fab fa-linkedin',
            'youtube'   => 'fab fa-youtube',
            'instagram' => 'fab fa-instagram',
            'pinterest' => 'fab fa-pinterest',
        );

        $social_info = $this->get_social_profiles();

        foreach ( $network_map as $multivendorx_name => $elementor_name ) {
            if ( ! empty( $social_info[ $multivendorx_name ] ) ) {
                $links[ $elementor_name ] = esc_url( $social_info[ $multivendorx_name ] );
            }
        }

        echo wp_json_encode( $links );
    }

    /**
     * Get store social profiles.
     *
     * @return array Social profile URLs keyed by network.
     */
    protected function get_social_profiles() {
        $store = $this->get_store_data();

        $networks = array( 'fb', 'twitter', 'linkedin', 'youtube', 'instagram', 'pinterest' );
        $profiles = array();

        foreach ( $networks as $network ) {
            $profiles[ $network ] = isset( $store[ $network ] ) ? $store[ $network ] : '';
        }

        return $profiles;
    }
}
