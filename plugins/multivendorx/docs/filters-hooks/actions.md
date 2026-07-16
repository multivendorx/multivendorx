# PHP Action Hooks

## Overview

Every `do_action()` this plugin defines, grepped from `classes/` and `modules/`. **Format note**: unlike the parent repo's `multivendorx-pro` docs (which use one `###` heading per hook), this file uses a table per domain — this plugin defines roughly 8x as many hooks, and a heading-per-hook format at this volume would be harder to scan, not easier. Every row is still a real, grep/read-verified hook with a file:line citation; see [README.md](README.md) for the per-hook lookup convention this replaces.

Hooks that just re-fire a WordPress/WooCommerce core action tag (not a new hook this plugin defines) are listed separately at the end, not mixed into the domain tables.

## Table of Contents

- [Bootstrap & Install](#bootstrap--install)
- [Payments & Commissions](#payments--commissions)
- [Orders & Shipping](#orders--shipping)
- [Stores](#stores)
- [Products](#products)
- [Notifications](#notifications)
- [Modules & Dashboard Registration](#modules--dashboard-registration)
- [Settings](#settings)
- [Compliance & Refund Modules](#compliance--refund-modules)
- [Re-fired core hooks (not new hooks)](#re-fired-core-hooks-not-new-hooks)

## Bootstrap & Install

| Hook | Source | Fires when |
|---|---|---|
| `multivendorx_loaded` | `classes/MultiVendorX.php:187` | End of `init_plugin()`, after all core classes are constructed and active modules loaded. **This is the hook `multivendorx-pro`'s bootstrap gates its own `init_classes()` on** — see [../architecture.md](../architecture.md) and the parent repo's `.claude/rules/plugin-families.md`. |
| `multivendorx_after_installed` | `classes/Install.php:193` | End of `Install`'s constructor logic, after `update_option('multivendorx_version', ...)` — once per activation/migration run. |

## Payments & Commissions

| Hook | Source | Fires when | Args/notes |
|---|---|---|---|
| `multivendorx_process_{$payment_method}_payment` | `classes/Payments/PaymentProcessor.php:134` | Inside payment dispatch, routing to the store's configured gateway | `$payment_method` is the gateway slug, interpolated — not a literal string |
| `multivendorx_handle_additional_receiver_payment` | `classes/Payments/PaymentProcessor.php:154` | In `after_payment_complete()`, only when `$additional_receiver > 0` (split-payment scenario) | |
| `multivendorx_after_payment_complete` | `classes/Payments/StripeConnect.php:240` | After a Stripe Connect transfer completes | `store_id, method, status, order, transaction, note, amount, additional_receiver` |
| `multivendorx_after_payment_complete` | `classes/Payments/BankTransfer.php:207` | After marking a bank-transfer payment successful | Same tag as above, different gateway |
| `multivendorx_after_payment_complete` | `classes/Payments/CashPayment.php:67` | Cash-gateway `process_payment()` | Same tag |
| `multivendorx_after_payment_complete` | `classes/Payments/PaypalPayout.php:166` | After a PayPal payout batch request resolves | Same tag |
| `multivendorx_after_payment_complete` | `classes/Payments/CustomPayment.php:79` | Custom/manual gateway's `process_payment()` | Same tag — 6 gateways total fire this one tag |
| `multivendorx_process_{$payment_method}_payment` | `classes/RestAPI/Controllers/Transactions.php:380` | Directly from the withdrawal-request REST handler, for automatic-withdrawal gateways (`stripe-connect`/`paypal-payout`) | Same dynamic tag as `PaymentProcessor.php:134` |
| `multivendorx_after_create_transaction` | `classes/Transaction/Transaction.php:148` | End of transaction-creation, after the commission status is marked `paid` | |
| `multivendorx_after_insert_commission_refunds` | `classes/Commission/CommissionManager.php:719` | After `$wpdb->update()` on the commission table during refund processing | `store_order, commission_id` |
| `multivendorx_after_calculate_commission` | `classes/Commission/Hooks.php:46` | In `create_commission()`, right after commission_id/processed meta set on the suborder | |
| `multivendorx_after_create_commission_refunds` | `classes/Commission/Hooks.php:86` | After refund meta (`store_id`, `_commission_refund_processed`) is saved | |

## Orders & Shipping

| Hook | Source | Fires when | Args/notes |
|---|---|---|---|
| `multivendorx_checkout_store_order_processed` | `classes/Order/OrderManager.php:145` | A brand-new (not pre-existing) suborder is created during checkout order splitting | |
| `multivendorx_before_create_sub_order` | `classes/Order/OrderManager.php:255` | Just before returning the new suborder, after `calculate_totals()` | Docblock: "Action hook to adjust order before save." |
| `multivendorx_before_create_sub_order_line_item` | `classes/Order/OrderManager.php:348` | Per line item, before `$order->add_item($item)` | |
| `multivendorx_before_create_sub_order_shipping_item` | `classes/Order/OrderManager.php:389` | Per shipping item, before adding to the suborder | |
| `multivendorx_before_create_sub_order_coupon_item` | `classes/Order/OrderManager.php:446` | Per coupon item, before adding to the suborder, after stripping `used_by` | |
| `multivendorx_add_shipping_package_meta` | `classes/Order/Hooks.php:131` | Inside `add_metadate_for_shipping_item()`, only for top-level (non-suborder) items | |
| `multivendorx_after_add_suborder_details_admin` | `classes/Order/Admin.php:90` | Per-suborder, inside the admin order-list loop that prints suborder markup | |
| `multivendorx_shipment_tracking` | `classes/RestAPI/Controllers/Tracking.php:99` | End of the tracking-save REST handler, after a notification helper call | `$order_id` |

## Stores

| Hook | Source | Fires when | Args/notes |
|---|---|---|---|
| `multivendorx_after_store_registration_complete` | `classes/RestAPI/Controllers/Stores.php:651` | After setting primary owner + `active_store` user meta during self-service registration | |
| `multivendorx_after_store_active` | `classes/RestAPI/Controllers/Stores.php:682` | New store's status is `'active'` at registration time | |
| `multivendorx_after_store_active` | `classes/RestAPI/Controllers/Stores.php:1059` | Admin store-approval handler, after setting role `store_owner` + status `active` | Same tag as above, admin-approval path |
| `multivendorx_store_meta_updated` | `classes/RestAPI/Controllers/Stores.php:1209` | Per-key, inside a loop updating store meta from an admin edit request | `store_id, key, new value, previous value` |
| `multivendorx_after_store_active` | `classes/RestAPI/Controllers/Stores.php:1233` | After `$store->save()` when the resulting status is active (admin edit path) | Same tag, third call site |

## Products

| Hook | Source | Fires when | Args/notes |
|---|---|---|---|
| `multivendorx_notify_store_new_product_to_followers` | `classes/RestAPI/Rest.php:755` | Per-follower, when a product's REST status transitions draft/pending → publish | **Docblock drift**: the docblock actually sitting above this method describes a *coupon* notification ("Send notifications to store followers when a coupon is published") — copy-pasted from the coupon method below it, not accurate for this one. Worth fixing if touching this file. |
| `multivendorx_after_translated_new_product` | `modules/WPML/Rest.php:238` | After WPML's `wpml_copy_post_to_language` filter successfully returns a new translated product id | |
| `multivendorx_after_product_import` | `classes/RestAPI/Controllers/ImportDummyData.php:409` | After a dummy simple product is created and `store_id` meta set | Dev/demo-data tooling, not a production-facing extension point |
| `multivendorx_after_product_import` | `classes/RestAPI/Controllers/ImportDummyData.php:493` | Same tag, variable-product branch, after variation prices set | |

## Notifications

| Hook | Source | Fires when | Args/notes |
|---|---|---|---|
| `multivendorx_notify_{$type}` | `classes/Notifications/Notifications.php:2049` | End of the shared notification-dispatch helper | `$type` is the notification event key (e.g. `store_activated`), interpolated; `$payload` is the merged data array |
| `multivendorx_notify_store_new_coupon_to_followers` | `classes/RestAPI/Rest.php:817` | Per-follower, when a coupon's REST status transitions to publish | Docblock above `send_notifications()` correctly describes this one (see Products section above for the drifted copy) |
| `multivendorx_notify_report_abuse_submitted` | `modules/MarketplaceCompliance/Ajax.php:82` | AJAX report-abuse handler, after `Util::create_report_abuse()` succeeds | |
| `multivendorx_notify_product_question_reply` | `modules/CustomerQueries/Rest.php:349` | After an admin/vendor answers a customer product question | Passes customer contact info + store/product context |
| `multivendorx_notify_review_reply` | `modules/StoreReview/Rest.php:504` | After a store review reply is saved via `Util::update_review()` | |

## Modules & Dashboard Registration

| Hook | Source | Fires when | Args/notes |
|---|---|---|---|
| `multivendorx_activated_module_{$module_id}` | `classes/Modules.php:185` | Right after a module class is reflectively `new`'d in `load_active_modules()` | `$module_id` is the kebab-case folder-derived id — this is the exact mechanism [.claude/rules/module-architecture.md](../../../../.claude/rules/module-architecture.md) describes |
| `multivendorx_deactivated_module_{$module_id}` | `classes/Modules.php:290` | On `shutdown` (deferred), once per deactivated module id, only if the module's container instance existed | |
| `load_premium_simple_module` | `modules/Simple/Module.php:39` | `Simple` module's constructor, after `init_classes()` | **Naming note**: doesn't follow the `multivendorx_` convention at all — a third, one-off naming style distinct from both the current convention and the legacy `mvx_`/`vulocart_` prefixes. Don't replicate. |

## Settings

| Hook | Source | Fires when | Args/notes |
|---|---|---|---|
| `multivendorx_after_save_settings` | `classes/RestAPI/Controllers/Settings.php:148` | After `MultiVendorX()->setting->update_option()` in the settings REST save handler | `$settingsname`, raw settings payload |

## Compliance & Refund Modules

| Hook | Source | Fires when | Args/notes |
|---|---|---|---|
| `multivendorx_sub_order_refunded` | `modules/MarketplaceRefund/Rest.php:384` | After both suborder and parent-order refunds are created successfully | |

## Re-fired core hooks (not new hooks)

These call `do_action()` with a WordPress/WooCommerce core hook name, as a pass-through inside custom rendering logic — not a hook this plugin defines:

- `woocommerce_shop_loop` — `classes/RestAPI/Rest.php:951` (custom `WP_Query` loop for a REST-driven shop view), and `modules/BuddyPress/Functions.php:140` (BuddyPress profile shop tab)
- `woocommerce_no_products_found` — `classes/RestAPI/Rest.php:958`
- `woocommerce_review_posted` — `classes/RestAPI/Controllers/ImportDummyData.php:793` (dummy-review-import loop)

See [filters.md](filters.md) for the corresponding filter-hook reference, and [js-extension-points.md](js-extension-points.md) for the JS/TS side.
