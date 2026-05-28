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
	PopupUI,
	useModules
} from 'zyra';
import ShowProPopup from '../../Popup/Popup';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import orderInvoiceDefault from '../../../assets/template/orderInvoice/Default';
import commissionDefault from '../../../assets/template/commission/Default';
import packingSlipDefault from '../../../assets/template/packingSlip/Default';

import axios from 'axios';
import { applyFilters } from '@wordpress/hooks';

const invoiceTaxDetailsField = {
	key: 'tax_details',
	type: 'expandable-panel',
	label: __('Tax details', 'multivendorx'),
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
			id: '1',
			label: __('VAT / Tax number', 'multivendorx'),
			desc: __('DE987654321', 'multivendorx'),
			isCustom: true,
			disableBtn: true,
		},
		{
			id: '2',
			label: __('Marketplace tax ID', 'multivendorx'),
			desc: __('GB123456789', 'multivendorx'),
			isCustom: true,
			disableBtn: true,
		},
		{
			id: '3',
			label: __('Marketplace registration number', 'multivendorx'),
			desc: __('GB123456789', 'multivendorx'),
			isCustom: true,
			disableBtn: true,
		},
		{
			id: '4',
			label: __('Company registration number', 'multivendorx'),
			desc: __('GB123456789', 'multivendorx'),
			isCustom: true,
			disableBtn: true,
		},
	],
	addNewBtn: true,
	addNewTemplate: {
		label: __('New Tax Detail', 'multivendorx'),
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
	customer: 'order_invoice_default',
	admin: 'commission_default',
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
	const [showProPopup, setShowProPopup] = useState(false);
	const [showModulePopup, setShowModulePopup] = useState(false);
	const { modules } = useModules();
	const defaultData = {
		invoice_order_status: [],
		packing_slip: [],
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
		const savedData = appLocalizer?.admin_settings?.invoices || {};

		// Helper function to ensure template has all required fields
		const ensureTemplateDefaults = (savedTemplate: any, defaultTemplate: any) => {
			if (!savedTemplate || typeof savedTemplate !== 'object') {
				return { ...defaultTemplate };
			}

			return {
				selectedPalette: savedTemplate.selectedPalette || defaultTemplate.selectedPalette,
				templateKey: savedTemplate.templateKey !== undefined
					? savedTemplate.templateKey
					: defaultTemplate.templateKey,
				colors: savedTemplate.colors && Object.keys(savedTemplate.colors).length > 0
					? savedTemplate.colors
					: defaultTemplate.colors,
			};
		};

		return {
			...defaultData,
			...savedData,
			...(appLocalizer?.admin_settings?.invoices || {}),
			// Ensure each template has proper defaults
			invoice_template: ensureTemplateDefaults(savedData.invoice_template, defaultData.invoice_template),
			admin_template: ensureTemplateDefaults(savedData.admin_template, defaultData.admin_template),
			membership_template: ensureTemplateDefaults(savedData.membership_template, defaultData.membership_template),
			packing_template: ensureTemplateDefaults(savedData.packing_template, defaultData.packing_template),
		};
	});

	const isPro = Boolean(appLocalizer?.khali_dabba);
	const handleChange = (key: string, value: any) => {
		if (!isPro) {
			setShowProPopup(true);
			return;
		}

		if (isPro && !modules.includes('invoice')) {
			setShowModulePopup(true);
			return;
		}
		const normalizedValue = value?.target?.value || value;
		let updated;
		if (
			[
				'invoice_template',
				'admin_template',
				'membership_template',
				'packing_template',
			].includes(key)
		) {
			updated = {
				...formData,
				[key]: {
					...formData[key],
					...normalizedValue,
				},
			};
		} else {
			updated = {
				...formData,
				[key]: normalizedValue,
			};
		}
		setFormData(updated);
		autoSave(updated);
	};

	const displayCustomOrder = appLocalizer?.admin_settings?.overview?.display_customer_order;

	return (
		<Container className="settings-card">
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
								label: __('Order Invoice', 'multivendorx'),
								content: (
									<ColorSettingInputUI
										key={formData.invoice_template?.templateKey}
										filedKey="invoice_template"
										wrapperClass="form-group-color-setting"
										inputClass="setting-form-input"
										templateSelector={true}
										idPrefix="color-setting-customer"
										templates={applyFilters(
											'multivendorx_order_invoice',
											[
												{
													key: 'order_invoice_default',
													label: 'Default',
													preview: orderInvoiceDefault,
													component: orderInvoiceDefault,
													pdf: orderInvoiceDefault,
												},
												{
													key: 'stark_white',
													label: 'Stark White',
													preview: orderInvoiceDefault,
													component: orderInvoiceDefault,
													pdf: orderInvoiceDefault,
												},
												{
													key: 'mono_slate',
													label: 'Mono Slate',
													preview: orderInvoiceDefault,
													component: orderInvoiceDefault,
													pdf: orderInvoiceDefault,
												},
												{
													key: 'linear_space',
													label: 'Linear Space',
													preview: orderInvoiceDefault,
													component: orderInvoiceDefault,
													pdf: orderInvoiceDefault,
												},
												{
													key: 'clay_outline',
													label: 'Clay Outline',
													preview: orderInvoiceDefault,
													component: orderInvoiceDefault,
													pdf: orderInvoiceDefault,
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
								label: __('Commission', 'multivendorx'),
								content: (
									<ColorSettingInputUI
										key={formData.admin_template?.templateKey}
										filedKey="admin_template"
										wrapperClass="form-group-color-setting"
										inputClass="setting-form-input"
										templateSelector={true}
										idPrefix="color-setting-admin"
										templates={applyFilters(
											'multivendorx_commission_invoice',
											[
												{
													key: 'commission_default',
													label: 'Default',
													preview: commissionDefault,
													component: commissionDefault,
													pdf: commissionDefault,
												},
												{
													key: 'metro_desk',
													label: 'Metro Desk',
													preview: commissionDefault,
													component: commissionDefault,
													pdf: commissionDefault,
												},
												{
													key: 'urban_ledger',
													label: 'Urban Ledger',
													preview: commissionDefault,
													component: commissionDefault,
													pdf: commissionDefault,
												},
												{
													key: 'premium',
													label: 'Premium',
													preview: commissionDefault,
													component: commissionDefault,
													pdf: commissionDefault,
												},
											]
										)}
										predefinedOptions={COLOR_PALETTES}
										value={formData.admin_template}
										onChange={(val) => {
											handleChange('admin_template', val);
										}}
									/>
								),
							},
							{
								label: __('Packing Slip', 'multivendorx'),
								content: (
									<ColorSettingInputUI
										key={formData.packing_template?.templateKey}
										filedKey="packing_template"
										wrapperClass="form-group-color-setting"
										inputClass="setting-form-input"
										templateSelector={true}
										idPrefix="color-setting-packing"
										templates={applyFilters(
											'multivendorx_packing_slip_invoice',
											[
												{
													key: 'packing_slip_default',
													label: 'Default',
													preview: packingSlipDefault,
													component: packingSlipDefault,
													pdf: packingSlipDefault,
												},
												{
													key: 'stark_white',
													label: 'Studio Brief',
													preview: packingSlipDefault,
													component: packingSlipDefault,
													pdf: packingSlipDefault,
												},
												{
													key: 'urban_ledger',
													label: 'Urban Ledger',
													preview: packingSlipDefault,
													component: packingSlipDefault,
													pdf: packingSlipDefault,
												},
												{
													key: 'clay_outline',
													label: 'Clay Outline',
													preview: packingSlipDefault,
													component: packingSlipDefault,
													pdf: packingSlipDefault,
												},
											]
										)}
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
					{isPro &&
						!modules.includes('invoice') && (
							<span className="admin-pro-tag module">
								<i
									className={`adminfont-invoice`}
								/>
								{__('Invoice', 'multivendorx')}
								<i className="adminfont-lock" />
							</span>
						)}
					{!isPro && (
						<span className="admin-pro-tag">
							<i className="adminfont-pro-tag"></i>{__('Pro', 'multivendorx')}
						</span>
					)}
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

						{displayCustomOrder == 'main_sub' && (
							<FormGroup
								cols={6}
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
						)}
						<FormGroup
							label={__(
								'Generate invoice when order status becomes',
								'multivendorx'
							)}
						>
							<MultiCheckBoxUI
								selectDeselect={true}
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
								value={formData.invoice_order_status}
								modules={[]} // required prop
								onChange={(val: string[]) =>
									handleChange('invoice_order_status', val)
								}
								onMultiSelectDeselectChange={(val: string[]) =>
									handleChange('invoice_order_status', val)
								}
							/>
						</FormGroup>
					</FormGroupWrapper>
				</Card>
				<Card title={__('Packing slip generator', 'multivendorx')}>
					<FormGroupWrapper>
						<FormGroup
							cols={6}
							label={__(
								'What appears on packing slips',
								'multivendorx'
							)}
						>
							<MultiCheckBoxUI
								selectDeselect={true}
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
								value={formData.packing_slip}
								modules={[]}
								onChange={(val: string[]) =>
									handleChange('packing_slip', val)
								}
								onMultiSelectDeselectChange={(val: string[]) =>
									handleChange('packing_slip', val)
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
										key: 'per-order',
										value: 'per-order',
										label: __('Per order', 'multivendorx'),
									},
									{
										key: 'monthly',
										value: 'monthly',
										label: __('Monthly', 'multivendorx'),
									},
								]}
								value={
									formData.invoice_commission_basis ||
									'per-order'
								}
								onChange={(val) =>
									handleChange('invoice_commission_basis', val)
								}
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
							<TextAreaUI
								name="invoice_terms"
								value={formData.invoice_terms || ''}
								onChange={(val) =>
									handleChange('invoice_terms', val)
								}
							/>
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
								name={invoiceTaxDetailsField.key}
								methods={invoiceTaxDetailsField.modal}
								value={formData.invoice_tax_details || []}
								onChange={(val) => handleChange('invoice_tax_details', val)}
								canAccess={true}
								min={invoiceTaxDetailsField.min}
								addNewBtn={invoiceTaxDetailsField.addNewBtn}
								editTitleShow={true}
								addNewTemplate={invoiceTaxDetailsField.addNewTemplate}
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
							cols={6}
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
								imageSrc={formData?.invoice_logo || ''}
								onChange={(img) => {
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

			{showProPopup && (
				<PopupUI
					position="lightbox"
					open={showProPopup}
					onClose={() => setShowProPopup(false)}
					width={31.25}
					height="auto"
				>
					<ShowProPopup />
				</PopupUI>
			)}
			{showModulePopup && (
				<PopupUI
					position="lightbox"
					open={showModulePopup}
					onClose={() => setShowModulePopup(false)}
					width={31.25}
					height="auto"
				>
					<ShowProPopup
						moduleName='invoice'
					/>
				</PopupUI>
			)}
		</Container>
	);
};

export default Invoice;