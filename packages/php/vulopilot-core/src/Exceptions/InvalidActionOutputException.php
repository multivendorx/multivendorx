<?php
/**
 * InvalidActionOutputException file.
 *
 * @package VuloPilotCore
 */

namespace VuloPilotCore\Exceptions;

/**
 * Thrown by an AIActionInterface implementation's validate_output() when
 * the AI provider's response fails validation (e.g. empty content, missing
 * required fields, malformed JSON-LD) before it's shown to the user as a
 * preview.
 *
 * @class       InvalidActionOutputException class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class InvalidActionOutputException extends \Exception {
}
