import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

const Edit = () => {
	return (
		<div className="is-style-minimal  alignwide wp-block-woocommerce-product-details">
			<div className="components-disabled multivendorx-store-products-wrapper">
				<ul className="wc-tabs tabs">
					<li className="description_tab active">
						<a> {__('Products', 'multivendorx')} </a>
					</li>
					<li className="description_tab">
						<a> {__('Reviews', 'multivendorx')} </a>
					</li>
					<li className="description_tab">
						<a> {__('Policy', 'multivendorx')} </a>
					</li>
				</ul>
				<ul
					className="wc-block-product-template is-flex-container columns-3"
					role="list"
				>
					{[
						{
							name: __('Classic T-Shirt', 'multivendorx'),
							price: '₹499',
							type: 'simple',
							hasSale: true,
						},
						{
							name: __('Denim Jacket', 'multivendorx'),
							price: '₹1,299',
							type: 'simple',
							hasSale: false,
						},
						{
							name: __('Running Shoes', 'multivendorx'),
							price: '₹1,999',
							regularPrice: '₹2,499',
							type: 'variable',
							hasSale: true,
						},
						{
							name: __('Cotton Hoodie', 'multivendorx'),
							price: '₹899',
							type: 'simple',
							hasSale: true,
						},
						{
							name: __('Sports Cap', 'multivendorx'),
							price: '₹399',
							type: 'simple',
							hasSale: false,
						},
						{
							name: __('Yoga Mat', 'multivendorx'),
							price: '₹799',
							regularPrice: '₹999',
							type: 'variable',
							hasSale: true,
						},
						{
							name: __('Gym Bag', 'multivendorx'),
							price: '₹1,499',
							type: 'simple',
							hasSale: false,
						},
						{
							name: __('Water Bottle', 'multivendorx'),
							price: '₹249',
							type: 'simple',
							hasSale: true,
						},
						{
							name: __('Training Gloves', 'multivendorx'),
							price: '₹599',
							regularPrice: '₹799',
							type: 'variable',
							hasSale: true,
						},
					].map((product, index) => (
						<li
							key={index}
							className="wc-block-product"
							role="listitem"
						>
							<div className="wc-block-components-product-image">
								<a>
									<img
										src="/wp-content/uploads/woocommerce-placeholder.webp"
										alt={product.name}
										className="wp-block-woocommerce-product-image"
									/>
								</a>
								{product.hasSale && (
									<div className="wc-block-components-product-sale-badge wc-block-components-product-sale-badge--align-right">
										<span aria-hidden="true">
											{__('Sale', 'multivendorx')}
										</span>
										<span className="screen-reader-text">
											{__(
												'Product on sale',
												'multivendorx'
											)}
										</span>
									</div>
								)}
							</div>

							<h3 className="wp-block-post-title has-text-align-center">
								<a href="#">{product.name}</a>
							</h3>

							<div className="wc-block-components-product-price price wc-block-components-product-price--align-center">
								{product.type === 'variable' &&
								product.regularPrice ? (
									<span className="wc-block-components-product-price__value">
										<span className="screen-reader-text">
											{__(
												'Previous price:',
												'multivendorx'
											)}
										</span>
										<del className="wc-block-components-product-price__regular">
											{product.regularPrice}
										</del>
										<span className="screen-reader-text">
											{__(
												'Discounted price:',
												'multivendorx'
											)}
										</span>
										<ins className="wc-block-components-product-price__value is-discounted">
											{product.price}
										</ins>
									</span>
								) : (
									<span className="wc-block-components-product-price__value">
										{product.price}
									</span>
								)}
							</div>

							<div className="wp-block-button wc-block-components-product-button align-center">
								<a
									href="#"
									className="wp-block-button__link wp-element-button add_to_cart_button"
								>
									{product.type === 'variable'
										? __('Select options', 'multivendorx')
										: __('Add to cart', 'multivendorx')}
								</a>
							</div>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

registerBlockType('multivendorx/store-tabs', {
	apiVersion: 3,
	edit: Edit,
	save() {
		return <div id="multivendorx-store-tabs"></div>;
	},
});
