import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import {
	useModules,
	Card,
	Column,
	Container,
	FormGroupWrapper,
	FormGroup,
	getApiLink,
	BasicInputUI,
	MultiCheckBoxUI,
	SelectInputUI,
	useOutsideClick,
	TextAreaUI,
	FileInputUI,
	NavigatorHeader,
	InputWithSuggestions,
} from 'zyra';
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

const AddProduct = () => {
	const location = useLocation();
	const { modules } = useModules();
	const navigate = useNavigate();
	const siteUrl = appLocalizer.site_url.replace(/\/$/, '');
	const basePath = siteUrl.replace(window.location.origin, '');

	const query = new URLSearchParams(location.search);
	let productId = query.get('context_id');

	if (!productId) {
		const parts = location.pathname.split('/').filter(Boolean);
		productId = parts[parts.length - 1];
	}

	const [product, setProduct] = useState({});
	const [translation, setTranslation] = useState([]);

	const [featuredImage, setFeaturedImage] = useState(null);
	const [galleryImages, setGalleryImages] = useState([]);

	const [starFill, setstarFill] = useState(false);
	const visibilityRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!productId) {
			return;
		}

		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/products/${productId}`, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then(function (res) {
				const images = res.data.images || [];

				if (images.length > 0) {
					setFeaturedImage(images[0]);
				}

				setGalleryImages(images.slice(1));
				setProduct(res.data);
				setstarFill(res.data.featured);
			})
			.catch((error) => {
				console.error('Error fetching product:', error);
			});
		if (modules.includes('wpml')) {
			axios({
				method: 'GET',
				url: getApiLink(appLocalizer, 'multivendorx-wpml'),
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: { product_id: productId }
			})
				.then((response) => {
					setTranslation(response.data);
				})
				.catch(() => {
					setTranslation([])
				});
		}

	}, [productId]);

	const getMetaValue = (meta, key) =>
		meta?.find((m) => m.key === key)?.value || '';

	useEffect(() => {
		if (!product?.meta_data) return;

		setProduct((prev) => ({
			...prev,
			shipping_policy: getMetaValue(product.meta_data, 'multivendorx_shipping_policy'),
			refund_policy: getMetaValue(product.meta_data, 'multivendorx_refund_policy'),
			cancellation_policy: getMetaValue(product.meta_data, 'multivendorx_cancellation_policy'),
		}));
	}, [product?.meta_data]);

	const [categories, setCategories] = useState([]);
	const [selectedCats, setSelectedCats] = useState([]);
	const isPyramidEnabled = appLocalizer.settings_databases_value['product-preferencess'] ?.category_selection_method === 'yes';
	const wrapperRef = useRef(null);
	const [selectedCat, setSelectedCat] = useState(null);
	const [selectedSub, setSelectedSub] = useState(null);
	const [selectedChild, setSelectedChild] = useState(null);
	const [isEditingVisibility, setIsEditingVisibility] = useState(false);
	const [isEditingStatus, setIsEditingStatus] = useState(false);
	const [existingTags, setExistingTags] = useState([]);

	const VISIBILITY_LABELS: Record<string, string> = {
		visible: 'Shop and search results',
		catalog: 'Shop only',
		search: 'Search results only',
		hidden: 'Hidden',
	};

	const STATUS_LABELS: Record<string, string> = {
		draft: __('Draft', 'multivendorx'),
		publish: __('Published', 'multivendorx'),
		pending: __('Submit', 'multivendorx'),
	};

	useOutsideClick(visibilityRef, () => setIsEditingVisibility(false));

	// Add this useEffect in AddProduct to listen for suggestion clicks
	useEffect(() => {
		const handleAISuggestion = (event) => {
			const { field, value } = event.detail;

			// Update the appropriate field based on suggestion type
			switch (field) {
				case 'name':
					setProduct((prev) => ({ ...prev, name: value }));
					break;
				case 'short_description':
					setProduct((prev) => ({
						...prev,
						short_description: value,
					}));
					break;
				case 'description':
					setProduct((prev) => ({
						...prev,
						description: value,
					}));
					break;
				default:
					break;
			}
		};

		window.addEventListener('ai-suggestion-selected', handleAISuggestion);

		return () => {
			window.removeEventListener(
				'ai-suggestion-selected',
				handleAISuggestion
			);
		};
	}, []);

	const handleCategoryClick = (catId) => {
		if (!isPyramidEnabled) {
			return;
		}
		setSelectedCat(catId);
		setSelectedSub(null);
		setSelectedChild(null);
	};

	const handleSubClick = (subId) => {
		if (!isPyramidEnabled) {
			return;
		}
		setSelectedSub(subId);
		setSelectedChild(null);
	};

	const handleChildClick = (childId) => {
		if (!isPyramidEnabled) {
			return;
		}
		setSelectedChild(childId);
	};

	// Breadcrumb path click resets below levels
	const handlePathClick = (level) => {
		if (!isPyramidEnabled) {
			return;
		}
		if (level === 'category') {
			setSelectedSub(null);
			setSelectedChild(null);
		}
		if (level === 'sub') {
			setSelectedChild(null);
		}
	};

	const printPath = () => {
		if (!isPyramidEnabled) {
			return;
		}
		const cat = treeData.find((c) => c.id === selectedCat);

		const sub = cat?.children?.find((s) => s.id === selectedSub);

		const child = sub?.children?.find((c) => c.id === selectedChild);

		return (
			<>
				{cat && (
					<span onClick={() => handlePathClick('category')}>
						{cat.name}
					</span>
				)}

				{sub && (
					<>
						{' / '}
						<span onClick={() => handlePathClick('sub')}>
							{sub.name}
						</span>
					</>
				)}

				{child && (
					<>
						{' / '}
						<span>{child.name}</span>
					</>
				)}
			</>
		);
	};

	// Reset all
	const resetSelection = () => {
		setSelectedCat(null);
		setSelectedSub(null);
		setSelectedChild(null);
	};

	const [treeData, setTreeData] = useState([]);

	const buildTree = (list, parent = 0) =>
		list
			.filter((item) => item.parent === parent)
			.map((item) => ({
				id: item.id,
				name: item.name,
				children: buildTree(list, item.id),
			}));

	useEffect(() => {
		if (categories.length) {
			setTreeData(buildTree(categories));
		}
	}, [categories]);

	const preselectCategory = (savedId) => {
		for (const cat of treeData) {
			if (cat.id === savedId) {
				setSelectedCat(cat.id);
				return;
			}

			for (const sub of cat.children) {
				if (sub.id === savedId) {
					setSelectedCat(cat.id);
					setSelectedSub(sub.id);
					return;
				}

				for (const child of sub.children) {
					if (child.id === savedId) {
						setSelectedCat(cat.id);
						setSelectedSub(sub.id);
						setSelectedChild(child.id);
						return;
					}
				}
			}
		}
	};

	useEffect(() => {
		if (!isPyramidEnabled) {
			return;
		}
		const id = selectedChild || selectedSub || selectedCat;

		if (id) {
			setProduct((prev) => ({
				...prev,
				categories: [{ id: Number(id) }],
			}));
		}
	}, [selectedCat, selectedSub, selectedChild]);

	const preselectedRef = useRef(false);

	useEffect(() => {
		if (preselectedRef.current) {
			return;
		}

		if (treeData.length && product?.categories?.length) {
			const savedId = product.categories[0].id;
			preselectCategory(savedId);
			preselectedRef.current = true;
		}
	}, [treeData, product]);

	useEffect(() => {
		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/products/categories`, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					per_page: 100,
				},
			})
			.then((res) => setCategories(res.data));
	}, []);

	useEffect(() => {
		if (product && product.categories) {
			setSelectedCats(product.categories.map((c) => c.id));
		}
	}, [product]);

	const toggleCategory = (id) => {
		setSelectedCats((prev) =>
			prev.includes(id)
				? prev.filter((item) => item !== id)
				: [...prev, id]
		);
	};

	const buildCategoryTree = (categories) => {
		const map = {};
		const roots = [];

		categories.forEach((cat) => {
			map[cat.id] = { ...cat, children: [] };
		});

		categories.forEach((cat) => {
			if (cat.parent === 0) {
				roots.push(map[cat.id]);
			} else if (map[cat.parent]) {
				map[cat.parent].children.push(map[cat.id]);
			}
		});

		return roots;
	};

	const CategoryItem = ({ category, selectedCats, toggleCategory }) => {
		return (
			<li className={category.parent === 0 ? 'category' : 'sub-category'}>
				<input
					type="checkbox"
					checked={selectedCats.includes(category.id)}
					onChange={() => toggleCategory(category.id)}
				/>
				{category.name}

				{category.children?.length > 0 && (
					<ul>
						{category.children.map((child) => (
							<CategoryItem
								key={child.id}
								category={child}
								selectedCats={selectedCats}
								toggleCategory={toggleCategory}
							/>
						))}
					</ul>
				)}
			</li>
		);
	};

	const CategoryTree = ({ categories, selectedCats, toggleCategory }) => {
		const nestedCategories = buildCategoryTree(categories);
		return (
			<div className="category-wrapper">
				<ul>
					{nestedCategories.map((cat) => (
						<CategoryItem
							key={cat.id}
							category={cat}
							selectedCats={selectedCats}
							toggleCategory={toggleCategory}
						/>
					))}
				</ul>
			</div>
		);
	};

	const typeOptions = [
		{ label: 'Select product type', value: '' },
		{ label: 'Simple Product', value: 'simple' },
		{ label: 'Variable Product', value: 'variable' },
	];
	const stockStatusOptions = [
		{ value: '', label: 'Stock Status' },
		{ value: 'instock', label: 'In Stock' },
		{ value: 'outofstock', label: 'Out of Stock' },
		{ value: 'onbackorder', label: 'On Backorder' },
	];

	const backorderOptions = [
		{ label: 'Do not allow', value: 'no' },
		{ label: 'Allow, but notify customer', value: 'notify' },
		{ label: 'Allow', value: 'yes' },
	];

	const handleChange = (field, value) => {
		setProduct((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const createProduct = () => {
		const imagePayload = [];

		if (featuredImage) {
			imagePayload.push({ id: featuredImage.id });
		}

		galleryImages.forEach((img) => {
			imagePayload.push({ id: img.id });
		});

		const finalCategories =
			appLocalizer.settings_databases_value['product-preferencess']
				?.category_selection_method == 'yes'
				? [
					{
						id: Number(
							selectedChild || selectedSub || selectedCat
						),
					},
				]
				: selectedCats.map((id) => ({ id }));

		const payload = {
			...product,
			featured: starFill,
			images: imagePayload,
			categories: finalCategories,
			meta_data: [
				...product.meta_data,
				{
					key: 'multivendorx_store_id',
					value: appLocalizer.store_id,
				},
				{
					key: 'multivendorx_shipping_policy',
					value: product.shipping_policy || '',
				},
				{
					key: 'multivendorx_refund_policy',
					value: product.refund_policy || '',
				},
				{
					key: 'multivendorx_cancellation_policy',
					value: product.cancellation_policy || '',
				},
			],
		};

		axios
			.put(
				`${appLocalizer.apiUrl}/wc/v3/products/${productId}`,
				payload,
				{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
			)
			.then(() => {
				window.location.reload();
			})
			.catch((error) => {
				console.error('Error updating product:', error);
			});
	};

	useEffect(() => {
		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/products/tags`, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((res) => {
				setExistingTags(res.data);
			})
	}, []);

	const [checklist, setChecklist] = useState({
		name: false,
		image: false,
		price: false,
		stock: false,
		categories: false,
		policies: false,
	});

	useEffect(() => {
		let baseChecklist = {
			name: !!product.name,
			image: !!featuredImage,
			categories: !!product.categories,
			policies: !!product.shipping_policy || !!product.refund_policy || product.cancellation_policy,
		};

		if (product.type === 'simple') {
			baseChecklist.price = !!product.regular_price;
			baseChecklist.stock = !!product.stock_status;
		}

		const filteredChecklist = applyFilters(
			'product_checklist_items',
			baseChecklist,
			product
		);

		setChecklist(filteredChecklist);
	}, [product, featuredImage]);

	const handleTranslationClick = (lang) => {
		if (lang.translated_product_id) {
			if (appLocalizer.permalink_structure) {
				navigate(
					`${basePath}/${appLocalizer.dashboard_slug}/products/edit/${lang.translated_product_id}/`
				);
			} else {
				navigate(
					`${basePath}/?page_id=${appLocalizer.dashboard_page_id}&segment=products&element=edit&context_id=${lang.translated_product_id}`
				);
			}
			return;
		}

		// CASE 2: Translation does not exist → create or fetch translation
		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, 'multivendorx-wpml'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: {
				product_id: productId,
				lang: lang.code,
			},
		}).then((res) => {
			if (res.data?.product_id) {
				if (appLocalizer.permalink_structure) {
					navigate(
						`${basePath}/${appLocalizer.dashboard_slug}/products/edit/${res.data.product_id}/`
					);
				} else {
					navigate(
						`${basePath}/?page_id=${appLocalizer.dashboard_page_id}&segment=products&element=edit&context_id=${res.data.product_id}`
					);
				}
			}
		});
	};

	const checklistValues = Object.values(checklist);
	const completedCount = checklistValues.filter(Boolean).length;
	const totalCount = checklistValues.length;

	return (
		<>
			{translation
				?.filter((lang) => lang.is_default) // only include default language
				.map((lang) => (
					<div key={lang.code} className="multivendorx-translation-row">
						<div>
							<img src={lang.flag_url} alt={lang.code}/>
							<strong>{lang.native_name}</strong>
						</div>
					</div>
				))}
			<NavigatorHeader
				headerTitle={__('Add Product', 'multivendorx')}
				headerDescription={__('Enter your product details - name, price, stock, and image & publish.', 'multivendorx')}
				buttons={[{
						label: __('Save', 'multivendorx'),
						icon: 'save',
						onClick: () => createProduct()
				}]}
			/>
			<Container>
				<Column grid={3}>
					<Card title={__('Product type', 'multivendorx')}>
						<FormGroupWrapper>
							<FormGroup desc={__('A standalone product with no variant', 'multivendorx')}>
								<SelectInputUI
									name="type"
									options={typeOptions}
									value={product.type}
									onChange={(selected) =>
										handleChange('type', selected.value)
									}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</Card>
					<Card
						title={__('Recommended', 'multivendorx')}
						action={
							<div className="admin-badge blue">
								{completedCount}/{totalCount}
							</div>
						}
					>
						<FormGroupWrapper>
							<FormGroup>
								<div className="checklist-wrapper">
									<ul>
										<li className={ checklist.name ? 'checked' : ''}>
											<div className="check-icon"><span></span></div>
											<div className="details">
												<div className="title">Product Name</div>
												<div className="des">A clear, descriptive title that helps customers find your product</div>
											</div>
										</li>
										{product.type === 'simple' && (
											<>
												<li className={ checklist.price ? 'checked' : '' }>
													<div className="check-icon"><span></span></div>
													<div className="details">
														<div className="title">Price</div>
														<div className="des">Set competitive prices including any sale or discount options</div>
													</div>
												</li>

												<li className={checklist.stock ? 'checked' : ''}>
													<div className="check-icon"><span></span></div>
													<div className="details">
														<div className="title">Stock</div>
														<div className="des">A clear, descriptive title that helps customers find your product</div>
													</div>
												</li>
											</>
										)}
										<li className={checklist.image ? 'checked' : ''}>
											<div className="check-icon"><span></span></div>
											<div className="details">
												<div className="title">Product Images</div>
												<div className="des">High-quality photos showing your product from multiple angles</div>
											</div>
										</li>

										<li className={checklist.categories ? 'checked' : ''}>
											<div className="check-icon"><span></span></div>
											<div className="details">
												<div className="title">Category</div>
												<div className="des">Organize your product to help customers browse your store</div>
											</div>
										</li>

										<li className={checklist.policies ? 'checked' : ''}>
											<div className="check-icon"><span></span></div>
											<div className="details">
												<div className="title">Policies</div>
												<div className="des">A clear, descriptive title that helps customers find your product</div>
											</div>
										</li>

										{applyFilters(
											'product_checklist_items_render',
											null,
											checklist,
											product
										)}
									</ul>
								</div>
							</FormGroup>
						</FormGroupWrapper>
					</Card>
				</Column>

				<Column grid={6}>
					<Card contentHeight title={__('General information', 'multivendorx')}>
						<FormGroupWrapper>
							<FormGroup label={__('Product name', 'multivendorx')} desc={__('A unique name for your product', 'multivendorx')}>
								<BasicInputUI
									name="name"
									value={product.name}
									onChange={(value) => handleChange('name', value)}
								/>
							</FormGroup>

							<FormGroup label={__('Product short description', 'multivendorx')} desc={__('A short description displayed on product and checkout pages', 'multivendorx')}>
								<TextAreaUI
									name="short_description"
									value={product.short_description}
									onChange={(value) =>
										handleChange('short_description', value)
									}
								/>
							</FormGroup>

							<FormGroup label={__('Product description', 'multivendorx')}>
								<TextAreaUI
									name="description"
									value={product.description}
									onChange={(value) =>
										handleChange('description', value)
									}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</Card>

					{product?.type === 'simple' && (
						<Card contentHeight title={__('Price', 'multivendorx')}>
							<FormGroupWrapper>
								<FormGroup cols={2} label={__('Regular price', 'multivendorx')}>
									<BasicInputUI
										name="regular_price"
										value={product.regular_price}
										onChange={(value) =>
											handleChange('regular_price', value)
										}
									/>
								</FormGroup>
								<FormGroup cols={2} label={__('Sale price', 'multivendorx')}>
									<BasicInputUI
										name="sale_price"

										value={product.sale_price}
										onChange={(value) =>
											handleChange('sale_price', value)
										}
									/>
								</FormGroup>
							</FormGroupWrapper>
						</Card>
					)}
					<Card contentHeight
						title={__('Inventory', 'multivendorx')}
						action={
							<>
								<div className="field-wrapper">
									{__('Stock management', 'multivendorx')}
									<MultiCheckBoxUI
										look="toggle"
										value={product.manage_stock ? ['manage_stock'] : []}
										onChange={(e) =>
											handleChange(
												'manage_stock',
												(e as React.ChangeEvent<HTMLInputElement>).target
											)
										}
										options={[
											{ key: 'manage_stock', value: 'manage_stock' },
										]}
									/>
								</div>
							</>
						}
					>
						<FormGroupWrapper>
							<FormGroup cols={2} label={__('SKU', 'multivendorx')}>
								<BasicInputUI
									name="sku"

									value={product.sku}
									onChange={(value) => handleChange('sku', value)}
								/>
							</FormGroup>
							{!product.manage_stock && (
								<FormGroup cols={2} label={__('Stock Status', 'multivendorx')}>
									<SelectInputUI
										name="stock_status"
										options={stockStatusOptions}
										value={product.stock_status}
										onChange={(selected) =>
											handleChange('stock_status', selected.value)
										}
									/>
								</FormGroup>
							)}
							{product.manage_stock && (
								<>
									<FormGroup cols={2} label={__('Quantity', 'multivendorx')}>
										<BasicInputUI
											name="stock"

											value={product.stock}
											onChange={(value) =>
												handleChange('stock', value)
											}
										/>
									</FormGroup>
									<FormGroup cols={2} label={__('Allow backorders?', 'multivendorx')}>
										<SelectInputUI
											name="backorders"
											options={backorderOptions}
											value={product.backorders}
											onChange={(selected) =>
												handleChange('backorders', selected.value)
											}
										/>
									</FormGroup>
									<FormGroup cols={2} label={__('Low stock threshold', 'multivendorx')}>
										<BasicInputUI
											name="low_stock_amount"

											value={product.low_stock_amount}
											onChange={(value) =>
												handleChange('low_stock_amount', value)
											}
										/>
									</FormGroup>
								</>
							)}
						</FormGroupWrapper>
					</Card>

					<Card contentHeight title={__('Related listings', 'multivendorx')}>
						<FormGroupWrapper>
							<FormGroup cols={2} label={__('Upsells', 'multivendorx')}>
								<BasicInputUI
									name="name"
								// value={product.name}
								// onChange={(value) => handleChange('name', value)}
								/>
							</FormGroup>
							<FormGroup cols={2} label={__('Cross-sells', 'multivendorx')}>
								<BasicInputUI
									name="name"
								// value={product.name}
								// onChange={(value) => handleChange('name', value)}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</Card>

					<Card contentHeight title={__('Policies', 'multivendorx')} >
						<FormGroupWrapper>
							<FormGroup label={__('Shipping Policy', 'multivendorx')}>
								<TextAreaUI
									name="shipping_policy"
									value={product.shipping_policy}
									onChange={(value) =>
										handleChange('shipping_policy', value)
									}
								/>
							</FormGroup>
							<FormGroup label={__('Refund Policy', 'multivendorx')}>
								<TextAreaUI
									name="refund_policy"
									value={product.refund_policy}
									onChange={(value) =>
										handleChange('refund_policy', value)
									}
								/>
							</FormGroup>
							<FormGroup label={__('Cancellation Policy', 'multivendorx')}>
								<TextAreaUI
									name="cancellation_policy"
									value={product.cancellation_policy}
									onChange={(value) =>
										handleChange('cancellation_policy', value)
									}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</Card>
					{modules.includes('min-max') &&
						product?.type == 'simple' &&
						applyFilters(
							'product_min_max',
							null,
							product,
							setProduct,
							handleChange
						)}

					{!product.virtual &&
						applyFilters(
							'product_shipping',
							null,
							product,
							setProduct,
							handleChange
						)}

					{product?.type == 'variable' &&
						applyFilters(
							'product_variable',
							null,
							product,
							setProduct
						)}
				</Column>

				<Column grid={3}>
					{applyFilters('product_ai_assist', null, product)}
					<Card contentHeight
						title={__('Publishing', 'multivendorx')}
						action={
							<>
								<label
									onClick={() => setstarFill((prev) => !prev)}
									style={{ cursor: 'pointer' }}
									className="field-wrapper"
								>
									{__('Featured product', 'multivendorx')}
									<i className={`star-icon ${(starFill || product?.featured) ? 'adminfont-star' : 'adminfont-star-o'}`} />
								</label>
							</>
						}
					>
						<FormGroupWrapper>
							<FormGroup row label={__('Catalog Visibility', 'multivendorx')} htmlFor="catalog-visibility">
								<div ref={visibilityRef}>
									<div className="catalog-visibility">
										{!isEditingVisibility && (
											<div onClick={() => {
												setIsEditingVisibility((prev) => !prev);
												setIsEditingStatus(false);
											}}>
												<span className="catalog-visibility-value">
													{VISIBILITY_LABELS[product.catalog_visibility]}
												</span>
												<i className="adminfont-arrow-down-up" />
											</div>
										)}
										{isEditingVisibility && (
											<SelectInputUI
												name="catalog_visibility"
												size="14rem"
												options={[
													{ key: 'visible', value: 'visible', label: 'Shop and search results' },
													{ key: 'catalog', value: 'catalog', label: 'Shop only' },
													{ key: 'search', value: 'search', label: 'Search results only' },
													{ key: 'hidden', value: 'hidden', label: 'Hidden' },
												]}
												value={product.catalog_visibility}
												onChange={(selected) => {
													handleChange('catalog_visibility', selected.value);
													setIsEditingVisibility(false);
												}}
											/>
										)}
									</div>
								</div>
							</FormGroup>
							<FormGroup
								row
								label={__('Product Status', 'multivendorx')}
								htmlFor="status"
							>
								<div className="catalog-visibility">
									{!isEditingStatus && (
										<div onClick={() => {
											setIsEditingStatus((prev) => !prev);
											setIsEditingVisibility(false);
										}}>
											<span className="catalog-visibility-value">
												{STATUS_LABELS[product.status]}
											</span>
											<i className="adminfont-arrow-down-up" />
										</div>
									)}
									{isEditingStatus && (
										<SelectInputUI
											name="status"
											wrapperClass="fit-content"
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
													label: __('Submit', 'multivendorx'),
												},
											]}
											value={product.status}
											onChange={(selected) =>
												handleChange('status', selected.value)
											}
										/>
									)}
								</div>
							</FormGroup>

							<FormGroup row label={__('Cataloged at', 'multivendorx')} htmlFor="status">
								<div className="catalog-visibility">
									<span className="catalog-visibility-value">
										{product?.date_created} <i className="adminfont-arrow-down-up" />
									</span>
								</div>
							</FormGroup>
						</FormGroupWrapper>
					</Card>

					<Card contentHeight
						title={__('Category', 'multivendorx')}
					>
						{appLocalizer.settings_databases_value['product-preferencess']
							?.category_selection_method === 'yes' ? (
							<>

								<div className="category-breadcrumb-wrapper">
									<div className="category-breadcrumb">
										{printPath()}
									</div>

									{(selectedCat || selectedSub || selectedChild) && (
										<button
											onClick={resetSelection}
											className="admin-btn btn-red"
										>
											{__('Reset', 'multivendorx')}
										</button>
									)}
								</div>


								<FormGroupWrapper>
									<div
										className="category-wrapper template2"
										ref={wrapperRef}
									>
										<ul className="settings-form-group-radio">
											{treeData.map((cat) => (
												<React.Fragment key={cat.id}>
													<li
														className={`category ${selectedCat === cat.id
															? 'radio-select-active'
															: ''
															}`}
														style={{
															display:
																selectedCat === null ||
																	selectedCat === cat.id
																	? 'block'
																	: 'none',
														}}
														onClick={() =>
															handleCategoryClick(cat.id)
														}
													>
														<label>{cat.name}</label>
													</li>
													{selectedCat === cat.id &&
														cat.children?.length > 0 && (
															<ul className="settings-form-group-radio">
																{cat.children.map((sub) => (
																	<React.Fragment key={sub.id}>
																		<li
																			className={`sub-category ${selectedSub === sub.id
																				? 'radio-select-active'
																				: ''
																				}`}
																			style={{
																				display:
																					!selectedSub ||
																						selectedSub === sub.id
																						? 'block'
																						: 'none',
																			}}
																			onClick={() =>
																				handleSubClick(sub.id)
																			}
																		>
																			<label>{sub.name}</label>
																		</li>

																		{selectedSub === sub.id &&
																			sub.children?.length > 0 && (
																				<ul className="settings-form-group-radio">
																					{sub.children.map((child) => (
																						<li
																							key={child.id}
																							className={`sub-category ${selectedChild === child.id
																								? 'radio-select-active'
																								: ''
																								}`}
																							style={{
																								display:
																									!selectedChild ||
																										selectedChild === child.id
																										? 'block'
																										: 'none',
																							}}
																							onClick={() =>
																								handleChildClick(child.id)
																							}
																						>
																							<label>{child.name}</label>
																						</li>
																					))}
																				</ul>
																			)}
																	</React.Fragment>
																))}
															</ul>
														)}
												</React.Fragment>
											))}
										</ul>
									</div>
								</FormGroupWrapper>
							</>
						) : (
							<FormGroupWrapper>
								<CategoryTree
									categories={categories}
									selectedCats={selectedCats}
									toggleCategory={toggleCategory}
								/>
							</FormGroupWrapper>
						)}
					</Card>
					{modules.includes('wpml') && (
						<Card title={__('Translations', 'multivendorx')} iconName="translate" toggle={true}>
							<FormGroupWrapper>
								<div className="multivendorx-translation-list">
									{translation
										?.filter((lang) => !lang.is_default)
										.map((lang) => (
											<div key={lang.code} className="multivendorx-translation-row">
												<div>
													<img
														src={lang.flag_url}
														alt={lang.code}
													/>
													<strong>{lang.native_name}</strong>
												</div>

												<button
													className="admin-btn btn-small btn-secondary"
													onClick={() => handleTranslationClick(lang)}
												>
													<i className="adminfont-edit" />
												</button>
											</div>
										))}
								</div>
							</FormGroupWrapper>
						</Card>
					)}
					<Card contentHeight title={__('Product tag', 'multivendorx')}>
						<FormGroupWrapper>
							<InputWithSuggestions
								suggestions={existingTags.map((tag) => tag.name)} 
								value={product.tags?.map((tag) => tag.name) || []}
								onChange={(list) => {
									console.log('Tags updated:', list);
									const updatedTags = list.map((name) => {
										const existing = existingTags.find(
											(tag) => tag.name === name
										);
										return existing ? existing  : { name }; 
									});
									setProduct((prev) => ({
										...prev,
										tags: updatedTags,
									}));
								}}
								placeholder={__('Type tag…', 'multivendorx')}
								addButtonLabel={__('Add', 'multivendorx')}
							/>
						</FormGroupWrapper>
					</Card>

					<Card contentHeight title={__('Upload image', 'multivendorx')}>
						<FormGroupWrapper>
							<FormGroup label={__('Features Image', 'multivendorx')}>
								<FileInputUI
									imageSrc={featuredImage?.thumbnail || ''}
									multiple={false}
									openUploader={__('Select Featured Image', 'multivendorx')}
									onChange={(val) => {
										if (!val) {
											setFeaturedImage(null);
											return;
										}
										const url = val as string;
										setFeaturedImage({
											id: 0, // wp.media id not available from current FileInput
											src: url,
											thumbnail: url,
										});
									}}
								/>

								{applyFilters('product_image_enhancement', null, {
									currentImage: featuredImage ?? null,
									isFeaturedImage: true,
									setImage: setFeaturedImage,
								})}
							</FormGroup>

							<FormGroup label={__('Product gallery', 'multivendorx')}>
								<FileInputUI
									imageSrc={galleryImages.map(img => img.thumbnail)}
									multiple={true}
									openUploader="Add Gallery Image"
									onChange={(val) => {
										if (!val) {
											setGalleryImages([]);
											return;
										}

										const urls = Array.isArray(val) ? val : [val];

										const formatted = urls.map((url) => ({
											id: 0,
											src: url,
											thumbnail: url,
										}));

										setGalleryImages(formatted);
									}}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</Card>
				</Column>
			</Container >
		</>
	);
};

export default AddProduct;