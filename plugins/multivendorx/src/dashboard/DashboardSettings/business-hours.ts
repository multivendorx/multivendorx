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
			key: 'onboarding_steps_configuration',
			type: 'checkbox',
			label: __('Lorem ipsum dolor sit amet', 'multivendorx'),
			options: [
				{
					key: 'enable_store_time',
					label: __('Enable Store Time', 'multivendorx'),
					desc: __('Lorem ipsum dolor sit amet', 'multivendorx'),
					value: 'enable_store_time',
				},
				{
					key: 'enable_lunch_break',
					label: __('Enable Lunch Break', 'multivendorx'),
					desc: __('Lorem ipsum dolor sit amet', 'multivendorx'),
					value: 'enable_lunch_break',
				},
				{
					key: 'split_shift',
					label: __('Split Shift (2 Time Slots)', 'multivendorx'),
					desc: __('Lorem ipsum dolor sit amet', 'multivendorx'),
					value: 'split_shift',
				},
			],
			selectDeselect: true,
		},
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
			key: 'set_week_off_days',
			type: 'setting-toggle',
			label: __('Set Week Off Days', 'multivendorx'),
			// multiSelect: true,
			options: [
				{ key: 0, label: __('Sun', 'multivendorx'), value: 0 },
				{ key: 1, label: __('Mon', 'multivendorx'), value: 1 },
				{ key: 2, label: __('Tue', 'multivendorx'), value: 2 },
				{ key: 3, label: __('Wed', 'multivendorx'), value: 3 },
				{ key: 4, label: __('Thu', 'multivendorx'), value: 4 },
				{ key: 5, label: __('Fri', 'multivendorx'), value: 5 },
				{ key: 6, label: __('Sat', 'multivendorx'), value: 6 },
			],
		},
		{
			key: 'disbursement_fortnightly',
			type: 'nested',
			label: __('Shop Open & Close Timings', 'multivendorx'),
			rowClass: 'nested-time',
			before: __('Of', 'multivendorx'),
			single: true,
			desc: __(
				'Commissions are automatically sent to stores every 14 days based on your selected schedule. For example, if you choose "1st week Friday", payouts will occur on the first Friday of each two-week cycle.',
				'multivendorx'
			),
			nestedFields: [
				// Sunday 
				{
					key: 'sunday_open',
					type: 'time',
					size: '4rem',
					defaultValue: '09:00',
					beforeElement: {
						type: 'preposttext',
						textType: 'pre',
						preText: __('Sunday', 'multivendorx'),
					},
				},
				{
					key: 'sunday_close',
					type: 'time',
					size: '4rem',
					defaultValue: '17:00',
					beforeElement: {
						type: 'preposttext',
						textType: 'pre',
						preText: __('-', 'multivendorx'),
					},
				},
				// Sunday
				{
					key: 'sunday_second_open',
					type: 'time',
					size: '4rem',
					defaultValue: '18:00',
					dependent: {
						key: 'onboarding_steps_configuration',
						value: 'split_shift',
					},
				},
				{
					key: 'sunday_second_close',
					type: 'time',
					size: '4rem',
					defaultValue: '22:00',
					beforeElement: {
						type: 'preposttext',
						textType: 'pre',
						preText: __('-', 'multivendorx'),
					},
					dependent: {
						key: 'onboarding_steps_configuration',
						value: 'split_shift',
					},
				},
				{
					key: 'divider_sunday',
					type: 'divider',
				},
				// Monday
				{
					key: 'monday_open',
					type: 'time',
					size: '4rem',
					defaultValue: '09:00',
					beforeElement: {
						type: 'preposttext',
						textType: 'pre',
						preText: __('Monday', 'multivendorx'),
					},
				},
				{
					key: 'monday_close',
					type: 'time',
					size: '4rem',
					defaultValue: '17:00',
					beforeElement: {
						type: 'preposttext',
						textType: 'pre',
						preText: __('-', 'multivendorx'),
					},
				},
				// Monday 
				{
					key: 'monday_second_open',
					type: 'time',
					size: '4rem',
					defaultValue: '18:00',
					dependent: {
						key: 'onboarding_steps_configuration',
						value: 'split_shift',
					},
				},
				{
					key: 'monday_second_close',
					type: 'time',
					size: '4rem',
					defaultValue: '22:00',
					beforeElement: {
						type: 'preposttext',
						textType: 'pre',
						preText: __('-', 'multivendorx'),
					},
					dependent: {
						key: 'onboarding_steps_configuration',
						value: 'split_shift',
					},
				},
				{
					key: 'divider_monday',
					type: 'divider',
				},
				// Tuesday
				{
					key: 'tuesday_open',
					type: 'time',
					size: '4rem',
					defaultValue: '09:00',
					beforeElement: {
						type: 'preposttext',
						textType: 'pre',
						preText: __('Tuesday', 'multivendorx'),
					},
				},
				{
					key: 'tuesday_close',
					type: 'time',
					size: '4rem',
					defaultValue: '17:00',
					beforeElement: {
						type: 'preposttext',
						textType: 'pre',
						preText: __('-', 'multivendorx'),
					},
				},
				{
					key: 'tuesday_second_open',
					type: 'time',
					size: '4rem',
					defaultValue: '18:00',
					dependent: {
						key: 'onboarding_steps_configuration',
						value: 'split_shift',
					},
				},
				{
					key: 'tuesday_second_close',
					type: 'time',
					size: '4rem',
					defaultValue: '22:00',
					beforeElement: {
						type: 'preposttext',
						textType: 'pre',
						preText: __('-', 'multivendorx'),
					},
					dependent: {
						key: 'onboarding_steps_configuration',
						value: 'split_shift',
					},
				},
				{
					key: 'divider_tuesday',
					type: 'divider',
				},
				// Wednesday
				{
					key: 'wednesday_open',
					type: 'time',
					size: '4rem',
					defaultValue: '09:00',
					beforeElement: {
						type: 'preposttext',
						textType: 'pre',
						preText: __('Wednesday', 'multivendorx'),
					},
				},
				{
					key: 'wednesday_close',
					type: 'time',
					size: '4rem',
					defaultValue: '17:00',
					beforeElement: {
						type: 'preposttext',
						textType: 'pre',
						preText: __('-', 'multivendorx'),
					},
				},
				{
					key: 'wednesday_second_open',
					type: 'time',
					size: '4rem',
					defaultValue: '18:00',
					dependent: {
						key: 'onboarding_steps_configuration',
						value: 'split_shift',
					},
				},
				{
					key: 'wednesday_second_close',
					type: 'time',
					size: '4rem',
					defaultValue: '22:00',
					beforeElement: {
						type: 'preposttext',
						textType: 'pre',
						preText: __('-', 'multivendorx'),
					},
					dependent: {
						key: 'onboarding_steps_configuration',
						value: 'split_shift',
					},
				},
				{
					key: 'divider_wednesday',
					type: 'divider',
				},
				// Thursday
				{
					key: 'thursday_open',
					type: 'time',
					size: '4rem',
					defaultValue: '09:00',
					beforeElement: {
						type: 'preposttext',
						textType: 'pre',
						preText: __('Thursday', 'multivendorx'),
					},
				},
				{
					key: 'thursday_close',
					type: 'time',
					size: '4rem',
					defaultValue: '17:00',
					beforeElement: {
						type: 'preposttext',
						textType: 'pre',
						preText: __('-', 'multivendorx'),
					},
				},
				{
					key: 'thursday_second_open',
					type: 'time',
					size: '4rem',
					defaultValue: '18:00',
					dependent: {
						key: 'onboarding_steps_configuration',
						value: 'split_shift',
					},
				},
				{
					key: 'thursday_second_close',
					type: 'time',
					size: '4rem',
					defaultValue: '22:00',
					beforeElement: {
						type: 'preposttext',
						textType: 'pre',
						preText: __('-', 'multivendorx'),
					},
					dependent: {
						key: 'onboarding_steps_configuration',
						value: 'split_shift',
					},
				},
				{
					key: 'divider_thursday',
					type: 'divider',
				},
				// Friday
				{
					key: 'friday_open',
					type: 'time',
					size: '4rem',
					defaultValue: '09:00',
					beforeElement: {
						type: 'preposttext',
						textType: 'pre',
						preText: __('Friday', 'multivendorx'),
					},
				},
				{
					key: 'friday_close',
					type: 'time',
					size: '4rem',
					defaultValue: '17:00',
					beforeElement: {
						type: 'preposttext',
						textType: 'pre',
						preText: __('-', 'multivendorx'),
					},
				},
				{
					key: 'friday_second_open',
					type: 'time',
					size: '4rem',
					defaultValue: '18:00',
					dependent: {
						key: 'onboarding_steps_configuration',
						value: 'split_shift',
					},
				},
				{
					key: 'friday_second_close',
					type: 'time',
					size: '4rem',
					defaultValue: '22:00',
					beforeElement: {
						type: 'preposttext',
						textType: 'pre',
						preText: __('-', 'multivendorx'),
					},
					dependent: {
						key: 'onboarding_steps_configuration',
						value: 'split_shift',
					},
				},
				{
					key: 'divider_friday',
					type: 'divider',
				},
				// Saturday
				{
					key: 'saturday_open',
					type: 'time',
					size: '4rem',
					defaultValue: '09:00',
					beforeElement: {
						type: 'preposttext',
						textType: 'pre',
						preText: __('Saturday', 'multivendorx'),
					},
				},
				{
					key: 'saturday_close',
					type: 'time',
					size: '4rem',
					defaultValue: '17:00',
					beforeElement: {
						type: 'preposttext',
						textType: 'pre',
						preText: __('-', 'multivendorx'),
					},
				},
				{
					key: 'saturday_second_open',
					type: 'time',
					size: '4rem',
					defaultValue: '18:00',
					dependent: {
						key: 'onboarding_steps_configuration',
						value: 'split_shift',
					},
				},
				{
					key: 'saturday_second_close',
					type: 'time',
					size: '4rem',
					defaultValue: '22:00',
					beforeElement: {
						type: 'preposttext',
						textType: 'pre',
						preText: __('-', 'multivendorx'),
					},
					dependent: {
						key: 'onboarding_steps_configuration',
						value: 'split_shift',
					},
				},
				{
					key: 'divider_saturday',
					type: 'divider',
				},
			]
		},
		{
			type: 'textarea',
			key: 'closed_message',
			label: __('Message When Shop is Closed', 'multivendorx'),
		},
		{
			key: 'block_purchases_on_holidays',
			type: 'checkbox',
			label: 'Remove Add to Cart Button When Shop Closed',
			desc: 'Hide purchase options during off hours',
			options: [
				{
					key: 'block_purchases',
					value: 'block_purchases',
				},
			],
			look: 'toggle',
		},
	],
};