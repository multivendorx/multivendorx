<?php
/**
 * AI Assistant REST API Controller
 *
 * @package MultiVendorXPro
 */

namespace MultiVendorX\Intelligence;

use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

class Rest extends \WP_REST_Controller {

    protected $rest_base = 'intelligence';

    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ), 10 );
    }

    public function register_routes() {
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'get_items' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                ),
            )
        );
    }

    public function get_items_permissions_check( $request ) {
        return Utill::current_user_has_capability( array( 'edit_products' ) );
    }

    /**
     * Handle AI request (main entry point).
     */
    public function get_items( $request ) {
        if ( ! wp_verify_nonce( $request->get_header( 'X-WP-Nonce' ), 'wp_rest' ) ) {
            return $this->error_response( 'invalid_nonce', __( 'Invalid nonce.', 'multivendorx' ), 401 );
        }

        try {
            $endpoint = sanitize_text_field( $request->get_param( 'endpoint' ) );

            if ( 'suggestions' === $endpoint ) {
                return $this->generate_suggestions( $request );
            }
            if ( 'image' === $endpoint ) {
                return apply_filters( 'multivendorx_ai_image_generation', $request );
            }
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );
            return $this->error_response( 'exception', __( 'Server error.', 'multivendorx' ), 500 );
        }
    }

    /**
     * Generate AI suggestions.
     */
    private function generate_suggestions( $request ) {
        $user_prompt = sanitize_textarea_field( $request->get_param( 'user_prompt' ) );
        if ( empty( $user_prompt ) ) {
			return $this->error_response( 'prompt_missing', 'Prompt is required.' );
        }

        $provider = MultiVendorX()->setting->get_setting( 'choose_ai_provider' );
        $prompt   = "Expert product generator. Request: {$user_prompt}. Return ONLY valid JSON: {\"productName\":[], \"shortDescription\":[], \"productDescription\":[]}";

        // Strategy Map for providers - Use the Fully Qualified Class Name
        $api_map = array(
            'gemini_api'     => array( \MultiVendorX\Intelligence\Util::class, 'call_gemini_api' ),
            'openai_api'     => array( \MultiVendorX\Intelligence\Util::class, 'call_openai_api' ),
            'openrouter_api' => array( \MultiVendorX\Intelligence\Util::class, 'call_openrouter_api' ),
        );

        if ( ! isset( $api_map[ $provider ] ) ) {
			return $this->error_response( 'unsupported', 'Provider not supported.' );
        }

        $api_key = MultiVendorX()->setting->get_setting( $provider . '_key' );

        $response = call_user_func( $api_map[ $provider ], $api_key, $prompt );
        if ( isset( $response['error'] ) ) {
            return $this->error_response( $response['error']['code'], $response['error']['message'], $response['error']['status'] );
        }

        $data = json_decode( $response, true );

        return rest_ensure_response(
            array(
				'success'            => true,
				'productName'        => array_slice( (array) ( $data['productName'] ?? array() ), 0, 3 ),
				'shortDescription'   => array_slice( (array) ( $data['shortDescription'] ?? array() ), 0, 3 ),
				'productDescription' => array_slice( (array) ( $data['productDescription'] ?? array() ), 0, 3 ),
            )
        );
    }

    /**
     * Helper: DRY Error Response
     */
    private function error_response( $code, $message, $status = 400 ) {
        return new \WP_REST_Response(
            array(
				'success' => false,
				'code'    => $code,
				'message' => $message,
            ),
            $status
        );
    }
}
