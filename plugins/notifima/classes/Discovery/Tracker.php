<?php
/**
 * Notifima Tracker class file.
 *
 * @package Notifima
 */

namespace Notifima\Discovery;

use MultivendorX\Engagement\Engagement;
use MultivendorX\Engagement\VuloCloudClient;
use Notifima\FrontendScripts;
use Notifima\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Opt-in usage tracking for Notifima (WordPress.org guideline 7) - nothing is sent until the
 * admin opts in via the shared Engagement Framework consent UI or the Automation settings
 * toggle.
 *
 * @package Notifima
 */
class Tracker {

    /**
     * Shared VuloCloud transport client, configured for this plugin.
     *
     * @var VuloCloudClient
     */
    private $client;

    /**
     * Constructor. Registers the settings-toggle sync, the shared-consent reaction, retry, cron
     * and deactivation hooks.
     */
    public function __construct() {
        $this->client = new VuloCloudClient(
            NOTIFIMA_VULOCLOUD_URL,
            NOTIFIMA_VULOCLOUD_ORGANIZATION_ID,
            Notifima()->slug,
            Notifima()->version,
            'notifima'
        );

        add_filter( 'pre_update_option_' . Utill::NOTIFIMA_SETTINGS['automation'], array( $this, 'sync_consent_from_settings' ), 10, 2 );

        if ( class_exists( Engagement::class ) ) {
            add_action( 'multivendorx_engagement_telemetry_consent_changed', array( $this, 'handle_shared_consent_changed' ) );
        }

        // Retry a failed registration quietly on later admin visits - only ever after consent.
        add_action( 'admin_init', array( $this, 'maybe_retry_registration' ) );

        add_action( 'init', array( $this, 'ensure_daily_report_scheduled' ) );
        add_action( 'notifima_site_telemetry_daily', array( $this, 'report_current_state' ) );
        add_action( 'rest_api_init', array( $this, 'register_verification_route' ) );

        add_filter( 'plugin_action_links_' . Notifima()->plugin_base, array( $this, 'wrap_deactivate_link' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_deactivation_assets' ) );
        add_action( 'wp_ajax_notifima_deactivation_report', array( $this, 'handle_deactivation_report_request' ) );

        register_deactivation_hook(
            Notifima()->plugin_path . 'product_stock_alert.php',
            array( $this, 'on_plugin_deactivated' )
        );
    }

    /**
     * Whether tracking may actually run right now - delegates to the shared framework's
     * consent record when available, falling back to the legacy option only if the package
     * isn't present at all (see class docblock).
     *
     * Every place that sends data (or attempts to register) checks this, not the shared
     * consent directly, so this remains the one seam a filter/fallback can act on.
     *
     * @return bool
     */
    private function is_tracking_enabled(): bool {
        if ( class_exists( Engagement::class ) ) {
            return Engagement::instance()->telemetry()->has_valid_consent();
        }

        return 'yes' === get_option( 'notifima_tracking_consent' );
    }

    /**
     * React to the Automation settings toggle, without misreading an unrelated Automation-tab
     * save as a decline (the whole tab resubmits every field, touched or not).
     *
     * Hooked on `pre_update_option` so both old and new values are available: only a real,
     * known change (key present in both, values differ) counts as the admin flipping it.
     * Delegates the actual decision to the shared TelemetryManager rather than storing it here -
     * `handle_shared_consent_changed()` below reacts to that and runs start/stop_tracking().
     *
     * @param mixed $value     The new value about to be saved.
     * @param mixed $old_value The value currently stored, before this save.
     * @return mixed $value, unchanged - this is a pass-through filter.
     */
    public function sync_consent_from_settings( $value, $old_value ) {
        if ( ! is_array( $value ) || ! array_key_exists( 'is_usage_tracking_enable', $value ) ) {
            return $value;
        }
        if ( ! is_array( $old_value ) || ! array_key_exists( 'is_usage_tracking_enable', $old_value ) ) {
            return $value;
        }

        $new_raw = $value['is_usage_tracking_enable'];
        $old_raw = $old_value['is_usage_tracking_enable'];

        if ( $new_raw === $old_raw || ! class_exists( Engagement::class ) ) {
            return $value;
        }

        $telemetry = Engagement::instance()->telemetry();

        if ( 'yes' === $new_raw ) {
            $telemetry->accept();
        } else {
            $telemetry->decline();
        }

        return $value;
    }

    /**
     * Shared-consent reaction: start/stop the VuloCloud registration/report cycle, and mirror
     * the decision into the Automation settings toggle so it reflects a decision made via the
     * shared `TelemetryConsent` prompt too (not just the settings page). Guarded against the
     * update-option loop this mirroring could otherwise cause by
     * `TelemetryManager::set_consent_status()`'s own idempotency check.
     *
     * @param string $status New shared consent status.
     */
    public function handle_shared_consent_changed( $status ): void {
        if ( 'accepted' === $status ) {
            Notifima()->setting->update_setting( 'is_usage_tracking_enable', 'yes', Utill::NOTIFIMA_SETTINGS['automation'] );
            $this->start_tracking();
            return;
        }

        if ( in_array( $status, array( 'declined', 'revoked' ), true ) ) {
            Notifima()->setting->update_setting( 'is_usage_tracking_enable', 'no', Utill::NOTIFIMA_SETTINGS['automation'] );
            $this->stop_tracking();
        }
    }

    /**
     * Whether this build is configured to reach VuloCloud at all.
     *
     * @return bool
     */
    private function is_configured(): bool {
        return $this->client->is_configured();
    }

    /**
     * Whether this site holds a VuloCloud ConnectedSite credential.
     *
     * @return bool
     */
    public function is_connected(): bool {
        return $this->client->is_connected();
    }

    /**
     * Register with VuloCloud (first snapshot travels with the registration) or, if already
     * registered, send a fresh snapshot. Only ever called after consent.
     */
    private function start_tracking(): void {
        if ( ! $this->is_configured() ) {
            return;
        }

        $credential = $this->client->get_site_credential();
        if ( null === $credential ) {
            $this->register_site();
            return;
        }

        $this->report( $credential['site_id'], $credential['secret'], $this->get_tracking_payload() );
    }

    /**
     * Opt-out: best-effort, non-blocking revoke request, then forget the credential locally
     * either way - never blocked by, or dependent on, network reachability.
     */
    private function stop_tracking(): void {
        $credential = $this->client->get_site_credential();
        if ( null !== $credential && $this->is_configured() ) {
            $this->client->disconnect( $credential['site_id'], $credential['secret'] );
        }
    }

    /**
     * Retry a failed registration quietly on a later admin visit (once per day at most).
     */
    public function maybe_retry_registration(): void {
        if ( ! $this->is_tracking_enabled() || ! $this->is_configured() || $this->is_connected() || wp_doing_ajax() ) {
            return;
        }

        $last_attempt   = $this->client->get_last_register_attempt();
        $retry_interval = (int) apply_filters( 'notifima_tracking_register_retry_interval', DAY_IN_SECONDS );

        if ( $last_attempt && ( time() - $last_attempt ) < $retry_interval ) {
            return;
        }

        $this->register_site();
    }

    /**
     * Expose the in-flight verification token so VuloCloud can confirm this domain registered
     * itself. Public by design - single-use, lives ten minutes, 404 when none is in flight.
     */
    public function register_verification_route(): void {
        $this->client->register_verification_route( Notifima()->rest_namespace );
    }

    /**
     * Register with VuloCloud and store the returned credential - thin wrapper around the
     * shared client, which already publishes the verification token and parses the response.
     *
     * @return true|false|\WP_Error False only when skipped outright (an AJAX request - matches
     *                               WC_Tracker::send_tracking_data()'s own DOING_AJAX guard).
     */
    public function register_site() {
        if ( wp_doing_ajax() ) {
            return false;
        }

        return $this->client->register_site( $this->get_tracking_payload() );
    }

    /*
    |--------------------------------------------------------------------------
    | Telemetry
    |--------------------------------------------------------------------------
    */

    /**
     * Schedule the daily report if it isn't already.
     */
    public function ensure_daily_report_scheduled(): void {
        if ( ! wp_next_scheduled( 'notifima_site_telemetry_daily' ) ) {
            wp_schedule_event( time(), 'daily', 'notifima_site_telemetry_daily' );
        }
    }

    /**
     * Daily cron callback - a no-op without consent.
     */
    public function report_current_state(): void {
        if ( ! $this->is_tracking_enabled() ) {
            return;
        }
        $this->start_tracking();
    }

    /**
     * Stop the daily cron on deactivation. No network call here - this hook fires on every
     * deactivation path (bulk, WP-CLI) the popup can't intercept; the popup's own AJAX handler
     * sends the final report before this ever runs.
     */
    public function on_plugin_deactivated(): void {
        wp_clear_scheduled_hook( 'notifima_site_telemetry_daily' );
    }

    /**
     * Wrap the Plugins-screen "Deactivate" link with the React.
     *
     * @param array $links Existing plugin action links.
     * @return array
     */
    public function wrap_deactivate_link( array $links ): array {
        if ( ! isset( $links['deactivate'] ) || ! preg_match( '/href="([^"]+)"/', $links['deactivate'], $matches ) ) {
            return $links;
        }

        $deactivate_url = html_entity_decode( $matches[1], ENT_QUOTES );

        // Nonce/action travel as data attributes on the same mount point rather than a separate
        // wp_localize_script() call - one fewer inline <script> and global for the popup to read.
        $links['deactivate'] = str_replace( '<a ', '<a id="notifima-deactivate-link" ', $links['deactivate'] )
            . '<div id="notifima-deactivation-popup"'
            . ' data-deactivate-url="' . esc_attr( $deactivate_url ) . '"'
            . ' data-action="notifima_deactivation_report"'
            . ' data-nonce="' . esc_attr( wp_create_nonce( 'notifima_deactivation_nonce' ) ) . '"'
            . '></div>';

        return $links;
    }

    /**
     * Enqueue the shared admin React bundle (the same one Notifima's own settings page uses) on
     * the Plugins screen only, so DeactivationPopup.tsx can mount there too.
     *
     * @param string $hook_suffix Current admin page, as passed by the 'admin_enqueue_scripts' action.
     */
    public function enqueue_deactivation_assets( string $hook_suffix ): void {
        if ( 'plugins.php' !== $hook_suffix ) {
            return;
        }

        wp_enqueue_script( 'wp-element' );
        FrontendScripts::enqueue_script( 'notifima-components-script' );
        FrontendScripts::enqueue_script( 'notifima-admin-script' );
        FrontendScripts::enqueue_style( 'notifima-admin-style' );
    }

    /**
     * AJAX handler behind the popup's "Send report & Deactivate" button. Always responds
     * success - a failed report must never block deactivation.
     */
    public function handle_deactivation_report_request(): void {
        check_ajax_referer( 'notifima_deactivation_nonce', 'nonce' );

        if ( ! Utill::current_user_has_capability( array( 'manage_options' ) ) ) {
            wp_send_json_error( null, 403 );
        }

        if ( $this->is_configured() ) {
            $payload                     = $this->get_tracking_payload();
            $payload['Status']           = 'Deactivated';
            $payload['Deactivated Date'] = time();

            $credential = $this->is_connected() ? $this->client->get_site_credential() : null;

            if ( null !== $credential && $this->is_tracking_enabled() ) {
                $this->report( $credential['site_id'], $credential['secret'], $payload, true, true );
            } elseif ( null === $credential ) {
                $this->send_one_time_deactivation_report( $payload );
            }
        }

        wp_send_json_success();
    }

    /**
     * One-time report for a deactivating site with no ongoing credential - thin wrapper
     * around the shared client, which handles the register-then-ingest flow and never stores
     * anything locally for this case.
     *
     * @param array $payload Final snapshot to send (Status already set to "Deactivated").
     */
    private function send_one_time_deactivation_report( array $payload ): void {
        if ( ! $this->is_configured() ) {
            return;
        }

        $this->client->send_one_time_report( $payload, 'deactivation_report' );
    }

    /**
     * Build the snapshot sent to VuloCloud - the generic site/environment fields come from
     * the shared client; only Notifima's own identity fields are added here.
     *
     * @return array
     */
    public function get_tracking_payload(): array {
        $payload                = VuloCloudClient::build_site_snapshot();
        $payload['Plugin']      = 'Notifima';
        $payload['Version']     = Notifima()->version;
        $payload['Status']      = 'active';
        $payload['Pro Version'] = defined( 'NOTIFIMA_PRO_PLUGIN_VERSION' ) ? NOTIFIMA_PRO_PLUGIN_VERSION : '';

        return apply_filters( 'notifima_tracking_payload', $payload );
    }

    /**
     * POST one snapshot to VuloCloud for the already-registered connection - thin wrapper
     * around the shared client, which already handles the 401/403/404-drops-connection case.
     *
     * @param string $site_id           ConnectedSite id.
     * @param string $secret            Plaintext site secret.
     * @param array  $payload           Snapshot from get_tracking_payload().
     * @param bool   $blocking          Wait for the response instead of fire-and-forget.
     * @param bool   $allow_during_ajax Send even during wp_doing_ajax() - the deactivation popup only.
     * @return bool True if VuloCloud acknowledged the ping (always false when non-blocking).
     */
    public function report( string $site_id, string $secret, array $payload, bool $blocking = false, bool $allow_during_ajax = false ): bool {
        if ( ! $this->is_configured() || ! $this->is_tracking_enabled() ) {
            return false;
        }

        return $this->client->report( $site_id, $secret, $payload, $blocking, $allow_during_ajax );
    }
}
