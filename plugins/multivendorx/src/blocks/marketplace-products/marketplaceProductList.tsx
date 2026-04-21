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
	orderBy?: string;
	order?: 'asc' | 'desc';
	category?: string;
	operator?: string;
	productVisibility?: string;
	storeId?: string | number;
}

const MarketplaceProductList: React.FC<MarketplaceProductListProps> = ({
	perPage = 5,
	orderBy = 'title',
	order = 'asc',
	category = '',
	operator = 'IN',
	productVisibility = '',
	storeId,
}) => {
	const [products, setProducts] = useState<Product[]>([]);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(true);
	const isWidget = !!productList?.storeDetails?.storeId;

	useEffect(() => {
		setPage(1);
	}, [perPage, orderBy, order, category, productVisibility]);

	const fetchProducts = useCallback(async () => {
		setLoading(true);
		const params = {
			per_page: perPage,
			page,
			orderBy,
			order,
			cat: category,
			operator,
			product_visibility: productVisibility,
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
	}, [page, perPage, orderBy, order, category, operator, productVisibility]);

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
						{isWidget && (
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
									<div>
										{__(
											'Ready to receive your first order!',
											'multivendorx'
										)}
									</div>
								)}
							</ul>
						)}
						{!isWidget && (
						<ul className="products columns-3">
							{products.length > 0 && (
								products.map((product) => (
									<li
										key={product.id}
										className={`product type-product post-${product.id} status-publish first instock product_cat-${product.categories?.[0]?.slug || 'uncategorized'} has-post-thumbnail shipping-taxable purchasable product-type-simple`}
									>
										<a
											href={
												product.permalink ||
												'#'
											}
											className="woocommerce-LoopProduct-link woocommerce-loop-product__link"
										>
											<img
												width="324"
												height="324"
												src={
													product.images?.[0]?.src ||
													productList?.placeholder_url
												}
												alt={
													product.name ||
													'Product Image'
												}
												className={
													product.images?.[0]?.src
														? 'attachment-woocommerce_thumbnail size-woocommerce_thumbnail'
														: 'woocommerce-placeholder wp-post-image'
												}
												decoding="async"
												loading="lazy"
											/>
											<h2 className="woocommerce-loop-product__title">
												{product.name}
											</h2>

											{/* Add star rating if available */}
											{product.average_rating >
												0 && (
													<div
														className="star-rating"
														role="img"
														aria-label={`Rated ${product.average_rating} out of 5`}
													>
														<span
															style={{
																width: `${(product.average_rating / 5) * 100}%`,
															}}
														>
															Rated{' '}
															<strong className="rating">
																{
																	product.average_rating
																}
															</strong>{' '}
															out
															of
															5
														</span>
													</div>
												)}

											{/* Price HTML */}
											{product.price_html && (
												<span
													className="price"
													dangerouslySetInnerHTML={{
														__html: product.price_html,
													}}
												/>
											)}
										</a>
									</li>
								))
							)}
						</ul>
						)}
					</div>

				</>
			)}
		</>
	);
};

export default MarketplaceProductList;
