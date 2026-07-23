<?php
/**
 * StructuredDataValidationScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Extracts every `<script type="application/ld+json">` block on the
 * homepage and flags any that fail to parse as valid JSON. This
 * complements SchemaScanner's separate presence check (is there *any*
 * JSON-LD at all) with a validity check: malformed structured data is
 * arguably worse than none, since a search engine can't use it for rich
 * results either way, but its presence can mask the problem from a site
 * owner who assumes "it's there, so it must be working."
 *
 * @class       StructuredDataValidationScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class StructuredDataValidationScanner extends AbstractBasicScanner {

    private const REQUEST_TIMEOUT_SECONDS = 8;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'structured-data';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Structured Data', 'vulopilot' );
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

        $body   = wp_remote_retrieve_body( $response );
        $blocks = $this->extract_json_ld_blocks( $body );

        foreach ( $blocks as $index => $block ) {
            json_decode( $block );

            if ( JSON_ERROR_NONE === json_last_error() ) {
                continue;
            }

            $findings[] = new Finding(
                sprintf(
                    /* translators: %d is which structured-data block on the page (1-indexed) is invalid. */
                    __( 'Invalid structured data (JSON-LD) block #%d on the homepage', 'vulopilot' ),
                    $index + 1
                ),
                Severity::MEDIUM,
                $this->get_category(),
                __( 'This structured data block does not parse as valid JSON, so search engines will ignore it entirely for rich results.', 'vulopilot' ),
                'url',
                home_url( '/' ),
                array( 'json_error' => json_last_error_msg() )
            );
        }

        return $findings;
    }

    /**
     * @param string $html Page HTML.
     * @return string[] Contents of each application/ld+json script block found.
     */
    private function extract_json_ld_blocks( string $html ): array {
        if ( ! preg_match_all( '#<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>#is', $html, $matches ) ) {
            return array();
        }

        return $matches[1];
    }
}
