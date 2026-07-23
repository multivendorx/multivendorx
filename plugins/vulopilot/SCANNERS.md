# VuloPilot — scanner architecture

Companion to [`DATABASE.md`](DATABASE.md) and
[`plugins/vulopilot-pro/ARCHITECTURE.md`](../../../plugins/vulopilot-pro/ARCHITECTURE.md).
Covers the contracts, the engine, the original 14 built-in scanners, and
how a new scanner gets added — by this codebase, by a Pro module, or by a
third-party developer. Two later passes added more scanners using this
exact same mechanism, kept in their own docs rather than rewriting this
table (to avoid misrepresenting the order these were actually built in):
[`SEO-MODULE.md`](SEO-MODULE.md) added 13, all category `seo`;
[`GEO-MODULE.md`](GEO-MODULE.md) added 8 more, all category `geo` — the
`geo` scanner gap this file originally called out below is now filled.

**Scanners never call an AI provider.** A scanner's job is narrow and
deterministic: inspect real WordPress/site state and report structured
`Finding`s. Anything AI-assisted (summarizing findings in plain English,
suggesting a fix, drafting an automation) reads a scanner's *output*
afterwards — it's a separate concern (`AIProviders/`, a later pass), not
something a scanner does itself. Keeping this boundary hard is what makes
scan results reproducible, fast, and free of API cost/latency/failure
modes.

## Contracts (`multivendorx/packages/php/vulopilot-core`)

```
src/
├── Contracts/Scanner/
│   └── ScannerInterface.php   get_id()/get_label()/get_category()/get_tier()/scan(): Finding[]
└── ValueObjects/
    ├── Severity.php            critical|high|medium|low|info — closed vocabulary
    ├── Finding.php              one issue: title, severity, category, description, object_type/ref, meta
    └── ScanResult.php           the outcome of running one scanner once (status, findings[], duration, summary)
```

- **`ScannerInterface` is the only interface.** There's deliberately no
  `ScanResultInterface` — `ScanResult` only ever has one shape/implementation
  (produced by `ScanRunner`, never by a scanner), so an interface for it
  would have exactly one implementer and add nothing. `ScannerInterface`
  earns its interface status because it genuinely has 14+ different
  implementations today and is the actual swap point for Free/Pro/
  third-party scanners.
- **Zero WordPress dependency in this package** — `Finding`/`Severity`/
  `ScanResult` are plain PHP, constructor-validated (`Finding` throws on an
  invalid severity), unit-testable with no WP bootstrap. `ScannerInterface`
  only references these, never a WP function. Real scanner *implementations*
  are WP-heavy; the *contract* they satisfy is not.
- **`Finding`'s constructor args map 1:1 to `vulopilot_scan_findings`
  columns**, minus `scan_id`/`status` — those get attached when a Finding is
  persisted against a specific scan run, which is the Repository layer's
  job (not built yet — see "What's not here yet" below), not the scanner's.

## Engine (`multivendorx/plugins/vulopilot/classes/Scanners`)

```
classes/Scanners/
├── ScannerRegistry.php   Instantiates every registered scanner class, indexed by get_id()
├── ScanRunner.php         Runs one/many/all scanners, times them, catches failures
└── Basic/
    ├── AbstractBasicScanner.php   shared get_tier() = 'free'
    └── (14 concrete scanners)
```

- **`ScannerRegistry` collects class names via a filter, not folders.**
  `module-architecture.md` describes Modules.php discovering whole packages
  by `scandir()`-ing for a `Module.php` file — that mechanism exists because
  a module is a *package* (`Module.php` + `Rest.php` + `Frontend.php` + …).
  A scanner is a single class implementing one small interface, so forcing
  it into its own directory would add a folder-per-scanner for no benefit.
  `ScannerRegistry::register_scanners()` instead does:
  `apply_filters( 'vulopilot_scanner_sources', $free_defaults )` → for each
  class name, skip if it doesn't exist or doesn't implement
  `ScannerInterface`, otherwise instantiate and index by `get_id()`. Same
  "register a source, get discovered — never instantiated directly by the
  consumer" spirit as the module system, simpler mechanics for a
  simpler unit.
- **`ScanRunner` owns timing and failure handling**, not scanners — every
  `run()` wraps the scanner's `scan()` call in a timer and a `try/catch`,
  producing a `ScanResult` either way (`STATUS_COMPLETED` with findings, or
  `STATUS_FAILED` with the exception message and an empty findings array).
  A scanner author never writes their own timing/error boilerplate; a bug in
  one third-party scanner can't take the rest of a `run_all()` down with it.
- **`ScanRunner` fires `vulopilot_scan_completed` and stops** — it does not
  write to `vulopilot_scans`/`vulopilot_scan_findings` itself. Persistence
  is the Repositories/Services layer's job (see "What's not here yet"). This
  keeps the engine's only dependency direction Free → Shared, never Free →
  a persistence layer that doesn't exist yet.

## The 14 built-in scanners (`classes/Scanners/Basic/`)

Every one of these does exactly one real, bounded, deterministic check
today — not because that's the ceiling, but because one honest check beats
several fake ones, and each is independently extendable later (see
"Extension strategy"). All are `tier = 'free'` (that's what "Basic" means).

| Scanner | `id` | `category` | What it actually checks |
|---|---|---|---|
| `BrokenLinksScanner` | `broken-links` | `links` | HTTP HEAD on links found in the 20 most recently published posts/pages (capped at 40 links/run), flags non-2xx/3xx |
| `ImagesScanner` | `images` | `images` | The 100 most recent image attachments missing `_wp_attachment_image_alt` |
| `SeoScanner` | `seo` | `seo` | The 50 most recently modified published posts/pages with a title under 10 or over 60 characters |
| `SchemaScanner` | `schema` | `schema` | Whether the homepage response contains any `application/ld+json` at all |
| `PerformanceScanner` | `performance` | `performance` | `SUM(LENGTH(option_value))` for autoloaded `wp_options` rows, flagged over 1MB |
| `DatabaseScanner` | `database` | `database` | `COUNT(*)` of `post_type = 'revision'` rows, flagged over 500 |
| `SecurityScanner` | `security` | `security` | Whether a user named `admin` exists (`username_exists()`) |
| `WooCommerceScanner` | `woocommerce` | `woocommerce` | Whether a published WooCommerce checkout page is configured (no-op if WooCommerce isn't active) |
| `AccessibilityScanner` | `accessibility` | `accessibility` | The 50 most recently modified published posts/pages whose content contains its own `<h1>` |
| `PluginsScanner` | `plugins` | `plugins` | Installed plugins not in `active_plugins` |
| `ThemesScanner` | `themes` | `themes` | Installed themes that aren't the active theme or its parent |
| `UpdatesScanner` | `updates` | `updates` | `get_core_updates()`/`get_plugin_updates()`/`get_theme_updates()` |
| `CronScanner` | `cron` | `cron` | `_get_cron_array()` entries more than an hour overdue |
| `RestApiScanner` | `rest-api` | `rest-api` | An unauthenticated `GET /wp/v2/users` request — flags if it returns user data |

Categories are chosen to line up with the admin UI already built: the
`FindingsTable`-based Health/SEO/GEO/WooCommerce pages filter
`vulopilot_scan_findings` by exactly these category strings (`seo`,
`woocommerce`; Health shows every category unfiltered). There was no
`geo` scanner in this original list — [`GEO-MODULE.md`](GEO-MODULE.md)
later filled that gap with 8 scanners.

Every scanner that runs a network request (`SchemaScanner`,
`RestApiScanner`, `BrokenLinksScanner`) or a `$wpdb` query
(`PerformanceScanner`, `DatabaseScanner`) is deliberately bounded — capped
batch sizes, short timeouts — per `performance.md`'s guidance against
unbounded operations; none of them do an unbounded full-site crawl.

## Extension strategy

Three ways to add a scanner, in increasing order of "how far from this
codebase":

1. **A new Free built-in scanner.** Add a class under `classes/Scanners/Basic/`
   extending `AbstractBasicScanner`, implement `get_id()`/`get_label()`/
   `get_category()`/`scan()`, add its `::class` reference to
   `ScannerRegistry::get_default_scanner_classes()`. Runs for every install,
   no license check.
2. **A Pro premium scanner.** A Pro module (e.g. a future
   `modules/AdvancedSecurityScanner/`) puts its scanner class inside its own
   module folder, implementing the same `VuloPilotCore\Contracts\Scanner\ScannerInterface`
   directly (`get_tier()` returns `'premium'` — Pro scanners don't extend
   `AbstractBasicScanner`, since that class's whole reason to exist is
   hard-coding `'free'`). The module's `Module.php` hooks
   `add_filter( 'vulopilot_scanner_sources', ... )` and appends its own
   class name to the list — the exact same filter Free's own scanners are
   discovered through, gated on license the same way `MultiVendorXPro`
   gates `multivendorx_module_sources` (`plugin-families.md`).
3. **A third-party scanner**, from any other plugin or a site's
   `functions.php`: implement `ScannerInterface`, hook the same
   `vulopilot_scanner_sources` filter, append the class name. No different
   from step 2 mechanically — Pro doesn't get a special, more-privileged
   registration path than a third party would.

In all three cases `ScannerRegistry` treats the class identically: it
doesn't know or care whether a scanner came from Free, Pro, or a
third-party plugin — only `get_tier()`'s return value distinguishes free
from premium, and that's read from the instance, not from where the class
lives on disk.

## What's not here yet

- **Persistence.** No scanner or engine class here writes to
  `vulopilot_scans`/`vulopilot_scan_findings`. `ScanRunner` firing
  `vulopilot_scan_completed` is the seam a `Repositories/`-layer listener
  (a separate pass) hooks into to actually save results — until that
  exists, `ScanRunner::run()` is fully functional in-memory but nothing
  persists across requests.
- **REST endpoints** (`vulopilot/v1/scans`, `/findings`) that the admin UI
  built earlier already calls — still not built; those pages correctly show
  their error state until the REST layer lands.
- **Scheduling.** Nothing here calls `ScanRunner::run_all()` on a cron tick
  yet — that's `Scheduler.php`'s job, also a separate pass.
