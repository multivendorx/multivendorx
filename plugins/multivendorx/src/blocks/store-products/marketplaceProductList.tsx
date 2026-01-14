import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { store } from '@wordpress/blocks';

interface Product {
	id: number;
	name: string;
	images?: { src: string }[];
}

interface MarketplaceProductListProps {
	columns?: number;
	perPage?: number;
	orderby?: string;
	order?: 'asc' | 'desc';
	category?: string; // comma-separated slugs
	operator?: string;
	product_visibility?: string;
	store_id?: string;
	store_slug?: string,
}

const MarketplaceProductList: React.FC<MarketplaceProductListProps> = ({
	columns = 4,
	perPage = 12,
	orderby = 'title',
	order = 'asc',
	category = '',
	operator = 'IN',
	product_visibility = '',
	store_id = '',
	store_slug = '',
}) => {
	const [products, setProducts] = useState<Product[]>([]);
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);

	const totalPages = Math.ceil(total / perPage);

	const fetchProducts = useCallback(async () => {
		try {
			const response = await axios.get(
				`${productList.apiUrl}/wc/v3/products`,
				{
					headers: { 'X-WP-Nonce': productList.nonce },
					params: {
						per_page: perPage,
						page,
						orderby,
						order,
						cat: category,
						operator,
						product_visibility,
						meta_key: 'multivendorx_store_id',
						value: store_id,
						store_slug
					},
				}
			);

			setProducts(response.data || []);
			setTotal(Number(response.headers['x-wp-total']) || 0);
		} catch (error) {
			console.error('Error fetching products:', error);
		}
	}, [page, perPage, orderby, order, category]);

	useEffect(() => {
		fetchProducts();
	}, [fetchProducts]);

	return (
		<>
			<div
			>
				{products.map((product) => (
					<a
						key={product.id}
						href={product.permalink || '#'}
						className="product-card"
						target="_blank"
						rel="noopener noreferrer"
					>
						{product.images?.[0]?.src && (
							<img
								src={product.images[0].src}
								alt={product.name}
							/>
						)}
						<h3>{product.name}</h3>
					</a>
				))}
			</div>


			<div >
				<button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
					Previous
				</button>

				<span>
					Page {page} of {totalPages}
				</span>

				<button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
					Next
				</button>
			</div>
		</>
	);
};

export default MarketplaceProductList;
