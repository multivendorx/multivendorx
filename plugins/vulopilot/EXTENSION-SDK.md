# VuloPilot — Extension SDK

Companion to [`ARCHITECTURE.md`](../../../plugins/vulopilot-pro/ARCHITECTURE.md) (whose "Extension
system = the discovery-by-filter mechanism itself" cross-cutting decision this formalizes, not
replaces), [`SCANNERS.md`](SCANNERS.md), [`RULE-ENGINE.md`](RULE-ENGINE.md), and
[`AI-ACTIONS.md`](AI-ACTIONS.md). Covers every real extension point in this plugin — PHP, REST,
React, and CLI — and the `ExtensionInterface`/`ExtensionManager` layer that ties the PHP ones
together with a real version-compatibility gate.

## What this is (and isn't)

Before this pass, extending VuloPilot meant knowing which of 8 separate filters to hook, with no
shared identity, no version declared, and no compatibility check — a scanner class registered via
`vulopilot_scanner_sources` against a VuloPilot version that removed a method it relies on would
simply fatal at scan time. `Sdk\ExtensionInterface`/`Sdk\ExtensionManager` don't replace those 8
filters — an extension's own `register()` method still calls them, exactly as before. What's new is
one place to declare *who this is, what version it is, and what core version it needs*, checked
once, honestly, before any of the extension's own registrations run.

This is not a module system. `module-architecture.md`'s folder-scan/reflection discovery
(`Module.php` + `Frontend.php`/`Rest.php`/…) is a different, heavier mechanism for a different job
(multivendorx-pro/catalogx-pro's `modules/` trees) that VuloPilot deliberately doesn't have — see
`plugin-families.md`. An `ExtensionInterface` implementation is a single class, not a folder.

## PHP extension points

| Filter | Registry | Registers |
|---|---|---|
| `vulopilot_extension_sources` | `Sdk\ExtensionManager` | `ExtensionInterface` implementations — the entry point everything below is normally reached through |
| `vulopilot_scanner_sources` | `Scanners\ScannerRegistry` | `ScannerInterface` implementations (`SCANNERS.md`) |
| `vulopilot_rule_sources` | `RuleEngine\RuleRegistry` | `RuleInterface` implementations (`RULE-ENGINE.md`) |
| `vulopilot_trigger_sources` | `AutomationEngine\TriggerRegistry` | `TriggerInterface` implementations |
| `vulopilot_automation_action_sources` | `AutomationEngine\ActionRegistry` | Automation `ActionInterface` implementations |
| `vulopilot_report_type_sources` | `Reports\ReportTypeRegistry` | `ReportTypeInterface` implementations |
| `vulopilot_report_exporter_sources` | `Reports\ReportExporterRegistry` | `ReportExporterInterface` implementations |
| `vulopilot_ai_provider_sources` | `AIProviders\ProviderRegistry` | `AIProviderInterface` implementations (`AI-ARCHITECTURE.md`) |
| `vulopilot_ai_action_sources` | `AIActions\ActionRegistry` | `AIActionInterface` implementations (`AI-ACTIONS.md`) |
| `vulopilot_rest_controllers` | `RestAPI\Rest` | Extra `\WP_REST_Controller` instances, keyed by an id, added to the central dispatcher |

All ten follow the same shape: a class-string (or, for `vulopilot_rest_controllers`, an instance)
added to the filtered array, checked against the right interface, silently skipped if it doesn't
match — one broken third-party registration never takes the rest down with it.

### Writing an extension

```php
namespace MyCompany\VuloPilotWidgets;

use VuloPilotCore\Contracts\Extension\ExtensionInterface;

class Extension implements ExtensionInterface {

    public function get_id(): string {
        return 'my-company-widgets';
    }

    public function get_name(): string {
        return 'My Company Widgets for VuloPilot';
    }

    public function get_version(): string {
        return '1.0.0';
    }

    public function get_minimum_vulopilot_version(): string {
        return '1.1.0';
    }

    public function register(): void {
        add_filter( 'vulopilot_scanner_sources', function ( $classes ) {
            $classes[] = MyScanner::class;
            return $classes;
        } );
    }
}

add_filter( 'vulopilot_extension_sources', function ( $classes ) {
    $classes[] = \MyCompany\VuloPilotWidgets\Extension::class;
    return $classes;
} );
```

`Sdk\ExtensionManager` instantiates `Extension`, compares `get_minimum_vulopilot_version()` against
the running core version via `Sdk\VersionGuard::meets_minimum()`, and only calls `register()` if
that passes — otherwise it's logged (`vulopilot_activity_logs`, event `extension.incompatible`) and
surfaced as an admin notice, never silently ignored. A `register()` call that throws is caught,
logged (event `extension.registration_failed`), and doesn't take any other extension down with it.

### `Sdk\VersionGuard`

Compatibility-check helpers so an extension doesn't hand-roll its own `version_compare()` (an easy
place to get the comparison direction backwards): `meets_minimum( $current, $required )`,
`is_php_compatible( $required )`, `is_wp_compatible( $required )`,
`is_woocommerce_compatible( $required = null )`.

### `Sdk\AbstractServiceProvider`

Optional base class for organizing an extension's *own* internal service wiring — the same
lazy-factory container shape every plugin bootstrap in this codebase already uses
(`php-wordpress.md`), given a name so an SDK consumer can extend it instead of re-deriving it.
Deliberately not a real DI container (no autowiring, no reflection) — that would be new tooling the
root `CLAUDE.md`'s "Out of scope" section says to flag, not add. Nothing in VuloPilot core resolves
anything through a provider; it exists purely for an extension's own use inside its own
`register()`.

```php
class MyServiceProvider extends \VuloPilot\Sdk\AbstractServiceProvider {
    public function register(): void {
        $this->bind( 'my.client', fn() => new ApiClient() );
    }
}

$provider = new MyServiceProvider();
$provider->register();
$client = $provider->make( 'my.client' ); // lazily constructed, cached after first call
```

## React extension points

Already real, not part of this pass — listed here so the PHP-side points above aren't mistaken for
the whole story:

- **`vulopilot_settings_context`** (`@wordpress/hooks` filter, `src/services/templateService.ts`) —
  swaps in an additional `require.context` of declarative settings-tab configs
  (`EXTENSION-SDK.md`'s PHP-side analogy: this is the React settings framework's own extension
  point, same one the free multivendorx plugin's `Settings.tsx` uses).
- **`vulopilot_dashboard_widgets`** (`@wordpress/hooks` filter, `src/dashboard-widgets/registry.ts`,
  see `DASHBOARD-WIDGETS.md`) — adds a widget to the Dashboard page's reorderable grid.
- **Pro's own dynamic module loading** — Pro's `src/index.tsx` doesn't mount a React root
  (`react-frontend.md`); it `require.context`-loads each `modules/*/src/index.(ts|tsx)` entry gated
  on `appLocalizer.active_modules`. A third-party extension with its own React UI follows the same
  shape: register filters into the two points above rather than trying to mount a second root.

## CLI extension point

`classes/Cli/VuloPilotCommand.php` — the first WP-CLI commands in this codebase (zero existed
before this pass), registered on `cli_init` only when `WP_CLI` is actually the running process, so
`\WP_CLI`/`\WP_CLI\Utils` classes are never referenced on a normal web request.

| Command | Does |
|---|---|
| `wp vulopilot scan run [<scanner-id>] [--category=<category>]` | Runs one scanner, a whole category, or every scanner |
| `wp vulopilot scan list [--status=<status>] [--per-page=<n>]` | Lists recent `vulopilot_scans` rows |
| `wp vulopilot report generate --type=<type> [--format=<format>] [--period-days=<n>]` | Generates a report synchronously via `Reports\ReportGenerator` |
| `wp vulopilot extensions list` | Lists registered extensions and any skipped for a version mismatch |
| `wp vulopilot settings get [<key>]` | Prints one setting, or every setting as JSON |
| `wp vulopilot settings set <key> <value>` | Sets one setting |
| `wp vulopilot settings reset` | Resets every setting to its default |

A third party can register its own commands under the `vulopilot` namespace the same way —
`WP_CLI::add_command( 'vulopilot my-command', ... )` on `cli_init` — there's no separate discovery
filter for CLI commands (WP-CLI's own `cli_init` hook already *is* the discovery mechanism; adding
a second one on top would just be indirection).

## What's deliberately not here

- **No autowiring/reflection-based DI.** `AbstractServiceProvider` is explicit `bind()`/`make()`
  only, matching this codebase's existing container pattern rather than introducing one.
- **No extension marketplace/update-check mechanism.** This SDK is about *registering* an
  extension's code with a running site, not about discovering, installing, or updating extensions —
  that's WordPress.org's/a commercial licensing server's job, out of scope here.
- **No CLI command discovery filter.** See above — `cli_init` already is one.
