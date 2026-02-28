import { useEffect, useState } from 'react';
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
	SelectInputUI,
	TextAreaUI,
	FileInputUI,
	NavigatorHeader,
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
	const [selectedCats, setSelectedCats] = useState([]);
	const [selectedCat, setSelectedCat] = useState(null);
	const [selectedSub, setSelectedSub] = useState(null);
	const [selectedChild, setSelectedChild] = useState(null);

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
				params: { product_id: productId },
			})
				.then((response) => {
					setTranslation(response.data);
				})
				.catch(() => {
					setTranslation([]);
				});
		}
	}, [productId]);

	const typeOptions = [
		{ label: 'Select product type', value: '' },
		{ label: 'Simple Product', value: 'simple' },
		{ label: 'Variable Product', value: 'variable' },
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
			policies:
				!!product.shipping_policy ||
				!!product.refund_policy ||
				product.cancellation_policy,
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
					<div
						key={lang.code}
						className="multivendorx-translation-row"
					>
						<div>
							<img src={lang.flag_url} alt={lang.code} />
							<strong>{lang.native_name}</strong>
						</div>
					</div>
				))}
			<NavigatorHeader
				headerTitle={__('Add Product', 'multivendorx')}
				headerDescription={__(
					'Enter your product details - name, price, stock, and image & publish.',
					'multivendorx'
				)}
				buttons={[
					{
						label: __('Save', 'multivendorx'),
						icon: 'save',
						onClick: () => createProduct(),
					},
				]}
			/>
			<Container>
				<Column grid={3}>
					<Card title={__('Product type', 'multivendorx')}>
						<FormGroupWrapper>
							<FormGroup
								desc={__(
									'A standalone product with no variant',
									'multivendorx'
								)}
							>
								<SelectInputUI
									name="type"
									type="single-select"
									options={typeOptions}
									value={product.type}
									onChange={(selected) =>{
										handleChange('type', selected)
									}
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
										<li
											className={
												checklist.name ? 'checked' : ''
											}
										>
											<div className="check-icon">
												<span></span>
											</div>
											<div className="details">
												<div className="title">
													Product Name
												</div>
												<div className="des">
													A clear, descriptive title
													that helps customers find
													your product
												</div>
											</div>
										</li>
										{product.type === 'simple' && (
											<>
												<li
													className={
														checklist.price
															? 'checked'
															: ''
													}
												>
													<div className="check-icon">
														<span></span>
													</div>
													<div className="details">
														<div className="title">
															Price
														</div>
														<div className="des">
															Set competitive
															prices including any
															sale or discount
															options
														</div>
													</div>
												</li>

												<li
													className={
														checklist.stock
															? 'checked'
															: ''
													}
												>
													<div className="check-icon">
														<span></span>
													</div>
													<div className="details">
														<div className="title">
															Stock
														</div>
														<div className="des">
															A clear, descriptive
															title that helps
															customers find your
															product
														</div>
													</div>
												</li>
											</>
										)}
										<li
											className={
												checklist.image ? 'checked' : ''
											}
										>
											<div className="check-icon">
												<span></span>
											</div>
											<div className="details">
												<div className="title">
													Product Images
												</div>
												<div className="des">
													High-quality photos showing
													your product from multiple
													angles
												</div>
											</div>
										</li>

										<li
											className={
												checklist.categories
													? 'checked'
													: ''
											}
										>
											<div className="check-icon">
												<span></span>
											</div>
											<div className="details">
												<div className="title">
													Category
												</div>
												<div className="des">
													Organize your product to
													help customers browse your
													store
												</div>
											</div>
										</li>

										<li
											className={
												checklist.policies
													? 'checked'
													: ''
											}
										>
											<div className="check-icon">
												<span></span>
											</div>
											<div className="details">
												<div className="title">
													Policies
												</div>
												<div className="des">
													A clear, descriptive title
													that helps customers find
													your product
												</div>
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
					<Card
						contentHeight
						title={__('General information', 'multivendorx')}
					>
						<FormGroupWrapper>
							<FormGroup
								label={__('Product name', 'multivendorx')}
								desc={__(
									'A unique name for your product',
									'multivendorx'
								)}
							>
								<BasicInputUI
									name="name"
									value={product.name}
									onChange={(value) =>
										handleChange('name', value)
									}
								/>
							</FormGroup>

							<FormGroup
								label={__(
									'Product short description',
									'multivendorx'
								)}
								desc={__(
									'A short description displayed on product and checkout pages',
									'multivendorx'
								)}
							>
								<TextAreaUI
									name="short_description"
									value={product.short_description}
									onChange={(value) =>
										handleChange('short_description', value)
									}
								/>
							</FormGroup>

							<FormGroup
								label={__(
									'Product description',
									'multivendorx'
								)}
							>
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
								<FormGroup
									cols={2}
									label={__('Regular price', 'multivendorx')}
								>
									<BasicInputUI
										name="regular_price"
										value={product.regular_price}
										onChange={(value) =>
											handleChange('regular_price', value)
										}
									/>
								</FormGroup>
								<FormGroup
									cols={2}
									label={__('Sale price', 'multivendorx')}
								>
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
					{applyFilters(
						'multivendorx_product_after_price_section',
						null,
						product,
						setProduct,
						handleChange,
						modules
					)}

				</Column>

				<Column grid={3}>
					{applyFilters(
						'multivendorx_product_before_image_section',
						null,
						product,
						setProduct,
						handleChange,
						modules,
						starFill,
						setstarFill,
					)}

					{applyFilters(
						'product_category_section',
						null, product, setProduct, selectedCats, setSelectedCats, selectedChild, setSelectedChild, selectedSub, setSelectedSub, selectedCat, setSelectedCat
					)}

					{modules.includes('wpml') && (
						<Card
							title={__('Translations', 'multivendorx')}
							iconName="translate"
							toggle={true}
						>
							<FormGroupWrapper>
								<div className="multivendorx-translation-list">
									{translation
										?.filter((lang) => !lang.is_default)
										.map((lang) => (
											<div
												key={lang.code}
												className="multivendorx-translation-row"
											>
												<div>
													<img
														src={lang.flag_url}
														alt={lang.code}
													/>
													<strong>
														{lang.native_name}
													</strong>
												</div>

												<button
													className="admin-btn btn-small btn-secondary"
													onClick={() =>
														handleTranslationClick(
															lang
														)
													}
												>
													<i className="adminfont-edit" />
												</button>
											</div>
										))}
								</div>
							</FormGroupWrapper>
						</Card>
					)}

					<Card
						contentHeight
						title={__('Upload image', 'multivendorx')}
					>
						<FormGroupWrapper>
							<FormGroup
								label={__('Features Image', 'multivendorx')}
							>
								<FileInputUI
									imageSrc={featuredImage?.thumbnail || ''}
									multiple={false}
									openUploader={__(
										'Select Featured Image',
										'multivendorx'
									)}
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

								{applyFilters(
									'product_image_enhancement',
									null,
									{
										currentImage: featuredImage ?? null,
										isFeaturedImage: true,
										setImage: setFeaturedImage,
									}
								)}
							</FormGroup>

							<FormGroup
								label={__('Product gallery', 'multivendorx')}
							>
								<FileInputUI
									imageSrc={galleryImages.map(
										(img) => img.thumbnail
									)}
									multiple={true}
									openUploader="Add Gallery Image"
									onChange={(val) => {
										if (!val) {
											setGalleryImages([]);
											return;
										}

										const urls = Array.isArray(val)
											? val
											: [val];

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
			</Container>
		</>
	);
};

export default AddProduct;
