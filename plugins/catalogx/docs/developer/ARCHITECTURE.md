# Architecture

## Bootstrap

`catalogx.php` (the plugin's main file, actually named `Woocommerce_Catalog_Enquiry.php` on disk) calls the global accessor `CatalogX()` once, which lazily creates the `CatalogX` singleton (`classes/CatalogX.php`). The constructor sets up a plain-array `$services` container (`plugin_url`, `plugin_path`, `rest_namespace`, `version`, …) and registers hooks — it does **not** do heavy work itself:

```php
add_action( 'before_woocommerce_init', array( $this, 'declare_compatibility' ) ); // HPOS
add_action( 'woocommerce_loaded', array( $this, 'load_plugin' ) );                // real init, deferred
add_action( 'plugins_loaded', array( $this, 'handle_plugin_migration' ) );
add_action( 'init', array( $this, 'load_plugin_textdomain' ) );
```

`load_plugin()` (fired once WooCommerce itself is loaded) is where `init_classes()`-equivalent work happens — instantiating `Admin`, `Frontend`, `FrontendScripts`, `RestAPI\Rest`, `Modules`, `Setting`, `Promotions`, `SetupWizard`, `Shortcode`, `Block`.

Unlike `multivendorx-pro`, **catalogx has no PHP-level dependency on a separate free plugin** — it's a single, self-contained codebase. There's no `*_loaded` gate to wait on from an external plugin.

## Container access

Everywhere else in the codebase, reach plugin-wide services through the global accessor: `CatalogX()->setting`, `CatalogX()->util` is not a thing here — static helpers live on `Utill` directly (`CatalogX\Utill::current_user_has_capability(...)`), not behind the container.

## Module system

Covered in depth in [MODULES](MODULES.md). Short version: `classes/Modules.php` is **this plugin's own** module loader (catalogx doesn't defer to a separate free plugin's loader the way `multivendorx-pro` does) — it scans `modules/` for `{Folder}/Module.php`, and `catalogx-pro` registers its own `modules/` path into the same loader via the `catalogx_module_sources`-style filter mechanism.

## React frontend

`src/index.tsx` mounts into `#admin-main-wrapper` for the wp-admin dashboard. Settings screens are declarative config objects (`src/components/Settings/*.ts` — arrays of `{ key, type, label, ... }` field descriptors), rendered by Zyra's `InputRenderer`/`NavigatorComponent`, the same pattern `multivendorx` uses. `catalogx-pro`'s own `src/index.tsx` registers extension filters and dynamically loads its own `modules/*/src/` entries gated by `appLocalizer.active_modules` — it doesn't mount a second React root.

## REST

`classes/RestAPI/Rest.php` is the plugin-level dispatcher — `Settings`, `Tour`, and `Logs` controllers register through it, plus one ad hoc `/buttons` route. Module-level REST (`modules/Enquiry/Rest.php`, `modules/Quote/Rest.php`) self-hooks `rest_api_init` independently. See [REST-API](REST-API.md).

## Hooks

Prefixed `catalogx_`, registered inside the constructor of whichever class owns the callback — same convention as every other plugin in this workspace. No central hook registry.
