import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import StoreTabs from './StoreTabs';

document.addEventListener('DOMContentLoaded', () => {
	const el = document.getElementById('multivendorx-store-tabs');

	if (!el) {
		return;
	}

	render(
		<BrowserRouter>
			<StoreTabs />
		</BrowserRouter>,
		el
	);
});