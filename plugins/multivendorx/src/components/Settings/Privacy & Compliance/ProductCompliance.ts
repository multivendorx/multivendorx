import { __ } from '@wordpress/i18n';

export default {
	id: 'product-compliance',
	priority: 5,
	headerTitle: __('Product Compliance', 'multivendorx'),
	headerDescription: __(
		'All product listings must follow platform content guidelines and avoid prohibited categories. Branded or regulated products must include authenticity certificates. Optional safety certifications may be uploaded for regulated items.',
		'multivendorx'
	),
	headerIcon: 'per-product-shipping',
	submitUrl: 'settings',
	modal: [
		// {
		// 	key: 'who_can_report',
		// 	type: 'choice-toggle',
		// 	label: __('Who can report', 'multivendorx'),
		// 	settingDescription: __(
		// 		'Decide if only logged-in customers can submit abuse reports, or if reporting is open to everyone.',
		// 		'multivendorx'
		// 	),
		// 	desc: __(
		// 		'<ul><li>logged-in customers - Only registered and logged-in customers can report products.This helps prevent spam and ensures accountability.</li><li>Anyone - Both logged-in customers and guests can report products. This gives the widest access but may increase the risk of spam submissions.</li></ul>',
		// 		'multivendorx'
		// 	),
		// 	moduleEnabled: 'marketplace-compliance',
		// 	options: [
		// 		{
		// 			key: 'logged_in',
		// 			label: __('logged-in customers', 'multivendorx'),
		// 			value: 'logged_in',
		// 		},
		// 		{
		// 			key: 'anyone',
		// 			label: __('Anyone', 'multivendorx'),
		// 			value: 'anyone',
		// 		},
		// 	],
		// 	look: 'toggle',
		// },
		// {
		// 	key: 'abuse_report_reasons',
		// 	type: 'expandable-panel',
		// 	label: __('Reasons for abuse report', 'multivendorx'),
		// 	placeholder: __(
		// 		'Add a reason for reporting a product',
		// 		'multivendorx'
		// 	),
		// 	settingDescription: __(
		// 		'Define one or more preset reasons that stores can choose from when submitting an abuse report.',
		// 		'multivendorx'
		// 	),
		// 	desc: __(
		// 		'<b>Note</b>: Users can report products for various issues. When enabling logged-in user restriction, anonymous reports will be blocked. Abuse reports are reviewed by administrators who can take appropriate action including product removal or store penalties.',
		// 		'multivendorx'
		// 	),
		// 	name: 'abuse_report_reasons',
		// 	moduleEnabled: 'marketplace-compliance',
		// 	addNewBtn: true,
		// 	addNewTemplate: {
		// 		label: 'New Reasons',
		// 		editableFields: {
		// 			title: true,
		// 			description: false,
		// 		},
		// 		disableBtn: true,
		// 	},
		// },
	],
};
