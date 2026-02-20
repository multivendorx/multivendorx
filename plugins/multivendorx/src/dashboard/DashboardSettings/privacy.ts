import { __ } from '@wordpress/i18n';

export default {
	id: 'privacy',
	headerTitle: __('Privacy', 'multivendorx'),
	headerDescription: __(
		'Define your store’s policies so customers clearly understand your shipping, refund, and return terms.',
		'multivendorx'
	),
	headerIcon: 'privacy',
	submitUrl: `store/${appLocalizer.store_id}`,
	modal: [
		// Store Policy
		{
			type: 'textarea',
			key: 'store_policy',
			label: __('Store policy', 'multivendorx'),
			usePlainText: false,
			moduleEnabled: 'privacy',
		},

		// Shipping Policy
		{
			type: 'textarea',
			key: 'shipping_policy',
			label: __('Shipping policy', 'multivendorx'),
			usePlainText: false,
			moduleEnabled: 'privacy',
		},

		// Refund Policy
		{
			type: 'textarea',
			key: 'refund_policy',
			label: __('Refund policy', 'multivendorx'),
			usePlainText: false,
			moduleEnabled: 'privacy',
		},

		// Cancellation Policy
		{
			type: 'textarea',
			key: 'cancellation_policy',
			label: __(
				'Cancellation / return / exchange policy',
				'multivendorx'
			),
			usePlainText: false,
			moduleEnabled: 'privacy',
		},

		// Section UI
		{
			type: 'section',
			hint: 'Deactivation',
		},

		// Enable Deactivation Toggle
		{
			type: 'checkbox',
			label: __('Enable Deactivation', 'multivendorx'),
			key: 'enable_deactivation',
			look: 'toggle',
			options: [
				{
					key: 'enable_deactivation',
					value: 'enable_deactivation',
				},
			],
		},

		// Deactivation Reason
		{
			type: 'textarea',
			name: 'deactivation_reason',
			label: __('Deactivation Reason', 'multivendorx'),
			dependent: {
				key: 'enable_deactivation',
				value: 'enable_deactivation',
			},
		},
	],
};
