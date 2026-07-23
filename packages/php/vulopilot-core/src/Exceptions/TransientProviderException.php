<?php
/**
 * TransientProviderException file.
 *
 * @package VuloPilotCore
 */

namespace VuloPilotCore\Exceptions;

/**
 * A retryable provider failure — network error, HTTP 5xx, or HTTP 429.
 * Caught by AIProviders\Decorators\RetryingProvider, which retries with
 * backoff up to its configured attempt limit before re-throwing.
 *
 * @class       TransientProviderException class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class TransientProviderException extends AIProviderException {
}
