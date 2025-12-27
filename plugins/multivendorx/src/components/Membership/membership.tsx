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
} from 'zyra';
import { __ } from '@wordpress/i18n';

const productTypeField = {
	key: 'product_types',
	look: 'checkbox',
	selectDeselect: true,
	class: 'basic-checkbox',
	desc: 'Select the product types you want to enable',
	options: [
		{ key: 'simple', value: 'simple', label: 'Simple product' },
		{ key: 'variable', value: 'variable', label: 'Variable Product' },
		{ key: 'external', value: 'external', label: 'External / Affiliate Product' },
		{ key: 'gift-card', value: 'gift-card', label: 'Gift Card' },
		{ key: 'downloadable', value: 'downloadable', label: 'Downloadable Product' },
	],
};
const orderPermissionField = {
	key: 'order_permissions',
	look: 'checkbox',
	selectDeselect: true,
	class: 'basic-checkbox',
	desc: 'Select the order management actions vendors are allowed to perform',
	options: [
		{
			key: 'add-order-notes',
			value: 'add-order-notes',
			label: 'Add Order Notes',
		},
		{
			key: 'export-order-data',
			value: 'export-order-data',
			label: 'Export Order Data',
		},
	],
};
const vendorStorefrontField = {
	key: 'vendor_storefront_capabilities',
	look: 'checkbox',
	selectDeselect: true,
	class: 'basic-checkbox',
	desc: 'Select the storefront capabilities available to vendors',
	options: [
		{
			key: 'edit-store-policies',
			value: 'edit-store-policies',
			label: 'Edit Store Policies',
		},
		{
			key: 'external-store-url',
			value: 'enable-external-store-url',
			label: 'Enable External Store URL',
		},
		{
			key: 'send-messages',
			value: 'send-messages-to-buyers',
			label: 'Send Messages to Buyers',
		},
		{
			key: 'shop-support',
			value: 'shop-support-system',
			label: 'Shop Support System',
		},
		{
			key: 'vendor-vacation',
			value: 'vendor-vacation-mode',
			label: 'Vendor Vacation Mode',
		},
	],
};

const categoryField = {
	key: 'store_categories',
	look: 'checkbox',
	selectDeselect: true,
	class: 'basic-checkbox',
	desc: 'Select the categories you want to enable for your store',
	options: [
		{ key: 'activewear', value: 'activewear', label: 'Activewear' },
		{ key: 'casual', value: 'casual', label: 'Casual' },
		{ key: 'clothing', value: 'clothing', label: 'Clothing' },
		{ key: 'accessories', value: 'accessories', label: 'Accessories' },
		{ key: 'hoodies', value: 'hoodies', label: 'Hoodies' },
		{ key: 'tshirts', value: 't-shirts', label: 'T-shirts' },
		{ key: 'decor', value: 'decor', label: 'Decor' },
		{ key: 'evening', value: 'evening-dresses', label: 'Evening Dresses' },
		{ key: 'music', value: 'music', label: 'Music' },
		{ key: 'office', value: 'work-office', label: 'Work & Office' },
	],
};
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
	desc: 'Select the information to include when exporting order data',
	options: [
		{
			key: 'customer-name-contact',
			value: 'customer-name-contact',
			label: 'Customer Name & Contact',
		},
		{
			key: 'billing-address',
			value: 'billing-address',
			label: 'Billing Address',
		},
		{
			key: 'shipping-address',
			value: 'shipping-address',
			label: 'Shipping Address',
		},
	],
};
const orderEmailInfoField = {
	key: 'order_email_information',
	look: 'checkbox',
	selectDeselect: true,
	class: 'basic-checkbox',
	desc: 'Select the information to include in order-related emails',
	options: [
		{
			key: 'customer-name-contact',
			value: 'customer-name-contact',
			label: 'Customer Name & Contact',
		},
		{
			key: 'billing-address',
			value: 'billing-address',
			label: 'Billing Address',
		},
		{
			key: 'shipping-address',
			value: 'shipping-address',
			label: 'Shipping Address',
		},
		{
			key: 'order-calculations',
			value: 'order-calculations',
			label: 'Order Calculations',
		},
	],
};

const field = {
	key: 'vendor_permissions',
	look: 'checkbox',
	selectDeselect: true,
	class: 'basic-checkbox',
	desc: 'Select the actions vendors are allowed to perform',
	options: [
		{
			key: 'submit-products',
			value: 'submit-products',
			label: 'Submit Products',
		},
		{
			key: 'publish-products',
			value: 'publish-products-directly',
			label: 'Publish Products Directly',
		},
		{
			key: 'edit-published-products',
			value: 'edit-published-products',
			label: 'Edit Published Products',
		},
		{
			key: 'upload-media',
			value: 'upload-media-files',
			label: 'Upload Media Files',
		},
		{
			key: 'create-coupons',
			value: 'create-coupons',
			label: 'Create Coupons',
		},
		{
			key: 'publish-coupons',
			value: 'publish-coupons',
			label: 'Publish Coupons',
		},
		{
			key: 'edit-published-coupons',
			value: 'edit-published-coupons',
			label: 'Edit Published Coupons',
		},
		{
			key: 'view-orders',
			value: 'view-orders',
			label: 'View Orders',
		},
		{
			key: 'manage-shipping',
			value: 'manage-shipping',
			label: 'Manage Shipping',
		},
	],
};

const Membership = ({ id }: { id: string }) => {
	const [formData, setFormData] = useState<{ [key: string]: string }>({});
	const [pricingType, setPricingType] = useState<'free' | 'paid'>('free');
	const [aiFeatures, setAiFeatures] = useState(false);
	const [featuredProducts, setfeaturedProducts] = useState(false);
	const [starFill, setstarFill] = useState(false);
	const [features, setFeatures] = useState<string[]>(['']);
	const [rules, setRules] = useState<any[]>([]);
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

	const runUploader = (key: string) => {
		const frame = (window as any).wp.media({
			title: 'Select or Upload Image',
			button: { text: 'Use this image' },
			multiple: false,
		});

		frame.on('select', function () {
			const attachment = frame.state().get('selection').first().toJSON();
			const updated = { ...formData, [key]: attachment.url };

			setFormData(updated);
			setImagePreviews((prev) => ({ ...prev, [key]: attachment.url }));
			autoSave(updated);
		});

		frame.open();
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
	const storeTabSetting = {
		products: ['simple', 'variable', 'grouped'],
	};
	const columns = [
		{
			key: 'description',
			label: 'Description',
			type: 'description',
		},
		{
			key: 'product_create',
			label: 'Status',
		},
	];
	// const rows = [

	// 	{
	// 		key: 'simple',
	// 		label: 'Simple Product',
	// 		description:
	// 			'Allows vendors to create and manage simple products.',
	// 	},
	// 	{
	// 		key: 'variable',
	// 		label: 'Variable Product',
	// 		description:
	// 			'Allows vendors to manage products with variations.',
	// 	},
	// 	{
	// 		key: 'grouped',
	// 		label: 'Grouped Product',
	// 		description:
	// 			'Allows vendors to sell multiple related products together.',
	// 	},
	// ];

	const rows = {
		product_types: {
			label: 'Product Types',
			desc: 'Allows vendors to create and manage simple products.',
			capability: {
				booking: 'Booking Products',
				subscription: 'Subscription Products',
				bundle: 'Bundle Products',
			},
			capabilityDesc: {
				booking: 'Allow stores to sell appointment and booking-based products',
				subscription: 'Enable recurring subscription-based products with auto-renewal',
				bundle: 'Enable recurring subscription-based products with auto-renewal',
			},
		},
		store_management_tools: {
			label: 'Store Management Tools',
			desc: 'Allows vendors to manage products with variations.',
			capability: {
				import_export: 'Import / Export Tools',
				business_hours: 'Business Hours',
				vacation_mode: 'Vacation Mode',
				staff_manager: 'Staff Manager',
				store_analytics: 'Store Analytics',
				store_seo: 'Store SEO',
			},
			capabilityDesc: {
				import_export:
					'Bulk import and export products, orders, and store data',
				business_hours:
					'Set custom store operating hours and schedules',
				vacation_mode:
					'Temporarily close store with custom vacation message',
				staff_manager:
					'Add team members with role-based permissions',
				store_analytics:
					'Access detailed sales reports and performance insights',
				store_seo:
					'Optimize store pages for search engines',
			},
		},
		sales_marketing: {
			label: 'Sales & Marketing',
			desc: 'Allows vendors to manage products with variations.',
			capability: {
				wholesale_b2b: 'Wholesale',
				min_max_quantities: 'Min / Max Quantities',
				advertise_product: 'Advertise Product',
				store_inventory: 'Store Inventory',
				store_analytics: 'Store Analytics',

			},
			capabilityDesc: {
				wholesale_b2b:
					'Offer special pricing for bulk buyers and B2B customers',
				min_max_quantities:
					'Set minimum and maximum purchase quantities per product',
				advertise_product:
					'Promote products with featured listings and ads',
				store_inventory:
					'Advanced stock management and inventory tracking',
			},
		},
		payment_gateways: {
			label: 'Payment Gateways',
			desc: 'Allows vendors to manage products with variations.',
			capability: {
				paypal_marketplace: 'PayPal Marketplace',
				stripe_marketplace: 'Stripe Marketplace',
				marketplace_fee: 'Marketplace Fee',

			},
			capabilityDesc: {
				paypal_marketplace:
					'Enable PayPal for marketplace transactions',
				stripe_marketplace:
					'Process payments through Stripe Connect',
				marketplace_fee:
					'Apply custom transaction fees on sales',

			},
		},
		communication_documents: {
			label: 'Communication & Documents',
			desc: 'Allows vendors to manage products with variations.',
			capability: {
				invoice_packing_slip: 'Invoice & Packing Slip',
				live_chat: 'Live Chat',
			},
			capabilityDesc: {
				invoice_packing_slip:
					'Generate professional invoices and packing slips',
				live_chat:
					'Real-time customer support chat on store pages',
			},
		},
		third_party_integrations: {
			label: 'Third-Party Integrations',
			desc: 'Allows vendors to manage products with variations.',
			capability: {
				elementor: 'Elementor',
				buddypress: 'BuddyPress',
				advanced_custom_field: 'Advanced Custom Field',
			},
			capabilityDesc: {
				elementor:
					'Build custom store pages with Elementor page builder',
				buddypress:
					'Integrate with BuddyPress community features',
				advanced_custom_field:
					'Add custom fields to products and store pages',
			},
		},
	};

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
			size: '8rem',
			preText: 'Fixed',
			postText: '+',
		},
		{
			key: 'facilitator_percentage',
			type: 'number',
			postInsideText: __('%', 'multivendorx'),
			size: '8rem',
		},
	];
	const subscription = [
		{
			key: 'disable_coupon_for_wholesale',
			type: 'checkbox',
			// label: __( 'Coupon restriction for wholesalers', 'catalogx' ),
			// desc: __(
			//     'Prevent wholesale users from applying any coupon and get addional discount on their orders.',
			//     'catalogx'
			// ),
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
				activeTabIcon="adminlib-storefront"
				tabTitle="Add plan"
				description={
					'Manage marketplace stores with ease. Review, edit, or add new stores anytime.'
				}
			/>
			<SuccessNotice message={successMsg} />
			<div className="general-wrapper">
				<div className="container-wrapper">
					<div className="card-wrapper column w-65">
						<div className="card-content">
							<div className="card-header">
								<div className="left">
									<div className="title">Plan details</div>
								</div>
								<div className="right">
									<div className="field-wrapper">
										<ToggleSetting
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											options={[
												{
													key: 'draft',
													value: 'draft',
													label: __(
														'Draft',
														'multivendorx'
													),
												},
												{
													key: 'published',
													value: 'Published',
													label: __(
														'Published',
														'multivendorx'
													),
												},
											]}
										/>
										<div
											className="recommended-wrapper"
											onClick={() =>
												setstarFill((prev) => !prev)
											}
										>
											<i
												className={`star-icon ${starFill ? 'adminlib-star' : 'adminlib-star-o'}`}
											></i>
											<div className="hover-text"> Mark as recommended plan </div>
										</div>
									</div>
								</div>
							</div>
							<div className="card-body">
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="product-name">
											Name
										</label>
										<BasicInput
											name="name"
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											value={formData.name}
											onChange={handleChange}
										/>
									</div>
								</div>

								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="product-name">
											Description
										</label>
										<TextArea
											name="short_description"
											wrapperClass="setting-from-textarea"
											inputClass="textarea-input"
											descClass="settings-metabox-description"
										/>
									</div>
								</div>
							</div>
						</div>

						<div className="card-content">
							<div className="card-header">
								<div className="left">
									<div className="title">Product Limits & Capabilities</div>
								</div>
							</div>
							<div className="card-body">
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="product-name">
											Product types stores can sell
										</label>
										<MultiCheckBox
											khali_dabba={true}
											wrapperClass="checkbox-list-side-by-side"
											descClass="settings-metabox-description"
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
										/>
									</div>
								</div>

								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="product-name">
											Categories stores can use
										</label>
										<MultiCheckBox
											wrapperClass="checkbox-list-side-by-side"
											descClass="settings-metabox-description"
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
										/>
									</div>
								</div>

								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="product-name">
											Product permissions
										</label>
										<MultiCheckBox
											wrapperClass="checkbox-list-side-by-side"
											descClass="settings-metabox-description"
											description={field.desc}
											inputWrapperClass="toggle-checkbox-header"
											inputInnerWrapperClass="default-checkbox"
											inputClass={field.class}
											idPrefix="category"
											selectDeselect
											options={field.options}
											value={normalizeValue(field.key)}
											onChange={(e: any) => {
												if (Array.isArray(e)) {
													handleInputChange(field.key, e);
													return;
												}

												if (e?.target) {
													const val = String(e.target.value);
													const checked = !!e.target.checked;
													let current = normalizeValue(field.key);

													current = checked
														? [...new Set([...current, val])]
														: current.filter((v) => v !== val);

													handleInputChange(field.key, current);
												}
											}}
											onMultiSelectDeselectChange={() =>
												handleSelectDeselect(field)
											}
											proSetting={false}
											moduleChange={() => { }}
											modules={[]}
										/>
									</div>
								</div>
							</div>
						</div>

						<div className="card-content">
							<div className="card-header">
								<div className="left">
									<div className="title">Order & Data Management</div>
								</div>
							</div>
							<div className="card-body">
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="product-name">
											What order information stores can access
										</label>
										<MultiCheckBox
											wrapperClass="checkbox-list-side-by-side"
											descClass="settings-metabox-description"
											description={orderPermissionField.desc}
											inputWrapperClass="toggle-checkbox-header"
											inputInnerWrapperClass="default-checkbox"
											inputClass={orderPermissionField.class}
											idPrefix="product-type"
											selectDeselect
											options={orderPermissionField.options}
											value={normalizeValue(orderPermissionField.key)}
											onChange={(e: any) => {
												if (Array.isArray(e)) {
													handleInputChange(orderPermissionField.key, e);
													return;
												}

												if (e?.target) {
													const val = String(e.target.value);
													const checked = !!e.target.checked;
													let current = normalizeValue(orderPermissionField.key);

													current = checked
														? [...new Set([...current, val])]
														: current.filter((v) => v !== val);

													handleInputChange(orderPermissionField.key, current);
												}
											}}
											onMultiSelectDeselectChange={() =>
												handleSelectDeselect(orderPermissionField)
											}
											proSetting={false}
											moduleChange={() => { }}
											modules={[]}
										/>
									</div>
								</div>

								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="product-name">
											Information in Exported Orders
										</label>
										<MultiCheckBox
											wrapperClass="checkbox-list-side-by-side"
											descClass="settings-metabox-description"
											description={exportedOrderInfoField.desc}
											inputWrapperClass="toggle-checkbox-header"
											inputInnerWrapperClass="default-checkbox"
											inputClass={exportedOrderInfoField.class}
											idPrefix="category"
											selectDeselect
											options={exportedOrderInfoField.options}
											value={normalizeValue(exportedOrderInfoField.key)}
											onChange={(e: any) => {
												if (Array.isArray(e)) {
													handleInputChange(exportedOrderInfoField.key, e);
													return;
												}

												if (e?.target) {
													const val = String(e.target.value);
													const checked = !!e.target.checked;
													let current = normalizeValue(exportedOrderInfoField.key);

													current = checked
														? [...new Set([...current, val])]
														: current.filter((v) => v !== val);

													handleInputChange(exportedOrderInfoField.key, current);
												}
											}}
											onMultiSelectDeselectChange={() =>
												handleSelectDeselect(exportedOrderInfoField)
											}
											proSetting={false}
											moduleChange={() => { }}
											modules={[]}
										/>
									</div>
								</div>

								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="product-name">
											Information in Order Emails
										</label>
										<MultiCheckBox
											wrapperClass="checkbox-list-side-by-side"
											descClass="settings-metabox-description"
											description={orderEmailInfoField.desc}
											inputWrapperClass="toggle-checkbox-header"
											inputInnerWrapperClass="default-checkbox"
											inputClass={orderEmailInfoField.class}
											idPrefix="category"
											selectDeselect
											options={orderEmailInfoField.options}
											value={normalizeValue(orderEmailInfoField.key)}
											onChange={(e: any) => {
												if (Array.isArray(e)) {
													handleInputChange(orderEmailInfoField.key, e);
													return;
												}

												if (e?.target) {
													const val = String(e.target.value);
													const checked = !!e.target.checked;
													let current = normalizeValue(orderEmailInfoField.key);

													current = checked
														? [...new Set([...current, val])]
														: current.filter((v) => v !== val);

													handleInputChange(orderEmailInfoField.key, current);
												}
											}}
											onMultiSelectDeselectChange={() =>
												handleSelectDeselect(orderEmailInfoField)
											}
											proSetting={false}
											moduleChange={() => { }}
											modules={[]}
										/>
									</div>
								</div>
							</div>
						</div>

						<div className="card-content">
							<div className="card-header">
								<div className="left">
									<div className="title">Additional Features & Settings</div>
								</div>
							</div>
							<div className="card-body">
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="product-name">
											Vendor Storefront Capabilities
										</label>
										<MultiCheckBox
											wrapperClass="checkbox-list-side-by-side"
											descClass="settings-metabox-description"
											description={vendorStorefrontField.desc}
											inputWrapperClass="toggle-checkbox-header"
											inputInnerWrapperClass="default-checkbox"
											inputClass={vendorStorefrontField.class}
											idPrefix="product-type"
											selectDeselect
											options={vendorStorefrontField.options}
											value={normalizeValue(vendorStorefrontField.key)}
											onChange={(e: any) => {
												if (Array.isArray(e)) {
													handleInputChange(vendorStorefrontField.key, e);
													return;
												}

												if (e?.target) {
													const val = String(e.target.value);
													const checked = !!e.target.checked;
													let current = normalizeValue(vendorStorefrontField.key);

													current = checked
														? [...new Set([...current, val])]
														: current.filter((v) => v !== val);

													handleInputChange(vendorStorefrontField.key, current);
												}
											}}
											onMultiSelectDeselectChange={() =>
												handleSelectDeselect(vendorStorefrontField)
											}
											proSetting={false}
											moduleChange={() => { }}
											modules={[]}
										/>
									</div>
								</div>

								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="product-name">
											Include All Add-ons
										</label>
										<MultiCheckBox
											wrapperClass="checkbox-list-side-by-side"
											descClass="settings-metabox-description"
											description={advancedFeaturesField.desc}
											inputWrapperClass="toggle-checkbox-header"
											inputInnerWrapperClass="default-checkbox"
											inputClass={advancedFeaturesField.class}
											idPrefix="category"
											selectDeselect
											options={advancedFeaturesField.options}
											value={normalizeValue(advancedFeaturesField.key)}
											onChange={(e: any) => {
												if (Array.isArray(e)) {
													handleInputChange(advancedFeaturesField.key, e);
													return;
												}

												if (e?.target) {
													const val = String(e.target.value);
													const checked = !!e.target.checked;
													let current = normalizeValue(advancedFeaturesField.key);

													current = checked
														? [...new Set([...current, val])]
														: current.filter((v) => v !== val);

													handleInputChange(advancedFeaturesField.key, current);
												}
											}}
											onMultiSelectDeselectChange={() =>
												handleSelectDeselect(advancedFeaturesField)
											}
											proSetting={false}
											moduleChange={() => { }}
											modules={[]}
										/>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="card-wrapper column w-35">
						<div className="card-content">
							<div className="card-header">
								<div className="left">
									<div className="title">
										Pricing
									</div>
								</div>
							</div>
							<div className="card-body">
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="product-name">
											Membership type
										</label>
										<ToggleSetting
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											options={[
												{
													key: 'free',
													value: 'free',
													label: __(
														'Free',
														'multivendorx'
													),
												},
												{
													key: 'paid',
													value: 'paid',
													label: __(
														'Paid',
														'multivendorx'
													),
												},
											]}
											value={pricingType}
											onChange={(value: string) =>
												setPricingType(
													value as 'free' | 'paid'
												)
											}
										/>
									</div>
								</div>
								{pricingType === 'paid' && (
									<>
										<div className="form-group-wrapper">
											<div className="form-group">
												<label htmlFor="product-name">Sign up fee</label>
												<BasicInput
													name="name"
													wrapperClass="setting-form-input"
													descClass="settings-metabox-description"
													value={formData.name}
													onChange={handleChange}
													pInsideText={"$"}
												/>
											</div>
											<div className="form-group">
												<label htmlFor="product-name">Recurring price</label>
												<BasicInput
													name="name"
													wrapperClass="setting-form-input"
													descClass="settings-metabox-description"
													value={formData.name}
													onChange={handleChange}
												/>
											</div>
										</div>
										<div className="settings-metabox-note">
											<div className="metabox-note-wrapper">
												<i className="adminlib-info"></i>
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
										<div className="form-group-wrapper">
											<div className="form-group">
												<label htmlFor="">Offer a trial period</label>
												<NestedComponent
													id="role_rules"
													fields={subscription}
													value={rules}
													single={true}
													addButtonLabel="Add Rule"
													deleteButtonLabel="Remove"
													onChange={(val) => setRules(val)}
												/>
											</div>
										</div>
										<div className="card-header">
											<div className="left">
												<div className="title">
													After Expiry
												</div>
												<div className="des">Define what happens when subscription expires</div>
											</div>
										</div>
										<div className="form-group-wrapper">
											<div className="form-group">
												<label htmlFor="">Offer grace period</label>
												<NestedComponent
													id="role_rules"
													fields={gracePeriod}
													value={rules}
													single={true}
													addButtonLabel="Add Rule"
													deleteButtonLabel="Remove"
													onChange={(val) => setRules(val)}
												/>
											</div>
										</div>
									</>
								)}
							</div>
						</div>
						<div className="card-content">
							<div className="card-header">
								<div className="left">
									<div className="title">Commission rules</div>
								</div>
							</div>
							<div className="card-body">
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="product-name">
											Commission type
										</label>
										<NestedComponent
											id="role_rules"
											fields={nestedFields}
											value={rules}
											single={true}
											addButtonLabel="Add Rule"
											deleteButtonLabel="Remove"
											onChange={(val) => setRules(val)}
										/>
									</div>
								</div>
							</div>
						</div>
						<div className="card-content">
							<div className="card-header">
								<div className="left">
									<div className="title">AI usage & limits</div>
								</div>
							</div>
							<div className="card-body">
								<div className="form-group-wrapper">
									<div className="form-group">
										<MultiCheckBox
											wrapperClass="toggle-btn"
											inputWrapperClass="toggle-checkbox-header"
											inputInnerWrapperClass="toggle-checkbox"
											idPrefix="toggle-switch-sold-individually"
											type="checkbox"
											value={aiFeatures ? ['ai_usage'] : []}
											preText={"Product limits & pricing"}
											onChange={(e) =>
												setAiFeatures(
													(e as React.ChangeEvent<HTMLInputElement>)
														.target.checked
												)
											}
											options={[
												{
													key: 'ai_usage',
													value: 'ai_usage',
												},
											]}
										/>
									</div>
								</div>
								{aiFeatures && (
									<>
										<div className="form-group-wrapper">
											<div className="form-group row">
												<label htmlFor="">Maximum products upload allowed</label>
												<BasicInput
													name="name"
													wrapperClass="setting-form-input"
													descClass="settings-metabox-description"
													value={formData.name}
													onChange={handleChange}
													postInsideText={'max'}
													size="8rem"
												/>
											</div>
										</div>
										<div className="form-group-wrapper">
											<div className="form-group row">
												<label htmlFor="">Charge per extra product</label>
												<BasicInput
													name="name"
													wrapperClass="setting-form-input"
													descClass="settings-metabox-description"
													value={formData.name}
													onChange={handleChange}
													postInsideText={'min'}
													size="6rem"
												/>
											</div>
										</div>
										<div className="form-group-wrapper">
											<div className="form-group row">
												<label htmlFor="">Images per product</label>
												<BasicInput
													name="name"
													wrapperClass="setting-form-input"
													descClass="settings-metabox-description"
													value={formData.name}
													onChange={handleChange}
													postInsideText={'max'}
													size="8rem"
												/>
											</div>
										</div>
										<div className="form-group-wrapper">
											<div className="form-group row">
												<label htmlFor="">Featured products allowed</label>
												<BasicInput
													name="name"
													wrapperClass="setting-form-input"
													descClass="settings-metabox-description"
													value={formData.name}
													onChange={handleChange}
													postInsideText={'max'}
													size="8rem"
												/>
											</div>
										</div>
									</>
								)}

								<div className="form-group-wrapper">
									<div className="form-group">
										<MultiCheckBox
											wrapperClass="toggle-btn"
											inputWrapperClass="toggle-checkbox-header"
											inputInnerWrapperClass="toggle-checkbox"
											idPrefix="toggle-switch-sold-individually"
											type="checkbox"
											value={featuredProducts ? ['featured_products'] : []}
											preText={"AI usage and limits"}
											onChange={(e) =>
												setfeaturedProducts(
													(e as React.ChangeEvent<HTMLInputElement>)
														.target.checked
												)
											}
											options={[
												{
													key: 'featured_products',
													value: 'featured_products',
												},
											]}
										/>
									</div>
								</div>

								{featuredProducts && (
									<>
										<div className="form-group-wrapper">
											<div className="form-group row">
												<label htmlFor="">Featured products allowed</label>
												<BasicInput
													name="name"
													wrapperClass="setting-form-input"
													descClass="settings-metabox-description"
													value={formData.name}
													onChange={handleChange}
													postInsideText={'max'}
													size="8rem"
												/>
											</div>
										</div>
										<div className="form-group-wrapper">
											<div className="form-group row">
												<label htmlFor="">AI image credits per store</label>
												<BasicInput
													name="name"
													wrapperClass="setting-form-input"
													descClass="settings-metabox-description"
													value={formData.name}
													onChange={handleChange}
													postInsideText={'max'}
													size="8rem"
												/>
											</div>
										</div>
									</>
								)}
							</div>
						</div>

						<div className="card-content">
							<div className="card-header">
								<div className="left">
									<div className="title">Membership Perks</div>
								</div>
							</div>
							<div className="card-body">
								<div className="membership-features">

									<div className="buttons-wrapper">
										<button
											type="button"
											className="admin-btn btn-red"
											onClick={clearAll}
										>
											<i className="adminlib-delete"></i> Clear All
										</button>
										<button
											type="button"
											className="admin-btn btn-purple"
											onClick={addFeature}
										>
											<i className="adminlib-plus"></i>	Add Feature
										</button>
									</div>

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
							</div>
						</div>
						{/* <div className="card-content">
							<div className="card-header">
								<div className="left">
									<div className="title">
										Product benefits
									</div>
								</div>
							</div>
							<div className="card-body">
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="">
											Control whether stores can add products,
										</label>

										<NestedComponent
											id="product_upload_settings"
											fields={productUploadSettings}
											value={rules}
											single={true}
											addButtonLabel="Add Rule"
											deleteButtonLabel="Remove"
											onChange={(val) => setRules(val)}
										/>
									</div>
								</div>
							</div>
						</div> */}

						<div className="card-content">
							<div className="card-header">
								<div className="left">
									<div className="title">Membership Perks</div>
								</div>
							</div>
							<div className="card-body">
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="product-name">
											Maximum products upload allowed
										</label>
										<BasicInput
											name="name"
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											value={formData.name}
											onChange={handleChange}
										/>
									</div>
									<div className="form-group">
										<label htmlFor="product-name">
											Maximum products upload allowed
										</label>
										<BasicInput
											name="name"
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											value={formData.name}
											onChange={handleChange}
											postInsideText={"%"}
											size="8rem"
										/>
									</div>
								</div>
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="product-name">
											Images allowed per product
										</label>
										<BasicInput
											name="name"
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											value={formData.name}
											onChange={handleChange}
										/>
									</div>
									<div className="form-group">
										<label htmlFor="product-name">
											Maximum featured Products Allowed
										</label>
										<BasicInput
											name="name"
											wrapperClass="setting-form-input"
											descClass="settings-metabox-description"
											value={formData.name}
											onChange={handleChange}
										/>
									</div>
								</div>
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="product-name">
											Featured products
										</label>
										<MultiCheckBox
											wrapperClass="toggle-btn"
											inputWrapperClass="toggle-checkbox-header"
											inputInnerWrapperClass="toggle-checkbox"
											idPrefix="toggle-switch-sold-individually"
											type="checkbox"
											value={featuredEnabled ? ['sold_individually'] : []}
											onChange={(e) =>
												setFeaturedEnabled(
													(e as React.ChangeEvent<HTMLInputElement>)
														.target.checked
												)
											}
											options={[
												{
													key: 'sold_individually',
													value: 'sold_individually',
												},
											]}
										/>
									</div>
									{featuredEnabled && (
										<div className="form-group">
											<BasicInput
												name="name"
												wrapperClass="setting-form-input"
												descClass="settings-metabox-description"
												value={formData.name}
												onChange={handleChange}
												postInsideText={"product"}
												preText={"Upto"}
												size="10rem"
											/>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div >
		</>
	);
};

export default Membership;