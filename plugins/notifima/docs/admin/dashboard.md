# Admin Dashboard

## The wp-admin page

`Admin::register_admin_menus()` (`classes/Admin.php:58-123`, hooked on `admin_menu`) registers one top-level page:

```php
add_menu_page( 'Notifima', 'Notifima', 'manage_options', 'notifima', array( $this, 'create_setting_page' ), $svg_icon, 50 );
```

`create_setting_page()` (`classes/Admin.php:130-132`) just echoes an empty mount div — `<div id="admin-main-wrapper" class="admin-main-wrapper"></div>` — for React to render into (see below).

Four tabs are then registered as real `add_submenu_page()` entries, all pointing back at the same top-level page via a URL hash rather than a distinct query string:

```php
$submenu_items = array(
    'dashboard'         => array( 'name' => __( 'Dashboard', 'notifima' ), 'subtab' => '' ),
    'settings'          => array( 'name' => __( 'Settings', 'notifima' ), 'subtab' => 'automation' ),
    'subscribers-list'  => array( 'name' => __( 'Subscriber List', 'notifima' ), 'subtab' => '' ),
    'inventory-manager' => array( 'name' => __( 'Inventory Manager', 'notifima' ), 'subtab' => '' ),
);

foreach ( $submenu_items as $slug => $submenu_item ) {
    $subtab = $submenu_item['subtab'] ? '&subtab=' . $submenu_item['subtab'] : '';
    add_submenu_page( 'notifima', $submenu_item['name'], /* ... */, 'manage_options', 'notifima#&tab=' . $slug . $subtab, '__return_null' );
}
```

Each submenu link's callback is `'__return_null'` — the actual page body is always `create_setting_page()`'s single mount div; only the URL hash differs, and the React app reads it client-side. `remove_submenu_page( 'notifima', 'notifima' )` (`classes/Admin.php:122`) then hides the redundant first auto-generated submenu entry (WordPress always adds one matching the parent slug).

There is **no `multivendorx_submenus`-style filter** here for a third party to register an additional tab — the four tabs above are the complete, hardcoded list. A "Go Pro" submenu is conditionally added (`! Utill::is_khali_dabba()`, `classes/Admin.php:104-120`) pointing at an external redirect handler.

## Tab routing, client-side

`src/index.tsx` mounts one React root into `#admin-main-wrapper`:

```tsx
render( <BrowserRouter><App /></BrowserRouter>, document.getElementById( 'admin-main-wrapper' ) );
```

`src/app.tsx`'s `Route` component (`src/app.tsx:15-33`) reads the `tab` param from the URL hash and switches over a **hardcoded** set of four components — no per-module registry, no `require.context` scan (contrast with `multivendorx`'s admin app, see that plugin's own `docs/integration/`):

```tsx
const currentTab = new URLSearchParams(useLocation().hash);
return (
    <>
        {currentTab.get('tab') === 'dashboard' && <AdminDashboard />}
        {currentTab.get('tab') === 'settings' && <Settings id={'settings'} />}
        {currentTab.get('tab') === 'subscribers-list' && <SubscribersList />}
        {currentTab.get('tab') === 'inventory-manager' && <Managestock />}
    </>
);
```

Adding a fifth admin tab means: a new `add_submenu_page()` entry in `Admin::register_admin_menus()`, a new branch in this `Route` switch, and a new component under `src/components/`. There's no other registration step.

## Product-list integration

Separately from the tab-based dashboard, `Admin.php`'s constructor (`classes/Admin.php:24-53`) wires several WooCommerce product-screen hooks:

- A custom **Products list column** (`manage_edit-product_columns` / `manage_product_posts_custom_column`, `classes/Admin.php:212-227`) showing subscriber count per product.
- A **subscriber count readout** inside the product edit screen's Inventory panel (`woocommerce_product_options_inventory_product_data`) and inside each variation's metabox (`woocommerce_product_after_variable_attributes`), both read-only (`classes/Admin.php:232-266`).
- A **"Mark as discontinued" checkbox** on both the simple-product Inventory panel (`woocommerce_product_options_stock`) and each variation panel (`woocommerce_variation_options_dimensions`), saved via `woocommerce_admin_process_product_object`/`woocommerce_save_product_variation` into the `Utill::NOTIFIMA_PRODUCT_META['product_discontinued']` postmeta key (`classes/Admin.php:324-372`) — when set, `FrontEnd::display_product_subscription_form()` skips rendering the subscribe form for that product/variation entirely (`classes/FrontEnd.php:65-67`, `109-111`).
- A **bulk action** ("Remove Subscribers") on the Products list (`bulk_actions-edit-product`/`handle_bulk_actions-edit-product`, `classes/Admin.php:140-171`) that unsubscribes every subscriber of the selected products and clears their cached subscriber count.

## Script loading

`Admin::enqueue_admin_assets()` (`classes/Admin.php:192-204`, hooked on `admin_enqueue_scripts`) only loads the full admin bundle (`notifima-components-script`, `notifima-admin-script`) when `get_current_screen()->id === 'toplevel_page_notifima'` — i.e. only on this plugin's own page, not on every wp-admin screen. `notifima-admin-style` loads unconditionally (used by the Products-list column/metabox additions above, which render on the product edit screen, not just the Notifima page). See `classes/FrontendScripts.php` for the actual `wp_register_script`/`wp_localize_script` calls, and [filters-hooks/filters.md](../filters-hooks/filters.md) for the `admin_notifima_register_scripts`/`admin_notifima_register_styles` filters those calls run through (flagged there as prefix-order naming outliers).
