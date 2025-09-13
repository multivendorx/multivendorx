<?php

namespace MultiVendorX\Store;

defined('ABSPATH') || exit;

/**
 * Store Ajax class
 *
 * @version		2.2.0
 * @package		MultiVendorX
 * @author 		MultiVendorX
 */

class Ajax {
    public function __construct() {
        add_action('wp_ajax_switch_store', array($this, 'multivendorx_switch_store'));
    }

    
    public function multivendorx_switch_store() {
        $store_id = filter_input( INPUT_POST, 'store_id', FILTER_SANITIZE_NUMBER_INT ) ?? 0;
        $user_id  = get_current_user_id();

        if ($user_id && $store_id) {
            update_user_meta($user_id, 'multivendorx_active_store', $store_id);

            wp_send_json_success([
                'redirect' => site_url('/dashboard')
            ]);
        }
    }

}
