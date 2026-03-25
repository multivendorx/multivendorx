/* global productList */
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';

interface Product {
	id: number;
	name: string;
	permalink?: string;
	images?: { src: string }[];
}

interface MarketplaceProductListProps {
	perPage?: number;
	orderby?: string;
	order?: 'asc' | 'desc';
	category?: string;
	operator?: string;
	product_visibility?: string;
	store_id?: string;
	storeId?: string|number;
}

const MarketplaceProductList: React.FC<MarketplaceProductListProps> = ({
	perPage = 5,
	orderby = 'title',
	order = 'asc',
	category = '',
	operator = 'IN',
	product_visibility = '',
	storeId,
}) => {
	const [products, setProducts] = useState<Product[]>([]);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setPage(1);
	}, [perPage, orderby, order, category, product_visibility]);

	const fetchProducts = useCallback(async () => {
		setLoading(true);
		const params = {
			per_page: perPage,
			page,
			orderby,
			order,
			cat: category,
			operator,
			product_visibility,
			meta_key: 'multivendorx_store_id',
		};

		if (storeId) {
			params.value = storeId;
		}

		if (productList?.storeDetails?.storeId) {
			params.value = productList.storeDetails.storeId;
		}

		try {
			const response = await axios.get(
				`${productList.apiUrl}/wc/v3/products`,
				{
					headers: { 'X-WP-Nonce': productList.nonce },
					params,
				}
			);

			setProducts(response.data || []);
			setLoading(false);
		} catch (error) {
			console.error('Error fetching products:', error);
			setLoading(false);
		}
	}, [page, perPage, orderby, order, category, operator, product_visibility]);

	useEffect(() => {
		fetchProducts();
	}, [fetchProducts]);

	return (
		<>
			{loading ? (
				<p>{__('Loading products...', 'multivendorx')}</p>
			) : (
				<>
					<h3>{__('Products', 'multivendorx')}</h3>
					<div className="woocommerce">
						<ul className="product_list_widget">
							{products.length > 0 ? (
								products.map((product) => (
									<li key={product.id}>
										<a href={product.permalink}>
											<img
												className="attachment-woocommerce_thumbnail size-woocommerce_thumbnail"
												src={product.images?.[0]?.src}
												alt={product.name}
											/>

											<span className="product-title">
												{product.name}
											</span>
										</a>

										<span className="woocommerce-Price-amount amount">
											<bdi>
												{product.salePrice ? (
													<>
														<del aria-hidden="true">
															<span className="woocommerce-Price-amount amount">
																<bdi>
																	{
																		product.price
																	}
																</bdi>
															</span>
														</del>
														<ins aria-hidden="true">
															<span className="woocommerce-Price-amount amount">
																<bdi>
																	{
																		product.salePrice
																	}
																</bdi>
															</span>
														</ins>
													</>
												) : (
													<span className="woocommerce-Price-amount amount">
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
								<p>
									{__('No products found.', 'multivendorx')}
								</p>
							)}
						</ul>
					</div>
				</>
			)}
		</>
	);
};

export default MarketplaceProductList;
