import { __ } from '@wordpress/i18n';

export default {
	id: 'wholesale',
	priority: 3,
	name: __('Wholesale', 'multivendorx'),
	desc: __('Configure rules for wholesale buyers and pricing.', 'multivendorx'),
	icon: 'adminfont-wholesale1',
	submitUrl: 'settings',
	modal: [
		{
			key: 'wholesale_buyer_verification',
			type: 'setting-toggle',
			label: __('Wholesale buyer verification', 'multivendorx'),
			settingDescription: __(
				'Decide how wholesale buyers are approved before they can access bulk pricing.',
				'multivendorx'
			),
			desc: __(
				'<ul><li>Automatic - Any user registering as a wholesale buyer is instantly approved without admin review.</li><li>Manual - Admin must review and approve each wholesale buyer request before access is granted.</li></ul>',
				'multivendorx'
			),
			options: [
				{
					key: 'automatic',
					label: __('Automatic', 'multivendorx'),
					value: 'automatic',
				},
				{
					key: 'manual',
					label: __('Manual', 'multivendorx'),
					value: 'manual',
				},
			],
			moduleEnabled: 'wholesale',
			proSetting: true,
		},
		{
			key: 'wholesale_price_access',
			type: 'setting-toggle',
			label: __('Who can see wholesale prices', 'multivendorx'),
			settingDescription: __(
				'Choose which users can see wholesale pricing in store catalogs.',
				'multivendorx'
			),
			desc: __(
				'<ul><li>All registered users - Every logged-in customer can see wholesale prices, regardless of approval status.</li><li>Approved wholesale buyers only - Only users approved as wholesale buyers can see wholesale prices.</li></ul>',
				'multivendorx'
			),
			options: [
				{
					key: 'registered',
					label: __('All registered users', 'multivendorx'),
					value: 'registered',
				},
				{
					key: 'wholesale_only',
					label: __('Approved wholesale buyers only', 'multivendorx'),
					value: 'wholesale_only',
				},
			],
			moduleEnabled: 'wholesale',
			proSetting: true,
		},
		{
			key: 'wholesale_price_display',
			type: 'setting-toggle',
			label: __('How wholesale prices are shown', 'multivendorx'),
			settingDescription: __(
				'Control whether wholesale prices are shown alongside retail prices or separately.',
				'multivendorx'
			),
			desc: __(
				'<ul><li>Along with retail prices - Display both retail and wholesale prices side by side, so buyers can compare.</li><li>Wholesale price only - Replace retail pricing with wholesale pricing for eligible buyers.</li></ul>',
				'multivendorx'
			),
			options: [
				{
					key: 'with_retail',
					label: __('Along with retail prices', 'multivendorx'),
					value: 'with_retail',
				},
				{
					key: 'wholesale_only',
					label: __('Wholesale price only', 'multivendorx'),
					value: 'wholesale_only',
				},
			],
			moduleEnabled: 'wholesale',
			proSetting: true,
		},
	],
};
