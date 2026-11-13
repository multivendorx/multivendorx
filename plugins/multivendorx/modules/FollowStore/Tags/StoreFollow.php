<?php
/**
 * Store Follow Dynamic Tag for Elementor.
 *
 * Displays the follow/unfollow status for a store, or a login prompt if the user is not logged in.
 *
 * @package MultiVendorX\FollowStore\Tags
 */

namespace MultiVendorX\FollowStore\Tags;

use Elementor\Core\DynamicTags\Tag;
use Elementor\Modules\DynamicTags\Module;
use MultiVendorX\Elementor\StoreHelper;

defined( 'ABSPATH' ) || exit;

/**
 * StoreFollow tag class.
 *
 * Renders store follow button text dynamically for Elementor widgets.
 */
class StoreFollow extends Tag {
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
     * Tag name.
     *
     * @return string Tag identifier.
     */
    public function get_name() {
        return 'multivendorx-store-follow-tag';
    }

    /**
     * Tag title.
     *
     * @return string Tag title.
     */
    public function get_title() {
        return __( 'Store Follow Button', 'multivendorx' );
    }

    /**
     * Tag group.
     *
     * @return string Group ID (must match group).
     */
    public function get_group() {
        return 'multivendorx';
    }

    /**
     * Tag categories.
     *
     * @return array Tag categories.
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
        $store    = $this->get_store_data();
        $store_id = ! empty( $store['storeId'] ) ? $store['storeId'] : '';

        if ( ! empty( $store_id ) ) {
            $customer_follow_store = get_user_meta(
                MultiVendorX()->current_user_id,
                'multivendorx_following_stores',
                true
            ) ?? array();

            $store_lists = ! empty( $customer_follow_store )
                ? wp_list_pluck( $customer_follow_store, 'user_id' )
                : array();

            $follow_status = in_array( $store_id, $store_lists, true )
                ? __( 'Unfollow', 'multivendorx' )
                : __( 'Follow', 'multivendorx' );

            echo is_user_logged_in()
                ? esc_attr( $follow_status )
                : esc_html__( 'You must log in to follow.', 'multivendorx' );
        } else {
            echo esc_html__( 'Follow.', 'multivendorx' );
        }
    }
}
