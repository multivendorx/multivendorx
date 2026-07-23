<?php
/**
 * Settings controller file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\RestAPI\Controllers;

use VuloPilot\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * GET/POST /settings backs src/pages/Settings/Settings.tsx. Reads/writes
 * a single wp_options row (Utill::VULOPILOT_SETTINGS_KEY), not a custom
 * table — see Utill::VULOPILOT_SETTINGS_DEFAULTS's docblock for why.
 *
 * @class       Settings controller
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Settings extends \WP_REST_Controller {

    /**
     * @var string
     */
    protected $rest_base = 'settings';

    /**
     * @inheritDoc
     */
    public function register_routes() {
        register_rest_route(
            VuloPilot()->rest_namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_items' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
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
     * @inheritDoc
     */
    public function get_items_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * @inheritDoc
     */
    public function update_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * @inheritDoc
     */
    public function get_items( $request ) {
        $saved = get_option( Utill::VULOPILOT_SETTINGS_KEY, array() );

        return rest_ensure_response(
            wp_parse_args( is_array( $saved ) ? $saved : array(), Utill::VULOPILOT_SETTINGS_DEFAULTS )
        );
    }

    /**
     * @inheritDoc
     */
    public function update_item( $request ) {
        $scan_frequency = sanitize_key( (string) $request->get_param( 'scan_frequency' ) );

        if ( '' === $scan_frequency ) {
            $scan_frequency = Utill::VULOPILOT_SETTINGS_DEFAULTS['scan_frequency'];
        } elseif ( ! in_array( $scan_frequency, array( 'hourly', 'daily', 'weekly' ), true ) ) {
            return new \WP_Error( 'vulopilot_invalid_scan_frequency', __( 'Invalid scan frequency.', 'vulopilot' ), array( 'status' => 400 ) );
        }

        $notification_email = sanitize_email( (string) $request->get_param( 'notification_email' ) );

        update_option(
            Utill::VULOPILOT_SETTINGS_KEY,
            array(
                'scan_frequency'     => $scan_frequency,
                'notification_email' => $notification_email,
            )
        );

        return rest_ensure_response( array( 'success' => true ) );
    }
}
