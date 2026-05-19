import { createRoot } from '@wordpress/element';
import MarketplaceStoreList from './marketplaceStoreList';

window.addEventListener('load', () => {
	const element = document.getElementById('marketplace-stores');
	if (element) {
		const attributes = JSON.parse(
			element.getAttribute('data-attributes') || '{}'
		);
		const root = createRoot(element);
		root.render(<MarketplaceStoreList {...attributes} />);
	}
});