import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import ProductList from './productList';

const getStoreSlugFromUrl = () => {
	const parts = window.location.pathname.split('/').filter(Boolean);
	const index = parts.indexOf('store');
	return index !== -1 ? parts[index + 1] : null;
};

const Edit = () => {
	const blockProps = useBlockProps();

	return (
		<div {...blockProps}>
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
			<ProductList
				storeSlug={getStoreSlugFromUrl()}
			/>
		</BrowserRouter>,
		el
	);
});
