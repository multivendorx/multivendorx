# REST API

Namespace: `catalogx/v1` (`CatalogX()->rest_namespace`, set once in `classes/CatalogX.php`). Never hardcode the string.

## Plugin-level dispatcher

`classes/RestAPI/Rest.php` builds a container of controllers (`Settings`, `Tour`, `Logs`) and loops it on `rest_api_init`:

| Controller | Base | Routes |
|---|---|---|
| `Settings` | `/settings`, `/modules` | Save settings; enable/disable/list active modules |
| `Tour` | `/tour` | Get/set onboarding tour completion state |
| `Logs` | — | See `classes/RestAPI/Controllers/Logs.php` |

Plus one ad hoc route registered directly in `Rest.php` rather than through a controller class:

```php
register_rest_route(
    CatalogX()->rest_namespace,
    '/buttons',
    array(
        'methods'             => \WP_REST_Server::READABLE,
        'callback'            => array( $this, 'get_buttons' ),
        'permission_callback' => array( $this, 'catalogx_permission' ),
    )
);
```

`get_buttons()` renders the enquiry or quote button's HTML server-side (via `Enquiry\Module::init()->frontend` / `Quote\Module::init()->frontend`) for the block editor's live preview — a real, simpler variant worth knowing if you're looking for every route and only grep `Controllers/*.php`.

## Module-level REST

Modules with their own REST needs self-hook `rest_api_init` independently, inside their own constructor — they don't go through the plugin-level dispatcher:

| Module | Base | Routes |
|---|---|---|
| `Enquiry` (`modules/Enquiry/Rest.php`) | `/enquiries` | `CREATABLE` — submit an enquiry |
| `Quote` (`modules/Quote/Rest.php`) | — | See that file directly; several quote-cart/quote-request routes |

## Permission pattern

Every route has a real `permission_callback` — admin-only routes resolve through `Utill::current_user_has_capability( 'manage_options' )`, following the same pattern the whole workspace uses (see the parent repo's `rest-api.md` rule). Permission-callback method names in this plugin are prefixed `catalogx_` (e.g. `catalogx_permission`, `catalogx_permissions_check`, `catalogx_create_item_permissions_check`) — a deliberate convention applied across every REST controller in this plugin, not the unprefixed `get_items_permissions_check()`-style names `WP_REST_Controller` itself suggests.

## Extending WooCommerce's own REST output

`Rest.php` also hooks two WooCommerce REST filters directly, rather than exposing new routes:

- `woocommerce_rest_check_permissions` (`grant_woocommerce_rest_permission()`) — lets a public, unauthenticated request read product data (needed for the catalog/enquiry/quote buttons to render on the storefront).
- `woocommerce_rest_product_object_query` (`add_include_types_query()`) — filters which products/categories/tags/brands are excluded from REST product queries, based on the Access Rules settings (see [SETTINGS-SYSTEM](SETTINGS-SYSTEM.md)).

## Errors

Return `WP_Error` from callbacks on failure; log unexpected exceptions via `Utill::server_error( $e )` rather than `error_log()` directly.
