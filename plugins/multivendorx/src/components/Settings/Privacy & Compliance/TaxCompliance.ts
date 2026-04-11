import { __ } from '@wordpress/i18n';

export default {
	id: 'tax-compliance',
	priority: 6,
	headerTitle: __('Tax Compliance', 'multivendorx'),
	headerDescription: __(
		'Stores must provide valid bank account details and tax documents (PAN, GST, VAT, TIN) to receive payouts. Payment processor verification may be required. Non-compliant stores may be restricted from payouts.',
		'multivendorx'
	),
	headerIcon: 'tax-compliance',
	submitUrl: 'settings',
	modal: [
	{
		key: 'bank_documents',
		type: 'checkbox',
		label: __('Bank account details', 'multivendorx'),
		desc: __(
			'Documents required to verify vendor bank account details.',
			'multivendorx'
		),
		options: [
			{
				key: 'bank_statement',
				label: __('Bank account statement (last 3–6 months)', 'multivendorx'),
				value: 'bank_statement',
				edit: true,
			},
			{
				key: 'cancelled_cheque',
				label: __('Cancelled cheque (with account holder name)', 'multivendorx'),
				value: 'cancelled_cheque',
				edit: true,
			},
			{
				key: 'bank_passbook',
				label: __('Bank passbook copy', 'multivendorx'),
				edit: true,
				value: 'bank_passbook',
			},
			{
				key: 'bank_verification_letter',
				label: __('Account verification letter from bank', 'multivendorx'),
				value: 'bank_verification_letter',
				edit: true,
			},
			{
				key: 'void_cheque',
				label: __('Void cheque / direct deposit form', 'multivendorx'),
				edit: true,
				value: 'void_cheque',
			},
		],
		selectDeselect: true,
	},
	{
		key: 'tax_documents',
		type: 'checkbox',
		label: __('Tax identification documents', 'multivendorx'),
		desc: __(
			'Documents required for tax verification of the business.',
			'multivendorx'
		),
		options: [
			{
				key: 'gst_certificate',
				label: __('GST registration certificate', 'multivendorx'),
				edit: true,
				value: 'gst_certificate',
			},
			{
				key: 'vat_certificate',
				label: __('VAT registration certificate', 'multivendorx'),
				edit: true,
				value: 'vat_certificate',
			},
			{
				key: 'pan_card',
				label: __('PAN card (India)', 'multivendorx'),
				edit: true,
				value: 'pan_card',
			},
			{
				key: 'ein_letter',
				label: __('EIN confirmation letter (US)', 'multivendorx'),
				edit: true,
				value: 'ein_letter',
			},
			{
				key: 'tin_document',
				label: __('TIN / SSN / ITIN document', 'multivendorx'),
				edit: true,
				value: 'tin_document',
			},
		],
		selectDeselect: true,
	},
	{
		key: 'business_documents',
		type: 'checkbox',
		label: __('Business registration', 'multivendorx'),
		desc: __(
			'Documents required to verify business registration.',
			'multivendorx'
		),
		options: [
			{
				key: 'incorporation_certificate',
				label: __('Certificate of incorporation', 'multivendorx'),
				edit: true,
				value: 'incorporation_certificate',
			},
			{
				key: 'business_registration',
				label: __('Business registration certificate', 'multivendorx'),
				edit: true,
				value: 'business_registration',
			},
			{
				key: 'trade_license',
				label: __('Trade license / shop license', 'multivendorx'),
				edit: true,
				value: 'trade_license',
			},
			{
				key: 'moa',
				label: __('Memorandum of Association (MOA)', 'multivendorx'),
				edit: true,
				value: 'moa',
			},
			{
				key: 'partnership_deed',
				label: __('Partnership deed / LLP agreement', 'multivendorx'),
				edit: true,
				value: 'partnership_deed',
			},
		],
		selectDeselect: true,
	},
]
}
		{
			key: 'bank_documents',
			type: 'checkbox',
			label: __('Bank account details', 'multivendorx'),
			desc: __(
				'Documents required to verify vendor bank account details.',
				'multivendorx'
			),
			options: [
				{
					key: 'bank_statement',
					label: __('Bank account statement (last 3–6 months)', 'multivendorx'),
					value: 'bank_statement',
					edit: true,
				},
				{
					key: 'cancelled_cheque',
					label: __('Cancelled cheque (with account holder name)', 'multivendorx'),
					value: 'cancelled_cheque',
					edit: true,
				},
				{
					key: 'bank_passbook',
					label: __('Bank passbook copy', 'multivendorx'),
					edit: true,
					value: 'bank_passbook',
				},
				{
					key: 'bank_verification_letter',
					label: __('Account verification letter from bank', 'multivendorx'),
					value: 'bank_verification_letter',
					edit: true,
				},
				{
					key: 'void_cheque',
					label: __('Void cheque / direct deposit form', 'multivendorx'),
					edit: true,
					value: 'void_cheque',
				},
			],
			selectDeselect: true,
		},
		{
			key: 'tax_documents',
			type: 'checkbox',
			label: __('Tax identification documents', 'multivendorx'),
			desc: __(
				'Documents required for tax verification of the business.',
				'multivendorx'
			),
			options: [
				{
					key: 'gst_certificate',
					label: __('GST registration certificate', 'multivendorx'),
					edit: true,
					value: 'gst_certificate',
				},
				{
					key: 'vat_certificate',
					label: __('VAT registration certificate', 'multivendorx'),
					edit: true,
					value: 'vat_certificate',
				},
				{
					key: 'pan_card',
					label: __('PAN card (India)', 'multivendorx'),
					edit: true,
					value: 'pan_card',
				},
				{
					key: 'ein_letter',
					label: __('EIN confirmation letter (US)', 'multivendorx'),
					edit: true,
					value: 'ein_letter',
				},
				{
					key: 'tin_document',
					label: __('TIN / SSN / ITIN document', 'multivendorx'),
					edit: true,
					value: 'tin_document',
				},
			],
			selectDeselect: true,
		},
		{
			key: 'business_documents',
			type: 'checkbox',
			label: __('Business registration', 'multivendorx'),
			desc: __(
				'Documents required to verify business registration.',
				'multivendorx'
			),
			options: [
				{
					key: 'incorporation_certificate',
					label: __('Certificate of incorporation', 'multivendorx'),
					edit: true,
					value: 'incorporation_certificate',
				},
				{
					key: 'business_registration',
					label: __('Business registration certificate', 'multivendorx'),
					edit: true,
					value: 'business_registration',
				},
				{
					key: 'trade_license',
					label: __('Trade license / shop license', 'multivendorx'),
					edit: true,
					value: 'trade_license',
				},
				{
					key: 'moa',
					label: __('Memorandum of Association (MOA)', 'multivendorx'),
					edit: true,
					value: 'moa',
				},
				{
					key: 'partnership_deed',
					label: __('Partnership deed / LLP agreement', 'multivendorx'),
					edit: true,
					value: 'partnership_deed',
				},
			],
			selectDeselect: true,
		},
	],
};