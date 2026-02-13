import { __ } from '@wordpress/i18n';

export default {
	id: 'rejected',
	priority: 1,
	name: __('Rejected', 'multivendorx'),
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
							title: __('Log in to dashboard', 'multivendorx'),
							icon: 'check adminfont-icon-yes',
						},
						{
							title: __('View rejection reason', 'multivendorx'),
							icon: 'check adminfont-icon-yes',
						},
						{
							title: __('Submit new application', 'multivendorx'),
							icon: 'check adminfont-icon-yes',
						},
						{
							title: __(
								'Cannot modify products or settings',
								'multivendorx'
							),
							icon: 'close adminfont-cross',
						},
						{
							title: __(
								'Cannot sell or fulfill orders',
								'multivendorx'
							),
							icon: 'close adminfont-cross',
						},
					],
				},
			],
		},
		{
			key: 'rejected_msg',
			label: __('Message shown to rejected stores', 'multivendorx'),
			type: 'textarea',
			des: __('What rejected stores can do', 'multivendorx'),
		},
	],
};
