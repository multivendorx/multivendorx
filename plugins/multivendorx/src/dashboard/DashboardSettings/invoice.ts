import { __ } from '@wordpress/i18n';

export default {
	id: 'invoice',
	priority: 15,
	headerTitle: __('Invoice', 'multivendorx'),
	headerDescription: __(
		'Configure how invoices and packing slips appear to your customers.',
		'multivendorx'
	),
	headerIcon: 'invoice',
	modal: [
		{
			type: 'text',
			label: __('Store legal name ', 'multivendorx'),
			key: 'name ',
		},
		{
			type: 'textarea',
			label: __('Store address', 'multivendorx'),
			key: 'store_address ',
		},
		{
			type: 'text',
			label: __('Contact email', 'multivendorx'),
			key: 'email',
		},
		{
			type: 'text',
			label: __('Contact phone', 'multivendorx'),
			key: 'contact_phone ',
		},
		{
			key: 'section',
			type: 'section',
			title: __('Legal and tax information', 'multivendorx'),
			desc: __(
				'Add your business registration numbers and tax IDs',
				'multivendorx'
			),
		},
		{
			key: 'store_legal_name ',
			type: 'text',
			label: __('VAT / Tax number', 'multivendorx'),
		},
		{
			key: 'store_legal_name ',
			type: 'text',
			label: __('Additional tax ID', 'multivendorx'),
		},
		{
			key: 'store_legal_name ',
			type: 'text',
			label: __('Company registration number', 'multivendorx'),
		},
		{
			key: 'store_legal_name ',
			type: 'text',
			label: __('Trade license number', 'multivendorx'),
		},
		{
			key: 'section',
			type: 'section',
			title: __('Branding'),
			desc: __('Customize how your store appears on invoices'),
		},
		{
			key: 'store_dashboard_site_logo',
			type: 'attachment',
			label: __('Store logo', 'multivendorx'),
			// size: 'small',
		},
		{
			key: 'store_dashboard_site_logo',
			type: 'attachment',
			label: __('Authorized signature', 'multivendorx'),
			// size: 'small',
		},
	],
};
