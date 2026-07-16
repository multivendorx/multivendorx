# notifima developer docs

Developer-facing reference documentation for extending `notifima`, the free/base-tier WooCommerce back-in-stock notification plugin. This is separate from the parent monorepo's `.claude/rules/` (internal AI guidance) — this `/docs` folder is for third-party developers building on top of the plugin. Mirrors the same section breakdown as `multivendorx`'s and `multivendorx-pro`'s own `docs/` folders, adapted to what this plugin actually owns — it's a much smaller plugin than either (no `modules/` system, one custom table, ~30 hooks total, one React mount point).

## Contents

| Section | Covers |
|---|---|
| [architecture.md](architecture.md) | **Start here.** Real directory layout (`classes/`, `src/`, `templates/`), the bootstrap chain (waits on `woocommerce_loaded`, fires `notifima_loaded`), and a table linking each folder to the doc section that covers it. |
| [admin/dashboard.md](admin/dashboard.md) | The wp-admin `Notifima` page: `add_menu_page()` + four hash-routed `add_submenu_page()` tabs, a hardcoded (not registry-based) client-side tab switch, plus the Products-list column/metabox/bulk-action integrations this plugin adds to the WooCommerce product edit screen. |
| [frontend/subscription-forms.md](frontend/subscription-forms.md) | The customer-facing "notify me" form: automatic product-page injection, the `[notifima_subscription_form]` shortcode, and two Gutenberg blocks — all funneling through one shared `FrontEnd::get_subscription_form()` renderer. |
| [api/api.md](api/api.md) | How to build a REST controller in this plugin's real pattern (no shared base class, two controllers plus one route registered ad hoc in the dispatcher itself) — including a flagged bug: a broken AJAX export action referenced by a localized URL but never registered. |
| [filters-hooks/](filters-hooks/) | Every PHP action/filter hook and JS extension point this plugin defines — 3 files by mechanism, ~30 hooks total, one heading per hook (this plugin's hook count didn't warrant the domain-table format the much larger free `multivendorx` plugin's docs use). Includes a documented list of real naming-convention violations (a `_pro` infix, two reversed-prefix hooks, a missing-prefix/spelling-inconsistent hook) and a full writeup of the `WC_Deprecated_Hooks`-based legacy-hook compatibility shim this plugin has that neither `multivendorx` nor `multivendorx-pro` needs. |
| [container.md](container.md) | The singleton + array-container + magic-accessor pattern this plugin's bootstrap uses (same `WP_Error`-on-unknown-key behavior as free `multivendorx`, not `multivendorx-pro`'s thrown-exception variant) — plus why this plugin has neither a PHP module loader nor a JS module registry. |
| [data-store.md](data-store.md) | The one custom `$wpdb` table (`notifima_subscribers`) plus the `NOTIFIMA_SETTINGS`/`NOTIFIMA_PRODUCT_META` registries, and the versioned `Install.php` migration pattern — including a real additive settings-reshape example and a flagged non-`prepare()`-based query. |
| [feature-override/](feature-override/) | The theme-override mechanism (`Utill::get_template()`) — but only 6 overridable templates here, and all of them are email templates (HTML/plain pairs for the plugin's three `WC_Email` subclasses); the subscribe-form markup itself is not theme-overridable. |
| [integration/pro-extension-points.md](integration/pro-extension-points.md) | How `notifima-pro` actually extends this plugin: no PHP coupling at all, just three JS filters (full-component-replacement, not additive), plus a note on a fourth filter `notifima-pro` registers into that belongs to `multivendorx-pro`, not this plugin. |

## What's not here, and why

- **No `analytics/` section** — verified, this plugin has no WooCommerce Analytics report integration (no `wc-analytics`/`WC_Admin_Report`/report-filter code found anywhere in `classes/`).
- **No dedicated component-library reference** — this plugin doesn't own `zyra`; that belongs in the submodule root, a separate topic (see the parent repo's `developer-docs` skill notes on this same omission for `multivendorx-pro`).
- **No TDD/testing guide** — a `tests/` directory exists as PHPUnit scaffolding but the parent repo's `.claude/rules/testing.md` gap (scaffolded, not populated, across every Pro plugin) applies here too; premature to document a testing guide before real tests exist.

## Adding a new section

Each section above was written from **verified, existing code** — grep/read the actual mechanism before writing anything, and don't invent a section for a topic that doesn't have a real equivalent in this plugin yet. See the parent repo's `developer-docs` skill (`.claude/skills/developer-docs/SKILL.md`) for the generation process.
