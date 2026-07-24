<?php
/**
 * ScannerInterface file.
 *
 * @package VuloPilotCore
 */

namespace VuloPilotCore\Contracts\Scanner;

use VuloPilotCore\ValueObjects\Finding;

/**
 * Every scanner — free-tier (Scanners\Basic\AbstractBasicScanner) or a
 * premium Pro scanner registered via the `vulopilot_scanner_sources`
 * filter — implements this so ScannerRegistry/ScanRunner can run either
 * kind without knowing which side authored it.
 *
 * @class       ScannerInterface interface
 * @version     1.0.0
 * @author      MultiVendorX
 */
interface ScannerInterface {

    /**
     * @return string Unique, stable scanner id.
     */
    public function get_id(): string;

    /**
     * @return string Human-readable label.
     */
    public function get_label(): string;

    /**
     * @return string Category this scanner's findings belong to (e.g. 'seo', 'geo', 'security').
     */
    public function get_category(): string;

    /**
     * @return string 'free' or 'pro'.
     */
    public function get_tier(): string;

    /**
     * Runs the scan.
     *
     * @return Finding[]
     */
    public function scan(): array;
}
