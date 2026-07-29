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
 *
 * `guestCheckoutEnabled`/`requireTermsAcceptance`/`checkoutTermsUrl`/
 * `isLoggedIn` are the Settings screen's Commerce/Checkout tab
 * (src/settings/Commerce/Checkout.ts) made real: src/blocks/checkout/
 * Checkout.tsx enforces both client-side (also enforced again server-side
 * by modules/Order/Rest.php's `create_item()` for `guestCheckoutEnabled` —
 * a client-only check isn't real enforcement against a direct API call).
 * `offeringsListingEnabled`/`cartCheckoutEnabled` are the General/
 * Frontend tab (src/settings/General/Frontend.ts) made real, same file.
 * `checkoutPageUrl`/`offeringsPageUrl` are auto-discovered (`Block.php`'s
 * `find_page_url_with_block()`), not merchant-configured — null until a
 * published page/post actually contains that block.
 */
interface VuloCartFrontendData {
	apiUrl: string;
	restUrl: string;
	guestCheckoutEnabled: boolean;
	requireTermsAcceptance: boolean;
	checkoutTermsUrl: string;
	isLoggedIn: boolean;
	offeringsListingEnabled: boolean;
	cartCheckoutEnabled: boolean;
	checkoutPageUrl: string | null;
	offeringsPageUrl: string | null;
}

declare global {
	var vulocartLocalizer: VuloCartLocalizer;
	var vulocartFrontendData: VuloCartFrontendData;
}
