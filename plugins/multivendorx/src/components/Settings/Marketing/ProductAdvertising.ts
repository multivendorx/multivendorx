import { __ } from '@wordpress/i18n';

export default {
	id: 'product-advertising',
	priority: 1,
	headerTitle: __('Product Advertising', 'multivendorx'),
	headerDescription: __(
		'Let stores promote their top products or unique offerings in site-wide placements.',
		'multivendorx'
	),
	headerIcon: 'product-advertising',
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
			moduleEnabled: 'product-advertising',
			proSetting: true,
			nestedFields: [
				{
					key: 'free_promotion_limit',
					type: 'number',
					size: 8,
					beforeElement: {
						type: 'preposttext',
						textType: 'pre',
						preText: __(
							'Each store can promote up to',
							'multivendorx'
						),
					},
					afterElement: {
						type: 'preposttext',
						textType: 'post',
						postText: __(
							'products for free, and can promote up to',
							'multivendorx'
						),
					},
				},
				{
					key: 'pro_promotion_limit',
					type: 'number',
					size: 8,
					afterElement: {
						type: 'preposttext',
						textType: 'post',
						postText: __(
							'additional products by paying',
							'multivendorx'
						),
					},
				},
				{
					key: 'promotion_slot_cost',
					type: 'number',
					size: 8,
					afterElement: {
						type: 'preposttext',
						textType: 'post',
						postText: __('per promotion slot.', 'multivendorx'),
					},
				},
			],
		},

		{
			key: 'expire_after_days',
			type: 'number',
			label: __('Promotion duration', 'multivendorx'),
			settingDescription: __(
				'Set the maximum number of days a product can be promoted.',
				'multivendorx'
			),
			beforeElement: {
				type: 'preposttext',
				textType: 'pre',
				preText: __(
					'Promoted products can stay visible for up to',
					'multivendorx'
				),
			},
			postText: __('days', 'multivendorx'),
			size: 8,
			moduleEnabled: 'product-advertising',
			proSetting: true,
		},
		{
			key: 'store_advertisement_advanced_settings',
			type: 'checkbox',
			label: __('Advanced advertising settings', 'multivendorx'),
			settingDescription: __(
				'Manage how promoted products appear. Control featured status, catalog placement, subscription inclusion, and out-of-stock visibility for advertised items.',
				'multivendorx'
			),
			options: [
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
			moduleEnabled: 'product-advertising',
		},
	],
};
