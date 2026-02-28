import { __ } from '@wordpress/i18n';

export default {
	id: 'shipping',
	priority: 1,
	headerTitle: __('Shipping', 'multivendorx'),
	headerDescription: __(
		'Choose whether stores follow a step-by-step guided process through the category hierarchy or freely select multiple categories & subcategories without restrictions.',
		'multivendorx'
	),
	headerIcon: 'shipping',
	submitUrl: 'settings',
	modal: [
		{
			key: 'shipping_modules',
			type: 'expandable-panel',
			moduleEnabled: 'store-shipping',
			label: __('Shipping methods available to stores ', 'multivendorx'),
			desc: __(
				'See which shipping options your stores can offer to customers. Each method determines how shipping costs are calculated.',
				'multivendorx'
			),
			settingDescription: __(
				'Control which shipping options stores can use to calculate and manage delivery costs for their products. Enable or disable specific shipping methods to decide how stores define shipping charges across different locations.',
				'multivendorx'
			),
			modal: [
				{
					id: 'zone-wise-shipping',
					icon: 'zone-wise-shipping',
					label: 'Zone based shipping',
					disableBtn: true,
					moduleEnabled: 'store-shipping',
					desc: 'Stores can configure multiple shipping zones.',
					formFields: [
						{
							key: 'zones',
							type: 'clickable-list',
							label: 'Shipping Zones',
							name: __('Add New Zone', 'multivendorx'),
							desc: 'Create shipping zones in WooCommerce → Shipping using the ‘Add Zone’ button. Assign the shipping method ‘Store shipping’ to let each store set its own shipping costs for that zone.',
							items: appLocalizer.zones_list,
							button: {
								label: 'Add New Zone',
								url: `${appLocalizer.admin_url}admin.php?page=wc-settings&tab=shipping`,
							},
						},
					],
				},
				{
					id: 'country-wise-shipping',
					icon: 'country-shipping',
					label: 'Country-wise shipping',
					moduleEnabled: 'store-shipping',
					disableBtn: true,
					desc: 'Let store set specific shipping rates based on destination countries.',
					formFields: [
						{
							key: 'country_shipping_method_name',
							type: 'text',
							label: 'Method name',
							placeholder: 'Enter Name',
						},
					],
				},
				{
					id: 'distance-based-shipping',
					icon: 'store-shipping',
					label: 'Distance-based shipping',
					disableBtn: true,
					moduleEnabled: 'store-shipping',
					desc: 'Calculate shipping costs based on actual distance between locations.',
					formFields: [
						{
							key: 'distance_shipping_method_name',
							type: 'text',
							label: 'Method name',
							placeholder: 'Enter Name',
						},
					],
				},
			],
		},
		{
			key: 'shipping_providers',
			type: 'checkbox',
			label: __(' Shipping carriers', 'multivendorx'),
			moduleEnabled: 'store-shipping',
			settingDescription: __(
				' Choose which shipping providers stores can use. Only the carriers you enable will be available for sellers to ship their products and add tracking details. This helps keep all shipments through trusted, approved providers.',
				'multivendorx'
			),

			addNewBtnText: 'Add Custom Provider',
			options: [
				{
					key: 'australia_post',
					label: __('Australia post', 'multivendorx'),
					value: 'australia_post',
					edit: true,
				},
				{
					key: 'canada_post',
					label: __('Canada post', 'multivendorx'),
					value: 'canada_post',
					edit: true,
				},
				{
					key: 'city_link',
					label: __('City link', 'multivendorx'),
					value: 'city_link',
					edit: true,
				},
				{
					key: 'dhl',
					label: __('DHL', 'multivendorx'),
					value: 'dhl',
					edit: true,
				},
				{
					key: 'fastway_south_africa',
					label: __('Fastway South Africa', 'multivendorx'),
					value: 'fastway_south_africa',
					edit: true,
				},
				{
					key: 'fedex',
					label: __('FedEx', 'multivendorx'),
					value: 'fedex',
					edit: true,
				},
				{
					key: 'ontrac',
					label: __('OnTrac', 'multivendorx'),
					value: 'ontrac',
					edit: true,
				},
				{
					key: 'polish_shipping',
					label: __('Polish shipping providers', 'multivendorx'),
					value: 'polish_shipping',
					edit: true,
				},
			],
			selectDeselect: true,
		},
	],
};
