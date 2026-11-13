# Architecture

## Bootstrap

`moowoodle.php` calls the global accessor `MooWoodle()` once, which lazily creates the `MooWoodle` singleton (`classes/MooWoodle.php`). The constructor sets up a plain-array `$services` container (`plugin_url`, `plugin_path`, `rest_namespace`, `moowoodle_logs_dir`, `version`, …) and registers hooks — real init is deferred:

```php
add_action( 'before_woocommerce_init', array( $this, 'declare_compatibility' ) ); // HPOS
add_action( 'woocommerce_loaded', array( $this, 'load_plugin' ) );                // real init, deferred
add_action( 'init', array( $this, 'load_plugin_textdomain' ) );
add_action( 'plugins_loaded', array( $this, 'handle_plugin_migration' ) );
```

`load_plugin()` is where the rest of the plugin's classes get instantiated — `Admin`, `FrontendScripts`, `RestAPI\Rest`, `Setting`, `Installer`-triggered migration, `Cron`, `Endpoint`, `Promotions`, `Block`. Like `catalogx`, moowoodle has no PHP-level dependency on a separate free plugin — it's a self-contained codebase.

## Container access

Reach plugin-wide services through the global accessor: `MooWoodle()->setting`, `MooWoodle()->util` (an instance helper alongside the static `Util` class — some callers use `Util::method()` directly since most of `Util.php`'s methods are static).

## Core domain classes

`classes/Core/` holds the three main data-moving classes, each wrapping both the local WordPress/WooCommerce side and the remote Moodle side of one concept:

| Class | Responsibility |
|---|---|
| `Core/Course.php` | Pulls Moodle courses, creates/updates the matching WooCommerce products |
| `Core/Category.php` | Pulls Moodle course categories |
| `Core/Product.php` | The WooCommerce-product side of a synced course |

## The Moodle connection

All outbound calls to a configured Moodle site funnel through one class — see [MOODLE-CONNECTION](MOODLE-CONNECTION.md).

## React frontend

`src/index.tsx` mounts into the admin wrapper. Both the **Settings** tab and the **Synchronization** tab are declarative config objects (`src/components/Settings/*.ts`, `src/components/Synchronization/*.ts` — arrays of `{ key, type, label, ... }` field descriptors) discovered via `require.context` in `src/services/templateService.ts`, rendered by Zyra's `InputRenderer`/`NavigatorComponent` — the same pattern `multivendorx` and `catalogx` use. `moowoodle-pro`'s own `src/index.tsx` registers extension filters rather than mounting a second React root.

## REST

`classes/RestAPI/Rest.php` is the plugin-level dispatcher for every controller — there's no module-level REST here since there's no module system. See [REST-API](REST-API.md).

## Hooks

Prefixed `moowoodle_`, registered inside the constructor of whichever class owns the callback — same convention as every other plugin in this workspace. No central hook registry.
