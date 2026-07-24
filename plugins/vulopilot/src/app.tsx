import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import {
	HeaderComponent,
	NoticeReceiverComponent,
} from '@zyra/components';
import Brand from './assets/images/vulopilot-logo.svg';
import './routeRegistry';
import './routes';

/**
 * Reads the active tab from the URL hash (`?page=vulopilot#&tab=health`)
 * and renders whichever component registered itself for that tab in
 * routes.ts — the same hash-driven tab system the free multivendorx
 * plugin's admin screen uses (see react-frontend.md), rather than
 * react-router path routes, since every VuloPilot admin URL is really
 * `admin.php?page=vulopilot` with WordPress itself only ever serving that
 * one PHP-rendered page.
 */
const Route = () => {
	const location = useLocation();
	const [routes, setRoutes] = useState([...window.VULOPILOT_ROUTES]);

	useEffect(() => {
		const updateRoutes = () => setRoutes([...window.VULOPILOT_ROUTES]);

		window.addEventListener('vulopilot-routes', updateRoutes);

		return () =>
			window.removeEventListener('vulopilot-routes', updateRoutes);
	}, []);

	const tab = new URLSearchParams(location.hash).get('tab') || 'dashboard';
	const route = routes.find((r) => r.tab === tab);
	const Component = route?.component;

	if (!Component) {
		return null;
	}

	return <Component />;
};

const App = () => {
	const currentTabParams = new URLSearchParams(useLocation().hash);

	// Highlight the active tab in the WP admin sidebar submenu.
	useEffect(() => {
		document
			.querySelectorAll('#toplevel_page_vulopilot > ul > li > a')
			.forEach((menuItem) => {
				const menuItemUrl = new URL(
					(menuItem as HTMLAnchorElement).href
				);
				const menuItemHashParams = new URLSearchParams(
					menuItemUrl.hash.substring(1)
				);

				if (menuItem.parentNode) {
					(menuItem.parentNode as HTMLElement).classList.remove(
						'current'
					);
				}

				if (
					menuItemHashParams.get('tab') ===
					currentTabParams.get('tab')
				) {
					(menuItem.parentNode as HTMLElement).classList.add(
						'current'
					);
				}
			});
	}, [currentTabParams]);

	return (
		<>
			<HeaderComponent
				brandImg={Brand}
				onQueryUpdate={() => {}}
				onResultClick={() => {}}
				search={{ placeholder: __('Search…', 'vulopilot') }}
			/>

			<NoticeReceiverComponent position="notice" />

			<Route />
		</>
	);
};

export default App;
