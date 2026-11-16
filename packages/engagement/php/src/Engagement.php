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
 * request, shared by every consuming plugin (MultiVendorX, CatalogX, Notifima, ...) -
 * `init()` is safe to call from each plugin's bootstrap; only the first call constructs it.
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
     * Shared event bus.
     *
     * @var EventManager
     */
    private $events;

    /**
     * Shared telemetry manager.
     *
     * @var TelemetryManager
     */
    private $telemetry;

    /**
     * REST namespaces already registered, so register_provider() can be called more than once
     * for the same plugin without registering duplicate routes.
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
        $this->events    = new EventManager( $this->telemetry );
        $this->notices   = new NoticeManager( $this->storage, $this->state );
        $this->campaigns = new CampaignManager( $this->events, $this->state, $this->notices );

        if ( is_admin() ) {
            new AdminNoticeRenderer( $this->notices, $this->telemetry );
        }

        add_action( 'init', array( $this, 'ensure_telemetry_cron_scheduled' ) );
        add_action( 'multivendorx_engagement_telemetry_transmit', array( $this->telemetry, 'transmit_queued_events' ) );
    }

    /**
     * Schedule the daily telemetry transmission cron event once. WP-Cron only drives
     * *transmission* of an already-queued, already-consented batch - it is never relied on
     * for showing the consent prompt itself (that's checked on admin page load, per spec).
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
     * Register a plugin as an Engagement Framework provider: marks its activation timestamp
     * (used by CampaignManager's minimum_usage_days trigger) and registers one REST
     * controller for its namespace. Safe to call multiple times for the same plugin/namespace.
     *
     * @param string $source           Plugin slug, e.g. 'notifima'.
     * @param string $rest_namespace   The plugin's own REST namespace, e.g. 'notifima/v1'.
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
     * Get the shared event bus.
     *
     * @return EventManager
     */
    public function events() {
        return $this->events;
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
