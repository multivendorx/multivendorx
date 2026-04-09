import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import CustomerInvoice1 from '../../../assets/template/customerInvoice/Invoice-1';
import subscriptionInvoice1 from '../../../assets/template/subscriptionInvoice/subscriptionInvoice1';
import adminInvoice1 from '../../../assets/template/adminInvoice/adminInvoice1';
import packingSlip1 from '../../../assets/template/packingSlip/packingSlip1';

export default {
	id: 'invoices',
	priority: 6,
	headerTitle: __('Invoices', 'multivendorx'),
	settingTitle: 'Automatic invoice generation',
	headerDescription: __(
		'Choose at which order stages invoices should be generated automatically.',
		'multivendorx'
	),
	headerIcon: 'invoice',
	submitUrl: 'settings',
	hideSettingHeader: true,
	modal: [
		{
			key: 'invoice_prefix',
			type: 'text',
			row: false,
			cols: 2,
			label: __('Invoice prefix', 'multivendorx'),
			desc: __('Example results: INV-2026-0001, INV-MVX-0001', 'multivendorx'),
			placeholder: __('Text that appears before the number.', 'multivendorx'),
			size: '25rem',
			moduleEnabled: 'invoice',
			proSetting: true,
		},
		{
			key: 'type_options',
			type: 'checkbox',
			label: __('Order stages', 'multivendorx'),
			row: false,
			cols: 2,
			// desc: __(
			//     'Select which invoices your marketplace should generate. Most stores only need the first option.',
			//     'multivendorx'
			// ),
			options: [
				{
					key: 'completed',
					label: __('Completed', 'multivendorx'),
					value: 'completed',
					desc: __(
						'Order is delivered and customer has received all items.',
						'multivendorx'
					),
				},
				{
					key: 'processing',
					label: __('Processing', 'multivendorx'),
					value: 'processing',
					desc: __(
						'Payment received and order is being prepared for shipment.',
						'multivendorx'
					),
				},
				{
					key: 'paid',
					label: __('Paid', 'multivendorx'),
					value: 'paid',
					desc: __('Payment has been confirmed.', 'multivendorx'),
				},
				{
					key: 'on-hold',
					label: __('On Hold', 'multivendorx'),
					value: 'on-hold',
					desc: __(
						'Order placed on hold pending verification.',
						'multivendorx'
					),
				},
				{
					key: 'pending-payment',
					label: __('Pending Payment', 'multivendorx'),
					value: 'pending-payment',
					desc: __(
						'Order created but awaiting payment (useful for bank transfers, checks)',
						'multivendorx'
					),
				},
			],
			selectDeselect: true,
		},
		// {
		// 	key: 'separator_content',
		// 	type: 'section',
		// 	desc: __(
		// 		'Control when invoices are automatically created based on order status.',
		// 		'multivendorx'
		// 	),
		// 	title: __('Automatic invoice generation', 'multivendorx'),
		// },
		// {
		// 	key: 'separator_content',
		// 	type: 'section',
		// 	desc: __(
		// 		'Set up how your invoice numbers are formatted. This helps with organization and makes invoices easier to track for accounting.',
		// 		'multivendorx'
		// 	),
		// 	title: __('Invoice numbering', 'multivendorx'),
		// },

		// {
		// 	key: 'due_days',
		// 	type: 'number',
		// 	row: false,
		// 	cols: 2,
		// 	label: __('Due days', 'multivendorx'),
		// 	placeholder: __('Enter the number of days until the invoice is due', 'multivendorx'),
		// 	size: '25rem',
		// 	moduleEnabled: 'invoice',
		// 	proSetting: true,
		// },
		
		{
			key: 'separator_content',
			type: 'section',
			desc: __(
				'Control how and when store commission invoices are generated for the marketplace.',
				'multivendorx'
			),
			title: __('Store commission invoices ', 'multivendorx'),
		},
		{
			key: 'commission_invoice_frequency',
			type: 'choice-toggle',
			label: __('Commission invoice frequency', 'multivendorx'),
			desc: __(
				'Choose how often vendors receive commission invoices from the marketplace:<ul><li>Per order - Generate a commission invoice for each order.</li><li>Monthly - Generate a single consolidated commission invoice at the end of each month.</li></ul>',
				'multivendorx'
			),
			options: [
				{
					key: 'per_order',
					label: __('Per order', 'multivendorx'),
					value: 'per_order',
				},
				{
					key: 'monthly',
					label: __('Monthly', 'multivendorx'),
					value: 'monthly',
				},
			],
		},
		{
			key: 'separator_content',
			type: 'section',
			desc: __(
				'Control how customers can access and download their order invoices.',
				'multivendorx'
			),
			title: __('Customer access to invoices', 'multivendorx'),
		},
		{
			key: 'invoice_delivery',
			type: 'checkbox',
			row: false,
			label: __('When to send invoice emails  ', 'multivendorx'),

			desc: __(
				'Choose how invoices are automatically sent to customers and stores',
				'multivendorx'
			),
			moduleEnabled: 'invoice',
			options: [
				{
					key: 'virtual',
					label: __(
						'Attach to order confirmation email',
						'multivendorx'
					),
					desc: __(
						'Include invoice PDF with the order confirmation customers already receive.',
						'multivendorx'
					),
					value: 'virtual',
				},
				{
					key: 'Send Separate Invoice Email',
					label: __('Send separate invoice email', 'multivendorx'),
					desc: __('Dedicated email with invoice', 'multivendorx'),
					value: 'downloadable',
				},
			],
			proSetting: true,
			selectDeselect: true,
		},
		{
			key: 'approve_store',
			type: 'choice-toggle',
			label: __('Generate invoices based on', 'multivendorx'),
			desc: __(
				'Choose how invoices should be generated when an order includes products from multiple stores:<ul><li>Main order invoice - Generate a single invoice for the entire order, including products from all stores.</li><li>Vendor sub-order invoice - Generate separate invoices for each store based on the products they sold in the order.</li></ul>',
				'multivendorx'
			),
			options: [
				{
					key: 'main_order_invoice',
					label: __('Main order invoice', 'multivendorx'),
					value: 'main_order_invoice',
				},
				{
					key: 'vendor_sub_order_invoice',
					label: __('Vendor sub-order invoice', 'multivendorx'),
					value: 'vendor_sub_order_invoice',
				},
			],
		},
		// {
		// 	key: 'customer_access',
		// 	type: 'checkbox',
		// 	row: false,
		// 	label: __('Customer access location', 'multivendorx'),
		// 	desc: __(
		// 		'Control how customers can access their invoices.',
		// 		'multivendorx'
		// 	),
		// 	options: [
		// 		{
		// 			key: 'my_account_download',
		// 			label: __(
		// 				'Allow download from "My Account"',
		// 				'multivendorx'
		// 			),
		// 			desc: __(
		// 				'Customers can access invoices from their dashboard',
		// 				'multivendorx'
		// 			),
		// 			value: 'my_account_download',
		// 		},
		// 		{
		// 			key: 'order_confirmation_download',
		// 			label: __('Allow download from order list', 'multivendorx'),
		// 			desc: __(
		// 				'Include invoice link on the order confirmation page',
		// 				'multivendorx'
		// 			),
		// 			value: 'order_confirmation_download',
		// 		},	
		// 	],
		// 	proSetting: true,
		// 	selectDeselect: true,
		// },
		{
			key: 'separator_content',
			type: 'section',
			desc: __(
				'Add your business registration numbers and tax IDs that must appear on invoices.',
				'multivendorx'
			),
			title: __('Legal and tax information', 'multivendorx'),
		},
		{
			key: 'tax_information',
			type: 'expandable-panel',
			label: __('Legal and tax information', 'multivendorx'),
			cols: 2,
			addNewBtn: true,
			addNewTemplate: {
				label: 'New tax information',
				editableFields: {
					title: true,
					description: false,
				},
				disableBtn: true,
			},
		},
		{
			key: 'vat_tax_number',
			type: 'number',
			row: false,
			cols: 2,
			label: __('VAT / Tax number', 'multivendorx'),
			placeholder: 'e.g., GB123456789, DE987654321',
			desc: __(
				'Your VAT registration (Europe) or tax ID number.',
				'multivendorx'
			),
			moduleEnabled: 'invoice',
			proSetting: true,
		},
		{
			key: 'additional_tax_id',
			type: 'number',
			row: false,
			cols: 2,
			label: __('Additional Tax ID', 'multivendorx'),
			placeholder: 'e.g., EIN, ABN, GST Number',
			desc: __(
				'Other tax IDs: EIN (US), ABN (Australia), GST (India), etc.',
				'multivendorx'
			),
			moduleEnabled: 'invoice',
			proSetting: true,
		},
		{
			key: 'company_registration_number',
			type: 'number',
			row: false,
			cols: 2,
			label: __('Company registration number', 'multivendorx'),
			placeholder: 'e.g., Company No. 12345678',
			desc: __(
				'Your official company registration number.',
				'multivendorx'
			),
			moduleEnabled: 'invoice',
			proSetting: true,
		},
		{
			key: 'trade_license_number',
			type: 'number',
			row: false,
			cols: 2,
			label: __('Trade License Number', 'multivendorx'),
			placeholder: 'e.g., License No. ABC-2024-12345',
			desc: __(
				'Business license or permit number (if required).',
				'multivendorx'
			),
			moduleEnabled: 'invoice',
			proSetting: true,
		},
		{
			key: 'separator_content',
			type: 'section',
			desc: __(
				'Add your business registration numbers and tax IDs that must appear on invoices.',
				'multivendorx'
			),
			title: __('Legal and tax information', 'multivendorx'),
		},
		{
			key: 'company_logo',
			row: false,
			type: 'attachment',
			size: 'small',
			label: __('Company logo', 'multivendorx'),
			cols: 2,
			desc: __('Upload your company logo for invoices', 'multivendorx'),
			proSetting: true,
			moduleEnabled: 'invoice',
		},
		{
			key: 'company_logo',
			row: false,
			type: 'attachment',
			size: 'small',
			cols: 2,
			label: __('Invoice signature', 'multivendorx'),
			desc: __(
				'Optional signature image that adds authenticity to your invoices.',
				'multivendorx'
			),
			proSetting: true,
			moduleEnabled: 'invoice',
		},
		{
			key: 'separator_content',
			type: 'section',
			title: __('Invoice Content Controls', 'multivendorx'),
		},
		{
			key: 'seller_agreement',
			type: 'textarea',
			row: false,
			cols: 2,
			label: __('Invoice footer text', 'multivendorx'),
		},
		{
			key: 'seller_agreement',
			type: 'textarea',
			row: false,
			cols: 2,
			label: __('Terms and conditions', 'multivendorx'),
		},
		{
			key: 'separator_content',
			type: 'section',
			desc: __(
				'A4 is standard internationally, Letter is standard in North America',
				'multivendorx'
			),
			title: __('PDF format', 'multivendorx'),
		},
		{
			key: 'commission_type',
			type: 'choice-toggle',
			row: false,
			cols: 2,
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
				},
			],
		},
		{
			key: 'commission_type',
			type: 'choice-toggle',
			row: false,
			cols: 2,
			label: __('Orientation', 'multivendorx'),
			moduleEnabled: 'invoice',
			options: [
				{
					key: 'per_transaction',
					label: __('Portrait (Vertical)', 'multivendorx'),
					value: 'per_transaction',
				},
				{
					key: 'per_unit',
					label: __('Landscape (Horizontal)', 'multivendorx'),
					value: 'per_unit',
				},
			],
		},
		{
			key: 'separator_content',
			type: 'section',
			desc: __('Used only during order fulfillment.', 'multivendorx'),
			title: __('Packing slips', 'multivendorx'),
		},
		{
			key: 'packing_slips',
			type: 'checkbox',
			row: false,
			label: __('Packing slip settings', 'multivendorx'),
			desc: __('Configure packing slip display options', 'multivendorx'),
			options: [
				{
					key: 'include_prices',
					label: __(
						'Include prices on packing slips',
						'multivendorx'
					),
					desc: __(
						'Show item prices on packing slips',
						'multivendorx'
					),
					value: 'include_prices',
				},
				{
					key: 'use_store_address',
					label: __('Use store address', 'multivendorx'),
					desc: __(
						'Use store address instead of marketplace address',
						'multivendorx'
					),
					value: 'use_store_address',
				},
			],
			moduleEnabled: 'invoice',
			proSetting: true,
			selectDeselect: true,
		},
		{
			key: 'separator_content',
			type: 'section',
			wrapperClass: 'bg-color',
			desc: __(
				'Choose when and how invoices are automatically emailed to customers and vendors.',
				'multivendorx'
			),
			title: __(' Invoice', 'multivendorx'),
		},
		{
			key: 'separator_content',
			type: 'section',
			desc: __(
				'Choose when and how invoices are automatically emailed to customers and vendors.',
				'multivendorx'
			),
			title: __('Customer Invoice', 'multivendorx'),
		},

		{
			key: 'test',
			type: 'tab',
			tabs: [
				{
					label: 'Customer Invoice',
					content: [
						{
							key: 'invoice_template',
							type: 'color-setting',
							label: __('Templates and design', 'multivendorx'),
							classes: 'full-width',
							moduleEnabled: 'invoice',
							showPdfButton: true,
							templates: applyFilters(
								'multivendorx_invoice_templates',
								[
									{
										key: 'customer_invoice1',
										label: __(
											'Customer Invoice',
											'multivendorx'
										),
										preview: CustomerInvoice1,
										component: CustomerInvoice1,
										pdf: CustomerInvoice1,
									},
								]
							),
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
									label: 'Black Diamond',
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
					],
				},
				{
					label: 'Admin Commission',
					content: [
						{
							key: 'invoice_template_builder',
							type: 'color-setting',
							label: __('Templates and design', 'multivendorx'),
							classes: 'full-width',
							moduleEnabled: 'invoice',
							showPdfButton: true,
							templates: applyFilters(
								'multivendorx_invoice_templates',
								[
									{
										key: 'customer_invoice1',
										label: __(
											'Customer Invoice',
											'multivendorx'
										),
										preview: subscriptionInvoice1,
										component: subscriptionInvoice1,
										pdf: subscriptionInvoice1,
									},
								]
							),
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
									label: 'Black Diamond',
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
					],
				},
				{
					label: 'Membership',
					content: [
						{
							key: 'invoice_template_builder',
							type: 'color-setting',
							label: __('Templates and design', 'multivendorx'),
							classes: 'full-width',
							moduleEnabled: 'invoice',
							showPdfButton: true,
							templates: applyFilters(
								'multivendorx_invoice_templates',
								[
									{
										key: 'customer_invoice1',
										label: __(
											'Customer Invoice',
											'multivendorx'
										),
										preview: adminInvoice1,
										component: adminInvoice1,
										pdf: adminInvoice1,
									},
								]
							),
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
									label: 'Black Diamond',
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
					],
				},
				{
					label: 'Packing Slip',
					content: [
						{
							key: 'invoice_template_builder',
							type: 'color-setting',
							label: __('Templates and design', 'multivendorx'),
							classes: 'full-width',
							moduleEnabled: 'invoice',
							showPdfButton: true,
							templates: applyFilters(
								'multivendorx_invoice_templates',
								[
									{
										key: 'customer_invoice1',
										label: __(
											'Customer Invoice',
											'multivendorx'
										),
										preview: packingSlip1,
										component: packingSlip1,
										pdf: packingSlip1,
									},
								]
							),
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
									label: 'Black Diamond',
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
					],
				},
			],
		},
	],
};
