<?php
/**
 * SitemapScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags a site with no reachable XML sitemap. WordPress core has
 * generated one natively at `/wp-sitemap.xml` since 5.5, so this checks
 * that URL first; if it 404s (a theme/plugin may have disabled it via
 * the `wp_sitemaps_enabled` filter in favor of a dedicated SEO plugin's
 * own sitemap), it falls back to the conventional `/sitemap.xml` path
 * before concluding no sitemap is reachable. Checked via a real HTTP
 * request — the only way to know what's actually served, not just
 * whether core's sitemap feature is enabled in code.
 *
 * @class       SitemapScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class SitemapScanner extends AbstractBasicScanner {

    private const REQUEST_TIMEOUT_SECONDS = 8;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'sitemap';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Sitemap', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_category(): string {
        return 'seo';
    }

    /**
     * @inheritDoc
     */
    public function scan(): array {
        $findings = array();

        if ( $this->url_returns_ok( home_url( '/wp-sitemap.xml' ) ) || $this->url_returns_ok( home_url( '/sitemap.xml' ) ) ) {
            return $findings;
        }

        $findings[] = new Finding(
            __( 'No XML sitemap found', 'vulopilot' ),
            Severity::MEDIUM,
            $this->get_category(),
            __( 'Neither /wp-sitemap.xml nor /sitemap.xml returned a successful response. A sitemap helps search engines discover and crawl every page on the site.', 'vulopilot' ),
            'url',
            home_url( '/' )
        );

        return $findings;
    }

    /**
     * @param string $url URL to check.
     * @return bool
     */
    private function url_returns_ok( string $url ): bool {
        $response = wp_remote_get(
            $url,
            array(
                'timeout'   => self::REQUEST_TIMEOUT_SECONDS,
                'sslverify' => false,
            )
        );

        return ! is_wp_error( $response ) && 200 === wp_remote_retrieve_response_code( $response );
    }
}
