/* global appLocalizer */
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import App from './app';
import DashboardRoutes from './dashboardRoutes';
import 'zyra/build/index.css';
import 'leaflet/dist/leaflet.css';
import { initializeModules } from 'zyra';

initializeModules('multivendorx', 'free', 'modules');

// 1. Try to mount admin panel if element is found
const adminWrapper = document.getElementById('admin-main-wrapper');
if (adminWrapper) {
	render(
		<BrowserRouter>
			<App />
		</BrowserRouter>,
		adminWrapper
	);
}
// 2. Try to mount vendor dashboard if element is found
const vendorWrapper = document.getElementById('multivendorx-store-dashboard');

if (vendorWrapper) {
	const colors = appLocalizer?.color?.colors || {};

	document.documentElement.style.setProperty(
		'--color-primary',
		colors.colorPrimary || '#00EED0'
	);
	document.documentElement.style.setProperty(
		'--color-secondary',
		colors.colorSecondary || '#0197AF'
	);
	document.documentElement.style.setProperty(
		'--color-accent',
		colors.colorAccent || '#4B227A'
	);
	document.documentElement.style.setProperty(
		'--color-support',
		colors.colorSupport || '#02153D'
	);

	/**
	 * Permalink structure support:
	 *
	 * Pretty permalinks (permalink_structure is set):
	 *   URL: /vendor-dashboard/products/edit/123
	 *   BrowserRouter basename: /<site-path>/<dashboard_slug>
	 *
	 * Plain permalinks (permalink_structure is empty/false):
	 *   URL: /?page_id=XX&segment=products&element=edit&context_id=123
	 *   We use MemoryRouter (see dashboardRoutes.tsx) — BrowserRouter basename is not used.
	 */
	const sitePath = new URL(appLocalizer.site_url).pathname.replace(/\/$/, '');

	if (appLocalizer.permalink_structure) {
		// Pretty permalink mode — use BrowserRouter with basename
		const basename = `${sitePath}/${appLocalizer.dashboard_slug}`;
		render(
			<BrowserRouter basename={basename}>
				<DashboardRoutes />
			</BrowserRouter>,
			vendorWrapper
		);
	} else {
		// Plain permalink mode — route state is driven by query params, not URL path.
		// DashboardRoutes will read segment/element/context_id from window.location.search.
		render(<DashboardRoutes />, vendorWrapper);
	}
}
