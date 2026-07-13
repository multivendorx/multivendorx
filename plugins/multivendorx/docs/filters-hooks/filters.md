# PHP Filter Hooks

## Overview

Every `apply_filters()` this plugin defines, grepped from `classes/` and `modules/` — same table-per-domain format as [actions.md](actions.md), for the same reason (volume). Domain names match between the two files where a domain has both kinds of hooks, so you can cross-reference.

Filters inside vendored/third-party files, and calls that just re-fire a WC/WP/third-party-plugin core filter tag, are listed separately at the end.

## Table of Contents

- [Settings & System Status](#settings--system-status)
- [Admin Dashboard & Modules](#admin-dashboard--modules)
- [Scripts & Localization](#scripts--localization)
- [Stores](#stores)
- [Payments & Commissions](#payments--commissions)
- [Orders & Shipping](#orders--shipping)
- [Products](#products)
- [Notifications](#notifications)
- [Staff, Roles & Licensing](#staff-roles--licensing)
- [Analytics & Reports](#analytics--reports)
- [Elementor Module](#elementor-module)
- [Refund Module](#refund-module)
- [Naming outliers found in this survey](#naming-outliers-found-in-this-survey)
- [Third-party passthroughs (not new filters)](#third-party-passthroughs-not-new-filters)

## Settings & System Status

| Filter | Source | Filters | Notes |
|---|---|---|---|
| `multivendorx_register_settings_keys` | `classes/Setting.php:87` | The merged array of registered settings-tab keys | Docblock: "Filter for register settings key's." — the exact filter the parent repo's `.claude/rules/backward-compatibility.md` names as Pro's settings-registration extension point |
| `multivendorx_additional_tabs_names` | `classes/FrontendScripts.php:236` | The list of settings-tab names enumerated for localization | Same backward-compatibility.md reference |
| `multivendorx_current_subscription_plan` | `classes/Status.php:51` | The displayed subscription-plan label (default `'Free'`) in system-status output | Pro/license-tier override point |
| `multivendorx_system_info_response` | `classes/Status.php:85` | The full system-info REST response array | |
| `multivendorx_update_pro_data` | `classes/FrontendScripts.php:427` | Pro-plan/version metadata surfaced to admin JS (`version`, `manage_plan_url`) | Explicit Pro extension point by name |

## Admin Dashboard & Modules

| Filter | Source | Filters | Notes |
|---|---|---|---|
| `multivendorx_submenus` | `classes/Admin.php:80` | The admin submenu tab array before registration | See [../admin/dashboard.md](../admin/dashboard.md) |
| `multivendorx_module_sources` | `classes/Modules.php:89` | The array of `{path, namespace}` module-source registrations | **The** filter every Pro plugin uses to register its `modules/` dir — see `.claude/rules/module-architecture.md` |
| `dashboard_other_endpoints` | `classes/RestAPI/Controllers/Dashboard.php:64` | The "other" (non-base) dashboard endpoint registry | **Naming note**: missing the `multivendorx_` prefix entirely. See [../frontend/store-dashboard.md](../frontend/store-dashboard.md) |
| `multivendorx_dashboard_menu` | `classes/RestAPI/Controllers/Dashboard.php:261` | The final assembled dashboard menu/endpoint list, post-processing step | Can be bypassed entirely by a saved "Menu Manager" setting — see [../frontend/store-dashboard.md](../frontend/store-dashboard.md) |

## Scripts & Localization

| Filter | Source | Filters | Notes |
|---|---|---|---|
| `multivendorx_shortcode_frontend_assets` | `classes/Shortcode.php:113` | The per-shortcode script/style asset registry | |
| `multivendorx_dashboard_style_queue` | `classes/Shortcode.php:185` | Which enqueued styles get dequeued on the store-dashboard page | |
| `multivendorx_initialize_blocks` | `classes/Block.php:89` | The discovered Gutenberg block list before registration | |
| `multivendorx_register_scripts` | `classes/FrontendScripts.php:98` | The frontend script-registration array (handle → src/deps) | |
| `multivendorx_register_styles` | `classes/FrontendScripts.php:128` | The frontend style-registration array | |
| `admin_multivendorx_register_scripts` | `classes/FrontendScripts.php:186` | Admin-side script registration | **Naming note**: prefix order reversed (`admin_multivendorx_` not `multivendorx_admin_`) |
| `admin_multivendorx_register_styles` | `classes/FrontendScripts.php:215` | Admin-side style registration | Same reversed-prefix quirk |
| `multivendorx_admin_localize_scripts` | `classes/FrontendScripts.php:397` | The full `wp_localize_script` data payload for admin scripts (`appLocalizer` shape) | |
| `multivendorx_dashboard_localize_scripts` | `classes/FrontendScripts.php:454` | The full localized data object for the vendor store-dashboard bundle | |
| `multivendorx_add_content_before_form` | `classes/FrontendScripts.php:504`, `519` | HTML injected before the store-registration form, default `''` | Two call sites: logged-out vs. logged-in localization variant |
| `multivendorx_add_content_after_form` | `classes/FrontendScripts.php:505`, `520` | HTML injected after the store-registration form, default `''` | Same two-call-site pattern |
| `multivendorx_store_frontend_localize_scripts` | `classes/FrontendScripts.php:586` | The `StoreInfo` global's localized payload for storefront Gutenberg blocks | `StoreInfo` is the untyped global flagged in `.claude/rules/react-frontend.md` |
| `multivendorx_localize_scripts` | `classes/FrontendScripts.php:600` | The entire handle-keyed localize-scripts config map | Umbrella filter wrapping every handle-specific one above |

## Stores

| Filter | Source | Filters | Notes |
|---|---|---|---|
| `multivendorx_store_tabs` | `classes/Store/StoreUtil.php:140` | The store-profile tab list | `$store_id` passed |
| `multivendorx_get_store_url` | `classes/Store/StoreUtil.php:192` | The constructed store URL | |
| `multivendorx_store_info` | `classes/Store/StoreUtil.php:787` | The assembled store-info array | `$info`, `$store_obj` |
| `multivendorx_rewrite_rules` | `classes/Store/Rewrites.php:153` | Custom rewrite-rule tuples before `add_rewrite_rule()` | |
| `multivendorx_query_vars` | `classes/Store/Rewrites.php:170` | The registered custom query-vars array | |
| `multivendorx_store_elementor_template` | `classes/Store/Rewrites.php:261` | An override template path for the store page rendered via Elementor, default `''` | Pro extension point (Elementor theme-builder override) |
| `multivendorx_rest_store_handlers` | `classes/RestAPI/Controllers/Stores.php:253` | The `$flag_map` (request-param → handler-method-name) dispatch table for `get_items` | Pro extension point (adds new list "flags") |
| `$method` (dynamic) | `classes/RestAPI/Controllers/Stores.php:259` | — | **Unusual**: the filter *tag itself* is the runtime value of `$method`, not a literal — only invoked as a fallback when `method_exists($this, $method)` is false, i.e. for flags Pro registers without a matching PHP method |
| `multivendorx_stores_details` | `classes/RestAPI/Controllers/Stores.php:353` | The fully-formatted single-store details array in the main store list response | |
| `multivendorx_stores` | `classes/RestAPI/Controllers/Stores.php:451` | A lighter per-store array (id/name/slug/status) in a dropdown/options-style endpoint | **Same tag name reused with a different shape** at `Notifications.php:248` — see naming-outliers section |
| `multivendorx_before_store_update` | `classes/RestAPI/Controllers/Stores.php:930` | Incoming `$data` before any store-update branching | `$store`, `$request` |
| `multivendorx_follow_button_html` | `modules/FollowStore/Frontend.php:98` | The rendered Follow-button HTML string | `store_id`, `current_user_id` |

## Payments & Commissions

| Filter | Source | Filters | Notes |
|---|---|---|---|
| `multivendorx_stripe_account_id` | `classes/Payments/StripeConnect.php:162`, `233` | The resolved Stripe connected-account id | Second call site is in the payout-completion path |
| `multivendorx_stripe_disconnect_url` | `classes/Payments/StripeConnect.php:184` | Stripe-disconnect admin-post URL shown in settings UI | |
| `multivendorx_stripe_connect_url` | `classes/Payments/StripeConnect.php:198` | Stripe-connect admin-post URL | |
| `multivendorx_paypal_receiver_email` | `classes/Payments/PaypalPayout.php:136` | The PayPal receiver email for split payouts | |
| `multivendorx_payment_providers` | `classes/Payments/Payments.php:63` | The full payment-provider registry array | Pro extension point (adds gateways) |
| `multivendorx_store_order_items_commission_rates` | `classes/Commission/CommissionManager.php:79` | The per-item commission-rate array saved to suborder meta | |
| `multivendorx_before_commission_insert` | `classes/Commission/CommissionManager.php:139`, `702` | The `{data, format}` pair right before `$wpdb->insert()` into the commission table | Database-write extension point; second call site is the refund-insert path |
| `multivendorx_get_commission_line_total` | `classes/Commission/CommissionManager.php:470` | The computed line-item total before commission math | |
| `multivendorx_get_commission_amount` | `classes/Commission/CommissionManager.php:478` | The resolved commission-amount object | |
| `multivendorx_admin_pay_commission_more_than_order_amount` | `classes/Commission/CommissionManager.php:490` | Boolean gate on whether commission can exceed order-item value, default `true` | |
| `store_commission_amount` | `classes/Commission/CommissionManager.php:495` | The final per-item commission amount | **Naming note**: no `multivendorx_` prefix — see naming-outliers section |
| `multivendorx__category_wise_commission` | `classes/Commission/CommissionManager.php:596` | The resolved category-based commission object | **Naming note**: double underscore typo (`multivendorx__category...`) |
| `multivendorx_regenerate_order_commissions_statuses` | `classes/Order/Admin.php:130` | Which order statuses are eligible for commission regeneration | |
| `multivendorx_commission_formatted` | `classes/RestAPI/Controllers/Commissions.php:428` | The fully-formatted commission REST response array before return | |

## Orders & Shipping

| Filter | Source | Filters | Notes |
|---|---|---|---|
| `multivendorx_sold_by_text` | `classes/Order/Hooks.php:200`, `modules/Privacy/Frontend.php:81`, `106` | The "Sold By" label text used in order-item/cart/shop display | Same tag, three call sites, different rendering contexts |
| `multivendorx_order_parent_filter` | `classes/Order/OrderManager.php:69` | The default `parent` param (0) used in the store-order query filter | |
| `multivendorx_order_available_coupon_types` | `classes/Order/OrderManager.php:419` | Which coupon discount types are eligible for suborder coupon-item creation | |
| `multivendorx_admin_store_shop_order_edit_url` | `classes/Order/Admin.php:77` | The admin edit-order URL shown in the admin order list's suborder markup | |
| `multivendorx_my_account_refund_request_button_text` | `modules/MarketplaceRefund/Frontend.php:97` | The "Request a refund" button label on My Account order view | |
| `multivendorx_my_account_refund_reason_label` | `modules/MarketplaceRefund/Frontend.php:147` | The refund-reason section heading text | |
| `multivendorx_my_account_refund_order_messages` | `modules/MarketplaceRefund/Frontend.php:262` | The full map of refund status message strings | |
| `multivendorx_refund_order_default_days_limit` | `modules/MarketplaceRefund/Frontend.php:276` | The fallback refund-window day count (default `10`) | |
| `multivendorx_allow_refund_parent_order` | `modules/MarketplaceRefund/Rest.php:363` | Boolean gate on whether the parent order also gets refunded, default `true` | |
| `multivendorx_is_allow_checkout_user_location` | `modules/StoreShipping/Frontend.php:193`, `233` | Boolean gate on the delivery-location field/map widget at checkout | Two call sites |
| `multivendorx_is_apply_tax_on_shipping_rates` | `modules/StoreShipping/Country_Shipping.php:114`, `modules/StoreShipping/Distance_Shipping.php:157` | Whether tax status applies to computed shipping rate | Same tag, country vs. distance shipping variants |
| `multivendorx_free_shipping_minimum_order_amount` | `modules/StoreShipping/Country_Shipping.php:163` | The per-store free-shipping threshold amount | `$store_id` |
| `multivendorx_free_shipping_threshold_consider_tax` | `modules/StoreShipping/Country_Shipping.php:207`, `modules/StoreShipping/Distance_Shipping.php:266` | Whether tax counts toward the free-shipping threshold | Country vs. distance variants |
| `multivendorx_shipping_country_calculate_amount` | `modules/StoreShipping/Country_Shipping.php:222`, `281` | Computed country-shipping amount | Two call sites: free-shipping-met early return, and final computed amount |
| `multivendorx_shipping_distance_calculate_amount` | `modules/StoreShipping/Distance_Shipping.php:285` | Final computed distance-based shipping amount | |
| `multivendorx_get_shipping_methods_for_shipping_address` | `modules/StoreShipping/Zone_Shipping.php:264` | Resolved shipping-method list for a package/store address | |
| `multivendorx_get_rates_for_custom_shipping` | `modules/StoreShipping/Zone_Shipping.php:373` | Computed custom-shipping rates array before sending to WooCommerce | |
| `multivendorx_store_before_add_shipping_rates` | `modules/StoreShipping/Zone_Shipping.php:378` | Each individual rate object right before `$this->add_rate()` | |
| `multivendorx_free_shipping_is_available` | `modules/StoreShipping/Zone_Shipping.php:434` | Whether free shipping is available for a package/method | |
| `multivendorx_get_store_shipping_method_id` | `modules/StoreShipping/Zone_Shipping.php:548` | The constructed compound rate id string | |
| `multivendorx_allow_supported_shipping_in_store_shipping_package` | `modules/StoreShipping/Zone_Shipping.php:586` | Boolean gate on filtering non-MultiVendorX rates out of the package | |

## Products

| Filter | Source | Filters | Notes |
|---|---|---|---|
| `multivendorx_get_excluded_products` | `classes/Store/StoreUtil.php:649`, `678` | Whether a product should be excluded from listings | Two call sites: early-return path (no `$store_id` yet), and full path with `$store_id` |
| `multivendorx_rest_prepare_product_add_store_data` | `classes/RestAPI/Rest.php:92` | The REST product response after store_id/name/slug are attached | **Bug**: the `apply_filters()` return value is never reassigned back to `$response` — as written, this filter currently has no effect on the returned data |
| `multivendorx_sku_generator_attribute_separator` | `classes/RestAPI/Rest.php:590` | The separator string used when generating variation SKUs from attributes | |
| `multivendorx_sku_separator` | `classes/RestAPI/Rest.php:607` | The default SKU separator (`'-'`) | |
| `multivendorx_shared_listing_products_query_limit` | `modules/SharedListing/Frontend.php:97` | The row LIMIT for the shared-listing products query, default `100` | |
| `multivendorx_ai_image_generation` | `modules/Intelligence/Rest.php:53` | Replaces the REST response for the AI image-generation endpoint | Free tier has no real implementation — a Pro-fill point |
| `multivendorx_show_report_abuse_link` | `modules/MarketplaceCompliance/Frontend.php:95` | Boolean gate on displaying the "Report Abuse" link on product pages | `$product` |
| `multivendorx_report_abuse_text` | `modules/MarketplaceCompliance/Frontend.php:96` | The "Report Abuse" link label text | `$product` |
| `multivendorx_sold_by_text_in_cart_checkout` | `modules/Privacy/Frontend.php:76` | Boolean gate on whether "Sold By" text shows in cart/checkout | `product_id` |
| `multivendorx_sold_by_text_after_products_shop_page` | `modules/Privacy/Frontend.php:102` | Boolean gate for "Sold By" text after shop/single-product listings | `post->ID` |
| `multivendorx_bp_shop_product_query_args` | `modules/BuddyPress/Functions.php:125` | `WP_Query` args for a vendor's BuddyPress-profile shop tab | `$user_id`, store-id array |

## Notifications

| Filter | Source | Filters | Notes |
|---|---|---|---|
| `multivendorx_system_events` | `classes/Notifications/Notifications.php:70` | The entire notification-events registry (name/desc per event key) | Pro extension point (adds new notification event types) |
| `multivendorx_available_sms_gateways` | `classes/Notifications/Notifications.php:2001` | The SMS gateway registry (`twilio`, `vonage`, `clickatell`, `plivo`) | |
| `multivendorx_stores` | `classes/RestAPI/Controllers/Notifications.php:248` | A per-notification formatted store array | **Same tag name reused with a different shape** at `Stores.php:451` — see naming-outliers section |

## Staff, Roles & Licensing

| Filter | Source | Filters | Notes |
|---|---|---|---|
| `multivendorx_modify_permissions` | `classes/Utill.php:602` | The default store-owner permissions array | Pro extension point |
| `multivendorx_store_capabilities` | `classes/Store/StoreUtil.php:306` | The store-owner capability list | Docblock: "Allows developers to add, modify, or remove store capabilities." |
| `kothay_dabba_multivendorx` | `classes/Utill.php:365` | Used by `is_khali_dabba()`, a license-check helper | **Naming note**: Bengali-slang-derived internal name, not `multivendorx_`-prefixed at all |

## Analytics & Reports

| Filter | Source | Filters | Notes |
|---|---|---|---|
| `multivendorx_approval_queue_count` | `classes/Store/StoreUtil.php:945` | The computed pending-approval badge count (coupons + withdrawals + deactivation requests) | Feeds the admin sidebar count badge — see [../admin/dashboard.md](../admin/dashboard.md) |
| `multivendorx_compliance_count` | `classes/Store/StoreUtil.php:953` | The compliance-tab badge count, default `0` | Pro-fillable |
| `multivendorx_customer_tab_count` | `classes/Store/StoreUtil.php:961` | The customer-tab badge count, default `0` | Pro-fillable |
| `multivendorx_clear_all_transients_included_store_id` | `classes/RestAPI/Controllers/Status.php:140` | The list of transient-name prefixes that get a store_id suffix appended before deletion | |
| `multivendorx_store_before_transients_to_clear` | `classes/RestAPI/Controllers/Status.php:156` | The final fully-qualified transient names right before the delete loop | |
| `multivendorx_store_clear_all_transients` | `classes/RestAPI/Controllers/Status.php:169` | (action, see [actions.md](actions.md)) — cross-referenced here since it's part of the same cache-clear flow | |

See [../analytics/reports.md](../analytics/reports.md) for the WooCommerce Analytics report-scoping filters (a related but separate mechanism, using core WC filter tags rather than these custom ones).

## Elementor Module

| Filter | Source | Filters |
|---|---|---|
| `multivendorx_elementor_widgets` | `modules/Elementor/WidgetLoader.php:69` | The widget-file-to-class registry. Docblock: "Allow modules to add or modify widgets." |
| `multivendorx_elementor_widget_path` | `modules/Elementor/WidgetLoader.php:81` | An individual widget's file path. Docblock: "Allow modules to override widget file path." |
| `multivendorx_elementor_tag_files` | `modules/Elementor/WidgetLoader.php:114` | The glob'd list of Elementor dynamic-tag PHP files. |
| `multivendorx_elementor_tag_class` | `modules/Elementor/WidgetLoader.php:130` | The resolved fully-qualified class name for a dynamic tag. |
| `multivendorx_elementor_tags_store_info_value` | `modules/Elementor/Tags/StoreInfo.php:103` | The final store-info value rendered by the Elementor dynamic tag. |

## Refund Module

See [Orders & Shipping](#orders--shipping) above — all `MarketplaceRefund` filters are grouped there since they're all order/refund-flow concerns.

## Naming outliers found in this survey

Don't replicate any of these in new code — this repo's convention is `multivendorx_` snake_case, no prefix reordering, no third-party naming borrowed in:

- **Reused tag, different shape**: `multivendorx_stores` (`Notifications.php:248` vs. `Stores.php:451`) and `multivendorx_sold_by_text` (three call sites, consistent shape — less of a concern, listed for completeness).
- **Missing `multivendorx_` prefix**: `dashboard_other_endpoints`, `store_commission_amount`.
- **Reversed prefix order**: `admin_multivendorx_register_scripts` / `admin_multivendorx_register_styles` (should read `multivendorx_admin_...` per convention).
- **Double-underscore typo**: `multivendorx__category_wise_commission`.
- **Non-`multivendorx_` internal name**: `kothay_dabba_multivendorx` (license-check helper).
- **Dynamic filter tag from a variable**: `classes/RestAPI/Controllers/Stores.php:259` fires `apply_filters( $method, ... )` where `$method` is itself a runtime string — distinct from the `{$interpolated_var}` pattern seen in dynamic action names elsewhere (e.g. `multivendorx_process_{$payment_method}_payment`), since here the *entire* tag is a variable, not a literal with one interpolated segment.

## Third-party passthroughs (not new filters)

- `wpml_active_languages`, `wpml_copy_post_to_language` — `modules/WPML/Rest.php:111`, `226` — calls into WPML's own filters, not this plugin's.
- `bp_core_template_plugin` — `modules/BuddyPress/Functions.php:50` — re-fires a BuddyPress core filter tag.
- `woocommerce_evaluate_shipping_cost_args` — `modules/StoreShipping/Zone_Shipping.php:87` — re-fires a WooCommerce core filter tag.

See [actions.md](actions.md) for the corresponding action-hook reference, and [js-extension-points.md](js-extension-points.md) for the JS/TS side.
