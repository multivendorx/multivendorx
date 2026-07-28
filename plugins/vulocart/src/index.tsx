/* global vulocartLocalizer */
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configureZyra, initializeModules } from '@zyra/core';
import { HeaderComponent } from '@zyra/components';
import { App } from './app/App';
import Orders from './pages/Orders/Orders';
import Offerings from './pages/Offerings/Offerings';
import Brand from './assets/images/vulocart-logo.svg';

/**
 * VuloCart's free plugin owns its own React mount — unlike
 * multivendorx/vulopilot's Pro plugins, which only register
 * `@wordpress/hooks` filters into an already-mounted Free dashboard
 * (react-frontend.md), VuloCart has no existing dashboard to extend, so
 * this mounts directly into `#vulocart-admin-root` (classes/Admin/Menu.php).
 *
 * Two further, separate top-level WP admin menus ("Orders", "Offerings")
 * mount the exact same bundle into different root element ids
 * (`#vulocart-orders-admin-root`, `#vulocart-offerings-admin-root`) — both
 * get their own dedicated space rather than being one more VuloCart tab
 * (Menu.php's `add_orders_menu()`/`add_offerings_menu()` docblocks).
 * Rather than a second/third webpack entry, this file renders a
 * different, self-contained tree per root — "never mix multiple modules
 * into one screen" holds either way, since neither screen ever renders
 * Modules/Settings.
 *
 * Both apps read `action`/`id` straight from `window.location.search` once,
 * at mount time — not via client-side routing. Every transition between
 * list/add/edit is a real full-page navigation to a distinct
 * `admin.php?page=...` URL (row/button links use plain `<a href>`/
 * `window.location.href`, see OrdersList.tsx/OfferingsList.tsx), matching
 * WooCommerce's own Orders/Products edit screens rather than a SPA route
 * or a popup — so a fresh mount re-reading the URL on every load is
 * exactly the right model, not a shortcut.
 *
 * `configureZyra()` feeds zyra's internal config (apiUrl/restUrl/nonce/
 * khali_dabba/etc, see global.d.ts) to every zyra component this app
 * renders (Modules/Settings/Dashboard pages). `initializeModules()`
 * seeds zyra's own `useModules()` store with the real active-module list
 * — `force_vulocart_context_reload` mirrors the multivendorx/vulopilot
 * app.tsx pattern of setting this unconditionally on every load so the
 * store never goes stale.
 *
 * `BrowserRouter`, not `HashRouter` — App.tsx's tab system reads the raw
 * `location.hash` (`#&tab=...`) itself; `HashRouter` would instead treat
 * everything after `#` as its own routed pathname, which isn't what
 * App.tsx's `Route` component expects (confirmed the hard way once
 * already this session — see App.tsx's docblock).
 */
localStorage.setItem( 'force_vulocart_context_reload', 'true' );

configureZyra( vulocartLocalizer );
initializeModules( 'vulocart', 'free', 'modules' );

const queryClient = new QueryClient();

const adminRoot = document.getElementById( 'vulocart-admin-root' );
const ordersAdminRoot = document.getElementById( 'vulocart-orders-admin-root' );
const offeringsAdminRoot = document.getElementById( 'vulocart-offerings-admin-root' );

const urlParams = new URLSearchParams( window.location.search );
const urlAction = urlParams.get( 'action' );
const urlId = urlParams.get( 'id' ) ? Number( urlParams.get( 'id' ) ) : null;

if ( adminRoot ) {
	render(
		<QueryClientProvider client={ queryClient }>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</QueryClientProvider>,
		adminRoot
	);
}

if ( ordersAdminRoot ) {
	render(
		<QueryClientProvider client={ queryClient }>
			<HeaderComponent
				brandImg={ Brand }
				free={ vulocartLocalizer.version }
				pro={ vulocartLocalizer.pro_version ?? undefined }
				onQueryUpdate={ () => {} }
				onResultClick={ () => {} }
			/>
			<div className="admin-main-wrapper">
				<Orders action={ urlAction } id={ urlId } />
			</div>
		</QueryClientProvider>,
		ordersAdminRoot
	);
}

if ( offeringsAdminRoot ) {
	render(
		<QueryClientProvider client={ queryClient }>
			<HeaderComponent
				brandImg={ Brand }
				free={ vulocartLocalizer.version }
				pro={ vulocartLocalizer.pro_version ?? undefined }
				onQueryUpdate={ () => {} }
				onResultClick={ () => {} }
			/>
			<div className="admin-main-wrapper">
				<Offerings action={ urlAction } id={ urlId } />
			</div>
		</QueryClientProvider>,
		offeringsAdminRoot
	);
}
