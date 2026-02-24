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

				// Only take id and name
				const allCategories: Category[] = response.data.map(
					(cat: any) => ({
						id: cat.id,
						name: cat.name,
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
		<div className="store-card">
			<h3>{__('Product Categories', 'multivendorx')}</h3>
			<ul className="multivendorx-category-list">
				{categories.map((category) => (
					<li
						key={category.id}
						className="multivendorx-category-item"
					>
						{category.name}
					</li>
				))}
			</ul>
		</div>
	);
};

export default ProductCategory;
