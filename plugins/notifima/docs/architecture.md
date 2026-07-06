# Plugin Structure

## Scope

An orientation map of `notifima`'s real directory layout and how the pieces wire together — read this first, before the topic-specific docs elsewhere in this folder. This is the **free/base-tier** back-in-stock notification plugin (`multivendorx/plugins/notifima/`) — the commercial `notifima-pro` plugin (parent monorepo, `plugins/notifima-pro/`) extends it, but only through the JS filter hooks documented in [integration/pro-extension-points.md](integration/pro-extension-points.md); there is **no PHP-level `use Notifima\...` coupling** the way `multivendorx-pro` depends on the free `multivendorx` plugin. `notifima-pro` has no `modules/` directory either — see the parent repo's `.claude/rules/plugin-families.md`.

## Directory layout

```
multivendorx/plugins/notifima/
├── product_stock_alert.php     # Main plugin file — legacy filename (see Naming note below), loads Composer autoloader, calls Notifima() once
├── config.php                  # Plugin-wide constants (NOTIFIMA_PRO_SHOP_URL, NOTIFIMA_PLUGIN_VERSION, NOTIFIMA_PLUGIN_SLUG)
├── classes/                    # Root PHP, flat — no modules/ addon system (see plugin-families.md)
│   ├── Notifima.php               #   The singleton bootstrap (see container.md) — fires `notifima_loaded` once booted
│   ├── Admin.php                   #   wp-admin page: add_menu_page() + per-tab add_submenu_page(), hash-based tabs (see admin/dashboard.md)
│   ├── FrontEnd.php                #   Storefront hooks: renders the subscribe form on product pages (see frontend/subscription-forms.md)
│   ├── FrontendScripts.php         #   Script/style registration + wp_localize_script(), shared by admin and frontend
│   ├── Shortcode.php                #   [notifima_subscription_form] shortcode
│   ├── Block.php                    #   Gutenberg block discovery/registration (scans assets/js/block/*)
│   ├── Subscriber.php               #   Core domain logic: subscribe/unsubscribe, in-stock notification cron, WPML translation fan-out
│   ├── Setting.php                  #   Settings read/write, options-table-backed, in-request cache
│   ├── Install.php                  #   Versioned migrations + the one custom table (see data-store.md)
│   ├── Utill.php                    #   Static helpers: TABLES-equivalent constants, get_template(), nonce validation, license check
│   ├── Emails/                       #   Three WC_Email subclasses (admin alert, subscriber confirmation, back-in-stock notice)
│   ├── Deprecated/                   #   DeprecatedActionHooks / DeprecatedFilterHooks — legacy hook names kept firing (see filters-hooks/README.md)
│   └── RestAPI/                     #   Rest.php dispatcher + Controllers/ (see api/api.md)
├── src/                          # React/TypeScript — ONE mount point (#admin-main-wrapper), plus Gutenberg blocks
│   ├── index.tsx                    #   Mounts the admin React root (see admin/dashboard.md)
│   ├── app.tsx                       #   Admin app shell: hardcoded tab switch on a URL hash param, no per-module registry (see admin/dashboard.md)
│   ├── components/                   #   Settings, SubscriberList, Managestock, AdminDashboard tab components
│   └── blocks/                       #   subscribe-form (customer-facing) + stock-notification-block (admin/editor-facing) Gutenberg blocks
├── templates/emails/{html,plain}/  # Theme-overridable email templates — the only overridable templates in this plugin (see feature-override/)
├── tests/                        # PHPUnit scaffold (see the parent repo's .claude/rules/testing.md for the general state of this across plugins)
├── languages/                    # .pot/.json translation files
└── docs/                          # You are here
```

**Naming note**: the main plugin file is `product_stock_alert.php`, and its declared `Text Domain` is `notifima` — but the plugin's own theme-override folder (`Utill::get_template()`) still uses the legacy name `woocommerce-product-stock-alert/`, and the block textdomain path checked in `Admin::textdomain_relative_path()` (`classes/Admin.php:279`) checks for the substring `woocommerce-product-stock-alert` too. This plugin has been renamed at least twice in its history (`Deprecated/DeprecatedActionHooks.php`'s hook map references `dc_wc_product_stock_alert_*`, `woo_stock_alert_*`, `stock_manager_*`, and `notifima_*` — four naming generations of the same hooks). Don't "fix" the legacy theme-override folder name as a side effect of unrelated work — it's a real backward-compatibility surface: renaming it breaks any site with an existing theme override in place (see [feature-override/README.md](feature-override/README.md)).

## How it boots

`product_stock_alert.php` requires the Composer autoloader, then calls `Notifima()` — the one global accessor for this plugin — exactly once:

```php
// product_stock_alert.php
require_once __DIR__ . '/vendor/autoload.php';

function Notifima() {
    return \Notifima\Notifima::init( __FILE__ );
}

Notifima();
```

Unlike `multivendorx-pro` (which waits on the free `multivendorx` plugin's `multivendorx_loaded` action before doing anything heavy), this **is** the base plugin for its product line — there's no sibling free plugin to wait for. But it does wait on **WooCommerce**: `Notifima::__construct()` (`classes/Notifima.php:49-76`) keeps the constructor cheap (container seeding, activation/deactivation hook registration, HPOS compatibility declaration on `before_woocommerce_init`), and defers real initialization to `woocommerce_loaded`:

```php
// classes/Notifima.php:72
add_action( 'woocommerce_loaded', array( $this, 'init_plugin' ) );
```

`init_plugin()` (`classes/Notifima.php:168-174`) calls `init_classes()`, registers the plugin's three `WC_Email` subclasses onto WooCommerce's own `woocommerce_email_classes` filter, then fires:

```php
do_action( 'notifima_loaded' );
```

`init_classes()` (`classes/Notifima.php:182-196`) populates the container with every core service — `util`, `setting`, `frontend`, `shortcode`, `subscriber`, the two `Deprecated\*` shims, `admin`, `rest`, `block`, `frontendScripts` — plus `current_user`/`current_user_id` snapshotted once at init time. There is no module loader to invoke (no `modules/` tree in this plugin) — every service above is unconditionally instantiated, no active/inactive gating.

Separately, `handle_plugin_migration()` runs on `plugins_loaded` (`classes/Notifima.php:73`) and re-runs `new Install()` whenever the stored `notifima_version` option is behind `NOTIFIMA_PLUGIN_VERSION` — see [data-store.md](data-store.md).

## Where each doc fits

| Folder/file on disk | What it is | Documented in |
|---|---|---|
| `classes/Notifima.php`'s container pattern | Singleton + array-container + magic accessor | [container.md](container.md) |
| `classes/Admin.php` + `src/app.tsx`/`src/index.tsx` | wp-admin `Notifima` page: menu, per-tab submenu pages, hash-based tab routing | [admin/dashboard.md](admin/dashboard.md) |
| `classes/FrontEnd.php`, `Shortcode.php`, `Block.php` | Customer-facing subscribe form: product-page injection, `[notifima_subscription_form]` shortcode, two Gutenberg blocks | [frontend/subscription-forms.md](frontend/subscription-forms.md) |
| `classes/RestAPI/Rest.php` + `Controllers/` | How to build a REST controller in this codebase's pattern | [api/api.md](api/api.md) |
| `classes/Install.php`, `Utill::NOTIFIMA_SETTINGS` | The one custom `$wpdb` table and versioned migrations | [data-store.md](data-store.md) |
| `templates/emails/`, `Utill::get_template()` | Theme-override mechanism — email templates only | [feature-override/](feature-override/) |
| `src/index.tsx`'s `notifima_subscriber_list_table_props`/`notifima_manage_stock_table_props`/`notifima_pro_subscribe_form` filters | The three JS extension points `notifima-pro` hooks into | [integration/pro-extension-points.md](integration/pro-extension-points.md) |
| Every `do_action()`/`apply_filters()`/`applyFilters()` in `classes/`, `src/` | The full hook/extension-point reference, plus the `Deprecated\*` legacy-hook shim mechanism | [filters-hooks/](filters-hooks/) |

## What's deliberately not here

No `analytics/` section — this plugin has no WooCommerce Analytics report integration (verified: no `wc-analytics`/`WC_Admin_Report`/report-filter code anywhere in `classes/`). No `container.md`-style JS module registry either — the admin app (`src/app.tsx`) is a plain hardcoded tab switch, not a `require.context`-based per-module loader like `multivendorx`'s; see [admin/dashboard.md](admin/dashboard.md) for what's actually there instead. This file is a map, not an architecture essay — follow the links rather than expecting this page to restate their content.
