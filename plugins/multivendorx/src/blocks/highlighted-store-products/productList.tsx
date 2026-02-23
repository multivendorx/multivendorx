import axios from 'axios';
import { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';

interface Product {
	id: number;
	name: string;
	permalink: string;
	images?: { src: string }[];
}

interface ProductListProps {
	isEditor: boolean;
	limit?: number;
	productType?: 'rating' | 'recent' | 'on_sale';
}

const ProductList: React.FC<ProductListProps> = ({
	isEditor = false,
	limit = 4,
	productType = 'recent',
}) => {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (isEditor) {
			// Editor mode: show static dummy products
			setProducts([
				{ id: 1, name: 'Sample Product 1', permalink: '#', images: [] },
				{ id: 2, name: 'Sample Product 2', permalink: '#', images: [] },
				{ id: 3, name: 'Sample Product 3', permalink: '#', images: [] },
				{ id: 4, name: 'Sample Product 4', permalink: '#', images: [] },
			]);
			setLoading(false);
			return;
		}

		const fetchProductList = async () => {
			try {
				const params: any = {
					per_page: limit,
					meta_key: 'multivendorx_store_id',
					value: StoreInfo.storeDetails.storeId,
				};

				// Adjust API params based on productType
				if (productType === 'rating') {
					params.orderby = 'rating';
					params.order = 'desc';
				} else if (productType === 'recent') {
					params.orderby = 'date';
					params.order = 'desc';
				} else if (productType === 'on_sale') {
					params.on_sale = true;
				}

				const response = await axios.get(
					`${StoreInfo.apiUrl}/wc/v3/products`,
					{
						headers: { 'X-WP-Nonce': StoreInfo.nonce },
						params,
					}
				);

				// Ensure response is an array
				const data = Array.isArray(response.data) ? response.data : [];
				setProducts(data);
			} catch (error) {
				console.error('Error fetching products:', error);
				setProducts([]);
			} finally {
				setLoading(false);
			}
		};

		fetchProductList();
	}, [productType, limit, isEditor]);

	// Render products using the WooCommerce ul/li design
	return (
		<>
			{loading ? (
				<p>{__('Loading products...', 'multivendorx')}</p>
			) : (
				<div className="top-products-inner">
					<h3>{__('Product By Rating', 'multivendorx')}</h3>
					{products.length > 0 ? (
						products.map((product) => (
							<div className="product-item" key={product.id}>
								<a href={product.permalink} className="product-card">
									<div className="product-image">
										<div className="image-placeholder">
											<img
												src={
													product.images?.[0]?.src ||
													placeholderImage // Changed this line (line 15)
												}
												alt={product.name}
											/>
										</div>
									</div>

									<div className="product-content">
										<h3 className="product-title">
											{product.name}
										</h3>

										<div className="product-price">
											{product.salePrice ? (
												<>
													<del className="regular-price">
														{product.price}
													</del>

													<div className="sale-price">
														{product.salePrice}
													</div>
												</>
											) : (
												<span className="regular-price">
													{product.price}
												</span>
											)}
										</div>
									</div>
								</a>
							</div>
						))
					) : (
						<p>{__('No products found.', 'multivendorx')}</p>
					)}
				</div>
			)}
		</>
	);
};

export default ProductList;
