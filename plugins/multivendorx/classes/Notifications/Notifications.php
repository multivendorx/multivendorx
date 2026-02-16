<?php
/**
 * MultiVendorX Notifications class
 *
 * @package MultiVendorX
 */
namespace MultiVendorX\Notifications;

use MultiVendorX\Utill;
use MultiVendorX\Notifications\Gateways\Twilio;
use MultiVendorX\Notifications\Gateways\Plivo;
use MultiVendorX\Notifications\Gateways\Vonage;
use MultiVendorX\Notifications\Gateways\Clickatell;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Notifications Class.
 *
 * This class handles notifications related functionality.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Notifications {

    /**
     * Events
     *
     * @var array
     */
    public $events = array();

    /**
     * Constructor
     *
     * @return void
     */
    public function __construct() {
        add_action( 'init', array( $this, 'register_notification_hooks' ) );
        $this->insert_system_events();
        add_action( 'multivendorx_clear_notifications', array( $this, 'multivendorx_clear_notifications' ) );
    }

    /**
     * Register notification hooks
     *
     * @return void
     */
    public function register_notification_hooks() {
        foreach ( $this->events as $event => $value ) {
            add_action( "multivendorx_notify_{$event}", array( $this, 'trigger_notifications' ), 10, 2 );
        }
    }

    /**
     * Insert system events
     *
     * @return void
     */
    public function insert_system_events( $new = false ) {
        global $wpdb;

        $this->events = apply_filters(
            'multivendorx_system_events',
            array(
				/* =====================================================
 * STORE STATUS & LIFECYCLE
 * ===================================================== */

'store_pending_approval' => array(
	'name'             => 'Store pending approval',
	'desc'             => 'Store application is submitted and awaiting admin review.',
	'customer_enabled' => true,
	'email_subject'    => 'Your store is under review',
	'email_body'       => 'Thank you for submitting your store “[store_name]”. Your application is currently under review. We will notify you once the review is complete.',
	'sms_content'      => 'Your store is under review.',
	'system_message'   => 'Store “[store_name]” is under review.',
	'tag'              => 'Store',
	'category'         => 'notification',
),

'store_activated' => array(
	'name'             => 'Store activated',
	'desc'             => 'Store has been approved and activated.',
	'customer_enabled' => true,
	'email_subject'    => 'Your store is now active',
	'email_body'       => 'Congratulations! Your store “[store_name]” is now active and visible to customers. You may begin selling immediately.',
	'sms_content'      => 'Store activated.',
	'system_message'   => 'Store activated successfully.',
	'tag'              => 'Store',
	'category'         => 'notification',
),

'store_rejected' => array(
	'name'             => 'Store rejected',
	'desc'             => 'Store application has been rejected.',
	'customer_enabled' => true,
	'email_subject'    => 'Your store application was rejected',
	'email_body'       => 'Your store “[store_name]” has been rejected after review. Please check your dashboard for details and resubmit if applicable.',
	'sms_content'      => 'Store rejected.',
	'system_message'   => 'Store application rejected.',
	'tag'              => 'Store',
	'category'         => 'notification',
),

'store_suspended' => array(
	'name'             => 'Store suspended',
	'desc'             => 'Store has been suspended.',
	'customer_enabled' => true,
	'email_subject'    => 'Your store has been suspended',
	'email_body'       => 'Your store “[store_name]” has been suspended due to compliance or policy issues. Please contact support for further clarification.',
	'sms_content'      => 'Store suspended.',
	'system_message'   => 'Store suspended.',
	'tag'              => 'Store',
	'category'         => 'notification',
),

/* =====================================================
 * ORDER NOTIFICATIONS
 * ===================================================== */

'new_order' => array(
	'name'             => 'New order',
	'desc'             => 'A new order has been placed.',
	'customer_enabled' => true,
	'email_subject'    => 'New order received',
	'email_body'       => 'A new order #[order_id] has been placed. Please review and begin processing.',
	'sms_content'      => 'New order #[order_id] received.',
	'system_message'   => 'New order #[order_id] received.',
	'tag'              => 'Order',
	'category'         => 'notification',
),

'order_completed' => array(
	'name'             => 'Order completed',
	'desc'             => 'An order has been marked as completed.',
	'customer_enabled' => true,
	'email_subject'    => 'Order completed',
	'email_body'       => 'Your order #[order_id] has been successfully completed. Thank you for your purchase.',
	'sms_content'      => 'Order #[order_id] completed.',
	'system_message'   => 'Order #[order_id] completed.',
	'tag'              => 'Order',
	'category'         => 'notification',
),

'order_cancelled' => array(
	'name'             => 'Order cancelled',
	'desc'             => 'An order has been cancelled.',
	'customer_enabled' => true,
	'email_subject'    => 'Order cancelled',
	'email_body'       => 'Order #[order_id] has been cancelled. Please review details in your account.',
	'sms_content'      => 'Order #[order_id] cancelled.',
	'system_message'   => 'Order #[order_id] cancelled.',
	'tag'              => 'Order',
	'category'         => 'notification',
),

'order_delivered_alt' => array(
	'name'             => 'Order delivered',
	'desc'             => 'An order is marked as delivered.',
	'customer_enabled' => true,
	'email_subject'    => 'Order delivered',
	'email_body'       => 'Order #[order_id] has been delivered successfully. We hope you enjoy your purchase.',
	'sms_content'      => 'Order #[order_id] delivered.',
	'system_message'   => 'Order #[order_id] delivered.',
	'tag'              => 'Order',
	'category'         => 'notification',
),

/* =====================================================
 * PRODUCT NOTIFICATIONS
 * ===================================================== */

'product_approved' => array(
	'name'             => 'Product approved',
	'desc'             => 'Product has been approved by admin.',
	'customer_enabled' => true,
	'email_subject'    => 'Your product has been approved',
	'email_body'       => 'Your product “[product_name]” has been approved and is now live on the marketplace.',
	'sms_content'      => 'Product approved.',
	'system_message'   => 'Product “[product_name]” approved.',
	'tag'              => 'Product',
	'category'         => 'notification',
),

'product_rejected' => array(
	'name'             => 'Product rejected',
	'desc'             => 'Product has been rejected.',
	'customer_enabled' => true,
	'email_subject'    => 'Your product was rejected',
	'email_body'       => 'Your product “[product_name]” has been rejected. Please review feedback and resubmit.',
	'sms_content'      => 'Product rejected.',
	'system_message'   => 'Product “[product_name]” rejected.',
	'tag'              => 'Product',
	'category'         => 'notification',
),

/* =====================================================
 * PAYOUT & WITHDRAWAL
 * ===================================================== */

'payout_received' => array(
	'name'             => 'Payout received',
	'desc'             => 'Vendor payout has been processed.',
	'customer_enabled' => true,
	'email_subject'    => 'Payout processed successfully',
	'email_body'       => 'Your payout for order #[order_id] has been successfully processed.',
	'sms_content'      => 'Payout processed.',
	'system_message'   => 'Payout completed.',
	'tag'              => 'Payment',
	'category'         => 'notification',
),

'withdrawal_requested' => array(
	'name'             => 'Withdrawal requested',
	'desc'             => 'Vendor requested withdrawal.',
	'customer_enabled' => false,
	'email_subject'    => 'New withdrawal request',
	'email_body'       => 'Store “[store_name]” has requested a withdrawal of [amount]. Please review and process.',
	'sms_content'      => 'New withdrawal request.',
	'system_message'   => 'Withdrawal requested.',
	'tag'              => 'Payment',
	'category'         => 'notification',
),

/* =====================================================
 * WHOLESALE BUYER
 * ===================================================== */

'wholesale_buyer_approved' => array(
	'name'             => 'Wholesale buyer approved',
	'desc'             => 'User approved as wholesale buyer.',
	'customer_enabled' => true,
	'email_subject'    => 'Wholesale access approved',
	'email_body'       => 'Your wholesale buyer account has been approved. You can now access wholesale pricing.',
	'sms_content'      => 'Wholesale access approved.',
	'system_message'   => 'Wholesale buyer approved.',
	'tag'              => 'Wholesale',
	'category'         => 'notification',
),

'wholesale_buyer_rejected' => array(
	'name'             => 'Wholesale buyer rejected',
	'desc'             => 'Wholesale access request rejected.',
	'customer_enabled' => true,
	'email_subject'    => 'Wholesale access rejected',
	'email_body'       => 'Your request for wholesale access has been rejected. Please contact support if needed.',
	'sms_content'      => 'Wholesale access rejected.',
	'system_message'   => 'Wholesale buyer rejected.',
	'tag'              => 'Wholesale',
	'category'         => 'notification',
),
            )
        );

        if ( ! $new ) {
            $count = $wpdb->get_var(
                "SELECT COUNT(*) FROM {$wpdb->prefix}" . Utill::TABLES['system_events']
            );

            if ( $count > 0 ) {
                return;
            }
        }

        foreach ( $this->events as $key => $event ) {
            $wpdb->insert(
                "{$wpdb->prefix}" . Utill::TABLES['system_events'],
                array(
                    'event_name'       => $event['name'],
                    'description'      => $event['desc'],
                    'admin_enabled'    => $event['admin_enabled'] ?? false,
                    'customer_enabled' => $event['customer_enabled'] ?? false,
                    'store_enabled'    => $event['store_enabled'] ?? false,
                    'system_enabled'   => true,
                    'system_action'    => $key,
                    'email_subject'    => $event['email_subject'] ?? '',
                    'email_body'       => $event['email_body'] ?? '',
                    'sms_content'      => $event['sms_content'] ?? '',
                    'system_message'   => $event['system_message'] ?? '',
                    'status'           => 'active',
                    'custom_emails'    => wp_json_encode( array() ), // empty array.
                    'tag'              => $event['tag'] ?? '',
                    'category'         => $event['category'] ?? '',
                ),
                array(
                    '%s',
                    '%s',
                    '%d',
                    '%d',
                    '%d',
                    '%d',
                    '%s',
                    '%s',
                    '%s',
                    '%s',
                    '%s',
                    '%s',
                    '%s',
                    '%s',
                    '%s',
                )
            );
        }
    }

    /**
     * Trigger notifications.
     *
     * @param string $action_name Action name.
     * @param array  $parameters Parameters.
     * @return void
     */
    public function trigger_notifications( $action_name, $parameters ) {
        global $wpdb;
        $event = $wpdb->get_row(
            $wpdb->prepare( 'SELECT * FROM `' . $wpdb->prefix . Utill::TABLES['system_events'] . '` WHERE system_action = %s', $action_name )
        );

        if ( $event->system_enabled ) {
            $this->send_notifications( $event, $parameters );
        }

        if ( $event->email_enabled ) {
            $receivers = array();

            // System recipients.
            if ( $event->admin_enabled ) {
                $receivers[] = $parameters['admin_email'];
            }

            if ( $event->store_enabled ) {
                $receivers[] = $parameters['store_email'];
            }

            if ( $event->customer_enabled ) {
                $receivers[] = $parameters['customer_email'];
            }

            // Custom recipients.
            if ( ! empty( $event->custom_emails ) && is_array( $event->custom_emails ) ) {
                $receivers = array_merge( $receivers, $event->custom_emails );
            }

            $to      = array_unique( $receivers );
            $subject = $event->email_subject;
            $message = $event->email_body;
            foreach ( $parameters as $key => $value ) {
				$message = str_replace( '[' . $key . ']', $value, $message );
			}
            $headers = array( 'Content-Type: text/html; charset=UTF-8' );

            wp_mail( $to, $subject, $message, $headers );
        }

        if ( $event->sms_enabled ) {
            $receivers = array();

            if ( $event->admin_enabled ) {
				$parameters['admin_phone'] = $parameters['admin_phone']['country_code'] . $parameters['admin_phone']['sms_receiver_phone_number'];
                $receivers[] = $parameters['admin_phone'];
            }

            if ( $event->store_enabled ) {
                $receivers[] = $parameters['store_phone'];
            }

            if ( $event->customer_enabled ) {
                $receivers[] = $parameters['customer_phone'];
            }
			
            $message = $event->sms_content;
			foreach ( $parameters as $key => $value ) {
				$message = str_replace( '[' . $key . ']', $value, $message );
			}

            $gateway = $this->active_gateway();
			if ( $gateway ) {
                foreach ( $receivers as $number ) {
                    $gateway->send( $number, $message );
                }
            }
        }
    }

    /**
     * Send notifications.
     *
     * @param object $event Event object.
     * @param array  $parameters Parameters.
     * @return void
     */
    public function send_notifications( $event, $parameters ) {

        global $wpdb;

        $wpdb->insert(
            "{$wpdb->prefix}" . Utill::TABLES['notifications'],
            array(
                'store_id' => $parameters['store_id'] ?? null,
                'category' => $parameters['category'],
                'type'     => $event->system_action,
                'title'    => $event->event_name,
                'message'  => $event->description,
            ),
            array(
                '%d',
                '%s',
                '%s',
                '%s',
                '%s',
            )
        );
    }

    /**
     * Get all events.
     *
     * @param int|null $id Event ID.
     * @return array|object
     */
    public function get_all_events( $id = null ) {
        global $wpdb;
        $table = "{$wpdb->prefix}" . Utill::TABLES['system_events'];

        $events = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $table" ) );

        if ( ! empty( $id ) ) {
            $events = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT * FROM $table WHERE id = %d",
                    $id
                )
            );
        } else {
            $events = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $table" ) );
        }

        return $events;
    }

    /**
     * Delete all events.
     *
     * @return array|object
     */
    public function delete_all_events() {
        global $wpdb;

        $table = "{$wpdb->prefix}" . Utill::TABLES['system_events'];

        return $wpdb->query( "DELETE FROM $table" );
    }

    public function sync_events() {
        global $wpdb;
        $existing_events = $this->get_all_events();
        $all_events      = $this->events;
        $override_fields = MultiVendorX()->setting->get_setting( 'override_existing_fields', array() );
        $existing_map    = array();

        foreach ( $existing_events as $event ) {
            if ( ! empty( $event->system_action ) ) {
                $existing_map[ $event->system_action ] = $event;
            }
        }

        // DELETE events which is not in main events array.
        $valid_keys = array_keys( $all_events );

        foreach ( $existing_map as $system_action => $existing_event ) {
            if ( ! in_array( $system_action, $valid_keys, true ) ) {
                $wpdb->delete(
                    "{$wpdb->prefix}" . Utill::TABLES['system_events'],
                    array( 'system_action' => $system_action ),
                    array( '%s' )
                );
            }
        }

        foreach ( $all_events as $key => $event ) {
            if ( array_key_exists( $key, $existing_map ) ) {
                $update_fields = array();

                if ( ! empty( $override_fields ) && in_array( 'override_notifiers', $override_fields ) ) {
                    $update_fields['admin_enabled']    = $event['admin_enabled'] ?? false;
                    $update_fields['customer_enabled'] = $event['customer_enabled'] ?? false;
                    $update_fields['store_enabled']    = $event['store_enabled'] ?? false;
                }

                if ( ! empty( $override_fields ) && in_array( 'override_custom', $override_fields ) ) {
                    $update_fields['custom_emails'] = wp_json_encode( $event['custom_emails'] ?? array() );
                }

                if ( ! empty( $override_fields ) && in_array( 'override_email_content', $override_fields ) ) {
                    $update_fields['email_subject'] = $event['email_subject'] ?? null;
                    $update_fields['email_body']    = $event['email_body'] ?? null;
                }

                if ( ! empty( $override_fields ) && in_array( 'override_sms_content', $override_fields ) ) {
                    $update_fields['sms_content'] = $event['sms_content'] ?? null;
                }

                if ( ! empty( $override_fields ) && in_array( 'override_system_content', $override_fields ) ) {
                    $update_fields['system_message'] = $event['system_message'] ?? null;
                }

                if ( ! empty( $update_fields ) ) {
                    $wpdb->update(
                        "{$wpdb->prefix}" . Utill::TABLES['system_events'],
                        $update_fields,
                        array( 'system_action' => $key )
                    );
                }
            } else {
                $wpdb->insert(
                    "{$wpdb->prefix}" . Utill::TABLES['system_events'],
                    array(
                        'event_name'       => $event['name'],
                        'description'      => $event['desc'],
                        'admin_enabled'    => $event['admin_enabled'] ?? false,
                        'customer_enabled' => $event['customer_enabled'] ?? false,
                        'store_enabled'    => $event['store_enabled'] ?? false,
                        'system_enabled'   => true,
                        'system_action'    => $key,
                        'email_subject'    => $event['email_subject'] ?? '',
                        'email_body'       => $event['email_body'] ?? '',
                        'sms_content'      => $event['sms_content'] ?? '',
                        'system_message'   => $event['system_message'] ?? '',
                        'status'           => 'active',
                        'custom_emails'    => wp_json_encode( array() ), // empty array.
                        'tag'              => $event['tag'] ?? '',
                        'category'         => $event['category'] ?? '',
                    )
                );
            }
        }
    }

    /**
     * Get all notifications.
     *
     * @param int|null $store_id Store ID.
     * @return array|object
     */
    public function get_all_notifications( $args = array() ) {
        global $wpdb;
        $table = "{$wpdb->prefix}" . Utill::TABLES['notifications'];

        $events = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM $table WHERE is_dismissed = %d",
                0
            )
        );

        if ( ! empty( $args ) ) {
            $where = array();

            if ( isset( $args['ID'] ) ) {
                $ids     = is_array( $args['ID'] ) ? $args['ID'] : array( $args['ID'] );
                $ids     = implode( ',', array_map( 'intval', $ids ) );
                $where[] = "ID IN ($ids)";
            }

            if ( isset( $args['category'] ) ) {
                $where[] = "category = '" . esc_sql( $args['category'] ) . "'";
            }

            if ( isset( $args['store_id'] ) && ! empty( $args['store_id'] ) ) {
                $where[] = "store_id = '" . esc_sql( $args['store_id'] ) . "'";
            }

            if ( isset( $args['start_date'] ) && isset( $args['end_date'] ) ) {
                $where[] = "created_at BETWEEN '" . esc_sql( $args['start_date'] ) . "' AND '" . esc_sql( $args['end_date'] ) . "'";
            }

            $table = $wpdb->prefix . Utill::TABLES['notifications'];

            if ( isset( $args['count'] ) ) {
                $query   = "SELECT COUNT(*) FROM {$table}";
				$where[] = 'is_dismissed = 0 AND is_read = 0';
            } else {
                $query = "SELECT * FROM {$table}";
            }

            if ( ! empty( $where ) ) {
                $condition = $args['condition'] ?? ' AND ';
                $query    .= ' WHERE ' . implode( $condition, $where );
            }

            // Keep your pagination logic.
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
                return $results ?? array();
            }
        }

        return $events;
    }

    /**
     * Clear notifications based on settings.
     */
    public function multivendorx_clear_notifications() {
        global $wpdb;

        $days = MultiVendorX()->setting->get_setting( 'clear_notifications' );

        $table = "{$wpdb->prefix}" . Utill::TABLES['notifications'];

        $current_date = current_time( 'mysql' );

        // Delete data older than N days or already expired.
        $query = $wpdb->prepare(
            "
            DELETE FROM $table
            WHERE (expires_at IS NOT NULL AND expires_at < %s)
            OR (created_at < DATE_SUB(%s, INTERVAL %d DAY))
            ",
            $current_date,
            $current_date,
            $days
        );

        $wpdb->query( $query );
    }

    public function active_gateway() {
        $gateways = apply_filters(
            'multivendorx_available_sms_gateways',
            array(
				'twilio'     => new Twilio(),
				'vonage'     => new Vonage(),
				'clickatell' => new Clickatell(),
				'plivo'      => new Plivo(),
			)
        );

        $gateway = MultiVendorX()->setting->get_setting( 'sms_gateway_selector' );

        if ( $gateway && array_key_exists( $gateway, $gateways ) ) {
            return new $gateways[ $gateway ]();
        }

        return false;
    }
}
