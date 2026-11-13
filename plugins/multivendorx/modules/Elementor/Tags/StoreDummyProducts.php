<?php
/**
 * Elementor Dynamic Tag: Store Dummy Products
 *
 * Provides a dummy product listing for Elementor dynamic tags.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Elementor\Tags;

use Elementor\Core\DynamicTags\Tag;
use Elementor\Modules\DynamicTags\Module;

defined( 'ABSPATH' ) || exit;

/**
 * StoreDummyProducts Dynamic Tag.
 *
 * Displays 12 WooCommerce products using shortcode.
 */
class StoreDummyProducts extends Tag {

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
        return 'multivendorx-store-dummy-products';
    }

    /**
     * Tag title (display name).
     *
     * @return string
     */
    public function get_title() {
        return __( 'Store Dummy Products', 'multivendorx' );
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
     * Render tag output.
     *
     * @return void
     */
    public function render() {
        echo '<div class="site-main">';
        echo do_shortcode( '[products limit="12"]' );
        echo '</div>';
    }
}
