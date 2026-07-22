/* global appLocalizer */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { addFilter, applyFilters } from '@wordpress/hooks';
import { CardComponent, FormGroupComponent, FormGroupWrapperComponent, SectionComponent } from '@zyra/components';
import { TextInput, SelectInput, ToggleInput } from '@zyra/inputs';
import { useModules } from '@zyra/core';
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
			<CardComponent
				title={__('How will this be delivered?', 'multivendorx')}
				className="full-width"
				desc={__(
					'Choose how customers receive this product after purchase.',
					'multivendorx'
				)}
			>
				{/* Dimensions */}
				<FormGroupWrapperComponent>
					<FormGroupComponent className="full-width">
						<ToggleInput
							width="49%"
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
									icon: 'delivery-person'
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
												'Customer receives digital file - e.g. a PDF, software etc.',
												'multivendorx'
											),
											icon: 'download'
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
												'Remote service only. No shipping or downloadable files.',
												'multivendorx'
											),
											icon: 'digital-service'
										},
									]
									: []),
								{
									key: 'others',
									value: 'others',
									label: __('Something else', 'multivendorx'),
									desc: __(
										"Anything that does not fit the above.",
										'multivendorx'
									),
									icon: 'link'
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
					</FormGroupComponent>
					{productType === 'physical' &&
						<>
							<SectionComponent
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
							<FormGroupComponent
								cols={6}
								label={__('Weight (kg)', 'multivendorx')}
								htmlFor="Weight"
							>
								<TextInput
									name="weight"
									value={product.weight}
									onChange={(value) => {
										handleChange('weight', value);
									}}
								/>
							</FormGroupComponent>
							<FormGroupComponent
								cols={6}
								label={__(
									'Shipping classes',
									'multivendorx'
								)}
								htmlFor="shipping-classes"
							>
								<SelectInput
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
							</FormGroupComponent>
							<FormGroupComponent
								cols={4}
								label={`${__('Length', 'multivendorx')} (${appLocalizer.dimension_unit})`}
							>
								<TextInput
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
							</FormGroupComponent>

							<FormGroupComponent
								cols={4}
								label={`${__('Width', 'multivendorx')} (${appLocalizer.dimension_unit})`}
							>
								<TextInput
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
							</FormGroupComponent>

							<FormGroupComponent
								cols={4}
								label={`${__('Height', 'multivendorx')} (${appLocalizer.dimension_unit})`}
							>
								<TextInput
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
							</FormGroupComponent>
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
				</FormGroupWrapperComponent>
			</CardComponent>
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
