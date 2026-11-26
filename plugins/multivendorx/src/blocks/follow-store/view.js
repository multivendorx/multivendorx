/* global StoreInfo */

import { createRoot } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import FollowStore from './FollowStore';

window.addEventListener('DOMContentLoaded', () => {
	const activeModules = StoreInfo?.activeModules || [];

	document.querySelectorAll('.multivendorx-follow-store').forEach((root) => {
		const container = document.createElement('div');
		container.className = 'multivendorx-follow-wrapper';
		root.appendChild(container);

		if (activeModules.includes('follow-store')) {
			createRoot(container).render(
				<BrowserRouter>
					<FollowStore />
				</BrowserRouter>
			);
		}
	});
});
