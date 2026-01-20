import { __ } from '@wordpress/i18n';
import DashboardTemplate from '../../../assets/template/Dashbord';
import InvoiceDOM from '../../../assets/template/Invoice.dom';
import InvoicePDF from '../../../assets/template/Invoice.pdf';

import Invoice1 from '../../../assets/template/pdf/Invoice-1';
import InvoiceHtml1 from '../../../assets/template/html/Invoice-1';

import InvoicePdf2 from '../../../assets/template/pdf/Invoice-2';
import InvoiceHtml2 from '../../../assets/template/html/Invoice-2';

import InvoicePdf3 from '../../../assets/template/pdf/Invoice-3';
import InvoiceHtml3 from '../../../assets/template/html/Invoice-3';

import InvoicePdf4 from '../../../assets/template/pdf/Invoice-4';
import InvoiceHtml4 from '../../../assets/template/html/Invoice-4';
// import InvoicePdf4 from '../../../assets/template/pdf/Invoice-4';
import InvoiceHtml5 from '../../../assets/template/html/Invoice-5';



export default {
	id: 'store-invoice',
	priority: 6,
	name: __('Invoices', 'mvx-pro'),
	desc: __(
		'Set up when and how invoices are generated in your marketplace.',
		'mvx-pro'
	),
	icon: 'adminfont-invoice',
	submitUrl: 'settings',
	modal: [
		{
			key: 'mvx_tinymce_api_section',
			type: 'number',
			classes: 'vertical w-50',
			label: __('Invoice number format', 'multivendorx'),
			placeholder: 'Invoice number format',
			moduleEnabled: 'invoice',
			proSetting: true,
		},
		{
			key: 'mvx_tinymce_api_section',
			type: 'number',
			classes: 'vertical w-50',
			label: __('Starting invoice number', 'multivendorx'),
			placeholder: 'Starting invoice number',
			moduleEnabled: 'invoice',
			proSetting: true,
		},
		{
			key: 'commission_type',
			type: 'setting-toggle',
			label: __('Invoice PDF page size', 'multivendorx'),
			classes: 'vertical w-50',
			desc: __(
				'Choose the page size for generated invoice PDFs',
				'multivendorx'
			),
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
					key: 'per_store',
					label: __('Legal (8.5 × 14 in)', 'multivendorx'),
					value: 'per_store',
				},
			],
			proSetting: true,
		},
		{
			key: 'commission_type',
			type: 'setting-toggle',
			label: __('PDF layout orientation', 'multivendorx'),
			classes: 'vertical w-50',
			desc: __(
				'Choose whether invoices are generated in portrait or landscape mode',
				'multivendorx'
			),
			moduleEnabled: 'invoice',
			options: [
				{
					key: 'portrait',
					label: __('Portrait', 'multivendorx'),
					value: 'portrait',
				},
				{
					key: 'landscape',
					label: __('Landscape', 'multivendorx'),
					value: 'landscape',
				},
			],
			proSetting: true,
		},
		{
			key: 'type_options',
			type: 'checkbox',
			classes: 'vertical',
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
						'Attach invoices to order emails',
						'multivendorx'
					),
					value: 'virtual',
				},
				{
					key: 'Send Separate Invoice Email',
					label: __('Send separate invoice email', 'multivendorx'),
					value: 'downloadable',
				},
				{
					key: 'Notify Stores of Invoice Generation',
					label: __(
						'Notify stores when invoices are generated',
						'multivendorx'
					),
					value: 'downloadable',
				},
				{
					key: 'Generate Packing Slips',
					label: __('Generate packing slips', 'multivendorx'),
					value: 'downloadable',
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
			key: 'mvx_tinymce_api_section',
			type: 'number',
			classes: 'vertical w-50',
			label: __('GST number', 'multivendorx'),
			placeholder: 'Enter GST registration number',
			moduleEnabled: 'invoice',
			proSetting: true,
		},
		{
			key: 'mvx_tinymce_api_section',
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
			classes: 'vertical',
			type: 'file',
			label: __('Company logo', 'mvx-pro'),
			desc: __('Upload your company logo for invoices', 'mvx-pro'),
			size: 'small',
			proSetting: true,
			moduleEnabled: 'invoice',
		},
		{
			key: 'invoice_template_builder',
			type: 'color-setting',
			label: __('Invoice Template & PDF', 'mvx-pro'),
			moduleEnabled: 'invoice',
			showPdfButton: true,
			templates: [
			  {
				key: 'invoice_1',
				label: __('Invoice 1', 'mvx-pro'),
				preview: InvoiceHtml1,
				component: InvoiceHtml1,
				pdf: Invoice1,
			  },
			  {
				key: 'invoice_2',
				label: 'Invoice 2',
				preview: InvoiceHtml2,
				component: InvoiceHtml2,
				pdf: InvoicePdf2,
			  }	,
			  {
				key: 'invoice_3',
				label: 'Invoice 3',
				preview: InvoiceHtml3,
				component: InvoiceHtml3,
				pdf: InvoicePdf3,
			  }	,
			  {
				key: 'invoice_4',
				label: 'Invoice 4',
				preview: InvoiceHtml4,
				component: InvoiceHtml4,
				pdf: InvoicePdf4,
			  }	,
			   {
				key: 'invoice_5',
				label: 'Invoice 5',
				preview: InvoiceHtml5,
				component: InvoiceHtml5,
				pdf: InvoicePdf4,
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
		}		  
	],
};
