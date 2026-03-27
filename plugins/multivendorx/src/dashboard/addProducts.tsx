/* global appLocalizer */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
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
	PopupUI,
	ButtonInputUI,
	SectionUI,
	Notice,
} from 'zyra';
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { dashNavigate } from '@/services/commonFunction';

const AddProduct = () => {
	const { modules } = useModules();
	const navigate = useNavigate();
	const { context_id } = useParams();
	const productId = context_id;

	const [product, setProduct] = useState({});
	const [translation, setTranslation] = useState([]);
	const [featuredImage, setFeaturedImage] = useState(null);
	const [galleryImages, setGalleryImages] = useState([]);
	const [errorMsg, setErrorMsg] = useState('');
	const [generateAi, setgenerateAi] = useState(false);
	const [generatedAi, setgeneratedAi] = useState(false);
	const [generateAiImage, setgenerateAiImage] = useState(false);
	const [appeal, setAppeal] = useState(false);

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

	const defaultTypeOptions = [{ label: 'Simple Product', value: 'simple' }];

	const typeOptions = applyFilters(
		'multivendorx_product_type_options',
		defaultTypeOptions
	);

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

		const validation = applyFilters(
			'multivendorx_product_create_limit',
			{ allowed: true, message: '' },
			product
		);

		if (!validation.allowed) {
			setErrorMsg(validation.message);
			return;
		}

		const payload = {
			...product,
			images: imagePayload,
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
			.post(
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
			dashNavigate(navigate, [
				'products',
				'edit',
				String(lang.translated_product_id),
			]);
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
				dashNavigate(navigate, [
					'products',
					'edit',
					String(res.data?.product_id),
				]);
			}
		});
	};

	const checklistValues = Object.values(checklist);
	const completedCount = checklistValues.filter(Boolean).length;
	const totalCount = checklistValues.length;

	const productFields =
		appLocalizer.settings_databases_value?.['product-preferencess']
			?.products_fields || [];
	const typeFields =
		appLocalizer.settings_databases_value?.['product-preferencess']
			?.type_options || [];

	const handleCloseForm = () => {
		setgenerateAi(false);
	};

	const generatedAiClose = () => {
		setgeneratedAi(false);
	};

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
			{errorMsg &&
				<Notice type="error" validity="lifetime" displayPosition="notice" message={errorMsg} />
			}
			<NavigatorHeader
				headerTitle={__('Add Product', 'multivendorx')}
				headerDescription={__(
					'Enter your product details - name, price, stock, and image & publish.',
					'multivendorx'
				)}
				buttons={[
					{
						label: __('Generate with AI', 'multivendorx'),
						icon: 'star-notifima',
						color: ' ',
						onClick: () => setgenerateAi(true),
					},
					{
						label: __('Save', 'multivendorx'),
						icon: 'save',
						onClick: () => createProduct(),
					},
				]}
			/>

			<PopupUI
				open={generateAi}
				onClose={handleCloseForm}
				position="lightbox"
				width={33}
				header={{
					icon: 'star-notifima',
					title: __('Create With AI', 'multivendorx'),
				}}
			>
				<div className="ai-wrapper">
					<FormGroupWrapper>
						<FormGroup>
							<TextAreaUI
								name="reject_reason"
								placeholder={__(
									'Enter reason for rejecting this store...',
									'multivendorx'
								)}
								rows={5}
							/>
						</FormGroup>
						<ButtonInputUI
							buttons={[
								{
									icon: 'star-notifima',
									text: 'Generate Now',
									color: 'purple',
									onClick: () => {
										setgenerateAi(false);
										setTimeout(() => {
											setgeneratedAi(true);
										}, 0);
									},
								},
							]}
						/>
					</FormGroupWrapper>
				</div>
			</PopupUI>

			{/* 2nd screen */}
			<PopupUI
				open={generatedAi}
				onClose={generatedAiClose}
				position="lightbox"
				width={'70%'}
				height={80}
			>
				<div className="ai-content-wrapper">
					<div className="section left">
						<div className="product">Product 1</div>
						{/* <img src="" alt="" /> */}
						<div className="product-image"></div>
						<SectionUI
							title={__('Product Details', 'multivendorx')}
						/>

						<div className="title">Short Description</div>
						<div className="desc">
							Lorem ipsum dolor sit amet consectetur adipisicing
							elit. Quae natus voluptatem temporibus facere
							dignissimos optio sit, vero harum nobis suscipit ea
							ipsa repellendus, commodi architecto?
						</div>

						<div className="title">Description</div>
						<div className="desc">
							Lorem ipsum dolor, sit amet consectetur adipisicing
							elit. Ipsa ipsam atque accusantium voluptatibus.
							Quasi maiores officiis ipsa? Nulla doloribus quae
							iusto est perspiciatis cumque sequi maiores
							voluptates dolor possimus, voluptate fugiat sed
							corrupti nihil cum distinctio suscipit voluptas
							placeat. Harum incidunt assumenda cum, perferendis
							facilis accusantium sapiente iusto cupiditate
							quidem?{' '}
						</div>
					</div>
					<div className="section right">
						<div className="generated-product">
							<div className="product">
								<div className="title">
									Lorem ipsum dolor sit amet.
								</div>
								<div className="desc">
									Lorem ipsum dolor sit amet consectetur
									adipisicing elit. Dolor, perferendis. Rerum
									explicabo ducimus, praesentium a excepturi
									ut! Aliquam quidem exercitationem ipsum!
									Placeat, molestias? Ea, animi.
								</div>

								<ButtonInputUI
									buttons={[
										{
											icon: 'plus-circle',
											text: 'Append the product',
											color: 'purple',
										},
									]}
								/>
							</div>
							<div className="product">
								<div className="title">
									Lorem ipsum dolor sit amet.
								</div>
								<div className="desc">
									Lorem ipsum dolor sit amet consectetur
									adipisicing elit. Dolor, perferendis. Rerum
									explicabo ducimus, praesentium a excepturi
									ut! Aliquam quidem exercitationem ipsum!
									Placeat, molestias? Ea, animi.
								</div>

								<ButtonInputUI
									buttons={[
										{
											icon: 'refresh',
											text: 'Regenerate Product',
											color: 'blue',
										},
										{
											icon: 'plus-circle',
											text: 'Append the product',
											color: 'purple',
										},
									]}
								/>
							</div>
						</div>

						<ButtonInputUI
							buttons={[
								{
									icon: 'close',
									text: 'Cancel',
									color: 'red',
									// onClick: () =>
									//     dispatch( {
									//         type: 'SET_ACTIVE_TAB',
									//         id: isOpen ? null : method.id,
									//     } ),
								},
								{
									icon: 'plus-circle',
									text: 'Append the product',
									color: 'purple-bg',
									// onClick: () =>
									//     dispatch( {
									//         type: 'SET_ACTIVE_TAB',
									//         id: isOpen ? null : method.id,
									//     } ),
								},
							]}
						/>
					</div>
				</div>
			</PopupUI>

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
									onChange={(selected) => {
										handleChange('type', selected);
									}}
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
					<Card title={__('Product Rejected by Admin', 'multivendorx')}
						action={<ButtonInputUI
							buttons={[
								{
									icon: 'plus',
									text: __('Appeal Decision', 'multivendorx'),
									color: 'purple',
									onClick: ()=> setAppeal(true),
								},
							]}
						/>}
					>
						<Notice
							type="error"
							title="Admin Note"
							displayPosition="inline-notice"
							message={__('"This product listing does not meet our marketplace guidelines. Please provide a detailed description that includes materials, sizing, and care instructions. Also ensure your product images have a clean background and show the product from at least 2 angles."', 'multivendorx')}
						/>
					</Card>
					<Card title={__('General information', 'multivendorx')}>
						<FormGroupWrapper>
							<FormGroup
								label={__('Product name', 'multivendorx')}
								desc={__(
									'A unique name for your product',
									'multivendorx'
								)}
								className="ai-form"
								iconRight="star-notifima"
							>
								<PopupUI
									position="menu-dropdown"
									toggleIcon="star-notifima"
									width={20}
									header={{
										icon: 'form-textarea',
										title: __(
											'Change Name',
											'multivendorx'
										),
									}}
								>
									<div className="ai-wrapper">
										<div className="title">Product 1</div>
										<div className="title">Product 2</div>
										<div className="title">Product 3</div>
									</div>
								</PopupUI>
								<BasicInputUI
									name="name"
									value={product.name}
									onChange={(value) =>
										handleChange('name', value)
									}
								/>
							</FormGroup>

							{productFields.includes('general') && (
								<>
									<FormGroup
										label={__(
											'Product short description',
											'multivendorx'
										)}
										desc={__(
											'A short description displayed on product and checkout pages',
											'multivendorx'
										)}
										className="ai-form"
										iconRight="star-notifima"
									>
										<TextAreaUI
											name="short_description"
											value={product.short_description}
											onChange={(value) =>
												handleChange(
													'short_description',
													value
												)
											}
										/>
									</FormGroup>

									<FormGroup
										label={__(
											'Product description',
											'multivendorx'
										)}
										className="ai-form"
										iconRight="star-notifima"
									>
										<TextAreaUI
											name="description"
											value={product.description}
											onChange={(value) =>
												handleChange(
													'description',
													value
												)
											}
										/>
									</FormGroup>
								</>
							)}
						</FormGroupWrapper>
					</Card>
					<PopupUI
						open={appeal}
						onClose= {() => {setAppeal(false)}}
						width={31.25}
						header={{
							icon: 'announcement',
							title: __('Appeal Rejection Decision', 'multivendorx'),
							description: __(
								'Explain why you believe this product meets marketplace guidelines. Our team will review your appeal within 48 hours.',
								'multivendorx'
							),
						}}
						footer={
							<ButtonInputUI
								buttons={[
									{
										icon: 'close',
										text: __('Cancel', 'multivendorx'),
										color: 'red',
										onClick: () => setAppeal(false),
									},
									{
										icon: 'save',
										text: __('Submit Appeal', 'multivendorx'),
										// onClick: () => handleSubmit(),
									},
								]}
							/>
						}
					>
						<FormGroupWrapper>
							<FormGroup
								label={__('Your appeal message', 'multivendorx')}
								htmlFor="title"
							>
								<TextAreaUI
									name="content"
								/>
							</FormGroup>
						</FormGroupWrapper>
					</PopupUI>
					{product?.type === 'simple' &&
						productFields.includes('general') && (
							<Card title={__('Price', 'multivendorx')}>
								<FormGroupWrapper>
									<FormGroup
										cols={2}
										label={__(
											'Regular price',
											'multivendorx'
										)}
									>
										<BasicInputUI
											name="regular_price"
											value={product.regular_price}
											onChange={(value) =>
												handleChange(
													'regular_price',
													value
												)
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
												handleChange(
													'sale_price',
													value
												)
											}
										/>
									</FormGroup>
								</FormGroupWrapper>
							</Card>
						)}
					{applyFilters(
						'multivendorx_add_product_middle_section',
						null,
						product,
						setProduct,
						handleChange,
						productFields,
						typeFields,
						modules
					)}
				</Column>
				<Column grid={3}>
					{applyFilters(
						'multivendorx_add_product_right_section',
						null,
						product,
						setProduct,
						handleChange,
						productFields,
						setErrorMsg
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

					<Card title={__('Upload image', 'multivendorx')}>
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

								<ButtonInputUI
									buttons={[
										{
											icon: 'star-notifima',
											text: 'Generate Now',
											color: 'purple',
											onClick: () => {
												setgenerateAiImage(true);
											},
										},
									]}
								/>

								{/* image generate popup */}
								<PopupUI
									open={generateAiImage}
									onClose={generatedAiClose}
									position="lightbox"
									width={'70%'}
									height={80}
								>
									<div className="ai-content-wrapper image">
										{/* single image  */}
										{/* <div className="section left left1">
											<div className="image"></div>
										</div> */}

										{/* multi image  */}
										<div className="section left left2">
											<div className="image"></div>
											<div className="image"></div>
											<div className="image"></div>
											<div className="image"></div>
										</div>
										<div className="section right">
											<FormGroupWrapper>
												<FormGroup
													label={__(
														'Describe your image',
														'multivendorx'
													)}
												>
													<TextAreaUI
														name="reject_reason"
														placeholder={__(
															'Enter reason for rejecting this store...',
															'multivendorx'
														)}
														rows={5}
													/>
												</FormGroup>
											</FormGroupWrapper>
											<ButtonInputUI
												buttons={[
													{
														icon: 'close',
														text: 'Cancel',
														color: 'red',
														// onClick: () =>
														//     dispatch( {
														//         type: 'SET_ACTIVE_TAB',
														//         id: isOpen ? null : method.id,
														//     } ),
													},
													{
														icon: 'plus-circle',
														text: 'Append the product',
														color: 'purple-bg',
														// onClick: () =>
														//     dispatch( {
														//         type: 'SET_ACTIVE_TAB',
														//         id: isOpen ? null : method.id,
														//     } ),
													},
												]}
											/>
										</div>
									</div>
								</PopupUI>
							</FormGroup>
						</FormGroupWrapper>
					</Card>
				</Column>
			</Container>
		</>
	);
};

export default AddProduct;
