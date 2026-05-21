import { createRoot } from '@wordpress/element';
import ProductCategory from './ProductCategory';

window.addEventListener('load', () => {
	const el = document.getElementById('multivendorx-store-product-category');
	if (!el) {
		return;
	}

	const root = createRoot(el);
	root.render(<ProductCategory />);
});