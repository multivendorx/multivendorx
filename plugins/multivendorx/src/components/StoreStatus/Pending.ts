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
			key: 'paid_promotion_limit',
			label: __('Account capabilities', 'multivendorx'),
			type: 'itemlist',
			className: 'checklist',
			items: [
				{
					title: __('Can log in to dashboard', 'multivendorx'),
					icon: 'success',
				},
				{
					title: __('Cannot modify store settings', 'multivendorx'),
					icon: 'cross',
				},
				{
					title: __(
						'Denied from adding or editing products',
						'multivendorx'
					),
					icon: 'cross',
				},
				{
					title: __(
						'Cannot process or fulfill orders',
						'multivendorx'
					),
					icon: 'cross',
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
