import { addFilter } from '@wordpress/hooks';
import { CardComponent, FormGroupWrapperComponent } from '@zyra/components';
import { SelectInput } from '@zyra/inputs';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import axios from 'axios';

const ProductTag = ({ product, setProduct }) => {
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

	return (
		<CardComponent title={__('Product tag', 'multivendorx')}>
			<FormGroupWrapperComponent>
				<SelectInput
					type="creatable-multi"
					options={existingTags.map((tag) => ({
						value: tag.name,
						label: tag.name,
					}))}
					size="100%"
					value={product.tags?.map((tag) => tag.name) || []}
					onChange={(list) => {
						const updatedTags = (list as string[]).map((name) => {
							const existing = existingTags.find(
								(tag) => tag.name === name
							);
							return existing ? existing : { name };
						});

						setProduct((prev) => ({
							...prev,
							tags: updatedTags,
						}));
					}}
					placeholder={__('Type tag…', 'multivendorx')}
					formatCreateLabel={(val) => `Add "${val}"`}
				/>
			</FormGroupWrapperComponent>
		</CardComponent>
	);
};

addFilter(
	'multivendorx_add_product_right_section',
	'multivendorx/product_tag',
	(content, product, setProduct, handleChange, productFields) => {
		return (
			<>
				{content}
				{productFields.includes('product_tag') && (
					<ProductTag product={product} setProduct={setProduct} />
				)}
			</>
		);
	},
	40
);
