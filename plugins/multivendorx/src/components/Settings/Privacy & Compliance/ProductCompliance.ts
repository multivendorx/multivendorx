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
		{
			key: 'prohibited_product_categories',
			type: 'expandable-panel',
			label: __('Prohibited product categories', 'multivendorx'),
			placeholder: __('Add prohibited product category', 'multivendorx'),
			settingDescription: __(
				'Define one or more product categories that are not allowed to be listed on your marketplace.',
				'multivendorx'
			),
			desc: __(
				'<b>Note:</b> Ensure sellers are informed about disallowed items before publishing. Violations may result in product removal or account penalties.',
				'multivendorx'
			),
			moduleEnabled: 'marketplace-compliance',
			proSetting: true,
			addNewBtn: true,
			addNewTemplate: {
				label: 'New Product Categories',
				editableFields: {
					title: true,
					description: false,
				},
				disableBtn: true,
			},
		},
		{
			key: 'required_store_uploads',
			type: 'checkbox',
			label: __('Required store uploads', 'multivendorx'),
			settingDescription: __(
				'Specify the documents or files stores must provide to ensure their products comply with marketplace rules.',
				'multivendorx'
			),
			moduleEnabled: 'marketplace-compliance',
			proSetting: true,
			options: [
				{
					key: 'product_authenticity_certificates',
					label: __(
						'Product authenticity certificates',
						'multivendorx'
					),
					value: 'product_authenticity_certificates',
				},
				{
					key: 'product_images_descriptions',
					label: __('Product images & descriptions', 'multivendorx'),
					value: 'product_images_descriptions',
				},
				{
					key: 'safety_certifications',
					label: __('Safety certifications', 'multivendorx'),
					value: 'safety_certifications',
				},
			],
			selectDeselect: true,
		},

		{
			key: 'section',
			type: 'section',
			desc: __(
				'Set rules and options for product abuse reporting.',
				'multivendorx'
			),
			title: __('Product Report Abuse', 'multivendorx'),
		},
		{
			key: 'who_can_report',
			type: 'setting-toggle',
			label: __('Who can report', 'multivendorx'),
			settingDescription: __(
				'Decide if only logged-in customers can submit abuse reports, or if reporting is open to everyone.',
				'multivendorx'
			),
			desc: __(
				'<ul><li>logged-in customers - Only registered and logged-in customers can report products.This helps prevent spam and ensures accountability.</li><li>Anyone - Both logged-in customers and guests can report products. This gives the widest access but may increase the risk of spam submissions.</li></ul>',
				'multivendorx'
			),
			moduleEnabled: 'marketplace-compliance',
			options: [
				{
					key: 'logged_in',
					label: __('logged-in customers', 'multivendorx'),
					value: 'logged_in',
				},
				{
					key: 'anyone',
					label: __('Anyone', 'multivendorx'),
					value: 'anyone',
				},
			],
			look: 'toggle',
		},
		{
			key: 'abuse_report_reasons',
			type: 'expandable-panel',
			label: __('Reasons for abuse report', 'multivendorx'),
			placeholder: __(
				'Add a reason for reporting a product',
				'multivendorx'
			),
			settingDescription: __(
				'Define one or more preset reasons that stores can choose from when submitting an abuse report.',
				'multivendorx'
			),
			desc: __(
				'<b>Note</b>: Users can report products for various issues. When enabling logged-in user restriction, anonymous reports will be blocked. Abuse reports are reviewed by administrators who can take appropriate action including product removal or store penalties.',
				'multivendorx'
			),
			name: 'abuse_report_reasons',
			moduleEnabled: 'marketplace-compliance',
			addNewBtn: true,
			addNewTemplate: {
				label: 'New Reasons',
				editableFields: {
					title: true,
					description: false,
				},
				disableBtn: true,
			},
		},
	],
};
