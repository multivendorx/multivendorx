<?php
/**
 * Store Follow Button Elementor widget.
 *
 * Provides a follow/unfollow button and follower count for stores.
 *
 * @package MultiVendorX\FollowStore\Widgets
 */

namespace MultiVendorX\FollowStore\Widgets;

defined( 'ABSPATH' ) || exit;

use Elementor\Widget_Button;
use MultiVendorX\Elementor\StoreHelper;

/**
 * StoreFollow class.
 *
 * Extends Elementor's Widget_Button and renders a follow/unfollow button
 * for stores, including follower count.
 */
class StoreFollow extends Widget_Button {

    use StoreHelper;

    /**
     * Get widget name.
     *
     * @return string Widget name.
     */
    public function get_name() {
        return 'multivendorx_store_follow';
    }

    /**
     * Get widget title.
     *
     * @return string Widget title.
     */
    public function get_title() {
        return __( 'Store Follow Button', 'multivendorx' );
    }

    /**
     * Get widget icon.
     *
     * @return string Widget icon class.
     */
    public function get_icon() {
        return 'eicon-person';
    }

    /**
     * Get widget categories.
     *
     * @return array Widget categories.
     */
    public function get_categories() {
        return array( 'multivendorx' );
    }

    /**
     * Register widget controls.
     *
     * @return void
     */
    protected function register_controls() {
        parent::register_controls();

        $this->update_control(
            'text',
            array(
                'dynamic'   => array(
                    'default' => \Elementor\Plugin::instance()
                                        ->dynamic_tags
                                        ->tag_data_to_tag_text( null, 'multivendorx-store-follow-tag' ),
                    'active'  => true,
                ),
                'selectors' => array(
                    '{{WRAPPER}} > .elementor-widget-container > .elementor-button-wrapper > .multivendorx-store-follow-btn' => 'width: auto; margin: 0;',
                ),
            )
        );
    }

	/**
	 * Render widget output on frontend.
	 *
	 * @return void
	 */
	protected function render() {
		$store = $this->get_store_data();

		if ( ! $store ) {
			return;
		}

		$store_id        = ! empty( $store['storeId'] ) ? $store['storeId'] : '';
		$current_user_id = MultiVendorX()->current_user_id;

		// Follow status snapshot (initial render only).
		$customer_follow_store = get_user_meta(
            $current_user_id,
            'multivendorx_following_stores',
            true
		) ?? array();

		$store_lists = ! empty( $customer_follow_store )
        ? wp_list_pluck( $customer_follow_store, 'user_id' )
        : array();

		$follow_status = in_array( $store_id, $store_lists, true )
        ? __( 'Unfollow', 'multivendorx' )
        : __( 'Follow', 'multivendorx' );

		// Follower count.
		$follower_count = ! empty( $store['followerCount'] )
        ? intval( $store['followerCount'] )
        : 0;

		// Elementor button attributes.
		$this->add_render_attribute( 'button', 'class', 'follow-btn multivendorx-store-follow-btn' );
		$this->add_render_attribute( 'button', 'data-store-id', $store_id );
		$this->add_render_attribute( 'button', 'data-user-id', $current_user_id );
		$this->add_render_attribute( 'button', 'data-status', $follow_status );

		?>
    <div class="multivendorx-follow-store-wrapper"
        data-store-id="<?php echo esc_attr( $store_id ); ?>">

        <?php parent::render(); ?>

        <p class="multivendorx-follow-count"
        id="followers-count-<?php echo esc_attr( $store_id ); ?>">

            <?php
            /* translators: %d: Number of followers. */
            echo esc_html(
                sprintf(
                    _n( '%d Follower', '%d Followers', $follower_count, 'multivendorx' ),
                    $follower_count
                )
            );
            ?>

        </p>

    </div>
		<?php
	}
}