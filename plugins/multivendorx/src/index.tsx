import { render } from '@wordpress/element';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './app';
import replaceDashboardDivs from './storeDashboard';
import 'zyra/build/index.css';
import "leaflet/dist/leaflet.css";

// Render the App component into the DOM
// render(
//     <BrowserRouter>
//         <App />
//     </BrowserRouter>,
//     document.getElementById( 'admin-main-wrapper' )
// );

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
const vendorWrapper = document.querySelector('.dashboard-content')
if (vendorWrapper) {
    replaceDashboardDivs(vendorWrapper as HTMLElement);
}
