# Data Store

## Custom tables, not custom post types

Marketplace data lives in dedicated `$wpdb` tables, named centrally in `Utill::TABLES` (`classes/Utill.php:36-51`) — this plugin **owns** this registry; every Pro plugin references the same constant:

```php
const TABLES = array(
    'commission'       => 'multivendorx_commissions',
    'store'            => 'multivendorx_stores',
    'store_users'      => 'multivendorx_store_users',
    'store_meta'       => 'multivendorx_store_meta',
    'transaction'      => 'multivendorx_transactions',
    'customer_queries' => 'multivendorx_customer_queries',
    'report_abuse'     => 'multivendorx_report_abuse',
    'review'           => 'multivendorx_store_reviews',
    'rating'           => 'multivendorx_store_review_ratings',
    'shared_listing'   => 'multivendorx_shared_listing_mapping',
    'notifications'    => 'multivendorx_store_activity_notifications',
    'system_events'    => 'multivendorx_system_events',
    'visitors_stats'   => 'multivendorx_visitors_stats',
    'activity_logs'    => 'multivendorx_activity_logs',
);
```

New marketplace-domain data goes in a new entry here, not a custom post type or a generic `postmeta` blob. Reference a table via `$wpdb->prefix . Utill::TABLES['activity_logs']`, never a hardcoded table name string.

Two other registries live in the same class, worth knowing about before adding a new option-backed setting or module:

- `Utill::MULTIVENDORX_SETTINGS` (`classes/Utill.php:53-`) — every settings-tab option key (`onboarding`, `registration`, `dashboard-menu`, `privacy`, `coupons-discounts`, `store`, `products`, `policies`, ...). New settings should be added here (or via the `multivendorx_register_settings_keys` filter, see [filters-hooks/filters.md](filters-hooks/filters.md)) rather than a bespoke `get_option()` call.
- `Utill::ACTIVE_MODULES_DB_KEY` (`classes/Utill.php:247`, value `'multivendorx_all_active_module_list'`) — the single option key every module's active/inactive state is persisted under, read by `classes/Modules.php`'s loader.

## Schema changes: versioned migrations in `Install.php`

`classes/Install.php` runs on activation and on version bump (`run_migration()`, hooked on `init`, compares `get_option('multivendorx_version')` against the current version and calls `do_migration()`):

```php
public function do_migration() {
    $previous_version = get_option( 'multivendorx_version' );
    if ( version_compare( $previous_version, '5.0.2', '<' ) ) {
        // ...
    }
    if ( version_compare( $previous_version, '5.0.7', '<' ) ) {
        $sql_logs = "CREATE TABLE IF NOT EXISTS `{$wpdb->prefix}" . Utill::TABLES['activity_logs'] . "` ( ... )";
        if ( ! function_exists( 'dbDelta' ) ) {
            require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        }
        dbDelta( $sql_logs );
    }
}
```

Not every migration step is a schema change — `do_migration()`'s `5.0.2` branch (`classes/Install.php:37-75`) is a pure data backfill: it merges four new default shipping-stage entries (`delivered`, `shipped`, `packed`, `out-for-delivery`) into the existing `delivery` settings option for sites upgrading from an older version, preserving any custom stages the site already had (`array_merge( $new_stages, $existing_stages )`). This is the additive pattern to follow for a settings-shape change that needs a default value introduced without clobbering existing site data — see the parent repo's `.claude/rules/backward-compatibility.md` for why migrations here must never be destructive.

All 13 core tables are created via one batch of `dbDelta()` calls in `create_database_table()` (`classes/Install.php:201-450`), run on plugin activation.

## Queries

Always use `$wpdb->prepare()` for any query with a variable — no string-concatenated SQL. Follow the existing pattern of a `$wpdb->get_row( $wpdb->prepare( "SELECT ... WHERE id = %d", $id ) )` call wrapped by a small static in-request cache where the same lookup happens repeatedly (`classes/Store/Store.php`'s pattern of caching by id is the reference implementation) — don't add a new caching layer (object cache, transients) unless the read is genuinely hot and this pattern doesn't already cover it.
