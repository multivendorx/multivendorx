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
				<div className="woocommerce">
					<h3>{__('Product By Rating', 'multivendorx')}</h3>

					<ul className="product_list_widget">
						{products.length > 0 ? (
							products.map((product) => (
								<li key={product.id}>
									<a href={product.permalink}>
										<img
											className="attachment-woocommerce_thumbnail size-woocommerce_thumbnail"
											src={
												product.images?.[0]?.src ||
												placeholderImage // Changed this line (line 15)
											}
											alt={product.name}
										/>

										<span className="product-title">{product.name}</span>
									</a>

									<span className="woocommerce-Price-amount amount">
										<bdi>
											{product.salePrice ? (
												<>
													<del aria-hidden="true">
														<span class="woocommerce-Price-amount amount">
															<bdi>
																{product.price}
															</bdi>
														</span>
													</del>
													<ins aria-hidden="true">
														<span class="woocommerce-Price-amount amount">
															<bdi>
																{product.salePrice}
															</bdi>
														</span>
													</ins>
												</>
											) : (
												<span class="woocommerce-Price-amount amount">
													<bdi>
														{product.price}
													</bdi>
												</span>
											)}
										</bdi>
									</span>
								</li>
							))
						) : (
							<p>{__('No products found.', 'multivendorx')}</p>
						)}
					</ul>
				</div>
			)}
		</>
	);
};

export default ProductList;
