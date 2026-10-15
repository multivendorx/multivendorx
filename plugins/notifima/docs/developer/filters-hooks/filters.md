# PHP Filter Hooks

Every `apply_filters()` call this plugin defines as a real extension point.

## Table of Contents

- [Settings](#settings)
  - [`notifima_register_settings_keys`](#notifima_register_settings_keys)
  - [`notifima_additional_tabs_names`](#notifima_additional_tabs_names)
- [Subscription Flow](#subscription-flow)
  - [`notifima_pro_subscribers_list`](#notifima_pro_subscribers_list-naming-outlier)
  - [`notifima_all_subscribers_list`](#notifima_all_subscribers_list)
  - [`notifima_eligible_to_subscribe`](#notifima_eligible_to_subscribe)
- [Emails](#emails)
  - [`notifima_customer_subscription_admin_email_subject`](#notifima_customer_subscription_admin_email_subject)
  - [`notifima_customer_subscription_admin_email_heading`](#notifima_customer_subscription_admin_email_heading)
  - [`notifima_customer_subscription_email_subject`](#notifima_customer_subscription_email_subject)
  - [`notifima_customer_subscription_email_heading`](#notifima_customer_subscription_email_heading)
  - [`notifima_subscribe_product_back_stock_email_subject`](#notifima_subscribe_product_back_stock_email_subject)
  - [`notifima_subscribe_product_back_stock_email_heading`](#notifima_subscribe_product_back_stock_email_heading)
  - [`product_backin_stock_send_admin`](#product_backin_stock_send_admin-naming-outlier)
- [Scripts & Assets](#scripts--assets)
  - [`notifima_register_scripts`](#notifima_register_scripts)
  - [`notifima_register_styles`](#notifima_register_styles)
  - [`admin_notifima_register_scripts`](#admin_notifima_register_scripts-naming-outlier)
  - [`admin_notifima_register_styles`](#admin_notifima_register_styles-naming-outlier)
  - [`notifima_subscribe_form_localize_data`](#notifima_subscribe_form_localize_data)
  - [`notifima_localize_scripts`](#notifima_localize_scripts)
- [Frontend / Blocks](#frontend--blocks)
  - [`notifima_initialize_blocks`](#notifima_initialize_blocks)
- [Licensing](#licensing)
  - [`kothay_dabba_notifima`](#kothay_dabba_notifima-naming-outlier)
  - [`notifima_update_pro_data`](#notifima_update_pro_data)
- [Third-party pass-through](#third-party-pass-through)
- [Legacy aliases](#legacy-aliases)

---

## Settings

### `notifima_register_settings_keys`

Filters the list of option keys the `Setting` service loads into its in-request cache at construction time. Default is `array_values( Utill::NOTIFIMA_SETTINGS )` (the four built-in settings groups) — add to this array to have a new option automatically cached/readable through `Notifima()->setting->get_setting()`/`get_option()`.

**Source**: `classes/Setting.php:80`

### `notifima_additional_tabs_names`

Filters the list of settings-tab keys `FrontendScripts::get_admin_settings()` iterates to build the `settings_databases_value` payload localized to the admin script. Default is `array_keys( Utill::NOTIFIMA_SETTINGS )`.

**Source**: `classes/FrontendScripts.php:228`

## Subscription Flow

### `notifima_pro_subscribers_list` (naming outlier)

Filters the entire REST response for `GET /subscribers` when the `export` request param is falsy (i.e. the normal, non-CSV-export list view). Default is an empty `rest_ensure_response( array() )` — **the free plugin's own list endpoint returns nothing by default for this code path**; `notifima-pro` is expected to supply the actual list contents via this filter. Named with a `_pro` infix, which the parent repo's `.claude/rules/php-wordpress.md` explicitly says not to do even for Pro-facing hooks — flagged as a naming outlier, not a template to copy.

| Argument | Type | Description |
|---|---|---|
| `$response` | `WP_REST_Response` | The empty default response |
| `$request` | `WP_REST_Request` | The original request object |

**Source**: `classes/RestAPI/Controllers/Subscribers.php:105`

### `notifima_all_subscribers_list`

Filters each individual subscriber row when `GET /subscribers?export=1` builds its full CSV-export dataset (the `export` code path, separate from the one above).

| Argument | Type | Description |
|---|---|---|
| `$row` | `array` | `id`, `date`, `email`, `status`, `status_key`, `reg_user`, `user_link`, `product`, `product_id`, `image` |
| `$subscriber` | `object` | The raw `notifima_subscribers` table row |

**Source**: `classes/RestAPI/Controllers/Subscribers.php:136`

### `notifima_eligible_to_subscribe`

Filters whether a subscribe attempt should proceed, after the already-subscribed check but before the row is inserted — the extension point for adding custom eligibility rules (e.g. a banned-domain check, referenced by `set_default_value()`'s `ban_email_domain_text`/`ban_email_address_text` default strings, though no code applies this filter to actually implement that ban in the free plugin — likely a `notifima-pro` feature).

| Argument | Type | Description |
|---|---|---|
| `$status` | `array` | `array( 'status' => true, 'message' => '' )` by default |
| `$customer_email` | `string` | The subscribing email |
| `$product_id` | `int` | The product/variation ID |

**Source**: `classes/RestAPI/Controllers/Subscribers.php:253`

## Emails

Each of the three `WC_Email` subclasses exposes subject/heading filters following the same shape (default subject/heading text, filtered by `$this->object` — the current recipient/product context):

### `notifima_customer_subscription_admin_email_subject`
**Source**: `classes/Emails/AdminNewSubscriberEmail.php:91`

### `notifima_customer_subscription_admin_email_heading`
**Source**: `classes/Emails/AdminNewSubscriberEmail.php:100`

### `notifima_customer_subscription_email_subject`
**Source**: `classes/Emails/SubscriberConfirmationEmail.php:83`

### `notifima_customer_subscription_email_heading`
**Source**: `classes/Emails/SubscriberConfirmationEmail.php:93`

### `notifima_subscribe_product_back_stock_email_subject`
**Source**: `classes/Emails/ProductBackInStockEmail.php:106`

### `notifima_subscribe_product_back_stock_email_heading`
**Source**: `classes/Emails/ProductBackInStockEmail.php:116`

### `product_backin_stock_send_admin` (naming outlier)

Filters whether the back-in-stock email should also be sent to the admin/additional-alert address. Default `false`. Missing the `notifima_` prefix entirely, and uses `backin` where the class it belongs to (`ProductBackInStockEmail`) and every other hook in this section spell it `back_in`/`BackInStock` — a real, current-day inconsistency, not a legacy alias (compare the "Legacy aliases" section below, where this exact string appears as a *deprecated* alias of a differently-named filter — this one is a distinct, still-live filter with the same unfortunate name).

**Source**: `classes/Emails/ProductBackInStockEmail.php:86`

## Scripts & Assets

### `notifima_register_scripts`

Filters the array of additional frontend scripts to register, merged with the block scripts built from `$block_scripts`. Default `array()`.

**Source**: `classes/FrontendScripts.php:98`

### `notifima_register_styles`

Filters the array of frontend styles to register. Default includes `notifima-frontend-style`.

**Source**: `classes/FrontendScripts.php:130`

### `admin_notifima_register_scripts` (naming outlier)

Filters the array of admin scripts to register (`notifima-components-script`, `notifima-admin-script`). Prefix segments are in reversed order compared to this codebase's `notifima_admin_*` convention seen elsewhere (e.g. compare `notifima_additional_tabs_names` above) — should read `notifima_admin_register_scripts`.

**Source**: `classes/FrontendScripts.php:182`

### `admin_notifima_register_styles` (naming outlier)

Same reversed-prefix pattern as above, for admin styles (`notifima-admin-style`).

**Source**: `classes/FrontendScripts.php:207`

### `notifima_subscribe_form_localize_data`

Filters the data object localized to the `notifima-subscribe-form` script handle (`subscription` JS global). Default includes `khali_dabba` (license state), `lead_time`, `display_type`.

**Source**: `classes/FrontendScripts.php:284`

### `notifima_localize_scripts`

Filters the entire script-handle → localize-config map before it's consumed by `localize_scripts( $handle )` — the broadest of the localization filters, letting a caller add/replace an entire handle's config rather than just its `data` sub-key.

**Source**: `classes/FrontendScripts.php:295`

## Frontend / Blocks

### `notifima_initialize_blocks`

Filters the list of discovered Gutenberg blocks (name/textdomain/path tuples) before registration — see [../frontend/subscription-forms.md](../frontend/subscription-forms.md) for the discovery mechanism this filters the output of.

**Source**: `classes/Block.php:84`

## Licensing

### `kothay_dabba_notifima` (naming outlier)

Backs `Utill::is_khali_dabba()` — returns whether the Pro plugin is active/licensed. Default `false`. Prefix segments are in reversed order (product name last, not first) compared to this codebase's convention — a deliberately playful name (mirrors the `is_khali_dabba()`/`kothay_dabba` naming used across this product family's license-check filters, not unique to this plugin) but still an outlier against the `notifima_`-prefix-first convention; don't use this ordering for a new hook.

**Source**: `classes/Utill.php:109`

### `notifima_update_pro_data`

Filters the `pro_data` object localized to the admin script (`version`, `manage_plan_url`) — the extension point `notifima-pro` uses to report its actual installed version/plan info back into the free plugin's admin header UI.

**Source**: `classes/FrontendScripts.php:272`

## Third-party pass-through

- `apply_filters( 'wpml_element_trid', ... )` / `apply_filters( 'wpml_get_element_translations', ... )` — `classes/Subscriber.php:454,456`. Re-fire WPML's own core filters to resolve translated product IDs; not hooks this plugin defines.
- `apply_filters( 'wpml_post_language_details', ... )` — `classes/Emails/ProductBackInStockEmail.php:79`. Same, resolves the product's WPML language code before switching languages to build a translated email.

## Legacy aliases

23 of the hooks above also fire under a deprecated pre-rename name for backward compatibility — see [README.md](README.md)'s "Legacy hook compatibility shim" section for the mechanism and the full current→legacy map.
