/* global appLocalizer */
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import {
	HeaderComponent,
	NoticeReceiverComponent,
} from '@zyra/components';
import Brand from './assets/images/vulopilot-logo.svg';
import { searchIndex, SearchItem } from './searchIndex';
import './routeRegistry';
import './routes';

// Forces initializeModules() (called in index.tsx, right after this module
// is imported) to actually fetch active modules from the server on every
// load — without this, useModules()'s zustand store stays at its initial
// `modules: []` forever and every moduleEnabled-gated field/module card
// looks permanently locked, matching the multivendorx/catalogx app.tsx
// pattern.
localStorage.setItem('force_vulopilot_context_reload', 'true');

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
	const [results, setResults] = useState<SearchItem[]>([]);

	const handleQueryUpdate = ({
		searchValue,
		searchAction,
	}: {
		searchValue: string;
		searchAction?: string;
	}) => {
		if (!searchValue.trim()) {
			setResults([]);
			return;
		}

		const lower = searchValue.toLowerCase();

		const filtered = searchIndex.filter((item) => {
			if (
				searchAction &&
				searchAction !== 'all' &&
				item.tab !== searchAction
			) {
				return false;
			}

			return (
				item.name?.toLowerCase().includes(lower) ||
				item.desc?.toLowerCase().includes(lower)
			);
		});

		setResults(filtered);
	};

	const handleResultClick = (item: SearchItem) => {
		window.location.hash = item.link;
	};

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
				results={results}
				search={{
					placeholder: __('Search…', 'vulopilot'),
					options: [
						{
							value: 'all',
							label: __('Modules & Settings', 'vulopilot'),
						},
						{
							value: 'modules',
							label: __('Modules', 'vulopilot'),
						},
						{
							value: 'settings',
							label: __('Settings', 'vulopilot'),
						},
					],
				}}
				onQueryUpdate={handleQueryUpdate}
				onResultClick={handleResultClick}
				free={appLocalizer.version}
				pro={appLocalizer.pro_data.version}
			/>

			<NoticeReceiverComponent position="notice" />

			<Route />
		</>
	);
};

export default App;
