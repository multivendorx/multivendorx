<?php
/**
 * RedirectManager class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Services;

use VuloPilot\Repositories\RedirectRepository;
use VuloPilot\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Readme.txt's "Redirects & 404s" — a real 301/302 redirect manager over
 * the `vulopilot_redirects` table, the feature Utill.php's own
 * `enable_redirect_manager`/`auto_redirect_on_slug_change` settings were
 * persisted for but had nothing behind them until now. Self-registers its
 * own hooks (php-wordpress.md) and is constructed unconditionally in
 * VuloPilot::init_classes(), the same shape CrawlerTrafficLogger/
 * LlmsTxtGenerator already use — both settings gate behavior inside the
 * hook callbacks, not whether the class is built at all.
 *
 * `maybe_apply_redirect()` runs on `template_redirect` at priority 1 —
 * deliberately earlier than Services\NotFoundLogger's own `template_redirect`
 * hook (priority 20) and CrawlerTrafficLogger's (default priority 10), so a
 * configured redirect always wins and a request it resolves is never also
 * counted as a 404 by the logger running later in the same request.
 *
 * `maybe_auto_create_redirect()` is the "Auto-create redirect on slug
 * change" setting's own implementation — hooked to core's `post_updated`
 * (fires with both the before/after WP_Post objects already loaded, no
 * extra query needed to know the previous slug). Passing $post_before
 * directly to get_permalink() is what makes computing the OLD permalink
 * possible without re-querying: get_permalink() accepts an already-loaded
 * WP_Post and reads its own post_name property rather than looking the
 * post up again, so the object's stale (pre-save) slug is exactly what a
 * live get_permalink() call would have returned a moment earlier.
 *
 * @class       RedirectManager class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class RedirectManager {

    /**
     * RedirectManager constructor.
     */
    public function __construct() {
        add_action( 'template_redirect', array( $this, 'maybe_apply_redirect' ), 1 );
        add_action( 'post_updated', array( $this, 'maybe_auto_create_redirect' ), 10, 3 );
    }

    /**
     * Redirects the current request if its path matches an active row.
     *
     * @return void
     */
    public function maybe_apply_redirect(): void {
        $settings = wp_parse_args( get_option( Utill::VULOPILOT_SETTINGS_KEY, array() ), Utill::VULOPILOT_SETTINGS_DEFAULTS );

        if ( empty( $settings['enable_redirect_manager'] ) ) {
            return;
        }

        $requested_uri = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';
        $path          = wp_parse_url( $requested_uri, PHP_URL_PATH ) ?? '/';
        $source_path   = RedirectRepository::normalize_path( $path );

        $repository = new RedirectRepository();
        $redirect   = $repository->find_by_source_path( $source_path );

        if ( ! $redirect || empty( $redirect['is_active'] ) ) {
            return;
        }

        $repository->increment_hit_count( (int) $redirect['id'] );

        // wp_safe_redirect() deliberately can't be used here — it silently
        // substitutes any target outside wp_validate_redirect()'s allowed-
        // hosts list with admin_url(), which would send every visitor to
        // /wp-admin/ instead for the common, expected case of redirecting
        // to an external domain (a site migration, a moved page now
        // living elsewhere). Safe here despite that: the target came from
        // an admin-configured row (manage_options-gated,
        // RestAPI\Controllers\Redirects::create_item()/update_item()
        // already ran it through esc_url_raw() before it was ever stored),
        // not from this request's own input.
        wp_redirect( $redirect['target_url'], (int) $redirect['redirect_type'] ); // phpcs:ignore WordPress.Security.SafeRedirect.wp_redirect_wp_redirect -- see comment above: target is admin-configured and pre-sanitized, not visitor input.
        exit;
    }

    /**
     * Creates or updates a redirect from a post's old permalink when its slug changes.
     *
     * @param int      $post_id    Post id (unused — $post_before/$post_after already carry everything needed).
     * @param \WP_Post $post_after Post object after the save.
     * @param \WP_Post $post_before Post object as it was before the save.
     * @return void
     */
    public function maybe_auto_create_redirect( $post_id, $post_after, $post_before ): void {
        $settings = wp_parse_args( get_option( Utill::VULOPILOT_SETTINGS_KEY, array() ), Utill::VULOPILOT_SETTINGS_DEFAULTS );

        if ( empty( $settings['enable_redirect_manager'] ) || empty( $settings['auto_redirect_on_slug_change'] ) ) {
            return;
        }

        // Only a slug change on a post that was ALREADY publicly published
        // has a real, previously-indexable URL worth protecting with a
        // redirect — every draft/autosave save also fires post_updated,
        // and this guard is what keeps those from creating junk rows.
        if ( 'publish' !== $post_before->post_status || $post_before->post_name === $post_after->post_name ) {
            return;
        }

        if ( ! is_post_type_viewable( $post_after->post_type ) ) {
            return;
        }

        $old_path = RedirectRepository::normalize_path( (string) wp_parse_url( get_permalink( $post_before ), PHP_URL_PATH ) );
        $new_path = RedirectRepository::normalize_path( (string) wp_parse_url( get_permalink( $post_after ), PHP_URL_PATH ) );

        if ( '' === $old_path || $old_path === $new_path ) {
            return;
        }

        $repository = new RedirectRepository();
        $existing   = $repository->find_by_source_path( $old_path );
        $target_url = get_permalink( $post_after );

        if ( $existing ) {
            $repository->update(
                (int) $existing['id'],
                array(
                    'target_url'    => $target_url,
                    'redirect_type' => 301,
                    'is_active'     => 1,
                )
            );

            return;
        }

        $repository->insert(
            array(
                'source_path'   => $old_path,
                'target_url'    => $target_url,
                'redirect_type' => 301,
                'hit_count'     => 0,
                'is_active'     => 1,
                'created_by'    => get_current_user_id(),
            )
        );
    }
}
