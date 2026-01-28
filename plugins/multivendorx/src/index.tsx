import { render } from '@wordpress/element';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './app';
import Dashboard from './storeDashboard';
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

const vendorWrapper = document.getElementById('multivendorx-vendor-dashboard');
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

	render(
		<BrowserRouter>
			<Dashboard />
		</BrowserRouter>,
		vendorWrapper
	);
}
