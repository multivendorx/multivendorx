# MultiVendorX (free-tier base) — Claude Code Guide

This directory is a **separate git repository** (`vulocartdev/multivendorx`) mounted as a submodule of the parent `multivendorx-pro` monorepo. It holds the free/base-tier WordPress plugins and the shared `zyra` React UI kit that every "Pro" plugin in the parent repo depends on.

**Git boundary**: edits to files here are fine and expected — Pro plugins are built against this code. But `git add`/`git commit`/`git push` **inside this directory only when explicitly asked**. When you do commit here, it's a separate commit in this repo's own history; the parent repo then needs its submodule pointer updated in a second, separate commit (see `DEVELOPER-DOC.md` in this directory for the exact workflow). Never run `git submodule update`/`git checkout` here without confirming — it can discard uncommitted work in this repo's working tree.

## Structure

```
multivendorx/
├── plugins/
│   ├── multivendorx/    free-tier marketplace plugin — see parent's rules for its architecture
│   ├── catalogx/         free-tier catalog plugin
│   ├── moowoodle/        free-tier Moodle bridge
│   └── notifima/         free-tier notification plugin
├── packages/js/zyra/     shared React component library — "zyra": "workspace:*" in every plugin's package.json
├── DEVELOPER-DOC.md      one-time env setup + new-plugin bootstrap recipe (composer, phpcs, PHPUnit scaffold)
├── README.md             currently a placeholder (one line) — not a source of truth
└── SECURITY.md           currently the unfilled GitHub template — not a real, maintained policy
```

## What lives here that Pro plugins depend on

- **`classes/Modules.php`** (in `plugins/multivendorx/classes/`) — the module discovery/loader every Pro plugin's `modules/` tree plugs into via the `multivendorx_module_sources` filter. See the parent repo's `.claude/rules/module-architecture.md`.
- **`classes/RestAPI/Controllers/`** — the REST controller set (`Stores.php`, `Commissions.php`, `Transactions.php`, `Settings.php`, `Dashboard.php`, `Status.php`, `Logs.php`, `Migrations.php`, `Notifications.php`, `Tour.php`, `Tracking.php`, `ImportDummyData.php`) under the `multivendorx/v1` namespace (`$this->container['rest_namespace']` in `classes/MultiVendorX.php`).
- **`classes/Utill.php`** — the canonical `TABLES` (custom `$wpdb` table names) and `MULTIVENDORX_SETTINGS` constants, plus `ACTIVE_MODULES_DB_KEY`.
- **`src/index.tsx`** (in `plugins/multivendorx/`) — the actual React mount point for both the admin panel (`#admin-main-wrapper`) and the vendor dashboard (`#multivendorx-store-dashboard`, dual-mode routed on `appLocalizer.permalink_structure`). Pro's own `src/index.tsx` only registers extension filters into this — it doesn't mount anything itself.
- **`packages/js/zyra`** — the shared UI kit (`*UI` component exports, `getApiResponse`/`sendApiResponse`/`getApiLink` API helpers, the zustand-backed `useModules`/`initializeModules` module registry in `src/contexts/ModuleContext.tsx`). Changes here affect all 8 plugins in the workspace — treat it as a shared library, not a per-plugin file.

## Module example richer than any Pro module

`plugins/multivendorx/modules/FollowStore/` — `Module.php` + `Frontend.php` + `Admin.php` + `Rest.php` + `Widgets/` + `Tags/` + `assets/`. Use this (not a Pro module) as the reference when a new free-side module needs widgets or shortcode tags in addition to the standard REST/Frontend split.

## Everything else

PHP/WordPress conventions, coding standards, i18n, testing, and security rules are identical to the parent repo's — see `../CLAUDE.md` and `../.claude/rules/*.md`. This file only covers what's specific to being inside the submodule.
