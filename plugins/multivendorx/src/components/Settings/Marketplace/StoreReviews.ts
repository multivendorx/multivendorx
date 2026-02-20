import { __ } from '@wordpress/i18n';

export default {
	id: 'store-reviews',
	priority: 4,
	headerTitle: __('Store Reviews', 'multivendorx'),
	headerDescription: __(
		'Manage how customers rate and review stores on your marketplace.',
		'multivendorx'
	),
	headerIcon: 'store-review',
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
			min: 3,
			desc: __(
				'Give customers a fair way to share feedback! Define what they rate, like product/listing quality, delivery, or service. You’ll start with five default parameters that can be edited or removed, but make sure at least three stay active for balanced, detailed reviews.',
				'multivendorx'
			),
			addNewBtn: true,
			addNewTemplate: {
				label: 'New Rating Parameters',
				editableFields: {
					title: true,
					description: false,
				},
				disableBtn: true,
			},
			proSetting: false,
			moduleEnabled: 'store-review',
		},
	],
};
