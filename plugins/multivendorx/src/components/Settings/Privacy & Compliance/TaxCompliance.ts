import { __ } from '@wordpress/i18n';

export default {
	id: 'tax-compliance',
	priority: 6,
	name: __('Tax Compliance', 'mvx-pro'),
	desc: __(
		'Stores must provide valid bank account details and tax documents (PAN, GST, VAT, TIN) to receive payouts. Payment processor verification may be required. Non-compliant stores may be restricted from payouts.',
		'mvx-pro'
	),
	icon: 'adminfont-tax-compliance',
	submitUrl: 'settings',
	modal: [
		{
			key: 'financial_tax_required_uploads',
			type: 'checkbox',
			label: __('Required store uploads', 'mvx-pro'),
			desc: __(
				'Select which financial or tax-related documents stores must upload for compliance verification.',
				'mvx-pro'
			),
			options: [
				{
					key: 'bank_account_details',
					label: __('Bank account details', 'mvx-pro'),
					value: 'bank_account_details',
					edit: true,
				},
				{
					key: 'tax_identification_documents',
					label: __(
						'Tax identification documents (TINs/VAT/GST/EIN/SSN/ITIN. etc.)',
						'mvx-pro'
					),
					value: 'tax_identification_documents',
					edit: true,
				},
				{
					key: 'business_registration',
					label: __('Business registration', 'mvx-pro'),
					value: 'business_registration',
					edit: true,
				},
			],
			moduleEnabled: 'marketplace-compliance',
			proSetting: true,
			selectDeselect: true,
		},
	],
};
