# PHP Action Hooks

Every `do_action()` call this plugin defines as a real extension point.

## Table of Contents

- [Lifecycle](#lifecycle)
  - [`notifima_loaded`](#notifima_loaded)
  - [`notifima_updated`](#notifima_updated)
- [Subscription Flow](#subscription-flow)
  - [`notifima_before_subscription_form`](#notifima_before_subscription_form)
  - [`notifima_after_subscription_form`](#notifima_after_subscription_form)
  - [`notifima_before_subscribe_product`](#notifima_before_subscribe_product)
  - [`notifima_subscriber_added`](#notifima_subscriber_added)
- [Settings](#settings)
  - [`notifima_after_save_settings`](#notifima_after_save_settings)
- [Third-party pass-through](#third-party-pass-through)
- [Legacy aliases](#legacy-aliases)

---

## Lifecycle

### `notifima_loaded`

Fires once, at the end of `init_plugin()`, after every core service has been instantiated and the plugin's `WC_Email` subclasses have been registered onto `woocommerce_email_classes`. The plugin-load-complete signal, analogous to `multivendorx_loaded` in the free `multivendorx` plugin — though nothing in this workspace currently waits on it the way Pro plugins wait on that hook (this plugin has no `modules/` system for anything to gate on it).

**Source**: `classes/Notifima.php:173`

### `notifima_updated`

Fires at the end of `Install`'s constructor, after migrations have run and `notifima_version` has been updated — on both fresh activation and version-bump migration.

**Source**: `classes/Install.php:57`

## Subscription Flow

### `notifima_before_subscription_form`

Fires immediately before the shortcode-rendered subscribe form is output. Not fired for the automatic product-page injection path (`FrontEnd::display_product_subscription_form()` called directly from WooCommerce hooks) — only the `[notifima_subscription_form]` shortcode path.

**Source**: `classes/Shortcode.php:40`

### `notifima_after_subscription_form`

Fires immediately after the shortcode-rendered subscribe form is output. Same shortcode-only scope as above.

**Source**: `classes/Shortcode.php:44`

### `notifima_before_subscribe_product`

Fires at the start of the REST `subscribe_user()` handler, before any validation (email format, product existence) runs.

| Argument | Type | Description |
|---|---|---|
| `$customer_email` | `string` | Raw, unsanitized email from the request |
| `$product_id` | `int` | Product ID being subscribed to |
| `$variation_id` | `int` | Variation ID, or `0` for a simple/non-variation subscribe |

**Source**: `classes/RestAPI/Controllers/Subscribers.php:209`

### `notifima_subscriber_added`

Fires after a new subscriber row has been successfully inserted and the confirmation emails triggered.

| Argument | Type | Description |
|---|---|---|
| `$customer_email` | `string` | The subscribed email address |

**Source**: `classes/RestAPI/Controllers/Subscribers.php:273`

## Settings

### `notifima_after_save_settings`

Fires after a settings tab's option value has been written via the REST `Settings::update_item()` handler.

| Argument | Type | Description |
|---|---|---|
| `$settings_key` | `string` | The settings tab key (underscored, e.g. `automation`) |
| `$settings` | `array` | The new settings value just saved |

**Source**: `classes/RestAPI/Controllers/Settings.php:76`

## Third-party pass-through

- `do_action( 'wpml_switch_language', $product_language )` — `classes/Emails/ProductBackInStockEmail.php:81`. Re-fires WPML's own core action to temporarily switch the active language while building a translated email; not a hook this plugin defines.

## Legacy aliases

7 of the hooks above also fire under a deprecated pre-rename name for backward compatibility — see [README.md](README.md)'s "Legacy hook compatibility shim" section for the mechanism and the full current→legacy map.
