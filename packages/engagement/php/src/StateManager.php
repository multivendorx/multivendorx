<?php
/**
 * StateManager class file.
 *
 * @package MultivendorX\Engagement
 */

namespace MultivendorX\Engagement;

defined( 'ABSPATH' ) || exit;

/**
 * Tracks notice/campaign impressions, dismissals, snoozes and completion.
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
        return $this->get_state_row( 'notices', $notice_id, $this->default_notice_state() );
    }

    /**
     * Get the stored state for a single campaign id, or a fresh default row.
     *
     * @param string $campaign_id Campaign id.
     * @return array
     */
    public function get_campaign_state( $campaign_id ) {
        return $this->get_state_row( 'campaigns', $campaign_id, $this->default_campaign_state() );
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
     * Record a rendered impression for a notice.
     *
     * @param string $notice_id Notice id.
     * @param string $source    Owning plugin slug.
     */
    public function record_notice_impression( $notice_id, $source = '' ) {
        $state = $this->get_notice_state( $notice_id );

        $now = time();
        if ( empty( $state['first_shown'] ) ) {
            $state['first_shown'] = $now;
        }
        $state['last_shown']  = $now;
        $state['impressions'] = (int) $state['impressions'] + 1;
        $state['source']      = $source ? $source : $state['source'];

        $this->save_notice_state( $notice_id, $state );
    }

    /**
     * Mark a notice dismissed.
     *
     * @param string $notice_id Notice id.
     */
    public function dismiss_notice( $notice_id ) {
        $state                 = $this->get_notice_state( $notice_id );
        $state['status']       = 'dismissed';
        $state['dismissed_at'] = time();

        $this->save_notice_state( $notice_id, $state );
    }

    /**
     * Snooze a notice until a future timestamp.
     *
     * @param string $notice_id     Notice id.
     * @param int    $snooze_until  Unix timestamp to resume showing the notice.
     */
    public function snooze_notice( $notice_id, $snooze_until ) {
        $state                  = $this->get_notice_state( $notice_id );
        $state['status']        = 'snoozed';
        $state['snoozed_until'] = (int) $snooze_until;

        $this->save_notice_state( $notice_id, $state );
    }

    /**
     * Mark a campaign eligible/shown/completed and bump its impression counter.
     *
     * @param string $campaign_id Campaign id.
     * @param string $source      Owning plugin slug.
     */
    public function record_campaign_impression( $campaign_id, $source = '' ) {
        $state = $this->get_campaign_state( $campaign_id );

        $state['impressions'] = (int) $state['impressions'] + 1;
        $state['last_shown']  = time();
        $state['source']      = $source ? $source : $state['source'];

        $this->save_campaign_state( $campaign_id, $state );
    }

    /**
     * Mark a campaign completed - completed campaigns are never shown again.
     *
     * @param string $campaign_id Campaign id.
     */
    public function complete_campaign( $campaign_id ) {
        $state                 = $this->get_campaign_state( $campaign_id );
        $state['completed']    = true;
        $state['completed_at'] = time();

        $this->save_campaign_state( $campaign_id, $state );
    }

    /**
     * Write a notice's state row back to storage.
     *
     * @param string $notice_id Notice id.
     * @param array  $state     Full state row to store.
     */
    private function save_notice_state( $notice_id, array $state ) {
        $this->save_state_row( 'notices', $notice_id, $state );
    }

    /**
     * Write a campaign's state row back to storage.
     *
     * @param string $campaign_id Campaign id.
     * @param array  $state       Full state row to store.
     */
    private function save_campaign_state( $campaign_id, array $state ) {
        $this->save_state_row( 'campaigns', $campaign_id, $state );
    }

    /**
     * Shared read path for a notice/campaign state row, keyed by storage bucket.
     *
     * @param string $bucket        'notices' or 'campaigns'.
     * @param string $id            Notice or campaign id.
     * @param array  $default_state Row to return when nothing is stored yet.
     * @return array
     */
    private function get_state_row( $bucket, $id, array $default_state ) {
        $data = $this->storage->get_data();
        return isset( $data[ $bucket ][ $id ] ) ? $data[ $bucket ][ $id ] : $default_state;
    }

    /**
     * Shared write path for a notice/campaign state row, keyed by storage bucket.
     *
     * @param string $bucket 'notices' or 'campaigns'.
     * @param string $id     Notice or campaign id.
     * @param array  $state  Full state row to store.
     */
    private function save_state_row( $bucket, $id, array $state ) {
        $data            = $this->storage->get_data();
        $data[ $bucket ][ $id ] = $state;
        $this->storage->save_data( $data );
    }

    /**
     * Whether a notice is currently allowed to be shown.
     *
     * @param string $notice_id      Notice id.
     * @param array  $frequency      Frequency override (max_impressions, cooldown_days).
     * @param bool   $is_operational Operational notices bypass frequency limits.
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

        $defaults        = $this->storage->get_settings()['frequency'];
        $max_impressions = isset( $frequency['max_impressions'] ) ? (int) $frequency['max_impressions'] : (int) $defaults['max_impressions'];
        $cooldown_days   = isset( $frequency['cooldown_days'] ) ? (int) $frequency['cooldown_days'] : (int) $defaults['cooldown_days'];

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
