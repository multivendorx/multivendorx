# Plugin Structure

## Scope

An orientation map of `multivendorx`'s real directory layout and how the pieces wire together — read this first, before the topic-specific docs elsewhere in this folder. This is the **free/base-tier** plugin: it owns the mechanisms that the four "Pro" plugins (`multivendorx-pro` and friends, in the parent monorepo) extend — the module loader, the actual React mount points, the REST namespace, and the custom database tables. If you're building an add-on for this plugin (not a Pro plugin), this is the surface you're extending directly.

## Directory layout

```
multivendorx/plugins/multivendorx/
├── dc_product_vendor.php       # Main plugin file — legacy filename (see Naming note below), loads Composer autoloader, calls MultiVendorX() once
├── config.php                  # Plugin-wide constants (version, text domain, WordPress.org slug)
├── classes/                    # Root PHP: bootstrap, admin/frontend, module loader, REST dispatcher, DB, licensing-check helpers
│   ├── MultiVendorX.php          #   The singleton bootstrap (see container.md) — fires `multivendorx_loaded` once booted
│   ├── Admin.php                  #   wp-admin page: add_menu_page() + per-tab add_submenu_page() + multivendorx_submenus filter (see admin/dashboard.md)
│   ├── Frontend.php               #   Storefront/vendor-dashboard script enqueue + WC hooks (see frontend/store-dashboard.md)
│   ├── Modules.php                #   The module discovery/loader itself — every Pro plugin's modules/ tree plugs into this
│   ├── Install.php                #   Versioned migrations (see data-store.md)
│   ├── Utill.php                  #   Static helpers, incl. TABLES/MULTIVENDORX_SETTINGS registries and get_template() (see feature-override/)
│   ├── Setting.php                #   Settings read/write, options-table-backed
│   ├── Roles.php                  #   Custom roles/capabilities
│   ├── Order/, Store/, Commission/, Transaction/, Payments/, Notifications/, Migration/  # domain namespaces
│   ├── Deprecated/                #   DeprecatedFilterHooks / DeprecatedActionHooks — old hook names kept firing for backward compatibility
│   └── RestAPI/                   #   Rest.php dispatcher + Controllers/ (see api/api.md)
├── modules/                     # 19 addon modules, each Module.php + whichever of Admin/Frontend/Rest/Widgets/Tags/src/ it needs
│                                  #   (see .claude/rules/module-architecture.md at the parent repo root for the loading mechanism)
├── src/                          # React/TypeScript — TWO real mount points, both owned here (see admin/dashboard.md, frontend/store-dashboard.md)
│   ├── app.tsx                     #   Admin panel (#admin-main-wrapper): require.context-loads modules/*/src/index.tsx, tab routing via routeRegistry.ts
│   ├── storeDashboard.tsx          #   Vendor dashboard (#multivendorx-store-dashboard): REST-driven menu, 3-tier component resolution
│   ├── routeRegistry.ts, routes.ts #   window.MULTIVENDORX_ROUTES global registry + this plugin's own base admin tabs
│   ├── dashboardConfig.ts          #   Small filtered set of store-dashboard "detail view" routes (product/order add/edit)
│   ├── dashboard/                  #   This plugin's own store-dashboard tab components (see frontend/store-dashboard.md)
│   ├── components/                 #   Admin-side tab components (Settings, Stores, Commissions, Reports, etc.)
│   └── index.tsx                   #   Mounts both React roots (see below)
├── templates/                    # Server-rendered, theme-overridable PHP templates — much richer here than in any Pro plugin (see feature-override/)
├── packages/js/zyra (sibling, not under this plugin) # Shared UI kit + initializeModules()/useModules zustand store — see container.md
├── languages/                    # .pot/.json translation files
└── docs/                          # You are here
```

**Naming note**: the main plugin file is `dc_product_vendor.php`, not `multivendorx.php` — a holdover from this plugin's pre-rebrand name ("WooCommerce Product Vendors" / "dc-woocommerce-product-vendor"). The WordPress.org plugin slug (`MULTIVENDORX_WORDPRESS_SLUG` in `config.php`) is also still `dc-woocommerce-multi-vendor`, and the theme-override folder used by `Utill::get_template()` is `dc-woocommerce-product-vendor/` (see [feature-override/README.md](feature-override/README.md)) — three different places this legacy name survives. Don't "fix" these to match the current `multivendorx` branding as a side effect of unrelated work; each is a real backward-compatibility surface (a renamed main file breaks the plugin's WordPress.org listing tie-in and any code referencing the old basename; a renamed slug breaks existing installs' stored option keys that use it; a renamed theme-override folder breaks every site with an existing theme override in place).

19 modules exist under `modules/` as of this writing (`ls modules | wc -l`) — re-count before quoting this elsewhere.

## How it boots

`dc_product_vendor.php` requires the Composer autoloader, then calls `MultiVendorX()` — the one global accessor for this plugin — exactly once:

```php
// dc_product_vendor.php
require_once __DIR__ . '/vendor/autoload.php';

function MultiVendorX() {
    return \MultiVendorX\MultiVendorX::init( __FILE__ );
}

MultiVendorX();
```

Unlike `multivendorx-pro` (which defers all heavy init behind a license check and the free plugin's own `multivendorx_loaded` action), this **is** the base plugin — there's no other plugin to wait for. `MultiVendorX::__construct()` (`classes/MultiVendorX.php:49-`) still keeps the constructor cheap (just seeds `plugin_url`/`plugin_path`/`version`/`rest_namespace` into the container), but the heavy `init_classes()` call is hooked directly on WordPress's own `init` action at priority `0` — the earliest is practical, since nothing else needs to fire first:

```php
// classes/MultiVendorX.php:130
add_action( 'init', array( $this, 'init_classes' ), 0 );
```

`init_classes()` (`classes/MultiVendorX.php:148-183`) populates the container with every core service — `util`, `setting`, `admin`, `frontendScripts`, `shortcode`, `frontend`, `roles`, the deprecated-hooks shims, `commission`, `order`, `rest`, `payments`, `store`, `transaction`, `modules`, `status`, `product`, `coupon`, `cron`, `block`, `notifications`, `widgets`, `pattern`, `tracker`, `promotions`, `migration` — then calls `$this->container['modules']->load_active_modules()` to actually load every active module (own 19, plus any Pro plugin's modules registered via the `multivendorx_module_sources` filter), and finally fires:

```php
do_action( 'multivendorx_loaded' );
```

**This is the hook every Pro plugin's bootstrap waits for** before doing its own `init_classes()` — see the parent repo's `.claude/rules/plugin-families.md` for the full picture of that dependency direction.

## Where each doc fits

| Folder/file on disk | What it is | Documented in |
|---|---|---|
| `classes/MultiVendorX.php`'s container pattern | Singleton + array-container + magic accessor | [container.md](container.md) |
| `classes/Admin.php` + `src/app.tsx`/`routeRegistry.ts`/`routes.ts` | wp-admin `MultiVendorX` page: menu, per-tab submenu pages, hash-based tab routing, `multivendorx_submenus` filter | [admin/dashboard.md](admin/dashboard.md) |
| `classes/Frontend.php` + `src/storeDashboard.tsx`/`dashboardConfig.ts` | Vendor store dashboard + storefront-facing hooks, REST-driven dashboard menu, 3-tier component resolution | [frontend/store-dashboard.md](frontend/store-dashboard.md) |
| `classes/RestAPI/Rest.php` + `Controllers/` | How to build a REST controller in this codebase's pattern | [api/api.md](api/api.md) |
| `classes/Install.php`, `Utill::TABLES` | Custom `$wpdb` tables and versioned migrations | [data-store.md](data-store.md) |
| `templates/`, `Utill::get_template()` | Theme-override mechanism — much richer here than in any Pro plugin | [feature-override/](feature-override/) |
| `classes/Order/Hooks.php`'s WooCommerce Analytics clause filters | Excluding sub-orders from vendor-facing WC Analytics reports | [analytics/reports.md](analytics/reports.md) |
| `src/app.tsx`'s module `require.context` + `window.registerMultiVendorXRoute` | Module dashboard-component auto-registration, admin side | [integration/dashboard-component-registration.md](integration/dashboard-component-registration.md) |
| `classes/Modules.php` | The module discovery/loader itself (internal-facing detail, covered at the parent repo's `.claude/rules/module-architecture.md`, not duplicated here) | — |
| Every `do_action()`/`apply_filters()`/`addFilter()` in `classes/`, `modules/`, `src/` | The full hook/extension-point reference | [filters-hooks/](filters-hooks/) |

## What's deliberately not here

This file is a map, not an architecture essay — it doesn't re-explain the module discovery/loading mechanism in depth (the parent repo's `.claude/rules/module-architecture.md` already covers that for anyone building a module, whether for this plugin or a Pro plugin). It also doesn't restate anything from the table above — follow the links.
