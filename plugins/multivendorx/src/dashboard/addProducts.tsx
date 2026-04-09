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
			status: appLocalizer.current_user?.allcaps?.publish_products ? 'publish' : 'draft',
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
      			{ key: '_is_auto_draft', value: false }
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

	const rejectNote = product?.meta_data?.find(
		(m) => m.key === '_reject_note'
	)?.value;

	const isAutoDraft = product?.meta_data?.some(
		(m) => m.key === '_is_auto_draft' && m.value === '1'
		);

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
			{errorMsg && (
				<Notice
					type="error"
					validity="lifetime"
					displayPosition="notice"
					message={errorMsg}
				/>
			)}
			<NavigatorHeader
				headerTitle={__('Add Product', 'multivendorx')}
				headerDescription={__(
					'Enter your product details - name, price, stock, and image & publish.',
					'multivendorx'
				)}
				buttons={applyFilters('multivendorx_product_button', [
					{
						label: __('View', 'multivendorx'),
						icon: 'eye',
						color: 'yellow',
						onClick: () =>
							window.open(product?.permalink, '_blank'),
					},
					{
						label: __('Save', 'multivendorx'),
						icon: 'save',
						onClick: () => createProduct(),
					},
				])}
			/>
			<Container>
				<Column grid={3}>
					<Card title={__('What kind of product is this?', 'multivendorx')} desc={__('Choose the type that best describes what you are selling.', 'multivendorx')}>
						<FormGroupWrapper>
							<FormGroup>
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
					</Card>
				</Column>

				<Column grid={6}>
					{rejectNote && (
						<Card
							title={__(
								'Product Rejected by Admin',
								'multivendorx'
							)}
							// action={
							// <ButtonInputUI
							// 	buttons={[
							// 		{
							// 			icon: 'plus',
							// 			text: __('Appeal Decision', 'multivendorx'),
							// 			color: 'purple',
							// 			onClick: () => setAppeal(true),
							// 		},
							// 	]}
							// />}
						>
							<Notice
								type="error"
								title="Admin Note"
								displayPosition="inline-notice"
								message={rejectNote}
							/>
						</Card>
					)}
					<Card title={__('General information', 'multivendorx')} desc={__("Help customers understand what you're selling.", 'multivendorx')}>
						<FormGroupWrapper>
							<div className="form-group  ai-form">
								<label className="settings-form-label">
									{__('Product name', 'multivendorx')}
									{applyFilters(
										'multivendorx_product_field_suggestions',
										null,
										{
											product,
											setProduct,
											field: 'name',
										}
									)}
								</label>

								<div className="settings-input-content">
									<BasicInputUI
										name="name"
										value={product.name}
										onChange={(value) =>
											handleChange('name', value)
										}
										disabled={modules.includes(
											'shared-listing'
										) && !isAutoDraft}
									/>
									<div className="settings-metabox-description">
										{__(
											'This appears on your store listing and checkout page.',
											'multivendorx'
										)}
									</div>
								</div>
							</div>

							{productFields.includes('general') && (
								<>
									<div className="form-group  ai-form">
										<label className="settings-form-label">
											{__(
												'Short description',
												'multivendorx'
											)}
											{applyFilters(
												'multivendorx_product_field_suggestions',
												null,
												{
													product,
													setProduct,
													field: 'short_description',
												}
											)}
										</label>

										<div className="settings-input-content">
											<TextAreaUI
												name="short_description"
												value={
													product.short_description
												}
												onChange={(value) =>
													handleChange(
														'short_description',
														value
													)
												}
											/>
											<div className="settings-metabox-description">
												{__(
													'Customers see this before clicking into the full product page.',
													'multivendorx'
												)}
											</div>
										</div>
									</div>

									<div className="form-group  ai-form">
										<label className="settings-form-label">
											{__(
												'Full description',
												'multivendorx'
											)}
											{applyFilters(
												'multivendorx_product_field_suggestions',
												null,
												{
													product,
													setProduct,
													field: 'description',
												}
											)}
										</label>

										<div className="settings-input-content">
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
											<div className="settings-metabox-description">
												{__(
													'More detail helps customers feel confident buying.',
													'multivendorx'
												)}
											</div>
										</div>
									</div>
								</>
							)}
						</FormGroupWrapper>
					</Card>
					<PopupUI
						open={appeal}
						onClose={() => {
							setAppeal(false);
						}}
						width={31.25}
						header={{
							icon: 'announcement',
							title: __(
								'Appeal Rejection Decision',
								'multivendorx'
							),
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
										text: __(
											'Submit Appeal',
											'multivendorx'
										),
										// onClick: () => handleSubmit(),
									},
								]}
							/>
						}
					>
						<FormGroupWrapper>
							<FormGroup
								label={__(
									'Your appeal message',
									'multivendorx'
								)}
								htmlFor="title"
							>
								<TextAreaUI name="content" />
							</FormGroup>
						</FormGroupWrapper>
					</PopupUI>
					{product?.type === 'simple' &&
						productFields.includes('general') && (
							<Card title={__('Pricing', 'multivendorx')} desc={__('Set what customers will pay. Add a sale price to show a discount.', 'multivendorx')}>
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
						modules,
						setFeaturedImage
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
										const [file] = Array.isArray(val)
											? val
											: [val];
										const url = file?.url || '';
										if (!val) {
											setFeaturedImage(null);
											return;
										}
										setFeaturedImage({
											id: file?.id, // wp.media id not available from current FileInput
											src: url,
											thumbnail: url,
										});
									}}
								/>
							</FormGroup>
							{applyFilters('product_image_enhancement', null, {
								currentImage: featuredImage ?? null,
								isFeaturedImage: true,
								setImage: setFeaturedImage,
								product: product,
							})}
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

										const formatted = urls.map((file) => ({
											id: file?.id,
											src: file?.url,
											thumbnail: file?.url,
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
