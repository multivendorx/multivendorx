<?php
/**
 * RobotsTxtScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Fetches `/robots.txt` and flags two real, high-impact problems: the
 * file isn't reachable at all, or it contains a sitewide
 * `Disallow: /` for the wildcard user-agent — which tells every
 * well-behaved crawler not to index anything on the site. The second
 * case is a common, easy-to-make mistake (e.g. a "Discourage search
 * engines" setting left on, or a staging-site robots.txt copied to
 * production) that silently removes a site from search results entirely,
 * which makes it worth a HIGH severity rather than the LOW/MEDIUM most
 * other SEO findings here use.
 *
 * @class       RobotsTxtScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class RobotsTxtScanner extends AbstractBasicScanner {

    private const REQUEST_TIMEOUT_SECONDS = 8;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'robots-txt';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Robots.txt', 'vulopilot' );
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
        $response = wp_remote_get(
            home_url( '/robots.txt' ),
            array(
                'timeout'   => self::REQUEST_TIMEOUT_SECONDS,
                'sslverify' => false,
            )
        );

        if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {
            $findings[] = new Finding(
                __( 'robots.txt is not reachable', 'vulopilot' ),
                Severity::LOW,
                $this->get_category(),
                __( 'No robots.txt file was found at the site root. Its absence isn\'t harmful by itself, but it means there\'s no explicit crawl guidance for search engines.', 'vulopilot' ),
                'url',
                home_url( '/robots.txt' )
            );

            return $findings;
        }

        if ( $this->blocks_all_crawlers( wp_remote_retrieve_body( $response ) ) ) {
            $findings[] = new Finding(
                __( 'robots.txt is blocking all search engines', 'vulopilot' ),
                Severity::HIGH,
                $this->get_category(),
                __( 'robots.txt disallows every page for all crawlers (User-agent: * / Disallow: /). If unintentional, this removes the entire site from search results.', 'vulopilot' ),
                'url',
                home_url( '/robots.txt' ),
                array( 'blocks_all_crawlers' => true )
            );
        }

        return $findings;
    }

    /**
     * Parses for a wildcard user-agent block whose only Disallow rule is
     * the site root — a narrow, deliberate check (not a full robots.txt
     * parser) matching exactly the one high-impact mistake this scanner
     * exists to catch.
     *
     * @param string $body robots.txt contents.
     * @return bool
     */
    private function blocks_all_crawlers( string $body ): bool {
        $lines           = preg_split( '/\r\n|\r|\n/', $body );
        $in_wildcard_group = false;

        foreach ( (array) $lines as $line ) {
            $line = trim( (string) $line );

            if ( '' === $line || '#' === $line[0] ) {
                continue;
            }

            if ( preg_match( '/^user-agent:\s*(.+)$/i', $line, $matches ) ) {
                $in_wildcard_group = '*' === trim( $matches[1] );
                continue;
            }

            if ( $in_wildcard_group && preg_match( '#^disallow:\s*/\s*$#i', $line ) ) {
                return true;
            }
        }

        return false;
    }
}
