<?php
/**
 * Subscriber class file.
 *
 * @package Notifima
 */

namespace Notifima;

defined( 'ABSPATH' ) || exit;

/**
 * Notifima Subscriber class
 *
 * @class       Subscriber class
 * @version     3.0.0
 * @author      MultiVendorX
 */
class Subscriber {

    /**
     * Subscriber constructor.
     */
    public function __construct() {
        add_filter( 'cron_schedules', array( $this, 'register_cron_schedule' ) );
        add_action( 'notifima_retry_notification_cron_job', array( $this, 'send_retry_notification_cron' ) );
        add_action( 'notifima_batch_notification_cron_job', array( $this, 'send_instock_notification' ), 10, 2 );
        add_action( 'woocommerce_update_product', array( $this, 'send_instock_notification' ), 10, 1 );
        add_action( 'delete_post', array( $this, 'delete_product_subscribers' ) );
        add_action( 'notifima_start_subscriber_migration', array( Install::class, 'subscriber_migration' ) );

        if ( Install::is_migration_running() ) {
            $this->register_post_statuses();
        }
        $this->start_cron_job();
    }

    /**
     * Function to register the post status.
     *
     * @return void
     */
    public function register_post_statuses() {
        register_post_status(
            'woo_mailsent',
            array(
				'label'                     => _x( 'Mail Sent', 'woostockalert', 'notifima' ),
				'public'                    => true,
				'exclude_from_search'       => true,
				'show_in_admin_all_list'    => true,
				'show_in_admin_status_list' => true, /* translators: %s: count */
				'label_count'               => _n_noop( 'Mail Sent <span class="count">( %s )</span>', 'Mail Sent <span class="count">( %s )</span>', 'notifima' ),
			)
        );

        register_post_status(
            'woo_subscribed',
            array(
				'label'                     => _x( 'Subscribed', 'woostockalert', 'notifima' ),
				'public'                    => true,
				'exclude_from_search'       => true,
				'show_in_admin_all_list'    => true,
				'show_in_admin_status_list' => true, /* translators: %s: count */
				'label_count'               => _n_noop( 'Subscribed <span class="count">( %s )</span>', 'Subscribed <span class="count">( %s )</span>', 'notifima' ),
			)
        );

        register_post_status(
            'woo_unsubscribed',
            array(
				'label'                     => _x( 'Unsubscribed', 'woostockalert', 'notifima' ),
				'public'                    => true,
				'exclude_from_search'       => true,
				'show_in_admin_all_list'    => true,
				'show_in_admin_status_list' => true, /* translators: %s: count */
				'label_count'               => _n_noop( 'Unsubscribed <span class="count">( %s )</span>', 'Unsubscribed <span class="count">( %s )</span>', 'notifima' ),
			)
        );
    }

    /**
     * Retry failed product notification emails.
     *
     * Finds products that have failed notifications and sends them again.
     * The retry limit is applied per subscriber in get_product_subscribers_email().
     *
     * @return void
     */
    public function send_retry_notification_cron() {
        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $product_ids = $wpdb->get_col(
            $wpdb->prepare(
                "SELECT DISTINCT product_id FROM {$wpdb->prefix}notifima_subscribers WHERE status = %s",
                'notification_failed'
            )
        );

        foreach ( $product_ids as $product_id ) {
            $this->send_instock_notification( $product_id, 'notification_failed' );
        }
    }

    /**
     * Send notifications to product subscribers based on their status.
     *
     * @param int    $product_id The product ID.
     * @param string $status     The subscriber status to process.
     * @return void
     */
    public function send_instock_notification( $product_id, $status = 'subscribed' ) {

        $related_products          = self::get_related_product( $product_id );
        $has_remaining_subscribers = false;

        foreach ( $related_products as $related_product ) {
            if ( $this->notify_all_product_subscribers( wc_get_product( $related_product ), $status ) ) {
                $has_remaining_subscribers = true;
            }
        }

        if ( $has_remaining_subscribers ) {
            wp_schedule_single_event( time() + MINUTE_IN_SECONDS, 'notifima_batch_notification_cron_job', array( $product_id, $status ) );
        }
    }

    /**
     * Send notifications to subscribers of a particular product.
     *
     * @param \WC_Product $product The product object.
     * @param string      $status  The subscriber status to process.
     * @return bool True if subscribers remain, false otherwise.
     */
    public function notify_all_product_subscribers( $product, $status ) {

        if ( ! $product || $product->is_type( 'variable' ) ) {
            return false;
        }

        if ( self::is_product_outofstock( $product ) ) {
            return false;
        }

        $delivery_method = Notifima()->setting->get_setting( 'notification_delivery_method', 'all' );
        $batch_size      = (int) Notifima()->setting->get_setting( 'notification_batch_size', 50 );

        $limit = 'batch' === $delivery_method ? $batch_size : 0;

        $fetch_limit = $limit > 0 ? $limit + 1 : 0;

        $product_subscribers = self::get_product_subscribers_email( $product->get_id(), $fetch_limit, $status );

        if ( empty( $product_subscribers ) ) {
            return false;
        }

        $has_more = $limit > 0 && count( $product_subscribers ) > $limit;

        $product_subscribers = $has_more ? array_slice( $product_subscribers, 0, $limit, true ) : $product_subscribers;

        do_action( 'notifima_send_product_notification', $product->get_id() );

        $email = WC()->mailer()->emails['Product_Back_In_Stock_Email'];

        foreach ( $product_subscribers as $subscribe_id => $to ) {
            $sent           = $email->trigger( $to, $product );
            $updated_status = $sent ? 'notification_sent' : 'notification_failed';
            self::update_subscriber( $subscribe_id, $updated_status );
        }

        self::update_product_subscriber_count( $product->get_id() );

        return $has_more;
    }

    /**
     * Insert a subscriber to a product.
     *
     * @param string $subscriber_email The email address of the subscriber.
     * @param int    $product_id       The ID of the WooCommerce product.
     * @return \WP_Error|bool|int
     */
    public static function insert_subscriber( $subscriber_email, $product_id ) {
        global $wpdb;

        // Get current user id.
        $user_id = Notifima()->current_user_id;

        // Check the email is already registered or not.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $subscriber = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM {$wpdb->prefix}notifima_subscribers
                WHERE product_id = %d
                AND email = %s",
                array( $product_id, $subscriber_email )
            )
        );

        // Update existing subscriber.
        if ( $subscriber ) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $response = $wpdb->update(
                "{$wpdb->prefix}notifima_subscribers",
                array(
                    'status'      => 'subscribed',
                    'create_time' => current_time( 'mysql' ),
                ),
                array( 'id' => $subscriber->id )
            );

            return $response ? $subscriber->id : false;
        }

        // Insert new subscriber.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $response = $wpdb->query(
            $wpdb->prepare(
                "INSERT INTO {$wpdb->prefix}notifima_subscribers
                ( product_id, user_id, email, status )
                VALUES ( %d, %d, %s, %s )
                ON DUPLICATE KEY UPDATE
                status = %s",
                array( $product_id, $user_id, $subscriber_email, 'subscribed', 'subscribed' )
            )
        );

        if ( $response ) {
            self::update_product_subscriber_count( $product_id );

            return $wpdb->insert_id;
        }

        return false;
    }

    /**
     * Function that unsubscribe a particular user if the user is already subscribed
     *
     * @param int    $product_id     The product ID to unsubscribe from.
     * @param string $customer_email The subscriber's email address.
     * @return bool
     */
    public static function remove_subscriber( $product_id, $customer_email ) {
        // Check the user is already subscribed or not.
        $unsubscribe_post = self::is_already_subscribed( $customer_email, $product_id );

        if ( $unsubscribe_post ) {
            if ( is_array( $unsubscribe_post ) ) {
                $unsubscribe_post = $unsubscribe_post[0];
            }

            self::update_subscriber( $unsubscribe_post, 'unsubscribed' );
            self::update_product_subscriber_count( $product_id );

            return true;
        }

        return false;
    }

    /**
     * Delete subscriber on product delete.
     *
     * @param  int $post_id the id of product.
     * @return void
     */
    public static function delete_product_subscribers( $post_id ) {
        global $wpdb;

        if ( get_post_type( $post_id ) !== 'product' ) {
            return;
        }

        // Delete subscriber of deleted product.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->delete( $wpdb->prefix . 'notifima_subscribers', array( 'product_id' => $post_id ) );
        delete_post_meta( $post_id, 'no_of_subscribers' );
    }

    /**
     * Delete a subscriber from database.
     *
     * @param int    $product_id The product ID.
     * @param string $email      The subscriber's email address.
     * @return void
     */
    public static function delete_subscriber( $product_id, $email ) {
        global $wpdb;

        // Delete subscriber of deleted product.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->delete(
            $wpdb->prefix . 'notifima_subscribers',
            array(
				'product_id' => $product_id,
				'email'      => $email,
			)
        );

        self::update_product_subscriber_count( $product_id );
    }

    /**
     * Check if a user subscribed to a product.
     * If the user subscribed to the product it return the subscription ID, Or null.
     *
     * @param  mixed $subscriber_email The subscriber's email.
     * @param  mixed $product_id The product id.
     * @return array | string Subscription ID | null
     */
    public static function is_already_subscribed( $subscriber_email, $product_id ) {
        global $wpdb;

        // Get the result from custom subscribers table.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        return $wpdb->get_var(
            $wpdb->prepare(
                "SELECT id FROM {$wpdb->prefix}notifima_subscribers
                WHERE product_id = %d
                AND email = %s
                AND status = %s",
                array( $product_id, $subscriber_email, 'subscribed' )
            )
        );
    }

    /**
     * Update the subscriber count for a product.
     *
     * @param  mixed $product_id The Product id.
     * @return void
     */
    public static function update_product_subscriber_count( $product_id ) {
        global $wpdb;

        // Get subscriber count.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $subscriber_count = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM {$wpdb->prefix}notifima_subscribers
                WHERE product_id = %d
                AND status = %s",
                $product_id,
                'subscribed'
            )
        );

        // Update subscriber count in product's meta.
        update_post_meta( $product_id, 'no_of_subscribers', $subscriber_count );
    }

    /**
     * Update the status of notifima subscriber.
     *
     * Increments retry_count when the status is 'notification_failed',
     * and resets it to 0 for any other status.
     *
     * @param int    $notifima_id The ID of the subscriber row.
     * @param string $status      The new status to set (e.g., 'subscribed', 'unsubscribed').
     * @return int The subscriber row ID.
     */
    public static function update_subscriber( $notifima_id, $status ) {
        global $wpdb;

        // 1 = failed (increment retry_count), 0 = any other status (reset it).
        $is_failed = (int) ( 'notification_failed' === $status );

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->query(
            $wpdb->prepare(
                "UPDATE {$wpdb->prefix}notifima_subscribers
                SET status = %s, retry_count = IF( %d = 1, retry_count + 1, 0 )
                WHERE id = %d",
                $status,
                $is_failed,
                $notifima_id
            )
        );

        return $notifima_id;
    }

    /**
     * Trigger the email for a indivisual customer in time of subscribe.
     * If additional_alert_email setting is set it will send to admin.
     *
     * @param WC_Product $product         The WooCommerce product object.
     * @param string     $customer_email  The customer's email address.
     * @return void
     */
    public static function insert_subscriber_email_trigger( $product, $customer_email ) {
        // Get email object.
        $admin_mail = WC()->mailer()->emails['Admin_New_Subscriber_Email'];
        $cust_mail  = WC()->mailer()->emails['Subscriber_Confirmation_Email'];

        // Get additional email from global setting.
        $additional_email = Notifima()->setting->get_setting( 'additional_alert_email' );

        // Add vendor's email.
        if ( Utill::is_multivendorx_active() ) {
            $store_id = get_post_meta( $product->get_id(), 'multivendorx_store_id', true );
            $store    = new \MultiVendorX\Store\Store( $store_id );

            if ( $store ) {
                $store_email       = sanitize_email( $store->get( 'email' ) );
                $additional_email .= ', ' . $store_email;
            }
        }

        // Trigger the additional email.
        if ( ! empty( $additional_email ) ) {
            $admin_mail->trigger( $additional_email, $product, $customer_email );
        }

        // Trigger customer email.
        $cust_mail->trigger( $customer_email, $product );
    }

    /**
     * Get the emails of subscribers for a particular product.
     *
     * @param int    $product_id The Product ID.
     * @param int    $limit      Maximum number of subscribers to return.
     * @param string $status     Subscriber status to filter by.
     * @return array Array of subscriber IDs and emails.
     */
    public static function get_product_subscribers_email( $product_id, $limit = 0, $status = 'subscribed' ) {
        global $wpdb;

        $product_id = (int) $product_id;

        if ( $product_id <= 0 ) {
            return array();
        }

        $query = "SELECT id, email FROM {$wpdb->prefix}notifima_subscribers WHERE product_id = %d AND status = %s";
        $args  = array( $product_id, $status );

        // Failed notifications: skip subscribers who reached the max retry attempts.
        if ( 'notification_failed' === $status ) {
            $query .= ' AND retry_count < %d';
            $args[] = (int) Notifima()->setting->get_setting( 'notification_retry_max_attempts', 3 );
        }

        // Lowest retry count first (it is always 0 for other statuses).
        $query .= ' ORDER BY retry_count ASC, id ASC';

        if ( $limit > 0 ) {
            $query .= ' LIMIT %d';
            $args[] = (int) $limit;
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
        $rows = $wpdb->get_results( $wpdb->prepare( $query, $args ) );

        return wp_list_pluck( (array) $rows, 'email', 'id' );
    }

    /**
     * Get all child ids if a prodcut is variable else get product id
     *
     * @param  mixed $product The woocommerce product object.
     * @return array
     */
    public static function get_related_product( $product ) {
        // If product is not woocommerce product object.
        if ( is_numeric( $product ) ) {
            $product = wc_get_product( $product );
        }

        $product_ids = array();

        switch ( $product->get_type() ) {
            case 'variable':
                if ( $product->has_child() ) {
                    $product_ids = $product->get_children();
                } else {
                    $product_ids[] = $product->get_id();
                }
                break;
            case 'simple':
                $product_ids[] = $product->get_id();
                break;
            default:
                $product_ids[] = $product->get_id();
        }

        // WPML support - get all translated product IDs for each product ID.
        $wpml_product_ids = array();
        foreach ( $product_ids as $pid ) {
            $trid = apply_filters( 'wpml_element_trid', null, $pid, 'post_product' );
            if ( $trid ) {
                $translations = apply_filters( 'wpml_get_element_translations', null, $trid, 'post_product' );
                foreach ( $translations as $translation ) {
                    if ( ! empty( $translation->element_id ) ) {
                        $wpml_product_ids[] = (int) $translation->element_id;
                    }
                }
            } else {
                $wpml_product_ids[] = $pid;
            }
        }
        return array_unique( $wpml_product_ids );
    }

    /**
     * Bias variable is used to controll biasness of outcome in uncertain input
     * Bias = true->product outofstock | Bias = false->product instock
     *
     * @param  \WC_Product $product The Product object.
     * @return mixed
     */
    public static function is_product_outofstock( $product ) {

        if ( $product->is_type( 'variation' ) ) {
            $child_obj      = new \WC_Product_Variation( $product->get_id() );
            $manage_stock   = $child_obj->managing_stock();
            $stock_quantity = intval( $child_obj->get_stock_quantity() );
            $stock_status   = $child_obj->get_stock_status();
        } else {
            $manage_stock   = $product->get_manage_stock();
            $stock_quantity = $product->get_stock_quantity();
            $stock_status   = $product->get_stock_status();
        }

        $is_enable_backorders = Notifima()->setting->get_setting( 'is_enable_backorders', array() );

        if ( $manage_stock ) {
            if ( $stock_quantity <= (int) get_option( 'woocommerce_notify_no_stock_amount' ) ) {
                return true;
            } elseif ( $stock_quantity <= 0 ) {
                return true;
            }
        } elseif ( 'onbackorder' === $stock_status && in_array( 'onbackorder', $is_enable_backorders, true ) ) {
            return true;
        } elseif ( 'outofstock' === $stock_status ) {
            return true;
        }

        return false;
    }

    /**
     * Register the custom cron schedule for retry notifications.
     *
     * @param array $schedules Existing WordPress cron schedules.
     * @return array Updated cron schedules.
     */
    public function register_cron_schedule( $schedules ) {
        $retry_interval = Notifima()->setting->get_setting( 'notification_retry_interval', 'hourly' );

        $intervals = array(
            'hourly'    => HOUR_IN_SECONDS,
            'six_hours' => 6 * HOUR_IN_SECONDS,
            'daily'     => DAY_IN_SECONDS,
        );

        $schedules['notifima_retry'] = array(
            'interval' => $intervals[ $retry_interval ] ?? HOUR_IN_SECONDS,
            'display'  => __( 'Notifima Retry Interval', 'notifima' ),
        );

        return $schedules;
    }

    /**
     * Schedule the retry notification cron job.
     *
     * @return void
     */
    private function start_cron_job() {
        if ( 'yes' !== Notifima()->setting->get_setting( 'notification_retry_enable', 'no' ) ) {
            wp_clear_scheduled_hook( 'notifima_retry_notification_cron_job' );
            return;
        }

        if ( ! wp_next_scheduled( 'notifima_retry_notification_cron_job' ) ) {
            wp_schedule_event( time(), 'notifima_retry', 'notifima_retry_notification_cron_job' );
        }
    }
}
