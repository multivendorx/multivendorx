import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Product {
	id: number;
	name: string;
	permalink: string;
	images?: { src: string }[];
}

interface ProductListProps {
	isEditor: boolean;
	limit?: number;
}

const ProductList: React.FC<ProductListProps> = ({
	isEditor = false,
	limit = 4,
}) => {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (isEditor) {
			return;
		}

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
		<div className="woocommerce">
			<div className="product">
				<div className="woocommerce-tabs wc-tabs-wrapper">
					{/* tab */}
					<ul className="tabs wc-tabs">
						<li>Products</li>
						<li>Store</li>
					</ul>

					{/* product list */}
					<ul className="is-flex-container columns-4 wc-block-product-template wp-block-woocommerce-product-template is-layout-flow wp-block-woocommerce-product-template-is-layout-flow">
						{products.map((product) => (
							<li className="wc-block-product product type-product status-publish first instock shipping-taxable purchasable product-type-simple">
								<div className="wc-block-components-product-image wc-block-grid__product-image wc-block-components-product-image--aspect-ratio-auto wp-block-woocommerce-product-image">
									<a
										key={product.id}
										href={product.permalink}
										className="product-card"
									>
										{product.images?.[0]?.src ? (
											<img
												src={product.images[0].src}
												alt={product.name}
											/>
										) : (
											<img src="http://localhost:8889/wp-content/uploads/woocommerce-placeholder.webp" />
										)}
									</a>

									{/* product title */}
									<h2 className="has-text-align-center wp-block-post-title has-medium-font-size"><a href="">{product.name} </a></h2>

									{/* price */}
									<div className="has-font-size has-small-font-size has-text-align-center wp-block-woocommerce-product-price has-small-font-size">
										<div className="wc-block-components-product-price wc-block-grid__product-price">
											<span className="woocommerce-Price-amount amount">$299(p)</span>
										</div>
									</div>

									{/* add to cart btn */}
									{/* class dynamic */}
									<div className="wp-block-button wc-block-components-product-button   align-center wp-block-woocommerce-product-button has-small-font-size">
										<a href="" className="wp-block-button__link wp-element-button wc-block-components-product-button__button product_type_simple has-font-size has-small-font-size has-text-align-center wc-interactive">
											Add to cart (p)
										</a>
									</div>
								</div>
							</li>
						))}
					</ul>
				</div>
			</div>
			
		</div>
	);
};

export default ProductList;
