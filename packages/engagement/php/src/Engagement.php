<?php
/**
 * Engagement class file.
 *
 * @package MultivendorX\Engagement
 */

namespace MultivendorX\Engagement;

defined( 'ABSPATH' ) || exit;

/**
 * Main entry point for the shared MultivendorX Engagement Framework. One singleton per
 * request, shared by every consuming plugin.
 *
 * Usage from a consuming plugin:
 *
 *     Engagement::instance()->register_provider( 'notifima', 'notifima/v1' );
 *     Engagement::instance()->notices()->request( [ ... ] );
 *     Engagement::instance()->campaigns()->register( [ ... ] );
 *     Engagement::instance()->events()->dispatch( 'setup_completed', [ ... ] );
 *
 * @package MultivendorX\Engagement
 */
class Engagement {

    /**
     * Singleton instance.
     *
     * @var self|null
     */
    private static $instance = null;

    /**
     * Shared storage instance.
     *
     * @var Storage
     */
    private $storage;

    /**
     * Shared state manager.
     *
     * @var StateManager
     */
    private $state;

    /**
     * Shared notice manager.
     *
     * @var NoticeManager
     */
    private $notices;

    /**
     * Shared campaign manager.
     *
     * @var CampaignManager
     */
    private $campaigns;

    /**
     * Shared telemetry manager.
     *
     * @var TelemetryManager
     */
    private $telemetry;

    /**
     * Event listeners, keyed by event name.
     *
     * @var array<string, callable[]>
     */
    private $listeners = array();

    /**
     * REST namespaces already registered.
     *
     * @var string[]
     */
    private $registered_namespaces = array();

    /**
     * Private constructor - use instance().
     */
    private function __construct() {
        $this->storage   = new Storage();
        $this->state     = new StateManager( $this->storage );
        $this->telemetry = new TelemetryManager( $this->storage );
        $this->notices   = new NoticeManager( $this->storage, $this->state, $this->telemetry );
        $this->campaigns = new CampaignManager( $this, $this->state, $this->notices );

        add_action( 'init', array( $this, 'ensure_telemetry_cron_scheduled' ) );
        add_action( 'multivendorx_engagement_telemetry_transmit', array( $this->telemetry, 'transmit_queued_events' ) );
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
     * Run local listeners, then queue the event for optional telemetry.
     *
     * @param string $event   Event name.
     * @param array  $payload Event payload.
     */
    public function dispatch( $event, array $payload = array() ) {
        foreach ( $this->listeners[ $event ] ?? array() as $callback ) {
            call_user_func( $callback, $payload );
        }

        $this->telemetry->queue_event( $event, $payload );
    }

    /**
     * Schedule the daily telemetry transmission cron event once.
     */
    public function ensure_telemetry_cron_scheduled() {
        if ( ! wp_next_scheduled( 'multivendorx_engagement_telemetry_transmit' ) ) {
            wp_schedule_event( time(), 'daily', 'multivendorx_engagement_telemetry_transmit' );
        }
    }

    /**
     * Get (and lazily create) the shared instance.
     *
     * @return self
     */
    public static function instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Register a plugin as an Engagement Framework provider.
     *
     * @param string $source         Plugin slug, e.g. 'notifima'.
     * @param string $rest_namespace Plugin's own REST namespace, e.g. 'notifima/v1'.
     */
    public function register_provider( $source, $rest_namespace ) {
        $activated_option = $source . '_engagement_activated_at';
        if ( ! get_option( $activated_option ) ) {
            update_option( $activated_option, time(), false );
        }

        if ( in_array( $rest_namespace, $this->registered_namespaces, true ) ) {
            return;
        }

        new RESTController( $rest_namespace, $this->notices, $this->telemetry );
        $this->registered_namespaces[] = $rest_namespace;
    }

    /**
     * Get the shared notice manager.
     *
     * @return NoticeManager
     */
    public function notices() {
        return $this->notices;
    }

    /**
     * Get the shared campaign manager.
     *
     * @return CampaignManager
     */
    public function campaigns() {
        return $this->campaigns;
    }

    /**
     * The event bus is Engagement itself (see listen()/dispatch() above).
     *
     * @return self
     */
    public function events() {
        return $this;
    }

    /**
     * Get the shared telemetry manager.
     *
     * @return TelemetryManager
     */
    public function telemetry() {
        return $this->telemetry;
    }

    /**
     * Get the shared state manager.
     *
     * @return StateManager
     */
    public function state() {
        return $this->state;
    }
}
