<?php
/**
 * RateLimitExceededException file.
 *
 * @package VuloPilotCore
 */

namespace VuloPilotCore\Exceptions;

/**
 * Thrown by AIProviders\Decorators\RateLimitedProvider when its own
 * requests-per-minute budget is exhausted, before the request ever reaches
 * the wrapped provider.
 *
 * @class       RateLimitExceededException class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class RateLimitExceededException extends AIProviderException {
}
