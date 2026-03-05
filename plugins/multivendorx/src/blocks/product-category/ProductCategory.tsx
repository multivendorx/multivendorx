import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';

interface Category {
	id: number;
	name: string;
}

const ProductCategory: React.FC<{}> = () => {
	const [categories, setCategories] = useState<Category[]>([]);

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const response = await axios.get(
					`${StoreInfo.apiUrl}/wc/v3/products/categories`,
					{
						headers: { 'X-WP-Nonce': StoreInfo.nonce },
					}
				);

				const allCategories: Category[] = response.data.map(
					(cat: any) => ({
						id: cat.id,
						name: cat.name,
						slug: cat.slug,
						count: cat.count,
					})
				);

				setCategories(allCategories);
			} catch (err) {
				console.error('Failed to fetch categories', err);
			}
		};

		fetchCategories();
	}, []);

	return (
		<>
		<h3>{__('Product Categories', 'multivendorx')}</h3>
		<ul className="wc-block-product-categories-list">
			{categories.map((category) => (
				<li
					key={category.id}
					className="wc-block-product-categories-list-item"
				>
					<a
						href={`/product-category/${category.slug}`}
					>
						<span className="wc-block-product-categories-list-item__name">
							{category.name}
						</span>
					</a>

					<span className="wc-block-product-categories-list-item-count">
						({category.count})
					</span>
				</li>
			))}
		</ul>
		</>
	);
};

export default ProductCategory;
