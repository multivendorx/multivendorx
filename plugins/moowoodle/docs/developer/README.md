# MooWoodle Developer Docs

Developer-facing reference documentation for extending `moowoodle`, the free/base-tier WordPress–Moodle bridge plugin. This is separate from the parent monorepo's `.claude/rules/` (internal AI guidance) — this `/docs` folder is for third-party developers building on top of the plugin.

Looking for how to *use* the plugin instead of extend it? See the [user guides](../user/README.md).

## Start here

1. [ARCHITECTURE](ARCHITECTURE.md) — bootstrap, container, hooks, REST, React. No `modules/` system here — see below.
2. [REST-API](REST-API.md) — every route this plugin registers.
3. [DATABASE](DATABASE.md) — tables and settings keys.

## By area

| Area | Document | Covers |
|---|---|---|
| Moodle connection | [MOODLE-CONNECTION](MOODLE-CONNECTION.md) | `ExternalService.php` — the one place every Moodle web-service call goes through |
| Settings | [SETTINGS-SYSTEM](SETTINGS-SYSTEM.md) | Storage, the declarative settings-config pattern, real settings and synchronization tabs |
| Database | [DATABASE](DATABASE.md) | `mw_enrollment`, `mw_moodle_categories`, `mw_courses` tables, `Installer.php` migrations |
| REST | [REST-API](REST-API.md) | The plugin-level dispatcher (this plugin has no module-level REST, since it has no module system) |

## No module system

Unlike `multivendorx`/`catalogx`, **moowoodle has no `modules/` directory and no module loader** — all code lives in flat `classes/` and `classes/Core/`. Don't scaffold a `modules/` folder expecting it to be discovered by anything; `moowoodle-pro` is also flat `classes/`, with no PHP-level coupling to this free plugin (see the parent repo's `plugin-families.md` rule).

## Working on the code

```bash
pnpm install                 # once, in the repository root
pnpm run build                # from this plugin's directory: rebuild assets/
pnpm run watch                 # rebuild on change
composer dump-autoload -o      # after moving or renaming a PHP class
pnpm run makepot                # regenerate languages/moowoodle.pot
```

## What's not here, and why

- **No module-architecture doc** — there's no module system to document; see "No module system" above.
- **No dedicated component-library reference** — this plugin doesn't own `zyra`; that belongs in the submodule root.
- **No TDD/testing guide** — a `tests/` directory exists as PHPUnit scaffolding but no real tests are populated yet.

## Adding a new section

Each section above was written from verified, existing code — grep/read the actual mechanism before writing anything, and don't invent a section for a topic that doesn't have a real equivalent in this plugin yet.
