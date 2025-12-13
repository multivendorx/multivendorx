import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import {
	BasicInput,
	CommonPopup,
	CalendarInput,
	FileInput,
	MultiCheckBox,
	RadioInput,
	SelectInput,
	TextArea,
	getApiLink,
	useModules,
} from 'zyra';
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

const AddProduct = () => {
	const location = useLocation();
	const { modules } = useModules();
	const query = new URLSearchParams(location.search);
	let productId = query.get('context_id');
	if (!productId) {
		const parts = location.pathname.split('/').filter(Boolean);
		if (parts.length >= 4) {
			productId = productId || parts[3];
		}
	}
	const [product, setProduct] = useState({});

	const [featuredImage, setFeaturedImage] = useState(null);
	const [galleryImages, setGalleryImages] = useState([]);

	const [AddInhance, setAddInhance] = useState(false);
	const [enhancementPrompt, setEnhancementPrompt] = useState('');
	const [isEnhancing, setIsEnhancing] = useState(false);
	const [enhancementResult, setEnhancementResult] = useState('');
	const [enhancementError, setEnhancementError] = useState('');
	const [selectedImageForEnhancement, setSelectedImageForEnhancement] =
		useState(null);
	const [generatedImage, setGeneratedImage] = useState(null);

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
	}, [productId]);

	const [categories, setCategories] = useState([]);
	const [selectedCats, setSelectedCats] = useState([]);

	const isPyramidEnabled =
		appLocalizer.settings_databases_value['category-pyramid-guide']
			?.category_pyramid_guide === 'yes';

	const wrapperRef = useRef(null);

	const [selectedCat, setSelectedCat] = useState(null);
	const [selectedSub, setSelectedSub] = useState(null);
	const [selectedChild, setSelectedChild] = useState(null);

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
		const arrow = document.querySelector(`#${cardId} .arrow-icon`);

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
			appLocalizer.settings_databases_value['category-pyramid-guide']
				?.category_pyramid_guide == 'yes'
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

	// Function to convert image to base64
	const getImageBase64 = (imageSrc) => {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.crossOrigin = 'anonymous';
			img.onload = () => {
				const canvas = document.createElement('canvas');
				canvas.width = img.width;
				canvas.height = img.height;
				const ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0);
				const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
				resolve(base64);
			};
			img.onerror = reject;
			img.src = imageSrc;
		});
	};

	// Function to handle image enhancement
	const handleImageEnhancement = async () => {
		if (!enhancementPrompt.trim()) {
			setEnhancementError('Please enter a prompt for image enhancement');
			return;
		}

		const imageToEnhance = selectedImageForEnhancement;

		if (!imageToEnhance) {
			setEnhancementError('Please select an image first');
			return;
		}

		setIsEnhancing(true);
		setEnhancementError('');
		setEnhancementResult('');
		setGeneratedImage(null);

		try {
			// Convert image to base64
			const imageData = await getImageBase64(imageToEnhance);

			// Call the API
			const response = await axios({
				method: 'POST',
				url: getApiLink(appLocalizer, 'ai-assistant'),
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
					'Content-Type': 'application/json',
				},
				params: {
					endpoint: 'enhance_image',
				},
				data: {
					user_prompt: enhancementPrompt,
					image_data: imageData,
				},
			});

			if (response.data && response.data.success) {
				if (response.data.image_data) {
					// We have an actual generated image
					const mimeType =
						response.data.image_mime_type || 'image/png';
					const imageSrc = `data:${mimeType};base64,${response.data.image_data}`;
					setGeneratedImage({
						src: imageSrc,
						mimeType: mimeType,
					});

					// Also store any text response
					if (response.data.message) {
						setEnhancementResult(response.data.message);
					}
				} else if (response.data.text_response) {
					// Fallback to text response
					setEnhancementResult(response.data.text_response);
				}
			} else {
				setEnhancementError(
					response.data?.message || 'Failed to enhance image'
				);
			}
		} catch (err) {
			console.error('Image enhancement error:', err);
			setEnhancementError(
				err.response?.data?.message ||
					err.response?.data?.error?.message ||
					'Network error occurred. Please try again.'
			);
		} finally {
			setIsEnhancing(false);
		}
	};

	// Update the useEnhancedImage function
	const useEnhancedImage = async () => {
		if (!generatedImage) {
			return;
		}

		try {
			// Convert base64 to blob
			const response = await fetch(generatedImage.src);
			const blob = await response.blob();

			// Create form data for WordPress media upload
			const formData = new FormData();
			formData.append('file', blob, `ai-enhanced-${Date.now()}.png`);
			formData.append('title', 'AI Enhanced Product Image');

			// Upload to WordPress media library
			const uploadResponse = await axios.post(
				`${appLocalizer.apiUrl}/wp/v2/media`,
				formData,
				{
					headers: {
						'X-WP-Nonce': appLocalizer.nonce,
						'Content-Type': 'multipart/form-data',
					},
				}
			);

			if (uploadResponse.data && uploadResponse.data.id) {
				const enhancedImage = {
					id: uploadResponse.data.id,
					src: uploadResponse.data.source_url,
					thumbnail:
						uploadResponse.data.media_details?.sizes?.thumbnail
							?.source_url || uploadResponse.data.source_url,
				};

				// Determine which image to replace
				const originalImageSrc = selectedImageForEnhancement;

				// Check if it's the featured image
				if (featuredImage && featuredImage.src === originalImageSrc) {
					// REPLACE featured image
					setFeaturedImage(enhancedImage);
					setEnhancementResult(
						__(
							'Enhanced image has replaced the featured image.',
							'multivendorx'
						)
					);
					set;
				}
				// Check if it's a gallery image
				else {
					// ADD to gallery (don't replace)
					setGalleryImages((prev) => [...prev, enhancedImage]);
					setEnhancementResult(
						__('Enhanced image added to gallery.', 'multivendorx')
					);
				}
			}
		} catch (error) {
			setEnhancementError(
				__(
					'Failed to use enhanced image. Please try again.',
					'multivendorx'
				)
			);
		}
	};

	// Update the openImageEnhancer function
	const openImageEnhancer = (imageSrc = null) => {
		if (imageSrc) {
			setSelectedImageForEnhancement(imageSrc);
		} else {
			// Use featured image or first gallery image
			const imageToUse =
				featuredImage?.src ||
				(galleryImages.length > 0 ? galleryImages[0].src : null);
			setSelectedImageForEnhancement(imageToUse);
		}
		setEnhancementPrompt('');
		setEnhancementResult('');
		setEnhancementError('');
		setGeneratedImage(null);
		setAddInhance(true);
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

	return (
		<>
			<div className="page-title-wrapper">
				<div className="page-title">
					<div className="title">
						{__('Add Product', 'multivendorx')}
					</div>

					<div className="des">
						{__(
							'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quas accusantium obcaecati labore nam quibusdam minus.',
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

			<div className="container-wrapper">
				<div className="card-wrapper w-10">
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

									<li
										className={
											checklist.image ? 'checked' : ''
										}
									>
										<span></span> Image
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
				</div>

				<div className="card-wrapper column w-65">
					{/* General information */}
					<div className="card-content" id="card-general">
						<div className="card-header">
							<div className="left">
								<div className="title">
									{__('General information', 'multivendorx')}
								</div>
							</div>
							<div className="right">
								<i
									className="adminlib-pagination-right-arrow arrow-icon"
									onClick={() => toggleCard('card-general')}
								></i>
							</div>
						</div>
						<div className="card-body">
							<div className="form-group-wrapper">
								<div className="form-group">
									<label htmlFor="product-name">
										{__('Product name', 'multivendorx')}
									</label>
									<BasicInput
										name="name"
										wrapperClass="setting-form-input"
										value={product.name}
										onChange={(e) =>
											handleChange('name', e.target.value)
										}
									/>
								</div>
							</div>

							<div className="form-group-wrapper">
								<div className="form-group">
									<label htmlFor="product-name">
										{__(
											'Product short description',
											'multivendorx'
										)}
									</label>
									<TextArea
										name="short_description"
										wrapperClass="setting-from-textarea"
										inputClass="textarea-input"
										descClass="settings-metabox-description"
										value={product.short_description}
										onChange={(e) =>
											handleChange(
												'short_description',
												e.target.value
											)
										}
									/>
								</div>
							</div>

							<div className="form-group-wrapper">
								<div className="form-group">
									<label htmlFor="product-name">
										{__(
											'Product description',
											'multivendorx'
										)}
									</label>
									<TextArea
										name="description"
										wrapperClass="setting-from-textarea"
										inputClass="textarea-input"
										descClass="settings-metabox-description"
										value={product.description}
										onChange={(e) =>
											handleChange(
												'description',
												e.target.value
											)
										}
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Price and stock */}
					<div className="card-content" id="card-price">
						<div className="card-header">
							<div className="left">
								<div className="title">
									{__('Price and stock', 'multivendorx')}
								</div>
							</div>
							<div className="right">
								<i
									className="adminlib-pagination-right-arrow arrow-icon"
									onClick={() => toggleCard('card-price')}
								></i>
							</div>
						</div>
						<div className="card-body">
							{product?.type == 'simple' && (
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="product-name">
											{__(
												'Regular price',
												'multivendorx'
											)}
										</label>
										<BasicInput
											name="regular_price"
											wrapperClass="setting-form-input"
											value={product.regular_price}
											onChange={(e) =>
												handleChange(
													'regular_price',
													e.target.value
												)
											}
										/>
									</div>
									<div className="form-group">
										<label htmlFor="product-name">
											{__('Sale price', 'multivendorx')}
										</label>
										<BasicInput
											name="sale_price"
											wrapperClass="setting-form-input"
											value={product.sale_price}
											onChange={(e) =>
												handleChange(
													'sale_price',
													e.target.value
												)
											}
										/>
									</div>
								</div>
							)}

							<div className="form-group-wrapper">
								<div className="form-group">
									<label htmlFor="product-name">
										{__('SKU', 'multivendorx')}
									</label>
									<BasicInput
										name="sku"
										wrapperClass="setting-form-input"
										value={product.sku}
										onChange={(e) =>
											handleChange('sku', e.target.value)
										}
									/>
								</div>
								<div className="form-group">
									<label htmlFor="">
										{__(
											'Sold individually',
											'multivendorx'
										)}
									</label>
									<MultiCheckBox
										wrapperClass="toggle-btn"
										inputWrapperClass="toggle-checkbox-header"
										inputInnerWrapperClass="toggle-checkbox"
										idPrefix="toggle-switch-sold-individually"
										type="checkbox"
										value={
											product.sold_individually
												? ['sold_individually']
												: []
										}
										onChange={(e) =>
											handleChange(
												'sold_individually',
												(
													e as React.ChangeEvent<HTMLInputElement>
												).target.checked
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
							</div>
							<div className="form-group-wrapper">
								<div className="form-group">
									<label htmlFor="">
										{__('Stock management', 'multivendorx')}
									</label>
									<MultiCheckBox
										wrapperClass="toggle-btn"
										inputWrapperClass="toggle-checkbox-header"
										inputInnerWrapperClass="toggle-checkbox"
										idPrefix="toggle-switch-manage-stock"
										type="checkbox"
										value={
											product.manage_stock
												? ['manage_stock']
												: []
										}
										onChange={(e) =>
											handleChange(
												'manage_stock',
												(
													e as React.ChangeEvent<HTMLInputElement>
												).target.checked
											)
										}
										options={[
											{
												key: 'manage_stock',
												value: 'manage_stock',
											},
										]}
									/>
								</div>
								{!product.manage_stock && (
									<div className="form-group">
										<label htmlFor="product-name">
											{__('Stock Status', 'multivendorx')}
										</label>
										<SelectInput
											name="stock_status"
											options={stockStatusOptions}
											type="single-select"
											value={product.stock_status}
											onChange={(selected) =>
												handleChange(
													'stock_status',
													selected.value
												)
											}
										/>
									</div>
								)}
							</div>
							{product.manage_stock && (
								<div className="form-group-wrapper">
									<div className="form-group">
										<label htmlFor="product-name">
											{__('Quantity', 'multivendorx')}
										</label>
										<BasicInput
											name="stock"
											wrapperClass="setting-form-input"
											value={product.stock}
											onChange={(e) =>
												handleChange(
													'stock',
													e.target.value
												)
											}
										/>
									</div>
									<div className="form-group">
										<label htmlFor="product-name">
											{__(
												'Allow backorders?',
												'multivendorx'
											)}
										</label>
										<SelectInput
											name="backorders"
											options={backorderOptions}
											type="single-select"
											value={product.backorders}
											onChange={(selected) =>
												handleChange(
													'backorders',
													selected.value
												)
											}
										/>
									</div>
									<div className="form-group">
										<label htmlFor="product-name">
											{__(
												'Low stock threshold',
												'multivendorx'
											)}
										</label>
										<BasicInput
											name="low_stock_amount"
											wrapperClass="setting-form-input"
											value={product.low_stock_amount}
											onChange={(e) =>
												handleChange(
													'low_stock_amount',
													e.target.value
												)
											}
										/>
									</div>
								</div>
							)}

							{/* <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">
                                        {__('Product URL', 'multivendorx')}
                                    </label>
                                    <BasicInput
                                        name="address"
                                        wrapperClass="setting-form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="product-name">
                                        {__('Button text', 'multivendorx')}
                                    </label>
                                    <BasicInput
                                        name="address"
                                        wrapperClass="setting-form-input"
                                    />
                                </div>
                            </div> */}
						</div>
					</div>

					{modules.includes('min-max') && product?.type == 'simple' &&
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

					{AddInhance && (
						<CommonPopup
							open={AddInhance}
							onClick={() => setAddInhance(false)}
							width="50%"
							height="90%"
							header={
								<>
									<div className="title">
										<i className="adminlib-magic"></i>
										{__(
											'AI Image Enhancer',
											'multivendorx'
										)}
									</div>
									<p>
										{__(
											'Upload an image and describe enhancements. AI will generate a new enhanced image.',
											'multivendorx'
										)}
									</p>
									<i
										className="icon adminlib-close"
										onClick={() => setAddInhance(false)}
									></i>
								</>
							}
							footer={
								<>
									<div
										className="admin-btn btn-red"
										onClick={() => {
											setAddInhance(false);
										}}
									>
										{__('Cancel', 'multivendorx')}
									</div>
									<div
										className={`admin-btn btn-purple-bg ${
											isEnhancing ? 'disabled' : ''
										}`}
										onClick={
											!isEnhancing
												? handleImageEnhancement
												: undefined
										}
									>
										{isEnhancing
											? __(
													'Generating Image...',
													'multivendorx'
												)
											: __(
													'Generate Enhanced Image',
													'multivendorx'
												)}
									</div>
								</>
							}
						>
							<div className="content">
								{/* Original Image Preview */}
								{selectedImageForEnhancement && (
									<div className="image-preview-section">
										<h4>
											<i className="adminlib-image"></i>{' '}
											{__(
												'Original Image:',
												'multivendorx'
											)}
										</h4>
										<div>
											<img
												src={
													selectedImageForEnhancement
												}
												alt="Original Preview"
											/>
											<p>
												{__(
													'This is the original image that will be enhanced.',
													'multivendorx'
												)}
											</p>
										</div>
									</div>
								)}

								{/* Prompt Input */}
								<div className="form-group">
									<label>
										{__(
											'Enhancement Instructions',
											'multivendorx'
										)}
									</label>
									<textarea
										value={enhancementPrompt}
										onChange={(e) =>
											setEnhancementPrompt(e.target.value)
										}
										placeholder={__(
											"E.g., 'Make the colors more vibrant and appealing', 'Add professional lighting and background', 'Remove all shadows and make it studio quality', 'Make it look more premium and luxurious', etc.",
											'multivendorx'
										)}
										disabled={isEnhancing}
									/>
									<p>
										{__(
											'Describe exactly how you want the AI to enhance the image.',
											'multivendorx'
										)}
									</p>
								</div>

								{/* Error Message */}
								{enhancementError && (
									<div className="error-message">
										<strong>
											{__('Error:', 'multivendorx')}
										</strong>{' '}
										{enhancementError}
									</div>
								)}

								{/* Generated Image Result */}
								{generatedImage && (
									<div className="result-section">
										<h4>
											<i className="adminlib-check"></i>
											{__(
												'Generated Enhanced Image:',
												'multivendorx'
											)}
										</h4>

										{/* Image Comparison */}
										<div className="image-comparison">
											{/* Original Image */}
											<div className="image-container">
												<h5>
													{__(
														'Original',
														'multivendorx'
													)}
												</h5>
												<div className="image-preview">
													<img
														src={
															selectedImageForEnhancement
														}
														alt="Original"
													/>
												</div>
											</div>

											{/* Generated Image */}
											<div className="image-container">
												<h5>
													{__(
														'AI Enhanced',
														'multivendorx'
													)}
												</h5>
												<div className="image-preview enhanced">
													<img
														src={generatedImage.src}
														alt="AI Enhanced"
													/>
													<div className="badge-new">
														NEW
													</div>
												</div>
											</div>
										</div>

										{/* Simplified action buttons */}
										<div className="action-buttons">
											<button
												className="admin-btn btn-purple-bg"
												onClick={() =>
													useEnhancedImage()
												}
											>
												{__(
													'Use This Image',
													'multivendorx'
												)}
											</button>
										</div>
										{enhancementResult && (
											<div className="result-message">
												<strong>
													{__(
														'Result:',
														'multivendorx'
													)}
												</strong>{' '}
												{enhancementResult}
											</div>
										)}
									</div>
								)}

								{/* Loading State */}
								{isEnhancing && (
									<div>
										<div></div>
										<p>
											{__(
												'Generating enhanced image...',
												'multivendorx'
											)}
										</p>
										<p>
											{__(
												'This may take 20-40 seconds. Please wait.',
												'multivendorx'
											)}
										</p>
									</div>
								)}
							</div>
						</CommonPopup>
					)}
				</div>

				{/* right column */}
				<div className="card-wrapper column w-35">
					<div className="card-content">
						<div className="card-header">
							<div className="left">
								<div className="title">Visibility</div>
							</div>
							<div className="right">
								<i className="adminlib-pagination-right-arrow  arrow-icon"></i>
							</div>
						</div>
						<div className="card-body">
							<div className="form-group-wrapper">
								<div className="form-group">
									<label htmlFor="product-name">
										{__('Product type', 'multivendorx')}
									</label>
									<SelectInput
										name="type"
										options={typeOptions}
										value={product.type}
										onChange={(selected) =>
											handleChange('type', selected.value)
										}
									/>
								</div>
							</div>
							<div className="form-group-wrapper">
								<div className="form-group">
									<div className="checkbox-wrapper">
										<div className="item">
											<input
												type="checkbox"
												checked={product.virtual}
												onChange={(e) =>
													handleChange(
														'virtual',
														e.target.checked
													)
												}
											/>
											{__('Virtual', 'multivendorx')}
										</div>
										<div className="item">
											<input
												type="checkbox"
												checked={product.downloadable}
												onChange={(e) =>
													handleChange(
														'downloadable',
														e.target.checked
													)
												}
											/>
											{__('Download', 'multivendorx')}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* ai assist */}
					{applyFilters('product_ai_assist', null, product)}

					<div className="card-content">
						<div className="card-header">
							<div className="left">
								<div className="title">Visibility</div>
							</div>
							<div className="right">
								<i className="adminlib-pagination-right-arrow  arrow-icon"></i>
							</div>
						</div>
						<div className="card-body">
							<div className="form-group-wrapper">
								<div className="form-group">
									<label htmlFor="visibility">
										Catalog Visibility
									</label>

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
												key: 'vs1',
												value: 'visible',
												label: 'Shop and search results',
												name: 'visibility',
											},
											{
												key: 'vs2',
												value: 'catalog',
												label: 'Shop only',
												name: 'visibility',
											},
											{
												key: 'vs3',
												value: 'search',
												label: 'Search results only',
												name: 'visibility',
											},
											{
												key: 'vs4',
												value: 'hidden',
												label: 'Hidden',
												name: 'visibility',
											},
										]}
										value={product.catalog_visibility}
										onChange={(e) =>
											handleChange(
												'catalog_visibility',
												e.target.value
											)
										}
									/>
								</div>
							</div>

							<div className="form-group-wrapper">
								<div className="form-group">
									{/* <label htmlFor="product-name">Status</label>
                                    <div className="admin-badge green">
                                        Publish
                                    </div> */}

									{/* <div className="form-group"> */}
									<label>Status</label>

									<select
										className="basic-select"
										value={product.status}
										onChange={(e) =>
											handleChange(
												'status',
												e.target.value
											)
										}
									>
										<option value="publish">
											Published
										</option>
										<option value="draft">Draft</option>
										<option value="pending">
											Pending Review
										</option>
									</select>
									{/* </div> */}
								</div>
							</div>
							<div className="form-group-wrapper">
								<div className="form-group">
									<label htmlFor="product-name">
										Published on
									</label>

									<div className="date-field-wrapper">
										{product.date_created && (
											<>
												<CalendarInput
													wrapperClass="calendar-wrapper"
													inputClass="calendar-input"
													value={
														product.date_created?.split(
															'T'
														)[0] || ''
													}
													onChange={(date: any) => {
														const dateStr =
															date?.toString();

														setProduct((prev) => {
															const oldTime =
																prev.date_created?.split(
																	'T'
																)[1] ||
																'00:00:00';
															return {
																...prev,
																date_created: `${dateStr}T${oldTime}`,
															};
														});
													}}
													format="YYYY-MM-DD"
												/>
												<BasicInput
													wrapperClass="form-group-wrapper"
													type="time"
													id="published-time"
													name="published_time"
													value={
														product.date_created
															?.split('T')[1]
															?.slice(0, 5) || ''
													}
													onChange={(e: any) => {
														const newTime =
															e.target.value; // "10:35"

														setProduct((prev) => {
															const oldDate =
																prev.date_created?.split(
																	'T'
																)[0] || '';
															return {
																...prev,
																date_created: `${oldDate}T${newTime}:00`,
															};
														});
													}}
												/>
											</>
										)}
									</div>
								</div>
							</div>

							<div className="form-group-wrapper">
								<div className="form-group">
									<label>
										<input
											type="checkbox"
											checked={product.featured}
											onChange={(e) =>
												handleChange(
													'featured',
													e.target.value
												)
											}
										/>
										This is a featured product
									</label>
								</div>
							</div>
						</div>
					</div>

					<div className="card-content">
						<div className="card-header">
							<div className="left">
								<div className="title">Category</div>
							</div>
							<div className="right">
								<i className="adminlib-pagination-right-arrow  arrow-icon"></i>
							</div>
						</div>
						<div className="card-body">
							{appLocalizer.settings_databases_value[
								'category-pyramid-guide'
							]?.category_pyramid_guide == 'yes' ? (
								<>
									<div className="category-breadcrumb-wrapper">
										<div className="category-breadcrumb">
											{printPath()}
										</div>
										{(selectedCat ||
											selectedSub ||
											selectedChild) && (
											<button
												onClick={resetSelection}
												className="admin-btn btn-red"
											>
												Reset
											</button>
										)}
									</div>
									<div className="form-group-wrapper">
										<div className="form-group">
											<div
												className="category-wrapper template2"
												ref={wrapperRef}
											>
												<ul className="settings-form-group-radio">
													{treeData.map((cat) => (
														<React.Fragment
															key={cat.id}
														>
															{/* CATEGORY */}
															<li
																className={`category ${
																	selectedCat ===
																	cat.id
																		? 'radio-select-active'
																		: ''
																}`}
																style={{
																	display:
																		selectedCat ===
																			null ||
																		selectedCat ===
																			cat.id
																			? 'block'
																			: 'none',
																}}
																onClick={() =>
																	handleCategoryClick(
																		cat.id
																	)
																}
															>
																<label>
																	{cat.name}
																</label>
															</li>

															{/* CATEGORY CHILDREN */}
															{selectedCat ===
																cat.id &&
																cat.children
																	?.length >
																	0 && (
																	<ul className="settings-form-group-radio">
																		{cat.children.map(
																			(
																				sub
																			) => (
																				<React.Fragment
																					key={
																						sub.id
																					}
																				>
																					{/* SUB CATEGORY */}
																					<li
																						className={`sub-category ${
																							selectedSub ===
																							sub.id
																								? 'radio-select-active'
																								: ''
																						}`}
																						style={{
																							display:
																								!selectedSub ||
																								selectedSub ===
																									sub.id
																									? 'block'
																									: 'none',
																						}}
																						onClick={() =>
																							handleSubClick(
																								sub.id
																							)
																						}
																					>
																						<label>
																							{
																								sub.name
																							}
																						</label>
																					</li>

																					{/* CHILDREN */}
																					{selectedSub ===
																						sub.id &&
																						sub
																							.children
																							?.length >
																							0 && (
																							<ul className="settings-form-group-radio">
																								{sub.children.map(
																									(
																										child
																									) => (
																										<li
																											key={
																												child.id
																											}
																											className={`sub-category ${
																												selectedChild ===
																												child.id
																													? 'radio-select-active'
																													: ''
																											}`}
																											style={{
																												display:
																													!selectedChild ||
																													selectedChild ===
																														child.id
																														? 'block'
																														: 'none',
																											}}
																											onClick={() =>
																												handleChildClick(
																													child.id
																												)
																											}
																										>
																											<label>
																												{
																													child.name
																												}
																											</label>
																										</li>
																									)
																								)}
																							</ul>
																						)}
																				</React.Fragment>
																			)
																		)}
																	</ul>
																)}
														</React.Fragment>
													))}
												</ul>
											</div>
										</div>
									</div>
								</>
							) : (
								<div className="form-group-wrapper">
									<div className="form-group">
										<CategoryTree
											categories={categories}
											selectedCats={selectedCats}
											toggleCategory={toggleCategory}
										/>
									</div>
								</div>
							)}

							<div className="form-group-wrapper">
								<div className="form-group">
									<label>Product Tags</label>

									<div className="tag-list">
										{product.tags?.map((tag) => (
											<span
												className="admin-badge blue"
												key={tag.id}
											>
												{tag.name}
												<span
													onClick={() =>
														setProduct((prev) => ({
															...prev,
															tags: prev.tags.filter(
																(t) =>
																	t.name !==
																	tag.name
															),
														}))
													}
												>
													<i className="delete-icon adminlib-cross"></i>
												</span>
											</span>
										))}
									</div>

									<div className="dropdown-field">
										<input
											type="text"
											value={tagInput}
											onChange={(e) =>
												handleTagInput(e.target.value)
											}
											onKeyDown={(e) =>
												e.key === 'Enter' &&
												addTag(tagInput)
											}
											placeholder="Type tag…"
											className="basic-input dropdown-input"
										/>

										<button
											className="admin-btn btn-green"
											onClick={() => addTag(tagInput)}
										>
											Add
										</button>

										{suggestions.length > 0 && (
											<div className="input-dropdown">
												<ul>
													{suggestions.map((tag) => (
														<li
															key={
																tag.id ||
																tag.name
															}
															className="dropdown-item"
															// onClick={() =>
															//     addTag(tag)
															// }
															onMouseDown={() =>
																addTag(tag)
															}
														>
															{tag.name}
														</li>
													))}
												</ul>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
					{/* image upload */}
					<div className="card-content" id="card-image-upload">
						<div className="card-header">
							<div className="left">
								<div className="title">Upload image</div>
							</div>
							<div className="right">
								<i
									className="adminlib-pagination-right-arrow  arrow-icon"
									onClick={() =>
										toggleCard('card-image-upload')
									}
								></i>
							</div>
						</div>
						<div className="card-body">
							<div className="form-group-wrapper">
								<div className="form-group">
									<label htmlFor="product-name">
										Features Image
									</label>
									<div>
										<div>
											<FileInput
												type="hidden"
												imageSrc={
													featuredImage?.thumbnail
												}
												openUploader="Select Featured Image"
												buttonClass="admin-btn btn-purple"
												onButtonClick={
													openFeaturedUploader
												}
												onRemove={() =>
													setFeaturedImage(null)
												}
												onReplace={openFeaturedUploader}
											/>
										</div>
										<button
											className="admin-btn btn-blue"
											onClick={() =>
												openImageEnhancer(
													featuredImage?.src
												)
											}
										>
											<i className="adminlib-magic"></i>{' '}
											{__('Enhance', 'multivendorx')}
										</button>
									</div>
								</div>
							</div>
							<div className="form-group-wrapper">
								<div className="form-group">
									<label htmlFor="product-name">
										Product gallery
									</label>
									<div className="gallery-wrapper">
										{galleryImages.map((img, index) => (
											<div key={img.id}>
												<div>
													<FileInput
														type="hidden"
														imageSrc={img.thumbnail}
														openUploader="Replace Image"
														buttonClass="admin-btn btn-purple"
														onRemove={() => {
															setGalleryImages(
																galleryImages.filter(
																	(i, idx) =>
																		idx !==
																		index
																)
															);
														}}
														onReplace={() =>
															openGalleryUploader()
														}
													/>
												</div>
												<button
													className="admin-btn btn-blue"
													onClick={() =>
														openImageEnhancer(
															img.src
														)
													}
												>
													<i className="adminlib-magic"></i>{' '}
													{__(
														'Enhance',
														'multivendorx'
													)}
												</button>
											</div>
										))}
										{/* Add more button */}
										<div>
											{/* Add more button */}
											<FileInput
												type="hidden"
												imageSrc={null}
												openUploader="Add Gallery Image"
												buttonClass="admin-btn btn-purple"
												onButtonClick={
													openGalleryUploader
												}
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default AddProduct;
