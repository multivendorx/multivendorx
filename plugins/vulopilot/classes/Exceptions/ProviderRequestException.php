<?php
/**
 * ProviderRequestException file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Exceptions;

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
