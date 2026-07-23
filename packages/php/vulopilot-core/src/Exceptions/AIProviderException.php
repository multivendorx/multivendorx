<?php
/**
 * AIProviderException file.
 *
 * @package VuloPilotCore
 */

namespace VuloPilotCore\Exceptions;

/**
 * Common parent of every provider-level failure (ProviderRequestException,
 * RateLimitExceededException, TransientProviderException) — the type
 * AIProviders\Decorators\ProviderFallbackChain catches to move on to the
 * next provider in the chain, regardless of which specific failure occurred.
 *
 * @class       AIProviderException class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class AIProviderException extends \Exception {
}
