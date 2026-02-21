import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';

interface Product {
	id: number;
	name: string;
	permalink: string;
	images?: { src: string }[];
}

interface ProductListProps {
	limit?: number;
}

const ProductList: React.FC<ProductListProps> = ({ limit = 4 }) => {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');

	useEffect(() => {
		fetchProductList();
	}, [searchTerm]);

	const fetchProductList = async () => {
		setLoading(true);

		try {
			const response = await axios.get(
				`${StoreInfo.apiUrl}/wc/v3/products`,
				{
					headers: {
						'X-WP-Nonce': StoreInfo.nonce,
					},
					params: {
						per_page: limit,
						search: searchTerm || undefined,
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

	return (
		<div className="woocommerce">
			<div style={{ marginBottom: '16px' }}>
				<input
					type="search"
					placeholder={__('Search products...', 'multivendorx')}
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					style={{
						width: '100%',
						padding: '8px',
						border: '1px solid #ccc',
					}}
				/>
			</div>

			{loading ? (
				<p>{__('Loading products...', 'multivendorx')}</p>
			) : (
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
											StoreInfo.placeholderImage ||
											''
										}
										alt={product.name}
									/>
								</a>
							</div>

							<h2 className="has-text-align-center wp-block-post-title has-medium-font-size">
								<a href={product.permalink}>{product.name}</a>
							</h2>

							<div className="has-text-align-center wp-block-woocommerce-product-price">
								<span className="woocommerce-Price-amount amount">
									{__('Price', 'multivendorx')}
								</span>
							</div>

							<div className="wp-block-button align-center wp-block-woocommerce-product-button">
								<a href="#" className="wp-block-button__link wp-element-button">
									{__('Add to cart', 'multivendorx')}
								</a>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default ProductList;