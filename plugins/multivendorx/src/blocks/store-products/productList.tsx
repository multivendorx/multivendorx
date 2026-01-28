import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Product {
	id: number;
	name: string;
	permalink: string;
	images?: { src: string }[];
}

interface ProductListProps {
	storeSlug: string;
	limit?: number;
}

const ProductList: React.FC<ProductListProps> = ({
	storeSlug = '',
	limit = 4,
}) => {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchProductList = async () => {
			try {
				const response = await axios.get(
					`${storeShopProductList.apiUrl}/wc/v3/products`,
					{
						headers: {
							'X-WP-Nonce': storeShopProductList.nonce,
						},
						params: {
							per_page: limit,
							orderby: 'date',
							order: 'desc',
							meta_key: 'multivendorx_store_id',
							store_slug : storeSlug,
						},
					}
				);

				setProducts(response.data || []);
			} catch (error) {
				console.error('Error fetching latest products:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchProductList();
	}, [limit]);

	if (loading) {
		return <p>Loading products...</p>;
	}
	return (
		<div className="latest-products-grid">
			{products.map((product) => (
				<a
					key={product.id}
					href={product.permalink}
					className="product-card"
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
	);
};

export default ProductList;
