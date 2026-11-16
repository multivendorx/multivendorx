<?php
/**
 * AdminNoticeRenderer class file.
 *
 * @package MultivendorX\Engagement
 */

namespace MultivendorX\Engagement;

defined( 'ABSPATH' ) || exit;

/**
 * Renders the framework's notices and telemetry consent prompt as plain WordPress admin
 * notices (`admin_notices`) on every wp-admin page, instead of a React component the
 * consuming plugin would otherwise have to mount. There is no JavaScript here at all - action
 * links (install/learn more/accept/decline/dismiss) are plain `<a href>`s; anything that
 * changes state (dismiss, accept, decline) posts through `admin-post.php` and redirects back.
 *
 * Only ever shows one thing at a time: the telemetry consent prompt and the single highest-
 * priority eligible notice from NoticeManager are compared on the *same* priority scale
 * (CONSENT_PRIORITY vs each notice's own `priority` field) - whichever is numerically higher
 * wins. The consent prompt does not automatically outrank every notice; it's only ever shown
 * ahead of a specific notice because that notice's own `priority` is lower, same as any two
 * notices competing with each other.
 *
 * @package MultivendorX\Engagement
 */
class AdminNoticeRenderer {

    const ACTION       = 'multivendorx_engagement_action';
    const NONCE_ACTION = 'multivendorx_engagement_action';

    /**
     * Telemetry consent's priority on the same scale notices use (NoticeManager::
     * DEFAULT_PRIORITIES). Matches the Engagement Framework spec's priority table default.
     *
     * @var int
     */
    const CONSENT_PRIORITY = 90;

    /**
     * Shared notice manager.
     *
     * @var NoticeManager
     */
    private $notices;

    /**
     * Shared telemetry manager.
     *
     * @var TelemetryManager
     */
    private $telemetry;

    /**
     * Constructor.
     *
     * @param NoticeManager    $notices   Shared notice manager.
     * @param TelemetryManager $telemetry Shared telemetry manager.
     */
    public function __construct( NoticeManager $notices, TelemetryManager $telemetry ) {
        $this->notices   = $notices;
        $this->telemetry = $telemetry;

        add_action( 'admin_notices', array( $this, 'render' ) );
        add_action( 'admin_post_' . self::ACTION, array( $this, 'handle_action' ) );
    }

    /**
     * Render whichever of (telemetry consent prompt, top eligible notice) currently has the
     * higher priority - not an automatic consent-always-wins rule. NoticeManager::
     * get_eligible_notices() already sorted/capped its side down to one promotional notice
     * plus any operational ones.
     */
    public function render() {
        if ( ! current_user_can( 'manage_options' ) ) {
            return;
        }

        $consent_due = $this->telemetry->should_prompt_for_consent();

        $eligible    = $this->notices->get_eligible_notices();
        $top_notice  = $eligible[0] ?? null;
        $notice_wins = $top_notice && ( ! $consent_due || $top_notice['priority'] > self::CONSENT_PRIORITY );

        if ( $notice_wins ) {
            $this->render_notice( $top_notice );
            return;
        }

        if ( $consent_due ) {
            $this->render_consent_prompt();
        }
    }

    /**
     * Render one notice and record its impression - rendering here *is* the confirmation the
     * notice actually reached the page, so the impression is recorded synchronously rather
     * than waiting on a separate "confirm render" round trip the way a JS renderer would need.
     *
     * @param array $notice Eligible notice from NoticeManager::get_eligible_notices().
     */
    private function render_notice( array $notice ) {
        $this->notices->handle_interaction( $notice['id'], 'impression', array( 'source' => $notice['source'] ) );

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
                        <a class="button button-link" href="<?php echo esc_url( $this->action_url( 'notice', $notice['id'], 'dismiss' ) ); ?>">
                            <?php echo esc_html( $action['label'] ); ?>
                        </a>
                    <?php endif; ?>
                <?php endforeach; ?>
            </p>
        </div>
        <?php
    }

    /**
     * Render the shared telemetry consent prompt - Accept/Decline/Not now, each a plain link
     * to admin-post.php.
     */
    private function render_consent_prompt() {
        ?>
        <div class="notice notice-info multivendorx-engagement-consent">
            <p><strong><?php esc_html_e( 'Help us improve', 'notifima' ); ?></strong></p>
            <p><?php esc_html_e( 'Share anonymous usage data to help us improve. No personal or customer data is collected.', 'notifima' ); ?></p>
            <p>
                <a class="button button-primary" style="margin-right: 6px;" href="<?php echo esc_url( $this->action_url( 'consent', '', 'accept' ) ); ?>">
                    <?php esc_html_e( 'Accept', 'notifima' ); ?>
                </a>
                <a class="button button-secondary" style="margin-right: 6px;" href="<?php echo esc_url( $this->action_url( 'consent', '', 'decline' ) ); ?>">
                    <?php esc_html_e( 'Decline', 'notifima' ); ?>
                </a>
                <a class="button button-link" href="<?php echo esc_url( $this->action_url( 'consent', '', 'dismiss' ) ); ?>">
                    <?php esc_html_e( 'Not now', 'notifima' ); ?>
                </a>
            </p>
        </div>
        <?php
    }

    /**
     * Build a nonced admin-post.php URL for a dismiss/consent decision.
     *
     * @param string $kind      'notice' or 'consent'.
     * @param string $notice_id Notice id - empty for a consent decision.
     * @param string $decision  'dismiss' (notice) or 'accept'|'decline'|'dismiss' (consent).
     * @return string
     */
    private function action_url( $kind, $notice_id, $decision ) {
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
            self::NONCE_ACTION
        );
    }

    /**
     * Admin-post.php handler for every link rendered above. Applies the decision, then
     * redirects back to wherever the link was clicked from.
     */
    public function handle_action() {
        check_admin_referer( self::NONCE_ACTION );

        if ( ! current_user_can( 'manage_options' ) ) {
            wp_die( esc_html__( 'You do not have permission to do this.', 'notifima' ) );
        }

        $kind     = isset( $_GET['kind'] ) ? sanitize_key( $_GET['kind'] ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- verified above via check_admin_referer().
        $decision = isset( $_GET['decision'] ) ? sanitize_key( $_GET['decision'] ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- verified above via check_admin_referer().

        if ( 'consent' === $kind ) {
            $this->apply_consent_decision( $decision );
        } elseif ( 'notice' === $kind && 'dismiss' === $decision ) {
            $notice_id = isset( $_GET['notice_id'] ) ? sanitize_key( $_GET['notice_id'] ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- verified above via check_admin_referer().
            if ( $notice_id ) {
                $this->notices->handle_interaction( $notice_id, 'dismiss' );
            }
        }

        wp_safe_redirect( wp_get_referer() ?: admin_url() ); // phpcs:ignore Universal.Operators.DisallowShortTernary.Found -- wp_get_referer() has no falsy-but-valid return to misfire on here.
        exit;
    }

    /**
     * Apply an accept/decline/dismiss consent decision.
     *
     * @param string $decision One of accept|decline|dismiss.
     */
    private function apply_consent_decision( $decision ) {
        switch ( $decision ) {
            case 'accept':
                $this->telemetry->accept();
                break;
            case 'decline':
                $this->telemetry->decline();
                break;
            case 'dismiss':
                $this->telemetry->dismiss();
                break;
        }
    }

    /**
     * Map a notice type to a WordPress admin-notice severity class.
     *
     * @param string $type Notice type.
     * @return string
     */
    private function severity_class( $type ) {
        if ( in_array( $type, array( 'system', 'operational' ), true ) ) {
            return 'notice-warning';
        }
        return 'notice-info';
    }
}
