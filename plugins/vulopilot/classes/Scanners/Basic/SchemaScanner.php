<?php
/**
 * SchemaScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags a homepage with no JSON-LD structured data at all. Checking for
 * presence (not correctness) of `application/ld+json` is a real,
 * inexpensive signal: its complete absence means neither a dedicated SEO
 * plugin nor the theme is emitting any schema, so no rich-result
 * eligibility exists for the site at all.
 *
 * @class       SchemaScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class SchemaScanner extends AbstractBasicScanner {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'schema';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Schema', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_category(): string {
        return 'schema';
    }

    /**
     * @inheritDoc
     */
    public function scan(): array {
        $findings = array();
        $response = wp_remote_get(
            home_url( '/' ),
            array(
                'timeout'   => 10,
                'sslverify' => false,
            )
        );

        if ( is_wp_error( $response ) ) {
            return $findings;
        }

        $body = wp_remote_retrieve_body( $response );

        if ( '' === $body || false !== stripos( $body, 'application/ld+json' ) ) {
            return $findings;
        }

        $findings[] = new Finding(
            __( 'No structured data (JSON-LD) found on the homepage', 'vulopilot' ),
            Severity::INFO,
            $this->get_category(),
            __( 'Structured data helps search engines understand and display rich results for this site. Neither the active theme nor any active plugin appears to be outputting any.', 'vulopilot' ),
            'url',
            home_url( '/' )
        );

        return $findings;
    }
}
