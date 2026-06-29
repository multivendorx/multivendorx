<?php
/**
 * RESTAPI class file.
 *
 * @package Notifima
 */

namespace Notifima;

defined( 'ABSPATH' ) || exit;

/**
 * Notifima RestAPI class
 *
 * @class       RestAPI class
 * @version     3.0.0
 * @author      MultiVendorX
 */
class RestAPI {

    /**
     * RestAPI constructor.
     */
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_rest_api' ) );
    }

    /**
     * Rest api register function call on rest_api_init action hook.
     *
     * @return void
     */
    public function register_rest_api() {
        register_rest_route(
            Notifima()->rest_namespace,
            '/settings',
            array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'save_settings' ),
				'permission_callback' => array( $this, 'notifima_permission' ),
			)
        );

        register_rest_route(
            Notifima()->rest_namespace,
            '/stock-notification-form',
            array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_stock_notification_form' ),
				'permission_callback' => array( $this, 'notifima_permission' ),
			)
        );

        register_rest_route(
            Notifima()->rest_namespace,
            '/subscribers',
            array(
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_subscriber' ),
                'permission_callback' => array( $this, 'get_items_permissions_check' ),
            )
        );

    }

    /**
     * Notifima api permission function.
     *
     * @return bool
     */
    public function notifima_permission() {
        return current_user_can( 'manage_options' );
    }

    /**
     * Check if a given request has access to get items.
     *
     * @param \WP_REST_Request The REST request object.
     */
    public function get_items_permissions_check( $request ) {
        return current_user_can( 'manage_options' ) || current_user_can( 'edit_stores' );// phpcs:ignore WordPress.WP.Capabilities.Unknown
    }

    /**
     * Save settings.
     *
     * @param \WP_REST_Request $request The REST request object.
     */
    public function save_settings( $request ) {
        $nonce_check = Utill::validate_nonce( $request );

        if ( is_wp_error( $nonce_check ) ) {
            return $nonce_check;
        }
        try {
            $settings = $request->get_param( 'setting' );
            $settings_key      = $request->get_param( 'settingName' );
            $settings_key      = str_replace( '-', '_', $settings_key );
            $option_name       = 'notifima_' . $settings_key . '_settings';

            // save the settings in database.
            Notifima()->setting->update_option( $option_name, $settings );

            do_action( 'notifima_after_save_settings', $settings_key, $settings );

            return array(
                'type'    => 'success',
                'message' => __( 'Settings Saved', 'notifima' ),
            );
        } catch ( \Exception $e ) {
			return new \WP_Error(
                'server_error',
                __('Unexpected server error', 'notifima'),
                array('status' => 500)
            );
        }
    }

    /**
     * Get stock notification form
     *
     * @param \WP_REST_Request $request The REST request object.
     */
    public function get_stock_notification_form( $request ) {
        $nonce_check = Utill::validate_nonce( $request );

        if ( is_wp_error( $nonce_check ) ) {
            return $nonce_check;
        }
        try {
            $product_id = $request->get_param( 'product_id' );

            // Start output buffering.
            ob_start();

            Notifima()->frontend->display_product_subscription_form( intval( $product_id ) );

            // Return the output.
            return rest_ensure_response( array( 'html' => ob_get_clean() ) );
        } catch ( \Exception $e ) {
			return new \WP_Error(
                'server_error',
                __('Unexpected server error', 'notifima'),
                array('status' => 500)
            );
        }
    }

    /**
     * Retrieve subscribers.
     *
     * @param \WP_REST_Request The request object.
     */
    public function get_subscriber( $request ) {
        $nonce_check = Utill::validate_nonce( $request );

        if ( is_wp_error( $nonce_check ) ) {
            return $nonce_check;
        }

        try {
            $export = rest_sanitize_boolean( $request->get_param( 'export' ) );

            if ( ! $export ) {
                $response = rest_ensure_response( array() );
                return apply_filters( 'notifima_pro_subscribers_list', $response, $request );
            }

            $query_args = array(
                'post_type'      => array( 'product', 'product_variation' ),
                'post_status'    => 'publish',
                'posts_per_page' => -1,
                'fields'         => 'ids',
            );

            $product_ids = get_posts( $query_args );
            
            $subscriber_records = Utill::get_subscribers( $product_ids );

            $subscriber_items = array();

            foreach ( $subscriber_records as $subscriber ) {
                $product = wc_get_product( $subscriber->product_id );
                $image   = get_the_post_thumbnail_url( $subscriber->product_id, 'full' );
                $user    = get_user_by( 'email', $subscriber->email );
                $date    = wp_date( get_option( 'date_format' ), strtotime( $subscriber->create_time ) );

                $statuses = array(
                    'mailsent' => __( 'Mail Sent', 'notifima' ),
                    'subscribed' => __( 'Subscribed', 'notifima' ),
                    'unsubscribed' => __( 'Unsubscribed', 'notifima' ),
                );

                $status_key        = $subscriber->status;
                $subscriber_status = $statuses[ $status_key ] ?? '-';

                $subscriber_items[] = apply_filters(
                    'notifima_all_subscribers_list',
                    array(
                        'id'         => $subscriber->id,
                        'date'       => $date,
                        'email'      => $subscriber->email,
                        'status'     => $subscriber_status,
                        'status_key' => $status_key,
                        'reg_user'   => $user ? __( 'Yes', 'notifima' ): __( 'No', 'notifima' ),
                        'user_link'  => $user ? get_edit_user_link( $user->ID ) : '',
                        'product'    => $product ? $product->get_name() : '',
                        'product_id' => $product ? $product->get_id() : '',
                        'image'      => $image  ?: wc_placeholder_img_src(),
                    ),
                    $subscriber
                );
            }

            return rest_ensure_response( $subscriber_items );
        } catch ( \Exception $e ) {
            return new \WP_Error(
                'server_error',
                __('Unexpected server error', 'notifima'),
                array('status' => 500)
            );
        }
    }
}
