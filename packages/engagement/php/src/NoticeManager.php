<?php
/**
 * NoticeManager class file.
 *
 * @package MultivendorX\Engagement
 */

namespace MultivendorX\Engagement;

defined( 'ABSPATH' ) || exit;

/**
 * Single entry point both notice sources (custom NoticeManager::request() calls and eligible
 * campaigns from CampaignManager) go through. Validates, deduplicates, applies priority and
 * frequency, and exposes the resulting queue to the REST layer.
 *
 * Also owns rendering: `admin_notices`/`admin_post` as plain WordPress admin notices, no
 * JavaScript. render() decides between the single highest-priority eligible notice and
 * TelemetryManager's consent prompt by comparing priorities on the same scale (see
 * CONSENT_PRIORITY) - this is the one place that needs to know about both NoticeManager's own
 * queue and TelemetryManager's consent state, so it lives here rather than a third renderer
 * class whose only job was holding a reference to each of these two anyway.
 *
 * @package MultivendorX\Engagement
 */
class NoticeManager {

    /**
     * Admin-post.php action name for every dismiss/consent-decision link this class renders.
     *
     * @var string
     */
    const ACTION = 'multivendorx_engagement_action';

    /**
     * Telemetry consent's priority on the same scale notices use (DEFAULT_PRIORITIES below).
     *
     * @var int
     */
    const CONSENT_PRIORITY = 90;

    const TYPES = array(
        'onboarding',
        'feature_announcement',
        'product_education',
        'product_discovery',
        'contextual_recommendation',
        'feedback_request',
        'review_request',
        'system',
        'operational',
    );

    const LAYOUTS = array( 'banner', 'card', 'inline' );

    const DEFAULT_PRIORITIES = array(
        'system'                    => 100,
        'operational'               => 90,
        'onboarding'                => 70,
        'product_education'         => 60,
        'contextual_recommendation' => 50,
        'product_discovery'         => 40,
        'feedback_request'          => 30,
        'review_request'            => 20,
    );

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
     * In-memory, registered-but-not-yet-persisted notices from this request only; notices
     * are not stored by content, only their interaction state is persisted (see StateManager).
     *
     * @var array
     */
    private $queue = array();

    /**
     * Shared telemetry manager - only used to decide/render the consent prompt competing for
     * the same screen real estate (see render()); not used anywhere else in this class.
     *
     * @var TelemetryManager
     */
    private $telemetry;

    /**
     * Constructor.
     *
     * @param Storage          $storage   Shared storage instance.
     * @param StateManager     $state     Shared state manager.
     * @param TelemetryManager $telemetry Shared telemetry manager.
     */
    public function __construct( Storage $storage, StateManager $state, TelemetryManager $telemetry ) {
        $this->storage   = $storage;
        $this->state     = $state;
        $this->telemetry = $telemetry;

        add_action( 'admin_notices', array( $this, 'render' ) );
        add_action( 'admin_post_' . self::ACTION, array( $this, 'handle_action' ) );
    }

    /**
     * Request a custom notice. Validates and normalizes, then adds it to the shared queue if
     * it is currently eligible (not duplicate, within frequency/cooldown).
     *
     * @param array $notice Notice definition - see CLAUDE spec section 8 for shape.
     * @return bool|\WP_Error True on success, WP_Error on validation failure.
     */
    public function request( array $notice ) {
        $normalized = $this->normalize( $notice );

        if ( is_wp_error( $normalized ) ) {
            return $normalized;
        }

        $this->add_to_queue( $normalized );

        return true;
    }

    /**
     * Update fields on a previously requested (still pending) notice.
     *
     * @param string $notice_id Notice id.
     * @param array  $changes   Partial fields to override.
     * @return bool|\WP_Error
     */
    public function update( $notice_id, array $changes ) {
        if ( ! isset( $this->queue[ $notice_id ] ) ) {
            return new \WP_Error( 'engagement_notice_not_found', 'Notice is not currently queued.' );
        }

        $merged     = array_replace_recursive( $this->queue[ $notice_id ], $changes );
        $normalized = $this->normalize( $merged );

        if ( is_wp_error( $normalized ) ) {
            return $normalized;
        }

        $this->queue[ $notice_id ] = $normalized;

        return true;
    }

    /**
     * Cancel a queued notice outright (it will not be sent to the frontend this request).
     *
     * @param string $notice_id Notice id.
     */
    public function cancel( $notice_id ) {
        unset( $this->queue[ $notice_id ] );
    }

    /**
     * Receive a notice generated by an eligible campaign. Same validation/eligibility path
     * as request() - campaigns never bypass NoticeManager.
     *
     * @param array $notice Notice definition built by CampaignManager.
     * @return bool|\WP_Error
     */
    public function receive_campaign_notice( array $notice ) {
        return $this->request( $notice );
    }

    /**
     * Validate and normalize a notice definition. Fills in defaults (priority from type,
     * default frequency) and rejects malformed input.
     *
     * @param array $notice Raw notice definition.
     * @return array|\WP_Error
     */
    private function normalize( array $notice ) {
        if ( empty( $notice['id'] ) || ! is_string( $notice['id'] ) ) {
            return new \WP_Error( 'engagement_invalid_notice', 'Notice id is required.' );
        }

        if ( empty( $notice['type'] ) || ! in_array( $notice['type'], self::TYPES, true ) ) {
            return new \WP_Error( 'engagement_invalid_notice', 'Notice type is invalid.' );
        }

        if ( empty( $notice['content']['title'] ) || empty( $notice['content']['description'] ) ) {
            return new \WP_Error( 'engagement_invalid_notice', 'Notice content requires a title and description.' );
        }

        $layout = isset( $notice['content']['layout'] ) ? $notice['content']['layout'] : 'card';
        if ( ! in_array( $layout, self::LAYOUTS, true ) ) {
            return new \WP_Error( 'engagement_invalid_notice', 'Notice layout is invalid.' );
        }

        foreach ( (array) ( $notice['actions'] ?? array() ) as $action ) {
            if ( empty( $action['id'] ) || empty( $action['type'] ) || ! in_array( $action['type'], array( 'url', 'dismiss', 'event' ), true ) ) {
                return new \WP_Error( 'engagement_invalid_notice', 'Notice action is invalid.' );
            }
            if ( 'url' === $action['type'] && empty( $action['url'] ) ) {
                return new \WP_Error( 'engagement_invalid_notice', 'URL action requires a url.' );
            }
        }

        $priority = isset( $notice['priority'] ) ? (int) $notice['priority'] : ( self::DEFAULT_PRIORITIES[ $notice['type'] ] ?? 50 );

        $frequency = array(
            'max_impressions' => isset( $notice['frequency']['max_impressions'] ) ? (int) $notice['frequency']['max_impressions'] : null,
            'cooldown_days'   => isset( $notice['frequency']['cooldown_days'] ) ? (int) $notice['frequency']['cooldown_days'] : null,
        );
        $frequency = array_filter( $frequency, static fn( $v ) => null !== $v );

        return array(
            'id'        => sanitize_key( $notice['id'] ),
            'type'      => $notice['type'],
            'source'    => isset( $notice['source'] ) ? sanitize_key( $notice['source'] ) : '',
            'priority'  => $priority,
            'content'   => array(
                'title'       => wp_strip_all_tags( $notice['content']['title'] ),
                'description' => wp_strip_all_tags( $notice['content']['description'] ),
                'layout'      => $layout,
            ),
            'actions'   => array_map(
                static function ( $action ) {
                    return array(
                        'id'    => sanitize_key( $action['id'] ),
                        'label' => isset( $action['label'] ) ? wp_strip_all_tags( $action['label'] ) : '',
                        'type'  => $action['type'],
                        'url'   => isset( $action['url'] ) ? esc_url_raw( $action['url'] ) : '',
                    );
                },
                (array) ( $notice['actions'] ?? array() )
            ),
            'frequency' => $frequency,
        );
    }

    /**
     * Add a normalized notice to the in-request queue if it isn't a duplicate and its
     * frequency/cooldown rules currently allow it.
     *
     * @param array $notice Normalized notice.
     */
    private function add_to_queue( array $notice ) {
        if ( isset( $this->queue[ $notice['id'] ] ) ) {
            return; // Duplicate within this request.
        }

        if ( ! $this->state->is_notice_eligible( $notice['id'], $notice['frequency'], $this->is_operational_type( $notice['type'] ) ) ) {
            return;
        }

        $this->queue[ $notice['id'] ] = $notice;
    }

    /**
     * Return the current queue's notices, sorted by priority (highest first), limited to one
     * promotional notice at a time (operational/system notices are never limited).
     *
     * @return array
     */
    public function get_eligible_notices() {
        $queue = array_values( $this->queue );

        usort(
            $queue,
            static function ( $a, $b ) {
                return $b['priority'] - $a['priority'];
            }
        );

        $operational = array_values(
            array_filter( $queue, fn( $n ) => $this->is_operational_type( $n['type'] ) )
        );
        $promotional = array_values(
            array_filter( $queue, fn( $n ) => ! $this->is_operational_type( $n['type'] ) )
        );

        if ( ! empty( $promotional ) ) {
            $promotional = array( $promotional[0] );
        }

        return array_merge( $operational, $promotional );
    }

    /**
     * Handle a reported user interaction. Only 'impression' is accepted as proof of render;
     * all other interaction types act on already-known notices.
     *
     * @param string $notice_id     Notice id.
     * @param string $interaction   One of impression|dismiss|snooze|action.
     * @param array  $payload       Extra interaction data (e.g. snooze_days, action_id).
     * @return bool|\WP_Error
     */
    public function handle_interaction( $notice_id, $interaction, array $payload = array() ) {
        $notice_id = sanitize_key( $notice_id );

        switch ( $interaction ) {
            case 'impression':
                $this->state->record_notice_impression( $notice_id, $payload['source'] ?? '' );
                return true;

            case 'dismiss':
                $this->state->dismiss_notice( $notice_id );
                return true;

            case 'snooze':
                $days = isset( $payload['snooze_days'] ) ? (int) $payload['snooze_days'] : 7;
                $this->state->snooze_notice( $notice_id, time() + ( $days * DAY_IN_SECONDS ) );
                return true;

            case 'action':
                // Action clicks are tracked as an impression-adjacent event; no separate state bucket.
                return true;

            default:
                return new \WP_Error( 'engagement_invalid_interaction', 'Unknown interaction type.' );
        }
    }

    /**
     * Render whichever of (telemetry consent prompt, top eligible notice) currently has the
     * higher priority - not an automatic consent-always-wins rule. get_eligible_notices()
     * already sorted/capped its side down to one promotional notice plus any operational ones.
     */
    public function render() {
        if ( ! current_user_can( 'manage_options' ) ) {
            return;
        }

        $consent_due = $this->telemetry->should_prompt_for_consent();

        $eligible    = $this->get_eligible_notices();
        $top_notice  = $eligible[0] ?? null;
        $notice_wins = $top_notice && ( ! $consent_due || $top_notice['priority'] > self::CONSENT_PRIORITY );

        if ( $notice_wins ) {
            $this->render_notice( $top_notice );
            return;
        }

        if ( $consent_due ) {
            $this->telemetry->render_consent_prompt();
        }
    }

    /**
     * Render one notice and record its impression - rendering here *is* the confirmation the
     * notice actually reached the page, so the impression is recorded synchronously rather
     * than waiting on a separate "confirm render" round trip the way a JS renderer would need.
     *
     * @param array $notice Eligible notice from get_eligible_notices().
     */
    private function render_notice( array $notice ) {
        $this->handle_interaction( $notice['id'], 'impression', array( 'source' => $notice['source'] ) );

        $css_class = $this->severity_class( $notice['type'] );
        ?>
        <div class="notice <?php echo esc_attr( $css_class ); ?> multivendorx-engagement-notice">
            <p><strong><?php echo esc_html( $notice['content']['title'] ); ?></strong></p>
            <p><?php echo esc_html( $notice['content']['description'] ); ?></p>
            <p>
                <?php foreach ( $notice['actions'] as $action ) : ?>
                    <?php if ( 'url' === $action['type'] ) : ?>
                        <a class="button button-secondary" style="margin-right: 6px;" href="<?php echo esc_url( $action['url'] ); ?>" target="_blank" rel="noopener noreferrer">
                            <?php echo esc_html( $action['label'] ); ?>
                        </a>
                    <?php elseif ( 'dismiss' === $action['type'] ) : ?>
                        <a class="button button-link" href="<?php echo esc_url( self::build_action_url( 'notice', $notice['id'], 'dismiss' ) ); ?>">
                            <?php echo esc_html( $action['label'] ); ?>
                        </a>
                    <?php endif; ?>
                <?php endforeach; ?>
            </p>
        </div>
        <?php
    }

    /**
     * Map a notice type to a WordPress admin-notice severity class.
     *
     * @param string $type Notice type.
     * @return string
     */
    private function severity_class( $type ) {
        return $this->is_operational_type( $type ) ? 'notice-warning' : 'notice-info';
    }

    /**
     * Whether a notice type is exempt from promotional frequency limits/the one-at-a-time cap
     * (see get_eligible_notices()/add_to_queue()) - also used for its admin-notice color.
     *
     * @param string $type Notice type.
     * @return bool
     */
    private function is_operational_type( $type ) {
        return in_array( $type, array( 'system', 'operational' ), true );
    }

    /**
     * Build a nonced admin-post.php URL for a dismiss/consent decision. Static (and public) so
     * TelemetryManager::render_consent_prompt() can build its own links to the same handler
     * without needing a NoticeManager instance.
     *
     * @param string $kind      'notice' or 'consent'.
     * @param string $notice_id Notice id - empty for a consent decision.
     * @param string $decision  'dismiss' (notice) or 'accept'|'decline'|'dismiss' (consent).
     * @return string
     */
    public static function build_action_url( $kind, $notice_id, $decision ) {
        return wp_nonce_url(
            add_query_arg(
                array(
                    'action'    => self::ACTION,
                    'kind'      => $kind,
                    'notice_id' => $notice_id,
                    'decision'  => $decision,
                ),
                admin_url( 'admin-post.php' )
            ),
            self::ACTION
        );
    }

    /**
     * Admin-post.php handler for every link rendered above. Applies the decision, then
     * redirects back to wherever the link was clicked from.
     */
    public function handle_action() {
        check_admin_referer( self::ACTION );

        if ( ! current_user_can( 'manage_options' ) ) {
            wp_die( esc_html__( 'You do not have permission to do this.', 'notifima' ) );
        }

        $kind     = isset( $_GET['kind'] ) ? sanitize_key( $_GET['kind'] ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- verified above via check_admin_referer().
        $decision = isset( $_GET['decision'] ) ? sanitize_key( $_GET['decision'] ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- verified above via check_admin_referer().

        if ( 'consent' === $kind ) {
            $this->telemetry->apply_consent_decision( $decision );
        } elseif ( 'notice' === $kind && 'dismiss' === $decision ) {
            $notice_id = isset( $_GET['notice_id'] ) ? sanitize_key( $_GET['notice_id'] ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- verified above via check_admin_referer().
            if ( $notice_id ) {
                $this->handle_interaction( $notice_id, 'dismiss' );
            }
        }

        wp_safe_redirect( wp_get_referer() ?: admin_url() ); // phpcs:ignore Universal.Operators.DisallowShortTernary.Found -- wp_get_referer() has no falsy-but-valid return to misfire on here.
        exit;
    }
}
