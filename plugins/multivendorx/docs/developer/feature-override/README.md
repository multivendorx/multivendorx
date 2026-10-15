# Template Overrides

## Overview

`multivendorx` supports theme-level template overrides through a single helper, `Utill::get_template()` — the same `get_stylesheet_directory()`-first, plugin-fallback pattern WooCommerce itself uses for its own templates, reimplemented locally rather than delegating to `wc_get_template()`.

## The mechanism

```php
// classes/Utill.php:393-403
public static function get_template( $template_name, $args = array() ) {

    // Check if the template exists in the theme.
    $theme_template = get_stylesheet_directory() . '/dc-woocommerce-product-vendor/' . $template_name;

    // Use the theme template if it exists, otherwise use the plugin template.
    $located = file_exists( $theme_template ) ? $theme_template : MultiVendorX()->plugin_path . 'templates/' . $template_name;

    // Load the template.
    load_template( $located, false, $args );
}
```

To override a template, copy the plugin's version from `templates/{template_name}` into your active theme (or child theme) at:

```
{your-theme}/dc-woocommerce-product-vendor/{template_name}
```

**Naming note**: the theme-override folder is `dc-woocommerce-product-vendor/`, not `multivendorx/` — a legacy name predating this plugin's rebrand (see [../architecture.md](../architecture.md)'s naming note on the main plugin file for the other places this same legacy name survives). This is the literal, real folder name a theme author needs to use today — don't "correct" it to `multivendorx/` in your own theme override, since the plugin only checks the legacy path.

## What's actually overridable today

Unlike `multivendorx-pro` (which routes exactly one template through this mechanism), this plugin routes 7:

| Template | Called from | `$args` passed |
|---|---|---|
| `store/store-dashboard.php` | `classes/Shortcode.php:202` | `array()` |
| `store/store-tabs.php` | `classes/Store/StoreUtil.php:753` | `{ store_id }` |
| `store/store-tabs.php` | `modules/Elementor/Widgets/StoreTab.php:106` | `{ store_id }` |
| `store/shared-listing-single-product-tab.php` | `modules/SharedListing/Frontend.php:311` | `{ product_ids }` |
| `store/store-single-product-customer-queries-tab.php` | `modules/CustomerQueries/Frontend.php:119` | `{ product_id }` |
| `store/store-single-product-tab.php` | `modules/Privacy/Frontend.php:65` | none |
| `store/store-single-product-policy-tab.php` | `modules/StorePolicy/Frontend.php:152` | none |

```php
MultiVendorX()->util->get_template( 'store/store-tabs.php', array( 'store_id' => $store_obj->get_id() ) );
```

## What's in `templates/` but NOT theme-overridable this way

`templates/store/` also contains `store.php`, `store.html`, `store-wrapper.php`, `store-review.php`, and `templates/elementor-canvas.php` — but these are loaded via direct, hardcoded path construction (`MultiVendorX()->plugin_path . 'templates/store/store.php'`, in `classes/Store/Rewrites.php:268-276` and `modules/Elementor/Admin.php:65`), **not** through `Utill::get_template()`. A theme copy at `{theme}/dc-woocommerce-product-vendor/store.php` will have **no effect** on these — the plugin never checks the theme directory for them. `classes/Store/Rewrites.php` appears to be a `template_include`-style block-template resolver (it references `store.html`, suggesting FSE/block-theme support), which is a different override mechanism entirely (WordPress's own block-template hierarchy, not this plugin's `get_template()` helper) — out of scope for this document.

Before assuming a specific piece of store-page markup is theme-overridable, `grep -rn "get_template(" classes/ modules/` to confirm it's actually routed through the helper above, rather than one of these hardcoded paths.

## Adding a new overridable template

If you're building a feature that renders server-side HTML a theme author might reasonably want to customize, route it through `MultiVendorX()->util->get_template( '{name}.php', $args )` and put the markup file under `templates/{name}.php` — don't `include`/`require` a template path directly, since that bypasses the theme-override lookup for anyone building on top of your addition.
