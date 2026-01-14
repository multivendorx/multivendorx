import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import {
	BasicInput,
	CalendarInput,
	FileInput,
	MultiCheckBox,
	RadioInput,
	SelectInput,
	TextArea,
	useModules,
	ToggleSetting,
	Card,
	Column,
	Container,
	FormGroupWrapper,
	FormGroup,
	AdminButton,
	getApiLink,
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
		if (parts.length >= 4) {
			productId = productId || parts[3];
		}
	}
	const [product, setProduct] = useState({});
	const [translation, setTranslation] = useState([]);

	const [featuredImage, setFeaturedImage] = useState(null);
	const [galleryImages, setGalleryImages] = useState([]);

	const [starFill, setstarFill] = useState(false);

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

	const [categories, setCategories] = useState([]);
	const [selectedCats, setSelectedCats] = useState([]);

	const isPyramidEnabled =
		appLocalizer.settings_databases_value['product-preferencess']
			?.category_selection_method === 'yes';

	const wrapperRef = useRef(null);

	const [selectedCat, setSelectedCat] = useState(null);
	const [selectedSub, setSelectedSub] = useState(null);
	const [selectedChild, setSelectedChild] = useState(null);

	const [isEditingVisibility, setIsEditingVisibility] = useState(false);

	const VISIBILITY_LABELS: Record<string, string> = {
		visible: 'Shop and search results',
		catalog: 'Shop only',
		search: 'Search results only',
		hidden: 'Hidden',
	};

	// Close on click outside
	useEffect(() => {
		if (!isPyramidEnabled) {
			return;
		}
		const handleClickOutside = (event) => {
			if (
				wrapperRef.current &&
				!wrapperRef.current.contains(event.target)
			) {
				resetSelection();
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () =>
			document.removeEventListener('mousedown', handleClickOutside);
	}, []);

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

	const toggleCard = (cardId) => {
		const body = document.querySelector(`#${cardId} .card-body`);
		const arrow = document.querySelector(`#${cardId} i.icon`);

		if (!body || !arrow) {
			return;
		}

		body.classList.toggle('hide-body');
		arrow.classList.toggle('rotate');
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

	const createProduct = (status) => {
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

		try {
			const payload = {
				...product,
				status: status,
				images: imagePayload,
				categories: finalCategories,
				meta_data: [
					...product.meta_data,
					{
						key: 'multivendorx_store_id',
						value: appLocalizer.store_id,
					},
				],
			};

			axios
				.put(
					`${appLocalizer.apiUrl}/wc/v3/products/${productId}`,
					payload,
					{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
				)
				.then((res) => {
					window.location.reload();
				});
		} catch (error) {
			console.error('Error:', error.response);
		}
	};

	const [tagInput, setTagInput] = useState('');
	const [suggestions, setSuggestions] = useState([]);
	const [existingTags, setExistingTags] = useState([]);

	useEffect(() => {
		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/products/tags`, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((res) => {
				setExistingTags(res.data);
			});
	}, []);

	const handleTagInput = (value) => {
		setTagInput(value);

		if (!value.trim()) {
			setSuggestions([]);
			return;
		}

		const filtered = existingTags.filter(
			(tag) =>
				tag &&
				tag.name &&
				tag.name.toLowerCase().includes(value.toLowerCase())
		);

		setSuggestions(filtered);
	};

	const addTag = (tag) => {
		let newTag = tag;

		if (typeof tag === 'string') {
			newTag = { name: tag };
		}

		if (!product.tags.find((t) => t.name === newTag.name)) {
			setProduct({
				...product,
				tags: [...product.tags, newTag],
			});
		}

		setTagInput('');
		setSuggestions([]);
	};

	const openFeaturedUploader = () => {
		const frame = wp.media({
			title: 'Select Featured Image',
			button: { text: 'Use this image' },
			multiple: false,
			library: { type: 'image' },
		});

		frame.on('select', () => {
			const attachment = frame.state().get('selection').first().toJSON();

			const img = {
				id: attachment.id,
				src: attachment.url,
				thumbnail: attachment.sizes?.thumbnail?.url || attachment.url,
			};

			setFeaturedImage(img);
		});

		frame.open();
	};

	const openGalleryUploader = () => {
		const frame = wp.media({
			title: 'Select Gallery Images',
			button: { text: 'Add to gallery' },
			multiple: true,
			library: { type: 'image' },
		});

		frame.on('select', () => {
			const selection = frame.state().get('selection').toJSON();

			const newImages = selection.map((img) => ({
				id: img.id,
				src: img.url,
				thumbnail: img.sizes?.thumbnail?.url || img.url,
			}));

			setGalleryImages((prev) => [...prev, ...newImages]);
		});

		frame.open();
	};

	const [checklist, setChecklist] = useState({
		name: false,
		image: false,
		price: false,
		stock: false,
	});

	useEffect(() => {
		let baseChecklist = {
			name: !!product.name,
			image: !!featuredImage,
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

	const isPublishDisabled = !Object.values(checklist).every(Boolean);
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


	return (
		<>
			<div className="page-title-wrapper">
				<div className="page-title">
					<div className="title">
						{__('Add Product', 'multivendorx')}
					</div>

					<div className="des">
						{__(
							'Enter your product details - name, price, stock, and image & publish.',
							'multivendorx'
						)}
					</div>
				</div>
				<div className="buttons-wrapper">
					<button
						className="admin-btn btn-blue"
						onClick={() => createProduct('draft')}
					>
						{__('Draft', 'multivendorx')}
					</button>
					<button
						className="admin-btn btn-purple-bg"
						onClick={() => createProduct('publish')}
						disabled={isPublishDisabled}
					>
						{__('Publish', 'multivendorx')}
					</button>
				</div>
			</div>

			<Container>
				<Column grid={2}>
					<div className="card-content">
						<div className="card-body">
							<div className="checklist-wrapper">
								<div className="checklist-title">
									{__('Checklist', 'multivendorx')}
								</div>

								<ul>
									<li
										className={
											checklist.name ? 'checked' : ''
										}
									>
										<span></span> Name
									</li>
									{/* SIMPLE PRODUCT FIELDS */}
									{product.type === 'simple' && (
										<>
											<li
												className={
													checklist.price
														? 'checked'
														: ''
												}
											>
												<span></span> Price
											</li>

											<li
												className={
													checklist.stock
														? 'checked'
														: ''
												}
											>
												<span></span> Stock
											</li>
										</>
									)}
									<li
										className={
											checklist.image ? 'checked' : ''
										}
									>
										<span></span> Image
									</li>

									<li
										className={
											checklist.image ? 'checked' : ''
										}
									>
										<span></span> Category
									</li>

									<li
										className={
											checklist.image ? 'checked' : ''
										}
									>
										<span></span> Policies
									</li>


									{applyFilters(
										'product_checklist_items_render',
										null,
										checklist,
										product
									)}
								</ul>
							</div>
						</div>
					</div>
				</Column>

				<Column grid={6}>
					{/* General information */}
					<Card
						title={__('General information', 'multivendorx')}
						iconName="adminfont-keyboard-arrow-down arrow-icon icon"
						toggle
					>
						<FormGroupWrapper>
							{/* Product Name */}
							<FormGroup label={__('Product name', 'multivendorx')}>
								<BasicInput
									name="name"
									 
									value={product.name}
									onChange={(e) => handleChange('name', e.target.value)}
								/>
							</FormGroup>

							{/* Short Description */}
							<FormGroup label={__('Product short description', 'multivendorx')}>
								<TextArea
									name="short_description"
									value={product.short_description}
									onChange={(e) =>
										handleChange('short_description', e.target.value)
									}
								/>
							</FormGroup>

							{/* Description */}
							<FormGroup label={__('Product description', 'multivendorx')}>
								<TextArea
									name="description"
									value={product.description}
									onChange={(e) =>
										handleChange('description', e.target.value)
									}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</Card>

					{/* Price and stock */}
					<Card
						title={__('Price and stock', 'multivendorx')}
						iconName="adminfont-keyboard-arrow-down arrow-icon icon"
						toggle
					>
						<FormGroupWrapper>
							{/* Regular & Sale Price (Simple Product) */}
							{product?.type === 'simple' && (
								<>
									<FormGroup cols={2} label={__('Regular price', 'multivendorx')}>
										<BasicInput
											name="regular_price"
											 
											value={product.regular_price}
											onChange={(e) =>
												handleChange('regular_price', e.target.value)
											}
										/>
									</FormGroup>

									<FormGroup cols={2} label={__('Sale price', 'multivendorx')}>
										<BasicInput
											name="sale_price"
											 
											value={product.sale_price}
											onChange={(e) =>
												handleChange('sale_price', e.target.value)
											}
										/>
									</FormGroup>
								</>
							)}

							{/* SKU + Sold Individually */}
							<FormGroup cols={2} label={__('SKU', 'multivendorx')}>
								<BasicInput
									name="sku"
									 
									value={product.sku}
									onChange={(e) => handleChange('sku', e.target.value)}
								/>
							</FormGroup>

							<FormGroup cols={2} label={__('Sold individually', 'multivendorx')}>
								<MultiCheckBox
									wrapperClass="toggle-btn"
									inputWrapperClass="toggle-checkbox-header"
									inputInnerWrapperClass="toggle-checkbox"
									idPrefix="toggle-switch-sold-individually"
									type="checkbox"
									value={
										product.sold_individually ? ['sold_individually'] : []
									}
									onChange={(e) =>
										handleChange(
											'sold_individually',
											(e as React.ChangeEvent<HTMLInputElement>).target.checked
										)
									}
									options={[
										{ key: 'sold_individually', value: 'sold_individually' },
									]}
								/>
							</FormGroup>

							{/* Stock Management */}
							<FormGroup cols={2} label={__('Stock management', 'multivendorx')}>
								<MultiCheckBox
									wrapperClass="toggle-btn"
									inputWrapperClass="toggle-checkbox-header"
									inputInnerWrapperClass="toggle-checkbox"
									idPrefix="toggle-switch-manage-stock"
									type="checkbox"
									value={product.manage_stock ? ['manage_stock'] : []}
									onChange={(e) =>
										handleChange(
											'manage_stock',
											(e as React.ChangeEvent<HTMLInputElement>).target.checked
										)
									}
									options={[
										{ key: 'manage_stock', value: 'manage_stock' },
									]}
								/>
							</FormGroup>

							{!product.manage_stock && (
								<FormGroup cols={2} label={__('Stock Status', 'multivendorx')}>
									<SelectInput
										name="stock_status"
										options={stockStatusOptions}
										type="single-select"
										value={product.stock_status}
										onChange={(selected) =>
											handleChange('stock_status', selected.value)
										}
									/>
								</FormGroup>
							)}
						</FormGroupWrapper>

						<FormGroupWrapper>
							{/* Managed Stock Fields */}
							{product.manage_stock && (
								<>
									<FormGroup cols={3} label={__('Quantity', 'multivendorx')}>
										<BasicInput
											name="stock"
											 
											value={product.stock}
											onChange={(e) =>
												handleChange('stock', e.target.value)
											}
										/>
									</FormGroup>

									<FormGroup cols={3} label={__('Allow backorders?', 'multivendorx')}>
										<SelectInput
											name="backorders"
											options={backorderOptions}
											type="single-select"
											value={product.backorders}
											onChange={(selected) =>
												handleChange('backorders', selected.value)
											}
										/>
									</FormGroup>

									<FormGroup cols={3} label={__('Low stock threshold', 'multivendorx')}>
										<BasicInput
											name="low_stock_amount"
											 
											value={product.low_stock_amount}
											onChange={(e) =>
												handleChange('low_stock_amount', e.target.value)
											}
										/>
									</FormGroup>
								</>
							)}
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
							handleChange
						)}

					{product.downloadable &&
						applyFilters(
							'product_downloadable',
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

				<Column grid={4}>
					{/* ai assist */}
					{applyFilters('product_ai_assist', null, product)}

					<Card
						title={__('Visibility', 'multivendorx')}
						iconName="adminfont-keyboard-arrow-down arrow-icon icon"
						toggle
					>
						{/* Product type */}
						<FormGroupWrapper>
							<FormGroup label={__('Product type', 'multivendorx')} htmlFor="product-type">
								<SelectInput
									name="type"
									options={typeOptions}
									value={product.type}
									onChange={(selected) =>
										handleChange('type', selected.value)
									}
								/>
							</FormGroup>

							{/* Virtual / Downloadable */}
							<FormGroup>
								<div className="checkbox-wrapper">
									<div className="item">
										<input
											type="checkbox"
											checked={product.virtual}
											onChange={(e) =>
												handleChange('virtual', e.target.checked)
											}
										/>
										{__('Virtual', 'multivendorx')}
									</div>

									<div className="item">
										<input
											type="checkbox"
											checked={product.downloadable}
											onChange={(e) =>
												handleChange('downloadable', e.target.checked)
											}
										/>
										{__('Download', 'multivendorx')}
									</div>
								</div>
							</FormGroup>

							{/* Catalog visibility summary */}
							<FormGroup>
								<div className="catalog-visibility">
									{__('Catalog Visibility:', 'multivendorx')}
									<span className="catalog-visibility-value">
										<b>{VISIBILITY_LABELS[product.catalog_visibility]}</b>
									</span>
									<span
										className="admin-badge blue"
										onClick={() => setIsEditingVisibility(true)}
									>
										<i className="adminfont-edit" />
									</span>
								</div>
							</FormGroup>

							{/* Edit catalog visibility */}
							{isEditingVisibility && (
								<>
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
												{ key: 'vs1', value: 'visible', label: 'Shop and search results' },
												{ key: 'vs2', value: 'catalog', label: 'Shop only' },
												{ key: 'vs3', value: 'search', label: 'Search results only' },
												{ key: 'vs4', value: 'hidden', label: 'Hidden' },
											]}
											value={product.catalog_visibility}
											onChange={(e) => {
												handleChange('catalog_visibility', e.target.value);
												setIsEditingVisibility(false);
											}}
										/>
									</FormGroup>
									<FormGroup>
										<label
											onClick={() => setstarFill((prev) => !prev)}
											style={{ cursor: 'pointer' }}
										>
											<i
												className={`star-icon ${starFill ? 'adminfont-star' : 'adminfont-star-o'
													}`}
											/>
											{__('This is a featured product', 'multivendorx')}
										</label>
									</FormGroup>
								</>
							)}

							{/* Status */}
							<FormGroup label={__('Status', 'multivendorx')} htmlFor="status">
								<ToggleSetting
									 
									descClass="settings-metabox-description"
									options={[
										{ key: 'draft', value: 'draft', label: __('Draft', 'multivendorx') },
										{ key: 'publish', value: 'publish', label: __('Published', 'multivendorx') },
										{ key: 'pending', value: 'pending', label: __('Pending Review', 'multivendorx') },
									]}
									value={product.status}
									onChange={(value) => handleChange('status', value)}
								/>
							</FormGroup>

							{/* Publish date */}
							{product.status === 'publish' && (
								<label>{__('Published on Dec 16, 2025', 'multivendorx')}</label>
							)}

							{product.status === 'pending' && (
								<FormGroup label={__('Published on', 'multivendorx')} htmlFor="published-on">
									<div className="date-field-wrapper">
										{product.date_created && (
											<>
												<CalendarInput
													wrapperClass="calendar-wrapper"
													inputClass="calendar-input"
													value={product.date_created.split('T')[0]}
													onChange={(date: any) => {
														const dateStr = date?.toString();
														setProduct((prev) => ({
															...prev,
															date_created: `${dateStr}T${prev.date_created?.split('T')[1] || '00:00:00'
																}`,
														}));
													}}
													format="YYYY-MM-DD"
												/>

												<BasicInput
													type="time"
													value={
														product.date_created.split('T')[1]?.slice(0, 5) || ''
													}
													onChange={(e: any) => {
														const newTime = e.target.value;
														setProduct((prev) => ({
															...prev,
															date_created: `${prev.date_created?.split('T')[0]}T${newTime}:00`,
														}));
													}}
												/>
											</>
										)}
									</div>
								</FormGroup>
							)}
						</FormGroupWrapper>
					</Card>

					<Card
						title={__('Category', 'multivendorx')}
						iconName="adminfont-keyboard-arrow-down arrow-icon icon"
						toggle
					>
						{appLocalizer.settings_databases_value['product-preferencess']
							?.category_selection_method === 'yes' ? (
							<>
								{/* Breadcrumb */}
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

								{/* Category tree (custom flow) */}
								<FormGroupWrapper>
									<div
										className="category-wrapper template2"
										ref={wrapperRef}
									>
										<ul className="settings-form-group-radio">
											{treeData.map((cat) => (
												<React.Fragment key={cat.id}>
													{/* Category */}
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

													{/* Sub categories */}
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

																		{/* Child categories */}
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
							/* Default category tree */
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
						<Card
							title={__('Translations', 'multivendorx')}
							iconName="adminfont-translate"
							toggle={true}
						>
							<FormGroupWrapper>
								<div className="mvx-translation-list">
									{translation?.map((lang) => (
										<div
											key={lang.code}
											className="mvx-translation-row"
										>
											<div>
												<img
													src={lang.flag_url}
													alt={lang.code}
													style={{ width: 18, height: 18 }}
												/>
												<strong>{lang.native_name}</strong>
												{lang.is_default && (
													<span className="admin-badge gray">
														{__('Default', 'multivendorx')}
													</span>
												)}
											</div>

											{!lang.is_default && (
												<button
													className="admin-btn btn-small btn-secondary"
													onClick={() => handleTranslationClick(lang)}
												>
													<i className="adminfont-edit" />
												</button>
											)}
										</div>
									))}
								</div>
							</FormGroupWrapper>
						</Card>
					)}
					<Card
						title="Product tag"
						iconName="adminfont-keyboard-arrow-down arrow-icon icon"
						toggle={true} // enable collapse/expand
					>
						<FormGroupWrapper>
							{/* Selected tags */}
							<div className="tag-list">
								{product.tags?.map((tag) => (
									<span className="admin-badge blue" key={tag.id}>
										{tag.name}
										<span
											onClick={() =>
												setProduct((prev) => ({
													...prev,
													tags: prev.tags.filter(
														(t) => t.name !== tag.name
													),
												}))
											}
										>
											<i className="delete-icon adminfont-delete" />
										</span>
									</span>
								))}
							</div>

							{/* Tag input + dropdown */}
							<div className="dropdown-field">
								<input
									type="text"
									value={tagInput}
									onChange={(e) => handleTagInput(e.target.value)}
									onKeyDown={(e) =>
										e.key === 'Enter' && addTag(tagInput)
									}
									placeholder={__('Type tag…', 'multivendorx')}
									className="basic-input dropdown-input"
								/>

								<button
									className="admin-btn btn-green"
									onClick={() => addTag(tagInput)}
								>
									<i className="adminfont-plus" />{' '}
									{__('Add', 'multivendorx')}
								</button>

								{suggestions.length > 0 && (
									<div className="input-dropdown">
										<ul>
											{suggestions.map((tag) => (
												<li
													key={tag.id || tag.name}
													className="dropdown-item"
													onMouseDown={() => addTag(tag)}
												>
													{tag.name}
												</li>
											))}
										</ul>
									</div>
								)}
							</div>
						</FormGroupWrapper>
					</Card>

					{/* image upload */}
					<Card
						title="Upload image"
						iconName="adminfont-keyboard-arrow-down arrow-icon icon"
						toggle
					>
						{/* Featured Image */}
						<FormGroupWrapper>
							<FormGroup label={__('Features Image', 'multivendorx')}>
								<div>
									<FileInput
										type="hidden"
										imageSrc={featuredImage?.thumbnail}
										openUploader={__('Select Featured Image', 'multivendorx')}
										onButtonClick={openFeaturedUploader}
										onRemove={() => setFeaturedImage(null)}
										onReplace={openFeaturedUploader}
									/>

									<div className="buttons-wrapper">
										{applyFilters('product_image_enhancement', null, {
											currentImage: featuredImage ?? null,
											isFeaturedImage: true,
											setImage: setFeaturedImage,
										})}
									</div>
								</div>
							</FormGroup>

							<FormGroup label={__('Product gallery', 'multivendorx')}>
								<FileInput
									type="hidden"
									imageSrc={null}
									openUploader="Add Gallery Image"
									onButtonClick={openGalleryUploader}
								/>

								<div className="uploaded-image">
									{galleryImages.map((img, index) => (
										<div className="image" key={img.id}>
											<img src={img.thumbnail} alt="" />

											<div className="buttons-wrapper">
												{applyFilters('product_image_enhancement', null, {
													currentImage: img,
													isFeaturedImage: false,
													setImage: setGalleryImages,
												})}
											</div>
										</div>
									))}

									{galleryImages.length === 0 && (
										<div className="buttons-wrapper">
											{applyFilters('product_image_enhancement', null, {
												currentImage: null,
												isFeaturedImage: false,
												setImage: setGalleryImages,
												featuredImage: featuredImage ?? null,
											})}
										</div>
									)}
								</div>
							</FormGroup>
						</FormGroupWrapper>
					</Card>

				</Column>
			</Container>
		</>
	);
};

export default AddProduct;