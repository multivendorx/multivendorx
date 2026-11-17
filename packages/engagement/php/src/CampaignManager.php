<?php
/**
 * CampaignManager class file.
 *
 * @package MultivendorX\Engagement
 */

namespace MultivendorX\Engagement;

defined( 'ABSPATH' ) || exit;

/**
 * Registers predefined campaigns and evaluates their eligibility against events, usage
 * duration and their own frequency/completion state. Eligible campaigns are handed to
 * NoticeManager - campaigns never render or queue a notice themselves.
 *
 * @package MultivendorX\Engagement
 */
class CampaignManager {

    /**
     * Registered campaign definitions, keyed by id.
     *
     * @var array<string, array>
     */
    private $campaigns = array();

    /**
     * Event bus - Engagement itself (its listen()/dispatch() methods), not a separate
     * EventManager class.
     *
     * @var Engagement
     */
    private $events;

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
     * Constructor.
     *
     * @param Engagement    $events  Event bus (Engagement::listen()/dispatch()).
     * @param StateManager  $state   Shared state manager.
     * @param NoticeManager $notices Shared notice manager.
     */
    public function __construct( Engagement $events, StateManager $state, NoticeManager $notices ) {
        $this->events  = $events;
        $this->state   = $state;
        $this->notices = $notices;
    }

    /**
     * Register a campaign definition - see CLAUDE spec section 9 for shape. Ignored
     * (not overwritten) if a campaign with the same id is already registered.
     *
     * @param array $campaign Campaign definition.
     * @return bool|\WP_Error
     */
    public function register( array $campaign ) {
        if ( empty( $campaign['id'] ) || empty( $campaign['trigger']['event'] ) || empty( $campaign['content']['title'] ) ) {
            return new \WP_Error( 'engagement_invalid_campaign', 'Campaign requires id, trigger.event and content.title.' );
        }

        $id = sanitize_key( $campaign['id'] );

        if ( isset( $this->campaigns[ $id ] ) ) {
            return new \WP_Error( 'engagement_duplicate_campaign', 'Campaign id already registered.' );
        }

        $campaign['id']         = $id;
        $this->campaigns[ $id ] = $campaign;

        $event = $campaign['trigger']['event'];
        $this->events->listen(
            $event,
            function () use ( $id ) {
                $this->evaluate( $id );
            }
        );

        return true;
    }

    /**
     * Evaluate one campaign's eligibility against its trigger condition and current state,
     * and hand a notice to NoticeManager if eligible.
     *
     * @param string $campaign_id Campaign id.
     */
    private function evaluate( $campaign_id ) {
        $campaign = $this->campaigns[ $campaign_id ] ?? null;
        if ( ! $campaign ) {
            return;
        }

        $state = $this->state->get_campaign_state( $campaign_id );
        if ( ! empty( $state['completed'] ) ) {
            return;
        }

        $minimum_days = isset( $campaign['trigger']['minimum_usage_days'] ) ? (int) $campaign['trigger']['minimum_usage_days'] : 0;
        if ( $minimum_days > 0 && ! $this->meets_minimum_usage_days( $campaign, $minimum_days ) ) {
            return;
        }

        $frequency = (array) ( $campaign['frequency'] ?? array() );
        $notice_id = $campaign_id; // Campaign id doubles as the notice id for its own notice state row.

        if ( ! $this->state->is_notice_eligible( $notice_id, $frequency, false ) ) {
            return;
        }

        $this->notices->receive_campaign_notice(
            array(
                'id'        => $notice_id,
                'type'      => $campaign['type'] ?? 'product_discovery',
                'source'    => $campaign['source'] ?? '',
                'priority'  => $campaign['priority'] ?? null,
                'content'   => $campaign['content'],
                'actions'   => $campaign['actions'] ?? array(),
                'frequency' => $frequency,
            )
        );

        $this->state->record_campaign_impression( $campaign_id, $campaign['source'] ?? '' );
    }

    /**
     * Whether the plugin has been active at least $minimum_days, based on the plugin's own
     * `{source}_engagement_activated_at` option (set once by EngagementProvider::register()).
     *
     * @param array $campaign     Campaign definition.
     * @param int   $minimum_days Minimum days since activation.
     * @return bool
     */
    private function meets_minimum_usage_days( array $campaign, $minimum_days ) {
        $source       = $campaign['source'] ?? '';
        $activated_at = $source ? get_option( $source . '_engagement_activated_at', 0 ) : 0;

        if ( ! $activated_at ) {
            return false;
        }

        return ( time() - (int) $activated_at ) >= ( $minimum_days * DAY_IN_SECONDS );
    }
}
