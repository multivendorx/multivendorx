import { useEffect, useRef, useState } from 'react';
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
	RadioInput,
	Section,
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
const storeRole = [
	{
		value: 'simple',
		label: 'Keep Products Visible',
	},
	{
		value: 'variable',
		label: 'After 2 cycles',
	},
	{
		value: 'external',
		label: 'Hide Products',
	},
	{
		value: 'downloadable',
		label: 'Set to Draft',
	},
];
const duringThisPeriod = [
	{
		value: 'simple',
		label: 'Visible',
	},
	{
		value: 'variable',
		label: 'Hidden',
	},
	{
		value: 'external',
		label: 'Hide Products',
	},
	{
		value: 'downloadable',
		label: 'Set to Draft',
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
	desc: 'Enable advanced features for stores',
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
const whenLimitReached = {
	key: 'exported_order_information',
	look: 'checkbox',
	selectDeselect: true,
	class: 'basic-checkbox',
	options: [
		{ key: 'advanced_inventory', value: 'advanced_inventory', label: __('Block creation', 'multivendorx'), desc: __('Prevent stores from adding more items', 'multivendorx') },
		{ key: 'shipping_management', value: 'shipping_management', label: __('Allow but warn', 'multivendorx'), desc: __('Show warning but allow creation', 'multivendorx') },
		{ key: 'import_export_tools', value: 'import_export_tools', label: __('Auto-upgrade suggestion', 'multivendorx'), desc: __('Prompt to upgrade plan', 'multivendorx') },],
};
const addonIncludes = {
	key: 'addon_includes',
	look: 'checkbox',
	selectDeselect: true,
	options: [
	{
		key: 'products',
		value: 'products',
		label: __('Products (+50 items)', 'multivendorx'),
	},
	{
		key: 'categories',
		value: 'categories',
		label: __('Categories (+10 max)', 'multivendorx'),
	},
	{
		key: 'storage',
		value: 'storage',
		label: __('Storage (+5 GB)', 'multivendorx'),
	},
	{
		key: 'staff_accounts',
		value: 'staff_accounts',
		label: __('Staff Accounts (+2 users)', 'multivendorx'),
	},
	{
		key: 'coupons',
		value: 'coupons',
		label: __('Coupons (+10 active)', 'multivendorx'),
	},
	{
		key: 'images_per_listing',
		value: 'images_per_listing',
		label: __('Images per Listing (+5 images)', 'multivendorx'),
	},
	{
		key: 'ai_credits',
		value: 'ai_credits',
		label: __('AI Credits (+100 credits)', 'multivendorx'),
	},
]
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
	const visibilityRef = useRef<HTMLDivElement | null>(null);
	const [product, setProduct] = useState({});
	const [formData, setFormData] = useState<{ [key: string]: string }>({});
	const [graceEnabled, setGraceEnabled] = useState<string[]>([]);
	const [pricingType, setPricingType] = useState<'free' | 'paid'>('free');
	const [selectedValues, setSelectedValues] = useState<string[]>([]);
	const [starFill, setstarFill] = useState(false);
	const [rules, setRules] = useState<any[]>([]);
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [isEditingVisibility, setIsEditingVisibility] = useState(false);
	const [catalogVisibility, setCatalogVisibility] = useState<string>('draft');
	const [trialEnabled, setTrialEnabled] = useState<string[]>([]);
	useEffect(() => {
		if (product?.catalog_visibility) {
			setCatalogVisibility(product.catalog_visibility);
		}
	}, [product]);
	const [features, setFeatures] = useState([]);
	const [editingIndex, setEditingIndex] = useState(null);
	const [editingValue, setEditingValue] = useState('');
	const [newValue, setNewValue] = useState('');



	const VISIBILITY_LABELS: Record<string, string> = {
		draft: __('Draft', 'multivendorx'),
		publish: __('Published', 'multivendorx'),
		pending: __('Pending Review', 'multivendorx'),
	};
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				visibilityRef.current &&
				!visibilityRef.current.contains(event.target as Node)
			) {
				setIsEditingVisibility(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

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
	const editRowRef = useRef(null);
	useEffect(() => {
		if (editingIndex === null) return;

		const handleClickOutside = (e) => {
			if (
				editRowRef.current &&
				!editRowRef.current.contains(e.target)
			) {
				cancelEdit();
			}
		};

		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [editingIndex]);

	const addFeature = () => {
		if (!newValue.trim()) return;
		setFeatures(prev => [...prev, newValue]);
		setNewValue('');
	};
	const startEdit = (index) => {
		setEditingIndex(index);
		setEditingValue(features[index]);
	};
	const saveEdit = () => {
		if (!editingValue.trim()) return;

		setFeatures(prev =>
			prev.map((item, index) =>
				index === editingIndex ? editingValue : item
			)
		);

		setEditingIndex(null);
		setEditingValue('');
	};
	const cancelEdit = () => {
		setEditingIndex(null);
		setEditingValue('');
	};

	const deleteFeature = (index) => {
		setFeatures(prev => prev.filter((_, i) => i !== index));

		if (editingIndex === index) {
			cancelEdit();
		}
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

	// checklish hide show 
	const [isChecklistOpen, setIsChecklistOpen] = useState(false);

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
					<Column>
						<div className={`checklist-process-wrapper row ${isChecklistOpen ? 'hide' : 'show'}`}>
							{/* <div className="checklist-title"><i className="adminfont-star"></i><span> Recommended </span></div> */}
							<ul>
								<li className="checked">
									<div className="details-wrapper">
										<div className="check-icon"><span></span></div>
										<div className="details">
											<div className="title">Plan Name</div>
											<div className="des">A clear, descriptive title that helps stores identify your plan</div>
										</div>
									</div>
								</li>
								<li className="checked">
									<div className="details-wrapper">
										<div className="check-icon"><span></span></div>
										<div className="details">
											<div className="title">Description</div>
											<div className="des">Explain what this plan offers to stores</div>
										</div>
									</div>
								</li>
								<li className="visite">
									<div className="details-wrapper">
										<div className="check-icon"><span></span></div>
										<div className="details">
											<div className="title">Features</div>
											<div className="des">Select premium features for this plan</div>
										</div>
									</div>
								</li>
								<li className="not-visite">
									<div className="details-wrapper">
										<div className="check-icon"><span></span></div>
										<div className="details">
											<div className="title">Pricing</div>
											<div className="des">Set competitive prices including any sale or discount options</div>
										</div>
									</div>
								</li>
								<li className="not-visite">
									<div className="details-wrapper">
										<div className="check-icon"><span></span></div>
										<div className="details">
											<div className="title">Permissions</div>
											<div className="des">Configure store permissions and limits</div>
										</div>
									</div>
								</li>
							</ul>
							<div className="right-arrow checklist-arrow absolute" onClick={() => setIsChecklistOpen((prev) => !prev)}>
								<i className="adminfont-arrow-right"></i>
							</div>
						</div>
					</Column>
					{isChecklistOpen && (
						<div className="right-arrow checklist-arrow fixed" onClick={() => setIsChecklistOpen((prev) => !prev)}>
							<i className="adminfont-arrow-left"></i>
						</div>
					)}
					<Column grid={8}>
						<Card contentHeight
							title="Plan details"
							action={
								<>
									<div className="field-wrapper">
										<div className="catalog-visibility">
											<span className="catalog-visibility-value">
												{VISIBILITY_LABELS[catalogVisibility]}
											</span>

											<span
												onClick={() => {
													setIsEditingVisibility((prev) => !prev);
												}}

											>
												<i className="adminfont-keyboard-arrow-down" />
											</span>
										</div>
										{isEditingVisibility && (
											<div className="setting-dropdown">
												<FormGroup>
													<RadioInput
														name="catalog_visibility"
														idPrefix="catalog_visibility"
														type="radio"
														wrapperClass="settings-form-group-radio"
														inputWrapperClass="radio-basic-input-wrap"
														inputClass="setting-form-input"
														descClass="settings-metabox-description"
														activeClass="radio-select-active"
														radiSelectLabelClass="radio-label"
														options={[
															{
																key: 'draft',
																value: 'draft',
																label: __('Draft', 'multivendorx'),
															},
															{
																key: 'publish',
																value: 'publish',
																label: __('Published', 'multivendorx'),
															},
															{
																key: 'pending',
																value: 'pending',
																label: __('Pending Review', 'multivendorx'),
															},
														]}
														value={catalogVisibility}
														onChange={(e) => {
															const value = e.target.value;
															setCatalogVisibility(value);
															handleChange('catalog_visibility', value);
															setIsEditingVisibility(false);
														}}
													/>

												</FormGroup>
											</div>
										)}
										{/* <div
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
									</div> */}
									</div>
									<label
										onClick={() => setstarFill((prev) => !prev)}
										style={{ cursor: 'pointer' }}
										className="field-wrapper"
									>
										{__('Mark as recommended plan', 'multivendorx')}
										<i className={`star-icon ${starFill ? 'adminfont-star' : 'adminfont-star-o'}`} />
									</label>
								</>
							}
						>
							<FormGroupWrapper>
								<FormGroup label="Name" htmlFor="product-name" desc={__('A unique name for your membership plan', 'multivendorx')}>
									<BasicInput
										name="name"
										value={formData.name}
										onChange={handleChange}
									/>
								</FormGroup>
								<FormGroup label="Description" htmlFor="short_description" desc={__('A short description displayed on product and checkout pages', 'multivendorx')}>
									<TextArea
										name="short_description"
									/>
								</FormGroup>
							</FormGroupWrapper>
						</Card>
						<Card contentHeight title={__('Plan highlights', 'multivendorx')}>
							<FormGroupWrapper>
								<FormGroup cols={3} label={__('Upload image', 'multivendorx')}>
									<FileInput
										// value={formData.image || ''}
										inputClass="form-input"
										name="image"
										type="hidden"
										// imageSrc={imagePreview || ''}
										imageWidth={75}
										imageHeight={75}
									// openUploader={__(
									// 	'Upload Image',
									// 	'multivendorx'
									// )}
									// onButtonClick={() =>
									// 	runUploader('image')
									// }
									// onRemove={() =>
									// 	handleRemoveImage('image')
									// }
									// onReplace={() =>
									// 	handleReplaceImage('image')
									// }
									/>
								</FormGroup>
								<FormGroup cols={2} label={__('Features list', 'multivendorx')}>
									<div className="membership-features">
										<div className="features-list">
											{features.map((feature, index) => (
												<div className="feature-row" key={index} ref={editingIndex === index ? editRowRef : null}>
													{editingIndex === index ? (
														<>
															<TextArea
																value={editingValue}
																onChange={(e) => setEditingValue(e.target.value)}
																onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
																onKeyDown={(e) => {
																	if (e.key === 'Enter' && !e.shiftKey) {
																		e.preventDefault();
																		saveEdit();
																	}
																}}
																autoFocus
																rowNumber={2}
															/>
															<span className="admin-badge green" onClick={() => saveEdit()}><i className="adminfont-edit"></i></span>
														</>
													) : (
														<div className="feature-name">
															<span className="feature-number">{index + 1}</span>
															{feature}

															<div className="edit-buttons">
																<div
																	className="admin-badge blue"
																	onClick={() => startEdit(index)}
																>
																	<i className="adminfont-edit"></i>
																</div>

																<div
																	className="admin-badge red"
																	onClick={() => deleteFeature(index)}
																>
																	<i className="adminfont-delete"></i>
																</div>
															</div>
														</div>
													)}

												</div>
											))}

											<div className="feature-row">
												<TextArea
													value={newValue}
													onChange={(e) => setNewValue(e.target.value)}
													onKeyDown={(e) => e.key === 'Enter' && addFeature()}
													placeholder="Add new feature"
													onKeyDown={() => console.log('KEYDOWN FIRED')}
													rowNumber={2}
												/>

												<AdminButton
													buttons={[
														{
															icon: 'plus',
															text: __('Add new', 'multivendorx'),
															className: 'purple',
															onClick: addFeature,
														},
													]}
												/>
											</div>

										</div>
									</div>
								</FormGroup>
							</FormGroupWrapper>
						</Card>
					</Column>

					<Column grid={4}>
						<Card contentHeight title={__('Pricing', 'multivendorx')}>
							<FormGroupWrapper>
								<FormGroup
									label="Membership type"
									htmlFor="membership_type"
								>
									<ToggleSetting
										wrapperClass="full-width"
										options={[
											{
												key: 'free',
												value: 'free',
												label: __('Free', 'multivendorx'),
												desc: __('No charges', 'multivendorx'),
											},
											{
												key: 'paid',
												value: 'paid',
												label: __('One-time Payment', 'multivendorx'),
												desc: __('Lifetime access', 'multivendorx'),
											},
											{
												key: 'subscription',
												value: 'subscription',
												label: __('Subscription', 'multivendorx'),
												desc: __('Recurring', 'multivendorx'),
											},
										]}
										value={pricingType}
										onChange={(value: string) =>
											setPricingType(value as 'free' | 'paid' | 'subscription')
										}
									/>
								</FormGroup>
							</FormGroupWrapper>

							{pricingType === 'paid' && (
								<>
									<FormGroupWrapper>
										<FormGroup
											label="Signup Fee (Optional)"
											htmlFor="recurring_price"
											cols={2}
										>
											<BasicInput
												name="recurring_price"
												value={formData.recurring_price}
												onChange={handleChange}
												preInsideText="$"
											/>
										</FormGroup>
										<FormGroup
											label="Billing Cycle"
											htmlFor="recurring_price"
											cols={2}
										>
											<BasicInput
												name="recurring_price"
												postInsideText="Monthly"
												value={formData.recurring_price}
												onChange={handleChange}
												postInsideText={{
													type: 'select',
													key: 'store_base',
													size: '7rem',
													options: [
														{ 'value': 'Monthly', 'label': 'Monthly' },
														{ 'value': 'Day', 'label': 'Day' }
													],
												}}
											/>
										</FormGroup>
									</FormGroupWrapper>
								</>
							)}

							{pricingType === 'subscription' && (
								<FormGroupWrapper>
									<FormGroup
										label="Signup Fee (Optional)"
										htmlFor="recurring_price"
										cols={2}
									>
										<BasicInput
											name="recurring_price"
											value={formData.recurring_price}
											onChange={handleChange}
											preInsideText="$"
										/>
									</FormGroup>
									<FormGroup
										label="Billing Cycle"
										htmlFor="recurring_price"
										cols={2}
									>
										<BasicInput
											name="recurring_price"
											postInsideText="Monthly"
											value={formData.recurring_price}
											onChange={handleChange}
											postInsideText={{
												type: 'select',
												key: 'store_base',
												size: '7rem',
												options: [
													{ 'value': 'Monthly', 'label': 'Monthly' },
													{ 'value': 'Day', 'label': 'Day' }
												],
											}}
										/>
									</FormGroup>
									<label
										onClick={() => setstarFill((prev) => !prev)}
										style={{ cursor: 'pointer' }}
										className="field-wrapper"
									>
										{__('Apply tax to plan price', 'multivendorx')}
										<i className={`star-icon ${starFill ? 'adminfont-star' : 'adminfont-star-o'}`} />
									</label>
									<div className="settings-metabox-note">
										<div className="metabox-note-wrapper">
											<i className="adminfont-info"></i>
											<div className="details">
												<p>Activate Stripe Marketplace or PayPal Marketplace module to use recurring subscriptions.</p>
												<p>Sign-up fee 0.05 or more is required to create subscriptions in Stripe/PayPal</p>
											</div>
										</div>
									</div>
								</FormGroupWrapper>
							)}
						</Card>
						<Card
							contentHeight title={__('Trial period', 'multivendorx')}
							desc={__('Configure optional trial period for new members', 'multivendorx')}
							action={
								<>
									<div className="field-wrapper">
										{/* {__('Offer a trial period', 'multivendorx')} */}
										<MultiCheckBox
											wrapperClass="toggle-btn"
											inputWrapperClass="toggle-checkbox-header"
											inputInnerWrapperClass="toggle-checkbox"
											idPrefix="toggle-switch-manage-stock"
											type="checkbox"
											value={trialEnabled}
											onChange={(value) => {
												if (Array.isArray(value)) {
													setTrialEnabled(value);
												} else if (value?.target) {
													const { checked, value: v } = value.target as HTMLInputElement;
													setTrialEnabled((prev) =>
														checked
															? [...prev, v]
															: prev.filter((item) => item !== v)
													);
												}
											}}
											options={[
												{ key: 'trial', value: 'trial', },
											]}
										/>
									</div>
								</>
							}>
							{trialEnabled.includes('trial') && (
								<FormGroupWrapper>
									<FormGroup cols={2} label="For a duration of" htmlFor="trial_period">
										<BasicInput
											name="name"
											value={formData.name}
											onChange={handleChange}
											postInsideText="days"
										/>
									</FormGroup>
									<FormGroup cols={2}></FormGroup>
								</FormGroupWrapper>
							)}
						</Card>
						<Card
							contentHeight title={__('After expiry', 'multivendorx')}
							desc={__('Define what happens when subscription expires', 'multivendorx')}
							action={
								<>
									<div className="field-wrapper">
										{/* {__('Offer grace period', 'multivendorx')} */}
										<MultiCheckBox
											wrapperClass="toggle-btn"
											inputWrapperClass="toggle-checkbox-header"
											inputInnerWrapperClass="toggle-checkbox"
											idPrefix="toggle-switch-grace"
											type="checkbox"
											value={graceEnabled}
											onChange={(value) => {
												if (Array.isArray(value)) {
													setGraceEnabled(value);
												} else if (value?.target) {
													const { checked, value: v } = value.target as HTMLInputElement;
													setGraceEnabled((prev) =>
														checked
															? [...prev, v]
															: prev.filter((item) => item !== v)
													);
												}
											}}

											options={[
												{ key: 'grace', value: 'grace', },
											]}
										/>
									</div>
								</>
							}>
							{graceEnabled.includes('grace') && (
								<>
									<FormGroupWrapper>
										<FormGroup cols={2} label="For a duration of" htmlFor="trial_period">
											<BasicInput
												name="name"
												value={formData.name}
												onChange={handleChange}
												postInsideText="days"
												size="8rem"
											/>
										</FormGroup>
										<FormGroup cols={2} label="During this period, products are">
											<SelectInput
												name="product_type"
												type="multi-select"
												options={duringThisPeriod}
												value={duringThisPeriod.filter(opt =>
													selectedValues.includes(opt.value)
												)}
												onChange={(selected: any) => {
													// selected is array of option objects
													const values = selected?.map((opt: any) => opt.value) || [];
													setSelectedValues(values);
												}}
											/>
										</FormGroup>
										<FormGroup cols={2} label="Product creation">
											<ToggleSetting
												options={[
													{
														key: 'allowed',
														value: 'allowed',
														label: __('Allowed', 'multivendorx'),
													},
													{
														key: 'not-allowed',
														value: 'not-allowed',
														label: __('Not allowed', 'multivendorx'),
													},
												]}
											// value={pricingType}
											// onChange={(value: string) =>
											// 	setPricingType(value as 'free' | 'paid')
											// }
											/>
										</FormGroup>
										<FormGroup cols={2} label="Change the store role to">
											<SelectInput
												name="product_type"
												type="multi-select"
												options={storeRole}
												value={storeRole.filter(opt =>
													selectedValues.includes(opt.value)
												)}
												onChange={(selected: any) => {
													// selected is array of option objects
													const values = selected?.map((opt: any) => opt.value) || [];
													setSelectedValues(values);
												}}
											/>
										</FormGroup>
									</FormGroupWrapper>
								</>
							)}
						</Card>
						<Card contentHeight title={__('What this plan includes', 'multivendorx')}>
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
					</Column>
					<Column>
						<Section
							wrapperClass='divider-wrapper'
							hint={__('What stores can do with this plan', 'multivendorx')}
						// hint={ inputField.hint } 
						/>
					</Column>
					<Column grid={8}>
						<Card title={__('What stores can sell', 'multivendorx')}
							desc={__('Decide what kind of items stores are allowed to list on your marketplace.', 'multivendorx')}
						>
							<FormGroupWrapper>
								<FormGroup cols={2} label={__('Listing formats allowed', 'multivendorx')} desc={__('Choose the kinds of listings stores can create under this plan. Only selected types will be available when a store adds a new listing.', 'multivendorx')}>
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

								<FormGroup cols={2} label={__('Categories stores can list in', 'multivendorx')} desc={__('Limit where stores can list their products. This helps you control what your marketplace focuses on.')}>
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
										size={"18rem"}
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
					</Column>
					<Column grid={4}>
						<Card contentHeight title={__('Membership perks', 'multivendorx')}>
							<FormGroupWrapper>
								<FormGroup cols={2} label="Products" htmlFor="trial_period">
									<BasicInput
										name="name"
										value={formData.name}
										onChange={handleChange}
										postInsideText="items"
									/>
								</FormGroup>
								<FormGroup cols={2} label="Categories" htmlFor="trial_period">
									<BasicInput
										name="name"
										value={formData.name}
										onChange={handleChange}
										postInsideText="max"
									/>
								</FormGroup>
								<FormGroup cols={2} label="Storage" htmlFor="trial_period">
									<BasicInput
										name="name"
										value={formData.name}
										onChange={handleChange}
										postInsideText="GB"
									/>
								</FormGroup>
								<FormGroup cols={2} label="Staff Accounts" htmlFor="trial_period">
									<BasicInput
										name="name"
										value={formData.name}
										onChange={handleChange}
										postInsideText="users"
									/>
								</FormGroup>
								<FormGroup cols={2} label="Coupons" htmlFor="trial_period">
									<BasicInput
										name="name"
										value={formData.name}
										onChange={handleChange}
										postInsideText="active"
									/>
								</FormGroup>

								<FormGroup cols={2} label="Images per Listing">
									<BasicInput
										name="name"
										value={formData.name}
										onChange={handleChange}
										postInsideText={'images'}
									/>
								</FormGroup>
								<FormGroup cols={2}></FormGroup>
							</FormGroupWrapper>
						</Card>
						<Card contentHeight title={__('Additional resource pricing', 'multivendorx')}
						desc={__('Define the cost per unit when stores want to add more resources beyond their limits', 'multivendorx')}
						>
							<FormGroupWrapper>
								<FormGroup cols={2} label="Fixed addon price" htmlFor="trial_period">
									<BasicInput
										name="name"
										// value={formData.name}
										// onChange={handleChange}
										preInsideText="$"
										size="10rem"
									/>
								</FormGroup>
								<FormGroup label="What this addon includes" htmlFor="trial_period">
									<MultiCheckBox
										wrapperClass="checkbox-list-side-by-side"
										inputWrapperClass="toggle-checkbox-header"
										inputInnerWrapperClass="default-checkbox"
										idPrefix={addonIncludes.key}
										selectDeselect
										options={addonIncludes.options}
										value={normalizeValue(addonIncludes.key)}
										onChange={handleMultiCheckboxChange(addonIncludes.key)}
										onMultiSelectDeselectChange={() =>
											handleSelectDeselect(addonIncludes)
										}
										proSetting={false}
										moduleChange={() => { }}
										modules={[]}
									/>
								</FormGroup>
							</FormGroupWrapper>
						</Card>
						<Card contentHeight title={__('Usage Limits', 'multivendorx')}
						// desc={'Select which premium features stores can access with this plan.'}
						>
							<FormGroupWrapper>
								<FormGroup label="When limit reached" htmlFor="trial_period">
									<MultiCheckBox
										wrapperClass="checkbox-list-side-by-side"
										// description={whenLimitReached.desc}
										inputWrapperClass="toggle-checkbox-header"
										inputInnerWrapperClass="default-checkbox"
										inputClass={whenLimitReached.class}
										idPrefix={whenLimitReached.key}
										selectDeselect
										options={whenLimitReached.options}
										value={normalizeValue(whenLimitReached.key)}
										onChange={handleMultiCheckboxChange(whenLimitReached.key)}
										onMultiSelectDeselectChange={() =>
											handleSelectDeselect(whenLimitReached)
										}
										proSetting={false}
										moduleChange={() => { }}
										modules={[]}
									/>
								</FormGroup>
							</FormGroupWrapper>
						</Card>
						<Card contentHeight title={__('Additional resource pricing', 'multivendorx')} desc={__('Define the cost per unit when stores want to add more resources beyond their limits', 'multivendorx')}
						// desc={'Select which premium features stores can access with this plan.'}
						>
							<FormGroupWrapper>
								<FormGroup cols={2} label="Additional Products" htmlFor="trial_period">
									<BasicInput
										name="name"
										value={formData.name}
										onChange={handleChange}
										preInsideText="$"
									/>
								</FormGroup>
								<FormGroup cols={2} ></FormGroup>
							</FormGroupWrapper>
						</Card>
						<Card contentHeight title={__('AI tools available to stores', 'multivendorx')}
							desc={'Decide whether stores can use AI tools and how much they can use them.'}
						>
							<FormGroupWrapper>
								<FormGroup cols={2} label="AI for writing product details">
									<BasicInput
										name="name"
										value={formData.name}
										onChange={handleChange}
										postInsideText={'/month'}
									/>
								</FormGroup>
								<FormGroup cols={2} label="AI for writing product details">
									<BasicInput
										name="name"
										value={formData.name}
										onChange={handleChange}
										postInsideText={'/month'}
									/>
								</FormGroup>
							</FormGroupWrapper>
						</Card>
					</Column>
				</Container>
			</div>
		</>
	);
};

export default Membership;
