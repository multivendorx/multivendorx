# Module system

`classes/Modules.php` is catalogx's **own** module loader — unlike `multivendorx-pro`, which defers to the free `multivendorx` plugin's loader, catalogx has no separate free/pro split to defer across; it's a single plugin that `catalogx-pro` extends by registering its own module path into this same loader.

## Anatomy

A module is a folder under `modules/` with a `Module.php` following the standard singleton + array-container shape:

```php
namespace CatalogX\Catalog;

class Module {
    private $services = array();
    private static $instance = null;

    public function __construct() {
        $this->register_services();
    }

    public function register_services() {
        $this->services['util']     = new Util();
        $this->services['frontend'] = new Frontend();
        $this->services['admin']    = new Admin();
    }

    public static function init() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }
}
```

Access a module's services the same way as the plugin container: `Catalog\Module::init()->frontend`.

## The three free-tier modules

| Module | What it does | Key files |
|---|---|---|
| `Catalog` | Hides prices, removes the add-to-cart button, and redirects cart/checkout pages, per the exclusion rules | `Frontend.php`, `Util.php`, `Admin.php` |
| `Enquiry` | The "ask about this product" button and form shown on shop/product pages (shortcode `catalogx_enquiry_button`) | `Frontend.php`, `Ajax.php`, `Rest.php`, `Util.php` |
| `Quote` | Lets a customer add products to a quote cart and submit a request-a-quote | `Frontend.php`, `QuoteAdd.php`, `QuoteCart.php`, `Quotes.php`, `Rest.php`, `Util.php` |

Each module gates its own behavior behind `Util::is_available()` — an exclusion check (by role, user, product, category, tag or brand — see [SETTINGS-SYSTEM](SETTINGS-SYSTEM.md)'s "Access Rules" tab) rather than a license check; this is the free plugin, there's no Pro gate inside these three modules themselves.

## How catalogx-pro extends this

`catalogx-pro` has its own `modules/` tree with **four** modules: `Enquiry`, `Quote`, `Rules`, `Wholesale`. `Enquiry` and `Quote` there are **additional, Pro-only behavior layered on top of the same-named free modules** (e.g. the admin "Enquiry Messages" chat thread, PDF quote delivery, WhatsApp enquiries) — not a fork or a replacement. `Rules` (dynamic pricing rules) and `Wholesale` (wholesale user roles and B2B pricing) have **no free-tier equivalent at all** — their admin tabs exist in the free plugin's menu (`Dynamic Pricing Rules`, `Wholesale Users`) but render as upgrade prompts until Pro is active.

## What NOT to do

- Don't instantiate a `Module` class directly — always go through `Module::init()`.
- Don't add a module to `catalogx-pro` assuming it defers to the free plugin's loader through a filter the way `multivendorx-pro` does from `multivendorx` — read `classes/Modules.php` here and confirm the actual registration filter name before assuming the pattern is identical.
