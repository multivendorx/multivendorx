/* global vulocartLocalizer */
import { useEffect, useState } from '@wordpress/element';
import { useLocation } from 'react-router-dom';
import { HeaderComponent } from '@zyra/components';
import Brand from '../assets/images/vulocart-logo.svg';
import '../routeRegistry';
import '../routes';
import './app.scss';

/**
 * Tab structure mirrors `MultiVendorX\Admin`'s/`VuloPilot\Admin`'s real
 * pattern exactly (not react-router path routes): the tabs are real WP
 * admin sidebar submenu entries (classes/Admin/Menu.php's
 * `add_submenu_page()` calls, each pointing to `vulocart#&tab={tab}`),
 * and this `Route` sub-component reads `tab` from `location.hash` (via
 * `BrowserRouter`'s `useLocation()`, still needed just for that — src/
 * index.tsx) to render whichever component registered itself for that
 * tab in routes.ts. Clicking a submenu entry only changes the hash (same
 * pathname+query as the currently-loaded page), so it's a same-document
 * navigation, not a full reload.
 */
const Route = () => {
	const location = useLocation();
	const [ routes, setRoutes ] = useState( [ ...window.VULOCART_ROUTES ] );

	useEffect( () => {
		const updateRoutes = () => setRoutes( [ ...window.VULOCART_ROUTES ] );

		window.addEventListener( 'vulocart-routes', updateRoutes );

		return () => window.removeEventListener( 'vulocart-routes', updateRoutes );
	}, [] );

	const tab = new URLSearchParams( location.hash ).get( 'tab' ) || 'dashboard';
	const route = routes.find( ( r ) => r.tab === tab );
	const Component = route?.component;

	if ( ! Component ) {
		return null;
	}

	return <Component />;
};

export function App() {
	return (
		<>
			<HeaderComponent
				brandImg={ Brand }
				free={ vulocartLocalizer.version }
				pro={ vulocartLocalizer.pro_version ?? undefined }
				onQueryUpdate={ () => {} }
				onResultClick={ () => {} }
			/>
			<div id="vulocart-admin-root-inner" className="admin-main-wrapper">
				<Route />
			</div>
		</>
	);
}
