import {
	BasicInputUI,
	Card,
	ChoiceToggleUI,
	ColorSettingInputUI,
	Column,
	Container,
	ExpandablePanelUI,
	FileInputUI,
	FormGroup,
	FormGroupWrapper,
	MultiCheckBoxUI,
	TabsUI,
	TextAreaUI,
	NoticeManager,
	getApiLink,
} from 'zyra';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import Default from '../../../assets/template/customerInvoice/Default';
import adminCommissionDefault from '../../../assets/template/adminCommission/Default';
import membershipInvoiceDefault from '../../../assets/template/membershipInvoice/Default';
import packingSlipDefault from '../../../assets/template/packingSlip/Default';

import axios from 'axios';
import { applyFilters } from '@wordpress/hooks';

const ratingsField = {
	key: 'ratings_parameters',
	type: 'expandable-panel',
	label: __('Rating parameters', 'multivendorx'),
	settingDescription: __(
		'Define the key factors customers will use to evaluate each store.',
		'multivendorx'
	),
	min: 3,
	desc: __(
		'Give customers a fair way to share feedback! Define what they rate, like product/listing quality, delivery, or service. You’ll start with five default parameters that can be edited or removed, but make sure at least three stay active for balanced, detailed reviews.',
		'multivendorx'
	),
	modal: [
		{
			title: __('VAT / Tax number', 'multivendorx'),
			desc: __('DE987654321', 'multivendorx'),
			isCustom: true,
			disableBtn: true,
		},
		{
			title: __('Marketplace tax ID', 'multivendorx'),
			desc: __('GB123456789', 'multivendorx'),
			isCustom: true,
			disableBtn: true,
		},
		{
			title: __('Marketplace registration number', 'multivendorx'),
			desc: __('GB123456789', 'multivendorx'),
			isCustom: true,
			disableBtn: true,
		},
		{
			title: __('Company registration number', 'multivendorx'),
			desc: __('GB123456789', 'multivendorx'),
			isCustom: true,
			disableBtn: true,
		},
	],
	addNewBtn: true,
	addNewTemplate: {
		label: 'New Rating Parameters',
		editableFields: {
			title: true,
			description: true,
			disableBtn: true,
			isCustom: true,
		},
	},
};

const COLOR_PALETTES = [
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
];

// Default color palette for new installations
const DEFAULT_COLOR_PALETTE = 'orchid_bloom';

// Get default colors for a palette
const getDefaultColors = (paletteKey = DEFAULT_COLOR_PALETTE) => {
	const palette = COLOR_PALETTES.find(p => p.key === paletteKey);
	return palette ? palette.colors : COLOR_PALETTES[0].colors;
};

// Default templates for each invoice type
const DEFAULT_TEMPLATES = {
	customer: 'customer_invoice_default',
	admin: 'admin_commission_default',
	membership: 'membership_invoice_default',
	packing: 'packing_slip_default',
};

const autoSave = (updatedData: Record<string, unknown>) => {
	axios({
		method: 'POST',
		url: getApiLink(appLocalizer, 'settings'),
		headers: { 'X-WP-Nonce': appLocalizer.nonce },
		data: {
			setting: updatedData,
			settingName: 'invoices',
		},
	})
		.then((res) => {
			NoticeManager.add({
				title: __('Great!', 'multivendorx'),
				message: __('Settings saved', 'multivendorx'),
				type: 'success',
				position: 'float',
			});
		})
		.catch((err) => {
			console.error('SAVE ERROR:', err);
		});
};

const Invoice: React.FC = () => {
	const defaultData = {
		paymentCapability: [],
		PackingSlip: [],
		invoice_prefix: '',
		invoice_footer: '',
		value: {
			quality: { enable: true },
			delivery: { enable: true },
			service: { enable: true },
		},
		// Customer invoice template (default)
		invoice_template: {
			selectedPalette: DEFAULT_COLOR_PALETTE,
			colors: getDefaultColors(DEFAULT_COLOR_PALETTE),
			templateKey: DEFAULT_TEMPLATES.customer,
		},
		// Admin commission template (default)
		admin_template: {
			selectedPalette: DEFAULT_COLOR_PALETTE,
			colors: getDefaultColors(DEFAULT_COLOR_PALETTE),
			templateKey: DEFAULT_TEMPLATES.admin,
		},
		// Membership template (default)
		membership_template: {
			selectedPalette: DEFAULT_COLOR_PALETTE,
			colors: getDefaultColors(DEFAULT_COLOR_PALETTE),
			templateKey: DEFAULT_TEMPLATES.membership,
		},
		// Packing slip template (default)
		packing_template: {
			selectedPalette: DEFAULT_COLOR_PALETTE,
			colors: getDefaultColors(DEFAULT_COLOR_PALETTE),
			templateKey: DEFAULT_TEMPLATES.packing,
		},
	};

	const [formData, setFormData] = useState(() => {
		const savedData = appLocalizer?.settings_databases_value?.invoices || {};
		
		// Helper function to ensure template has all required fields
		const ensureTemplateDefaults = (savedTemplate: any, defaultTemplate: any) => {
			if (!savedTemplate || typeof savedTemplate !== 'object') {
				return { ...defaultTemplate };
			}
			
			return {
				selectedPalette: savedTemplate.selectedPalette || defaultTemplate.selectedPalette,
				templateKey: savedTemplate.templateKey || defaultTemplate.templateKey,
				colors: savedTemplate.colors && Object.keys(savedTemplate.colors).length > 0 
					? savedTemplate.colors 
					: defaultTemplate.colors,
			};
		};
		
		return {
			...(appLocalizer?.settings_databases_value?.invoices || {}),
			...defaultData,
			...savedData,
			// Ensure each template has proper defaults
			invoice_template: ensureTemplateDefaults(savedData.invoice_template, defaultData.invoice_template),
			admin_template: ensureTemplateDefaults(savedData.admin_template, defaultData.admin_template),
			membership_template: ensureTemplateDefaults(savedData.membership_template, defaultData.membership_template),
			packing_template: ensureTemplateDefaults(savedData.packing_template, defaultData.packing_template),
		};
	});

	const handleChange = (key: string, value: any) => {
		const updated = { ...formData, [key]: value };
		setFormData(updated);
		autoSave(updated);
	};

	return (
		<Container className="notice-settings">
			<Column>
				<Card
					title={__('Invoice preview', 'multivendorx')}
					desc={__(
						'Preview how the invoice layout will appear to customers and stores',
						'multivendorx'
					)}
				>
					<TabsUI
						tabs={[
							{
								label: __('Customer Invoice', 'multivendorx'),
								content: (
									<ColorSettingInputUI
										filedKey="invoice_template"
										wrapperClass="form-group-color-setting"
										inputClass="setting-form-input"
										templateSelector={true}
										showPdfButton={true}
										idPrefix="color-setting-customer"
										templates={applyFilters(
											'multivendorx_invoice_templates',
											[
												{
													key: 'customer_invoice_default',
													label: 'Default',
													preview: Default,
													component: Default,
													pdf: Default,
												},
											]
										)}
										predefinedOptions={COLOR_PALETTES}
										value={formData.invoice_template}
										onChange={(val) => {
											handleChange('invoice_template', val);
										}}
									/>
								),
							},
							{
								label: __('Admin Commission', 'multivendorx'),
								content: (
									<ColorSettingInputUI
										filedKey="admin_template"
										wrapperClass="form-group-color-setting"
										inputClass="setting-form-input"
										templateSelector={true}
										showPdfButton={true}
										idPrefix="color-setting-admin"
										templates={[
											{
												key: 'admin_commission_default',
												label: 'Admin Commission Default',
												preview: adminCommissionDefault,
												component: adminCommissionDefault,
												pdf: adminCommissionDefault,
											},
										]}
										predefinedOptions={COLOR_PALETTES}
										value={formData.admin_template}
										onChange={(val) => {
											handleChange('admin_template', val);
										}}
									/>
								),
							},
							{
								label: __('Membership', 'multivendorx'),
								content: (
									<ColorSettingInputUI
										filedKey="membership_template"
										wrapperClass="form-group-color-setting"
										inputClass="setting-form-input"
										templateSelector={true}
										showPdfButton={true}
										idPrefix="color-setting-membership"
										templates={[
											{
												key: 'membership_invoice_default',
												label: 'Membership Invoice Default',
												preview: membershipInvoiceDefault,
												component: membershipInvoiceDefault,
												pdf: membershipInvoiceDefault,
											},
										]}
										predefinedOptions={COLOR_PALETTES}
										value={formData.membership_template}
										onChange={(val) => {
											handleChange('membership_template', val);
										}}
									/>
								),
							},
							{
								label: __('Packing Slip', 'multivendorx'),
								content: (
									<ColorSettingInputUI
										filedKey="packing_template"
										wrapperClass="form-group-color-setting"
										inputClass="setting-form-input"
										templateSelector={true}
										showPdfButton={true} 
										idPrefix="color-setting-packing"
										templates={[
											{
												key: 'packing_slip_default',
												label: 'Packing Slip Default',
												preview: packingSlipDefault,
												component: packingSlipDefault,
												pdf: packingSlipDefault,
											},
										]}
										predefinedOptions={COLOR_PALETTES}
										value={formData.packing_template}
										onChange={(val) => {
											handleChange('packing_template', val);
										}}
									/>
								),
							},
						]}
					/>
				</Card>
			</Column>
			<Column grid={8}>
				<Card
					title={__('Customer invoice', 'multivendorx')}
					desc={__(
						'Define when invoices should be automatically created and how they are delivered to customers.',
						'multivendorx'
					)}
				>
					<FormGroupWrapper>
						<FormGroup
							cols={2}
							label={__(
								'Invoices will be created based on',
								'multivendorx'
							)}
						>
							<ChoiceToggleUI
								options={[
									{
										key: 'main-order',
										value: 'main-order',
										label: __('Main order', 'multivendorx'),
									},
									{
										key: 'sub-order',
										value: 'sub-order',
										label: __(
											'Store sub-order',
											'multivendorx'
										),
									},
								]}
								value={
									formData.invoice_creation_basis ||
									'main-order'
								}
								onChange={(val) =>
									handleChange('invoice_creation_basis', val)
								}
							/>
						</FormGroup>
						<FormGroup
							label={__(
								'Generate invoice when order status becomes',
								'multivendorx'
							)}
						>
							<MultiCheckBoxUI
								selectDeselect={true}
								wrapperClass="checkbox-list-side-by-side"
								inputInnerWrapperClass="default-checkbox"
								inputClass={'basic-checkbox'}
								options={[
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
										desc: __(
											'Payment has been confirmed.',
											'multivendorx'
										),
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
										label: __(
											'Pending Payment',
											'multivendorx'
										),
										value: 'pending-payment',
										desc: __(
											'Order created but awaiting payment (useful for bank transfers, checks)',
											'multivendorx'
										),
									},
								]}
								value={formData.paymentCapability}
								modules={[]} // required prop
								onChange={(val: string[]) =>
									handleChange('paymentCapability', val)
								}
								onMultiSelectDeselectChange={(val: string[]) =>
									handleChange('paymentCapability', val)
								}
							/>
						</FormGroup>
					</FormGroupWrapper>
				</Card>
				<Card title={__('Packing slip generator', 'multivendorx')}>
					<FormGroupWrapper>
						<FormGroup
							cols={2}
							label={__(
								'What appears on packing slips',
								'multivendorx'
							)}
						>
							<MultiCheckBoxUI
								selectDeselect={true}
								wrapperClass="checkbox-list-side-by-side"
								inputInnerWrapperClass="default-checkbox"
								inputClass={'basic-checkbox'}
								options={[
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
										label: __(
											'Use store address',
											'multivendorx'
										),
										desc: __(
											'Use store address instead of marketplace address',
											'multivendorx'
										),
										value: 'use_store_address',
									},
								]}
								value={formData.PackingSlip}
								modules={[]}
								onChange={(val: string[]) =>
									handleChange('PackingSlip', val)
								}
								onMultiSelectDeselectChange={(val: string[]) =>
									handleChange('PackingSlip', val)
								}
							/>
						</FormGroup>
					</FormGroupWrapper>
				</Card>
				<Card title={__('Store commission invoices', 'multivendorx')}>
					<FormGroupWrapper>
						<FormGroup
							label="Commission invoices will be issued"
							desc={__(
								'Choose how often store receive commission invoices from the marketplace:<ul><li>Per order - Generate a commission invoice for each order.</li><li>Monthly - Generate a single consolidated commission invoice at the end of each month.</li></ul>',
								'multivendorx'
							)}
						>
							<ChoiceToggleUI
								options={[
									{
										key: 'public',
										value: 'public',
										label: __('Per order', 'multivendorx'),
									},
									{
										key: 'private',
										value: 'private',
										label: __('Monthly', 'multivendorx'),
									},
								]}
							/>
						</FormGroup>
					</FormGroupWrapper>
				</Card>

				<Card
					title={__(
						'Invoices will include these additional notes',
						'multivendorx'
					)}
					desc={__(
						'Customize additional text that appears on the invoice document when customers download it.',
						'multivendorx'
					)}
				>
					<FormGroupWrapper>
						<FormGroup
							label={__('Invoice footer text', 'multivendorx')}
						>
							<TextAreaUI
								name="invoice_footer"
								value={formData.invoice_footer || ''}
								onChange={(val) =>
									handleChange('invoice_footer', val)
								}
							/>
						</FormGroup>
						<FormGroup
							label={__('Terms and conditions', 'multivendorx')}
						>
							<TextAreaUI name="content" />
						</FormGroup>
					</FormGroupWrapper>
				</Card>
			</Column>

			<Column grid={4}>
				<Card
					title={__(
						'Invoices will display these tax details',
						'multivendorx'
					)}
				>
					<FormGroupWrapper>
						<FormGroup
							desc={__(
								'Choose which tax details invoices can include. <br> <b> For each field you enable: </b> <br> <ul> <li>Stores can enter their own value for their invoices. </li> <li>You can enter the marketplace value for marketplace invoices. </li> </ul> <b> How the values appear: </b><br>  <ul><li> Main order invoices show the marketplace value entered here. </li> <li> Store order invoices show the value provided by the store.</li> </ul>',
								'multivendorx'
							)}
						>
							<ExpandablePanelUI
								name={ratingsField.key}
								methods={ratingsField.modal}
								value={formData.invoice_tax_details || []}
								onChange={(val) => handleChange('invoice_tax_details', val)}
								canAccess={true}
								min={ratingsField.min}
								addNewBtn={ratingsField.addNewBtn}
								editTitleShow={true}
								addNewTemplate={ratingsField.addNewTemplate}
							/>
						</FormGroup>
					</FormGroupWrapper>
				</Card>
				<Card
					title={__('Invoices PDF format', 'multivendorx')}
					desc={__(
						'Configure the layout and numbering format used for all generated invoices.',
						'multivendorx'
					)}
				>
					<FormGroupWrapper>
						<FormGroup label="Page size">
							<ChoiceToggleUI
								options={[
									{
										key: 'a4',
										value: 'a4',
										label: __('A4 (210 × 297 mm)', 'multivendorx'),
									},
									{
										key: 'letter',
										value: 'letter',
										label: __('Letter (8.5 × 11 in)', 'multivendorx'),
									},
									{
										key: 'legal',
										value: 'legal',
										label: __('Legal (8.5 × 14 in)', 'multivendorx'),
									},
								]}
								value={formData.page_size || 'a4'}
								onChange={(val) => handleChange('page_size', val)}
							/>
						</FormGroup>
						<FormGroup label="Orientation">
							<ChoiceToggleUI
								options={[
									{
										key: 'portrait',
										value: 'portrait',
										label: __(
											'Portrait (Vertical)',
											'multivendorx'
										),
									},
									{
										key: 'landscape',
										value: 'landscape',
										label: __(
											'Landscape (Horizontal)',
											'multivendorx'
										),
									},
								]}
								value={formData.orientation || 'portrait'}
								onChange={(val) => handleChange('orientation', val)}
							/>
						</FormGroup>
						<FormGroup
							cols={2}
							label="Invoice numbers will include this prefix"
							desc={__(
								'<b>Example results:</b> INV-2026-0001, INV-ORD-0001',
								'multivendorx'
							)}
						>
							<BasicInputUI
								name="invoice_prefix"
								value={formData.invoice_prefix || ''}
								onChange={(val) =>
									handleChange('invoice_prefix', val)
								}
								placeholder={__(
									'Enter invoice prefix',
									'multivendorx'
								)}
							/>
						</FormGroup>
					</FormGroupWrapper>
				</Card>
				<Card
					title={__(
						'Invoice branding: logo & signature',
						'multivendorx'
					)}
				>
					<FormGroupWrapper>
						<FormGroup
							label="Company logo"
							desc={__('Upload your company logo', 'multivendorx')}
						>
							<FileInputUI
							imageSrc={formData?.invoice_logo|| ''}
							onChange={(img)=>{
								handleChange('invoice_logo', img);
							}}
							/>
						</FormGroup>
						<FormGroup
							label="Invoice signature"
							desc={__('Upload invoice signature', 'multivendorx')}
						>
							<FileInputUI
								imageSrc={formData?.invoice_signature|| ''}
								onChange={(img)=>{
									handleChange('invoice_signature', img);
								}}
							/>	
						</FormGroup>
					</FormGroupWrapper>
				</Card>
			</Column>
		</Container>
	);
};

export default Invoice;