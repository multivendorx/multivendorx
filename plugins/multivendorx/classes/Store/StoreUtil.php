<?php
/**
 * MultiVendorX Store Util Class
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Store;

use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Store Util Class.
 *
 * @class       StoreUtil class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class StoreUtil {

    /**
     * Add store users
     *
     * @param array $args Array of arguments.
     */
    public static function add_store_users( $args ) {
        global $wpdb;
        $table = "{$wpdb->prefix}" . Utill::TABLES['store_users'];

        $store_id = $args['store_id'] ?? 0;
        $role_id  = $args['role_id'] ?? '';
        $owners   = $args['users'] ?? array();

        // Remove old users not in list.
        $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM {$table} WHERE store_id = %d AND role_id = %s AND user_id NOT IN (" . implode( ',', array_map( 'intval', $owners ) ) . ')',
                $store_id,
                $role_id
            )
        );

        // Insert new users.
        foreach ( $owners as $user_id ) {
            $exists = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT ID FROM {$table} WHERE store_id = %d AND role_id = %s AND user_id = %d",
                    $store_id,
                    $role_id,
                    $user_id
                )
            );

            if ( ! $exists ) {
                $wpdb->insert(
                    $table,
                    array(
                        'store_id' => $store_id,
                        'user_id'  => $user_id,
                        'role_id'  => $role_id,
                    ),
                    array( '%d', '%d', '%s' )
                );
            }
        }

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        }
    }

    /**
     * Get store users
     *
     * @param int $store_id Store ID.
     * @return array
     */
    public static function get_store_users( $store_id ) {
        global $wpdb;
        $table = "{$wpdb->prefix}" . Utill::TABLES['store_users'];

        $primary_owner_id = self::get_primary_owner( $store_id );
        $users            = $wpdb->get_results( $wpdb->prepare( "SELECT user_id FROM $table WHERE store_id = %d", $store_id ), ARRAY_A );
        $user_ids         = wp_parse_id_list( wp_list_pluck( $users, 'user_id' ) );

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        }

        return array(
            'users'         => $user_ids,
            'primary_owner' => $primary_owner_id,
        );
    }

    /**
     * Get all stores
     *
     * @return array
     */
    public static function get_stores() {
        global $wpdb;

        $table = "{$wpdb->prefix}" . Utill::TABLES['store'];
        $store = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table}" ), ARRAY_A );

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        }

        return $store ? $store : array();
    }

    /**
     * Get store tabs
     *
     * @param int $store_id Store ID.
     * @return array
     */
    public function get_store_tabs( $store_id ) {

        $tabs = array(
            'products' => array(
                'title' => __( 'Products', 'multivendorx' ),
                'url'   => $this->get_store_url( $store_id ),
            ),
        );

        return apply_filters( 'multivendorx_store_tabs', $tabs, $store_id );
    }

    /**
     * Get store URL
     *
     * @param int    $store_id Store ID.
     * @param string $tab Optional tab.
     * @return string
     */
    public function get_store_url( $store_id, $tab = '' ) {
        if ( ! $store_id ) {
            return '';
        }

        $store_data       = new Store( $store_id );
        $store_slug       = $store_data ? $store_data->get( 'slug' ) : '';
        $custom_store_url = MultiVendorX()->setting->get_setting( 'store_url', 'store' );

        $path = '/' . $custom_store_url . '/' . $store_slug . '/';
        if ( $tab ) {
            $tab   = untrailingslashit( trim( $tab, " \n\r\t\v\0/\\" ) );
            $path .= $tab;
            $path  = trailingslashit( $path );
        }

        return apply_filters( 'multivendorx_get_store_url', home_url( $path ), $custom_store_url, $store_id, $tab );
    }

    /**
     * Get store capability
     *
     * @return array
     */
    public static function get_store_capability() {
        $capabilities = array(
            'products'      => array(
                'label'      => 'Manage products',
                'desc'       => 'Allow stores to create, edit, and control their product listings, including uploading media and publishing items for sale.',
                'capability' => array(
                    'read_products'    => 'View products',
                    'add_products'     => 'Add products',
                    'publish_products' => 'Publish products',
                    'edit_published_products'   => 'Edit published products',
                    'edit_approved_products'    => 'Review edits on approved products',
                    'upload_files'     => 'Upload files',
                ),
            ),
            'orders'        => array(
                'label'      => 'Manage orders',
                'desc'       => 'Define how stores interact with customer orders, from viewing and updating details to adding order notes or processing cancellations.',
                'capability' => array(
                    'view_shop_orders'     => 'View orders',
                    'edit_shop_orders'     => 'Edit orders',
                    'delete_shop_orders'   => 'Delete orders',
                    'add_shop_orders_note' => 'Add order notes',
                ),
            ),
            'coupons'       => array(
                'label'      => 'Coupon management',
                'desc'       => 'Enable stores to create and manage discount codes, adjust coupon settings, and track active promotions.',
                'capability' => array(
                    'add_shop_coupons' => 'Add coupons',
                    'read_shop_coupons'   => 'View coupons',
                    'edit_shop_coupons'   => 'Edit coupons',
                    'publish_coupons'     => 'Publish coupons',
                ),
            ),
            'analytics'     => array(
                'label'      => 'Analytics & report',
                'desc'       => 'Give stores access to performance insights, sales data editing, and export options for business tracking and analysis.',
                'capability' => array(
                    'read_shop_report'   => 'View reports',
                    'export_shop_report' => 'Export data',
                ),
            ),
            'inventory'     => array(
                'label'      => 'Inventory management',
                'desc'       => 'Let stores monitor stock levels, update quantities, and set alerts to prevent overselling or stockouts.',
                'capability' => array(
                    'read_inventory'  => 'View inventory',
                    'edit_inventory'  => 'Track stock',
                    'edit_stock_alerts' => 'Set stock alerts',
                ),
            ),
            'commission'    => array(
                'label'      => 'Commission & earning',
                'desc'       => 'Provide stores with tools to review their earnings, track commission history, and request withdrawals when eligible.',
                'capability' => array(
                    'read_shop_earning'       => 'View earning',
                    'edit_withdrawl_request'  => 'Request withdrawl',
                    'view_commission_history' => 'Commission history',
                    'view_transactions'       => 'View Transactions',
                ),
            ),
            'store_support' => array(
                'label'      => 'Store support & engagement',
                'desc'       => 'Manage customer communication, questions, followers, and store feedback.',
                'capability' => array(
                    'view_support_tickets'     => 'View support tickets',
                    'reply_support_tickets'    => 'Reply to support tickets',
                    'view_customer_questions'  => 'View customer questions',
                    'reply_customer_questions' => 'Reply to customer questions',
                    'view_store_followers'     => 'View store followers',
                    'view_store_reviews'       => 'View store reviews',
                    'reply_store_reviews'      => 'Reply to store reviews',
                ),
            ),
            'resources'     => array(
                'label'      => 'Learning & tools',
                'desc'       => 'Access documentation, guides, and helpful tools for store growth.',
                'capability' => array(
                    'view_documentation' => 'View documentation',
                    'access_tools'       => 'Access tools',
                ),
            ),
            'settings'      => array(
                'label'      => 'Store settings',
                'desc'       => 'Control store configuration, preferences, and operational settings.',
                'capability' => array(
                    'manage_store_settings' => 'Manage store settings',
                ),
            ),

        );

        return $capabilities;
    }

    /**
     * Get store registration form data.
     *
     * @param int $store_id Store ID.
     *
     * @return array
     */
    public static function get_store_registration_form( $store_id ) {
        $store = Store::get_store( $store_id );

        // Get core fields from store object.
        $core_fields = array(
            'name'        => 'Store Name',
            'description' => 'Store Description',
            'status'      => 'status',
        );

        $core_data             = array();
        $all_registration_data = array();
        foreach ( $core_fields as $field_key => $field_label ) {
            $core_data[ $field_label ]           = $store->get( $field_key );
            $all_registration_data[ $field_key ] = $store->get( $field_key );
        }

        $all_registration_data['id'] = $store_id;

        // Get registration form data (serialized meta).
        $store_meta     = $store->get_meta( Utill::STORE_SETTINGS_KEYS['registration_data'] );
        $submitted_data = array();
        if ( ! empty( $store_meta ) && is_serialized( $store_meta ) ) {
            $submitted_data = unserialize( $store_meta );
        }

        $meta_keys = array(
            Utill::STORE_SETTINGS_KEYS['phone'],
            Utill::STORE_SETTINGS_KEYS['paypal_email'],
            Utill::STORE_SETTINGS_KEYS['address_1'],
            Utill::STORE_SETTINGS_KEYS['address_2'],
            Utill::STORE_SETTINGS_KEYS['city'],
            Utill::STORE_SETTINGS_KEYS['state'],
            Utill::STORE_SETTINGS_KEYS['country'],
            Utill::STORE_SETTINGS_KEYS['postcode'],
        );

        foreach ( $meta_keys as $key ) {
            $meta_value = $store->get_meta( $key );
            if ( ! empty( $meta_value ) ) {
                $submitted_data[ $key ] = $meta_value;
            }
        }

        // Fetch form settings.
        $form_settings = MultivendorX()->setting->get_option(
            'multivendorx_store_registration_form_settings',
            array()
        );

        // Build map: field_name => field_label.
        $name_label_map   = array();
        $option_label_map = array();
        if ( isset( $form_settings['store_registration_from']['formfieldlist'] ) ) {
            foreach ( $form_settings['store_registration_from']['formfieldlist'] as $field ) {
                if ( ! empty( $field['name'] ) && ! empty( $field['label'] ) ) {
                    $name_label_map[ $field['name'] ] = $field['label'];
                }
                if ( ! empty( $field['options'] ) ) {
                    foreach ( $field['options'] as $key => $options ) {
                        $option_label_map[ $options['value'] ] = $options['label'];
                    }
                }
            }
        }

        $primary_owner_id   = self::get_primary_owner( $store_id );
        $primary_owner_info = get_userdata( $primary_owner_id );

        // Prepare structured response.
        $response = array(
            'core_data'              => $core_data,
            'registration_data'      => array(),
            'all_registration_data'  => $all_registration_data,
            'primary_owner_info'     => $primary_owner_info,
            'store_application_note' => unserialize( $store->get_meta( 'store_reject_note' ) ),
            'store_permanent_reject' => $store->get( Utill::STORE_SETTINGS_KEYS['status'] ) === 'permanently_rejected',
        );

        foreach ( $submitted_data as $field_name => $field_value ) {
            $label = $name_label_map[ $field_name ] ?? $field_name;
            $value = is_array( $field_value )
                ? implode(
                    ', ',
                    array_map(
                        fn( $val ) => $option_label_map[ $val ] ?? $val,
                        $field_value
                    )
                )
                : ( $option_label_map[ $field_value ] ?? $field_value );

            if ( strpos( $field_name, 'attachment' ) !== false ) {
                $attachment_id = absint( $field_value );
                $attachment_type = get_post_mime_type($attachment_id);
                $value      =  [
                    'attachment_type' => $attachment_type,
                    'attachment' => wp_get_attachment_url( $attachment_id )
                ];
            }

            $response['all_registration_data'][ $field_name ] = $field_value;
            if ( in_array( $field_name, $meta_keys, true ) ) {
                $response['core_data'][ $label ] = $field_value;
            } else {
                $response['registration_data'][ $label ] = $value;
            }
        }

        return $response;
    }

    /**
     * Create atachment from array of fiels.
     * @param mixed $files_array
     * @return int|\WP_Error
     */
    public static function create_attachment_from_files_array($files_array) {
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        require_once(ABSPATH . 'wp-admin/includes/media.php');
   
        // Handle the file upload
        $upload = wp_handle_upload($files_array, array('test_form' => false));
    
        
        // Prepare the attachment
        $file_path = $upload['file'];
        $file_name = basename($file_path);
        $file_type = wp_check_filetype($file_name, null);

        // Create attachment post
        $attachment = array(
            'guid' => $upload['url'],
            'post_mime_type' => $file_type['type'],
            'post_title' => preg_replace('/\.[^.]+$/', '', $file_name),
            'post_content' => '',
            'post_status' => 'inherit'
        );

        // Insert attachment into the media library
        $attachment_id = wp_insert_attachment($attachment, $file_path);

        if (!is_wp_error($attachment_id)) {
            // Generate metadata for the attachment, and update the attachment
            $attachment_data = wp_generate_attachment_metadata($attachment_id, $file_path);
            wp_update_attachment_metadata($attachment_id, $attachment_data);

            return $attachment_id; // Return the attachment ID
        }

        return 0;
    }

    /**
     * Get primary owner for a store.
     *
     * @param int $store_id Store ID.
     *
     * @return int User ID.
     */
    public static function get_primary_owner( $store_id ) {
        global $wpdb;
        $table_name    = $wpdb->prefix . Utill::TABLES['store_users'];
        $primary_owner = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT primary_owner FROM $table_name WHERE store_id = %d",
                $store_id
            )
        );

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        }

        return $primary_owner;
    }

    /**
     * Set primary owner for a store.
     *
     * @param int $user_id User ID.
     * @param int $store_id Store ID.
     *
     * @return void
     */
    public static function set_primary_owner( $user_id, $store_id ) {
        global $wpdb;

        $table_name = $wpdb->prefix . Utill::TABLES['store_users'];

        // Check if store_id already exists.
        $exists = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT ID FROM $table_name WHERE store_id = %d",
                $store_id
            )
        );

        if ( $exists ) {
            // Update.
            $wpdb->update(
                $table_name,
                array( 'primary_owner' => $user_id ),
                array( 'store_id' => $store_id ),
                array( '%d' ),
                array( '%d' )
            );
        } else {
            // Insert.
            $wpdb->insert(
                $table_name,
                array(
                    'store_id'      => $store_id,
                    'user_id'       => $user_id,
                    'role_id'       => 'store_owner',
                    'primary_owner' => $user_id,
                ),
                array( '%d', '%d', '%s', '%d' )
            );
        }

        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        }
    }

    /**
     * Get store records from the database based on given filters.
     *
     * @param array $args Filter options like 'ID', 'status', 'name', 'slug', 'description', 'who_created', 'create_time', 'limit', 'offset', 'count'.
     * @return array|int List of stores (array) or count (int) if 'count' is set.
     */
    public static function get_store_information( $args = array() ) {
        global $wpdb;

        $where = array();

        if ( isset( $args['ID'] ) ) {
            $ids     = is_array( $args['ID'] ) ? $args['ID'] : array( $args['ID'] );
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
            $search  = esc_sql( $args['searchField'] );
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

        // ADD SORTING SUPPORT HERE.
        if ( ! empty( $args['orderBy'] ) ) {
            // Only allow safe columns to sort by (avoid SQL injection).
            $allowed_columns = array( 'ID', 'name', 'status', 'slug', 'create_time' );
            $orderBy         = in_array( $args['orderBy'], $allowed_columns, true ) ? $args['orderBy'] : 'ID';
            $order           = ( isset( $args['order'] ) && strtolower( $args['order'] ) === 'desc' ) ? 'DESC' : 'ASC';
            $query          .= " ORDER BY {$orderBy} {$order}";
        }

        // Keep your pagination logic.
        if ( isset( $args['limit'] ) && isset( $args['offset'] ) && empty( $args['count'] ) ) {
            $limit  = intval( $args['limit'] );
            $offset = intval( $args['offset'] );
            $query .= " LIMIT $limit OFFSET $offset";
        }

        if ( isset( $args['count'] ) ) {
            $results = $wpdb->get_var( $query );
        } else {
            $results = $wpdb->get_results( $query, ARRAY_A );
        }

        /** Centralized error logging (only once) */
        if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        }

        return $results ?? ( isset( $args['count'] ) ? 0 : array() );
    }

    /**
     * Get all product IDs that should be excluded based on conditions.
     *
     * @param int  $product_id Product ID.
     * @param int  $store_id Store ID.
     * @param bool $check_payouts Whether to check for payouts.
     * @return boolean
     */
    public static function get_excluded_products( $product_id = '', $store_id = '', $check_payouts = false ) {

        $store_id = ! empty( $store_id ) ? $store_id : get_post_meta( $product_id, Utill::POST_META_SETTINGS['store_id'], true );

        if ( ! $store_id ) {
            return false;
        }
        $store = Store::get_store( $store_id );

        $status           = $store->get( 'status' );
        $review_settings  = MultiVendorX()->setting->get_setting( 'restriction_for_under_review', array() );
        $suspend_settings = MultiVendorX()->setting->get_setting( 'restriction_for_sunspended', array() );

        if ( $check_payouts ) {
            if ( 'under_review' === $status && in_array( 'hold_payments_release', $review_settings, true ) ) {
                return true;
            }

            if ( 'suspended' === $status && in_array( 'freeze_all_payments', $suspend_settings, true ) ) {
                return true;
            }
        } else {
            if ( 'under_review' === $status && in_array( 'pause_selling_products', $review_settings, true ) ) {
                return true;
            }

            if ( 'suspended' === $status && in_array( 'store_visible_in_checkout', $suspend_settings, true ) ) {
                return true;
            }
        }

        return false;
    }

    public static function get_store_visitors( $store_id ) {
        global $wpdb;

        $table_name = $wpdb->prefix . Utill::TABLES['visitors_stats'];

        // Total users (all-time).
        $total_users = $wpdb->get_var(
            $wpdb->prepare(
                "
                SELECT COUNT(DISTINCT user_id)
                FROM {$table_name}
                WHERE store_id = %d
                ",
                $store_id
            )
        );

        // Last 30 days.
        $last_30_days = $wpdb->get_var(
            $wpdb->prepare(
                "
                SELECT COUNT(DISTINCT user_id)
                FROM {$table_name}
                WHERE store_id = %d
                AND created >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                ",
                $store_id
            )
        );

        // Previous 30 days (30–60 days ago).
        $previous_30_days = $wpdb->get_var(
            $wpdb->prepare(
                "
                SELECT COUNT(DISTINCT user_id)
                FROM {$table_name}
                WHERE store_id = %d
                AND created >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)
                AND created < DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                ",
                $store_id
            )
        );

        return [
            'total' => (int) $total_users,
            'last_30_days' => (int) $last_30_days,
            'previous_30_days' => (int) $previous_30_days,
        ];
    }

}
