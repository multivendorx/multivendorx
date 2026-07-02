<?php
/**
 * Notifima REST API Settings controller.
 *
 * @package Notifima
 */

namespace Notifima\RestAPI\Controllers;

use Notifima\Subscriber;
use Notifima\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Subscribers REST API controller.
 *
 * @class       RESTAPI class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Subscribers extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'subscribers';

    /**
     * Register the routes for the objects of the controller.
     */
    public function register_routes() {
        register_rest_route(
            Notifima()->rest_namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_items' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                )
            )
        );

        register_rest_route(
            Notifima()->rest_namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)',
            array(
                array(
                    'methods'             => \WP_REST_Server::EDITABLE,
                    'callback'            => array( $this, 'update_item' ),
                    'permission_callback' => array( $this, 'update_item_permissions_check' ),
                    'args'                => array(
                        'id' => array( 'required' => true ),
                    ),
                ),
            )
        );
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
     * Check if a given request has access to update items.
     *
     * @param \WP_REST_Request The REST request object.
     */
    public function update_item_permissions_check( $request ) {
        $user_id = Notifima()->current_user_id;
        // For non-logged in user.
        if (0 === $user_id && 'everyone' === Notifima()->setting->get_setting( 'is_guest_subscriptions_enable', '' )) {
            return true;
        }

        // Check if user is admin or customer.
        return current_user_can( 'read' ) || current_user_can( 'manage_options' );
    }

    /**
     * Retrieve subscribers.
     *
     * @param \WP_REST_Request The request object.
     */
    public function get_items( $request ) {
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

    /**
     * Update a subscriber.
     *
     * @param \WP_REST_Request The request object.
     */
    public function update_item( $request ) {
        $nonce_check = Utill::validate_nonce( $request );

        if ( is_wp_error( $nonce_check ) ) {
            return $nonce_check;
        }

        try {
            $action = $request->get_param( 'action' );

            if ( 'subscribe' === $action ) {
                return $this->subscribe_user( $request );
            }else if ( 'unsubscribe' === $action ) {
                return $this->unsubscribe_user( $request );
            }

            return rest_ensure_response( false );
        } catch ( \Exception $e ) {
            return new \WP_Error(
                'server_error',
                __('Unexpected server error', 'notifima'),
                array('status' => 500)
            );
        }
    }

    /**
     * Subscribe a user through the REST API.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response
     */
    public function subscribe_user( $request ) {
        $customer_email = $request->get_param( 'customer_email' );
        $product_id     = absint( $request->get_param( 'product_id' ) );
        $product_title  = sanitize_text_field( $request->get_param( 'product_title' ) );
        $variation_id   = absint( $request->get_param( 'variation_id' ) );

        $settings_array = Utill::get_form_settings_array();

        do_action( 'notifima_before_subscribe_product', $customer_email, $product_id, $variation_id );

        if ( ! is_email( $customer_email ) ) {
            return rest_ensure_response(
                array(
                    'status'  => false,
                    'message' => $settings_array['valid_email'],
                )
            );
        }

        if ( ! $product_id ) {
            return rest_ensure_response(
                array(
                    'status'  => false,
                    'message' => __( 'Invalid product.', 'notifima' ),
                )
            );
        }

        $product_id = $variation_id > 0 ? $variation_id : $product_id;

        if ( Subscriber::is_already_subscribed( $customer_email, $product_id ) ) {
            $message = str_replace(
                array( '%product_title%', '%customer_email%' ),
                array( $product_title, $customer_email ),
                $settings_array['alert_email_exist']
            );

            return rest_ensure_response(
                array(
                    'status'               => false,
                    'message'              => $message,
                    'already_subscribed'   => true,
                    'customer_email'       => $customer_email,
                    'product_id'           => $product_id,
                    'variation_id'         => $variation_id,
                    'unsubscribe_button'   => array(
                        'text' => $settings_array['unsubscribe_button_text'],
                    ),
                )
            );
        }

        $subscription_status = apply_filters(
            'notifima_eligible_to_subscribe',
            array(
                'status'  => true,
                'message' => '',
            ),
            $customer_email,
            $product_id
        );

        if ( ! $subscription_status['status'] ) {
            return rest_ensure_response( $subscription_status );
        }

        Subscriber::insert_subscriber( $customer_email, $product_id );
        Subscriber::insert_subscriber_email_trigger(
            wc_get_product( $product_id ),
            $customer_email
        );

        do_action( 'notifima_subscriber_added', $customer_email );

        $message = str_replace(
            array( '%product_title%', '%customer_email%' ),
            array( $product_title, $customer_email ),
            $settings_array['alert_success']
        );

        return rest_ensure_response(
            array(
                'status'  => true,
                'message' => $message,
            )
        );
    }

    /**
     * Unsubscribe a user through the REST API.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response
     */
    public function unsubscribe_user( $request ) {
        $customer_email = sanitize_email( $request->get_param( 'customer_email' ) );
        $product_id     = absint( $request->get_param( 'product_id' ) );
        $variation_id   = absint( $request->get_param( 'variation_id' ) );

        $current_user = Notifima()->current_user;

        if ( ! empty( $current_user ) && empty( $customer_email ) ) {
            $customer_email = $current_user->user_email;
        }

        if ( empty( $customer_email ) ) {
            return rest_ensure_response(
                array(
                    'status'  => false,
                    'message' => __( 'Customer email is required.', 'notifima' ),
                )
            );
        }

        if ( ! $product_id ) {
            return rest_ensure_response(
                array(
                    'status'  => false,
                    'message' => __( 'Invalid product.', 'notifima' ),
                )
            );
        }

        $product = wc_get_product( $product_id );

        if ( $product && $product->is_type( 'variable' ) && $variation_id > 0 ) {
            $success = Subscriber::remove_subscriber( $variation_id, $customer_email );
        } else {
            $success = Subscriber::remove_subscriber( $product_id, $customer_email );
        }

        if ( ! $success ) {
            return rest_ensure_response(
                array(
                    'status'  => false,
                    'message' => __( 'Something went wrong. Please try again.', 'notifima' ),
                )
            );
        }

        $settings_array = Utill::get_form_settings_array();

        $success_msg = str_replace(
            '%customer_email%',
            $customer_email,
            $settings_array['alert_unsubscribe_message']
        );

        return rest_ensure_response(
            array(
                'status'  => true,
                'message' => $success_msg,
            )
        );
    }
}
