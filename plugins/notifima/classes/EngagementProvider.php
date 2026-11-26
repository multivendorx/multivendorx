<?php
/**
 * EngagementProvider class file.
 *
 * @package Notifima
 */

namespace Notifima;

defined( 'ABSPATH' ) || exit;

use MultivendorX\Engagement\Engagement;

/**
 * Registers Notifima as the first consumer of the shared MultivendorX Engagement Framework.
 *
 * @package Notifima
 */
class EngagementProvider {

    const SOURCE = 'notifima';

    /**
     * Guard option so `setup_completed` is only ever dispatched once per `notifima_installed`
     * becoming set, even though we only ever notice it on a normal request (not literally
     * inside the activation hook itself - see dispatch_setup_completed_on_install()).
     *
     * @var string
     */
    const SETUP_DISPATCHED_FLAG = 'notifima_engagement_setup_dispatched';

    /**
     * Registers the provider if the shared framework package is available.
     */
    public function __construct() {
        if ( ! class_exists( Engagement::class ) ) {
            return;
        }

        add_action( 'notifima_loaded', array( $this, 'register' ) );
    }

    /**
     * Register this plugin with the shared framework and migrate any existing tracking
     * consent decision into the shared consent record. `register_campaigns()` is deferred to
     * `init` separately (see below) - `notifima_loaded` fires during `woocommerce_loaded`,
     * which WooCommerce triggers on `plugins_loaded`, before WordPress's `init`. Calling `__()`
     * for the campaign's translatable content that early triggers WordPress's
     * "Translation loading... triggered too early" notice (text domains aren't safe to load
     * until `init`), which in turn breaks admin page headers.
     */
    public function register() {
        Engagement::instance()->register_provider( self::SOURCE, Notifima()->rest_namespace );

        $this->migrate_existing_consent();

        add_action( 'init', array( $this, 'register_campaigns' ) );
        add_action( 'init', array( $this, 'dispatch_setup_completed_on_install' ) );
        add_action( 'notifima_site_telemetry_daily', array( $this, 'dispatch_feature_used_event' ) );
    }

    /**
     * One-time bridge: if Notifima's own tri-state tracker consent (`notifima_tracking_consent`
     * = 'yes'/'no') was already decided before this plugin integrated the shared framework,
     * mirror that decision into the shared 5-state record so the admin isn't asked twice.
     * Does nothing once the shared record already has its own decision - this only ever
     * seeds an 'undecided' shared record, it never overwrites a later shared decision.
     */
    private function migrate_existing_consent() {
        $shared_consent = Engagement::instance()->telemetry()->get_consent();
        if ( 'undecided' !== $shared_consent['status'] ) {
            return;
        }

        $existing = get_option( 'notifima_tracking_consent', false );
        if ( false === $existing ) {
            return; // Tracker's own notice hasn't been answered yet either - let the shared prompt ask once.
        }

        if ( 'yes' === $existing ) {
            Engagement::instance()->telemetry()->accept();
        } else {
            Engagement::instance()->telemetry()->decline();
        }
    }

    /**
     * Register Notifima's initial campaign: an onboarding nudge toward Notifima Pro, shown
     * right after setup completes (see dispatch_setup_completed_on_install()) - not gated on
     * any usage duration, since onboarding is by definition a first-run moment, not something
     * that waits a week. `priority: 90` deliberately outranks the telemetry consent prompt's
     * `AdminNoticeRenderer::CONSENT_PRIORITY` (80): on a fresh install, the admin sees this
     * onboarding notice first, then (once it's dismissed/frequency-capped) the consent prompt,
     * then (once that's answered) the VuloMail notice at its own default `product_discovery`
     * priority (40) - all three compete on the same priority scale, nothing is hardcoded to
     * always go first. Hooked to `init` (see register()) so its `__()` calls aren't triggered
     * too early - and bails outside wp-admin for the same reason request_vulomail_notice()
     * does (see Communications.php): building translated content on every request type,
     * including wp-login.php, has been observed to trip WordPress's early-textdomain-load
     * safety check there and block the login cookie from being set.
     */
    public function register_campaigns() {
        if ( ! is_admin() ) {
            return;
        }

        Engagement::instance()->campaigns()->register(
            array(
                'id'        => 'notifima_product_discovery',
                'type'      => 'onboarding',
                'source'    => self::SOURCE,
                'priority'  => 40,
                'trigger'   => array(
                    'event' => 'setup_completed',
                ),
                'content'   => array(
                    'title'       => __( 'Explore more stock alert capabilities', 'notifima' ),
                    'description' => __( 'Notifima Pro adds waitlists, bulk back-in-stock exports and automated follow-ups.', 'notifima' ),
                    'layout'      => 'card',
                ),
                'actions'   => array(
                    array(
                        'id'    => 'explore',
                        'label' => __( 'Explore Notifima Pro', 'notifima' ),
                        'type'  => 'url',
                        'url'   => NOTIFIMA_PRO_SHOP_URL,
                    ),
                    array(
                        'id'    => 'dismiss',
                        'label' => __( 'Dismiss', 'notifima' ),
                        'type'  => 'dismiss',
                    ),
                ),
                'frequency' => array(
                    'max_impressions' => 2,
                    'cooldown_days'   => 14,
                ),
            )
        );
    }

    /**
     * Local, consent-independent usage milestone - dispatched daily alongside Tracker's own
     * existing cron hook. Always runs (Path A); only queued for transmission if telemetry
     * consent is currently accepted (Path B, handled inside EventManager/TelemetryManager).
     */
    public function dispatch_feature_used_event() {
        Engagement::instance()->events()->dispatch(
            'feature_used',
            array(
                'product' => self::SOURCE,
                'feature' => 'stock_alerts',
            )
        );
    }

    /**
     * Dispatch `setup_completed` the first time `notifima_installed` is seen set.
     *
     * `notifima_installed` is set to `1` in `Notifima::activate()` (and deleted again in
     * `deactivate()`), so it's a real, existing signal for "the plugin was just installed/
     * activated" - not something invented for this. It can't be dispatched from inside
     * `activate()` itself though: `register_activation_hook()` callbacks run before this
     * class's own hooks are even registered (`EngagementProvider::register()` only runs once
     * `notifima_loaded` fires on a *later* request). So this checks on `init` instead - cheap,
     * runs every request - and `SETUP_DISPATCHED_FLAG` makes sure that only ever results in
     * one dispatch per time the option gets set, not once per page load. Must also only run
     * on an actual wp-admin request, same as register_campaigns() - if this ran on a request
     * where register_campaigns() didn't (e.g. wp-login.php), it would burn the one-time flag
     * with no listener registered yet to catch the dispatch, and the campaign would never get
     * another chance to see this event.
     */
    public function dispatch_setup_completed_on_install() {
        if ( ! is_admin() || ! get_option( 'notifima_installed' ) || get_option( self::SETUP_DISPATCHED_FLAG ) ) {
            return;
        }

        update_option( self::SETUP_DISPATCHED_FLAG, 1, false );

        Engagement::instance()->events()->dispatch(
            'setup_completed',
            array( 'product' => self::SOURCE )
        );
    }
}
