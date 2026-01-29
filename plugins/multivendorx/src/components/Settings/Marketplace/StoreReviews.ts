import { __ } from '@wordpress/i18n';

export default {
	id: 'store-reviews',
	priority: 4,
	name: __('Store Reviews', 'multivendorx'),
	desc: __(
		'Manage how customers rate and review stores on your marketplace.',
		'multivendorx'
	),
	icon: 'adminfont-store-review',
	submitUrl: 'settings',
	modal: [
		{
			key: 'store_rating_page',
			type: 'blocktext',
			blocktext: __(
				'<b>Store reviews are managed separately from product/listing reviews. You can configure product/listing reviews directly from your <a href="/wp-admin/admin.php?page=wc-settings&tab=products" target="_blank">WooCommerce settings</a>.</b>',
				'multivendorx'
			),
		},
		{
			key: 'is_storereview_varified',
			type: 'checkbox',
			label: __('Verified buyer reviews only', 'multivendorx'),
			desc: __(
				'Accept reviews only from verified buyers who purchased a product/listing.',
				'multivendorx'
			),
			options: [
				{
					key: 'is_storereview_varified',
					value: 'is_storereview_varified',
				},
			],
			look: 'toggle',
			moduleEnabled: 'store-review',
		},
		{
			key: 'ratings_parameters',
			type: 'expandable-panel',
			label: __('Rating parameters', 'multivendorx'),
			settingDescription: __(
				'Define the key factors customers will use to evaluate each store.',
				'multivendorx'
			),
			desc: __(
				'Give customers a fair way to share feedback! Define what they rate, like product/listing quality, delivery, or service. You’ll start with five default parameters that can be edited or removed, but make sure at least three stay active for balanced, detailed reviews.',
				'multivendorx'
			),
			// addNewBtn: true,
			buttonEnable: true,
			modal: [
				{
					id: 'business-registration',
					label: 'Business registration certificate',
					required: true,
					isCustom: true,
					desc: 'Confirms the store is legally registered as a business entity.',
					formFields: [
						{
							key: 'title',
							type: 'text',
							label: 'Method title',
							placeholder: 'Enter title',
						},
						{
							key: 'description',
							type: 'textarea',
							label: 'Description',
						},
						{
							key: 'required',
							type: 'checkbox',
							label: 'Required',
						},
					],
				},
				{
					id: 'trade-license',
					label: 'Trade license or permit',
					disableBtn: true,
					desc: 'Validates that the store is authorized to operate and conduct business legally.',
					formFields: [
						{
							key: 'title',
							type: 'text',
							label: 'Method title',
							placeholder: 'Enter title',
						},
						{
							key: 'description',
							type: 'textarea',
							label: 'Description',
						},
						{
							key: 'required',
							type: 'checkbox',
							label: 'Required',
						},
					]
				},
				{
					id: 'zone-wise-shipping',
					icon: 'adminfont-zone-wise-shipping',
					label: 'Products',
					disableBtn: true,
					isCustom:true,
					moduleEnabled: 'store-shipping',
					desc: 'Add more products to your store',
					formFields: [
						{
							key: 'title',
							type: 'text',
							label: 'Method title',
							placeholder: 'Enter title',
						},
						{
							key: 'description',
							type: 'textarea',
							label: 'Description',
						},
					],
				},
				{
					id: 'country-wise-shipping',
					icon: 'adminfont-country-shipping',
					label: 'Categories',
					moduleEnabled: 'store-shipping',
					disableBtn: true,
					desc: 'Organize with additional categories',
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
					icon: 'adminfont-store-shipping',
					label: 'Storage',
					disableBtn: true,
					moduleEnabled: 'store-shipping',
					desc: 'Expand your storage capacity',
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
			addNewTemplate: {
				label: 'New Rating Parameters',
				formFields: [
					{
						key: 'label',
						type: 'text',
						label: 'Parameters',
						placeholder: 'Enter parameters',
					},
				],
			},
			proSetting: false,
			moduleEnabled: 'store-review',
		},
		// {
		// 	key: 'ratings_parameters',
		// 	type: 'expandable-panel',
		// 	label: __('Rating parameters', 'multivendorx'),
		// 	settingDescription: __(
		// 		'Define the key factors customers will use to evaluate each store.',
		// 		'multivendorx'
		// 	),
		// 	desc: __(
		// 		'Give customers a fair way to share feedback! Define what they rate, like product/listing quality, delivery, or service. You’ll start with five default parameters that can be edited or removed, but make sure at least three stay active for balanced, detailed reviews.',
		// 		'multivendorx'
		// 	),
		// 	addNewBtn: true,
		// 	addNewTemplate: {
		// 		label: 'New Rating Parameters',
		// 		formFields: [
		// 			{
		// 				key: 'label',
		// 				type: 'text',
		// 				label: 'Parameters',
		// 				placeholder: 'Enter parameters',
		// 			},
		// 		],
		// 	},
		// 	modal: [],
		// 	proSetting: false,
		// 	moduleEnabled: 'store-review',
		// },
	],
};
