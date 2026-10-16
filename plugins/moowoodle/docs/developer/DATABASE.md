# Database

## Custom tables

Named centrally in `Util::TABLES` (`classes/Util.php`):

```php
public const TABLES = array(
    'enrollment' => 'mw_enrollment',
    'category'   => 'mw_moodle_categories',
    'course'     => 'mw_courses',
);
```

Reference a table via `$wpdb->prefix . Util::TABLES['course']`, never a hardcoded table name string. These tables are the local cache/mapping of what's been synced from Moodle (which WooCommerce product maps to which Moodle course/category, which user is enrolled in what) — they are not a copy of Moodle's own database; the source of truth for course content stays in Moodle, reached via [MOODLE-CONNECTION](MOODLE-CONNECTION.md).

## Schema changes

`classes/Installer.php` runs `dbDelta()` for all three tables on activation, and `do_migration()` (version-gated with `version_compare()`) on every version bump — same additive-migration pattern as every other plugin in this workspace (see the parent repo's `backward-compatibility.md` rule).

## Settings storage

Not a custom table — settings are regular WordPress options, keyed in `Util::MOOWOODLE_SETTINGS`:

```php
public const MOOWOODLE_SETTINGS = array(
    'notification'       => 'moowoodle_notification_settings',
    'synchronize-course' => 'moowoodle_synchronize_course_settings',
    'synchronize-user'   => 'moowoodle_synchronize_user_settings',
    'connection-access'  => 'moowoodle_connection_access_settings',
    'course-enrollment'  => 'moowoodle_course_enrollment_settings',
    'system-logs'        => 'moowoodle_system_logs_settings',
);
```

Read/write through `MooWoodle()->setting` (`classes/Setting.php`), never a raw `get_option()`/`update_option()` call for one of these keys. See [SETTINGS-SYSTEM](SETTINGS-SYSTEM.md) for which of these keys has a real admin UI tab today versus which is registered but not yet surfaced.

## Meta keys

- `Util::MOOWOODLE_PRODUCT_META` — course start/end date, and the Moodle↔WordPress course ID mapping, stored as WooCommerce product meta.
- `Util::MOOWOODLE_TERM_META` — category ID/parent/path, stored as product-category term meta.
- `Util::MOOWOODLE_USER_META` — whether a user still needs their Moodle password reset.

## Other settings

`Util::MOOWOODLE_OTHER_SETTINGS` holds internal plugin state (the active log filename) — a plain `get_option()`/`update_option()` call by design, since it isn't a user-facing settings tab.
