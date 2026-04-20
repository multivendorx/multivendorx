/* global appLocalizer */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { addFilter, applyFilters } from '@wordpress/hooks';
import {
	BasicInputUI,
	Card,
	FormGroup,
	FormGroupWrapper,
	SelectInputUI,
	ChoiceToggleUI,
	useModules,
	SectionUI,
} from 'zyra';
import { __ } from '@wordpress/i18n';

const ShippingCard = ({
	product,
	setProduct,
	handleChange,
	productFields,
	typeFields,
}) => {
	const { modules } = useModules();
	const [shippingClasses, setShippingClasses] = useState([]);
	const [productType, setProductType] = useState('physical');

	useEffect(() => {
		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/products/shipping_classes`, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					meta_key: 'multivendorx_store_id',
					meta_value: appLocalizer.store_id,
				},
			})
			.then((res) => {
				const options = res.data.map((cls) => ({
					value: cls.slug,
					label: cls.name,
				}));

				setShippingClasses(options);
			});
	}, []);

	return (
		(
			<Card
				title={__('How will this be delivered?', 'multivendorx')}
				className="full-width"
				desc={__(
					'Choose how customers receive this product after purchase.',
					'multivendorx'
				)}
			>
				{/* Dimensions */}
				<FormGroupWrapper>
					<FormGroup className="full-width">
						<ChoiceToggleUI
							options={[
								{
									key: 'physical',
									value: 'physical',
									label: __(
										'Physical - I pack and post it',
										'multivendorx'
									),
									desc: __(
										'Item is packed and shipped to the customer address.',
										'multivendorx'
									),
								},
								...(typeFields.includes('downloadable')
									? [
											{
												key: 'downloadable',
												value: 'downloadable',
												label: __(
													'Downloadable',
													'multivendorx'
												),
												desc: __(
													'Customer receives a file - e.g. a PDF, software, or digital artwork.',
													'multivendorx'
												),
											},
										]
									: []),
								...(typeFields.includes('virtual')
									? [
											{
												key: 'digital_product_service',
												value: 'digital_product_service',
												label: __(
													'Digital service - Delivered online',
													'multivendorx'
												),
												desc: __(
													'Service provided remotely - like coaching, consulting, or custom design. No shipping or file download involved.',
													'multivendorx'
												),
											},
										]
									: []),
								{
									key: 'others',
									value: 'others',
									label: __('Something else', 'multivendorx'),
									desc: __(
										"Anything that does not involve posting a package or delivering a file, that doesn't fit the above.",
										'multivendorx'
									),
								},
							]}
							custom={true}
							value={productType}
							onChange={(val) => {
								setProductType(val);
								if (val == 'physical') {
									handleChange('virtual', false);
								}
								if (val == 'downloadable') {
									handleChange('downloadable', true);
								}
							}}
						/>
					</FormGroup>
					{productType === 'physical' &&
							<>
								<SectionUI
									title={__(
										'Package dimensions & weight',
										'multivendorx'
									)}
									desc={__(
										'Used to calculate accurate shipping rates at checkout.',
										'multivendorx'
									)}
								/>
								{/* Weight & Shipping class */}
								<FormGroup
									cols={2}
									label={__('Weight (kg)', 'multivendorx')}
									htmlFor="Weight"
								>
									<BasicInputUI
										name="weight"
										value={product.weight}
										onChange={(value) => {
											handleChange('weight', value);
										}}
									/>
								</FormGroup>
								<FormGroup
									cols={2}
									label={__(
										'Shipping classes',
										'multivendorx'
									)}
									htmlFor="shipping-classes"
								>
									<SelectInputUI
										name="shipping_class"
										options={shippingClasses}
										value={product.shipping_class}
										onChange={(value) =>
											handleChange(
												'shipping_class',
												value
											)
										}
									/>
								</FormGroup>
								<FormGroup
									cols={3}
									label={`${__('Length', 'multivendorx')} (${appLocalizer.dimension_unit})`}
								>
									<BasicInputUI
										name="product_length"
										value={product.dimensions?.length || ''}
										placeholder={__(
											'Length',
											'multivendorx'
										)}
										onChange={(value) =>
											handleChange('dimensions', {
												...product.dimensions,
												length: value,
											})
										}
									/>
								</FormGroup>

								<FormGroup
									cols={3}
									label={`${__('Width', 'multivendorx')} (${appLocalizer.dimension_unit})`}
								>
									<BasicInputUI
										name="product_width"
										value={product.dimensions?.width}
										placeholder={__(
											'Width',
											'multivendorx'
										)}
										onChange={(value) =>
											handleChange('dimensions', {
												...product.dimensions,
												width: value,
											})
										}
									/>
								</FormGroup>

								<FormGroup
									cols={3}
									label={`${__('Height', 'multivendorx')} (${appLocalizer.dimension_unit})`}
								>
									<BasicInputUI
										name="product_height"
										value={product.dimensions?.height}
										placeholder={__(
											'Height',
											'multivendorx'
										)}
										onChange={(value) =>
											handleChange('dimensions', {
												...product.dimensions,
												height: value,
											})
										}
									/>
								</FormGroup>
								{applyFilters(
									'multivendorx_product_shipping_meta',
									null,
									product,
									modules
								)}
							</>
						}
					{productType === 'downloadable' &&
						applyFilters(
							'product_downloadable',
							null,
							product,
							setProduct,
							handleChange
						)}
				</FormGroupWrapper>
			</Card>
		)
	);
};

addFilter(
	'multivendorx_add_product_middle_section',
	'multivendorx/shipping',
	(content, product, setProduct, handleChange, productFields, typeFields) => {
		return (
			<>
				{content}
				<ShippingCard
					product={product}
					setProduct={setProduct}
					handleChange={handleChange}
					productFields={productFields}
					typeFields={typeFields}
				/>
			</>
		);
	},
	20
);
