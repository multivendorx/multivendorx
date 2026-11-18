# Store Dashboard (Frontend)

## Scope

This covers `multivendorx`'s extension surface on the **vendor/customer-facing side** — the store dashboard mounted at `#multivendorx-store-dashboard`, plus the storefront-facing PHP layer (`classes/Frontend.php`). This plugin **owns** every mechanism described here — the actual template take-over, the actual REST-driven menu, the actual React mount and component-resolution chain. `multivendorx-pro`'s own frontend docs only cover how Pro *extends* this from the outside (its final fallback step in the component-resolution chain below); read this file first if you're building against this plugin directly rather than a Pro module.

## The storefront PHP layer

`classes/Frontend.php` (633 lines — the largest single class in this plugin) covers a lot of ground: cart/checkout restrictions (a shopper can't check out with products from multiple stores mixed with certain settings), store-scoped media library restriction, visitor-stats tracking, and the dashboard's own page delivery. The dashboard-relevant pieces:

### Taking over the dashboard page's template

Unlike a shortcode-based approach, the vendor dashboard page is delivered by hijacking WordPress's own template hierarchy:

```php
// classes/Frontend.php:26
add_filter( 'template_include', array( $this, 'store_dashboard_template' ) );
```

`store_dashboard_template( $template )` (`classes/Frontend.php:332-`) swaps in this plugin's own dashboard template when the current request is for the configured dashboard page, so the React app's mount div (`#multivendorx-store-dashboard`) ends up in the page output regardless of the active theme.

### Login/logout redirects

```php
add_filter( 'woocommerce_login_redirect', array( $this, 'redirect_store_dashboard' ), 10 );
add_filter( 'login_redirect', array( $this, 'redirect_store_dashboard' ), 10 );
```

Sends store owners/staff straight to their dashboard after login rather than WooCommerce's default My Account page — `redirect_store_dashboard()`, `classes/Frontend.php:350-`.

### Script enqueue

```php
// classes/Frontend.php:49,110-116
add_action( 'wp_enqueue_scripts', array( $this, 'load_scripts' ) );

public function load_scripts() {
    FrontendScripts::load_scripts();
    FrontendScripts::enqueue_script( 'multivendorx-store-products-script' );
    if ( is_account_page() ) {
        FrontendScripts::enqueue_style( 'multivendorx-store-tabs-style' );
    }
}
```

Simpler gating than `multivendorx-pro`'s equivalent (no separate store-dashboard/account-page/store-page three-way branch) — this plugin's frontend bundle loads broadly, and the React app itself decides what to render based on which mount div is present.

### Multi-store cart/checkout restrictions

A block of hooks (`classes/Frontend.php:31-44`) enforces marketplace rules that are genuinely storefront concerns, not just dashboard ones: `woocommerce_related_products` (scope related products to the same store), `woocommerce_before_calculate_totals`/`cart_items_sort_by_store` (group cart line items by vendor), `woocommerce_product_query`/`restrict_store_products_from_shop`, `woocommerce_add_to_cart_validation`/`restrict_products_from_cart`, `woocommerce_checkout_process`/`restrict_products_from_checkout`. See [../filters-hooks/actions.md](../filters-hooks/actions.md) and [../filters-hooks/filters.md](../filters-hooks/filters.md) for the full set with context.

## The dashboard menu: REST-driven, with a settings override

The vendor dashboard's own menu isn't a hardcoded list — it's built server-side by a REST endpoint, `Dashboard::get_items()` (`classes/RestAPI/Controllers/Dashboard.php`, route `/multivendorx/v1/dashboard-menu`), and fetched by the React app at runtime. The construction has **three layers**, in this order:

1. **A saved "Menu Manager" configuration takes full precedence, if one exists.** `all_endpoints()` (`classes/RestAPI/Controllers/Dashboard.php:106-`) first checks `MultiVendorX()->setting->get_setting( 'menu_manager' )` — a site-admin-configurable menu order/visibility setting. If that option is set, the computed base menu is entirely replaced by the saved configuration (merged item-by-item with the base array for any fields the saved config doesn't override), **and neither `multivendorx_dashboard_menu` nor `dashboard_other_endpoints` gets a chance to run** for the base set. This is a real gotcha worth knowing before debugging why a module's menu-filter change "isn't showing up" — check whether the site has a saved `menu_manager` option first.
2. **Otherwise**, the hardcoded base endpoint list runs through `apply_filters( 'multivendorx_dashboard_menu', $all_endpoints )` (`classes/RestAPI/Controllers/Dashboard.php:261`) — a **post-processing** filter for adjusting/hiding entries in the base set based on runtime conditions. Real consumer: `classes/Frontend.php:57`'s `hide_menu()`, which removes the `wallet` and/or `products` menu items based on the store's configured permissions (`disable_payouts`, `hide_store_products`, `disable_product_upload`).
3. **Additions** (new top-level menu entries, as opposed to hiding existing ones) go through a second, separate filter, `apply_filters( 'dashboard_other_endpoints', array(...) )` (`classes/RestAPI/Controllers/Dashboard.php:64-`), and get `array_merge()`'d onto the (already-filtered) base set — **only these additions are visible to `multivendorx-pro`'s modules**; see the parent repo's `docs/frontend/store-dashboard.md` for real examples like `Booking`.

Each entry (from either the base set or `dashboard_other_endpoints`) is `{key} => array( name, icon, slug, submenu, capability, filename[, module] )`.

## The React mount and dual permalink routing

`src/index.tsx` mounts into `#multivendorx-store-dashboard` (and, separately, `#admin-main-wrapper` — see [../admin/dashboard.md](../admin/dashboard.md)):

```tsx
// src/index.tsx
if (appLocalizer.permalink_structure) {
    // Pretty permalink mode — use BrowserRouter with basename
    const basename = `${sitePath}/${appLocalizer.dashboard_slug}`;
    render(<BrowserRouter basename={basename}><DashboardRoutes /></BrowserRouter>, vendorWrapper);
} else {
    // Plain permalink mode — route state is driven by query params, not URL path.
    render(<DashboardRoutes />, vendorWrapper);
}
```

Any dashboard route/link a module adds must work in both modes — pretty permalinks give a real URL path (`/vendor-dashboard/products/edit/123`); plain permalinks encode the same state as query params (`?page_id=XX&segment=products&element=edit&context_id=123`), read by `DashboardRoutes` from `window.location.search` rather than the path.

## Component resolution: a 3-tier chain

Once a menu entry's `key`/`filename` is known, `storeDashboard.tsx`'s `loadComponent()` (`src/storeDashboard.tsx:231-271`) resolves it to an actual React component through three tiers, **in this order**:

```tsx
const loadComponent = (key: string) => {
    const routes = getDashboardRoutes();
    const matchedRoute = routes.find((route) => route.tab === urlTab && route.element === element);
    if (matchedRoute) {
        return <matchedRoute.component contextId={context_id} />;               // 1. detail-view routes
    }

    const convertedKey = kebabToCamelCase(activeEndpoint?.filename || key);
    try {
        const DashboardComponent = require(`./dashboard/${convertedKey}.tsx`).default;
        return <DashboardComponent contextId={context_id} />;                    // 2. this plugin's own component
    } catch {
        // fall through
    }

    return applyFilters('multivendorx_pro_dashboard_component', null, convertedKey); // 3. Pro's fallback
};
```

1. **`getDashboardRoutes()`** (`src/dashboardConfig.ts`) — a small, filterable (`multivendorx_dashboard_routes`) set of `{tab, element}` → component mappings for **detail views** specifically (product add/edit, order add/view) — not the main tab content.
2. **A direct `require()`** of `./dashboard/{camelCasedFilename}.tsx` — this plugin's **own** 19 modules' (and core tabs') store-dashboard components live directly under `src/dashboard/`, not per-module folders. This is a different convention from `multivendorx-pro`'s modules, which each keep their component under their own `modules/{Module}/src/`.
3. **Only if step 2 throws** (the file genuinely doesn't exist in `src/dashboard/`) does it fall through to `applyFilters('multivendorx_pro_dashboard_component', null, convertedKey)` — this is the exact filter `multivendorx-pro`'s `src/index.tsx` hooks to supply its own modules' components (see the parent repo's `docs/integration/dashboard-component-registration.md`). In other words: **Pro's per-module dashboard components are a fallback of last resort in this plugin's own resolution chain**, not a parallel, independent mechanism.

For settings-tab registration (`multivendorx_settings_context`, the `'dashboardSettings'` type) and the rest of the JS/TS extension points, see [../filters-hooks/js-extension-points.md](../filters-hooks/js-extension-points.md).
