import { __ } from '@wordpress/i18n';

export default {
	id: 'woocommerce',
	priority: 5,
	headerTitle: __('WooCommerce', 'vulopilot'),
	headerIcon: 'cart',
	submitUrl: 'settings',
	modal: [
		{
			key: 'enable_woocommerce_scanning',
			type: 'checkbox',
			look: 'toggle',
			label: __('Enable WooCommerce scanning', 'vulopilot'),
			desc: __(
				'Turns every category "woocommerce" scanner on or off — the checkout-page check plus the 11 product-intelligence checks (missing images/categories/tags/descriptions, SKU issues, attributes, inventory health, pricing, duplicates, completeness).',
				'vulopilot'
			),
			options: [
				{ key: 'enabled', label: '', value: 'enabled' },
			],
		},
	],
};
