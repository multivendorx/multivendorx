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
					key: 'store_visible_in_checkout',
					label: __(
						'Keep store visible but disable checkout',
						'multivendorx'
					),
					value: 'store_visible_in_checkout',
					desc: __(
						'Displays the store and its products but prevents customers from placing new orders. Freeze all pending payments.',
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
