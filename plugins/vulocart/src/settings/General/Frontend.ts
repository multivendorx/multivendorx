import { __ } from '@wordpress/i18n';

/**
 * Backed by `Utill::SETTINGS_DEFAULTS`'s Frontend section. Both fields are
 * genuinely consumed: `Block.php`'s `print_frontend_config()` reads them
 * into `vulocartFrontendData`, and `src/blocks/checkout/Checkout.tsx`
 * checks them on every render —
 *
 * - `enable_offerings_listing` gates the "Available Offerings" catalog-
 *   browsing section at the top of the checkout block. Off means the
 *   page only shows cart review + place-order — for a storefront that
 *   adds items to the cart another way (a future dedicated Catalog/
 *   Offerings-grid block, or a direct API integration) and doesn't want
 *   this block also acting as a product listing.
 * - `enable_cart_checkout` gates the entire block: off replaces the whole
 *   cart/checkout flow with a plain "temporarily unavailable" notice —
 *   for taking the storefront offline for maintenance, or before a store
 *   is ready to accept real orders, without unpublishing the page itself.
 */
export default {
	id: 'frontend',
	priority: 2,
	headerTitle: __( 'Frontend', 'vulocart' ),
	headerIcon: 'storefront',
	submitUrl: 'settings',
	modal: [
		{
			key: 'enable_offerings_listing',
			type: 'checkbox',
			look: 'toggle',
			label: __( 'Show offerings listing', 'vulocart' ),
			desc: __(
				'Show the "Available Offerings" catalog-browsing section on the storefront checkout page.',
				'vulocart'
			),
			options: [
				{ key: 'enable_offerings_listing', label: '', value: 'enable_offerings_listing' },
			],
		},
		{
			key: 'enable_cart_checkout',
			type: 'checkbox',
			look: 'toggle',
			label: __( 'Enable cart & checkout', 'vulocart' ),
			desc: __(
				'Turn off to take the storefront checkout page offline temporarily — visitors see an "unavailable" notice instead of the cart/checkout flow.',
				'vulocart'
			),
			options: [
				{ key: 'enable_cart_checkout', label: '', value: 'enable_cart_checkout' },
			],
		},
	],
};
