<?php

namespace MultiVendorX\Store;
use MultiVendorX\Utill;

defined('ABSPATH') || exit;

/**
 * Store Util class
 *
 * @version		2.2.0
 * @package		MultiVendorX
 * @author 		MultiVendorX
 */

class StoreUtil {

    public static function add_store_users($args) {
        global $wpdb;
        $table = "{$wpdb->prefix}" . Utill::TABLES['store_users'];

        $store_id = $args['store_id'] ?? 0;
        $role_id  = $args['role_id'] ?? '';
        $owners   = $args['users'] ?? [];

        // remove old users not in list
        $wpdb->query($wpdb->prepare(
            "DELETE FROM {$table} WHERE store_id = %d AND role_id = %s AND user_id NOT IN (" . implode(',', array_map('intval', $owners)) . ")",
            $store_id, $role_id
        ));

        // insert new users
        foreach ($owners as $user_id) {
            $exists = $wpdb->get_var($wpdb->prepare(
                "SELECT ID FROM {$table} WHERE store_id = %d AND role_id = %s AND user_id = %d",
                $store_id, $role_id, $user_id
            ));

            if (!$exists) {
                $wpdb->insert(
                    $table,
                    [
                        'store_id' => $store_id,
                        'user_id'  => $user_id,
                        'role_id'  => $role_id,
                    ],
                    ['%d', '%d', '%s']
                );
            }
        }
    }

    public static function get_store_users($store_id) {
        global $wpdb;
        $table = "{$wpdb->prefix}" . Utill::TABLES['store_users'];

        $users = $wpdb->get_results( $wpdb->prepare( "SELECT user_id FROM $table WHERE store_id = %d", $store_id), ARRAY_A );
        return wp_list_pluck($users, 'user_id');
      
    }

    public static function get_stores_from_user_id($user_id) {
        global $wpdb;
        $table = "{$wpdb->prefix}" . Utill::TABLES['store_users'];

        $users = $wpdb->get_col( $wpdb->prepare("SELECT store_id FROM $table WHERE user_id = %d", $user_id) );
        return $users;
    }

    public static function get_store() {
        global $wpdb;

        $table = "{$wpdb->prefix}" . Utill::TABLES['store'];
        $store = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table}" ), ARRAY_A );

        return $store ?: [];
    }

    public function get_store_tabs( $store_id ) {

        $tabs = [
            'products'      => [
                'title' => __( 'Products', 'multivendorx' ),
                'url'   => $this->get_store_url( $store_id ),
            ],
        ];

        return apply_filters( 'multivendorx_store_tabs', $tabs, $store_id );
    }


    public function get_store_url( $store_id, $tab = '' ) {
        if ( ! $store_id ) {
            return '';
        }

        $store_data    = new Store( $store_id );
        $store_slug    = $store_data ? $store_data->get('slug') : '';
        $custom_store_url = 'store';

        $path = '/' . $custom_store_url . '/' . $store_slug . '/';
        if ( $tab ) {
            $tab  = untrailingslashit( trim( $tab, " \n\r\t\v\0/\\" ) );
            $path .= $tab;
            $path = trailingslashit( $path );
        }

        return apply_filters( 'multivendorx_get_store_url', home_url( $path ), $custom_store_url, $store_id, $tab );
    }

    public static function get_store_capability() {
        $capabilities = [
            'products' => [
                'label' => 'Manage Products',
                'settingDescription'  => 'Allow stores to create, edit, and control their product listings, including uploading media and publishing items for sale.',
                'capability' =>
                [
                    //'manage_users' => 'Manage Users',
                    'manage_products' => 'Manage Products',
                    'read_products' => 'View Products',
                    'edit_products' => 'Edit Products',
                    'delete_products' => 'Delete Products',
                    'publish_products' => 'Publish Products',
                    'upload_files' => 'Upload Files',
                ],
            ],
            'orders' => [
                'label' => 'Manage Orders',
                'settingDescription'  => 'Define how stores interact with customer orders, from viewing and updating details to adding order notes or processing cancellations.',
                'capability' =>
                [
                    'read_shop_orders' => 'View Orders',
                    'view_shop_orders' => 'Manage Orders',
                    'edit_shop_orders' => 'Edit Orders',
                    'delete_shop_orders' => 'Delete Orders',
                    'add_shop_orders_note' => 'Add Order Notes',
                ],
            ],
            'coupons' => [
                'label' => 'Coupon Management',
                'settingDescription'  => 'Enable stores to create and manage discount codes, adjust coupon settings, and track active promotions.',
                'capability' =>
                [
                    'manage_shop_coupons' => 'Manage Coupons',
                    'read_shop_coupons' => 'View Coupons',
                    'edit_shop_coupons' => 'Edit Coupons',
                    'delete_shop_coupons' => 'Delete Coupons',
                ],
            ],
            'analytics' => [
                'label' => 'Analytics & Report',
                'settingDescription'  => 'Give stores access to performance insights, sales data editing, and export options for business tracking and analysis.',
                'capability' =>
                [
                    'read_shop_report' => 'View Reports',
                    'edit_shop_report' => 'Edit Sales Data',
                    'export_shop_report' => 'Export Data',
                ],
            ],
            'inventory' => [
                'label' => 'Inventory Management',
                'settingDescription'  => 'Let stores monitor stock levels, update quantities, and set alerts to prevent overselling or stockouts.',
                'capability' =>
                [
                    'read_shop_report' => 'Manage Inventory',
                    'edit_shop_report' => 'Track Stock',
                    'export_shop_report' => 'Set Stock Alerts',
                ],
            ],
            'commission' => [
                'label' => 'Commission & Earning',
                'settingDescription'  => 'Provide stores with tools to review their earnings, track commission history, and request withdrawals when eligible.',
                'capability' =>
                [
                    'read_shop_earning' => 'View Earning',
                    'edit_withdrawl_request' => 'Request Withdrawl',
                    'view_commission_history' => 'Commission History',
                ],
            ]
        ];
        
        return $capabilities;
    }

    public static function get_products_vendor( $product_id ) {
        $vendor_data = false;
        if ( $product_id > 0 ) {
            $vendor = get_post_meta( $product_id, 'multivendorx_store_id', true );
            $vendor_obj = Store::get_store_by_id( $vendor );

            if ( $vendor_obj ) {
                $vendor_data = $vendor_obj;
            }
        }
        return $vendor_data;
    }

    public static function get_store_registration_form( $store_id ) {
        $store = Store::get_store_by_id( $store_id );
    
        // Get core fields from store object
        $core_fields = [
            'name'        => 'Store Name',
            'description' => 'Store Description',
            'slug'        => 'Store Slug',
            'status'      => 'Store Status',
            'who_created' => 'Who Created',
        ];
    
        $core_data = [];
        foreach ( $core_fields as $field_key => $field_label ) {
            $core_data[$field_label] = $store->get( $field_key );
        }
    
        // Get registration form data (serialized meta)
        $store_meta = $store->get_meta( 'multivendorx_registration_data' );
        $submitted_data = [];
        if ( !empty($store_meta) && is_serialized($store_meta) ) {
            $submitted_data = unserialize($store_meta);
        }
           
        // Fetch form settings
        $form_settings = MultivendorX()->setting->get_option(
            'multivendorx_store_registration_form_settings',
            []
        );
    
        // Build map: field_name => field_label
        $name_label_map = [];
        if ( isset($form_settings['store_registration_from']['formfieldlist']) ) {
            foreach ( $form_settings['store_registration_from']['formfieldlist'] as $field ) {
                if ( !empty($field['name']) && !empty($field['label']) ) {
                    $name_label_map[$field['name']] = $field['label'];
                }
            }
        }
    
        // Prepare structured response
        $response = [
            'core_data'        => $core_data,
            'registration_data'=> [],
        ];
    
        foreach ( $submitted_data as $field_name => $field_value ) {
            $label = $name_label_map[$field_name] ?? $field_name;
            $response['registration_data'][$label] = $field_value;
        }
    
        return $response;
    }

    public static function get_stores_by_status( $status ) {
        global $wpdb;
    
        $table = "{$wpdb->prefix}" . Utill::TABLES['store'];
        $stores = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$table} WHERE status = %s",
                $status
            ),
            ARRAY_A
        );
    
        return $stores ?: [];
    }

    public static function get_primary_owner($store_id){
        global $wpdb;
        $table_name = $wpdb->prefix . Utill::TABLES['store_users'];
        $primary_owner = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT primary_owner FROM $table_name WHERE store_id = %d",
                $store_id
            )
        );
        return $primary_owner;
    }
    
    public static function set_primary_owner( $user_id, $store_id ) {
        global $wpdb;

        $table_name = $wpdb->prefix . Utill::TABLES['store_users'];

        // Check if store_id already exists
        $exists = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT ID FROM $table_name WHERE store_id = %d",
                $store_id
            )
        );

        if ( $exists ) {
            // Update
            $wpdb->update(
                $table_name,
                [ 'primary_owner' => $user_id ],
                [ 'store_id' => $store_id ],
                [ '%d' ],
                [ '%d' ]
            );
        } else {
            // Insert
            $wpdb->insert(
                $table_name,
                [
                    'store_id'      => $store_id,
                    'user_id'       => $user_id,
                    'role_id'       => MultiVendorX()->setting->get_setting( 'approve_store' ) == 'automatically' ? 'store_owner' : null,
                    'primary_owner' => MultiVendorX()->setting->get_setting( 'approve_store' ) == 'automatically' ? $user_id : null,
                ],
                [ '%d', '%d', '%s', '%d' ]
            );
        }
    }

    public static function get_store_product_policies($product_id = 0) {
        $product = wc_get_product($product_id);
        $policies = array();
        if ($product) {
            $shipping_policy = get_post_meta($product_id, 'multivendorx_shipping_policy', true);
            $refund_policy = get_post_meta($product_id, 'multivendorx_refund_policy', true);
            $cancellation_policy = get_post_meta($product_id, 'multivendorx_cancellation_policy', true);

            $store_policy = MultiVendorX()->setting->get_setting('store_policy', []);
            if (!empty($shipping_policy)) {
                $shipping_policy = MultiVendorX()->setting->get_setting('shipping_policy', []);
            }
            if (!empty($refund_policy)) {
                $refund_policy = MultiVendorX()->setting->get_setting('refund_policy', []);
            }
            if (!empty($cancellation_policy)) {
                $cancellation_policy = MultiVendorX()->setting->get_setting('cancellation_policy', []);
            }

            $store_id = get_post_meta($product_id, 'multivendorx_store_id', true);
            $store = new Store($store_id);
            $privacy_override_settings = MultiVendorX()->setting->get_setting('store_policy_override', []);
            
            if ( in_array ('store', $privacy_override_settings) ) {
                $store_policy = $store->get_meta('store_policy');
            }
            if ( in_array ('shipping', $privacy_override_settings) ) {
                $shipping_policy = $store->get_meta('shipping_policy');
            }
            if ( in_array ('refund_return', $privacy_override_settings) ) {
                $refund_policy = $store->get_meta('return_policy');
                $cancellation_policy = $store->get_meta('exchange_policy');
            }

            if (!empty($store_policy)) {
                $policies['store_policy'] = $store_policy;
            }

            if (!empty($shipping_policy)) {
                $policies['shipping_policy'] = $shipping_policy;
            }

            if (!empty($refund_policy)) {
                $policies['refund_policy'] = $refund_policy;
            }
            if (!empty($cancellation_policy)) {
                $policies['cancellation_policy'] = $cancellation_policy;
            }
        }
        return $policies;
    }

    public static function get_store_policies($store_id = 0) {
        $policies = array();
            $store_policy = MultiVendorX()->setting->get_setting('store_policy', []);
            $shipping_policy = MultiVendorX()->setting->get_setting('shipping_policy', []);
            $refund_policy = MultiVendorX()->setting->get_setting('refund_policy', []);
            $cancellation_policy = MultiVendorX()->setting->get_setting('cancellation_policy', []);

            if ($store_id) {
                $store = new Store($store_id);
                $privacy_override_settings = MultiVendorX()->setting->get_setting('store_policy_override', []);
                
                if ( in_array ('store', $privacy_override_settings) ) {
                    $store_policy = $store->get_meta('store_policy');
                }
                if ( in_array ('shipping', $privacy_override_settings) ) {
                    $shipping_policy = $store->get_meta('shipping_policy');
                }
                if ( in_array ('refund_return', $privacy_override_settings) ) {
                    $refund_policy = $store->get_meta('refund_policy');
                    $cancellation_policy = $store->get_meta('exchange_policy');
                }
            }

            if (!empty($store_policy)) {
                $policies['store_policy'] = $store_policy;
            }

            if (!empty($shipping_policy)) {
                $policies['shipping_policy'] = $shipping_policy;
            }

            if (!empty($refund_policy)) {
                $policies['refund_policy'] = $refund_policy;
            }
            if (!empty($cancellation_policy)) {
                $policies['cancellation_policy'] = $cancellation_policy;
            }

        return $policies;
    }

    public static function get_endpoint_url($page = '', $sub = '', $value = '') {
        if (get_option('permalink_structure')) {
            $url = home_url('/dashboard');
            if ($page && $page !== 'dashboard') {
                $url .= '/' . $page;
            }
            if ($sub) {
                $url .= '/' . $sub;
            }
            if ($value) {
                $url .= '/' . $value;
            }
        } else {
            $page_id = isset($_GET['page_id']) ? (int) $_GET['page_id'] : 0;

            if ($page_id) {
                $base_url = add_query_arg(['page_id' => $page_id], home_url('/'));
            } else {
                $base_url = home_url('/');
            }

            $url = add_query_arg(['dashboard' => '1'], $base_url);
            if ($page) {
                $url = add_query_arg('tab', $page, $url);
            }
            if ($sub) {
                $url = add_query_arg('subtab', $sub, $url);
            }
            if ($value) {
                $url = add_query_arg('value', $value, $url);
            }
        }

        return esc_url($url);
    }

    /**
     * Get store records from the database based on given filters.
     *
     * @param array $args Filter options like 'ID', 'status', 'name', 'slug', 'description', 'who_created', 'create_time', 'limit', 'offset', 'count'.
     * @return array|int List of stores (array) or count (int) if 'count' is set.
     */
    public static function get_store_information( $args = [] ) {
        global $wpdb;
    
        $where = [];
    
        if ( isset( $args['ID'] ) ) {
            $ids     = is_array( $args['ID'] ) ? $args['ID'] : [ $args['ID'] ];
            $ids     = implode( ',', array_map( 'intval', $ids ) );
            $where[] = "ID IN ($ids)";
        }
    
        if ( isset( $args['status'] ) ) {
            $where[] = "status = '" . esc_sql( $args['status'] ) . "'";
        }
    
        if ( isset( $args['name'] ) ) {
            $where[] = "name LIKE '%" . esc_sql( $args['name'] ) . "%'";
        }
    
        if ( isset( $args['slug'] ) ) {
            $where[] = "slug = '" . esc_sql( $args['slug'] ) . "'";
        }
    
        if ( isset( $args['searchField'] ) ) {
            $search = esc_sql( $args['searchField'] );
            $where[] = "(name LIKE '%$search%')";
        }
    
        if ( isset( $args['start_date'] ) && isset( $args['end_date'] ) ) {
            $where[] = "create_time BETWEEN '" . esc_sql( $args['start_date'] ) . "' AND '" . esc_sql( $args['end_date'] ) . "'";
        }
    
        $table = $wpdb->prefix . Utill::TABLES['store'];
    
        if ( isset( $args['count'] ) ) {
            $query = "SELECT COUNT(*) FROM {$table}";
        } else {
            $query = "SELECT * FROM {$table}";
        }
    
        if ( ! empty( $where ) ) {
            $condition = $args['condition'] ?? ' AND ';
            $query    .= ' WHERE ' . implode( $condition, $where );
        }
    
        //ADD SORTING SUPPORT HERE
        if ( ! empty( $args['orderBy'] ) ) {
            // Only allow safe columns to sort by (avoid SQL injection)
            $allowed_columns = ['ID', 'name', 'status', 'slug', 'create_time'];
            $orderBy = in_array( $args['orderBy'], $allowed_columns, true ) ? $args['orderBy'] : 'ID';
            $order   = ( isset( $args['order'] ) && strtolower( $args['order'] ) === 'desc' ) ? 'DESC' : 'ASC';
            $query  .= " ORDER BY {$orderBy} {$order}";
        }
    
        //Keep your pagination logic
        if ( isset( $args['limit'] ) && isset( $args['offset'] ) && empty( $args['count'] ) ) {
            $limit  = intval( $args['limit'] );
            $offset = intval( $args['offset'] );
            $query .= " LIMIT $limit OFFSET $offset";
        }
    
        if ( isset( $args['count'] ) ) {
            $results = $wpdb->get_var( $query );
            return $results ?? 0;
        } else {
            $results = $wpdb->get_results( $query, ARRAY_A );
            return $results ?? [];
        }
    }
    

}
