import { __ } from '@wordpress/i18n';

/**
 * Backed by `Utill::SETTINGS_DEFAULTS`'s Checkout section. There is no
 * dedicated Checkout module/table in this codebase — a Cart becomes an
 * Order directly via `Order\Application\OrderService::create_from_cart()`
 * — but all three fields here are genuinely enforced now:
 * `guest_checkout_enabled` gates order placement both client-side
 * (`src/blocks/checkout/Checkout.tsx`, via `Block.php`'s
 * `print_frontend_config()`) and server-side
 * (`Order\Rest::create_item()`, so a direct API call can't bypass the
 * client check); `require_terms_acceptance`/`checkout_terms_url` render a
 * real terms-acceptance checkbox on the storefront checkout block that
 * must be checked before "Place Order" is enabled.
 */
export default {
	id: 'checkout',
	priority: 3,
	headerTitle: __( 'Checkout', 'vulocart' ),
	headerIcon: 'credit-card',
	submitUrl: 'settings',
	modal: [
		{
			key: 'guest_checkout_enabled',
			type: 'checkbox',
			look: 'toggle',
			label: __( 'Enable guest checkout', 'vulocart' ),
			desc: __(
				'Allow an order to be placed with just an email address, no account required.',
				'vulocart'
			),
			options: [
				{ key: 'guest_checkout_enabled', label: '', value: 'guest_checkout_enabled' },
			],
		},
		{
			key: 'require_terms_acceptance',
			type: 'checkbox',
			look: 'toggle',
			label: __( 'Require terms acceptance', 'vulocart' ),
			desc: __(
				'Require the buyer to accept your terms before placing an order.',
				'vulocart'
			),
			options: [
				{ key: 'require_terms_acceptance', label: '', value: 'require_terms_acceptance' },
			],
		},
		{
			key: 'checkout_terms_url',
			type: 'text',
			label: __( 'Terms & conditions URL', 'vulocart' ),
			placeholder: __( 'https://yourstore.com/terms', 'vulocart' ),
			desc: __(
				'Linked from the checkout terms-acceptance checkbox on the storefront.',
				'vulocart'
			),
			dependent: { key: 'require_terms_acceptance', set: true },
		},
	],
};
