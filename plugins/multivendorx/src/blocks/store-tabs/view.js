import { createRoot } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import StoreTabs from './StoreTabs';

document.addEventListener('DOMContentLoaded', () => {
	const el = document.getElementById('multivendorx-store-tabs');

	if (!el) {
		return;
	}

	createRoot(el).render(
		<BrowserRouter>
			<StoreTabs />
		</BrowserRouter>
	);
});
