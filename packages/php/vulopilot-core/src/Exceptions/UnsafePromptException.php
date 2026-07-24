<?php
/**
 * UnsafePromptException file.
 *
 * @package VuloPilotCore
 */

namespace VuloPilotCore\Exceptions;

/**
 * Thrown by AIProviders\Safety\AISafetyValidator::validate_prompt() when a
 * request is too long or appears to contain a credential — blocked before
 * it's ever sent to a provider. Not a provider-level failure, so this does
 * NOT extend AIProviderException (nothing about it should trigger
 * ProviderFallbackChain's fall-through-to-next-provider behavior).
 *
 * @class       UnsafePromptException class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class UnsafePromptException extends \Exception {
}
