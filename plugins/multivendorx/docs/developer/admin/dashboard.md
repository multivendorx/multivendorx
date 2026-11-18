# Admin Dashboard

## Scope

This covers `multivendorx`'s extension surface on the **wp-admin side** — the single top-level `MultiVendorX` admin page, mounted at `#admin-main-wrapper`. This plugin **owns** the mechanism described here (unlike `multivendorx-pro`'s admin docs, which only cover how Pro *extends* it). It does not cover the vendor-facing store dashboard (`#multivendorx-store-dashboard`) — see [../frontend/store-dashboard.md](../frontend/store-dashboard.md) for that.

## The wp-admin PHP layer

### The single top-level menu, plus a real submenu page per tab

Registered in `classes/Admin.php:69-77`:

```php
add_menu_page(
    'MultiVendorX',
    'MultiVendorX',
    'manage_options',
    'multivendorx',
    array( $this, 'create_setting_page' ),
    'data:image/svg+xml;base64,...',
    50
);
```

`create_setting_page()` (`classes/Admin.php:215-217`) is the entire PHP-side page body — it just echoes an empty mount div:

```php
public function create_setting_page() {
    echo '<div id="admin-main-wrapper" class="admin-main-wrapper"></div>';
}
```

Every tab under `MultiVendorX` **does** get a real `add_submenu_page()` call — one per tab, generated in a loop (`classes/Admin.php:153-184`) — but every one of them points at the same top-level page (`multivendorx`) with a URL hash fragment appended, and uses a no-op callback:

```php
add_submenu_page(
    'multivendorx',
    $submenu['name'],
    "<span ...>" . $menu_name . '</span>',
    'manage_options',
    'multivendorx#&tab=' . $slug . $subtab,
    '__return_null'
);
```

So clicking "Stores" in the wp-admin sidebar navigates to `?page=multivendorx#&tab=stores` — same PHP page (`create_setting_page()`'s empty div) every time; only the `#` hash fragment changes, and the React app reads that hash client-side to decide what to render (see below). The self-referencing `add_submenu_page('multivendorx', 'MultiVendorX', ...)` duplicate WordPress creates automatically for the top-level page, and a legacy `notifications` submenu entry, are explicitly removed right after (`remove_submenu_page( 'multivendorx', 'multivendorx' )` / `...#&tab=notifications`), so they don't show as a redundant/broken sidebar entry.

### Tabs are a filtered, priority-sorted array

The tab list itself comes from a single filter (`classes/Admin.php:80-144`):

```php
$submenus = apply_filters(
    'multivendorx_submenus',
    array(
        'dashboard'   => array( 'name' => __( 'Dashboard', 'multivendorx' ), 'subtab' => '', 'priority' => 10 ),
        'stores'      => array( 'name' => __( 'Stores', 'multivendorx' ), 'subtab' => '', 'priority' => 20 ),
        'commissions' => array( 'name' => __( 'Commissions', 'multivendorx' ), 'subtab' => '', 'priority' => 30 ),
        // ...transaction-history, approval-queue, compliance, customers, reports,
        //    settings (subtab: 'overview'), modules, status-tools (subtab: 'system-status'), help-support
    )
);

uasort( $submenus, function ( $a, $b ) {
    return ( $a['priority'] ?? 0 ) <=> ( $b['priority'] ?? 0 );
} );
```

Each entry is `{tab_key} => array( 'name' => string, 'subtab' => string, 'priority' => int )` — sorted by `priority` before the submenu-page loop runs, so a new tab's `priority` value directly controls where it lands in the sidebar. `subtab`, when non-empty (`settings` uses `'overview'`, `status-tools` uses `'system-status'`), gets appended as a second hash param (`&subtab=...`) — the React side reads this the same way it reads `tab`.

**To add a new admin tab**, hook this same filter from your own plugin/module and append an entry — this is the exact mechanism `multivendorx-pro`'s modules use (see the parent repo's `docs/admin/dashboard.md` for real examples like `ProductAdvertising/Admin.php`).

### Notification-count badges on specific tabs

Four tab keys get a live count badge injected into their sidebar label — `commissions`, `approval-queue`, `customers`, `compliance` (`classes/Admin.php:163-174`), sourced from `multivendorx_get_menu_count( $slug )`. The badge markup includes a `data-tab="{slug}"` attribute; the frontend (`src/app.tsx:44-98`) subscribes to four global stores (`window.multivendorxComplianceStore`, `multivendorxStore`, `multivendorxCommissionStore`, `multivendorxCustomerStore`) and live-updates the matching badge's `innerText` on change, without a full page reload.

### "Upgrade to Pro" submenu

When `Utill::is_khali_dabba()` is false (Pro not active/licensed), an extra `Upgrade to Pro` submenu entry is registered with inline gradient-styled CSS and routes through `handle_external_redirects()` (`classes/Admin.php:186-203`), which relies on the `allow_multivendorx_redirect_host` filter (`allowed_redirect_hosts`) to permit `wp_safe_redirect()` to an external multivendorx.com URL.

### Screen-gated script enqueue

`enqueue_admin_script()` (`classes/Admin.php:224-242`) loads the full admin bundle only on the `toplevel_page_multivendorx` screen (plus `wp-element`/block editor dependencies for the React app), and a separate, much smaller bundle (`multivendorx-product-tab-script`) on the `product`/`shop_coupon` edit screens — for the "Store" tab this plugin adds to the WooCommerce product/coupon editor (see `add_store_tab_in_product()`/`add_store_tab_in_coupon()` in the same file, and [../filters-hooks/](../filters-hooks/) for the WC product/coupon hooks involved).

## The React side: hash-based tab routing

Unlike the vendor-facing store dashboard (which is REST-driven and uses a 3-tier component-resolution chain — see [../frontend/store-dashboard.md](../frontend/store-dashboard.md)), the **admin** side resolves a tab to a component through a simple **global route registry**, not a filter chain:

```ts
// src/routeRegistry.ts
window.MULTIVENDORX_ROUTES = window.MULTIVENDORX_ROUTES || [];

export const registerMultiVendorXRoute = (route) => {
    window.MULTIVENDORX_ROUTES.push(route);
    window.dispatchEvent(new Event('multivendorx-routes'));
};
window.registerMultiVendorXRoute = registerMultiVendorXRoute;
```

This plugin's own base tabs are registered directly in `src/routes.ts`:

```ts
registerMultiVendorXRoute({ tab: 'dashboard', component: AdminDashboard });
registerMultiVendorXRoute({ tab: 'settings', component: Settings });
registerMultiVendorXRoute({ tab: 'status-tools', component: StatusAndTools });
// ...
```

`src/app.tsx` auto-loads every module's own JS entry the same way the free dashboard auto-loads Pro's store-dashboard modules (see [../integration/dashboard-component-registration.md](../integration/dashboard-component-registration.md)):

```tsx
// src/app.tsx:22-29
const modulesContext = require.context('../modules', true, /\/src\/index\.(ts|tsx)$/);
modulesContext.keys().forEach(modulesContext);
```

A module that wants its own admin tab just calls `window.registerMultiVendorXRoute({ tab, component })` from its own `modules/{Module}/src/index.tsx` — real example:

```tsx
// modules/Announcement/src/index.tsx
import Announcements from './Announcements';
window.registerMultiVendorXRoute({ tab: 'announcements', component: Announcements });
```

The `Route` component inside `app.tsx` (`src/app.tsx:33-136`) then reads the `tab` param from `location.hash` (`new URLSearchParams(location.hash).get('tab') || 'dashboard'`), looks it up against `window.MULTIVENDORX_ROUTES`, and renders whichever component registered for that key — **no separate mapping/menu-editing step is needed beyond the `multivendorx_submenus` filter entry (for the sidebar link) and the `registerMultiVendorXRoute` call (for the component)**. The two keys (`tab` slug and the registered route's `tab`) must match exactly, same as any other filename/key-matching convention in this codebase.

For the full list of JS/TS extension points beyond this one, see [../filters-hooks/js-extension-points.md](../filters-hooks/js-extension-points.md).
