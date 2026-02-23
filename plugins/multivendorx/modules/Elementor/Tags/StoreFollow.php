<?php
namespace MultiVendorX\Elementor\Tags;
use Elementor\Core\DynamicTags\Tag;
use Elementor\Modules\DynamicTags\Module;
use MultiVendorX\Elementor\StoreHelper;

class StoreFollow extends Tag {
    use StoreHelper;

    /**
     * Class constructor
     *
     * @since 3.7
     *
     * @param array $data
     */
    public function __construct( $data = [] ) {
        parent::__construct( $data );
    }

    /**
     * Tag name
     *
     * @since 3.7
     *
     * @return string
     */
    public function get_name() {
        return 'multivendorx-store-follow-tag';
    }

    /**
     * Tag title
     *
     * @since 3.7
     *
     * @return string
     */
    public function get_title() {
        return __( 'Store Follow Button', 'multivendorx' );
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
     * @since 3.7
     *
     * @return void
     */
    public function render() {
    	$store = $this->get_store_data();
        $store_id = ! empty( $store['storeId'] ) ? $store['storeId'] : '';
        
        if ( !empty($store_id) ) {
            $customer_follow_store = get_user_meta( get_current_user_id(), 'multivendorx_following_stores', true ) ?? array();
            $store_lists = !empty($customer_follow_store) ? wp_list_pluck( $customer_follow_store, 'user_id' ) : array();
            $follow_status = in_array($store_id, $store_lists) ? __( 'Unfollow', 'multivendorx' ) : __( 'Follow', 'multivendorx' );
        	echo is_user_logged_in() ? esc_attr($follow_status) : esc_html_e('You must log in to follow', 'multivendorx');
        } else {
            echo esc_html_e( 'Follow', 'multivendorx' );
        }
    }
}
