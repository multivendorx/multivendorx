/* global appLocalizer */
import { __ } from '@wordpress/i18n';
const settings =
	appLocalizer.settings_databases_value['privacy'].store_policy_override ||
	[];
export default {
	id: 'privacy',
	priority: 8,
	headerTitle: __('Privacy', 'multivendorx'),
	headerDescription: __(
		'Define your store’s policies so customers clearly understand your shipping, refund, and return terms.',
		'multivendorx'
	),
	module: 'privacy',
	headerIcon: 'privacy',
	submitUrl: `stores/${appLocalizer.store_id}`,
	modal: [
		// Store Policy
		{
			type: 'textarea',
			key: 'store_policy',
			label: __('Store policy', 'multivendorx'),
			usePlainText: false,
			readOnly: !settings.includes('store'),
		},

		// Shipping Policy
		{
			type: 'textarea',
			key: 'shipping_policy',
			label: __('Shipping policy', 'multivendorx'),
			usePlainText: false,
			readOnly: !settings.includes('shipping'),
		},

		// Refund Policy
		{
			type: 'textarea',
			key: 'refund_policy',
			label: __('Refund policy', 'multivendorx'),
			usePlainText: false,
			readOnly: !settings.includes('refund'),
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
			readOnly: !settings.includes('cancellation_return'),
		},

		// Section UI
		{
			type: 'section',
			title: 'Deactivation',
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
			key: 'deactivation_reason',
			label: __('Deactivation Reason', 'multivendorx'),
			dependent: {
				key: 'enable_deactivation',
				value: 'enable_deactivation',
			},
		},
	],
};
