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
					key: 'disable_product',
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
				},
				{
					key: 'restrict_new_product_uploads',
					label: __('Restrict new product uploads', 'multivendorx'),
					value: 'restrict_new_product_uploads',
					desc: __(
						'Prevents sellers from adding or editing products during the review period. Existing listings remain visible to customers.',
						'multivendorx'
					),
				},
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
