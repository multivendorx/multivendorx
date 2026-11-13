# JS/TS Extension Points

Every `@wordpress/hooks` `applyFilters` call in this plugin's `src/` — each one is a real, currently-consumed extension point that `notifima-pro`'s `src/index.tsx` hooks into with `addFilter`. See [../integration/pro-extension-points.md](../integration/pro-extension-points.md) for how `notifima-pro` actually uses these (full component replacement in each case, not a data-only filter).

## Table of Contents

- [`notifima_subscriber_list_table_props`](#notifima_subscriber_list_table_props)
- [`notifima_manage_stock_table_props`](#notifima_manage_stock_table_props)
- [`notifima_pro_subscribe_form`](#notifima_pro_subscribe_form-naming-outlier)

---

### `notifima_subscriber_list_table_props`

Filters the table-props object (columns, rows, pagination config) the admin Subscriber List tab renders. `notifima-pro` replaces the default (empty/demo) props entirely with real subscriber data via this filter.

```ts
tableProps = applyFilters( 'notifima_subscriber_list_table_props', defaultTableProps );
```

**Source**: `src/components/SubscriberList/SubscribersList.tsx:167`

### `notifima_manage_stock_table_props`

Same shape as above, for the admin Inventory Manager tab's table.

```ts
tableProps = applyFilters( 'notifima_manage_stock_table_props', defaultTableProps );
```

**Source**: `src/components/Managestock/Managestock.tsx:139`

### `notifima_pro_subscribe_form` (naming outlier)

Filters the actual subscribe-form component rendered by the `subscribe-form` Gutenberg block, when the free plugin's own default (a placeholder empty fragment, `<></>`) would otherwise render — `notifima-pro` replaces it with the real form UI (`zyra`'s `FormViewer`, driven by the site's configured form fields).

```ts
applyFilters( 'notifima_pro_subscribe_form', <></>, { userEmail, onSubmit } )
```

Named with a `_pro` infix — the same naming-outlier pattern as the PHP-side `notifima_pro_subscribers_list` (see [filters.md](filters.md)); flagged there for the same reason, not a template to copy for a new hook name.

**Source**: `src/blocks/subscribe-form/SubscribeForm.tsx:174`

## What's not here

`multivendorx`'s admin app registers a global `window.registerMultiVendorXRoute` route registry and does a webpack `require.context` module scan (see that plugin's own `filters-hooks/js-extension-points.md` and `integration/`) — `notifima` has neither. These three named filters are the entire client-side extension surface this plugin exposes; there's no dynamic per-module discovery mechanism to document alongside them.
