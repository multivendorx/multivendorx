# VuloPilot — Dashboard widgets

Companion to [`DATABASE.md`](DATABASE.md), [`SCANNERS.md`](SCANNERS.md),
[`RULE-ENGINE.md`](RULE-ENGINE.md), [`AI-ARCHITECTURE.md`](AI-ARCHITECTURE.md),
and [`AI-ACTIONS.md`](AI-ACTIONS.md). Covers the 13 dashboard widgets, the
registry/grid the Dashboard page renders them through, the two REST
endpoints that back the grid (per-widget data and the drag-and-drop
layout), and the extension strategy.

## Why a widget system instead of one fixed page

The original Dashboard.tsx (built during the admin-UI pass) rendered a
fixed set of stat cards plus one chart plus one findings table. This pass
replaces that with 13 named, independently reorderable/hideable widgets —
Overall Health, SEO, Performance, Security, WooCommerce, Accessibility, AI
Usage, Recent Activity, Quick Fixes, Health Timeline, Latest Reports,
Pending Approval, Automation Status — because a fixed layout can't be
personalized and can't be extended by a Pro module without editing
Dashboard.tsx directly. A registry + grid gives both: a site owner
reorders/hides widgets, and Pro/third-party code adds new ones through a
filter, the same way every other extension point in this codebase works
(`vulopilot_scanner_sources`, `vulopilot_ai_action_sources`, etc.).

## Contracts (`src/dashboard-widgets/types.ts`)

```
DashboardSummary       the /dashboard aggregate payload (below)
WidgetProps            { summary, isLoading, onHide } — every widget component's props
WidgetDefinition        { id, title, icon, size, component } — what registry.ts registers
WidgetLayoutEntry       { id, enabled } — one row of a saved layout
```

No PHP-side `WidgetInterface` exists — widgets are a React rendering
concern with no server-side polymorphism behind them (unlike
`ScannerInterface`/`RuleInterface`/`AIActionInterface`, which really do
have many independent PHP implementations). Inventing a backend contract
for something that's purely "which React component renders in which grid
cell" would be exactly the kind of interface-with-one-real-shape
`SCANNERS.md`'s "no `ScanResultInterface`" reasoning already argues
against.

## The two widget kinds

**Stat widgets** (`StatWidget.tsx`) — the seven "one number + one label"
widgets (Overall Health, SEO, Performance, Security, WooCommerce,
Accessibility, AI Usage, Quick Fixes — eight, see note below) are each a
plain `StatWidgetConfig` object (`registry.ts`), not eight separate
component files — the same declarative-config-over-hand-built-JSX
approach [react-frontend.md](../../../.claude/rules/react-frontend.md)
documents for Settings screens, applied here. `createStatWidgetComponent()`
binds one config into a component matching `WidgetProps`, so the grid
never has to know a widget is config-driven.

**Standalone widgets** — Recent Activity, Health Timeline, Latest Reports,
Pending Approval, Automation Status each have real layout differences (a
list, a chart, counts plus a list) and fetch their own data, so each gets
its own component file rather than being forced into the stat-config
shape.

Every widget, of either kind, renders inside `DashboardWidget.tsx` — the
one shell providing the header, loading skeleton, drag handle, and hide
control, so none of that is reimplemented per widget.

## `GET /dashboard` — the stat widgets' shared payload

`Controllers/Dashboard.php` returns one aggregate object rather than one
REST call per stat widget (`.claude/rules/performance.md`'s "prefer a
single query" guidance, applied to the frontend's fetch pattern too):

```
overall_score, open_findings, critical_findings, active_automations,
ai_jobs_used, ai_jobs_quota,
category_scores: { seo, performance, security, accessibility, woocommerce }
quick_fixes, pending_approvals,
automation_status: { enabled, disabled }
```

### `category_scores` is computed live, not read from a stored column

`vulopilot_site_health_snapshots` already has `seo_score`/
`performance_score`/`security_score` columns (`DATABASE.md`), but nothing
in this codebase writes them —
`ScanPersistenceListener::refresh_todays_snapshot()` only ever upserts
`overall_score`. Reading those columns here would always return `null`,
indistinguishable from "feature not implemented," which is exactly the
kind of fabricated-looking number this same controller already refuses to
show for AI usage (`ai_jobs_used`/`ai_jobs_quota` are honestly `0`/`0`
until a real usage-metering subsystem exists). Instead each category score
uses `FindingRepository::get_severity_breakdown_for_category()` and the
identical weighting `calculate_overall_score()` already uses, just scoped
to one category's open findings — a real, honest number computed from
data that already exists, not a placeholder.

`woocommerce` is `null` (not `0`) when `class_exists('WooCommerce')` is
false — the same guard `WooCommerceScanner` already uses (`SCANNERS.md`)
— so the WooCommerce widget can show "not active" instead of a misleading
perfect or zero score for a category that doesn't apply to the site.

### `quick_fixes` is honest about what's actually wired up

"Quick Fixes" counts open findings in a category that has a matching
one-click `AIAction` already registered — today that's exactly one pairing
(`images` findings ↔ the `generate-alt` action), the same by-convention id
match [`AI-ACTIONS.md`](AI-ACTIONS.md)'s "Recommendations as an input
source" section documents. It is not a general "all fixable findings"
count, because there's no formal Recommendation → Action mapping yet —
counting more than the one real pairing would overstate what VuloPilot can
actually do today.

## List-shaped widgets call their own endpoints

Recent Activity, Latest Reports, Pending Approval, and Automation Status's
row list are **not** part of the `/dashboard` payload — each calls the
same dedicated list endpoint its full page already uses
(`/activity-logs`, `/reports`, `/automations`), capped to 5 rows via
`per_page`, through the existing `useApiList` hook. Health Timeline calls
`/site-health-snapshots` the same way the original Dashboard.tsx already
did. This avoids duplicating list data inside the summary aggregate and
keeps each widget's data source identical to its full-page equivalent.

### `GET /ai-action-runs` — new, read-only

Pending Approval needed a way to list `vulopilot_ai_action_runs` rows,
which had no REST controller yet (`AI-ACTIONS.md`'s "What's not here yet"
explicitly lists the full propose/approve/reject/rollback REST surface as
unbuilt). `Controllers/AiActionRuns.php` adds only `get_items()` — a plain
list endpoint, the same shape as `AiHistory`/`Reports`'s own read-only
`get_items()`. It does not build approve/reject/rollback routes; those
still don't exist, and `PendingApprovalWidget.tsx` deliberately renders no
Approve/Reject buttons for that reason — buttons calling a route that
doesn't exist would be exactly the placeholder code this codebase's
guidelines rule out.

## Drag-and-drop layout: `GET`/`POST /dashboard-layout`

Persisted as **user meta** (`Utill::DASHBOARD_LAYOUT_META_KEY`), not a row
in `VULOPILOT_SETTINGS_KEY`'s shared `wp_options` settings blob — a widget
arrangement is a personal UI preference, the same category of thing
WordPress core's own dashboard already stores per-user
(`meta-box-order_{screen}`), not site-wide configuration every admin
shares. `Utill::DASHBOARD_WIDGET_IDS` is the canonical id whitelist both
`DashboardLayout.php` and `registry.ts` agree on by convention (the same
id-matching convention `AI-ACTIONS.md` already uses between Rule ids and
Action ids) — `update_item()` silently drops any id not on this list, so a
client can never persist a widget id it invented.

**Reconciliation, not raw storage**: `get_reconciled_layout()` merges the
saved layout against the canonical id list every time it's read — any
widget id that exists but isn't in a user's saved layout yet (a widget
added after they last customized their order) is appended, enabled by
default; any saved id no longer on the canonical list is dropped. This is
what makes adding a 14th widget later additive-safe instead of silently
invisible to existing users forever.

## Drag-and-drop mechanism: `react-sortablejs`

`DashboardGrid.tsx` uses `ReactSortable` from `react-sortablejs` — not a
new drag-and-drop dependency choice: `react-sortablejs`/`sortablejs` are
already declared `peerDependencies` of `@multivendorx/zyra`, and are the
exact primitive Zyra's own `packages/builders/src/EditPanel/PanelEditor.tsx`
already uses for its drag-and-drop block canvas. Using the same library
here follows the dominant drag-and-drop pattern this monorepo already has,
rather than introducing dnd-kit, react-beautiful-dnd, or anything else
undocumented. `handle=".widget-drag-handle"` restricts dragging to
`DashboardWidget.tsx`'s drag-handle icon specifically, so clicking
anywhere else on a widget (a button inside it, its content) never
accidentally starts a drag.

Hidden widgets aren't unmounted with no way back — `DashboardGrid.tsx`
renders a "Hidden widgets" chip row beneath the grid so a widget hidden by
mistake can be restored with one click, rather than only being
recoverable by clearing all user meta.

## Extension strategy

Identical shape to every other registry in this codebase
(`vulopilot_scanner_sources`, `vulopilot_ai_action_sources`, …), applied
to the one React-side registry:

1. **A new Free widget**: add a `WidgetDefinition` (or `StatWidgetConfig`
   if it's a single-number tile) to `registry.ts`, and its id to
   `Utill::DASHBOARD_WIDGET_IDS` so a saved layout can include it.
2. **A Pro or third-party widget**: register via
   `addFilter('vulopilot_dashboard_widgets', ...)` from Pro's own
   `src/index.tsx` — the same `@wordpress/hooks` mechanism
   [react-frontend.md](../../../.claude/rules/react-frontend.md) already
   documents (`multivendorx_pro_dashboard_component` etc.), applied to
   VuloPilot's own filter naming (`vulopilot_` prefix, no `_pro` infix,
   per `.claude/rules/php-wordpress.md`'s hook-naming convention extended
   to the JS side). Its id must also be added to
   `Utill::DASHBOARD_WIDGET_IDS`, license-gated the same way every other
   Pro capability is (`plugin-families.md`) — otherwise
   `DashboardLayout::update_item()` would silently drop it.

## What's not here yet

- **Approve/Reject/Rollback actions on the Pending Approval widget** —
  visibility-only until `AI-ACTIONS.md`'s REST surface is built.
- **A per-widget settings/configuration UI** (e.g. choosing how many rows
  Recent Activity shows) — every widget's row count is a fixed constant
  today (`per_page: 5`).
- **Real WooCommerce/accessibility score columns** —
  `category_scores.woocommerce`/`.accessibility` are computed live from
  findings (see above) rather than from a `vulopilot_site_health_snapshots`
  column, because no column for either exists in that table's schema
  (`DATABASE.md`) — only `seo_score`/`performance_score`/`security_score`/
  `uptime_score` do, and none of those four are populated yet either.
- **A "reset to default layout" action** — a user who reorders/hides
  widgets today has no one-click way back to
  `DEFAULT_DASHBOARD_WIDGETS`'s order beyond restoring each hidden widget
  individually.
