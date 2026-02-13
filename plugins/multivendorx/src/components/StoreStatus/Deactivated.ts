import { __ } from '@wordpress/i18n';

export default {
	id: 'deactivated',
	priority: 1,
	name: __('Permanently deactivated', 'multivendorx'),
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
								'Cannot log in to dashboard',
								'multivendorx'
							),
							icon: 'close adminfont-cross',
						},
						{
							title: __(
								'Cannot access selling privileges',
								'multivendorx'
							),
							icon: 'close adminfont-cross',
						},
						{
							title: __(
								'Cannot view or manage product listings',
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
