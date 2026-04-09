/* global StoreInfo */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';

interface Category {
	id: number;
	name: string;
}

const ProductCategory: React.FC<object> = () => {
	const [categories, setCategories] = useState<Category[]>([]);

	useEffect(() => {
		const fetchCategories = () => {
			axios
				.get(`${StoreInfo.apiUrl}/wc/v3/products/categories`, {
					headers: { 'X-WP-Nonce': StoreInfo.nonce },
				})
				.then((response) => {
					setCategories(response.data);
				})
				.catch((err) => {
					console.error('Failed to fetch categories', err);
				});
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
							href={`${StoreInfo.site_url}/product-category/${category.slug}`}
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
