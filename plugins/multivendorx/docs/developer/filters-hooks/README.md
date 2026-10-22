# Hooks & Filters Reference

Three files, split by mechanism:

- [actions.md](actions.md) — every `do_action()` this plugin defines (46 hooks)
- [filters.md](filters.md) — every `apply_filters()` this plugin defines (115 hooks)
- [js-extension-points.md](js-extension-points.md) — every JS/TS `@wordpress/hooks` `addFilter`/`applyFilters` call in `src/` and `modules/*/src/` (~89 entries)

## Format

Each file groups hooks into `##` feature-domain sections with a table of contents at the top; within a domain, hooks are listed as a table (`Hook | Source | Fires when / Filters | Notes`) rather than one `###` heading per hook. **This differs from the parent repo's `multivendorx-pro` docs**, which use one heading per hook — that plugin has roughly 20 documented hooks total; this plugin has ~250. A heading-per-hook format doesn't scale cleanly at this volume, so tables were used instead. Every row is still independently verified against real code with a file:line citation — the format changed, not the verification discipline.

Where a domain has both action and filter hooks, the same domain name is used as a section header in both `actions.md` and `filters.md` so you can cross-reference (`actions.md#orders--shipping` ↔ `filters.md#orders--shipping`).

## Naming convention

New PHP hooks in this codebase are prefixed `multivendorx_` (snake_case). This survey found real, existing violations — reused tag names with different shapes, missing prefixes, a reversed prefix order, a double-underscore typo, and one legacy non-`multivendorx_` internal name — documented inline in `filters.md`'s "Naming outliers" section and `js-extension-points.md`'s "Naming outliers" section, not silently normalized. Don't use any of these as a template for a new hook.

## Third-party and pass-through hooks

Calls that re-fire a WordPress/WooCommerce/BuddyPress/WPML core hook tag (rather than defining a new one) are listed separately at the end of `actions.md` and `filters.md`, not mixed into the domain tables.
