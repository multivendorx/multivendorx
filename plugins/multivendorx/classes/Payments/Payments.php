<?php

namespace MultiVendorX\Payments;

defined('ABSPATH') || exit;

/**
 * MultiVendorX Main Payment class
 *
 * @version		PRODUCT_VERSION
 * @package		MultiVendorX
 * @author 		MultiVendorX
 */
class Payments {
    public function __construct() {
        
    }

    public function all_payment_providers() {
        return array(
			'stripe'    => MultiVendorX_Stripe_Payment::class,
		);
    }
}