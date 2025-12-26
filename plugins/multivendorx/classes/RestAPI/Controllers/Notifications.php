<?php
/**
 * MultiVendorX REST API Notifications controller.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\RestAPI\Controllers;

use MultiVendorX\Utill;
use MultiVendorx\Store\Store;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX REST API Notifications controller.
 *
 * @class       Notifications class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Notifications extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'notifications';

    /**
     * Register the routes for notifications.
     */
    public function register_routes() {
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base,
            array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
				),
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_items' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
				),
			)
        );

        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)',
            array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_item' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
					'args'                => array(
						'id' => array( 'required' => true ),
					),
				),
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_item' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
				),
			)
        );
    }

    /**
     * Check if a given request has access to read notifications.
     *
     * @param object $request WP_REST_Request object.
     */
    public function get_items_permissions_check( $request ) {
        return true;
    }

    /**
     * Check if a given request has access to create a notification.
     *
     * @param object $request WP_REST_Request object.
     */
    public function create_item_permissions_check( $request ) {
        return true;
    }

    /**
     * Check if a given request has access to read notifications.
     *
     * @param object $request WP_REST_Request object.
     */
    public function update_item_permissions_check( $request ) {
        return true;
    }

    /**
     * Get all notifications.
     *
     * @param object $request WP_REST_Request object.
     */
    public function get_items( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            // Log the error.
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log( $error );
            }

            return $error;
        }
        try {
            $header_notifications = $request->get_param( 'header' );
            $events_notifications = $request->get_param( 'events' );

            if ( $header_notifications ) {
                $store_id = $request->get_param( 'store_id' );
                $results  = MultiVendorX()->notifications->get_all_notifications( ! empty( $store_id ) ? $store_id : null );

                $formated_notifications = array();

                foreach ( $results as $row ) {
                    $formated_notifications[] = array(
                        'id'      => (int) $row->id,
                        'icon'    => 'adminlib-cart',
                        'title'   => $row->title,
                        'message' => $row->message,
                        'time'    => $this->time_ago( $row->created_at ),
                    );
                }

                return rest_ensure_response( $formated_notifications );
            }

            if ( $events_notifications ) {
                $results = MultiVendorX()->notifications->get_all_events();

                $formated_notifications = array();

                foreach ( $results as $row ) {
                    $custom_emails = ! empty( $row->custom_emails )
                        ? json_decode( $row->custom_emails, true )
                        : array();

                    // Build recipients array.
                    $recipients = array();
                    $id         = 1;

                    $recipients[] = array(
                        'id'        => $id++,
                        'type'      => 'Store',
                        'label'     => 'Store',
                        'enabled'   => (bool) $row->store_enabled,
                        'canDelete' => false,
                    );

                    $recipients[] = array(
                        'id'        => $id++,
                        'type'      => 'Admin',
                        'label'     => 'Admin',
                        'enabled'   => (bool) $row->admin_enabled,
                        'canDelete' => false,
                    );

                    // Add any custom emails.
                    foreach ( $custom_emails as $email ) {
                        $recipients[] = array(
                            'id'        => $id++,
                            'type'      => 'extra',
                            'label'     => $email,
                            'enabled'   => true,
                            'canDelete' => true,
                        );
                    }

                    $channels = array(
                        'mail'   => (bool) $row->email_enabled,
                        'sms'    => (bool) $row->sms_enabled,
                        'system' => (bool) $row->system_enabled,
                    );

                    $formated_notifications[] = array(
                        'id'          => (int) $row->id,
                        'icon'        => 'adminlib-cart',
                        'event'       => $row->event_name,
                        'description' => $row->description,
                        'tag'         => $row->tag,
                        'category'    => $row->category,
                        'recipients'  => $recipients,
                        'channels'    => $channels,
                    );
                }

                return rest_ensure_response( $formated_notifications );
            }

            $count = $request->get_param( 'count' );

            if ( $count ) {
                return MultiVendorX()->notifications->get_all_notifications(
                    null,
                    array(
                        'count'    => true,
                        'category' => $request->get_param( 'notification' ) ? 'notification' : 'activity',
                        'store_id' => $request->get_param( 'store_id' ) ? $request->get_param( 'store_id' ) : '',
                    )
                );
            }

            $limit  = max( intval( $request->get_param( 'row' ) ), 10 );
            $page   = max( intval( $request->get_param( 'page' ) ), 1 );
            $offset = ( $page - 1 ) * $limit;

            $args = array(
                'limit'    => $limit,
                'offset'   => $offset,
                'category' => $request->get_param( 'notification' ) ? 'notification' : 'activity',
                'store_id' => $request->get_param( 'store_id' ) ? $request->get_param( 'store_id' ) : '',
            );

            $all_notifications = MultiVendorX()->notifications->get_all_notifications( null, $args );
            $notifications     = array();
            foreach ( $all_notifications as $notification ) {
                $store           = new Store( (int) $notification['store_id'] );
                $notifications[] = apply_filters(
                    'multivendorx_stores',
                    array(
                        'store_id'   => (int) $notification['store_id'],
                        'store_name' => $store->get( Utill::STORE_SETTINGS_KEYS['name'] ),
                        'type'       => $notification['type'],
                        'title'      => $notification['title'],
                        'date'       => gmdate( 'M j, Y', strtotime( $notification['created_at'] ) ),
                    )
                );
            }

            return rest_ensure_response( $notifications );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }

    public function update_items ( $request ) {
        $sync_notifications = MultiVendorX()->setting->get_setting( 'sync_notifications', '' );

        if ($sync_notifications == 'sync_only_new_entry') {
            MultiVendorX()->notifications->delete_all_events();
            MultiVendorX()->notifications->insert_system_events(true);
        } 

        if ($sync_notifications == 'sync_existing_entry') {
            MultiVendorX()->notifications->sync_events();
        }
    }

    /**
     * Calculate time difference between current time and given datetime.
     *
     * @param string $datetime Datetime in MySQL format.
     */
    public function time_ago( $datetime ) {
        if ( empty( $datetime ) ) {
			return '';
        }

        $timestamp = strtotime( $datetime );
        $diff      = time() - $timestamp;

        if ( $diff < 60 ) {
            return $diff . ' seconds ago';
        } elseif ( $diff < 3600 ) {
            return floor( $diff / 60 ) . ' minutes ago';
        } elseif ( $diff < 86400 ) {
            return floor( $diff / 3600 ) . ' hours ago';
        } elseif ( $diff < 604800 ) {
            return floor( $diff / 86400 ) . ' days ago';
        } else {
            return gmdate( 'M j, Y', $timestamp );
        }
    }

    /**
     * Update an existing notification.
     *
     * @param object $request The request object.
     */
    public function update_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            // Log the error.
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log( $error );
            }

            return $error;
        }
        try {
            global $wpdb;
            $notification_data = $request->get_param( 'notifications' );

            $is_dismissed = $request->get_param( 'is_dismissed' );
            $id           = $request->get_param( 'id' );
            $form_data    = $request->get_param( 'formData' );

            if ( ! empty( $form_data ) ) {
                $data = array(
                    'email_subject'  => $form_data['email_subject'],
                    'email_body'     => $form_data['email_body'],
                    'sms_content'    => $form_data['sms_content'],
                    'system_message' => $form_data['system_message'],
                );

                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $updated = $wpdb->update( "{$wpdb->prefix}" . Utill::TABLES['system_events'], $data, array( 'id' => $form_data['id'] ), array( '%s', '%s', '%s', '%s' ), array( '%d' ) );

                return rest_ensure_response(
                    array(
                        'success' => true,
                    )
                );
            }

            if ( $is_dismissed ) {
                $data = array(
                    'is_dismissed' => $is_dismissed,
                );

                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $updated = $wpdb->update( "{$wpdb->prefix}" . Utill::TABLES['notifications'], $data, array( 'id' => $id ), null, array( '%s' ) );

                return rest_ensure_response(
                    array(
                        'success' => true,
                    )
                );
            }

            if ( empty( $notification_data ) || ! is_array( $notification_data ) ) {
                return new \WP_Error( 'invalid_data', __( 'Invalid notification data', 'multivendorx' ), array( 'status' => 400 ) );
            }

            foreach ( $notification_data as $notification ) {
                $id = intval( $notification['id'] );

                $channels = $notification['channels'] ?? array();
                if ( ! empty( $channels ) ) {
                    $email_enabled  = $channels['mail'] ?? false;
                    $sms_enabled    = $channels['sms'] ?? false;
                    $system_enabled = $channels['system'] ?? false;
                }

                $store_enabled = 0;
                $admin_enabled = 0;
                $custom_emails = array();

                if ( ! empty( $notification['recipients'] ) && is_array( $notification['recipients'] ) ) {
                    foreach ( $notification['recipients'] as $recipient ) {
                        if ( 'Store' === $recipient['type'] ) {
                            $store_enabled = $recipient['enabled'] ?? false;
                        } elseif ( 'Admin' === $recipient['type'] ) {
                            $admin_enabled = $recipient['enabled'] ?? false;
                        } elseif ( 'extra' === $recipient['type'] ) {
                            $custom_emails[] = sanitize_email( $recipient['label'] );
                        }
                    }
                }

                $custom_emails_json = ! empty( $custom_emails ) ? wp_json_encode( $custom_emails ) : null;

                $update_data = array(
                    'email_enabled'  => $email_enabled,
                    'sms_enabled'    => $sms_enabled,
                    'system_enabled' => $system_enabled,
                    'store_enabled'  => $store_enabled,
                    'admin_enabled'  => $admin_enabled,
                    'custom_emails'  => $custom_emails_json,
                );

                $where = array( 'id' => $id );
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $updated = $wpdb->update( "{$wpdb->prefix}" . Utill::TABLES['system_events'], $update_data, $where, null, array( '%d' ) );
            }

            if ( $updated ) {
                return rest_ensure_response(
                    array(
                        'success' => true,
                        'message' => __( 'Notification(s) updated successfully.', 'multivendorx' ),
                    )
                );
            }
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }

    /**
     * Get a single notification by ID.
     *
     * @param object $request The request object.
     */
    public function get_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            // Log the error.
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log( $error );
            }

            return $error;
        }
        try {
            $id = $request->get_param( 'id' );

            $results = MultiVendorX()->notifications->get_all_events( $id );

            return rest_ensure_response( $results );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }
}
