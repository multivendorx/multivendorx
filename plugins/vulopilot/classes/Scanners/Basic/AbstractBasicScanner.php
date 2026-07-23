<?php
/**
 * AbstractBasicScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\Contracts\Scanner\ScannerInterface;

defined( 'ABSPATH' ) || exit;

/**
 * Base class for every free-tier scanner under Scanners/Basic/.
 *
 * Every scanner in this namespace is, by definition, free-tier — that's
 * what "Basic" means here (ARCHITECTURE.md) — so get_tier() is genuinely
 * shared behavior, not per-scanner boilerplate being prematurely
 * abstracted. get_id()/get_label()/get_category()/scan() stay abstract
 * since those are what actually differ between scanners.
 *
 * @class       AbstractBasicScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
abstract class AbstractBasicScanner implements ScannerInterface {

    /**
     * @inheritDoc
     */
    public function get_tier(): string {
        return 'free';
    }

    /**
     * @inheritDoc
     */
    abstract public function get_id(): string;

    /**
     * @inheritDoc
     */
    abstract public function get_label(): string;

    /**
     * @inheritDoc
     */
    abstract public function get_category(): string;

    /**
     * @inheritDoc
     */
    abstract public function scan(): array;
}
