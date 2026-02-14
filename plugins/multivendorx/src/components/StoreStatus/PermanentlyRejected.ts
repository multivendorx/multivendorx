import { __ } from '@wordpress/i18n';

export default {
	id: 'permanently-rejected',
	priority: 1,
	name: __('Permanently Rejected', 'multivendorx'),
	desc: '',
	icon: 'adminfont-store-inventory',
	submitUrl: 'settings',
	modal: [
		{
			key: 'store_promotion_limit',
			label: __('Account capabilities', 'multivendorx'),
			type: 'nested',
			single: true,
			nestedFields: [
				{
					key: 'paid_promotion_limit',
					type: 'checklist',
					options: [
						{
							title: __(
								'Can log in to dashboard',
								'multivendorx'
							),
							icon: 'close adminfont-cross',
						},
						{
							title: __(
								'Cannot modify store settings',
								'multivendorx'
							),
							icon: 'close adminfont-cross',
						},
						{
							title: __(
								'Cannot add or edit products',
								'multivendorx'
							),
							icon: 'close adminfont-cross',
						},
					],
				},
			],
		},
	],
};
