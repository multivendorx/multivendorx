import { __ } from '@wordpress/i18n';

/**
 * Backed by `Utill::SETTINGS_DEFAULTS`'s Cart section. `cart`
 * (`modules/Cart`) is a real, shipping module (WPDBCartRepository).
 * `cart_expiry_days` is genuinely consumed —
 * `Cart\Application\CartCleanupScheduler`'s daily `wp_cron` deletes carts
 * untouched for this many days. `allow_guest_cart` isn't read yet — this
 * plugin has no account/login-gated cart concept to disable in the first
 * place (Cart\Rest.php's token-based access already has no account
 * requirement, unconditionally), so there's nothing for this toggle to
 * meaningfully switch off until one exists.
 */
export default {
	id: 'cart',
	priority: 2,
	headerTitle: __( 'Cart', 'vulocart' ),
	headerIcon: 'cart',
	submitUrl: 'settings',
	modal: [
		{
			key: 'allow_guest_cart',
			type: 'checkbox',
			look: 'toggle',
			label: __( 'Allow guest carts', 'vulocart' ),
			desc: __(
				'Let a shopper add items to a cart before creating an account — matches Cart\\Rest.php\'s existing token-based cart access, which already has no account requirement.',
				'vulocart'
			),
			options: [
				{ key: 'allow_guest_cart', label: '', value: 'allow_guest_cart' },
			],
		},
		{
			key: 'cart_expiry_days',
			type: 'number',
			label: __( 'Cart expiry (days)', 'vulocart' ),
			minNumber: 1,
			maxNumber: 365,
			desc: __(
				'How long an abandoned cart is kept before it could be cleared out.',
				'vulocart'
			),
		},
	],
};
