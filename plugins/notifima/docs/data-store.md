# Data Store

## One custom table, not custom post types

This plugin used to store subscriber data as a custom post type (`woostockalert` posts, migrated away from — see `Install::old_migration()`/`Install::subscriber_migration()`, `classes/Install.php:63-249`). Today, subscriber data lives in a single dedicated `$wpdb` table, created in `Install::create_database_table()` (`classes/Install.php:256-282`):

```php
CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}notifima_subscribers` (
    `id` bigint(20) NOT NULL AUTO_INCREMENT,
    `product_id` bigint(20) NOT NULL,
    `user_id` bigint(20) NOT NULL DEFAULT 0,
    `email` varchar(50) NOT NULL,
    `status` varchar(20) NOT NULL,
    `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_product_email_status (product_id, email, status),
    PRIMARY KEY (`id`)
);
```

`status` is one of `subscribed` / `unsubscribed` / `mailsent` (see `Install::STATUS_MAP`, `classes/Install.php:26-30`, which maps the old post-status names to these). There is **no central `TABLES` constant** the way `multivendorx`'s `Utill::TABLES` registry works — this plugin owns exactly one table, so its name (`notifima_subscribers`) is inlined as a literal string at every call site (`classes/Subscriber.php`, `classes/Utill.php:169`) rather than referenced through a registry constant. If a second custom table is ever added here, introducing a `TABLES`-style constant at that point (rather than before) would match this codebase's "don't build for hypothetical future requirements" convention.

Two other real registries live in `Utill.php` worth knowing before adding a new setting or reading/writing product-level state:

- **`Utill::NOTIFIMA_SETTINGS`** (`classes/Utill.php:21-26`) — the four settings-tab option keys: `automation` → `notifima_automation_settings`, `subscription-form-designer` → `notifima_subscription_form_designer_settings`, `customer-messages` → `notifima_customer_messages_settings`, `notifications` → `notifima_notifications_settings`. New settings should be added through one of these existing option groups (or via the `notifima_register_settings_keys` filter, see [filters-hooks/filters.md](filters-hooks/filters.md)) rather than a bespoke `get_option()` call.
- **`Utill::NOTIFIMA_PRODUCT_META`** (`classes/Utill.php:28-31`) — the two WooCommerce product-meta keys this plugin owns: `subscribers` → `no_of_subscribers` (subscriber count, cached on the product itself, recalculated by `Subscriber::update_product_subscriber_count()`), `product_discontinued` → `product_discontinued` (a per-product/per-variation opt-out checkbox, see [admin/dashboard.md](admin/dashboard.md)). Both are plain `postmeta`, not part of the custom table — read/write them via `$product->get_meta()`/`update_meta_data()` (HPOS-safe, per the parent repo's `.claude/rules/woocommerce.md`), not raw `get_post_meta()`/`update_post_meta()`, except where existing code already does the latter (e.g. `Admin.php`'s bulk-action handler) — don't extend that pattern into new code.

## Schema changes: versioned migrations in `Install.php`

`Install`'s constructor (`classes/Install.php:42-58`) runs on activation and is re-invoked from `Notifima::handle_plugin_migration()` (`classes/Notifima.php:216-221`, hooked on `plugins_loaded`) whenever the stored `notifima_version` option is behind `NOTIFIMA_PLUGIN_VERSION`:

```php
public function __construct() {
    $previous_version = get_option( 'notifima_version', false );
    if ( ! $previous_version ) {
        $this->create_database_table();
        $this->set_default_settings();
        $this->old_migration();
    } else {
        $this->do_migration( $previous_version );
    }
    $this->start_cron_job();
    update_option( 'notifima_version', NOTIFIMA_PLUGIN_VERSION );
    do_action( 'notifima_updated' );
}
```

`do_migration( $previous_version )` (`classes/Install.php:91-158`) is a real, additive example to follow for a settings-shape change: its `< '3.1.0'` branch reshapes several boolean flags (`is_double_optin`, `is_enable_no_interest`, `is_enable_backorders`, `is_guest_subscriptions_enable`) into string-enum equivalents (`'confirm_via_email'`/`'subscribe_immediately'`, etc.) while merging them into the new `Utill::NOTIFIMA_SETTINGS` option groups — old option values are read and re-written under new keys, not dropped. `old_migration()` (`classes/Install.php:63-86`) additionally handles the one-time custom-post-type → custom-table data migration, itself deferred to a scheduled cron event (`wp_schedule_single_event( time(), 'notifima_start_subscriber_migration' )`) rather than run synchronously during activation — the correct pattern for an unbounded backfill per the parent repo's `.claude/rules/performance.md`, and `Install::is_migration_running()` (`classes/Install.php:165-171`) is checked elsewhere (`classes/Notifima.php:269-286`) to show an admin notice while it's in progress.

## Queries

Every query with a variable goes through `$wpdb->prepare()` — see `Subscriber::insert_subscriber()`/`is_already_subscribed()`/`update_product_subscriber_count()` (`classes/Subscriber.php`) for the pattern in consistent use. One exception, flagged rather than silently followed: `Utill::get_subscribers()` (`classes/Utill.php:162-177`) builds an `IN (...)` clause by `absint()`-casting each product ID and `implode()`-ing them directly into the SQL string instead of using `$wpdb->prepare()`'s array-expansion — safe in practice because every value is `absint()`-cast first, but inconsistent with this plugin's own prevailing pattern; follow the `$wpdb->prepare()`-everywhere convention for new code rather than this one's shortcut.

There's no per-entity static cache layer here (no `Store.php`-style cache-by-id pattern) — the query volume in this plugin doesn't currently warrant one; `Setting::$settings_cache` and `FrontendScripts::$settings_cache` are the closest equivalents, both request-scoped and populated once from `get_option()`, not from the custom table.
