<?php
/**
 * InvalidActionInputException file.
 *
 * @package VuloPilotCore
 */

namespace VuloPilotCore\Exceptions;

/**
 * Thrown by an AIActionInterface implementation's validate_input() when the
 * raw user-supplied input fails validation (e.g. a referenced post/attachment
 * doesn't exist, a required field is empty).
 *
 * @class       InvalidActionInputException class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class InvalidActionInputException extends \Exception {
}
