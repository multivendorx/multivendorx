import { __ } from '@wordpress/i18n';


export default {
	id: 'delivery',
	priority: 2,
	headerTitle: __('Delivery', 'multivendorx'),
	headerDescription: __(
		'Define the steps orders follow from purchase to completion. Set what customers see in tracking and choose whether orders complete automatically or after customer confirmation.',
		'multivendorx'
	),
	headerIcon: 'delivery',
	submitUrl: 'settings',
	modal: [
		{
			key: 'shipping_stage',
			type: 'expandable-panel',
			proSetting: true,
			label: __('Delivery progress stages', 'multivendorx'),
			settingDescription: __(
				'Steps customers see as their order moves toward delivery. These stages show up in order tracking so customers know where their package is.',
				'multivendorx'
			),
			name: 'abuse_report_reasons',
			addNewBtn: true,
			min: 2,
			addNewTemplate: {
				label: 'New progress stages',
				desc: 'dummy desc',
				icon: 'rejecte',
				iconEnable: true,
				iconOptions: [
					'delivery',
					'rejecte',
					'delivery-person',
					'pending',
					'order-completed',
					'refund',
					'cart',
					'active',
					'store-shipping',
					'geo-my-wp',
					'per-product-shipping',
					'verification7',
					'verification9',
					'verification3',
					'multi-product',
					'marketplace',
					'location',
					'wholesale1',
				],
			},
		},
		{
			key: 'order-completion-rules',
			type: 'setting-toggle',
			label: __('When orders are marked complete', 'multivendorx'),
			settingDescription: __(
				'Specifies how orders are finalized and transitioned from Delivered to Completed after the package has reached the customer',
				'multivendorx'
			),
			proSetting: true,
			desc: __(
				'<ul><li>Auto complete on delivery - completes orders automatically when delivery happens (system-controlled).</li><li>Customer confirm delivery - completes orders only if the customer confirms (buyer-controlled).</li></ul>',
				'multivendorx'
			),
			options: [
				{
					key: 'north_america',
					label: __('Auto complete on delivery', 'multivendorx'),
					value: 'zone_wise',
				},
				{
					key: 'country_wise',
					label: __('Customer confirm delivery', 'multivendorx'),
					value: 'country_wise',
				},
			],
		},
	],
};
