import { __ } from '@wordpress/i18n';

export default {
	id: 'tax-compliance',
	priority: 6,
	headerTitle: __('Tax Compliance', 'multivendorx'),
	headerDescription: __(
		'Stores must provide valid bank account details and tax documents (PAN, GST, VAT, TIN) to receive payouts. Payment processor verification may be required. Non-compliant stores may be restricted from payouts.',
		'multivendorx'
	),
	headerIcon: 'adminfont-tax-compliance',
	submitUrl: 'settings',
	modal: [
		{
			key: 'financial_tax_required_uploads',
			type: 'checkbox',
			label: __('Required store uploads', 'multivendorx'),
			settingDescription: __(
				'Specify which financial or tax-related documents stores must upload for compliance verification.',
				'multivendorx'
			),
			options: [
				{
					key: 'bank_account_details',
					label: __('Bank account details', 'multivendorx'),
					value: 'bank_account_details',
					edit: true,
				},
				{
					key: 'tax_identification_documents',
					label: __(
						'Tax identification documents (TINs/VAT/GST/EIN/SSN/ITIN. etc.)',
						'multivendorx'
					),
					value: 'tax_identification_documents',
					edit: true,
				},
				{
					key: 'business_registration',
					label: __('Business registration', 'multivendorx'),
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
