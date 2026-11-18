# CatalogX Developer Docs

Developer-facing reference documentation for extending `catalogx`, the free/base-tier WooCommerce catalog-mode/enquiry/quote plugin. This is separate from the parent monorepo's `.claude/rules/` (internal AI guidance) — this `/docs` folder is for third-party developers building on top of the plugin.

Looking for how to *use* the plugin instead of extend it? See the [user guides](../user/README.md).

## Start here

1. [ARCHITECTURE](ARCHITECTURE.md) — bootstrap, container, modules, hooks, REST, React.
2. [REST-API](REST-API.md) — every route this plugin registers.
3. [DATABASE](DATABASE.md) — tables and settings keys.

## By area

| Area | Document | Covers |
|---|---|---|
| Module system | [MODULES](MODULES.md) | `Catalog`, `Enquiry`, `Quote` — the three free-tier modules, how `catalogx-pro` plugs its own `Enquiry`/`Quote` extensions plus brand-new `Rules`/`Wholesale` modules into this plugin's own loader |
| Settings | [SETTINGS-SYSTEM](SETTINGS-SYSTEM.md) | Storage, the declarative settings-config pattern, real settings tabs |
| Database | [DATABASE](DATABASE.md) | `catalogx_enquiry`, `catalogx_rules`, `catalogx_messages` tables, `Installer.php` migrations |
| REST | [REST-API](REST-API.md) | The plugin-level dispatcher plus each module's own routes |

## Working on the code

```bash
pnpm install                 # once, in the repository root
pnpm run build               # from this plugin's directory: rebuild assets/
pnpm run watch                # rebuild on change
composer dump-autoload -o     # after moving or renaming a PHP class
pnpm run makepot               # regenerate languages/catalogx.pot
```

## What's not here, and why

- **No shared base REST controller class** — every controller `extends \WP_REST_Controller` directly, same as the other plugins in this workspace (see the parent repo's `rest-api.md` rule).
- **No dedicated component-library reference** — this plugin doesn't own `zyra`; that belongs in the submodule root.
- **No TDD/testing guide** — a `tests/` directory exists as PHPUnit scaffolding but no real tests are populated yet.

## Adding a new section

Each section above was written from verified, existing code — grep/read the actual mechanism before writing anything, and don't invent a section for a topic that doesn't have a real equivalent in this plugin yet.
