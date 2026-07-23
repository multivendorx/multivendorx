<?php
/**
 * SecurityScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags a user account with the username "admin" — the single most
 * common target of automated WordPress login-brute-force attempts,
 * since it's the historical default and attackers only need to guess a
 * password once they know the username is right.
 *
 * @class       SecurityScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class SecurityScanner extends AbstractBasicScanner {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'security';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Security', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_category(): string {
        return 'security';
    }

    /**
     * @inheritDoc
     */
    public function scan(): array {
        $findings = array();

        if ( username_exists( 'admin' ) ) {
            $findings[] = new Finding(
                __( 'A user account named "admin" exists', 'vulopilot' ),
                Severity::HIGH,
                $this->get_category(),
                __( '"admin" is the most commonly guessed username in automated login attacks. Rename this account or ensure it has a strong, unique password and limited login attempts.', 'vulopilot' ),
                'user',
                'admin'
            );
        }

        return $findings;
    }
}
