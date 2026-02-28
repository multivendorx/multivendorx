import { addFilter } from '@wordpress/hooks';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
	InputWithSuggestions,
	Card,
	FormGroupWrapper,
} from 'zyra';
import { __ } from '@wordpress/i18n';

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
		<Card
			contentHeight
			title={__('Product tag', 'multivendorx')}
		>
			{/* <FormGroupWrapper>
				<InputWithSuggestions
					suggestions={existingTags.map(
						(tag) => tag.name
					)}
					value={
						product.tags?.map((tag) => tag.name) || []
					}
					onChange={(list) => {
						const updatedTags = list.map((name) => {
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
					addButtonLabel={__('Add', 'multivendorx')}
				/>
			</FormGroupWrapper> */}
		</Card>
	);
};

addFilter(
	'multivendorx_product_before_image_section',
	'multivendorx/product_tag',
	(content, product, setProduct) => {
		return (
			<>
				{content}
				<ProductTag product={product} setProduct={setProduct} />
			</>
		);
	},
	10
);
