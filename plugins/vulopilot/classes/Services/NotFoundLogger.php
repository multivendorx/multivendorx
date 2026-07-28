<?php
/**
 * NotFoundLogger class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Services;

use VuloPilot\Repositories\NotFoundLogRepository;
use VuloPilot\Repositories\RedirectRepository;
use VuloPilot\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Readme.txt's "Redirects & 404s" — the `log_404s` setting's own
 * implementation, distinct from Scanners\Basic\NotFoundScanner (which only
 * checks this site's OWN published permalinks for internal links pointing
 * at a 404, a content-integrity check with no visitor traffic involved).
 * This logs real visitor requests that actually 404, so a site owner can
 * see which missing URLs are still being hit and turn the worthwhile ones
 * into a redirect from the Redirects page — readme.txt's own description:
 * "Track visits to missing pages so you can turn them into redirect
 * suggestions."
 *
 * Self-registers on `template_redirect` at priority 20 — after
 * Services\RedirectManager's own priority-1 hook has had a chance to
 * redirect the request away first, so a path that already HAS a configured
 * redirect is never also logged as a 404 (by the time this runs, a
 * matched redirect has already `exit`ed the request).
 *
 * No IP address or other visitor-identifying data, ever — same posture
 * CrawlerTrafficLogger's own docblock documents for the same reason (this
 * plugin's general privacy stance on visit logging, not a promise specific
 * to crawler traffic).
 *
 * @class       NotFoundLogger class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class NotFoundLogger {

    /**
     * NotFoundLogger constructor.
     */
    public function __construct() {
        add_action( 'template_redirect', array( $this, 'maybe_log' ), 20 );
    }

    /**
     * Logs the current request as a 404 visit, if it is one.
     *
     * @return void
     */
    public function maybe_log(): void {
        $settings = wp_parse_args( get_option( Utill::VULOPILOT_SETTINGS_KEY, array() ), Utill::VULOPILOT_SETTINGS_DEFAULTS );

        if ( empty( $settings['log_404s'] ) || ! is_404() ) {
            return;
        }

        $requested_uri  = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';
        $path           = wp_parse_url( $requested_uri, PHP_URL_PATH ) ?? '/';
        $requested_path = RedirectRepository::normalize_path( $path );
        $referrer       = wp_get_referer();

        ( new NotFoundLogRepository() )->log_or_increment( $requested_path, $referrer ? esc_url_raw( $referrer ) : null );
    }
}
