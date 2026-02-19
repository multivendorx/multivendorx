import { __ } from '@wordpress/i18n';

export default {
	id: 'privacy',
	headerTitle: __('Privacy', 'multivendorx'),
	headerDescription: __(
		'Define your store’s policies so customers clearly understand your shipping, refund, and return terms.',
		'multivendorx'
	),
	headerIcon: 'privacy',
	modal: [
		// Store Policy
		{
			type: 'textarea',
			group: true,
			name: 'store_policy',
			label: __('Store policy', 'multivendorx'),
			usePlainText: false,
		},

		// Shipping Policy
		{
			type: 'textarea',
			group: true,
			name: 'shipping_policy',
			label: __('Shipping policy', 'multivendorx'),
			usePlainText: false,
		},

		// Refund Policy
		{
			type: 'textarea',
			group: true,
			name: 'refund_policy',
			label: __('Refund policy', 'multivendorx'),
			usePlainText: false,
		},

		// Cancellation Policy
		{
			type: 'textarea',
			name: 'cancellation_policy',
			label: __('Cancellation / return / exchange policy', 'multivendorx'),
			usePlainText: false,
		},

		// Section UI
		{
			type: 'section',
			name: 'deactivationSection',
			hint: 'Deactivation'
		},

		// Deactivation Warning
		{
			type: 'custom',
			name: 'deactivationWarning',
		},

		// Enable Deactivation Toggle
		{
			type: 'checkbox',
			name: 'enable_deactivation',
			label: __('Enable Deactivation', 'multivendorx'),
			key: 'enable_deactivation',
			look: 'toggle',
			options: [
				{
					key: 'enable_deactivation',
					value: 'enable_deactivation',
				}
			],
		},

		// Deactivation Reason
		{
			type: 'textarea',
			name: 'deactivation_reason',
			label: __('Deactivation Reason', 'multivendorx'),
		},

		// Submit Button
		{
			type: 'button',
			name: 'submitDeactivation',
			buttons: [
				{
					icon: 'save',
					text: 'Submit',
				}
			]
		}
	],
};