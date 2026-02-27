import { render } from '@wordpress/element';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './app';
import DashboardRoutes  from './dashboardRoutes';
import 'zyra/build/index.css';
import 'leaflet/dist/leaflet.css';
import { initializeModules } from 'zyra';

// Render the App component into the DOM
// render(
//     <BrowserRouter>
//         <App />
//     </BrowserRouter>,
//     document.getElementById( 'admin-main-wrapper' )
// );

initializeModules(appLocalizer, 'multivendorx', 'free', 'modules');

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
// const vendorWrapper = document.querySelector('.dashboard-content')
// if (vendorWrapper) {

//     document.documentElement.style.setProperty('--colorPrimary', appLocalizer.color.colors.colorPrimary);
//     document.documentElement.style.setProperty('--colorSecondary', appLocalizer.color.colors.colorSecondary);
//     document.documentElement.style.setProperty('--colorAccent', appLocalizer.color.colors.colorAccent);
//     document.documentElement.style.setProperty('--colorSupport', appLocalizer.color.colors.colorSupport);

//     replaceDashboardDivs(vendorWrapper as HTMLElement);
// }


const vendorWrapper = document.getElementById('multivendorx-store-dashboard');

if (vendorWrapper) {
		document.documentElement.style.setProperty(
			'--colorPrimary',
			appLocalizer.color.colors.colorPrimary
		);
		document.documentElement.style.setProperty(
			'--colorSecondary',
			appLocalizer.color.colors.colorSecondary
		);
		document.documentElement.style.setProperty(
			'--colorAccent',
			appLocalizer.color.colors.colorAccent
		);
		document.documentElement.style.setProperty(
			'--colorSupport',
			appLocalizer.color.colors.colorSupport
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
		render(
			<DashboardRoutes />,
			vendorWrapper
		);
	}
}

// const vendorWrapper = document.getElementById('multivendorx-store-dashboard');

// if (vendorWrapper) {
// 	document.documentElement.style.setProperty(
// 		'--colorPrimary',
// 		appLocalizer.color.colors.colorPrimary
// 	);
// 	document.documentElement.style.setProperty(
// 		'--colorSecondary',
// 		appLocalizer.color.colors.colorSecondary
// 	);
// 	document.documentElement.style.setProperty(
// 		'--colorAccent',
// 		appLocalizer.color.colors.colorAccent
// 	);
// 	document.documentElement.style.setProperty(
// 		'--colorSupport',
// 		appLocalizer.color.colors.colorSupport
// 	);

// 	render(
// 		<BrowserRouter>
// 			<DashboardRoutes />
// 		</BrowserRouter>,
// 		vendorWrapper
// 	);
// }
