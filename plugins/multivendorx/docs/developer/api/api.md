# Building a REST Controller

## Introduction

Every REST controller in this plugin `extends \WP_REST_Controller` directly and registers its own routes on `rest_api_init`. **There's no shared base controller class or permission trait** — no `MultiVendorXBaseController`, no reusable auth trait — the "shared" pattern across controllers is a repeated idiom (a `permission_callback` capability check, sometimes paired with an in-callback `X-WP-Nonce` verification), not an inherited/composed mechanism. Don't go looking for a base class to extend beyond `\WP_REST_Controller` itself.

The REST namespace is resolved from `MultiVendorX()->rest_namespace` (`'multivendorx/v1'`, set once in `classes/MultiVendorX.php:58`) — never hardcode the string.

## Two levels of registration

### Plugin-level: through the shared dispatcher

`classes/RestAPI/Rest.php` builds a container of controllers in `init_classes()` and loops it on `rest_api_init`:

```php
// classes/RestAPI/Rest.php
public function init_classes() {
    $this->container = array(
        'settings'          => new Settings(),
        'dashboard'         => new Dashboard(),
        'store'             => new Stores(),
        'commission'        => new Commissions(),
        'status'            => new Status(),
        'transaction'       => new Transactions(),
        'notifications'     => new Notifications(),
        'tour'              => new Tour(),
        'logs'              => new Logs(),
        'import_dummy_data' => new ImportDummyData(),
        'Migration'         => new Migrations(),
        'Tracking'          => new Tracking(),
    );
}

public function register_rest_api_routes() {
    foreach ( $this->container as $controller ) {
        if ( method_exists( $controller, 'register_routes' ) ) {
            $controller->register_routes();
        }
    }
}
```

12 controllers as of this writing, all under `classes/RestAPI/Controllers/`. Add a new top-level, not-module-tied controller here.

### Module-level: self-hooking

A module with its own REST needs registers independently, inside its own constructor — it doesn't go through the dispatcher above. Real, complete example, `modules/FollowStore/Rest.php`:

```php
namespace MultiVendorX\FollowStore;

class Rest extends \WP_REST_Controller {

    protected $rest_base = 'follow-stores';

    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ), 10 );
    }

    public function register_routes() {
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_items' ),
                    'permission_callback' => array( $this, 'multivendorx_get_items_permissions_check' ),
                ),
            )
        );
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_item' ),
                    'permission_callback' => array( $this, 'multivendorx_permissions_check' ),
                    'args'                => array( 'id' => array( 'required' => true ) ),
                ),
                array(
                    'methods'             => \WP_REST_Server::EDITABLE,
                    'callback'            => array( $this, 'update_item' ),
                    'permission_callback' => array( $this, 'multivendorx_permissions_check' ),
                ),
            )
        );
    }

    public function multivendorx_get_items_permissions_check( $request ) {
        return Utill::current_user_has_capability( array( 'edit_stores' ) );
    }

    public function multivendorx_permissions_check( $request ) {
        return Utill::current_user_has_capability( array( 'read' ) );
    }
}
```

Permission-callback method names in this plugin are prefixed `multivendorx_` (e.g. `multivendorx_get_items_permissions_check`, `multivendorx_permissions_check`) — a deliberate convention applied across every REST controller, in place of `WP_REST_Controller`'s own unprefixed naming suggestion. `get_item`'s and `update_item`'s routes above share one `multivendorx_permissions_check()` rather than each having its own distinctly-named check — don't assume every route needs a uniquely-named permission method; collapse to one shared check when the logic is actually identical, same as this real example does.

11 modules have their own `Rest.php` as of this writing: `SharedListing`, `Intelligence`, `MarketplaceRefund`, `Announcement`, `CustomerQueries`, `WPML`, `FollowStore`, `MarketplaceCompliance`, `Knowledgebase`, `StoreShipping`, `StoreReview`.

## The permission/nonce idiom

Every route needs a real `permission_callback` — this codebase doesn't use `__return_true` for anything meant to be gated. The typical shape is a `current_user_can()` capability check (`FollowStore` above), sometimes layered with an explicit `X-WP-Nonce` re-check inside the callback body itself, e.g. `classes/RestAPI/Controllers/Stores.php:121-129`:

```php
public function get_items( $request ) {
    // Nonce verification.
    $nonce = $request->get_header( 'X-WP-Nonce' );
    if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
        $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );
        MultiVendorX()->util->log( $error );
        return $error;
    }
    // ...
}
```

This nonce check is belt-and-suspenders on top of the permission callback, not a replacement for it.

**Update**: an earlier version of this doc flagged `classes/RestAPI/Controllers/Stores.php`'s `get_items_permissions_check()` as an unconditional `return true;` with no real capability check. **That's no longer the case** — verified against the current file: `multivendorx_get_items_permissions_check()` (`Stores.php:93-95`) now checks `Utill::current_user_has_capability( array( 'manage_options', 'edit_stores' ) )`, and the controller's `multivendorx_create_item_permissions_check()`/`multivendorx_update_item_permissions_check()` (`Stores.php:103-115`) check `create_stores`/`edit_stores` respectively. All three are real capability checks today — don't carry forward the old security concern when reading or citing this file.

## Errors

Return `WP_Error` from callbacks on failure; log unexpected exceptions via `MultiVendorX()->util->log( $e )` rather than `error_log()` directly (see the nonce-failure example above).

## Where to find what existing endpoints actually do

This file is a guide for building a new controller, not a catalog of the 12+ existing ones. To find what a specific existing route does, `grep -n "register_rest_route" classes/RestAPI/Controllers/*.php modules/*/Rest.php` and read the matched controller directly — or ask for an endpoint-by-endpoint reference to be generated as a separate document.
