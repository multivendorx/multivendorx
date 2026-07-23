<?php
/**
 * RestApiScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;
use VuloPilot\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Flags anonymous user enumeration via the REST API — by default,
 * `GET /wp/v2/users` returns every public user's id, slug, and display
 * name to unauthenticated requests. This is exactly what widely-used
 * WordPress security scanners (Wordfence, iThemes Security, WPScan) check
 * for, and it's what makes username-guessing-based brute-force attacks
 * far easier. Checked by making a real unauthenticated request to the
 * site's own REST endpoint, since that's the only way to know what the
 * *actual*, currently-configured permission callback allows.
 *
 * @class       RestApiScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class RestApiScanner extends AbstractBasicScanner {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'rest-api';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'REST API', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_category(): string {
        return 'rest-api';
    }

    /**
     * @inheritDoc
     */
    public function scan(): array {
        $findings = array();

        $settings = wp_parse_args( get_option( Utill::VULOPILOT_SETTINGS_KEY, array() ), Utill::VULOPILOT_SETTINGS_DEFAULTS );

        // Settings screen's Security tab — some site owners run this
        // check's outbound HTTP request through a firewall/WAF that itself
        // flags or blocks it, so it's the one scanner with its own
        // explicit kill switch rather than only the category-level toggles
        // the SEO/GEO/Accessibility/WooCommerce tabs use.
        if ( empty( $settings['enable_rest_api_scanner'] ) ) {
            return $findings;
        }

        $response = wp_remote_get(
            rest_url( 'wp/v2/users' ),
            array(
                'timeout'   => 10,
                'sslverify' => false,
                // Deliberately no auth headers/cookies — this has to be
                // an anonymous request to reflect what a real attacker sees.
            )
        );

        if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {
            return $findings;
        }

        $users = json_decode( wp_remote_retrieve_body( $response ), true );

        if ( ! is_array( $users ) || empty( $users ) ) {
            return $findings;
        }

        $findings[] = new Finding(
            __( 'REST API exposes user data to anonymous requests', 'vulopilot' ),
            Severity::HIGH,
            $this->get_category(),
            __( 'The /wp/v2/users endpoint currently returns usernames without authentication, making them easy to enumerate for brute-force login attempts.', 'vulopilot' ),
            'url',
            rest_url( 'wp/v2/users' ),
            array( 'exposed_user_count' => count( $users ) )
        );

        return $findings;
    }
}
