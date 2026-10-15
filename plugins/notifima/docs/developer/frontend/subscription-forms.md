# Customer-Facing Subscription Forms

## Scope

This plugin has no vendor/store dashboard (it isn't a marketplace plugin) — its only customer-facing surface is the "notify me when back in stock" subscribe form, which can appear on a product page three different ways: automatically injected, via shortcode, or via a Gutenberg block. All three ultimately render the same HTML through one shared method.

## The shared form renderer

`FrontEnd::get_subscription_form()` (`classes/FrontEnd.php:104-186`) is the single place that decides whether to render anything and builds the form markup:

1. Returns `''` immediately unless `Subscriber::is_product_outofstock()` (`classes/Subscriber.php:476-504`) says the product/variation is out of stock (accounting for the `is_enable_backorders` setting).
2. Returns `''` if the product/variation is marked `product_discontinued` (see [admin/dashboard.md](../admin/dashboard.md)).
3. Otherwise emits a `<div>` (or one per variation, for variable products) with `data-product-id`/`data-variation-id`/`data-product-title`/`data-user-email`/`data-shown-interest` attributes and no visible content — the actual form UI is rendered client-side by JS reading these `data-*` attributes, not server-rendered form HTML.

## Automatic injection

`FrontEnd`'s constructor (`classes/FrontEnd.php:24-31`) hooks the form onto WooCommerce's own template action hooks — no theme template override needed for the common cases:

- `woocommerce_simple_add_to_cart` → `display_product_subscription_form()` (simple products)
- `woocommerce_after_variations_form` → same, for variable products
- `woocommerce_grouped_product_list_column_price` filter → `append_grouped_product_subscription_form()`, appends the form HTML into the grouped-product child row price column

`display_product_subscription_form()` (`classes/FrontEnd.php:57-82`) resolves the product from its argument (accepting a product ID, a `WC_Product`, or falling back to the global `$product`), then applies two more gates before calling `get_subscription_form()`: the `is_guest_subscriptions_enable` setting (skip entirely for logged-out visitors if set to `'logged_in'`), and an early return if the product is on backorder and the setting says backorders should be treated as in-stock.

## Shortcode

`Shortcode::notifima_subscription_form()` (`classes/Shortcode.php:36-47`), registered as `[notifima_subscription_form]`, wraps the same `display_product_subscription_form()` call with two hook points immediately before/after (`notifima_before_subscription_form` / `notifima_after_subscription_form` — see [../filters-hooks/actions.md](../filters-hooks/actions.md)), for a theme/plugin to inject markup around the form without touching this plugin's code.

## Gutenberg blocks

Two blocks live under `src/blocks/`, both discovered and registered by `Block.php` (see below) rather than declared individually in PHP:

- **`subscribe-form`** (`src/blocks/subscribe-form/`) — the customer-facing form as an insertable block, for placing the subscribe form somewhere other than the automatic product-page locations above. `SubscribeForm.tsx:174` is also where `notifima-pro`'s only full-component-replacement JS filter fires (`notifima_pro_subscribe_form`) — see [../integration/pro-extension-points.md](../integration/pro-extension-points.md).
- **`stock-notification-block`** (`src/blocks/stock-notification-block/`) — an editor-side preview block whose `index.js` calls the REST API's `GET /stock-notification-form` route directly (see [../api/api.md](../api/api.md)) to fetch server-rendered preview HTML while editing.

`Block::initialize_blocks()` (`classes/Block.php:62-85`) discovers blocks by scanning `assets/js/block/*` (the **built** output directory, not `src/blocks/`) for any folder containing a `block.json`, rather than a hardcoded block list — adding a new block means adding the `src/blocks/{name}/` source and letting the existing webpack block-entry generation (see the parent repo's `.claude/rules/coding-standards.md`) produce the matching built folder; no PHP-side registration list to edit. The result is filtered through `notifima_initialize_blocks` (`classes/Block.php:84`) before use.

## Script loading

Frontend scripts/styles only enqueue on product pages or pages containing the shortcode (`FrontEnd::enqueue_frontend_scripts()`, `classes/FrontEnd.php:39-49`, checked via `is_product() || has_shortcode(...)`) — not on every frontend page load. Block-specific enqueuing/localization is handled separately by `Block::enqueue_scripts()`/`enqueue_all_block_assets()` (`classes/Block.php:92-128`), gated on `has_block()` for the frontend case and on the block editor screen for the editor case.
