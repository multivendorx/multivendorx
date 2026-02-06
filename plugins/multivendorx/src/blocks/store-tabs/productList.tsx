import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Product {
	id: number;
	name: string;
	permalink: string;
	images?: { src: string }[];
}

interface ProductListProps {
	limit?: number;
}

const ProductList: React.FC<ProductListProps> = ({
	limit = 4,
}) => {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {

		const fetchProductList = async () => {
			try {
				const response = await axios.get(
					`${StoreInfo.apiUrl}/wc/v3/products`,
					{
						headers: {
							'X-WP-Nonce': StoreInfo.nonce,
						},
						params: {
							per_page: limit,
							orderby: 'date',
							order: 'desc',
							meta_key: 'multivendorx_store_id',
							store_slug: StoreInfo?.storeDetails.storeSlug,
						},
					}
				);

				setProducts(response.data || []);
			} catch (error) {
				console.error('Error fetching products:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchProductList();
	}, []);

	if (loading) {
		return <p>Loading products...</p>;
	}

	return (
		<div className="woocommerce">
			<ul className="products columns-4">
				{products.map((product) => (
					<li
						key={product.id}
						className="wc-block-product product type-product status-publish instock product-type-simple"
					>
						<div className="wc-block-components-product-image wc-block-grid__product-image">
							<a href={product.permalink}>
								<img
									src={
										product.images?.[0]?.src ||
										'http://localhost:8889/wp-content/uploads/woocommerce-placeholder.webp'
									}
									alt={product.name}
								/>
							</a>
						</div>

						{/* Product Title */}
						<h2 className="has-text-align-center wp-block-post-title has-medium-font-size">
							<a href={product.permalink}>{product.name}</a>
						</h2>

						{/* Price (placeholder) */}
						<div className="has-text-align-center wp-block-woocommerce-product-price">
							<span className="woocommerce-Price-amount amount">
								$299 (pkoro)
							</span>
						</div>

						{/* Add to Cart (placeholder) */}
						<div className="wp-block-button align-center wp-block-woocommerce-product-button">
							<a
								href="#"
								className="wp-block-button__link wp-element-button"
							>
								Add to cart (pkoro)
							</a>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
};

export default ProductList;
