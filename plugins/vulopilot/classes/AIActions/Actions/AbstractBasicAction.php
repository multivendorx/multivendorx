<?php
/**
 * AbstractBasicAction class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AIActions\Actions;

use VuloPilotCore\Contracts\AI\AIActionInterface;

defined( 'ABSPATH' ) || exit;

/**
 * Base class for every free-tier action under AIActions/Actions/. Only
 * get_tier() has a sensible shared default — unlike AbstractBasicScanner/
 * AbstractBasicRule, there's no natural default for validate_input()/
 * build_prompt()/parse_response()/validate_output()/build_preview()/
 * execute()/rollback(): every one of those is genuinely different per
 * action, so none are given a default implementation here.
 *
 * @class       AbstractBasicAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
abstract class AbstractBasicAction implements AIActionInterface {

    /**
     * @inheritDoc
     */
    public function get_tier(): string {
        return 'free';
    }
}
