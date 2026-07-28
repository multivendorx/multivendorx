export {};

/**
 * VuloCart's own admin-page localizer — deliberately not `appLocalizer`
 * (a different plugin's shape, react-frontend.md documents it for the
 * multivendorx family). See classes/Admin/Menu.php's wp_localize_script()
 * call for where this comes from.
 *
 * `apiUrl` is the bare REST root and `restUrl` is the `vulocart/v1`
 * namespace — not one combined base URL — because this object is also
 * passed straight into zyra's `configureZyra()`, whose own `getApiLink()`
 * composes `${apiUrl}/${restUrl}/${endpoint}` under those exact property
 * names (see src/index.tsx). `khali_dabba`/`active_plugins`/`shop_url`/
 * `site_url` are the other zyra-config fields it reads (e.g.
 * `ModuleGridComponent`'s pro-module gating, required-plugin checks).
 */
interface VuloCartLocalizer {
	apiUrl: string;
	restUrl: string;
	nonce: string;
	adminUrl: string;
	active_modules: string[];
	khali_dabba: boolean;
	version: string;
	pro_version: string | null;
	active_plugins: string[];
	shop_url: string;
	site_url: string;
}

/**
 * Printed unconditionally on every frontend page load (classes/Block.php's
 * `print_frontend_config()`) — a separate, much smaller global than
 * `VuloCartLocalizer` above, since frontend blocks (src/blocks/*) have no
 * wp-admin context, no nonce (Cart/Order's REST routes are deliberately
 * public — see classes/RestAPI/Controllers/Cart.php's own docblock), and
 * don't need zyra's config shape at all.
 */
interface VuloCartFrontendData {
	apiUrl: string;
	restUrl: string;
}

declare global {
	var vulocartLocalizer: VuloCartLocalizer;
	var vulocartFrontendData: VuloCartFrontendData;
}
