# Theme Template Overrides

## The mechanism

`Utill::get_template()` (`classes/Utill.php:120-130`) is this plugin's theme-override lookup, the same pattern used across this product family (compare `multivendorx`'s `Utill::get_template()`):

```php
public static function get_template( $template_name, $args = array() ) {
    $theme_template = get_stylesheet_directory() . '/woocommerce-product-stock-alert/' . $template_name;
    $located = file_exists( $theme_template ) ? $theme_template : Notifima()->plugin_path . 'templates/' . $template_name;
    load_template( $located, false, $args );
}
```

A theme can override any of this plugin's templates by placing a matching file at `{active-theme}/woocommerce-product-stock-alert/{template_name}` — note the **legacy folder name** (`woocommerce-product-stock-alert`, not `notifima`), a holdover from this plugin's pre-rebrand identity (see [../architecture.md](../architecture.md)'s Naming note). Don't rename this folder to match current branding as a side effect of unrelated work — it would silently break every existing site with a theme override already in place at the old path.

## What's actually overridable: email templates only

Unlike `multivendorx` (7 overridable templates covering various frontend/admin views), **every** call site of `get_template()` in this plugin is inside one of the three `WC_Email` subclasses, rendering an HTML or plain-text email body:

| Template name passed to `get_template()` | Rendered by | Call site |
|---|---|---|
| `emails/html/AdminNewSubscriberEmail.php` | `AdminNewSubscriberEmail::get_content_html()` | `classes/Emails/AdminNewSubscriberEmail.php:111` |
| `emails/plain/AdminNewSubscriberEmail.php` | `AdminNewSubscriberEmail::get_content_plain()` | `classes/Emails/AdminNewSubscriberEmail.php:134` |
| `emails/html/SubscriberConfirmationEmail.php` | `SubscriberConfirmationEmail::get_content_html()` | `classes/Emails/SubscriberConfirmationEmail.php:104` |
| `emails/plain/SubscriberConfirmationEmail.php` | `SubscriberConfirmationEmail::get_content_plain()` | `classes/Emails/SubscriberConfirmationEmail.php:127` |
| `emails/html/ProductBackInStockEmail.php` | `ProductBackInStockEmail::get_content_html()` | `classes/Emails/ProductBackInStockEmail.php:127` |
| `emails/plain/ProductBackInStockEmail.php` | `ProductBackInStockEmail::get_content_plain()` | `classes/Emails/ProductBackInStockEmail.php:149` |

All six template files ship under `templates/emails/{html,plain}/` in the plugin itself, matching the WooCommerce convention of separate HTML/plain-text email template pairs (`$this->template_base = Notifima()->plugin_path . 'templates/'`, set in each Email class's constructor, e.g. `classes/Emails/AdminNewSubscriberEmail.php:58`).

## What's not overridable

The subscribe-form markup itself (`FrontEnd::get_subscription_form()`, see [../frontend/subscription-forms.md](../frontend/subscription-forms.md)) is built as an inline PHP string (`sprintf(...)`), not loaded through `get_template()` — there is no theme-overridable template file for the form markup, only the `data-*` attributes it emits for the client-side JS to read. A theme/plugin wanting to change the form's server-rendered wrapper markup would need to filter or replace `get_subscription_form()`'s output some other way (no filter currently wraps its return value) — not something to invent a fix for here, just a real gap worth knowing about.
