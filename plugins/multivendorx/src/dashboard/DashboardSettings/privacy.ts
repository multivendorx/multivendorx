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
		// Success Notice
		{
			type: 'notice',
			name: 'successNotice',
			// message: successMsg
		},

		// Store Policy
		{
			type: 'textarea',
			group: true,
			name: 'store_policy',
			label: __('Store policy', 'multivendorx'),
			// condition: modules.includes('privacy') && Array.isArray(store_policy) && store_policy.includes('store'),
			// value: formData.store_policy,
			// onChange: (value: string) => handleChange('store_policy', value),
			usePlainText: false,
			tinymceApiKey: appLocalizer?.settings_databases_value?.['overview']?.['tinymce_api_section'] ?? ''
		},

		// Shipping Policy
		{
			type: 'textarea',
			group: true,
			name: 'shipping_policy',
			label: __('Shipping policy', 'multivendorx'),
			// condition: modules.includes('privacy') && Array.isArray(store_policy) && store_policy.includes('shipping'),
			// value: formData.shipping_policy,
			// onChange: (value: string) => handleChange('shipping_policy', value),
			usePlainText: false,
			tinymceApiKey: appLocalizer?.settings_databases_value?.['overview']?.['tinymce_api_section'] ?? ''
		},

		// Refund Policy
		{
			type: 'textarea',
			group: true,
			name: 'refund_policy',
			label: __('Refund policy', 'multivendorx'),
			// condition: modules.includes('privacy') && Array.isArray(store_policy) && store_policy.includes('refund'),
			// value: formData.refund_policy,
			// onChange: (value: string) => handleChange('refund_policy', value),
			usePlainText: false,
			tinymceApiKey: appLocalizer?.settings_databases_value?.['overview']?.['tinymce_api_section'] ?? ''
		},

		// Cancellation Policy
		{
			type: 'textarea',
			group: true,
			name: 'cancellation_policy',
			label: __('Cancellation / return / exchange policy', 'multivendorx'),
			// condition: modules.includes('privacy') && Array.isArray(store_policy) && store_policy.includes('cancellation_return'),
			// value: formData.cancellation_policy,
			// onChange: (value: string) => handleChange('cancellation_policy', value),
			usePlainText: false,
			tinymceApiKey: appLocalizer?.settings_databases_value?.['overview']?.['tinymce_api_section'] ?? ''
		},

		// Section UI
		{
			type: 'section',
			group: true,
			name: 'deactivationSection',
			hint: 'Deactivation'
		},

		// Deactivation Warning
		{
			type: 'custom',
			group: true,
			name: 'deactivationWarning',
			// condition: formData.deactivation_reason,
			// render: () => (
			//   <div>
			//     {__(
			//       "When you delete a channel, all messages from this channel will be removed from Slack immediately. This can't be undone. Keep in mind: Any files uploaded to this channel won't be removed. You can archive a channel instead without removing its messages.",
			//       'multivendorx'
			//     )}
			//   </div>
			// )
		},

		// Enable Deactivation Toggle
		{
			type: 'checkbox',
			group: true,
			name: 'enable_deactivation',
			label: __('Enable Deactivation', 'multivendorx'),
			key: 'enable_deactivation',
			// condition: !formData.deactivation_reason,
			look: 'toggle',
			options: [
				{
					key: 'enable_deactivation',
					value: 'enable_deactivation',
				}
			],
			// value: formData.enable_deactivation || [],
			// onChange: (selected: any) => {
			//   const updated = {
			//     ...formData,
			//     enable_deactivation: selected,
			//   };
			//   setFormData(updated);
			//   autoSave(updated);
		},

		// Deactivation Reason
		{
			type: 'textarea',
			group: true,
			name: 'deactivation_reason',
			label: __('Deactivation Reason', 'multivendorx'),
			// condition: !formData.deactivation_reason && formData.enable_deactivation,
			// value: updateData.deactivation_reason || '',
			// onChange: (value: string) => handleChange('deactivation_reason', value)
		},

		// Submit Button
		{
			type: 'button',
			group: true,
			name: 'submitDeactivation',
			// condition: !formData.deactivation_reason && formData.enable_deactivation,
			buttons: [
				{
					icon: 'save',
					text: 'Submit',
					// onClick: () => autoSave(updateData)
				}
			]
		}
	],
};