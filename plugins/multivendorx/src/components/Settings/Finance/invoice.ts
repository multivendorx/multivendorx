import { __ } from '@wordpress/i18n';
import Invoice1 from '../../../assets/template/invoicePdf/Invoice-1';
import CustomerInvoice1 from '../../../assets/template/customerInvoice/Invoice-1';
import MarketplaceInvoice1 from '../../../assets/template/marketplaceInvoice/Invoice-1';
import subscriptionInvoice1 from '../../../assets/template/subscriptionInvoice/subscriptionInvoice1';
import adminInvoice1 from '../../../assets/template/adminInvoice/adminInvoice1';
import packingSlip1 from '../../../assets/template/packingSlip/packingSlip1';

export default {
	id: 'store-invoice',
	priority: 6,
	name: __('Invoices', 'multivendorx'),
	desc: __(
		'Set up when and how invoices are generated in your marketplace.',
		'multivendorx'
	),
	icon: 'adminfont-invoice',
	submitUrl: 'settings',
	modal: [
		{
			key: 'invoice_template_builder',
			type: 'color-setting',
			label: __('Invoice Template & PDF', 'multivendorx'),
			moduleEnabled: 'invoice',
			showPdfButton: true,
			templates: [
				{
					key: 'packing_slip',
					label: __('Packing Slip Invoice', 'multivendorx'),
					preview: packingSlip1,
					component: packingSlip1,
					pdf: packingSlip1,
				},
				{
					key: 'admin_invoice',
					label: __('Admin Invoice', 'multivendorx'),
					preview: adminInvoice1,
					component: adminInvoice1,
					pdf: adminInvoice1,
				},
				{
					key: 'subscription_invoice',
					label: __('Subscription Invoice', 'multivendorx'),
					preview: subscriptionInvoice1,
					component: subscriptionInvoice1,
					pdf: subscriptionInvoice1,
				},
				{
					key: 'marketplace_invoice',
					label: __('Marketplace Invoice', 'multivendorx'),
					preview: MarketplaceInvoice1,
					component: MarketplaceInvoice1,
					pdf: MarketplaceInvoice1,
				},
				{
					key: 'customer_invoice1',
					label: __('Customer Invoice', 'multivendorx'),
					preview: CustomerInvoice1,
					component: CustomerInvoice1,
					pdf: CustomerInvoice1,
				},
				{
					key: 'invoice_1',
					label: __('Invoice 1', 'multivendorx'),
					preview: Invoice1,
					component: Invoice1,
					pdf: Invoice1,
				}
			],
			predefinedOptions: [
				{
					key: 'orchid_bloom',
					label: 'Orchid Bloom',
					value: 'orchid_bloom',
					colors: {
						colorPrimary: '#FF5959',
						colorSecondary: '#FADD3A',
						colorAccent: '#49BEB6',
						colorSupport: '#075F63',
					},
				},
				{
					key: 'emerald_edge',
					label: 'Emerald Edge',
					value: 'emerald_edge',
					colors: {
						colorPrimary: '#e6b924',
						colorSecondary: '#d888c1',
						colorAccent: '#6b7923',
						colorSupport: '#6e97d0',
					},
				},
				{
					key: 'solar_ember',
					label: 'Solar Ember',
					value: 'solar_ember',
					colors: {
						colorPrimary: '#fe900d',
						colorSecondary: '#6030db',
						colorAccent: '#17cadb',
						colorSupport: '#a52fff',
					},
				},
				{
					key: 'crimson_blaze',
					label: 'Crimson Blaze',
					value: 'crimson_blaze',
					colors: {
						colorPrimary: '#04e762',
						colorSecondary: '#f5b700',
						colorAccent: '#dc0073',
						colorSupport: '#008bf8',
					},
				},
				{
					key: 'golden_ray',
					label: 'Golden Ray',
					value: 'golden_ray',
					colors: {
						colorPrimary: '#0E117A',
						colorSecondary: '#399169',
						colorAccent: '#12E2A4',
						colorSupport: '#DCF516',
					},
				},
				{
					key: 'obsidian_night',
					label: 'Obsidian Night',
					value: 'obsidian_night',
					colors: {
						colorPrimary: '#00eed0',
						colorSecondary: '#0197af',
						colorAccent: '#4b227a',
						colorSupport: '#02153d',
					},
				},
				{
					key: 'obsidian',
					label: 'Obsidian',
					value: 'obsidian',
					colors: {
						colorPrimary: '#7ccc63',
						colorSecondary: '#f39c12',
						colorAccent: '#e74c3c',
						colorSupport: '#2c3e50',
					},
				},
				{
					key: 'black',
					label: 'black',
					value: 'black',
					colors: {
						colorPrimary: '#2c3e50',
						colorSecondary: '#2c3e50',
						colorAccent: '#2c3e50',
						colorSupport: '#2c3e50',
					},
				},
			],
		},
		{
			key: 'commission_type',
			type: 'setting-toggle',
			label: __('Invoice Generation', 'multivendorx'),
			desc: __(
				'Choose the page size for generated invoice PDFs',
				'multivendorx'
			),
			moduleEnabled: 'invoice',
			options: [
				{
					key: 'per_transaction',
					label: __('Order is created', 'multivendorx'),
					value: 'per_transaction',
				},
				{
					key: 'per_unit',
					label: __('Order is paid', 'multivendorx'),
					value: 'per_unit',
				},
				{
					key: 'per_store',
					label: __('Order is completed', 'multivendorx'),
					value: 'per_store',
				},
				{
					key: 'per_store',
					label: __('Manual only', 'multivendorx'),
					value: 'per_store',
				},
			],
		},
		{
			key: 'type_options',
			type: 'checkbox',
			label: __('Enable invoices for', 'multivendorx'),
			// settingDescription: __(
			// 	'Select the product/listing fields stores can configure when adding or managing their products/listings.',
			// 	'multivendorx'
			// ),

			// desc: __(
			// 	'<ul><li>Virtual - Choose this option for products/listing that don’t have a physical form (e.g., services, memberships). <li>Downloadable - Use this option for products/listing that customers can download (e.g., software, eBooks).</li><ul>',
			// 	'multivendorx'
			// ),
			options: [
				{
					key: 'virtual',
					label: __('Customers (sales invoices)', 'multivendorx'),
					value: 'virtual',
				},
				{
					key: 'downloadable',
					label: __('Stores (payout statements)', 'multivendorx'),
					value: 'downloadable',
				},
				{
					key: 'downloadable',
					label: __('Admin to Store commission invoices', 'multivendorx'),
					value: 'downloadable',
				},
			],
			selectDeselect: true,
		},
		{
			key: 'separator_content',
			type: 'section',
			desc: __(
				'Add legal details and tax information to invoices',
				'multivendorx'
			),
			hint: __('Invoice Numbering and Structure', 'multivendorx'),
		},
		{
			key: 'multivendorx_tinymce_api_section',
			type: 'text',
			// classes: 'vertical w-50',
			label: __('Invoice number format', 'multivendorx'),
			// placeholder: 'Enter GST registration number',
			moduleEnabled: 'invoice',
			size: '25rem',
			proSetting: true,
		},
		{
			key: 'multivendorx_tinymce_api_section',
			type: 'text',
			// classes: 'vertical w-50',
			label: __('Starting invoice number', 'multivendorx'),
			// placeholder: 'Enter GST registration number',
			size: '25rem',
			moduleEnabled: 'invoice',
			proSetting: true,
		},
		{
			key: 'commission_type',
			type: 'setting-toggle',
			label: __('Invoice numbering mode', 'multivendorx'),
			moduleEnabled: 'invoice',
			options: [
				{
					key: 'per_transaction',
					label: __('Global (marketplace-wide)', 'multivendorx'),
					value: 'per_transaction',
				},
				{
					key: 'per_unit',
					label: __('Per store (separate sequences)', 'multivendorx'),
					value: 'per_unit',
				}
			],
		},
		{
			key: 'separator_content',
			type: 'section',
			// desc: __(
			// 	'Add legal details and tax information to invoices',
			// 	'multivendorx'
			// ),
			hint: __('Tax Handling', 'multivendorx'),
		},
		{
			key: 'commission_type',
			type: 'setting-toggle',
			label: __('Tax display mode', 'multivendorx'),
			moduleEnabled: 'invoice',
			options: [
				{
					key: 'per_transaction',
					label: __('Inclusive', 'multivendorx'),
					value: 'per_transaction',
				},
				{
					key: 'per_unit',
					label: __('Exclusive', 'multivendorx'),
					value: 'per_unit',
				},
				{
					key: 'per_unit',
					label: __('Both', 'multivendorx'),
					value: 'per_unit',
				}
			],
		},
		{
			key: 'commission_type',
			type: 'setting-toggle',
			label: __('Tax breakdown visibility', 'multivendorx'),
			moduleEnabled: 'invoice',
			options: [
				{
					key: 'per_transaction',
					label: __('Per line item', 'multivendorx'),
					value: 'per_transaction',
				},
				{
					key: 'per_unit',
					label: __('Summary only', 'multivendorx'),
					value: 'per_unit',
				},
				{
					key: 'per_unit',
					label: __('Hide tax details', 'multivendorx'),
					value: 'per_unit',
				}
			],
		},
		{
			key: 'commission_type',
			type: 'setting-toggle',
			label: __('Tax identity on invoice', 'multivendorx'),
			moduleEnabled: 'invoice',
			options: [
				{
					key: 'per_transaction',
					label: __('Marketplace tax details', 'multivendorx'),
					value: 'per_transaction',
				},
				{
					key: 'per_unit',
					label: __('Store tax details', 'multivendorx'),
					value: 'per_unit',
				},
				{
					key: 'per_unit',
					label: __('Auto', 'multivendorx'),
					value: 'per_unit',
				}
			],
		},
		{
			key: 'separator_content',
			type: 'section',
			// desc: __(
			// 	'Add legal details and tax information to invoices',
			// 	'multivendorx'
			// ),
			hint: __('PDF Settings', 'multivendorx'),
		},
		{
			key: 'commission_type',
			type: 'setting-toggle',
			label: __('Page size', 'multivendorx'),
			moduleEnabled: 'invoice',
			options: [
				{
					key: 'per_transaction',
					label: __('A4 (210 × 297 mm)', 'multivendorx'),
					value: 'per_transaction',
				},
				{
					key: 'per_unit',
					label: __('Letter (8.5 × 11 in)', 'multivendorx'),
					value: 'per_unit',
				},
				{
					key: 'per_unit',
					label: __('Legal (8.5 × 14 in)', 'multivendorx'),
					value: 'per_unit',
				}
			],
		},
		{
			key: 'commission_type',
			type: 'setting-toggle',
			label: __('Orientation', 'multivendorx'),
			moduleEnabled: 'invoice',
			options: [
				{
					key: 'per_transaction',
					label: __('portrait', 'multivendorx'),
					value: 'per_transaction',
				},
				{
					key: 'per_unit',
					label: __('landscape', 'multivendorx'),
					value: 'per_unit',
				}
			],
		},
		{
			key: 'separator_content',
			type: 'section',
			// desc: __(
			// 	'Add legal details and tax information to invoices',
			// 	'multivendorx'
			// ),
			hint: __('Automatic Email Delivery', 'multivendorx'),
		},
		{
			key: 'type_options',
			type: 'checkbox',
			// classes: 'vertical',
			label: __('Automatic email delivery', 'multivendorx'),

			desc: __(
				'Choose how invoices are automatically sent to customers and stores',
				'multivendorx'
			),
			moduleEnabled: 'invoice',
			options: [
				{
					key: 'virtual',
					label: __(
						'Attach to order emails',
						'multivendorx'
					),
					desc: __('Include PDF in order confirmation', 'multivendorx'),
					value: 'virtual',
				},
				{
					key: 'Send Separate Invoice Email',
					label: __('Send separate invoice email', 'multivendorx'),
					desc: __('Dedicated email with invoice', 'multivendorx'),
					value: 'downloadable',
				},
				{
					key: 'Notify Stores of Invoice Generation',
					label: __(
						'Notify stores',
						'multivendorx'
					),
					desc: __('Email store owners', 'multivendorx'),
					value: 'downloadable',
				},
				{
					key: 'Generate Packing Slips',
					label: __('Generate packing slips', 'multivendorx'),
					desc: __('Create packing slips', 'multivendorx'),
					value: 'downloadable',
				},
			],
			proSetting: true,
			selectDeselect: true,
		},
		{
			key: 'separator_content',
			type: 'section',
			// desc: __(
			// 	'Add legal details and tax information to invoices',
			// 	'multivendorx'
			// ),
			hint: __('Invoice Content Controls', 'multivendorx'),
		},
		{
			key: 'seller_agreement',
			type: 'textarea',
			label: __('Invoice footer text', 'multivendorx'),
		},
		{
			key: 'seller_agreement',
			type: 'textarea',
			label: __('Terms and conditions', 'multivendorx'),
		},
		{
			key: 'type_options',
			type: 'checkbox',
			// classes: 'vertical',
			label: __('Resend Controls', 'multivendorx'),
			desc: __(
				'Choose how invoices are automatically sent to customers and stores',
				'multivendorx'
			),
			options: [
				{
					key: 'virtual',
					label: __(
						'Allow admin to regenerate',
						'multivendorx'
					),
					desc: __('Admins can recreate invoices', 'multivendorx'),
					value: 'virtual',
				},
				{
					key: 'Send Separate Invoice Email',
					label: __('Allow stores to resend', 'multivendorx'),
					desc: __('Store owners can resend', 'multivendorx'),
					value: 'downloadable',
				},
				{
					key: 'Notify Stores of Invoice Generation',
					label: __(
						'Lock after generation',
						'multivendorx'
					),
					desc: __('Prevent tampering (audit safety)', 'multivendorx'),
					value: 'downloadable',
				},
			],
			proSetting: true,
			selectDeselect: true,
		},
		{
			key: 'customer_access',
			type: 'checkbox',
			label: __('Customer Access', 'multivendorx'),
			desc: __(
				'Control how customers can access their invoices',
				'multivendorx'
			),
			options: [
				{
					key: 'my_account_download',
					label: __('Allow download from My Account', 'multivendorx'),
					desc: __('Customers can access invoices from their dashboard', 'multivendorx'),
					value: 'my_account_download',
				},
				{
					key: 'order_confirmation_download',
					label: __('Allow download from order confirmation', 'multivendorx'),
					desc: __('Include invoice link on the order confirmation page', 'multivendorx'),
					value: 'order_confirmation_download',
				},
			],
			proSetting: true,
			selectDeselect: true,
		},
		{
			key: 'credit_notes',
			type: 'checkbox',
			label: __('Credit Notes and Refunds', 'multivendorx'),
			desc: __(
				'Settings related to credit note generation and compliance',
				'multivendorx'
			),
			options: [
				{
					key: 'auto_credit_note',
					label: __('Generate credit note on refund', 'multivendorx'),
					desc: __('Automatically create a credit note when a refund is issued', 'multivendorx'),
					value: 'auto_credit_note',
				},
				{
					key: 'link_original_invoice',
					label: __('Link to original invoice', 'multivendorx'),
					desc: __('Show invoice reference on credit note for audit trail', 'multivendorx'),
					value: 'link_original_invoice',
				},
			],
			proSetting: true,
			selectDeselect: true,
		},
		{
			key: 'credit_notes',
			type: 'checkbox',
			label: __('Credit Notes and Refunds', 'multivendorx'),
			desc: __(
				'Settings related to credit note generation and compliance',
				'multivendorx'
			),
			options: [
				{
					key: 'auto_credit_note',
					label: __('Generate credit note on refund', 'multivendorx'),
					desc: __('Automatically create a credit note when a refund is issued', 'multivendorx'),
					value: 'auto_credit_note',
				},
				{
					key: 'link_original_invoice',
					label: __('Link to original invoice', 'multivendorx'),
					desc: __('Show invoice reference on credit note for audit trail', 'multivendorx'),
					value: 'link_original_invoice',
				},
			],
			proSetting: true,
			selectDeselect: true,
		},
		{
			key: 'credit_note_format',
			type: 'text',
			label: __('Credit note format', 'multivendorx'),
			desc: __('Example: CN-{YYYY}-{NUMBER}', 'multivendorx'),
			placeholder: 'CN-{YYYY}-{NUMBER}',
			proSetting: true,
		},
		{
			key: 'packing_slips',
			type: 'checkbox',
			label: __('Packing Slips', 'multivendorx'),
			desc: __(
				'Configure packing slip display options',
				'multivendorx'
			),
			options: [
				{
					key: 'include_prices',
					label: __('Include prices on packing slips', 'multivendorx'),
					desc: __('Show item prices on packing slips', 'multivendorx'),
					value: 'include_prices',
				},
				{
					key: 'use_store_address',
					label: __('Use store address', 'multivendorx'),
					desc: __('Use store address instead of marketplace address', 'multivendorx'),
					value: 'use_store_address',
				},
			],
			proSetting: true,
			selectDeselect: true,
		},
		

		{
			key: 'separator_content',
			type: 'section',
			desc: __(
				'Add legal details and tax information to invoices',
				'multivendorx'
			),
			hint: __('Legal and tax information', 'multivendorx'),
		},
		{
			key: 'multivendorx_tinymce_api_section',
			type: 'number',
			classes: 'vertical w-50',
			label: __('GST number', 'multivendorx'),
			placeholder: 'Enter GST registration number',
			moduleEnabled: 'invoice',
			proSetting: true,
		},
		{
			key: 'multivendorx_tinymce_api_section',
			type: 'number',
			classes: 'vertical w-50',
			label: __('Tax ID number', 'multivendorx'),
			placeholder: 'Enter tax ID number',
			moduleEnabled: 'invoice',
			proSetting: true,
		},
		{
			key: 'separator_content',
			type: 'section',
			desc: __(
				'Customize invoice design with your branding and business details',
				'multivendorx'
			),
			hint: __('Branding and information', 'multivendorx'),
		},
		{
			key: 'company_logo',
			// classes: 'vertical',
			type: 'file',
			label: __('Company logo', 'multivendorx'),
			desc: __('Upload your company logo for invoices', 'multivendorx'),
			size: 'small',
			proSetting: true,
			moduleEnabled: 'invoice',
		},
		{
			key: 'company_logo',
			// classes: 'vertical',
			type: 'file',
			label: __('Signature', 'multivendorx'),
			// desc: __('Upload your company logo for invoices', 'multivendorx'),
			size: 'small',
			proSetting: true,
			moduleEnabled: 'invoice',
		},
	],
};
