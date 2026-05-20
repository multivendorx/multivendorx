import { createRoot } from '@wordpress/element';
import StoreQuickInfo from './StoreQuickInfo';

window.addEventListener('load', () => {
	const el = document.getElementById('multivendorx-store-quick-info');
	if (!el) {
		return;
	}

	const root = createRoot(el);
	root.render(<StoreQuickInfo />);
});
