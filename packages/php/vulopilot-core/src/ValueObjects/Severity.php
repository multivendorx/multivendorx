<?php
/**
 * Severity file.
 *
 * @package VuloPilotCore
 */

namespace VuloPilotCore\ValueObjects;

/**
 * Finding severity levels. Matches the `severity varchar(20)` column
 * Free's Install.php creates (DEFAULT 'info').
 *
 * @class       Severity class
 * @version     1.0.0
 * @author      MultiVendorX
 */
final class Severity {

    const CRITICAL = 'critical';
    const HIGH     = 'high';
    const MEDIUM   = 'medium';
    const LOW      = 'low';
    const INFO     = 'info';

    /**
     * @return string[] Every valid severity, in descending order of urgency.
     */
    public static function all(): array {
        return array( self::CRITICAL, self::HIGH, self::MEDIUM, self::LOW, self::INFO );
    }

    /**
     * @param string $severity Value to check.
     * @return bool
     */
    public static function is_valid( string $severity ): bool {
        return in_array( $severity, self::all(), true );
    }
}
