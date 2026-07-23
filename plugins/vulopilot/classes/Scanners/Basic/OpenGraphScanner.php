<?php
/**
 * OpenGraphScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Fetches the homepage and flags any of the three Open Graph tags that
 * make a shared link look correct on Facebook/LinkedIn/etc.
 * (`og:title`, `og:description`, `og:image`) that aren't present. Like
 * SchemaScanner, this is a presence check, not a correctness check — a
 * tag that exists but has a bad value can't be judged without knowing
 * what a "good" value looks like for this specific site.
 *
 * @class       OpenGraphScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class OpenGraphScanner extends AbstractBasicScanner {

    private const REQUEST_TIMEOUT_SECONDS = 8;

    private const REQUIRED_PROPERTIES = array( 'og:title', 'og:description', 'og:image' );

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'open-graph';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Open Graph', 'vulopilot' );
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

        $body    = wp_remote_retrieve_body( $response );
        $missing = array();

        foreach ( self::REQUIRED_PROPERTIES as $property ) {
            if ( false === stripos( $body, 'property="' . $property . '"' ) && false === stripos( $body, "property='" . $property . "'" ) ) {
                $missing[] = $property;
            }
        }

        if ( empty( $missing ) ) {
            return $findings;
        }

        $findings[] = new Finding(
            sprintf(
                /* translators: %s is a comma-separated list of missing Open Graph properties. */
                __( 'Missing Open Graph tags on the homepage: %s', 'vulopilot' ),
                implode( ', ', $missing )
            ),
            Severity::LOW,
            $this->get_category(),
            __( 'Open Graph tags control how this site\'s links look when shared on Facebook, LinkedIn, and similar platforms. Without them, shared links show no preview image or description.', 'vulopilot' ),
            'url',
            home_url( '/' ),
            array( 'missing_properties' => $missing )
        );

        return $findings;
    }
}
