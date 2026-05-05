/* global StoreInfo */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';

interface Category {
	id: number;
	name: string;
	slug: string;
	parent: number;
	count: number;
	children?: Category[];
}

const ProductCategory: React.FC = () => {
	const [categories, setCategories] = useState<Category[]>([]);

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const response = await axios.get(`${StoreInfo.apiUrl}/wc/v3/products/categories`, {
					headers: { 'X-WP-Nonce': StoreInfo.nonce },
				});

				const tree = buildCategoryTree(response.data);
				setCategories(tree);
			} catch (err) {
				if (axios.isAxiosError(err)) {
					console.error('Failed to fetch categories', {
						endpoint,
						status: err.response?.status,
						statusText: err.response?.statusText,
						message: err.message,
						responseData: err.response?.data,
					});
				} else {
					console.error('Failed to fetch categories', {
						endpoint,
						error: err,
					});
				}
			}
		};

		fetchCategories();
	}, []);

	const buildCategoryTree = (categories: Category[]): Category[] => {
		const map: Record<number, Category> = {};
		const roots: Category[] = [];

		// Initialize map
		categories.forEach((cat) => {
			map[cat.id] = { ...cat, children: [] };
		});

		// Build hierarchy
		categories.forEach((cat) => {
			if (cat.parent === 0) {
				roots.push(map[cat.id]);
			} else if (map[cat.parent]) {
				map[cat.parent].children?.push(map[cat.id]);
			}
		});

		return roots;
	};

	const renderCategory = (category: Category) => {
		return (
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

				{category.children && category.children.length > 0 && (
					<ul className="wc-block-product-categories-list">
						{category.children.map((child) =>
							renderCategory(child)
						)}
					</ul>
				)}
			</li>
		);
	};

	return (
		<>
			<h3>{__('Product Categories', 'multivendorx')}</h3>

			<ul className="wc-block-product-categories-list">
				{categories.map((cat) => renderCategory(cat))}
			</ul>
		</>
	);
};

export default ProductCategory;
