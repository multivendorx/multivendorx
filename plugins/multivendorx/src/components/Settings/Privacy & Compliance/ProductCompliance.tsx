import { getApiLink } from '@zyra/core';
import {
	FormGroup,
	FormGroupWrapper,
	SectionUI,
	NoticeManager,
} from '@zyra/primitives';
import { ChoiceToggleUI, ExpandablePanelUI, SelectInputUI } from '@zyra/inputs';
import { __ } from '@wordpress/i18n';
import { useState, useCallback, useMemo } from 'react';
import axios from 'axios';

const autoSave = (updatedData: Record<string, unknown>) => {
	axios({
		method: 'POST',
		url: getApiLink(appLocalizer, 'settings'),
		headers: { 'X-WP-Nonce': appLocalizer.nonce },
		data: {
			setting: updatedData,
			settingName: 'product_compliance',
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

const ProductCompliance: React.FC = () => {
	const [expandableKey, setExpandableKey] = useState(Date.now());

	const defaultData = {
		safety_compliance_categories: {},
		trigger_words: [],
		trigger_action: 'draft',
	};

	const [formData, setFormData] = useState(() => {
		return {
			...defaultData,
			...(appLocalizer?.admin_settings?.[
				'product-compliance'
			] || {}),
		};
	});
	const value = formData.safety_compliance_categories || {};

	const handleChange = (key: string, value: any) => {
		const updated = { ...formData, [key]: value };
		setFormData(updated);
		autoSave(updated);
	};

	// Existing tags (would come from API)
	const existingTags = [
		{ name: 'electronics' },
		{ name: 'clothing' },
		{ name: 'food' },
	];

	// Generate unique ID for new items
	const generateUniqueId = () => {
		return 'item_' + Math.random().toString(36).substr(2, 9);
	};

	const productOptions = [
		{ label: 'Electronics', value: 'electronics' },
		{ label: 'Clothing', value: 'clothing' },
		{ label: 'Books', value: 'books' },
		{ label: 'Furniture', value: 'furniture' },
	];

	const getAllProductMethods = useMemo(() => {
		return Object.keys(value).map((key) => ({
			id: key,
			icon: 'single-product',
			label: value[key]?.product_name || key,
			isCustom: true,
			desc: `Configuration for ${value[key]?.product_name || key}`,
			formFields: [
				{
					key: 'hold_listing',
					type: 'choice-toggle',
					label: __('Hold listing until reviewed', 'multivendorx'),
					desc: __(
						'Require review for food & health products',
						'multivendorx'
					),
					options: [
						{
							key: 'draft_product',
							label: __('Draft Product', 'multivendorx'),
							value: 'draft_product',
						},
						{
							key: 'notify_admin_only',
							label: __('Notify Admin Only', 'multivendorx'),
							value: 'notify_admin_only',
						},
					],
					look: 'toggle',
				},
				{
					key: 'electronics_required_documents',
					type: 'creatable-multi',
					label: __('Required documents from seller', 'multivendorx'),
					size: '30%',
					options: [
						{
							value: 'invoice',
							label: __('Invoice', 'multivendorx'),
						},
						{
							value: 'warranty_certificate',
							label: __('Warranty Certificate', 'multivendorx'),
						},
						{
							value: 'safety_compliance',
							label: __('Safety Compliance', 'multivendorx'),
						},
					],
					placeholder: __('Type document name…', 'multivendorx'),
					formatCreateLabel: (val) => `Add "${val}"`,
				},
			],
		}));
	}, [value]);

	const addNewProductCategory = useCallback(
		(selectedValue) => {
			if (!selectedValue) {
				return;
			}

			const product = productOptions.find(
				(p) => p.value === selectedValue
			);
			if (!product) {
				return;
			}

			// Check if product already exists
			const alreadyExists = Object.values(value).some(
				(v) => v.product_id === product.value
			);

			if (alreadyExists) {
				return;
			}

			handleChange('safety_compliance_categories', {
				...formData.safety_compliance_categories,
				[product.value]: {
					enable: true,
					product_id: product.value,
					product_name: product.label,
					hold_listing: 'draft_product',
					electronics_required_documents: [],
				},
			});

			setExpandableKey(Date.now());
		},
		[value, productOptions]
	);

	const availableOptions = useMemo(() => {
		const addedProductIds = Object.values(value).map((v) => v.product_id);

		return [
			{
				label: __('Select a category to prohibit', 'multivendorx'),
				value: '',
			},
			...productOptions
				.filter((option) => !addedProductIds.includes(option.value))
				.map((p) => ({
					label: p.label,
					value: p.value,
				})),
		];
	}, [value, productOptions]);

	return (
		<>
			<FormGroupWrapper>
				<FormGroup>
                    <ExpandablePanelUI
                        name="prohibited_product_categories"
                        methods={ratingsField.modal}
                        value={formData.prohibited_product_categories || {}}
                        onChange={(val) => handleChange('prohibited_product_categories', val)}
                        canAccess={true}
                        addNewBtn={true}
                        addNewTemplate={ratingsField.addNewTemplate}
                    />
                </FormGroup>

                <SectionUI
                    title={__('Trigger words', 'multivendorx')}
                    desc={__('When a listing contains these words, the system flags it', 'multivendorx')}
                />

                <FormGroup row label={__('Trigger words', 'multivendorx')}>
                    <SelectInputUI
                        type="creatable-multi"
                        options={existingTags.map((tag) => ({
                            value: tag.name,
                            label: tag.name,
                        }))}
                        size="100%"
                        value={formData.trigger_words}
                        onChange={(list) => handleChange('trigger_words', list || [])}
                        placeholder={__('Type tag…', 'multivendorx')}
                        formatCreateLabel={(val) => `Add "${val}"`}
                        size="15rem"
                    />
                </FormGroup>

                <FormGroup row label={__('When triggered:', 'multivendorx')}>
                    <ChoiceToggleUI
                        options={[
                            {
                                key: 'draft',
                                value: 'draft',
                                label: __('Hold for approval', 'multivendorx'),
                            },
                            {
                                key: 'pending',
                                value: 'pending',
                                label: __('Notify only', 'multivendorx'),
                            },
                        ]}
                        value={formData.trigger_action}
                        onChange={(val) => handleChange('trigger_action', val)}
                    />
                </FormGroup>

                <SectionUI
                    title={__('Safety & compliance', 'multivendorx')}
                    desc={__('For each product category, decide whether listings should be held for your review or just notify you. You can also require sellers to upload specific documents.', 'multivendorx')}
                />

                <FormGroup row label={__('Add Category', 'multivendorx')}>
                    <SelectInputUI
                        name="product_select"
                        type="single-select"
                        size="15rem"
                        options={availableOptions}
                        onChange={(selected) => {
                            if (selected) {
                                addNewProductCategory(selected);
                            }
                        }}
                    />
                </FormGroup>

                <FormGroup>
                    <ExpandablePanelUI
                        key={expandableKey}
                        name="safety_compliance_categories"
                        methods={getAllProductMethods || []}
                        value={formData.safety_compliance_categories || []}
                        onChange={(val) => handleChange('safety_compliance_categories', val)}
                        canAccess={true}
                        addNewBtn={false}
                    />
                </FormGroup>

                <SectionUI
                    title={__('Product Report Abuse', 'multivendorx')}
                    desc={__('Set rules and options for product abuse reporting.', 'multivendorx')}
                />

                <FormGroup row
                    label={__('Who can report', 'multivendorx')}
                    labelDes={__('Decide if only logged-in customers can submit abuse reports, or if reporting is open to everyone.', 'multivendorx')}
                    desc={__('<ul><li>logged-in customers - Only registered and logged-in customers can report products.This helps prevent spam and ensures accountability.</li><li>Anyone - Both logged-in customers and guests can report products. This gives the widest access but may increase the risk of spam submissions.</li></ul>', 'multivendorx')}>
                    <ChoiceToggleUI
                        options={[
                            {
                                key: 'logged_in',
                                label: __('logged-in customers', 'multivendorx'),
                                value: 'logged_in',
                            },
                            {
                                key: 'anyone',
                                label: __('Anyone', 'multivendorx'),
                                value: 'anyone',
                            },
                        ]}
                        value={formData.status}
                        onChange={(val: string) =>
                            handleChange('status', val)
                        }
                    />
                </FormGroup>
                <FormGroup row
                    label={__('Reasons for abuse report', 'multivendorx')}
                    labelDes={__('Define one or more preset reasons that stores can choose from when submitting an abuse report.', 'multivendorx')}
                    desc={__('<b>Note</b>: Users can report products for various issues. When enabling logged-in user restriction, anonymous reports will be blocked. Abuse reports are reviewed by administrators who can take appropriate action including product removal or store penalties.', 'multivendorx')}>

                    <ExpandablePanelUI
                        name="abuse_report_reasons"
                        methods={abuseReportReasons.modal || []}
                        value={formData.abuse_report_reasons || []}
                        onChange={(val) => handleChange('abuse_report_reasons', val)}
                        canAccess={true}
                        addNewBtn={true}
                        addNewTemplate={abuseReportReasons.addNewTemplate}
                    />
                </FormGroup>
            </FormGroupWrapper>
        </>
    );
};

// ratingsField definition outside component
const ratingsField = {
	key: 'prohibited_product_categories',
	type: 'expandable-panel',
	label: __('Prohibited product categories', 'multivendorx'),
	placeholder: __('Add prohibited product category', 'multivendorx'),
	settingDescription: __(
		'Define one or more product categories that are not allowed to be listed on your marketplace.',
		'multivendorx'
	),
	modal: [
		{
			id: 'product_image',
			label: 'Product Image',
			mandatory: true,
			formFields: [],
			desc: 'Confirms the store is legally registered as a business entity.',
		},
		{
			id: 'product_description',
			label: 'Product description',
			mandatory: true,
			formFields: [],
			desc: 'Validates that the store is authorized to operate and conduct business legally.',
		},
		{
			id: 'specifications',
			label: 'Specifications',
			formFields: [
				{
					key: 'show_on_frontend',
					type: 'checkbox',
					label: __('Display on Frontend', 'multivendorx'),
					options: [
						{
							key: 'show_on_frontend',
							value: 'show_on_frontend',
						},
					],
					look: 'toggle',
				},
			],
			desc: 'Confirms the store’s physical or operational business address.',
		},
		{
			id: 'manufacturer_importer_details',
			label: 'Manufacturer / importer details',
			formFields: [
				{
					key: 'show_on_frontend',
					type: 'checkbox',
					label: __('Display on Frontend', 'multivendorx'),
					options: [
						{
							key: 'show_on_frontend',
							value: 'show_on_frontend',
						},
					],
					look: 'toggle',
				},
			],
			desc: 'Confirms the store’s physical or operational business address.',
		},
		{
			id: 'ingredients_materials',
			label: 'Ingredients / materials',
			isCustom: true,
			formFields: [
				{
					key: 'show_on_frontend',
					type: 'checkbox',
					label: __('Display on Frontend', 'multivendorx'),
					options: [
						{
							key: 'show_on_frontend',
							value: 'show_on_frontend',
						},
					],
					look: 'toggle',
				},
			],
			desc: 'What the product is made of',
		},
		{
			id: 'usage_instructions',
			label: 'Usage instructions',
			isCustom: true,
			formFields: [
				{
					key: 'show_on_frontend',
					type: 'checkbox',
					label: __('Display on Frontend', 'multivendorx'),
					options: [
						{
							key: 'show_on_frontend',
							value: 'show_on_frontend',
						},
					],
					look: 'toggle',
				},
			],
			desc: 'How to use or operate the product safely',
		},
	],
	addNewBtn: true,
	addNewTemplate: {
		label: 'New Product Categories',
		editableFields: {
			title: true,
			description: false,
			mandatory: true,
		},
		showMandatoryCheckbox: true,
	},
};

const abuseReportReasons = {
	key: 'abuse_report_reasons',
	type: 'expandable-panel',
	label: __('Reasons for abuse report', 'multivendorx'),
	placeholder: __('Add a reason for reporting a product', 'multivendorx'),
	settingDescription: __(
		'Define one or more preset reasons that stores can choose from when submitting an abuse report.',
		'multivendorx'
	),
	desc: __(
		'<b>Note</b>: Users can report products for various issues. When enabling logged-in user restriction, anonymous reports will be blocked. Abuse reports are reviewed by administrators who can take appropriate action including product removal or store penalties.',
		'multivendorx'
	),
	name: 'abuse_report_reasons',
	moduleEnabled: 'marketplace-compliance',
	addNewBtn: true,
	addNewTemplate: {
		label: 'New Reasons',
		editableFields: {
			title: true,
			description: false,
		},
		disableBtn: true,
	},
};

export default ProductCompliance;
