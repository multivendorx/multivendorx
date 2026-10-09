# JS/TS `@wordpress/hooks` Extension Points

## Overview

Every `addFilter`/`applyFilters` this plugin's own `src/` and `modules/*/src/` use, grepped across the codebase. Same table-per-domain, volume-driven format as [actions.md](actions.md)/[filters.md](filters.md). "DEFINE" means the file calls `applyFilters(...)` to let something else hook in (usually a `null`/default first argument, resolved to a component or value); "CONSUME" means the file calls `addFilter(...)` to attach to a filter defined elsewhere — usually a module registering its own tab/component against one of the core `src/` files' DEFINE points.

## Table of Contents

- [Product edit page (meta-boxes)](#product-edit-page-meta-boxes)
- [Store dashboard core](#store-dashboard-core)
- [Admin tabs: Customers, Compliance, Approval Queue, Transaction History](#admin-tabs-customers-compliance-approval-queue-transaction-history)
- [Settings & dashboard routing](#settings--dashboard-routing)
- [Invoice templates](#invoice-templates)
- [Products list & product editor (dashboard)](#products-list--product-editor-dashboard)
- [Orders, coupons, transactions, withdrawals (dashboard)](#orders-coupons-transactions-withdrawals-dashboard)
- [Shipping settings](#shipping-settings)
- [Module registrations (consuming the admin-tab DEFINE points)](#module-registrations-consuming-the-admin-tab-define-points)
- [Naming outliers](#naming-outliers)

## Product edit page (meta-boxes)

The admin product-editor page assembles its layout from independently-addable sections; each of these is a DEFINE point in one core file, consumed by feature-specific meta-box files:

| Filter | Source | Direction | Notes |
|---|---|---|---|
| `multivendorx_add_product_middle_section` | `src/dashboard/addProducts.tsx:702` | DEFINE | Args: `(null, product, setProduct, handleChange, productFields, typeFields, modules)` |
| `multivendorx_add_product_middle_section` | `src/metaBoxes/relatedList.tsx:64` | CONSUME | Appends `<RelatedList>` when `productFields` includes `'linked_product'` |
| `multivendorx_add_product_middle_section` | `src/metaBoxes/policies.tsx:91` | CONSUME | Appends `<Policies>` when `productFields` includes `'policies'` |
| `multivendorx_add_product_middle_section` | `src/metaBoxes/minMax.tsx:129` | CONSUME | Appends min/max quantity UI |
| `multivendorx_add_product_middle_section` | `src/metaBoxes/inventory.tsx:132` | CONSUME | Appends `<Inventory>` when `productFields` includes `'inventory'` |
| `multivendorx_add_product_middle_section` | `src/metaBoxes/attributes.tsx:377` | CONSUME | Appends `<Attributes>` — **reuses the `'inventory'` field-flag check**, likely a copy-paste artifact worth checking before assuming it's intentional |
| `multivendorx_add_product_middle_section` | `src/metaBoxes/shipping.tsx:261` | CONSUME | Appends `<ShippingCard>` |
| `multivendorx_add_product_middle_section` | `modules/Intelligence/src/index.tsx:4` | CONSUME | Appends AI-section UI |
| `multivendorx_add_product_right_section` | `src/dashboard/addProducts.tsx:715` | DEFINE | Args: `(null, product, setProduct, handleChange, productFields, setErrorMsg)` |
| `multivendorx_add_product_right_section` | `src/metaBoxes/publishingSection.tsx:213` | CONSUME | Appends `<PublishingSection>` |
| `multivendorx_add_product_right_section` | `src/metaBoxes/productCategory.tsx:442` | CONSUME | Appends product-category UI |
| `multivendorx_add_product_right_section` | `src/metaBoxes/productTag.tsx:52` | CONSUME | Appends `<ProductTag>` when `productFields` includes `'product_tag'` |
| `product_downloadable` | `src/metaBoxes/shipping.tsx:248` | DEFINE | Args: `(null, product, setProduct, handleChange)`, only when `productType === 'downloadable'` — **naming note**: no `multivendorx_` prefix |
| `product_downloadable` | `src/metaBoxes/downloadable.tsx:119` | CONSUME | Appends `<Downloadable>` |
| `multivendorx_product_shipping_meta` | `src/metaBoxes/shipping.tsx:239` | DEFINE | Args: `(null, product, modules)` |
| `multivendorx_product_category_options` | `src/metaBoxes/productCategory.tsx:182` | DEFINE | Filters fetched category options before setting state |
| `multivendorx_category_select_limit` | `src/metaBoxes/productCategory.tsx:197` | DEFINE | Filters `{allow, message}` validation for category-selection limit |
| `multivendorx_product_attributes_title` | `src/metaBoxes/attributes.tsx:187` | DEFINE | Attributes card title string, default translated `'Attributes'` |
| `multivendorx_add_product_variations` | `src/metaBoxes/attributes.tsx:365` | DEFINE | Args: `(null, product, setProduct, productFields)` |

## Store dashboard core

`src/storeDashboard.tsx`'s own DEFINE points — see [../frontend/store-dashboard.md](../frontend/store-dashboard.md) for the full component-resolution chain these participate in:

| Filter | Source | Notes |
|---|---|---|
| `multivendorx_pro_dashboard_component` | `src/storeDashboard.tsx:263` | The core Pro-component fallback filter — args `(null, convertedKey)`; the tier-3 fallback described in [../frontend/store-dashboard.md](../frontend/store-dashboard.md#component-resolution-a-3-tier-chain) |
| `multivendorx_override_capability` | `src/storeDashboard.tsx:78` | Overrides a capability-check result (e.g. for membership gating), args `(null, capability)` |
| `multivendorx_product_create_limit` | `src/storeDashboard.tsx:105` | `{allowed, message}` gating product creation — same tag reused in `products.tsx`/`sharedListing.tsx` (see below) |
| `multivendorx_extra_profile_menu` | `src/storeDashboard.tsx:731` | Extra content injected into the profile dropdown menu, args `(null, tabHref)` |

## Admin tabs: Customers, Compliance, Approval Queue, Transaction History

Four admin-side tabs share the same three-filter shape (`{tab}_api_configs`, `{tab}` list, `{tab}_content` resolver) — each DEFINEd in its own core `src/components/{Tab}/{Tab}.tsx`, CONSUMEd by whichever module contributes a sub-tab:

| Tab | API configs filter | Tab-list filter | Content-resolver filter | Core file |
|---|---|---|---|---|
| Customers | `multivendorx_customer_api_configs` | `multivendorx_customers_tab` | `multivendorx_customers_tab_content` | `src/components/CustomersFeedback/CustomersFeedback.tsx:56,82,89` |
| Compliance | `multivendorx_compliance_api_configs` | `multivendorx_compliance_tab` | `multivendorx_compliance_tab_content` | `src/components/Compliance/Compliance.tsx:56,82,97` |
| Approval Queue | `multivendorx_approval_queue_api_configs` | `multivendorx_approval_queue_tab` | `multivendorx_approval_queue_tab_content` | `src/components/ApprovalQueue/ApprovalQueue.tsx:93,218,256` |
| Transaction History | — | `multivendorx_transaction_history_tabs` | `multivendorx_transaction_history_tab_content` | `src/components/TransactionHistory/TransactionHistory.tsx:85,148` |

Transaction History additionally defines `multivendorx_transaction_history_navigator_meta` (`:131`, breadcrumb/navigator metadata) and `multivendorx_direct_transaction` (`:168`, content for a "direct transaction" sub-view).

Real module consumers of the first three (see [Module registrations](#module-registrations-consuming-the-admin-tab-define-points) below): `CustomerQueries` → Customers tab, `MarketplaceCompliance` → Compliance tab, `StoreReview` → Customers tab (a second consumer), `MarketplaceRefund` → Approval Queue tab, `Intelligence` → product middle section (not a tab).

Two related admin-store-edit DEFINE points, same shape, different page:

| Filter | Source | Notes |
|---|---|---|
| `multivendorx_store_edit_staff_top_section` | `src/components/Stores/Edit/StoreStaff.tsx:223` | Args `(null, id, modules)` |
| `multivendorx_store_edit_right_section` | `src/components/Stores/Edit/Overview.tsx:405` | Args `(null, id, storeData, modules)` |
| `multivendorx_add_facilitator_content` | `src/components/Stores/Edit/EditStore.tsx:352` | Args `(null, editId, data)` |

## Settings & dashboard routing

| Filter | Source | Direction | Notes |
|---|---|---|---|
| `multivendorx_settings_context` | `src/services/templateService.ts:138` | DEFINE | Filters a webpack `require.context` object, args `(ctx, type)` — the exact filter named in `.claude/rules/react-frontend.md`, shared between admin settings (`type: 'settings'/'tools'/'storeStatus'`) and store-dashboard settings (`type: 'dashboardSettings'`) |
| `multivendorx_dashboard_routes` | `src/dashboardConfig.ts:43` | DEFINE | Filters the base dashboard route-config array (product/order add/edit detail views) — see [../frontend/store-dashboard.md](../frontend/store-dashboard.md) |
| `multivendorx_setting_tab_component` | `src/dashboard/settings.tsx:107` | DEFINE | Resolves the component for the active settings tab, args `(null, currentTab)` |

## Invoice templates

Named explicitly in `.claude/rules/react-frontend.md` as Pro extension filters — all three DEFINEd in `src/components/Settings/StoreConfiguration/Invoice.tsx`:

| Filter | Source | Filters |
|---|---|---|
| `multivendorx_order_invoice` | `Invoice.tsx:350` | List of order-invoice template options (key/label/preview/component/pdf) |
| `multivendorx_commission_invoice` | `Invoice.tsx:408` | Same pattern for commission-invoice templates |
| `multivendorx_packing_slip_invoice` | `Invoice.tsx:459` | Same pattern for packing-slip templates |

## Products list & product editor (dashboard)

`src/dashboard/products.tsx` (the store-dashboard products list) and `src/dashboard/addProducts.tsx` (the add/edit form) define most of these:

| Filter | Source | Notes |
|---|---|---|
| `multivendorx_product_create_limit` | `src/dashboard/products.tsx:67` | Same tag as `storeDashboard.tsx:105` |
| `multivendorx_products_bulk_action_handler` | `src/dashboard/products.tsx:265` | Args `(null, action, selectedIds, appLocalizer)` |
| `multivendorx_products_bulk_actions` | `src/dashboard/products.tsx:326` | Bulk-action option list, default `[{label:'Delete', value:'delete'}]`, args `(defaultActions, modules)` — flagged in `.claude/rules/performance.md` |
| `multivendorx_product_badge` | `src/dashboard/products.tsx:393` | Badge element next to each product-row name, args `(badge, row)` |
| `multivendorx_products_table_actions` | `src/dashboard/products.tsx:451` | Per-row action list in the products table |
| `multivendorx_product_list_header_buttons` | `src/dashboard/products.tsx:516` | Header buttons (e.g. "Add New") above the products list |
| `multivendorx_product_list_header_middle_section` | `src/dashboard/products.tsx:541` | Extra header content, args `(null, modules)` |
| `multivendorx_product_type_options` | `src/dashboard/addProducts.tsx:81` | Product-type select options list |
| `multivendorx_before_product_save` | `src/dashboard/addProducts.tsx:130` | Boolean gate before submitting a product, args `(true, payload, setErrorMsg)` |
| `product_checklist_items` | `src/dashboard/addProducts.tsx:185` | Product-completeness checklist array, args `(baseChecklist, product)` — **naming note**: no `multivendorx_` prefix |
| `product_checklist_items_render` | `src/dashboard/addProducts.tsx:431` | Rendered checklist markup, args `(null, checklist, product)` — **naming note**: no prefix |
| `multivendorx_product_button` | `src/dashboard/addProducts.tsx:273` | Product-edit toolbar buttons array (View button, etc.) — consumed by `modules/Intelligence/src/AIButtonSection.tsx:217` |
| `multivendorx_product_field_suggestions` | `src/dashboard/addProducts.tsx:489,530,568` | AI suggestion UI for `name`/`short_description`/`description` fields — consumed by `modules/Intelligence/src/AIButtonSection.tsx:227` |
| `multivendorx_product_sidebar_cards` | `src/dashboard/addProducts.tsx:440` | Extra sidebar card content, args `(null, product)` |
| `product_image_enhancement` | `src/dashboard/addProducts.tsx:796` | Featured-image UI enhancement, args `(null, {currentImage, isFeaturedImage, setImage, product})` — **naming note**: no prefix |
| `multivendorx_show_product_gallery` | `src/dashboard/addProducts.tsx:803` | Boolean gate on showing the product gallery field |
| `multivendorx_ai_product_image_section` | `modules/Intelligence/src/AIButtonSection.tsx:402` | Rendered product-image-section placeholder, args `(defaultIcon, {product, productId, currentImage, setCurrentImage})` |

## Orders, coupons, transactions, withdrawals (dashboard)

| Filter | Source | Notes |
|---|---|---|
| `multivendorx_store_order_actions` | `src/dashboard/orders.tsx:267` | Per-order-row action list, conditionally seeded with "View" based on `appLocalizer.edit_order_capability` |
| `multivendorx_shipment_button` | `src/dashboard/orderDetails.tsx:1550` | Shipment-tracking button list on the order-details view |
| `multivendorx_coupon_create_limit` | `src/dashboard/coupons.tsx:101` | `{allowed, message}` gating coupon creation |
| `multivendorx_store_dashboard_transactions_endpoint` | `src/dashboard/transactions.tsx:31` | REST endpoint slug for the transactions list, default `'transactions'` |
| `multivendorx_transactions_query_params` | `src/dashboard/transactions.tsx:263` | Query-params object for transaction fetches, args `(params, query, includePagination)` |
| `multivendorx_withdrawals_useeffect_request_handler` | `src/dashboard/withdrawals.tsx:51` | Custom withdrawal data-fetch handling, args `(false, {data, setData, amount, setAmount, lastWithdraws, ...})` |
| `multivendorx_before_withdrawal_request_submit` | `src/dashboard/withdrawals.tsx:146` | Boolean gate before submitting a withdrawal request |
| `multivendorx_product_create_limit` | `src/dashboard/sharedListing.tsx:66` | Same tag again, gates shared-listing product creation |

## Shipping settings

| Filter | Source | Notes |
|---|---|---|
| `multivendorx_zone_shipping_settings` | `src/dashboard/settings/DistanceByZoneShipping.tsx:232` | Shipping-method settings object before save |
| `multivendorx_zone_shipping_methods` | `src/dashboard/settings/DistanceByZoneShipping.tsx:448` | Available zone-shipping-method option list, seeded with `local_pickup` |
| `multivendorx_after_zone_shipping_fields` | `src/dashboard/settings/DistanceByZoneShipping.tsx:645` | Extra fields after the zone/method form, args `(null, {zone, shippingMethod, storeId})` |

## Module registrations (consuming the admin-tab DEFINE points)

Each of these `modules/{Module}/src/index.tsx` files exists solely to `addFilter` into one of the DEFINE points above:

| Module | Consumes | What it registers |
|---|---|---|
| `CustomerQueries` | `multivendorx_customer_api_configs`, `multivendorx_customers_tab`, `multivendorx_customers_tab_content` | A `customer-queries` API config + sub-tab, rendering `<Queries />` |
| `MarketplaceCompliance` | `multivendorx_compliance_api_configs`, `multivendorx_compliance_tab`, `multivendorx_compliance_tab_content` | A `report-abuse` API config + sub-tab, rendering `<PendingReportAbuse />` |
| `StoreReview` | `multivendorx_customer_api_configs`, `multivendorx_customers_tab`, `multivendorx_customers_tab_content` | A `store-review` API config + sub-tab, rendering `<StoreReviews />` — a second consumer of the Customers tab's filters |
| `MarketplaceRefund` | `multivendorx_approval_queue_api_configs`, `multivendorx_approval_queue_tab`, `multivendorx_approval_queue_tab_content` | A `refund-requests` API config (against `wc/v3/orders`, `meta_key: multivendorx_store_id`) + sub-tab, rendering `<PendingRefund />` |
| `Intelligence` | `multivendorx_add_product_middle_section`, `multivendorx_product_button`, `multivendorx_product_field_suggestions` | AI-assisted product-editing UI (not a tab — a product-editor addition) |

## Naming outliers

- No `multivendorx_` prefix at all: `product_downloadable`, `product_checklist_items`, `product_checklist_items_render`, `product_image_enhancement`. All four live in the product-editing surface (`src/dashboard/addProducts.tsx`, `src/metaBoxes/`) — worth a consistency pass if that area is touched again, but not fixed here per this doc's own scope.

See [actions.md](actions.md) and [filters.md](filters.md) for the PHP-side hook reference.
