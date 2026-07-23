<?php
/**
 * TwitterCardScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Fetches the homepage and flags a missing `twitter:card` meta tag —
 * without it, X/Twitter falls back to a plain link with no preview image
 * or summary when this site's pages are shared there, independent of
 * whether Open Graph tags (a separate protocol X/Twitter only partially
 * respects) are present.
 *
 * @class       TwitterCardScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class TwitterCardScanner extends AbstractBasicScanner {

    private const REQUEST_TIMEOUT_SECONDS = 8;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'twitter-card';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Twitter Cards', 'vulopilot' );
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
            home_url( '/' ),
            array(
                'timeout'   => self::REQUEST_TIMEOUT_SECONDS,
                'sslverify' => false,
            )
        );

        if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {
            return $findings;
        }

        $body = wp_remote_retrieve_body( $response );

        if ( false !== stripos( $body, 'name="twitter:card"' ) || false !== stripos( $body, "name='twitter:card'" ) ) {
            return $findings;
        }

        $findings[] = new Finding(
            __( 'No Twitter Card tag found on the homepage', 'vulopilot' ),
            Severity::LOW,
            $this->get_category(),
            __( 'Without a twitter:card meta tag, links to this site shared on X/Twitter show as a plain link with no preview image or summary.', 'vulopilot' ),
            'url',
            home_url( '/' )
        );

        return $findings;
    }
}
