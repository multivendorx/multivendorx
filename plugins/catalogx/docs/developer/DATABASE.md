# Database

## Custom tables

Named centrally in `Utill::TABLES` (`classes/Utill.php`):

```php
public const TABLES = array(
    'enquiry' => 'catalogx_enquiry',
    'rule'    => 'catalogx_rules',
    'message' => 'catalogx_messages',
);
```

Reference a table via `$wpdb->prefix . Utill::TABLES['enquiry']`, never a hardcoded table name string. Quote-request data, by contrast, is **not** a fourth custom table — it's stored as WooCommerce order-adjacent data (quote requests are modeled as a quote-type order), so there's no `catalogx_quotes` table to look for.

## Schema changes

`classes/Installer.php` runs on activation and on version bump (`do_migration()`, version-gated with `version_compare()`), using `dbDelta()` for the actual `CREATE TABLE`/`ALTER TABLE` statements — idempotent, same pattern as every other plugin in this workspace. Migrations are additive — see the parent repo's `backward-compatibility.md` rule.

## Settings storage

Not a custom table — settings are stored as regular WordPress options, one option per settings tab, keyed in `Utill::CATALOGX_SETTINGS`:

```php
public const CATALOGX_SETTINGS = array(
    'wholesale'                     => 'catalogx_wholesale_settings',
    'wholesale-registration'        => 'catalogx_wholesale_registration_settings',
    'enquiry-quote-exclusion'       => 'catalogx_enquiry_quote_exclusion_settings',
    'enquiry-email-template'        => 'catalogx_enquiry_email_template_settings',
    'tools'                         => 'catalogx_tools_settings',
    'enquiry-form-customization'    => 'catalogx_enquiry_form_customization_settings',
    'enquiry-catalog-customization' => 'catalogx_enquiry_catalog_customization_settings',
    'customer-engagement'           => 'catalogx_customer_engagement_settings',
    'pages-shortcodes'              => 'catalogx_pages_shortcodes_settings',
);
```

Read/write through `CatalogX()->setting` (`classes/Setting.php`), never a raw `get_option()`/`update_option()` call for one of these keys — see [SETTINGS-SYSTEM](SETTINGS-SYSTEM.md).

`Utill::CATALOGX_OTHER_SETTINGS` holds internal plugin state (installer/onboarding flags, the active log file name, the stored plugin DB version) — these are plain `get_option()`/`update_option()` calls by design, since they aren't user-facing settings tabs.

`Utill::ACTIVE_MODULES_DB_KEY` (`'catalogx_all_active_module_list'`) stores the array of active module ids — see [MODULES](MODULES.md).
