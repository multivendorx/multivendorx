# multivendorx developer docs

Developer-facing reference documentation for extending `multivendorx`, the free/base-tier WooCommerce multivendor marketplace plugin. This is separate from the parent monorepo's `.claude/rules/` (internal AI guidance) — this `/docs` folder is for third-party developers building on top of the plugin. Mirrors the same section breakdown as `multivendorx-pro`'s own `docs/` folder (in the parent repo, `plugins/multivendorx-pro/docs/`), adapted to what this plugin actually owns — since this is the **base** plugin, several sections here describe the real mechanism itself rather than just how Pro extends it.

## Contents

| Section | Covers |
|---|---|
| [architecture.md](architecture.md) | **Start here.** Real directory layout (`classes/`, `modules/`, `src/`), the bootstrap/module-loading chain (including the exact hook, `multivendorx_loaded`, every Pro plugin waits for), and a table linking each folder to the doc section that covers it. |
| [admin/dashboard.md](admin/dashboard.md) | The wp-admin `MultiVendorX` page: `add_menu_page()` + a real `add_submenu_page()` per tab (all pointing at the same page via URL hash), the `multivendorx_submenus` filter, notification-count badges, and the `window.registerMultiVendorXRoute` hash-based tab-routing mechanism this plugin owns. |
| [frontend/store-dashboard.md](frontend/store-dashboard.md) | The vendor-facing store dashboard: `template_include`-based page takeover, the REST-driven dashboard menu (with a real "saved Menu Manager setting silently overrides your filter" gotcha), and the 3-tier component-resolution chain (`multivendorx_dashboard_routes` → direct `src/dashboard/` require → Pro's fallback filter). |
| [api/api.md](api/api.md) | How to build a REST controller in this plugin's real pattern (no shared base class), with real example controllers — including a flagged security note on an unconditional `return true;` permission check found on the Stores controller's GET routes. |
| [filters-hooks/](filters-hooks/) | Every PHP action/filter hook and JS/TS extension point this plugin defines — 3 files by mechanism, ~250 hooks total, organized into domain tables (a deliberate format change from `multivendorx-pro`'s docs given the much larger hook count — see [filters-hooks/README.md](filters-hooks/README.md)). Includes a documented list of real naming-convention violations found (reversed prefixes, missing prefixes, a typo, tag-name collisions) and one likely bug (a filter whose return value is never used). |
| [container.md](container.md) | The singleton + array-container + magic-accessor pattern this plugin's bootstrap uses — plus a real behavioral difference from `multivendorx-pro`'s equivalent (`WP_Error` return vs. thrown exception on an unknown key) worth knowing when debugging. |
| [data-store.md](data-store.md) | The `Utill::TABLES`/`MULTIVENDORX_SETTINGS`/`ACTIVE_MODULES_DB_KEY` registries this plugin owns (every Pro plugin references the same constants), and the versioned `Install.php` migration pattern, including a real additive-settings-backfill example. |
| [feature-override/](feature-override/) | The theme-override mechanism (`Utill::get_template()`) — 7 real overridable templates here (vs. 1 in `multivendorx-pro`), plus which templates in `templates/` are *not* theme-overridable despite living in the same folder. |
| [analytics/reports.md](analytics/reports.md) | How this plugin corrects WooCommerce Analytics' own reports to exclude multi-vendor sub-orders from double-counting, plus a low-stock report fix — a different mechanism from `multivendorx-pro`'s per-vendor-scoped analytics module. |
| [integration/dashboard-component-registration.md](integration/dashboard-component-registration.md) | The two *different* module-registration conventions for this plugin's two mount points (admin: `require.context` + global route registry; store dashboard: direct filename-matched `require()`, with Pro's filter as a last-resort fallback) — a recipe for adding a new module's dashboard entry to either. |

## What's genuinely different from `multivendorx-pro`'s docs folder

`multivendorx-pro` only ever *extends* the mechanisms this plugin defines — its own docs describe the Pro side of a filter, not the filter's origin. Reading both is useful in either order, but if you're building something for the free `multivendorx` plugin itself (not a Pro add-on), start here, not there.

## Adding a new section

Each section above was written from **verified, existing code** — grep/read the actual mechanism before writing anything, and don't invent a section for a topic that doesn't have a real equivalent in this plugin yet. See the parent repo's `developer-docs` skill (`.claude/skills/developer-docs/SKILL.md`) for the generation process.
