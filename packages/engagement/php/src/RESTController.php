<?php
/**
 * RESTController class file.
 *
 * @package MultivendorX\Engagement
 */

namespace MultivendorX\Engagement;

defined( 'ABSPATH' ) || exit;

/**
 * REST endpoints for the Engagement Framework. Registered under each consuming plugin's own
 * REST namespace (passed in by Engagement::init()) rather than minting a namespace of its
 * own - there is no single owning plugin for a shared package.
 *
 * Never exposes unrestricted notice creation: this controller only ever reads the existing
 * queue/preferences or applies an interaction/consent decision a capability check allows.
 *
 * @package MultivendorX\Engagement
 */
class RESTController {

    /**
     * Owning REST namespace.
     *
     * @var string
     */
    private $namespace;

    /**
     * Shared notice manager.
     *
     * @var NoticeManager
     */
    private $notices;

    /**
     * Shared telemetry manager.
     *
     * @var TelemetryManager
     */
    private $telemetry;

    /**
     * Constructor.
     *
     * @param string           $rest_namespace REST namespace to register under (e.g. 'notifima/v1').
     * @param NoticeManager    $notices        Shared notice manager.
     * @param TelemetryManager $telemetry      Shared telemetry manager.
     */
    public function __construct( $rest_namespace, NoticeManager $notices, TelemetryManager $telemetry ) {
        $this->namespace = $rest_namespace;
        $this->notices   = $notices;
        $this->telemetry = $telemetry;

        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    /**
     * Register the four engagement REST routes.
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace,
            '/engagement/notices',
            array(
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_notices' ),
                'permission_callback' => array( $this, 'permissions_check' ),
            )
        );

        register_rest_route(
            $this->namespace,
            '/engagement/notices/(?P<id>[a-z0-9_-]+)/interaction',
            array(
                'methods'             => \WP_REST_Server::CREATABLE,
                'callback'            => array( $this, 'post_interaction' ),
                'permission_callback' => array( $this, 'permissions_check' ),
                'args'                => array(
                    'id' => array(
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_key',
                    ),
                ),
            )
        );

        register_rest_route(
            $this->namespace,
            '/engagement/preferences',
            array(
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_preferences' ),
                'permission_callback' => array( $this, 'permissions_check' ),
            )
        );

        register_rest_route(
            $this->namespace,
            '/engagement/consent',
            array(
                'methods'             => \WP_REST_Server::CREATABLE,
                'callback'            => array( $this, 'post_consent' ),
                'permission_callback' => array( $this, 'permissions_check' ),
            )
        );
    }

    /**
     * Capability + nonce check shared by every engagement route. Engagement notices are an
     * admin-facing concern (shown in wp-admin), so `manage_options` is the correct bar.
     *
     * @param \WP_REST_Request $request Request instance.
     * @return bool
     */
    public function permissions_check( \WP_REST_Request $request ) {
        if ( ! current_user_can( 'manage_options' ) ) {
			return false;
        }

        $nonce = $request->get_header( 'X-WP-Nonce' );
        return (bool) $nonce && wp_verify_nonce( $nonce, 'wp_rest' );
    }

    /**
     * GET /engagement/notices - eligible notices only, already priority-sorted and
     * frequency-filtered by NoticeManager.
     *
     * @return \WP_REST_Response
     */
    public function get_notices() {
        return rest_ensure_response( $this->notices->get_eligible_notices() );
    }

    /**
     * POST /engagement/notices/{id}/interaction.
     *
     * @param \WP_REST_Request $request Request instance.
     * @return \WP_REST_Response|\WP_Error
     */
    public function post_interaction( \WP_REST_Request $request ) {
        $notice_id   = $request->get_param( 'id' );
        $interaction = sanitize_key( (string) $request->get_param( 'interaction' ) );
        $payload     = (array) $request->get_param( 'payload' );

        $result = $this->notices->handle_interaction( $notice_id, $interaction, $payload );

        if ( is_wp_error( $result ) ) {
            return $result;
        }

        return rest_ensure_response( array( 'success' => true ) );
    }

    /**
     * GET /engagement/preferences - current telemetry consent record only (the rest of
     * `multivendorx_engagement_settings` is internal, not a public preferences surface).
     *
     * @return \WP_REST_Response
     */
    public function get_preferences() {
        return rest_ensure_response(
            array(
                'telemetry_consent' => $this->telemetry->get_consent(),
                'should_prompt'     => $this->telemetry->should_prompt_for_consent(),
            )
        );
    }

    /**
     * POST /engagement/consent - accept|decline|dismiss|revoke.
     *
     * @param \WP_REST_Request $request Request instance.
     * @return \WP_REST_Response|\WP_Error
     */
    public function post_consent( \WP_REST_Request $request ) {
        $decision = sanitize_key( (string) $request->get_param( 'decision' ) );

        if ( ! $this->telemetry->apply_consent_decision( $decision ) ) {
            return new \WP_Error( 'engagement_invalid_consent_decision', 'Unknown consent decision.', array( 'status' => 400 ) );
        }

        return rest_ensure_response( array( 'telemetry_consent' => $this->telemetry->get_consent() ) );
    }
}
