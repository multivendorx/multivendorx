import { useEffect, useState } from 'react';
import axios from 'axios';
import {
	BasicInput,
	TextArea,
	FileInput,
	SelectInput,
	getApiLink,
	SuccessNotice,
	MultiCheckBox,
	ToggleSetting,
	MultiCheckboxTable,
	AdminBreadcrumbs,
	NestedComponent,
	Container,
	Column,
	Card,
	FormGroupWrapper,
	FormGroup,
	AdminButton,
} from 'zyra';
import { __ } from '@wordpress/i18n';

const productTypeField = {
	key: 'product_types',
	look: 'checkbox',
	selectDeselect: true,
	class: 'basic-checkbox',
	options: [
		{ key: 'simple', value: 'simple', label: 'Simple (one price)' },
		{ key: 'variable', value: 'variable', label: 'Variable (multiple options)' },
		{ key: 'external', value: 'external', label: 'External / Affiliate (Links to another website)' },
		{ key: 'downloadable', value: 'downloadable', label: 'Downloadable Product (Digital files / media)' },
	],
};
const productTypeOptions = [
	{
		value: 'simple',
		label: 'Simple (one price)',
	},
	{
		value: 'variable',
		label: 'Variable (multiple options)',
	},
	{
		value: 'external',
		label: 'External / Affiliate (Links to another website)',
	},
	{
		value: 'downloadable',
		label: 'Downloadable Product (Digital files / media)',
	},
];


const proFeatures = {
	key: 'pro_features',
	look: 'checkbox',
	selectDeselect: true,
	class: 'basic-checkbox',
	desc: 'Choose the kinds of items stores can sell under this plan. Only selected types will be available when a store adds a new product.',
	options: [
		{ key: 'seo_tools', value: 'seo_tools', label: __('Store SEO', 'multivendorx'), desc: __('Help products get discovered through search engines', 'multivendorx') },
		{ key: 'advertisement', value: 'advertisement', label: __('Product advertising', 'multivendorx'), desc: __('Promote products across the marketplace', 'multivendorx') },
		{ key: 'affiliate_program', value: 'affiliate_program', label: __('Affiliate program', 'multivendorx'), desc: __('Use affiliates to drive more sales', 'multivendorx') },
		{ key: 'wholesale', value: 'wholesale', label: __('Wholesale pricing', 'multivendorx'), desc: __('Sell products at wholesale prices', 'multivendorx') },
	],
};
const orderPermissionField = {
	key: 'order_permissions',
	look: 'checkbox',
	selectDeselect: true,
	class: 'basic-checkbox',
	desc: 'Select the order management actions stores are allowed to perform',
	options: [
		{
			key: 'view_orders',
			value: 'view_orders',
			label: 'View customer orders',
		},
		{
			key: 'add_order_notes',
			value: 'add_order_notes',
			label: 'Add notes to orders',
		},
		{
			key: 'export_order_data',
			value: 'export_order_data',
			label: 'Export order data',
		},
		{
			key: 'manage_shipping',
			value: 'manage_shipping',
			label: 'Manage shipping for orders',
		},

	],
};
const vendorStorefrontField = {
	key: 'vendor_storefront_capabilities',
	look: 'checkbox',
	selectDeselect: true,
	class: 'basic-checkbox',
	desc: 'Only selected actions will be available to stores.',
	options: [
		{ key: 'publish_listings', value: 'publish_listings', label: 'Publish Listings' },
		{ key: 'edit_published_listing', value: 'edit_published_listing', label: 'Edit Published Listing' },
		{ key: 'upload_media_files', value: 'upload_media_files', label: 'Upload Media Files' },
		{ key: 'submit_coupons', value: 'submit_coupons', label: 'Submit Coupons' },
		{ key: 'publish_coupons', value: 'publish_coupons', label: 'Publish Coupons' },
		{ key: 'edit_published_coupons', value: 'edit_published_coupons', label: 'Edit Published Coupons' },

	],
};

const categoryField = {
	key: 'store_categories',
	look: 'checkbox',
	selectDeselect: true,
	class: 'basic-checkbox',
	desc: 'Limit where stores can list their products. This helps you control what your marketplace focuses on.',
	options: [
		{ key: 'activewear', value: 'activewear', label: 'Activewear' },
		{ key: 'casual', value: 'casual', label: 'Casual' },
		{ key: 'clothing', value: 'clothing', label: 'Clothing' },
		{ key: 'accessories', value: 'accessories', label: 'Accessories' },
	],
};
const categoryOptions = [
	{ value: 'activewear', label: 'Activewear' },
	{ value: 'casual', label: 'Casual' },
	{ value: 'clothing', label: 'Clothing' },
	{ value: 'accessories', label: 'Accessories' },
];
const advancedFeaturesField = {
	key: 'advanced_features',
	look: 'checkbox',
	selectDeselect: true,
	class: 'basic-checkbox',
	desc: 'Enable advanced features for vendors',
	options: [
		{
			key: 'vendor-vacation',
			value: 'vendor-vacation',
			label: 'Vendor Vacation',
		},
		{
			key: 'advanced-report',
			value: 'advanced-report',
			label: 'Advanced Report',
		},
	],
};

const exportedOrderInfoField = {
	key: 'exported_order_information',
	look: 'checkbox',
	selectDeselect: true,
	class: 'basic-checkbox',
	options: [
		{ key: 'advanced_inventory', value: 'advanced_inventory', label: __('Stock inventory', 'multivendorx'), desc: __('Track and manage available product stock', 'multivendorx') },
		{ key: 'shipping_management', value: 'shipping_management', label: __('Store shipping', 'multivendorx'), desc: __('Manage shipping methods and delivery options', 'multivendorx') },
		{ key: 'import_export_tools', value: 'import_export_tools', label: __('Import and export tools', 'multivendorx'), desc: __('Import or export products and store data', 'multivendorx') },
		{ key: 'business_hours', value: 'business_hours', label: __('Business hours', 'multivendorx'), desc: __('Set store working and availability hours', 'multivendorx') },
		{ key: 'vacation_mode', value: 'vacation_mode', label: __('Vacation mode', 'multivendorx'), desc: __('Temporarily pause store operations', 'multivendorx') },
		{ key: 'min_max_quantities', value: 'min_max_quantities', label: __('Minimum and maximum quantities', 'multivendorx'), desc: __('Set minimum and maximum order quantities per product', 'multivendorx') },
		{ key: 'analytics_dashboard', value: 'analytics_dashboard', label: __('Store analytics', 'multivendorx'), desc: __('View store sales, earnings, and performance insights', 'multivendorx') },

	],
};
const orderEmailInfoField = {
	key: 'order_email_information',
	look: 'checkbox',
	selectDeselect: true,
	class: 'basic-checkbox',

	options: [
		{ key: 'live_chat', value: 'live_chat', label: __('Live chat', 'multivendorx'), desc: __('Chat with customers in real time', 'multivendorx') },
		{ key: 'customer_support', value: 'customer_support', label: __('Customer support', 'multivendorx'), desc: __('Respond to customer support requests', 'multivendorx') },
		{ key: 'enquiry', value: 'enquiry', label: __('Product enquiries', 'multivendorx'), desc: __('Receive and respond to customer product enquiries', 'multivendorx') },
		{ key: 'gift_card', value: 'gift_card', label: __('Gift cards', 'multivendorx'), desc: __('Sell gift cards to customers', 'multivendorx') },

	],
};
const businessAndPaymentsFeatures = {
	key: 'business-and-payments-features',
	look: 'checkbox',
	selectDeselect: true,
	class: 'basic-checkbox',

	options: [
		{ key: 'paypal_marketplace', value: 'paypal_marketplace', label: __('PayPal marketplace', 'multivendorx'), desc: __('Accept marketplace payments via PayPal', 'multivendorx') },
		{ key: 'stripe_marketplace', value: 'stripe_marketplace', label: __('Stripe marketplace', 'multivendorx'), desc: __('Accept marketplace payments via Stripe', 'multivendorx') },
		{ key: 'store_staff', value: 'store_staff', label: __('Staff manager', 'multivendorx'), desc: __('Allow stores to add staff members to help manage their store', 'multivendorx') },

	],
};

const field = {
	key: 'productPermissions',
	look: 'checkbox',
	selectDeselect: true,
	class: 'basic-checkbox',
	desc: 'Select the actions stores are allowed to perform.',
	options: [
		{
			key: 'submit_products',
			value: 'submit_products',
			label: 'Submit Products',
		},
		{
			key: 'publish_directly',
			value: 'publish_directly',
			label: 'Publish Directly',
		},
		{
			key: 'edit_published',
			value: 'edit_published',
			label: 'Edit Published',
		},
		{
			key: 'upload_media',
			value: 'upload_media',
			label: 'Upload Media',
		},
	],
};

const Membership = ({ id }: { id: string }) => {
	const [formData, setFormData] = useState<{ [key: string]: string }>({});
	const [pricingType, setPricingType] = useState<'free' | 'paid'>('free');
	const [selectedValues, setSelectedValues] = useState<string[]>([]);
	const [starFill, setstarFill] = useState(false);
	const [features, setFeatures] = useState<string[]>(['']);
	const [rules, setRules] = useState<any[]>([]);
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [featuredEnabled, setFeaturedEnabled] = useState(false);

	const [imagePreviews, setImagePreviews] = useState<{
		[key: string]: string;
	}>({});
	const [stateOptions, setStateOptions] = useState<
		{ label: string; value: string }[]
	>([]);
	const [successMsg, setSuccessMsg] = useState<string | null>(null);

	useEffect(() => {
		if (!id) {
			return;
		}
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		}).then((res) => {
			const data = res.data || {};
			setFormData((prev) => ({ ...prev, ...data }));
			setImagePreviews({
				image: data.image || '',
				banner: data.banner || '',
			});
		});
	}, [id]);

	useEffect(() => {
		if (successMsg) {
			const timer = setTimeout(() => setSuccessMsg(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [successMsg]);

	useEffect(() => {
		if (formData.country) {
			fetchStatesByCountry(formData.country);
		}
	}, [formData.country]);

	const fetchStatesByCountry = (countryCode: string) => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `states/${countryCode}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		}).then((res) => {
			setStateOptions(res.data || []);
		});
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		const updated = { ...formData, [name]: value };
		setFormData(updated);
		autoSave(updated);
	};
	const handleMultiCheckboxChange =
		(fieldKey: string) => (e: any) => {
			if (Array.isArray(e)) {
				handleInputChange(fieldKey, e);
				return;
			}

			if (e?.target) {
				const val = String(e.target.value);
				const checked = !!e.target.checked;
				let current = normalizeValue(fieldKey);

				current = checked
					? [...new Set([...current, val])]
					: current.filter((v) => v !== val);

				handleInputChange(fieldKey, current);
			}
		};

	const autoSave = (updatedData: { [key: string]: string }) => {
		axios({
			method: 'PUT',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: updatedData,
		}).then((res) => {
			if (res.data.success) {
				setSuccessMsg('Store saved successfully!');
			}
		});
	};
	const [setting, setSetting] = useState<Record<string, string[]>>({
		product_create: [],
		product_edit: [],
		product_delete: [],
	});

	// add membership start
	const addFeature = () => {
		setFeatures((prev) => [...prev, '']);
	};

	const updateFeature = (index: number, value: string) => {
		setFeatures((prev) =>
			prev.map((f, i) => (i === index ? value : f))
		);
	};

	const clearAll = () => {
		setFeatures(['']);
	};
	// add membership end


	// multicheckbox start
	const methodId = 'default';

	const [value, setValue] = useState<any>({
		default: {
			product_types: ['simple'],
			store_categories: ['activewear', 'casual'],
		},
	});

	const normalizeValue = (key: string) => {
		const v = value?.[methodId]?.[key];
		return Array.isArray(v) ? v : v ? [v] : [];
	};

	const handleInputChange = (
		key: string,
		newValue: string[]
	) => {
		setValue((prev: any) => ({
			...prev,
			[methodId]: {
				...(prev[methodId] || {}),
				[key]: newValue,
			},
		}));
	};

	const handleSelectDeselect = (field: any) => {
		const allValues = field.options.map((o: any) =>
			String(o.value)
		);

		const current = normalizeValue(field.key);
		const selectAll = current.length !== allValues.length;

		handleInputChange(
			field.key,
			selectAll ? allValues : []
		);
	};
	//  multicheckbox end



	// nastes component start
	const nestedFields = [
		{
			key: 'facilitator_fixed',
			type: 'number',
			preInsideText: __('$', 'multivendorx'),
			size: '7rem',
			preText: 'Fixed',
			postText: '+',
		},
		{
			key: 'facilitator_percentage',
			type: 'number',
			postInsideText: __('%', 'multivendorx'),
			size: '7rem',
		},
	];
	const subscription = [
		{
			key: 'disable_coupon_for_wholesale',
			type: 'checkbox',
			options: [
				{
					key: 'disable_coupon_for_wholesale',
					label: __('', 'catalogx'),
					value: 'disable_coupon_for_wholesale',
				},
			],
			look: 'toggle',
		},
		{
			key: 'facilitator_fixed',
			type: 'number',
			postInsideText: __('days', 'multivendorx'),
			size: '8rem',
			preText: 'for a duration of',
			dependent: {
				key: 'disable_coupon_for_wholesale',
				set: true,
				value: 'disable_coupon_for_wholesale',
			},
		},
	];
	const recurringPrice = [
		{
			key: 'recurring',
			type: 'number',
			postInsideText: __('days', 'multivendorx'),
			size: '8rem',
			preText: 'for a duration of',
			dependent: {
				key: 'disable_coupon_for_wholesale',
				set: true,
				value: 'disable_coupon_for_wholesale',
			},
		},
		{
			key: 'recurring_fixed',
			type: 'dropdown',
			size: '5rem',
			options: [
				{
					key: 'monday',
					label: __('Keep Products Visible', 'multivendorx'),
					value: 'monday',
				},
				{
					key: 'tuesday',
					label: __('After 2 cycles', 'multivendorx'),
					value: 'tuesday',
				},
				{
					key: 'wednesday',
					label: __('Hide Products', 'multivendorx'),
					value: 'wednesday',
				},
				{
					key: 'thursday',
					label: __('Set to Draft', 'multivendorx'),
					value: 'thursday',
				},
			],
		},
	];
	const productUploadSettings = [
		{
			key: 'enable_product_limits',
			type: 'checkbox',
			options: [
				{
					key: 'enable_product_limits',
					label: __('', 'multivendorx'),
					value: 'enable_product_limits',
				},
			],
			look: 'toggle',
		},

		{
			key: 'max_products',
			type: 'number',
			size: '8rem',
			preText: 'with a maximum of',
			postInsideText: __('products', 'multivendorx'),
			dependent: {
				key: 'enable_product_limits',
				set: true,
				value: 'enable_product_limits',
			},
		},

		{
			key: 'extra_product_charge',
			type: 'number',
			size: '8rem',
			preText: 'Beyond this limit,charge',
			//postText: __('per product', 'multivendorx'),
			postInsideText: __('/products', 'multivendorx'),
			preInsideText: __('$', 'multivendorx'),
			dependent: {
				key: 'enable_product_limits',
				set: true,
				value: 'enable_product_limits',
			},
		},
		{
			key: 'images_per_product',
			type: 'number',
			size: '6rem',
			preText: 'Stores can also upload images',
			//postText: __('images per product', 'multivendorx'),
			postInsideText: __('/products', 'multivendorx'),
			dependent: {
				key: 'enable_product_limits',
				set: true,
				value: 'enable_product_limits',
			},
		},


		{
			key: 'product_images',
			type: 'checkbox',
			label: 'lflkksjsjajaaj',
			options: [
				{
					key: 'product_images',
					value: 'product_images',
				},
			],
			look: 'toggle',
			dependent: {
				key: 'enable_product_limits',
				set: true,
				value: 'enable_product_limits',
			},
		},
		{
			key: 'max_featured_products',
			type: 'number',
			size: '6rem',
			preText: 'allowed upto',
			dependent: {
				key: 'product_images',
				set: true,
				value: 'product_images',
			},
		},
	];

	const gracePeriod = [
		{
			key: 'disable_coupon',
			type: 'checkbox',
			options: [
				{
					key: 'disable_coupon',
					label: __('', 'catalogx'),
					value: 'disable_coupon',
				},
			],
			look: 'toggle',
		},
		{
			key: 'facilita',
			type: 'number',
			postInsideText: __('days', 'multivendorx'),
			size: '8rem',
			preText: 'for a duration of',
			dependent: {
				key: 'disable_coupon',
				set: true,
				value: 'disable_coupon',
			},
		},
		{
			key: 'facilitator',
			type: 'dropdown',
			size: '4rem',
			options: [
				{
					key: 'monday',
					label: __('Visible', 'multivendorx'),
					value: 'monday',
				},
				{
					key: 'tuesday',
					label: __('Hidden', 'multivendorx'),
					value: 'tuesday',
				},
				{
					key: 'wednesday',
					label: __('Hide Products', 'multivendorx'),
					value: 'wednesday',
				},
				{
					key: 'thursday',
					label: __('Set to Draft', 'multivendorx'),
					value: 'thursday',
				},
			],
			preText: 'During this period, products are',
			dependent: {
				key: 'disable_coupon',
				set: true,
				value: 'disable_coupon',
			},
		},
		{
			key: 'rule_type',
			type: 'select',
			options: [
				{ value: 'price', label: 'allowed' },
				{ value: 'quantity', label: 'Not allowed' }
			],
			dependent: {
				key: 'disable_coupon',
				set: true,
				value: 'disable_coupon',
			},
			preText: 'and product creation is',
		},
		{
			key: 'facilitator_fixed',
			type: 'dropdown',
			size: '5rem',
			options: [
				{
					key: 'monday',
					label: __('Keep Products Visible', 'multivendorx'),
					value: 'monday',
				},
				{
					key: 'tuesday',
					label: __('After 2 cycles', 'multivendorx'),
					value: 'tuesday',
				},
				{
					key: 'wednesday',
					label: __('Hide Products', 'multivendorx'),
					value: 'wednesday',
				},
				{
					key: 'thursday',
					label: __('Set to Draft', 'multivendorx'),
					value: 'thursday',
				},
			],
			preText: 'Change the store role to',
			dependent: {
				key: 'disable_coupon',
				set: true,
				value: 'disable_coupon',
			},
		},
	];


	return (
		<>
			<AdminBreadcrumbs
				activeTabIcon="adminfont-storefront"
				tabTitle="Add plan"
				description={
					'Manage marketplace stores with ease. Review, edit, or add new stores anytime.'
				}
			/>
			<SuccessNotice message={successMsg} />
			<div className="general-wrapper">
				<Container>
					<Column grid={8}>
						<Card
							title="Plan details"
							action={
								<div className="field-wrapper">
									<ToggleSetting


										options={[
											{
												key: 'draft',
												value: 'draft',
												label: __('Draft', 'multivendorx'),
											},
											{
												key: 'published',
												value: 'Published',
												label: __('Published', 'multivendorx'),
											},
										]}
									/>

									<div
										className="recommended-wrapper"
										onClick={() => setstarFill((prev) => !prev)}
									>
										<i
											className={`star-icon ${starFill ? 'adminfont-star' : 'adminfont-star-o'
												}`}
										></i>
										<div className="hover-text">
											Mark as recommended plan
										</div>
									</div>
								</div>
							}
						>
							<FormGroupWrapper>
								<FormGroup label="Name" htmlFor="product-name">
									<BasicInput
										name="name"


										value={formData.name}
										onChange={handleChange}
									/>
								</FormGroup>
								<FormGroup label="Description" htmlFor="short_description">
									<TextArea
										name="short_description"
									/>
								</FormGroup>
							</FormGroupWrapper>
						</Card>


						<Card title={__('What stores can sell', 'multivendorx')}
							desc={__('Decide what kind of items stores are allowed to list on your marketplace.', 'multivendorx')}
						>
							<FormGroupWrapper>
								<FormGroup row label={__('Listing formats allowed', 'multivendorx')} desc={__('Choose the kinds of listings stores can create under this plan. Only selected types will be available when a store adds a new listing.', 'multivendorx')}>
									{/* <MultiCheckBox
										khali_dabba={true}
										wrapperClass="checkbox-list-side-by-side"
										  
										description={productTypeField.desc}
										inputWrapperClass="toggle-checkbox-header"
										inputInnerWrapperClass="default-checkbox"
										inputClass={productTypeField.class}
										idPrefix="product-type"
										selectDeselect
										options={productTypeField.options}
										value={normalizeValue(productTypeField.key)}
										onChange={(e: any) => {
											if (Array.isArray(e)) {
												handleInputChange(productTypeField.key, e);
												return;
											}

											if (e?.target) {
												const val = String(e.target.value);
												const checked = !!e.target.checked;
												let current = normalizeValue(productTypeField.key);

												current = checked
													? [...new Set([...current, val])]
													: current.filter((v) => v !== val);

												handleInputChange(productTypeField.key, current);
											}
										}}
										onMultiSelectDeselectChange={() =>
											handleSelectDeselect(productTypeField)
										}
										proSetting={false}
										moduleChange={() => { }}
										modules={[]}
									/> */}

									<SelectInput
										name="product_type"
										type="multi-select"
										options={productTypeOptions}
										value={productTypeOptions.filter(opt =>
											selectedValues.includes(opt.value)
										)}
										size={"18rem"}
										onChange={(selected: any) => {
											// selected is array of option objects
											const values = selected?.map((opt: any) => opt.value) || [];
											setSelectedValues(values);
										}}
									/>

								</FormGroup>

								<FormGroup row label={__('Categories stores can list in', 'multivendorx')} className="border-top" desc={__('Limit where stores can list their products. This helps you control what your marketplace focuses on.')}>
									{/* <MultiCheckBox
										wrapperClass="checkbox-list-side-by-side"
										  
										description={categoryField.desc}
										inputWrapperClass="toggle-checkbox-header"
										inputInnerWrapperClass="default-checkbox"
										inputClass={categoryField.class}
										idPrefix="category"
										selectDeselect
										options={categoryField.options}
										value={normalizeValue(categoryField.key)}
										onChange={(e: any) => {
											if (Array.isArray(e)) {
												handleInputChange(categoryField.key, e);
												return;
											}

											if (e?.target) {
												const val = String(e.target.value);
												const checked = !!e.target.checked;
												let current = normalizeValue(categoryField.key);

												current = checked
													? [...new Set([...current, val])]
													: current.filter((v) => v !== val);

												handleInputChange(categoryField.key, current);
											}
										}}
										onMultiSelectDeselectChange={() =>
											handleSelectDeselect(categoryField)
										}
										proSetting={false}
										moduleChange={() => { }}
										modules={[]}
									/> */}
									<SelectInput
										name="categories"
										type="multi-select"
										options={categoryOptions}
										size={"10rem"}
										value={categoryOptions.filter(opt =>
											selectedCategories.includes(opt.value)
										)}
										onChange={(selected: any) => {
											const values = selected?.map((opt: any) => opt.value) || [];
											setSelectedCategories(values);
										}}
									/>
								</FormGroup>

								{/* <FormGroup
										label="Product categories store can access"
										htmlFor="product_category_limit"
										desc={__('Product categories store can access', 'multivendorx')}
										className="border-top"
									>
										<BasicInput
											name="product_category_limit"
											 
											  
											value={formData.product_category_limit}
											onChange={handleChange}
											postInsideText="max"
											size="12rem"
										/>
									</FormGroup> */}

							</FormGroupWrapper>
						</Card>

						<Card title={__('What stores can do with their listings', 'multivendorx')}
							desc={__('Decide how much control stores have after creating a listing. Choose what actions stores are allowed to perform.', 'multivendorx')}

						>
							<FormGroupWrapper>
								<FormGroup
									label="Listing permissions"
									htmlFor={vendorStorefrontField.key}
									desc={__('Select the actions stores are allowed to perform.', 'multivendorx')}
								>
									<MultiCheckBox
										wrapperClass="checkbox-list-side-by-side"

										description={vendorStorefrontField.desc}
										inputWrapperClass="toggle-checkbox-header"
										inputInnerWrapperClass="default-checkbox"
										inputClass={vendorStorefrontField.class}
										idPrefix={vendorStorefrontField.key}
										selectDeselect
										options={vendorStorefrontField.options}
										value={normalizeValue(vendorStorefrontField.key)}
										onChange={handleMultiCheckboxChange(
											vendorStorefrontField.key
										)}
										onMultiSelectDeselectChange={() =>
											handleSelectDeselect(vendorStorefrontField)
										}
										proSetting={false}
										moduleChange={() => { }}
										modules={[]}
									/>
								</FormGroup>

								<FormGroup row label="How many listings a store can add" className="border-top" desc={__('Control how many listings a store can have at the same time.', 'multivendorx')}>
									<BasicInput
										name="name"


										value={formData.name}
										onChange={handleChange}
										// postInsideText={'credits per month'}
										size="10rem"
										postText={'listings maximum'}
									/>
								</FormGroup>

								<FormGroup row label="Images per listing" className="border-top" desc={__('Control how many images a store can add for each listing.', 'multivendorx')}>
									<BasicInput
										name="name"


										value={formData.name}
										onChange={handleChange}
										// postInsideText={'credits per month'}
										size="10rem"
										postText={'images maximum'}
									/>
								</FormGroup>
							</FormGroupWrapper>
						</Card>

						<Card title={__('What premium features stores can access with this plan', 'multivendorx')}
							desc={'Select which premium features stores can access with this plan.'}
						>
							<FormGroupWrapper>
								<FormGroup label="Sales & marketing" desc={__('', 'multivendorx')}>
									<MultiCheckBox
										khali_dabba={true}
										wrapperClass="checkbox-list-side-by-side"

										description={productTypeField.desc}
										inputWrapperClass="toggle-checkbox-header"
										inputInnerWrapperClass="default-checkbox"
										inputClass={productTypeField.class}
										idPrefix="product-type"
										selectDeselect
										options={proFeatures.options}
										value={normalizeValue(proFeatures.key)}
										onChange={(e: any) => {
											if (Array.isArray(e)) {
												handleInputChange(proFeatures.key, e);
												return;
											}

											if (e?.target) {
												const val = String(e.target.value);
												const checked = !!e.target.checked;
												let current = normalizeValue(proFeatures.key);

												current = checked
													? [...new Set([...current, val])]
													: current.filter((v) => v !== val);

												handleInputChange(proFeatures.key, current);
											}
										}}
										onMultiSelectDeselectChange={() =>
											handleSelectDeselect(proFeatures)
										}
										proSetting={false}
										moduleChange={() => { }}
										modules={[]}
									/>
								</FormGroup>
								<FormGroup label="Information in exported orders" className="border-top">
									<MultiCheckBox
										wrapperClass="checkbox-list-side-by-side"

										description={exportedOrderInfoField.desc}
										inputWrapperClass="toggle-checkbox-header"
										inputInnerWrapperClass="default-checkbox"
										inputClass={exportedOrderInfoField.class}
										idPrefix={exportedOrderInfoField.key}
										selectDeselect
										options={exportedOrderInfoField.options}
										value={normalizeValue(exportedOrderInfoField.key)}
										onChange={handleMultiCheckboxChange(exportedOrderInfoField.key)}
										onMultiSelectDeselectChange={() =>
											handleSelectDeselect(exportedOrderInfoField)
										}
										proSetting={false}
										moduleChange={() => { }}
										modules={[]}
									/>
								</FormGroup>

								<FormGroup label="Customer support" className="border-top">
									<MultiCheckBox
										wrapperClass="checkbox-list-side-by-side"

										description={orderEmailInfoField.desc}
										inputWrapperClass="toggle-checkbox-header"
										inputInnerWrapperClass="default-checkbox"
										inputClass={orderEmailInfoField.class}
										idPrefix={orderEmailInfoField.key}
										selectDeselect
										options={orderEmailInfoField.options}
										value={normalizeValue(orderEmailInfoField.key)}
										onChange={handleMultiCheckboxChange(orderEmailInfoField.key)}
										onMultiSelectDeselectChange={() =>
											handleSelectDeselect(orderEmailInfoField)
										}
										proSetting={false}
										moduleChange={() => { }}
										modules={[]}
									/>
								</FormGroup>

								<FormGroup label="Payment & support" className="border-top">
									<MultiCheckBox
										wrapperClass="checkbox-list-side-by-side"

										description={businessAndPaymentsFeatures.desc}
										inputWrapperClass="toggle-checkbox-header"
										inputInnerWrapperClass="default-checkbox"
										inputClass={businessAndPaymentsFeatures.class}
										idPrefix={businessAndPaymentsFeatures.key}
										selectDeselect
										options={businessAndPaymentsFeatures.options}
										value={normalizeValue(businessAndPaymentsFeatures.key)}
										onChange={handleMultiCheckboxChange(businessAndPaymentsFeatures.key)}
										onMultiSelectDeselectChange={() =>
											handleSelectDeselect(businessAndPaymentsFeatures)
										}
										proSetting={false}
										moduleChange={() => { }}
										modules={[]}
									/>
								</FormGroup>
							</FormGroupWrapper>
						</Card>

						<Card title={__('How stores handle orders and shipping', 'multivendorx')}
							desc={__('Decide what stores can see and do after a customer places an order.', 'multivendorx')}
						>
							<FormGroupWrapper>
								<FormGroup label="Actions stores can take on orders"
									desc="Choose whether stores can add notes, download order details, or ship orders."
								>
									<MultiCheckBox
										wrapperClass="checkbox-list-side-by-side"

										description={orderPermissionField.desc}
										inputWrapperClass="toggle-checkbox-header"
										inputInnerWrapperClass="default-checkbox"
										inputClass={orderPermissionField.class}
										idPrefix={orderPermissionField.key}
										selectDeselect
										options={orderPermissionField.options}
										value={normalizeValue(orderPermissionField.key)}
										onChange={handleMultiCheckboxChange(orderPermissionField.key)}
										onMultiSelectDeselectChange={() =>
											handleSelectDeselect(orderPermissionField)
										}
										proSetting={false}
										moduleChange={() => { }}
										modules={[]}
									/>
								</FormGroup>
							</FormGroupWrapper>
						</Card>

						<Card title={__('AI tools available to stores', 'multivendorx')}
							desc={'Decide whether stores can use AI tools and how much they can use them.'}
						>

							<FormGroupWrapper>
								<FormGroup row label="AI for writing product details" desc={__('AI for writing product details', 'multivendorx')}>
									<BasicInput
										name="name"


										value={formData.name}
										onChange={handleChange}
										postText={'credits per month'}
										size="8rem"
									/>
								</FormGroup>
								<FormGroup row label="AI for writing product details" className="border-top" desc={__('AI for writing product details', 'multivendorx')}>
									<BasicInput
										name="name"


										value={formData.name}
										onChange={handleChange}
										postText={'credits per month'}
										size="8rem"
									/>
								</FormGroup>
							</FormGroupWrapper>
						</Card>

						{/* <Card title={__('Extra tools for running a store', 'multivendorx')}
							desc={'Decide which additional tools stores get to manage their storefront and customers.'}
						>
							<FormGroupWrapper>
								<FormGroup
									label="Store management tools"
									htmlFor={vendorStorefrontField.key}
									desc={__('Choose whether stores can set store rules, communicate with buyers, pause sales, or offer customer support.', 'multivendorx')}
								>
									<MultiCheckBox
										wrapperClass="checkbox-list-side-by-side"
										  
										description={vendorStorefrontField.desc}
										inputWrapperClass="toggle-checkbox-header"
										inputInnerWrapperClass="default-checkbox"
										inputClass={vendorStorefrontField.class}
										idPrefix={vendorStorefrontField.key}
										selectDeselect
										options={vendorStorefrontField.options}
										value={normalizeValue(vendorStorefrontField.key)}
										onChange={handleMultiCheckboxChange(
											vendorStorefrontField.key
										)}
										onMultiSelectDeselectChange={() =>
											handleSelectDeselect(vendorStorefrontField)
										}
										proSetting={false}
										moduleChange={() => { }}
										modules={[]}
									/>
								</FormGroup>
							</FormGroupWrapper>

						</Card> */}
					</Column>

					<Column grid={4}>
						<Card contentHeight title={__('Pricing', 'multivendorx')}>
							<FormGroupWrapper>
								<FormGroup
									label="Membership type"
									htmlFor="membership_type"
								>
									<ToggleSetting
										options={[
											{
												key: 'free',
												value: 'free',
												label: __('Free', 'multivendorx'),
											},
											{
												key: 'paid',
												value: 'paid',
												label: __('Paid', 'multivendorx'),
											},
										]}
										value={pricingType}
										onChange={(value: string) =>
											setPricingType(value as 'free' | 'paid')
										}
									/>
								</FormGroup>
							</FormGroupWrapper>

							{pricingType === 'paid' && (
								<>
									<FormGroupWrapper>
										<FormGroup
											label="Sign up fee"
											htmlFor="signup_fee"
											cols={2}
										>
											<BasicInput
												name="signup_fee"


												value={formData.signup_fee}
												onChange={handleChange}
												pInsideText="$"
											/>
										</FormGroup>

										<FormGroup
											label="Recurring price"
											htmlFor="recurring_price"
											cols={2}
										>
											<BasicInput
												name="recurring_price"
												postInsideText="Month"
												value={formData.recurring_price}
												onChange={handleChange}
											/>
										</FormGroup>
									</FormGroupWrapper>
									<div className="settings-metabox-note">
										<div className="metabox-note-wrapper">
											<i className="adminfont-info"></i>
											<div className="details">
												<p>Activate Stripe Marketplace or PayPal Marketplace module to use recurring subscriptions.</p>
												<p>Sign-up fee 0.05 or more is required to create subscriptions in Stripe/PayPal</p>
											</div>
										</div>
									</div>
									<div className="card-header">
										<div className="left">
											<div className="title">
												Trial Period
											</div>
											<div className="des">Configure optional trial period for new members</div>
										</div>
									</div>
									<FormGroupWrapper>
										<FormGroup
											label="Offer a trial period"
											htmlFor="trial_period"
										>
											<NestedComponent
												id="trial_period"
												fields={subscription}
												value={rules}
												single={true}
												addButtonLabel="Add Rule"
												deleteButtonLabel="Remove"
												onChange={(val) => setRules(val)}
											/>
										</FormGroup>
									</FormGroupWrapper>
									<div className="card-header">
										<div className="left">
											<div className="title">
												After Expiry
											</div>
											<div className="des">Define what happens when subscription expires</div>
										</div>
									</div>
									<FormGroupWrapper>
										<FormGroup
											label="Offer grace period"
											htmlFor="grace_period"
										>
											<NestedComponent
												id="grace_period"
												fields={gracePeriod}
												value={rules}
												single={true}
												addButtonLabel="Add Rule"
												deleteButtonLabel="Remove"
												onChange={(val) => setRules(val)}
											/>
										</FormGroup>
									</FormGroupWrapper>
								</>
							)}
						</Card>
						<Card contentHeight title={__('Commission type', 'multivendorx')}>
							<FormGroupWrapper>
								<FormGroup
									label="Include All Add-ons"
									htmlFor={advancedFeaturesField.key}
								>
									<NestedComponent
										id="role_rules"
										fields={nestedFields}
										value={rules}
										single={true}
										addButtonLabel="Add Rule"
										deleteButtonLabel="Remove"
										onChange={(val) => setRules(val)}
									/>
								</FormGroup>
							</FormGroupWrapper>
						</Card>
						<Card contentHeight title={__('Membership Perks', 'multivendorx')}>
							<div className="membership-features">
								<AdminButton
									buttons={[
										{
											icon: 'delete',
											text: 'Clear All',
											className: 'red',
											onClick: clearAll,
										},
										{
											icon: 'plus',
											text: 'Add Feature',
											className: 'purple',
											onClick: addFeature,
										},
									]}
								/>
								<div className="features-list">
									{features.map((feature, index) => (
										<div className="feature-row" key={index}>
											<span className={`feature-number`}>
												{index + 1}
											</span>
											<input
												type="text"
												className="basic-input"
												placeholder="e.g., Unlimited access to premium content"
												value={feature}
												onChange={(e) =>
													updateFeature(index, e.target.value)
												}
											/>
										</div>
									))}
								</div>
							</div>
						</Card>
					</Column>
				</Container>
			</div>
		</>
	);
};

export default Membership;