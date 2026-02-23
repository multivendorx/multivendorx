import { __ } from '@wordpress/i18n';

export default {
	id: 'business-hours',
	priority: 5,
	headerTitle: __('Business Hours', 'multivendorx'),
	headerDescription: __(
		'Manage your store’s shipping method, pricing rules, and location-based rates.',
		'multivendorx'
	),
	headerIcon: 'shipping',
	submitUrl: `store/${appLocalizer.store_id}`,
	modal: [
		{
			type: 'select',
			key: 'store_timezone',
			label: __('Store Timezone', 'multivendorx'),
			options: [
				{ value: '', label: 'Eastern Time (ET)' },
				{ value: 'instock', label: 'Central Time (CT)' },
				{ value: 'outofstock', label: 'Mountain Time (MT)' },
				{ value: 'onbackorder', label: 'Pacific Time (PT)' },
				{ value: 'onbackorder', label: 'London (GMT)' },
			], // Add your timezone options here
		},
		{
			type: 'nested',
			key: 'shop_timings',
			label: __('Shop Open & Close Timings', 'multivendorx'),
			addButtonLabel: 'Add New',
			deleteButtonLabel: 'Remove',
			single: true,
			nestedFields: [
				{
					key: 'open_hour',
					type: 'number',
					label: __('Hour', 'multivendorx'),
					size: '5rem',
					minNumber: 1,
					maxNumber: 12,
					beforeElement: {
						type: 'preposttext',
						textType: 'pre',
						postText: 'Open',
					},
					postText: ':',
				},
				{
					key: 'open_minute',
					type: 'number',
					label: __('Minute', 'multivendorx'),
					size: '5rem',
					minNumber: 0,
					maxNumber: 59,
					postText: ':',
				},
				{
					key: 'open_ampm',
					type: 'select',
					label: __('Open AM/PM', 'multivendorx'),
					options: [
						{ key: 'am', value: 'am', label: 'AM' },
						{ key: 'pm', value: 'pm', label: 'PM' },
					],
					postText: '--',
				},
				{
					key: 'close_hour',
					type: 'number',
					label: __('Close Hour', 'multivendorx'),
					size: '5rem',
					minNumber: 1,
					maxNumber: 12,
					beforeElement: {
						type: 'preposttext',
						textType: 'pre',
						postText: 'Close',
					},
					postText: ':',
				},
				{
					key: 'close_minute',
					type: 'number',
					label: __('Close Minute', 'multivendorx'),
					size: '5rem',
					minNumber: 0,
					maxNumber: 59,
					postText: ':',
				},
				{
					key: 'close_ampm',
					type: 'select',
					label: __('Close AM/PM', 'multivendorx'),
					options: [
						{ key: 'am', value: 'am', label: 'AM' },
						{ key: 'pm', value: 'pm', label: 'PM' },
					],
				},
			],
		},
		{
			type: 'textarea',
			key: 'closed_message',
			label: __('Message When Shop is Closed', 'multivendorx'),
		},
	],
};