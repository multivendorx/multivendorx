import { __ } from '@wordpress/i18n';

export default {
	id: 'legal-compliance',
	priority: 4,
	headerTitle: __('Legal Compliance', 'multivendorx'),
	headerDescription: __(
		'Stores must submit signed agreements, accept platform terms & conditions, consent to the privacy policy, and set up their refund & return policy. Anti-counterfeit or copyright declarations must be submitted for regulated products.',
		'multivendorx'
	),
	headerIcon: 'adminfont-legal-compliance',
	submitUrl: 'settings',
	modal: [
		{
			key: 'seller_agreement',
			type: 'textarea',
			label: __('Seller agreement', 'multivendorx'),
			desc: __(
				'Define the agreement outlining seller obligations and responsibilities on your marketplace.',
				'multivendorx'
			),
			moduleEnabled: 'marketplace-compliance',
			proSetting: true,
		},
		{
			key: 'terms_conditions',
			type: 'textarea',
			label: __('Terms & conditions', 'multivendorx'),
			desc: __(
				'Specify general terms and conditions that govern participation and transactions.',
				'multivendorx'
			),
			moduleEnabled: 'marketplace-compliance',
			proSetting: true,
		},
		{
			key: 'anti_counterfeit_policy',
			type: 'textarea',
			label: __(
				'Anti-Counterfeit / copyright declaration',
				'multivendorx'
			),
			desc: __(
				'Declare your store’s compliance with intellectual property and anti-counterfeit laws.',
				'multivendorx'
			),
			moduleEnabled: 'marketplace-compliance',
			proSetting: true,
		},
		{
			key: 'legal_document_handling',
			type: 'setting-toggle',
			label: __('Legal document handling', 'multivendorx'),
			settingDescription: __(
				'Control how stores interact with legal document templates. Choose whether stores can only access the pre-defined templates or are allowed to upload their customized versions.',
				'multivendorx'
			),
			desc: __(
				'<ul><li><strong>Download only</strong> - Stores can view and download compliance documents (like Seller Agreement, Terms & Conditions, Anti-Counterfeit Declaration) as PDF for offline reading. No upload or acknowledgment required.</li>' +
					'<li><strong>Download and re-upload</strong> - Stores can download, sign, and re-upload signed copies as proof of acceptance. This ensures verified consent for all legal and policy agreements.</li></ul>',
				'multivendorx'
			),
			moduleEnabled: 'marketplace-compliance',
			proSetting: true,
			options: [
				{
					key: 'allow_download_only',
					label: __('Download only', 'multivendorx'),
					value: 'allow_download_only',
				},
				{
					key: 'allow_download_upload',
					label: __('Download and re-upload', 'multivendorx'),
					value: 'allow_download_upload',
				},
			],
		},
	],
};
