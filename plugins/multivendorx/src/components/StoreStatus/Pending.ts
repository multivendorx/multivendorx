import { __ } from '@wordpress/i18n';

export default {
	id: 'pending',
	priority: 1,
	name: __('Pending Approval', 'multivendorx'),
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
							icon: 'check adminfont-icon-yes',
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
								'Denied from adding or editing products',
								'multivendorx'
							),
							icon: 'close adminfont-cross',
						},
						{
							title: __(
								'Cannot process or fulfill orders',
								'multivendorx'
							),
							icon: 'close adminfont-cross',
						},
					],
				},
			],
		},
		{
			key: 'pending_msg',
			label: __('Message shown to pending stores', 'multivendorx'),
			type: 'textarea',
			des: __('What pending stores can do', 'multivendorx'),
		},
	],
};
