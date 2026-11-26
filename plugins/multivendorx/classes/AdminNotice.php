<?php
/**
 * MultiVendorX AdminNotice class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

defined( 'ABSPATH' ) || exit;

/**
 * Renders MultiVendorX's WordPress admin notices in one layout: an icon tile, a title and description, then the
 * actions, on one row from 783px up and stacked below that. Used by the free plugin and MultiVendorX Pro, so every
 * notice the two show looks the same on every admin screen, inside or outside the MultiVendorX app.
 *
 * A notice given a `dismiss_key` is dismissible for good: closing it stores the key in the user's meta (through
 * `admin-notices.js`), and `render()` skips it from then on.
 *
 * @class       AdminNotice
 * @version     PRODUCT_VERSION
 * @package     MultiVendorX
 * @author      MultiVendorX
 */
class AdminNotice {

    /**
     * User meta holding the keys of the notices this user has dismissed for good.
     *
     * @var string
     */
    const DISMISSED_NOTICES_META_KEY = 'multivendorx_dismissed_admin_notices';

    /**
     * Dashicon shown in the icon tile for each notice type, unless the notice names its own.
     *
     * @var array
     */
    const DEFAULT_ICONS = array(
        'info'    => 'info-outline',
        'success' => 'yes-alt',
        'warning' => 'warning',
        'error'   => 'dismiss',
    );

    /**
     * Constructor. Registers the notice styles and the permanent-dismiss AJAX handler.
     */
    public function __construct() {
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_notice_styles' ) );
        add_action( 'wp_ajax_multivendorx_dismiss_admin_notice', array( $this, 'dismiss_notice_for_user' ) );
    }

    /**
     * Print one admin notice.
     *
     * @param array $notice {
     *     Notice content.
     *
     *     @type string $type        'info', 'success', 'warning' or 'error'. Default 'info'.
     *     @type string $title       Bold first line. Optional.
     *     @type string $message     Description; may contain inline HTML (passed through wp_kses_post()).
     *     @type string $icon        Dashicon slug without the `dashicons-` prefix. Defaults per type.
     *     @type array  $actions     Each: `label`, `url`, `style` ('primary', 'secondary' or 'link'), `new_tab` (bool),
     *                               `attributes` (array of extra attributes, e.g. data-action).
     *     @type bool   $dismissible Whether WordPress adds its close button. Default false.
     *     @type string $dismiss_key Remembers a close for this user; implies dismissible.
     *     @type string $class       Extra classes, e.g. one the notice's script looks for.
     *     @type string $details     Extra HTML under the description (passed through wp_kses_post()).
     * }
     * @return void
     */
    public static function render( array $notice ) {
        $notice = wp_parse_args(
            $notice,
            array(
                'type'        => 'info',
                'title'       => '',
                'message'     => '',
                'icon'        => '',
                'actions'     => array(),
                'dismissible' => false,
                'dismiss_key' => '',
                'class'       => '',
                'details'     => '',
            )
        );

        if ( $notice['dismiss_key'] && self::is_dismissed( $notice['dismiss_key'] ) ) {
            return;
        }

        $type    = array_key_exists( $notice['type'], self::DEFAULT_ICONS ) ? $notice['type'] : 'info';
        $icon    = $notice['icon'] ? $notice['icon'] : self::DEFAULT_ICONS[ $type ];
        $classes = array( 'notice', 'notice-' . $type, 'multivendorx-notice', $notice['class'] );

        if ( $notice['dismissible'] || $notice['dismiss_key'] ) {
            $classes[] = 'is-dismissible';
        }
        ?>
        <div class="<?php echo esc_attr( implode( ' ', array_filter( $classes ) ) ); ?>"<?php echo $notice['dismiss_key'] ? ' data-dismiss-key="' . esc_attr( $notice['dismiss_key'] ) . '"' : ''; ?>>
            <span class="multivendorx-notice-icon dashicons dashicons-<?php echo esc_attr( $icon ); ?>" aria-hidden="true"></span>

            <div class="multivendorx-notice-body">
                <?php if ( $notice['title'] ) : ?>
                    <p class="multivendorx-notice-title"><?php echo esc_html( $notice['title'] ); ?></p>
                <?php endif; ?>
                <?php if ( $notice['message'] ) : ?>
                    <p class="multivendorx-notice-desc"><?php echo wp_kses_post( $notice['message'] ); ?></p>
                <?php endif; ?>
                <?php
                if ( $notice['details'] ) {
                    echo wp_kses_post( $notice['details'] );
                }
                ?>
            </div>

            <?php if ( $notice['actions'] ) : ?>
                <div class="multivendorx-notice-actions">
                    <?php
                    foreach ( $notice['actions'] as $action ) {
                        self::render_action( $action );
                    }
                    ?>
                </div>
            <?php endif; ?>
        </div>
        <?php
    }

    /**
     * Print one notice action: a primary or secondary button, or a text link.
     *
     * @param array $action Action, as described in render().
     * @return void
     */
    private static function render_action( array $action ) {
        $action = wp_parse_args(
            $action,
            array(
                'label'      => '',
                'url'        => '#',
                'style'      => 'primary',
                'new_tab'    => false,
                'attributes' => array(),
            )
        );

        $class = 'link' === $action['style'] ? 'multivendorx-notice-link' : 'button button-' . ( 'secondary' === $action['style'] ? 'secondary' : 'primary' );

        $attributes = '';
        foreach ( $action['attributes'] as $name => $value ) {
            $attributes .= sprintf( ' %s="%s"', esc_attr( $name ), esc_attr( $value ) );
        }

        if ( $action['new_tab'] ) {
            $attributes .= ' target="_blank" rel="noopener noreferrer"';
        }

        printf(
            '<a href="%1$s" class="%2$s"%3$s>%4$s%5$s</a>',
            esc_url( $action['url'] ),
            esc_attr( $class ),
            $attributes, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- each part escaped above.
            esc_html( $action['label'] ),
            $action['new_tab'] ? '<span class="screen-reader-text"> ' . esc_html__( '(opens in a new tab)', 'multivendorx' ) . '</span>' : ''
        );
    }

    /**
     * Whether the current user has dismissed the notice with this key for good.
     *
     * @param string $dismiss_key Notice key.
     * @return bool
     */
    public static function is_dismissed( $dismiss_key ) {
        $dismissed_keys = get_user_meta( get_current_user_id(), self::DISMISSED_NOTICES_META_KEY, true );

        return is_array( $dismissed_keys ) && in_array( $dismiss_key, $dismissed_keys, true );
    }

    /**
     * AJAX: remember that the current user closed the notice with the posted key.
     *
     * @return void
     */
    public function dismiss_notice_for_user() {
        check_ajax_referer( 'admin_notice', 'nonce' );

        $dismiss_key = sanitize_key( filter_input( INPUT_POST, 'dismiss_key' ) ?? '' );
        if ( ! $dismiss_key ) {
            wp_send_json_error( null, 400 );
        }

        $user_id        = get_current_user_id();
        $dismissed_keys = get_user_meta( $user_id, self::DISMISSED_NOTICES_META_KEY, true );
        $dismissed_keys = is_array( $dismissed_keys ) ? $dismissed_keys : array();

        if ( ! in_array( $dismiss_key, $dismissed_keys, true ) ) {
            $dismissed_keys[] = $dismiss_key;
            update_user_meta( $user_id, self::DISMISSED_NOTICES_META_KEY, $dismissed_keys );
        }

        wp_send_json_success();
    }

    /**
     * Notices show on every admin screen, not only MultiVendorX's, so their layout ships as an inline style rather
     * than in the admin app's stylesheet.
     *
     * @return void
     */
    public function enqueue_notice_styles() {
        wp_register_style( 'multivendorx-admin-notice-layout', false, array( 'dashicons' ), MULTIVENDORX_PLUGIN_VERSION );
        wp_enqueue_style( 'multivendorx-admin-notice-layout' );
        wp_add_inline_style( 'multivendorx-admin-notice-layout', $this->get_notice_css() );
    }

    /**
     * The notice layout. `#wpbody #wpbody-content` lets it outrank both WordPress's notice styles and the MultiVendorX admin app's
     * own notice restyle (design-system.scss), which would otherwise recolour the buttons and drop the icon row.
     *
     * @return string
     */
    private function get_notice_css() {
        return '
            #wpbody #wpbody-content .multivendorx-notice { --mvx-notice-accent: #5007aa; --mvx-notice-tint: #f4eefb; display: flex; align-items: center; gap: 16px; padding: 14px 16px; border-left-color: var(--mvx-notice-accent); }
            #wpbody #wpbody-content .multivendorx-notice.is-dismissible { padding-right: 48px; }
            #wpbody #wpbody-content .multivendorx-notice.notice-success { --mvx-notice-accent: #16a34a; --mvx-notice-tint: #e7f6ec; }
            #wpbody #wpbody-content .multivendorx-notice.notice-warning { --mvx-notice-accent: #d97706; --mvx-notice-tint: #fef3c7; }
            #wpbody #wpbody-content .multivendorx-notice.notice-error { --mvx-notice-accent: #dc2626; --mvx-notice-tint: #fee2e2; }
            #wpbody #wpbody-content .multivendorx-notice .multivendorx-notice-icon { flex: none; width: 40px; height: 40px; border-radius: 10px; background: var(--mvx-notice-tint); color: var(--mvx-notice-accent); font-size: 22px; line-height: 40px; text-align: center; }
            #wpbody #wpbody-content .multivendorx-notice .multivendorx-notice-body { flex: 1; min-width: 0; }
            #wpbody #wpbody-content .multivendorx-notice p { margin: 0; padding: 0; }
            #wpbody #wpbody-content .multivendorx-notice .multivendorx-notice-title { color: #1d2327; font-size: 14px; font-weight: 600; line-height: 1.4; }
            #wpbody #wpbody-content .multivendorx-notice .multivendorx-notice-desc { color: #50575e; font-size: 13px; line-height: 1.5; }
            #wpbody #wpbody-content .multivendorx-notice .multivendorx-notice-title + .multivendorx-notice-desc { margin-top: 2px; }
            #wpbody #wpbody-content .multivendorx-notice .tracking-details { display: none; }
            #wpbody #wpbody-content .multivendorx-notice .multivendorx-notice-details { margin-top: 6px; color: #50575e; font-size: 12px; line-height: 1.5; }
            #wpbody #wpbody-content .multivendorx-notice .multivendorx-notice-actions { display: flex; flex: none; flex-wrap: wrap; align-items: center; gap: 8px 12px; }
            #wpbody #wpbody-content .multivendorx-notice .multivendorx-notice-desc a,
            #wpbody #wpbody-content .multivendorx-notice .multivendorx-notice-link { color: #5007aa; font-weight: 600; text-decoration: none; }
            #wpbody #wpbody-content .multivendorx-notice .multivendorx-notice-desc a:hover,
            #wpbody #wpbody-content .multivendorx-notice .multivendorx-notice-link:hover { text-decoration: underline; }
            #wpbody #wpbody-content .multivendorx-notice .button { margin: 0; border-color: #5007aa; border-radius: 6px; box-shadow: none; font-weight: 600; text-decoration: none; }
            #wpbody #wpbody-content .multivendorx-notice .button-primary { background: #5007aa; color: #fff; }
            #wpbody #wpbody-content .multivendorx-notice .button-primary:hover,
            #wpbody #wpbody-content .multivendorx-notice .button-primary:focus { border-color: #3f0588; background: #3f0588; color: #fff; }
            #wpbody #wpbody-content .multivendorx-notice .button-secondary { background: #fff; color: #5007aa; }
            #wpbody #wpbody-content .multivendorx-notice .button-secondary:hover,
            #wpbody #wpbody-content .multivendorx-notice .button-secondary:focus { background: #f4eefb; color: #3f0588; }
            @media (max-width: 782px) {
                #wpbody #wpbody-content .multivendorx-notice { flex-wrap: wrap; align-items: flex-start; }
                #wpbody #wpbody-content .multivendorx-notice .multivendorx-notice-body { flex-basis: calc(100% - 56px); }
                #wpbody #wpbody-content .multivendorx-notice .multivendorx-notice-actions { box-sizing: border-box; flex-basis: 100%; padding-left: 56px; }
            }
        ';
    }
}
