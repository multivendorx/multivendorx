<?php
/**
 * StateManager class file.
 *
 * @package MultivendorX\Engagement
 */

namespace MultivendorX\Engagement;

defined( 'ABSPATH' ) || exit;

/**
 * Tracks notice/campaign impressions, dismissals, snoozes and completion, and enforces the
 * frequency/cooldown rules against that state. All reads/writes go through Storage.
 *
 * @package MultivendorX\Engagement
 */
class StateManager {

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
     * Get the stored state for a single notice id, or a fresh default row.
     *
     * @param string $notice_id Notice id.
     * @return array
     */
    public function get_notice_state( $notice_id ) {
        $data = $this->storage->get_data();
        return isset( $data['notices'][ $notice_id ] ) ? $data['notices'][ $notice_id ] : $this->default_notice_state();
    }

    /**
     * Get the stored state for a single campaign id, or a fresh default row.
     *
     * @param string $campaign_id Campaign id.
     * @return array
     */
    public function get_campaign_state( $campaign_id ) {
        $data = $this->storage->get_data();
        return isset( $data['campaigns'][ $campaign_id ] ) ? $data['campaigns'][ $campaign_id ] : $this->default_campaign_state();
    }

    /**
     * Default fields for a notice's state row.
     *
     * @return array
     */
    private function default_notice_state() {
        return array(
            'source'        => '',
            'status'        => 'pending',
            'impressions'   => 0,
            'first_shown'   => null,
            'last_shown'    => null,
            'dismissed_at'  => null,
            'snoozed_until' => null,
        );
    }

    /**
     * Default fields for a campaign's state row.
     *
     * @return array
     */
    private function default_campaign_state() {
        return array(
            'source'       => '',
            'eligible'     => false,
            'impressions'  => 0,
            'completed'    => false,
            'last_shown'   => null,
            'completed_at' => null,
        );
    }

    /**
     * Record an actual rendered impression for a notice (only ever called after the frontend
     * confirms the notice was rendered - never on fetch/queue).
     *
     * @param string $notice_id Notice id.
     * @param string $source    Owning plugin slug.
     */
    public function record_notice_impression( $notice_id, $source = '' ) {
        $data  = $this->storage->get_data();
        $state = isset( $data['notices'][ $notice_id ] ) ? $data['notices'][ $notice_id ] : $this->default_notice_state();

        $now = time();
        if ( empty( $state['first_shown'] ) ) {
            $state['first_shown'] = $now;
        }
        $state['last_shown']  = $now;
        $state['impressions'] = (int) $state['impressions'] + 1;
        $state['source']      = $source ? $source : $state['source'];

        $data['notices'][ $notice_id ] = $state;
        $this->storage->save_data( $data );
    }

    /**
     * Mark a notice dismissed.
     *
     * @param string $notice_id Notice id.
     */
    public function dismiss_notice( $notice_id ) {
        $data  = $this->storage->get_data();
        $state = isset( $data['notices'][ $notice_id ] ) ? $data['notices'][ $notice_id ] : $this->default_notice_state();

        $state['status']       = 'dismissed';
        $state['dismissed_at'] = time();

        $data['notices'][ $notice_id ] = $state;
        $this->storage->save_data( $data );
    }

    /**
     * Snooze a notice until a future timestamp.
     *
     * @param string $notice_id     Notice id.
     * @param int    $snooze_until  Unix timestamp to resume showing the notice.
     */
    public function snooze_notice( $notice_id, $snooze_until ) {
        $data  = $this->storage->get_data();
        $state = isset( $data['notices'][ $notice_id ] ) ? $data['notices'][ $notice_id ] : $this->default_notice_state();

        $state['status']        = 'snoozed';
        $state['snoozed_until'] = (int) $snooze_until;

        $data['notices'][ $notice_id ] = $state;
        $this->storage->save_data( $data );
    }

    /**
     * Mark a campaign eligible/shown/completed and bump its impression counter.
     *
     * @param string $campaign_id Campaign id.
     * @param string $source      Owning plugin slug.
     */
    public function record_campaign_impression( $campaign_id, $source = '' ) {
        $data  = $this->storage->get_data();
        $state = isset( $data['campaigns'][ $campaign_id ] ) ? $data['campaigns'][ $campaign_id ] : $this->default_campaign_state();

        $state['impressions'] = (int) $state['impressions'] + 1;
        $state['last_shown']  = time();
        $state['source']      = $source ? $source : $state['source'];

        $data['campaigns'][ $campaign_id ] = $state;
        $this->storage->save_data( $data );
    }

    /**
     * Mark a campaign completed - completed campaigns are never shown again.
     *
     * @param string $campaign_id Campaign id.
     */
    public function complete_campaign( $campaign_id ) {
        $data  = $this->storage->get_data();
        $state = isset( $data['campaigns'][ $campaign_id ] ) ? $data['campaigns'][ $campaign_id ] : $this->default_campaign_state();

        $state['completed']    = true;
        $state['completed_at'] = time();

        $data['campaigns'][ $campaign_id ] = $state;
        $this->storage->save_data( $data );
    }

    /**
     * Whether a notice is currently allowed to be shown, given its own frequency rule and
     * the framework-wide default frequency rule.
     *
     * @param string $notice_id      Notice id.
     * @param array  $frequency      Notice-specific frequency override (max_impressions, cooldown_days).
     * @param bool   $is_operational Operational/critical notices bypass promotional frequency limits.
     * @return bool
     */
    public function is_notice_eligible( $notice_id, array $frequency = array(), $is_operational = false ) {
        $state = $this->get_notice_state( $notice_id );

        if ( 'dismissed' === $state['status'] ) {
            return false;
        }

        if ( ! empty( $state['snoozed_until'] ) && time() < (int) $state['snoozed_until'] ) {
            return false;
        }

        if ( $is_operational ) {
            return true;
        }

        $settings        = $this->storage->get_settings();
        $max_impressions = isset( $frequency['max_impressions'] ) ? (int) $frequency['max_impressions'] : (int) $settings['frequency']['max_impressions'];
        $cooldown_days   = isset( $frequency['cooldown_days'] ) ? (int) $frequency['cooldown_days'] : (int) $settings['frequency']['cooldown_days'];

        if ( $state['impressions'] >= $max_impressions ) {
            return false;
        }

        if ( ! empty( $state['last_shown'] ) ) {
            $cooldown_seconds = $cooldown_days * DAY_IN_SECONDS;
            if ( time() < ( (int) $state['last_shown'] + $cooldown_seconds ) ) {
                return false;
            }
        }

        return true;
    }
}
