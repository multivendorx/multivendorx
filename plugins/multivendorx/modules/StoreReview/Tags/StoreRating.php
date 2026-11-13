<?php
/**
 * Store Rating Dynamic Tag for Elementor
 *
 * @package MultiVendorX\StoreReview\Tags
 */

namespace MultiVendorX\StoreReview\Tags;

use Elementor\Core\DynamicTags\Tag;
use Elementor\Modules\DynamicTags\Module;
use MultiVendorX\Elementor\StoreHelper;

defined( 'ABSPATH' ) || exit;

/**
 * Store Rating tag class
 *
 * Renders the store rating in Elementor dynamic tags
 */
class StoreRating extends Tag {
    use StoreHelper;

    /**
     * Class constructor
     *
     * @param array $data Elementor tag data.
     */
    public function __construct( $data = array() ) { // phpcs:ignore Generic.CodeAnalysis.UselessOverridingMethod.Found
        parent::__construct( $data );
    }

    /**
     * Tag name
     *
     * @return string
     */
    public function get_name() {
        return 'multivendorx-store-rating-tag';
    }

    /**
     * Tag title
     *
     * @return string
     */
    public function get_title() {
        return __( 'Store Rating', 'multivendorx' );
    }

    /**
     * Tag group
     *
     * @return string
     */
    public function get_group() {
        return 'multivendorx';
    }

    /**
     * Tag categories
     *
     * @return array
     */
    public function get_categories() {
        return array( Module::TEXT_CATEGORY );
    }

    /**
     * Render tag
     *
     * @return void
     */
    public function render() {
        $store  = $this->get_store_data();
        $rating = ! empty( $store['storeRating'] ) ? $store['storeRating'] : 0;
        echo esc_html( $rating );
    }
}
