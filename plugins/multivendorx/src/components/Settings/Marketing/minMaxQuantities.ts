import { __ } from '@wordpress/i18n';

export default {
	id: 'min-max',
	priority: 6,
	name: __('Min/Max', 'multivendorx'),
	desc: __(
		'Set purchase limits to control inventory and bulk ordering.',
		'multivendorx'
	),
	icon: 'adminlib-min-max',
	submitUrl: 'settings',
	modal: [
		{
			key: 'section',
			type: 'section',
			hint: __('Product Min/Max', 'multivendorx'),
		},
		{
			key: 'product_quantity_rules',
			type: 'nested',
			label: __('Global quantity rules', 'multivendorx'),
			single: true,
			settingDescription: __(
				'Control the minimum and maximum number of units a customer is allowed to purchase for each product.',
				'multivendorx'
			),
			moduleEnabled: 'min-max',
			nestedFields: [
				{
					key: 'product_min_quantity',
					preInsideText: __('Min', 'multivendorx'),
					type: 'number',
				},
				{
					key: 'product_max_quantity',
					preInsideText: __('Max', 'multivendorx'),
					type: 'number',
				},
			],
		},
		{
			key: 'product_amount_rules',
			type: 'nested',
			label: __('Amount rules', 'multivendorx'),
			single: true,
			settingDescription: __(
				'Control the minimum and maximum number of units a customer is allowed to purchase for each product.',
				'multivendorx'
			),
			moduleEnabled: 'min-max',
			nestedFields: [
				{
					key: 'product_min_amount',
					preInsideText: __('Min', 'multivendorx'),
					type: 'number',
				},
				{
					key: 'product_max_amount',
					preInsideText: __('Max', 'multivendorx'),
					type: 'number',
				},
			],
		},
		{
			key: 'section',
			type: 'section',
			hint: __('Order Min/Max', 'multivendorx'),
		},
		{
			key: 'order_quantity_rules',
			type: 'nested',
			label: __('Global quantity rules', 'multivendorx'),
			single: true,
			settingDescription: __(
				'Control the minimum and maximum number of units a customer is allowed to purchase for each product.',
				'multivendorx'
			),
			moduleEnabled: 'min-max',
			nestedFields: [
				{
					key: 'order_min_quantity',
					preInsideText: __('Min', 'multivendorx'),
					type: 'number',
				},
				{
					key: 'order_max_quantity',
					preInsideText: __('Max', 'multivendorx'),
					type: 'number',
				},
			],
		},
		{
			key: 'order_amount_rules',
			type: 'nested',
			label: __('Amount rules', 'multivendorx'),
			single: true,
			settingDescription: __(
				'Control the minimum and maximum number of units a customer is allowed to purchase for each product.',
				'multivendorx'
			),
			moduleEnabled: 'min-max',
			nestedFields: [
				{
					key: 'order_min_amount',
					preInsideText: __('Min', 'multivendorx'),
					type: 'number',
				},
				{
					key: 'order_max_amount',
					preInsideText: __('Max', 'multivendorx'),
					type: 'number',
				},
			],
		},
	],
};
