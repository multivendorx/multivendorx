# Dashboard Component Registration

## Overview

This plugin has **two separate mount points** (admin page and vendor dashboard — see [../admin/dashboard.md](../admin/dashboard.md) and [../frontend/store-dashboard.md](../frontend/store-dashboard.md)), each with its own, different mechanism for wiring a module's React component into place. Neither is a central menu/route file you hand-edit — both are convention-based — but they're **not the same convention**, which is easy to get wrong if you assume one implies the other.

## Admin page: `require.context` + a global route registry

Every module's `modules/{Module}/src/index.(ts|tsx)` gets auto-loaded as a side-effect import:

```tsx
// src/app.tsx:22-29
const modulesContext = require.context('../modules', true, /\/src\/index\.(ts|tsx)$/);
modulesContext.keys().forEach(modulesContext);
```

**To add a new admin tab for your module:**

1. Create `modules/{YourModule}/src/index.tsx`.
2. Inside it, import your tab component and call the global registrar:
   ```tsx
   import YourComponent from './YourComponent';
   window.registerMultiVendorXRoute({ tab: 'your-module-slug', component: YourComponent });
   ```
3. Make sure `'your-module-slug'` matches the key you use for your `multivendorx_submenus` filter entry (see [../admin/dashboard.md](../admin/dashboard.md)) — that's what puts the sidebar link in place; the route registration is what makes clicking it actually render something.
4. Nothing else to edit — `app.tsx`'s `require.context` glob picks up any matching file automatically.

## Vendor dashboard: filename convention, not `require.context`

This is the part that differs from both the admin page above and from `multivendorx-pro`'s own modules. There's **no bulk auto-load** for store-dashboard components — `storeDashboard.tsx`'s `loadComponent()` does a single, specific dynamic `require()` per lookup:

```tsx
const DashboardComponent = require(`./dashboard/${convertedKey}.tsx`).default;
```

**To add a new store-dashboard tab for your module:**

1. Add your menu entry via the `dashboard_other_endpoints` filter (see [../frontend/store-dashboard.md](../frontend/store-dashboard.md)), with a `filename` field — e.g. `'filename' => 'my-feature'`.
2. Put your component directly under this plugin's own `src/dashboard/` folder (not `modules/{YourModule}/src/`), named to match the camelCased version of that `filename`: `'my-feature'` → `src/dashboard/myFeature.tsx`, default export.
3. If your component instead lives in `modules/{YourModule}/src/`, it will **only** be found via the third, fallback tier of the resolution chain — `applyFilters('multivendorx_pro_dashboard_component', null, convertedKey)` — which is `multivendorx-pro`'s own extension filter, not something this plugin's own modules can rely on being hooked. In practice: this plugin's own 19 modules keep their store-dashboard components in `src/dashboard/` alongside the core tabs (e.g. `Announcement`'s admin route lives in `modules/Announcement/src/index.tsx`, but its store-dashboard table component is `src/dashboard/AnnouncementsTable.tsx` — two different locations for the same module's two different surfaces).

## Why these differ

The admin page's `require.context` approach existed to let modules bundle-split their own admin tab without a central file to edit. The store-dashboard's direct-`require()`-by-filename approach predates that, and keeping components centralized under `src/dashboard/` was already the existing pattern by the time the module system matured — this doc describes what's actually there today, not a recommendation to unify them (that would be a deliberate refactor, out of scope for documentation).
