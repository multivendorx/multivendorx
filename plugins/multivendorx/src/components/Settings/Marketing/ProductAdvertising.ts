import { __ } from '@wordpress/i18n';

export default {
	id: 'advertising',
	priority: 1,
	name: __('Product Advertising', 'mvx-pro'),
	desc: __(
		'Let stores promote their top products or unique offerings in site-wide placements.',
		'mvx-pro'
	),
	icon: 'adminfont-advertise-product',
	submitUrl: 'settings',
	modal: [
		{
			key: 'store_promotion_limit',
			label: __('Store promotion limit', 'multivendorx'),
			settingDescription: __(
				'Define how many products a store can promote for free and the cost for additional paid promotions.',
				'multivendorx'
			),
			type: 'nested',
			single: true,
			moduleEnabled: 'advertisement',
			proSetting: true,
			nestedFields: [
				{
					key: 'paid_promotion_limit',
					type: 'number',
					size: '8rem',
					preText: __('Each store can promote up to', 'multivendorx'),
					postText: __(
						'products for free, and can promote up to',
						'multivendorx'
					),
				},
				{
					key: 'promotion_slot_cost',
					type: 'number',
					size: '8rem',
					// preText: __(' and additionally promote up to', 'multivendorx'),
					postText: __('additional products by paying', 'multivendorx'),
				},
				{
					key: 'promotion_slot_cost_',
					type: 'number',
					size: '8rem',
					postText: __('per promotion slot.', 'multivendorx'),
				},
			],
		},

		{
			key: 'expire_after_days',
			type: 'number',
			label: __('Promotion duration', 'mvx-pro'),
			settingDescription: __(
				'Set the maximum number of days a product can be promoted.',
				'multivendorx'
			),
			preText: __('Promoted products can stay visible for up to', 'multivendorx'),
			postInsideText: __('days', 'multivendorx'),
			size: '8rem',
			moduleEnabled: 'advertisement',
			proSetting: true,
		},
		{
			key: 'store_advertisement_advanced_settings',
			type: 'checkbox',
			label: __('Advanced advertising settings', 'multivendorx'),
			 
			options: [
				{
					key: 'enable_advertisement_in_subscription',
					label: __(
						'Include advertising in subscriptions',
						'multivendorx'
					),
					value: 'enable_advertisement_in_subscription',
					desc: __(
						'Allow stores to advertise products at no extra cost if included in their subscription plan.',
						'multivendorx'
					),
				},
				{
					key: 'mark_advertised_product_as_featured',
					label: __(
						'Mark advertised products as featured',
						'multivendorx'
					),
					value: 'mark_advertised_product_as_featured',
					desc: __(
						'Automatically mark advertised products as featured. They will be removed from the featured list once advertising expires.',
						'multivendorx'
					),
				},
				{
					key: 'display_advertised_product_on_top',
					label: __(
						'Show promoted products at the top',
						'multivendorx'
					),
					value: 'display_advertised_product_on_top',
					desc: __(
						'Display advertised products at the top of catalog pages such as the shop or store page.',
						'multivendorx'
					),
				},
				{
					key: 'out_of_stock_visibility',
					label: __(
						'Hide promoted products when out of stock',
						'multivendorx'
					),
					value: 'out_of_stock_visibility',
					desc: __(
						'Hide advertised products that are out of stock. Note: if WooCommerce’s out-of-stock visibility setting is enabled, products will be hidden regardless of this setting.',
						'multivendorx'
					),
				},
			],
			selectDeselect: true,
			proSetting: true,
		},
	],
};
