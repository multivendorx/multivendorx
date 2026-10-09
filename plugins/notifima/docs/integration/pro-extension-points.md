# How `notifima-pro` Extends This Plugin

## No PHP-level coupling

Unlike `multivendorx-pro` (which does direct `use MultiVendorX\...` imports against the free `multivendorx` plugin and won't boot without it), `notifima-pro` has **zero PHP-level dependency** on this plugin — no `use Notifima\...` imports found in `plugins/notifima-pro/classes/` or `plugins/notifima-pro/modules/` (there is no `modules/` there either). The two plugins are independent WordPress plugins that happen to share a product line and a license-check convention (`Utill::is_khali_dabba()` here, its own equivalent in `notifima-pro`). See the parent repo's `.claude/rules/plugin-families.md` for the general pattern this follows.

## The entire integration surface: three JS filters

Everything `notifima-pro` does to extend this plugin's admin UI happens through `@wordpress/hooks`, registered once in `notifima-pro/src/index.tsx`:

```ts
// plugins/notifima-pro/src/index.tsx
import { addFilter } from '@wordpress/hooks';

addFilter('notifima_subscriber_list_table_props', 'notifima-pro/subscriber-list', useSubscriptionTableProps);
addFilter('notifima_manage_stock_table_props', 'notifima-pro/manage-stock', useManageStockTableProps);

addFilter(
    'notifima_pro_subscribe_form',
    'notifima-pro/subscribe-form',
    (defaultComponent, props) => (
        <FormViewer
            formFields={subscription?.settings ?? []}
            response={{ email: props.userEmail }}
            onSubmit={props.onSubmit}
        />
    )
);
```

Each of these three filters is documented in full at [../filters-hooks/js-extension-points.md](../filters-hooks/js-extension-points.md) — this page is about the *consuming* side (what `notifima-pro` actually does with them), that page is about the *defining* side (where the free plugin calls `applyFilters()`).

In all three cases, the pattern is **full replacement**, not additive data merging: the free plugin's own default (an empty table-props object or an empty `<></>` fragment) is a placeholder/upsell state, and `notifima-pro`'s filter callback substitutes the real implementation entirely. This is a much simpler integration convention than `multivendorx`'s module `require.context` + route-registry system (see that plugin's own `docs/integration/`) — appropriate to how much smaller `notifima`'s own admin app is (four hardcoded tabs, no per-module dashboard registry to plug into, see [../admin/dashboard.md](../admin/dashboard.md)).

## A fourth filter that isn't this plugin's own

`notifima-pro/src/index.tsx` also calls:

```ts
addFilter(
    'multivendorx_pro_dashboard_component',
    'notifima-pro/notifima-dashboard-component',
    (defaultComponent, key) => key === 'subscriberList' ? <SubscribersList/> : defaultComponent
);
```

`multivendorx_pro_dashboard_component` is **`multivendorx-pro`'s** filter (see the parent repo's `plugins/multivendorx-pro/docs/` or `.claude/rules/react-frontend.md`), not one this plugin defines — `notifima-pro` registers into it so that a subscriber-list panel can appear inside the `multivendorx` vendor dashboard when both product lines are active on the same site. Documented here because it's real code in `notifima-pro`'s bootstrap, but it's cross-product-line integration, not part of this plugin's own extension surface — don't look for `multivendorx_pro_dashboard_component` anywhere in this plugin's own `src/`.
