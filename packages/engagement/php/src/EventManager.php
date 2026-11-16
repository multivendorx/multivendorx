<?php
/**
 * EventManager class file.
 *
 * @package MultivendorX\Engagement
 */

namespace MultivendorX\Engagement;

defined( 'ABSPATH' ) || exit;

/**
 * Shared event bus. Dispatches framework events to registered listeners (used by
 * CampaignManager for eligibility checks) and, independently, forwards events to
 * TelemetryManager for optional transmission. Local listener processing always runs,
 * regardless of telemetry consent - see CLAUDE spec section 10, Path A vs Path B.
 *
 * @package MultivendorX\Engagement
 */
class EventManager {

    const KNOWN_EVENTS = array(
        'plugin_activated',
        'setup_completed',
        'settings_updated',
        'feature_used',
        'notice_impression',
        'notice_clicked',
        'notice_dismissed',
        'feedback_submitted',
    );

    /**
     * Registered listeners, keyed by event name.
     *
     * @var array<string, callable[]>
     */
    private $listeners = array();

    /**
     * Shared telemetry manager, wired in after construction.
     *
     * @var TelemetryManager|null
     */
    private $telemetry;

    /**
     * Constructor.
     *
     * @param ?TelemetryManager $telemetry Optional, set via set_telemetry_manager() to avoid a
     *                                      hard constructor cycle with Engagement::instance().
     */
    public function __construct( ?TelemetryManager $telemetry = null ) {
        $this->telemetry = $telemetry;
    }

    /**
     * Wire the telemetry manager after construction (Engagement.php does this once).
     *
     * @param TelemetryManager $telemetry Telemetry manager instance.
     */
    public function set_telemetry_manager( TelemetryManager $telemetry ) {
        $this->telemetry = $telemetry;
    }

    /**
     * Register a listener for an event name. Any plugin/campaign manager may listen.
     *
     * @param string   $event    Event name.
     * @param callable $callback Receives (array $payload).
     */
    public function listen( $event, callable $callback ) {
        if ( ! isset( $this->listeners[ $event ] ) ) {
            $this->listeners[ $event ] = array();
        }
        $this->listeners[ $event ][] = $callback;
    }

    /**
     * Dispatch an event: run local listeners (Path A, always), then forward to
     * TelemetryManager as an optional-transmission candidate (Path B, consent-gated).
     *
     * @param string $event   Event name.
     * @param array  $payload Event payload.
     */
    public function dispatch( $event, array $payload = array() ) {
        foreach ( $this->listeners[ $event ] ?? array() as $callback ) {
            call_user_func( $callback, $payload );
        }

        if ( $this->telemetry ) {
            $this->telemetry->queue_event( $event, $payload );
        }
    }
}
