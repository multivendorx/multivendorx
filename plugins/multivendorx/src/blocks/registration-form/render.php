<?php
/**
 * Registration form block, rendered on the server by VuloForm.
 *
 * @package MultiVendorX
 */

defined( 'ABSPATH' ) || exit;

// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- VuloForm returns escaped markup.
echo '<div id="multivendorx-registration-form" class="woocommerce">' . \MultiVendorX\Store\Registration::render() . '</div>';
