<?php
/**
 * TelemetryManager class file.
 *
 * @package MultivendorX\Engagement
 */

namespace MultivendorX\Engagement;

defined( 'ABSPATH' ) || exit;

/**
 * Manages the single, shared telemetry-consent lifecycle (undecided/accepted/declined/
 * dismissed/revoked) and the optional-event queue. Declining or never deciding never
 * disables local event processing - EventManager::dispatch() always runs listeners
 * regardless of consent; only queue_event()/should_transmit() are consent-gated.
 *
 * Transmission: transmit_queued_events() sends the queue via `wp_remote_post()` to whatever
 * endpoint the `multivendorx_engagement_telemetry_endpoint` filter returns. No endpoint is
 * hardcoded here - the shared framework has no transport of its own, only a generic one any
 * consuming plugin can point at its own collection endpoint via that filter. If no endpoint is
 * configured, `multivendorx_engagement_telemetry_batch_ready` fires instead so a plugin with
 * its own transport (e.g. Notifima's existing VuloCloud client) can send the batch itself
 * without this class needing to know about that protocol.
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
     * Whether any plugin should currently show the consent prompt: no decision exists yet,
     * or a 'dismissed' decision's 365-day reminder has elapsed. Checked on admin page load
     * by whichever integrated plugin is active - not WP-Cron, per spec section 6.
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
     * Local event processing (Path A) is unaffected - see class docblock.
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
     * Record dismissal. Status stays 'undecided' in effect for prompting purposes, but we
     * record 'dismissed' explicitly (per spec's 5-state model) with a 365-day reminder.
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
     * Revoke a previously accepted consent. Stops all future collection/transmission and
     * discards any already-queued optional events.
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
     * Merge consent changes into settings and persist, then notify listeners of the change.
     *
     * Idempotent by design: if the status isn't actually changing, this is a no-op - no write,
     * no `multivendorx_engagement_telemetry_consent_changed` dispatch. This is what lets a
     * consuming plugin (e.g. Notifima's Tracker) mirror an accept/decline into its own settings
     * UI on that same action without looping back into another dispatch.
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
     * Queue a minimized, validated event as an optional-telemetry candidate. No-op if consent
     * isn't currently 'accepted' - declining/revoking means nothing is ever queued or sent.
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
     * Strip anything resembling credentials or personal data from a telemetry payload before
     * it is queued. Never collect passwords, API keys, secrets or email addresses here.
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
     * Remove queue entries older than a retention window - the queue is never a permanent
     * history, only pending-transmission candidates.
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
     * Attempt to send the current queue and clear it once sent. No-op if consent isn't
     * currently 'accepted' (revoking/declining already clears/blocks the queue, but this is
     * checked again here in case the batch was built up before a later revocation) or if the
     * queue is empty. Expired entries are pruned first so a stale batch is never sent.
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
            // No generic endpoint configured - hand the batch to a plugin-owned transport instead.
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
}
