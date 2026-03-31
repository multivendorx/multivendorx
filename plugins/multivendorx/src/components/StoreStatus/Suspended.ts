import { __ } from '@wordpress/i18n';

export default {
	id: 'suspended',
	priority: 1,
	name: __('Suspended', 'multivendorx'),
	desc: '',
	icon: 'adminfont-store-inventory',
	submitUrl: 'settings',
	modal: [
		{
			key: 'restriction_for_suspended',
			type: 'checkbox',
			label: __('Account capabilities', 'multivendorx'),

			options: [
				{
					key: 'hide_store_products',
					label: __(
						'Hide store and products',
						'multivendorx'
					),
					value: 'hide_store_products',
					desc: __(
						'Removes the store and all its products from the marketplace. Customers cannot view the store, access products, or place orders.',
						'multivendorx'
					),
				},
				{
					key: 'disable_checkout',
					label: __(
						'Disable checkout',
						'multivendorx'
					),
					value: 'disable_checkout',
					desc: __(
						'Prevents customers from placing new orders from this store while keeping the store and its products visible.',
						'multivendorx'
					),
				},
				{
					key: 'disable_payouts',
					label: __('Disable payouts', 'multivendorx'),
					value: 'DisablePayouts',
					desc: __(
						'Suspends payout processing. Earnings will be released once the store successfully clears the review.',
						'multivendorx'
					),
				},
			],
			selectDeselect: true,
		},
		{
			key: 'suspended_msg',
			label: __('Message shown to suspended stores', 'multivendorx'),
			type: 'textarea',
			des: __('What suspended stores can do', 'multivendorx'),
		},
	],
};
