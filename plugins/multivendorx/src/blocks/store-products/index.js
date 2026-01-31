import { registerBlockType } from '@wordpress/blocks';
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import ProductList from './productList';

const Edit = () => {
	return (
		<div>
			<ProductList
				isEditor={true}
			/>
		</div>
	);
};

registerBlockType('multivendorx/store-products', {
	apiVersion: 2,
	edit: Edit,
	save() {
		return <div id="multivendorx-store-shop-products"></div>;
	},
});

document.addEventListener('DOMContentLoaded', () => {
	const el = document.getElementById(
		'multivendorx-store-shop-products'
	);

	if (!el) {
		return;
	}

	render(
		<BrowserRouter>
			<ProductList/>
		</BrowserRouter>,
		el
	);
});
