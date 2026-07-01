<?php
/**
 * Notifima REST API Settings controller.
 *
 * @package Notifima
 */

namespace Notifima\RestAPI\Controllers;

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
}
