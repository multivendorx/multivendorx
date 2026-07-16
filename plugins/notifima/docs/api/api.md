# Building a REST Controller

## Introduction

Every REST controller in this plugin `extends \WP_REST_Controller` directly and registers its own routes on `rest_api_init`. **There's no shared base controller class or permission trait** — the "shared" pattern across controllers is a repeated idiom (a `permission_callback` capability check, paired with an in-callback `X-WP-Nonce` verification via `Utill::validate_nonce()`), not an inherited/composed mechanism. Don't go looking for a base class beyond `\WP_REST_Controller` itself.

The REST namespace is resolved from `Notifima()->rest_namespace` (`'notifima/v1'`, set once in `classes/Notifima.php:58`) — never hardcode the string.

## Registration: one dispatcher, plus one ad-hoc route

Unlike `multivendorx-pro` (module-level controllers self-hook independently, see that plugin's `api/api.md`), **every** REST route in this plugin — including one that isn't a full controller — goes through the single dispatcher, `classes/RestAPI/Rest.php`:

```php
// classes/RestAPI/Rest.php:35-68
public function __construct() {
    $this->init_classes();
    add_action( 'rest_api_init', array( $this, 'register_rest_api_routes' ), 10 );
}

public function init_classes() {
    $this->container = array(
        'settings'   => new Settings(),
        'subscriber' => new Subscribers(),
    );
}

public function register_rest_api_routes() {
    foreach ( $this->container as $controller ) {
        if ( method_exists( $controller, 'register_routes' ) ) {
            $controller->register_routes();
        }
    }

    // A third route, registered directly here rather than through a controller class:
    register_rest_route(
        Notifima()->rest_namespace,
        '/stock-notification-form',
        array(
            'methods'             => \WP_REST_Server::READABLE,
            'callback'            => array( $this, 'get_stock_notification_form' ),
            'permission_callback' => array( $this, 'notifima_permission' ),
        )
    );
}
```

Two controllers exist as of this writing (`classes/RestAPI/Controllers/`): `Settings` (`rest_base = 'settings'`, one `CREATABLE` route) and `Subscribers` (`rest_base = 'subscribers'`, list + update routes). The third route (`GET /stock-notification-form`, consumed by the `stock-notification-block` Gutenberg block's editor preview — see [../frontend/subscription-forms.md](../frontend/subscription-forms.md)) is registered inline in `Rest.php` itself rather than as its own controller class — a real, simpler variant worth knowing about if you're looking for every route and only grep `Controllers/*.php`.

A full example controller, `Settings` (`classes/RestAPI/Controllers/Settings.php`):

```php
class Settings extends \WP_REST_Controller {
    protected $rest_base = 'settings';

    public function register_routes() {
        register_rest_route(
            Notifima()->rest_namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'update_item' ),
                    'permission_callback' => array( $this, 'update_item_permissions_check' ),
                ),
            )
        );
    }

    public function update_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    public function update_item( $request ) {
        $nonce_check = Utill::validate_nonce( $request );
        if ( is_wp_error( $nonce_check ) ) {
            return $nonce_check;
        }
        try {
            // ... save settings, do_action( 'notifima_after_save_settings', ... )
        } catch ( \Exception $e ) {
            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'notifima' ), array( 'status' => 500 ) );
        }
    }
}
```

## The permission/nonce idiom

Every callback pairs a `permission_callback` with an explicit in-body `Utill::validate_nonce( $request )` check (`classes/Utill.php:138-154`, verifies the `X-WP-Nonce` header via `wp_verify_nonce()`) — belt-and-suspenders, consistently applied across both controllers and the ad-hoc route. Every callback body is also wrapped in a `try`/`catch`, returning a generic `WP_Error( 'server_error', ..., 500 )` on any uncaught `\Exception` rather than leaking exception details to the client.

**Permission checks are not uniform in strictness across routes, worth knowing before copying one as a template**:

- `Settings::update_item_permissions_check()` and `Rest::notifima_permission()` (used for `/stock-notification-form`) both require `current_user_can( 'manage_options' )` — admin-only, appropriate since the stock-notification-form route is only ever called from the block editor preview, not by storefront visitors.
- `Subscribers::get_items_permissions_check()` (`classes/RestAPI/Controllers/Subscribers.php:68-70`) requires `manage_options` OR `edit_stores` — the latter capability is a multivendor-marketplace concept (see the parent repo's `.claude/rules/woocommerce.md` on `current_user_can( 'edit_stores' )` usage elsewhere in this workspace), present here for `multivendorx` interop even though this plugin has no PHP-level coupling to that plugin.
- `Subscribers::update_item_permissions_check()` (`classes/RestAPI/Controllers/Subscribers.php:77-86`) is intentionally permissive: it returns `true` unconditionally for a logged-out user when the `is_guest_subscriptions_enable` setting allows guest subscriptions, and otherwise `current_user_can( 'read' )` (WordPress grants `read` to every logged-in role, including `subscriber`) — this route is the customer-facing subscribe/unsubscribe action, so broad access here is by design, not a gap.

## Errors

Return `WP_Error` from callbacks on failure. There's no `MultiVendorX()->util->log()`-equivalent call inside these specific catch blocks (contrast the parent repo's `.claude/rules/rest-api.md` guidance) — `Utill::log()` (`classes/Utill.php:38-53`) exists and is used elsewhere (e.g. inside `validate_nonce()` on failure) and is the mechanism to reach for if you add logging to a new controller's catch block, rather than a raw `error_log()`.

## A real gap found while reading this controller: a broken AJAX action

`classes/FrontendScripts.php:267` builds a nonce URL for an AJAX action that is never registered:

```php
'export_button' => wp_nonce_url( admin_url( 'admin-ajax.php?action=export_subscribers' ), 'export_subscribers_nonce' ),
```

Grepping this plugin's `classes/` tree for `wp_ajax` finds **no** `add_action( 'wp_ajax_export_subscribers', ... )` (or `_nopriv_` variant) anywhere. The admin JS's "export" button, if wired to this localized URL, would 404/no-op rather than export anything. Documented here as a real, verified fact about existing code — not fixed as a side effect of writing this doc.

## Where to find what existing endpoints actually do

This file is a guide for building a new controller, not a catalog of the 2-3 existing routes — for those, `grep -n "register_rest_route" classes/RestAPI/Controllers/*.php classes/RestAPI/Rest.php` and read the matched code directly.
