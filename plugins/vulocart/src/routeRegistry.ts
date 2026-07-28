import type { ComponentType } from 'react';

/**
 * Mirrors `vulopilot/src/routeRegistry.ts` (and multivendorx's own
 * `routeRegistry.ts`) exactly: a global array + register function pages
 * push themselves onto, read back by App.tsx's `Route` component keyed
 * on `location.hash`'s `tab` param — see App.tsx's own docblock for why
 * this replaces react-router path routes for tab-switching.
 */
declare global {
	interface Window {
		VULOCART_ROUTES: Array< { tab: string; component: ComponentType } >;
	}
}

window.VULOCART_ROUTES = window.VULOCART_ROUTES || [];

export const registerVuloCartRoute = ( route: {
	tab: string;
	component: ComponentType;
} ) => {
	window.VULOCART_ROUTES.push( route );
	window.dispatchEvent( new Event( 'vulocart-routes' ) );
};
