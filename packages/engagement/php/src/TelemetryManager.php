<?php
/**
 * TelemetryManager class file.
 *
 * @package MultivendorX\Engagement
 */

namespace MultivendorX\Engagement;

defined( 'ABSPATH' ) || exit;

/**
 * Manages the shared telemetry-consent lifecycle and the optional-event queue. Declining or
 * never deciding never disables local event processing - only queue_event()/transmission are
 * consent-gated.
 *
 * Also renders the consent prompt (render_consent_prompt()) and applies decisions from its
 * action links (apply_consent_decision()), called by NoticeManager, which owns the actual
 * admin_notices/admin_post hooks and the priority competition with its own notices.
 *
 * Transmission: transmit_queued_events() posts the queue to whatever endpoint the
 * `multivendorx_engagement_telemetry_endpoint` filter returns. If no endpoint is configured,
 * `multivendorx_engagement_telemetry_batch_ready` fires instead so a plugin with its own
 * transport (e.g. Notifima's VuloCloud client) can send the batch itself.
 *
 * @package MultivendorX\Engagement
 */
class TelemetryManager {

    const DISMISS_REMINDER_DAYS = 365;
    const MAX_QUEUE_SIZE        = 100;

    /**
     * Shared storage instance.
     *
     * @var Storage
     */
    private $storage;

    /**
     * Constructor.
     *
     * @param Storage $storage Shared storage instance.
     */
    public function __construct( Storage $storage ) {
        $this->storage = $storage;
    }

    /**
     * Current consent record.
     *
     * @return array
     */
    public function get_consent() {
        return $this->storage->get_settings()['telemetry_consent'];
    }

    /**
     * Whether the consent prompt is currently due (undecided, or a dismiss reminder elapsed).
     *
     * @return bool
     */
    public function should_prompt_for_consent() {
        $consent = $this->get_consent();

        if ( 'undecided' === $consent['status'] ) {
            return true;
        }

        if ( 'dismissed' === $consent['status'] ) {
            return empty( $consent['show_again_at'] ) || time() >= (int) $consent['show_again_at'];
        }

        return false;
    }

    /**
     * Record acceptance. Enables optional telemetry; never prompts again while valid.
     */
    public function accept() {
        $this->set_consent_status(
            'accepted',
            array(
                'accepted_at'   => time(),
                'declined_at'   => null,
                'dismissed_at'  => null,
                'show_again_at' => null,
                'revoked_at'    => null,
            )
        );
    }

    /**
     * Record decline. Disables optional telemetry transmission; never prompts again.
     */
    public function decline() {
        $this->set_consent_status(
            'declined',
            array(
                'declined_at'   => time(),
                'show_again_at' => null,
            )
        );
    }

    /**
     * Record dismissal, with a 365-day reminder before prompting again.
     */
    public function dismiss() {
        $this->set_consent_status(
            'dismissed',
            array(
                'dismissed_at'  => time(),
                'show_again_at' => time() + ( self::DISMISS_REMINDER_DAYS * DAY_IN_SECONDS ),
            )
        );
    }

    /**
     * Revoke a previously accepted consent and discard any queued events.
     */
    public function revoke() {
        $this->set_consent_status(
            'revoked',
            array(
                'revoked_at' => time(),
            )
        );

        $data                = $this->storage->get_data();
        $data['event_queue'] = array();
        $this->storage->save_data( $data );
    }

    /**
     * Merge consent changes into settings and persist, then notify listeners. Idempotent -
     * a no-op if the status isn't actually changing, so a consuming plugin can safely mirror
     * the change on the same action without looping.
     *
     * @param string $status  New status value.
     * @param array  $changes Fields to merge into telemetry_consent.
     */
    private function set_consent_status( $status, array $changes ) {
        $settings        = $this->storage->get_settings();
        $previous_status = $settings['telemetry_consent']['status'];

        if ( $previous_status === $status ) {
            return;
        }

        $settings['telemetry_consent']           = array_merge( $settings['telemetry_consent'], $changes );
        $settings['telemetry_consent']['status'] = $status;
        $this->storage->save_settings( $settings );

        do_action( 'multivendorx_engagement_telemetry_consent_changed', $status, $previous_status );
    }

    /**
     * Whether optional telemetry may currently be collected/transmitted.
     *
     * @return bool
     */
    public function has_valid_consent() {
        return 'accepted' === $this->get_consent()['status'];
    }

    /**
     * Queue a minimized event as an optional-telemetry candidate. No-op without consent.
     *
     * @param string $event   Event name.
     * @param array  $payload Event payload (already expected to exclude PII by the caller).
     */
    public function queue_event( $event, array $payload ) {
        if ( ! $this->has_valid_consent() ) {
            return;
        }

        $minimized = $this->minimize_payload( $payload );

        $data = $this->storage->get_data();

        $data['event_queue'][] = array(
            'event'     => sanitize_key( $event ),
            'payload'   => $minimized,
            'queued_at' => time(),
        );

        // Keep the queue bounded - drop the oldest entries rather than growing unbounded.
        if ( count( $data['event_queue'] ) > self::MAX_QUEUE_SIZE ) {
            $data['event_queue'] = array_slice( $data['event_queue'], -1 * self::MAX_QUEUE_SIZE );
        }

        $this->storage->save_data( $data );
    }

    /**
     * Strip anything resembling credentials or personal data from a payload.
     *
     * @param array $payload Raw payload.
     * @return array
     */
    private function minimize_payload( array $payload ) {
        $disallowed_keys = array( 'password', 'pass', 'api_key', 'apikey', 'secret', 'token', 'email', 'user_email' );

        foreach ( array_keys( $payload ) as $key ) {
            foreach ( $disallowed_keys as $needle ) {
                if ( false !== stripos( (string) $key, $needle ) ) {
                    unset( $payload[ $key ] );
                    break;
                }
            }
        }

        return $payload;
    }

    /**
     * Remove queue entries older than a retention window.
     *
     * @param int $max_age_seconds Entries older than this are dropped. Default 7 days.
     */
    public function clean_expired_queue( $max_age_seconds = WEEK_IN_SECONDS ) {
        $data                = $this->storage->get_data();
        $now                 = time();
        $data['event_queue'] = array_values(
            array_filter(
                $data['event_queue'],
                static function ( $entry ) use ( $now, $max_age_seconds ) {
                    return ( $now - (int) $entry['queued_at'] ) < $max_age_seconds;
                }
            )
        );
        $this->storage->save_data( $data );
    }

    /**
     * Send the current queue and clear it once sent. Expired entries are pruned first.
     *
     * @return bool|null True if sent and cleared, false on transport failure, null if there
     *                    was nothing to send or consent doesn't currently allow it.
     */
    public function transmit_queued_events() {
        if ( ! $this->has_valid_consent() ) {
            return null;
        }

        $this->clean_expired_queue();

        $data = $this->storage->get_data();
        if ( empty( $data['event_queue'] ) ) {
            return null;
        }

        $endpoint = apply_filters( 'multivendorx_engagement_telemetry_endpoint', '' );

        if ( ! $endpoint ) {
            // No endpoint configured - hand the batch to a plugin-owned transport instead.
            do_action( 'multivendorx_engagement_telemetry_batch_ready', $data['event_queue'] );
            return null;
        }

        $response = wp_remote_post(
            $endpoint,
            array(
                'timeout' => 10,
                'headers' => array( 'Content-Type' => 'application/json' ),
                'body'    => wp_json_encode(
                    array(
                        'site'   => home_url(),
                        'events' => $data['event_queue'],
                    )
                ),
            )
        );

        if ( is_wp_error( $response ) ) {
            return false; // Leave queued - retried on the next scheduled run.
        }

        $status_code = wp_remote_retrieve_response_code( $response );
        if ( $status_code < 200 || $status_code >= 300 ) {
            return false;
        }

        $data['event_queue'] = array();
        $this->storage->save_data( $data );

        return true;
    }

    /**
     * Render the consent prompt - Accept/Decline/Not now, plain links. No JavaScript.
     */
    public function render_consent_prompt() {
        $accept_url  = NoticeManager::build_action_url( 'consent', '', 'accept' );
        $decline_url = NoticeManager::build_action_url( 'consent', '', 'decline' );
        $dismiss_url = NoticeManager::build_action_url( 'consent', '', 'dismiss' );
        ?>
        <div class="notice notice-info multivendorx-engagement-consent">
            <p><strong><?php esc_html_e( 'Help us improve', 'notifima' ); ?></strong></p>
            <p><?php esc_html_e( 'Share anonymous usage data to help us improve. No personal or customer data is collected.', 'notifima' ); ?></p>
            <p>
                <a class="button button-primary" style="margin-right: 6px;" href="<?php echo esc_url( $accept_url ); ?>">
                    <?php esc_html_e( 'Accept', 'notifima' ); ?>
                </a>
                <a class="button button-secondary" style="margin-right: 6px;" href="<?php echo esc_url( $decline_url ); ?>">
                    <?php esc_html_e( 'Decline', 'notifima' ); ?>
                </a>
                <a class="button button-link" href="<?php echo esc_url( $dismiss_url ); ?>">
                    <?php esc_html_e( 'Not now', 'notifima' ); ?>
                </a>
            </p>
        </div>
        <?php
    }

    /**
     * Apply an accept/decline/dismiss/revoke consent decision.
     *
     * @param string $decision One of accept|decline|dismiss|revoke.
     * @return bool True if $decision was a known decision and was applied.
     */
    public function apply_consent_decision( $decision ) {
        switch ( $decision ) {
            case 'accept':
                $this->accept();
                break;
            case 'decline':
                $this->decline();
                break;
            case 'dismiss':
                $this->dismiss();
                break;
            case 'revoke':
                $this->revoke();
                break;
            default:
                return false;
        }

        return true;
    }
}
