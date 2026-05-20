import { createRoot } from '@wordpress/element';
import MarketplaceProductList from './marketplaceProductList';

// Render on frontend
window.addEventListener('load', () => {
	const element = document.getElementById('marketplace-products');
	if (element) {
		const attributes = JSON.parse(
			element.getAttribute('data-attributes') || '{}'
		);
		const root = createRoot(element);
		root.render(<MarketplaceProductList {...attributes} />);
	}
});
