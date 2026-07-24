<?php
/**
 * ProviderRequestException file.
 *
 * @package VuloPilotCore
 */

namespace VuloPilotCore\Exceptions;

/**
 * A non-retryable request failure (bad API key, malformed request, unknown
 * model — an HTTP 4xx other than 429). Never retried by RetryingProvider;
 * bubbles straight through it, per that class's own docblock.
 *
 * @class       ProviderRequestException class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ProviderRequestException extends AIProviderException {
}
