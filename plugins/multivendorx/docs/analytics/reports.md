# WooCommerce Analytics Integration

## Overview

Unlike `multivendorx-pro` (whose `StoreAnalytics` module scopes reports to a *single* vendor via a `?store_id=` REST param), this plugin's own analytics integration works the other direction: it corrects WooCommerce's own Analytics reports so **multi-vendor "child" orders don't get double-counted** against the store owner's overall totals, plus one low-stock report fix. Neither piece registers a new REST route — both are WooCommerce Analytics report filters.

## Excluding sub-orders from Analytics totals

When an order is split across multiple vendors, this plugin creates one "parent" order plus a "child" (sub-)order per vendor (see `classes/Order/Hooks.php`'s order-splitting logic). Left alone, WooCommerce's own Analytics reports would count both the parent and every child as separate orders/revenue — so this plugin filters the report SQL to only count orders with `parent_id = 0`:

```php
// classes/Order/Hooks.php:30-58
if ( current_user_can( 'manage_options' ) ) {
    $analytics_hooks = array(
        // Orders & Revenue.
        'woocommerce_analytics_clauses_where_orders_stats_total',
        'woocommerce_analytics_clauses_where_orders_stats_interval',
        'woocommerce_analytics_clauses_where_orders_subquery',
        // Products.
        'woocommerce_analytics_clauses_where_products_stats_total',
        'woocommerce_analytics_clauses_where_products_stats_interval',
        'woocommerce_analytics_clauses_where_products_subquery',
        // Categories & Taxes.
        'woocommerce_analytics_clauses_where_categories_subquery',
        'woocommerce_analytics_clauses_where_taxes_stats_total',
        'woocommerce_analytics_clauses_where_taxes_stats_interval',
        'woocommerce_analytics_clauses_where_taxes_subquery',
        // Coupons.
        'woocommerce_analytics_clauses_where_coupons_stats_total',
        'woocommerce_analytics_clauses_where_coupons_stats_interval',
        'woocommerce_analytics_clauses_where_coupons_subquery',
    );

    foreach ( $analytics_hooks as $hook ) {
        add_filter( $hook, array( $this, 'exclude_suborders_analytics' ) );
    }
}

public function exclude_suborders_analytics( $clauses ) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'wc_order_stats';
    $clauses[] = "AND {$table_name}.parent_id = 0";
    return $clauses;
}
```

12 separate WC Analytics SQL-clause filters get the same single WHERE-clause addition — orders, products, categories, taxes, and coupons stats are each computed from their own subquery/interval/total clause set in WooCommerce core, so each needs the same fix independently.

**Worth knowing**: this whole block is gated behind `current_user_can( 'manage_options' )`, checked **once, inside the constructor** (`classes/Order/Hooks.php:30`) — not inside each filter callback. Since this class is instantiated during `init_classes()` on the `init` hook, the capability check runs against whatever user context exists at that point in the request lifecycle (which may not reflect the user actually viewing the Analytics report later in a REST/admin-ajax request, depending on when `wp_get_current_user()` resolves). If Analytics numbers look wrong specifically for capability-boundary cases, this early one-time check is where to look first — not a documentation-scope bug to fix here, just a real behavior to know about before assuming the filters are unconditionally active.

## Low-stock report fix

A second, unrelated Analytics fix lives in the REST dispatcher itself:

```php
// classes/RestAPI/Rest.php:59,103-118
add_filter( 'woocommerce_analytics_products_query_args', array( $this, 'analytics_products_filter_low_stock_meta' ), 10, 1 );

public function analytics_products_filter_low_stock_meta( $args ) {
    $meta_key = $args['meta_key'] ?? '';
    if ( Utill::POST_META_SETTINGS['store_id'] === $meta_key ) {
        $args['meta_query']   = $args['meta_query'] ?? array();
        $args['meta_query'][] = array(
            'key'     => Utill::POST_META_SETTINGS['store_id'],
            'compare' => 'EXISTS',
        );
    }
    return $args;
}
```

Ensures the Low Stock report's product query only matches products that actually carry a `store_id` meta key (i.e., vendor-owned products), rather than every product site-wide, when that specific report's query args are being built.

## What this doc doesn't cover

Neither of the above exposes a new REST endpoint — both are `apply_filters()` hooks into WooCommerce's *own* `/wc-analytics/*` REST controllers. For a per-vendor-scoped analytics view (as opposed to correcting the site-wide owner's view), see the parent repo's `docs/analytics/reports.md` for `multivendorx-pro`'s `StoreAnalytics` module.
