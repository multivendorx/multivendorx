# Hooks & Filters Reference

Three files, split by mechanism:

- [actions.md](actions.md) — every `do_action()` this plugin defines (7 hooks, excluding one WPML core pass-through)
- [filters.md](filters.md) — every `apply_filters()` this plugin defines (21 hooks, excluding three WPML core pass-throughs)
- [js-extension-points.md](js-extension-points.md) — every JS/TS `@wordpress/hooks` `applyFilters`/`addFilter` call in `src/` (3 filters, all consumed by `notifima-pro`)

This plugin's hook count is small enough (~30 total) that each file uses **one `##`/`###` heading per hook**, grouped into feature-domain sections with a table of contents — the same format `multivendorx-pro`'s docs use, not the domain-table format the much larger free `multivendorx` plugin's docs use (see that plugin's own `filters-hooks/README.md` for why the format changes at higher hook counts).

## Naming convention

New PHP hooks in this codebase are prefixed `notifima_` (snake_case), per the parent repo's `.claude/rules/php-wordpress.md`. This plugin has an unusually long naming history — four generations of the same product under different names (`dc_wc_product_stock_alert_*` → `woo_stock_alert_*`/`woo_product_stock_alert_*` → `stock_manager_*` → `notifima_*`, visible in `classes/Deprecated/DeprecatedActionHooks.php` and `DeprecatedFilterHooks.php`'s old→new hook maps) — and several real, current-day naming outliers survive despite the rename to `notifima_*`. Each is flagged inline in `actions.md`/`filters.md`, not silently normalized:

- `notifima_pro_subscribers_list` (filters.md) — `_pro` infix, which this codebase's convention explicitly says not to use even in Pro-facing hook names.
- `admin_notifima_register_scripts` / `admin_notifima_register_styles` (filters.md) — prefix segments in reversed order (`admin_notifima_` instead of `notifima_admin_`).
- `product_backin_stock_send_admin` (filters.md) — no `notifima_` prefix at all, plus a `backin`/`back_in` spelling inconsistency against this plugin's own `ProductBackInStockEmail` class name.
- `kothay_dabba_notifima` (filters.md) — prefix segments in reversed order (product name at the end); a deliberately obscure name mirroring the `is_khali_dabba()`/`kothay_dabba` license-check convention used elsewhere in this product family, not a typo, but still a naming-order outlier.

Don't use any of these as a template for a new hook — new hooks should be `notifima_` snake_case, prefix first.

## Legacy hook compatibility shim

Beyond the naming outliers above, this plugin has a **real, structured backward-compatibility mechanism** neither `multivendorx` nor `multivendorx-pro`'s docs need to cover: `classes/Deprecated/DeprecatedActionHooks.php` and `DeprecatedFilterHooks.php` both extend WooCommerce core's own `\WC_Deprecated_Hooks` base class, and declare a `$deprecated_hooks` map of `'current_hook_name' => 'old_hook_name'`. When the *current* hook fires, the shim checks whether anything is still listening on the corresponding *old* name (`has_action()`/`has_filter()`) and — if so — re-fires the old name with the same arguments and logs a deprecation notice, so a site with old third-party code still hooked to a pre-rename tag keeps working.

7 action hooks and 23 filter hooks have a legacy alias registered this way as of this writing — see the `$deprecated_hooks` array in each `Deprecated/*.php` file directly for the complete current-to-legacy name map (not duplicated in full here, since it's already a complete, authoritative list in the source). A few representative entries:

| Current hook | Legacy alias it also fires | Deprecated since |
|---|---|---|
| `notifima_loaded` (action) | `stock_manager_loaded` | 2.5.17 |
| `notifima_before_subscribe_product` (action) | `stock_manager_before_subscribe` | 2.5.17 |
| `notifima_after_save_settings` (action) | `stock_manager_settings_after_save` | 2.5.17 |
| `notifima_register_settings_keys` (filter) | `stockmanager_register_settings_keys` | 2.5.17 |
| `notifima_all_subscribers_list` (filter) | `stock_alert_subscribers_list_data` | 2.5.17 |

If you're extending this plugin against an old tutorial/snippet that references a `woo_stock_alert_*`/`stock_manager_*`/`dc_wc_product_stock_alert_*` name, check these two files before assuming the hook no longer exists — it likely still fires, just as a deprecated alias of a `notifima_*` hook documented in `actions.md`/`filters.md`.

## Third-party and pass-through hooks

Calls that re-fire a WPML core hook tag (rather than defining a new one) are excluded from the domain sections below, listed instead at the end of `actions.md` and `filters.md`.
