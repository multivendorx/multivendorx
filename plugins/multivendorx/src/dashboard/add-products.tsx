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
	CommonPopup,
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
	const [isEditingStatus, setIsEditingStatus] = useState(false);

	const VISIBILITY_LABELS: Record<string, string> = {
		visible: 'Shop and search results',
		catalog: 'Shop only',
		search: 'Search results only',
		hidden: 'Hidden',
	};

	const STATUS_LABELS: Record<string, string> = {
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

	// variation start
	const [tempOptions, setTempOptions] = useState<Record<number, string>>({});
	const [openPopup, setopenPopup] = useState(false);

	const [variant, setVariant] = useState([
		{
			id: Date.now(),
			name: '',
			options: [],
			isEditing: true,
		},
	]);
	const addVariation = () => {
		setVariant((prev) => [
			...prev,
			{
				id: Date.now(),
				name: '',
				options: [],
				isEditing: true,
			},
		]);
	};
	const updateVariation = (index: number, key: string, value: any) => {
		const updated = [...variant];
		updated[index][key] = value;
		setVariant(updated);
	};
	// wrapper variation delete
	const deleteVariation = (vIndex: number) => {
		setVariant((prev) => prev.filter((_, i) => i !== vIndex));
	};

	// under variation delete
	const deleteOption = (vIndex: number, oIndex: number) => {
		const updated = [...variant];
		updated[vIndex].options = updated[vIndex].options.filter(
			(_, i) => i !== oIndex
		);
		setVariant(updated);
	};

	// add new when type
	const handleAddNewOption = (vIndex: number) => {
		const value = tempOptions[vIndex]?.trim();
		if (!value) return;

		setVariant((prev) => {
			const updated = [...prev];
			updated[vIndex].options = [
				...updated[vIndex].options,
				value,
			];
			return updated;
		});

		// clear input
		setTempOptions((prev) => ({
			...prev,
			[vIndex]: '',
		}));
	};
	const handleTempOptionChange = (vIndex: number, value: string) => {
		setTempOptions((prev) => ({
			...prev,
			[vIndex]: value,
		}));
	};
	const addOption = (vIndex: number) => {
		handleAddNewOption(vIndex);
	};

	// toggle edit btn
	const toggleEditMode = (vIndex: number, value: boolean) => {
		setVariant((prev) => {
			const updated = [...prev];
			updated[vIndex].isEditing = value;
			return updated;
		});
	};



	// combination start
	const generateCombinations = (variants) => {
		if (!variants.length) return [];

		return variants.reduce((acc, variant) => {
			if (acc.length === 0) {
				return variant.options.map(opt => ({
					[variant.name]: opt,
				}));
			}

			const result = [];
			acc.forEach(prev => {
				variant.options.forEach(opt => {
					result.push({
						...prev,
						[variant.name]: opt,
					});
				});
			});
			return result;
		}, []);
	};

	// varidation
	const validvariant = variant.filter(
		(variation) =>
			variation.name?.trim() !== '' &&
			variation.options.length > 0 &&
			variation.options.every((opt) => opt.trim() !== '')
	);
	const combinations =
		validvariant.length > 0
			? generateCombinations(validvariant)
			: [];

	// edit and show toggle
	const setEditMode = (vIndex: number, value: boolean) => {
		setVariant((prev) => {
			const updated = [...prev];
			updated[vIndex] = {
				...updated[vIndex],
				isEditing: value,
			};
			return updated;
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
				{/* <div className="buttons-wrapper">
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
				</div> */}
				<AdminButton
					buttons={[
						{
							icon: 'form',
							text: __('Draft', 'multivendorx'),
							className: 'blue',
							onClick: () => createProduct('draft'),
						},
						{
							icon: 'save',
							text: __('Publish', 'multivendorx'),
							className: 'purple-bg',
							onClick: () => createProduct('publish'),
						},
					]}
				/>
			</div>

			<Container>
				<Column grid={3}>
					<Card title={__('Product type', 'multivendorx')}>
						<FormGroupWrapper>
							<FormGroup desc={__('A standalone product with no variant', 'multivendorx')}>
								<SelectInput
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
						// desc={__('Complete these fields to create a comprehensive product listing', 'multivendorx')}
						action={
							<>
								<div className="admin-badge blue">1/6</div>
							</>
						}
					>
						<FormGroupWrapper>
							<FormGroup>
								<div className="checklist-wrapper">
									<ul>
										<li
											className={
												checklist.name ? 'checked' : ''
											}
										>
											<div className="check-icon"><span></span></div>
											<div className="details">
												<div className="title">Product Name</div>
												<div className="des">A clear, descriptive title that helps customers find your product</div>
											</div>
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
													<div className="check-icon"><span></span></div>
													<div className="details">
														<div className="title">Price</div>
														<div className="des">Set competitive prices including any sale or discount options</div>
													</div>
												</li>

												<li
													className={
														checklist.stock
															? 'checked'
															: ''
													}
												>
													<div className="check-icon"><span></span></div>
													<div className="details">
														<div className="title">Stock</div>
														<div className="des">A clear, descriptive title that helps customers find your product</div>
													</div>
												</li>
											</>
										)}
										<li
											className={
												checklist.image ? 'checked' : ''
											}
										>
											<div className="check-icon"><span></span></div>
											<div className="details">
												<div className="title">Product Images</div>
												<div className="des">High-quality photos showing your product from multiple angles</div>
											</div>
										</li>

										<li
											className={
												checklist.image ? 'checked' : ''
											}
										>
											<div className="check-icon"><span></span></div>
											<div className="details">
												<div className="title">Category</div>
												<div className="des">Organize your product to help customers browse your store</div>
											</div>
										</li>

										<li
											className={
												checklist.image ? 'checked' : ''
											}
										>
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
					{/* General information */}
					<Card contentHeight
						title={__('General information', 'multivendorx')}
						iconName="adminfont-keyboard-arrow-down arrow-icon icon"
						toggle
					>
						<FormGroupWrapper>
							{/* Product Name */}
							<FormGroup label={__('Product name', 'multivendorx')} desc={__('A unique name for your product', 'multivendorx')}>
								<BasicInput
									name="name"

									value={product.name}
									onChange={(e) => handleChange('name', e.target.value)}
								/>
							</FormGroup>

							{/* Short Description */}
							<FormGroup label={__('Product short description', 'multivendorx')} desc={__('A short description displayed on product and checkout pages', 'multivendorx')}>
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
					<Card contentHeight
						title={__('Price', 'multivendorx')}
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
						</FormGroupWrapper>
					</Card>

					<Card contentHeight
						title={__('Inventory', 'multivendorx')}
						iconName="adminfont-keyboard-arrow-down arrow-icon icon"
						toggle
						action={
							<>
								<div className="field-wrapper">
									{__('Stock management', 'multivendorx')}
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
								</div>
							</>
						}
					>
						<FormGroupWrapper>
							{/* <FormGroup cols={2} label={__('Track Quantity', 'multivendorx')}>
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
							</FormGroup> */}
							{/* <FormGroup cols={2} label={__('Sold Individually', 'multivendorx')}>
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
							</FormGroup> */}
							{/* SKU + Sold Individually */}
							<FormGroup cols={2} label={__('SKU', 'multivendorx')}>
								<BasicInput
									name="sku"

									value={product.sku}
									onChange={(e) => handleChange('sku', e.target.value)}
								/>
							</FormGroup>

							{/* Stock Management */}
							{/* <FormGroup cols={2} label={__('Stock management', 'multivendorx')}>
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
							</FormGroup> */}

							{!product.manage_stock && (
								<>
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
								</>
							)}

							{/* Managed Stock Fields */}
							{product.manage_stock && (
								<>
									<FormGroup cols={2} label={__('Quantity', 'multivendorx')}>
										<BasicInput
											name="stock"

											value={product.stock}
											onChange={(e) =>
												handleChange('stock', e.target.value)
											}
										/>
									</FormGroup>

									<FormGroup cols={2} label={__('Allow backorders?', 'multivendorx')}>
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

									<FormGroup cols={2} label={__('Low stock threshold', 'multivendorx')}>
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

					<Card contentHeight
						title={__('Linked Products', 'multivendorx')}
						iconName="adminfont-keyboard-arrow-down arrow-icon icon"
						toggle
					>
						<FormGroupWrapper>
							<FormGroup cols={2} label={__('Upsells', 'multivendorx')}>
								<BasicInput
									name="name"

								// value={product.name}
								// onChange={(e) => handleChange('name', e.target.value)}
								/>
							</FormGroup>
							<FormGroup cols={2} label={__('Cross-sells', 'multivendorx')}>
								<BasicInput
									name="name"

								// value={product.name}
								// onChange={(e) => handleChange('name', e.target.value)}
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

					<Card contentHeight
						title={__('Variatations', 'multivendorx')}
						iconName="adminfont-keyboard-arrow-down arrow-icon icon"
						toggle
						action={
							<>
								<div className="admin-btn btn-purple-bg"><i className="adminfont-plus"></i> Add Attribute</div>
								<div className="admin-btn btn-purple-bg"><i className="adminfont-plus"></i> Add variant</div>
							</>
						}
					>
						{variant.map((variation, vIndex) => (
							<div className="variant-wrapper" key={variation.id}>

								{variation.isEditing && (
									<div className="edit-wrapper">
										<div className="variant">
											<div className="drag-icon">
												<i className="adminfont-drag"></i>
											</div>

											<FormGroupWrapper>
												<FormGroup label={__('Variant name', 'multivendorx')}>
													<BasicInput
														value={variation.name}
														onChange={(e) =>
															updateVariation(vIndex, 'name', e.target.value)
														}
													/>
												</FormGroup>
											</FormGroupWrapper>

											<span
												className="admin-badge red adminfont-delete"
												onClick={() => deleteVariation(vIndex)}
											/>
										</div>

										<div className="option-wrapper">
											<FormGroupWrapper>
												<FormGroup label={__('Option value', 'multivendorx')} />
											</FormGroupWrapper>

											{variation.options.map((opt, oIndex) => (
												<div className="variant" key={oIndex}>
													<div className="drag-icon">
														<i className="adminfont-drag"></i>
													</div>

													<BasicInput
														value={opt}
														onChange={(e) => {
															const updated = [...variation.options];
															updated[oIndex] = e.target.value;
															updateVariation(vIndex, 'options', updated);
														}}
													/>

													<span
														className="admin-badge red adminfont-delete"
														onClick={() => deleteOption(vIndex, oIndex)}
													/>
												</div>
											))}

											<div className="add-new">
												<FormGroupWrapper>
													<FormGroup>
														<BasicInput
															placeholder="Add another value"
															value={tempOptions[vIndex] || ''}
															onChange={(e) =>
																handleTempOptionChange(vIndex, e.target.value)
															}
															onKeyDown={(e) => {
																if (e.key === 'Enter') {
																	e.preventDefault();
																	addOption(vIndex);
																}
															}}
														/>
													</FormGroup>
												</FormGroupWrapper>
											</div>

											<div className="buttons-wrapper">
												<div
													className="admin-btn btn-green"
													onClick={() => setEditMode(vIndex, false)}
												>
													<i className="adminfont-active"></i> Done
												</div>

												<div
													className="admin-btn btn-purple"
													onClick={() => handleAddNewOption(vIndex)}
												>
													<i className="adminfont-plus"></i> Add New
												</div>
											</div>
										</div>
									</div>
								)}

								{!variation.isEditing && (
									<div className="variant-show">
										<div className="left-section">
											<div className="attributes">
												{variation.name || __('No variant', 'multivendorx')}
											</div>

											<div className="variantion-wrapper">
												{variation.options.map((opt, idx) => (
													<div className="admin-badge blue" key={idx}>
														{opt}
													</div>
												))}
											</div>
										</div>

										<div className="right-section">
											<div
												className="admin-btn btn-purple"
												onClick={() => setEditMode(vIndex, true)}
											>
												<i className="adminfont-edit"></i> Edit
											</div>
										</div>
									</div>
								)}
							</div>
						))}


						<div className="admin-btn btn-purple" onClick={addVariation}><i className="adminfont-plus"></i> Add variants Like size or color</div>

						{combinations.length > 0 && (
							<div className="table-wrapper variant-list">
								<table>
									<thead>
										<tr className="header">
											<td>{__('Variant', 'multivendorx')}</td>
											<td>{__('Price', 'multivendorx')}</td>
											<td>{__('Quantity', 'multivendorx')}</td>
											<td>{__('SKU', 'multivendorx')}</td>
											<td></td>
										</tr>
									</thead>
									<tbody>
										{combinations.map((combo) => (
											<tr key={Object.values(combo).join('|')}>
												<td>
													<i className="adminfont-product admin-badge purple"></i>
													{Object.values(combo).join(' / ')}
												</td>

												<td>
													<BasicInput
														name="price"
														preInsideText={__('$', 'multivendorx')}
														size="8rem"
													/>
												</td>

												<td>100</td>

												<td>
													<BasicInput name="sku" size="10rem" />
												</td>

												<td>
													<div className="buttons-wrapper">
														<span
															className="admin-badge blue adminfont-edit"
															onClick={() => setopenPopup(true)}
														></span>
														<span className="admin-badge red adminfont-delete"></span>
													</div>
												</td>
											</tr>
										))}
									</tbody>

								</table>
							</div>
						)}
					</Card>
					<CommonPopup
						open={openPopup}
						onClose={() => setopenPopup(false)}
						width="31rem"
						height="70%"
						header={{
							icon: 'commission',
							title: __('Edit Variant', 'multivendorx')
						}}
						footer={
							<AdminButton
								buttons={[
									{
										icon: 'close',
										text: 'Cancel',
										className: 'red',
										// onClick: () => setDeleteModal(false),
									},
									{
										icon: 'save',
										text: 'Save',
										className: 'purple-bg',
										// onClick: () => {
										// 	if (deleteOption) {
										// 		deleteStoreApiCall(deleteOption);
										// 	}
										// },
									},
								]}
							/>
						}
					>
						<FormGroupWrapper>
							<FormGroup cols={2} label={__('Regular price ($)', 'multivendorx')}>
								<BasicInput
									type="text"
									name="title"
								// value={formData.title}
								// onChange={handleChange}
								// msg={error}
								/>
							</FormGroup>
							<FormGroup cols={2} label={__('Sale price ($)', 'multivendorx')}>
								<BasicInput
									type="text"
									name="title"
								// value={formData.title}
								// onChange={handleChange}
								// msg={error}
								/>
							</FormGroup>
							<FormGroup label={__('Stock status', 'multivendorx')}>
								<BasicInput
									type="text"
									name="title"
								// value={formData.title}
								// onChange={handleChange}
								// msg={error}
								/>
							</FormGroup>
							<FormGroup label={__('SKU', 'multivendorx')}>
								<BasicInput
									type="text"
									name="title"
								// value={formData.title}
								// onChange={handleChange}
								// msg={error}
								/>
							</FormGroup>
							<FormGroup cols={3} label={__('Length (in)', 'multivendorx')}>
								<BasicInput
									type="text"
									name="title"
								// value={formData.title}
								// onChange={handleChange}
								// msg={error}
								/>
							</FormGroup>
							<FormGroup cols={3} label={__('Width (in)', 'multivendorx')}>
								<BasicInput
									type="text"
									name="title"
								// value={formData.title}
								// onChange={handleChange}
								// msg={error}
								/>
							</FormGroup>
							<FormGroup cols={3} label={__('Height (in)', 'multivendorx')}>
								<BasicInput
									type="text"
									name="title"
								// value={formData.title}
								// onChange={handleChange}
								// msg={error}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</CommonPopup>
				</Column>

				<Column grid={3}>
					{/* ai assist */}
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
									<i
										className={`star-icon ${starFill ? 'adminfont-star' : 'adminfont-star-o'
											}`}
									/>
									{__('Featured product', 'multivendorx')}
								</label>
							</>
						}
					>
						<FormGroupWrapper>
							<FormGroup row label={__('Catalog Visibility', 'multivendorx')} htmlFor="catalog-visibility">
								<div ref={visibilityRef}>
									<div className="catalog-visibility">
										<span className="catalog-visibility-value">
											{VISIBILITY_LABELS[product.catalog_visibility]}
										</span>
										<span
											onClick={() => {
												setIsEditingVisibility((prev) => !prev);
												setIsEditingStatus(false);
											}}

										>
											<i className="adminfont-keyboard-arrow-down" />
										</span>
									</div>
									{/* Edit catalog visibility */}
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
										</div>
									)}
								</div>
							</FormGroup>
							<FormGroup
								row
								label={__('Product Page', 'multivendorx')}
								htmlFor="status"
							>
								<div ref={visibilityRef}>
									<div className="catalog-visibility">
										<span className="catalog-visibility-value">
											{STATUS_LABELS[product.status]}
										</span>
										<span
											onClick={() => {
												setIsEditingStatus((prev) => !prev);
												setIsEditingVisibility(false);
											}}
										>
											<i className="adminfont-keyboard-arrow-down" />
										</span>
									</div>

									{/* Edit Product Page Status */}
									{isEditingStatus && (
										<div className="setting-dropdown">
											<FormGroup>
												<ToggleSetting
													descClass="settings-metabox-description"
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
													value={product.status}
													onChange={(value) => {
														handleChange('status', value);
														setIsEditingStatus(false); // close popup
													}}
												/>
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
													value={product.status}
													onChange={(value) => {
														handleChange('status', value);
														setIsEditingStatus(false);
													}}
												/>
											</FormGroup>
										</div>
									)}
								</div>
							</FormGroup>

							<FormGroup row label={__('Cataloged at', 'multivendorx')} htmlFor="status">
								<div className="catalog-visibility">
									<span className="catalog-visibility-value">
										{__('Dec 16, 2025', 'multivendorx')}
									</span>
								</div>
							</FormGroup>
						</FormGroupWrapper>
					</Card>

					<Card contentHeight
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
					<Card contentHeight
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
					<Card contentHeight
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
{/* 
					 <Card
						title={__('Visibility', 'multivendorx')}
						iconName="adminfont-keyboard-arrow-down arrow-icon icon"
						toggle
					> 
					 <FormGroupWrapper> 
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

					 <FormGroup>
								<div className="catalog-visibility">
									{__('Catalog Visibility:', 'multivendorx')}
									<span className="catalog-visibility-value">
										{VISIBILITY_LABELS[product.catalog_visibility]}
									</span>
									<span
										className="admin-badge blue"
										onClick={() => {
											setIsEditingVisibility((prev) => !prev);
											setIsEditingStatus(false);
										}}

									>
										<i className="adminfont-edit" />
									</span>
								</div>
							</FormGroup> 

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
					 </Card>  */}
				</Column>
			</Container >
		</>
	);
};

export default AddProduct;