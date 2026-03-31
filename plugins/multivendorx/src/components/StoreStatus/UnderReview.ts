import { __ } from '@wordpress/i18n';

export default {
	id: 'under-review',
	priority: 1,
	name: __('Under Review', 'multivendorx'),
	desc: '',
	icon: 'adminfont-store-inventory',
	submitUrl: 'settings',
	modal: [
		{
			key: 'restriction_for_under_review',
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
					key: 'disable_product_upload',
					label: __('Disable product upload', 'multivendorx'),
					value: 'disable_product',
					desc: __(
						'Temporarily disables product sales and order fulfillment while the review is in progress.',
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
				}
			],
			selectDeselect: true,
		},
		{
			key: 'under_review_msg',
			label: __('Message shown to stores under review', 'multivendorx'),
			type: 'text',
			des: __('What pending stores can do', 'multivendorx'),
		},
	],
};
