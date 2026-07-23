# VuloPilot — SEO module

Companion to [`SCANNERS.md`](SCANNERS.md), [`RULE-ENGINE.md`](RULE-ENGINE.md), and
[`AI-ACTIONS.md`](AI-ACTIONS.md). Covers the 15 SEO checks (13 new scanners plus the
2 that already existed), the 3 new SEO rules (plus one existing rule corrected in
this pass), the new AI-suggestion/one-click-fix pairing, and how a "module" like
this fits into engines that were built to be extended without a `modules/`
package.

## Why this isn't a `modules/SEO/` package

VuloPilot's own `modules/` folder (`EmailDigest/`, `UptimeMonitor/`) is scaffolded
but has no loader (`Modules.php`) yet — that mechanism doesn't exist for VuloPilot
today, and building it is a separate, larger infrastructure task this pass doesn't
take on unprompted. More importantly, per `SCANNERS.md`'s own reasoning: **a
scanner is a single class implementing one small interface**, not a multi-file
package — forcing 13 new scanner classes into a folder-per-module structure would
fight the exact discovery mechanism (`vulopilot_scanner_sources`) already built for
this. "The SEO module" is therefore not a new architectural layer — it's 13 new
scanners, 3 new rules, and 1 new AI action, all registered through the engines that
already exist, unified by sharing the `seo` category string. The Dashboard's
existing SEO stat widget (`DASHBOARD-WIDGETS.md`) and the SEO admin page
(`pages/SEO/SEO.tsx`, filtering `FindingsTable` by `category="seo"`) automatically
pick up every one of these without any change, because both already key off that
category, not a hardcoded scanner list.

## The 15 SEO checks

| Check | Scanner `id` | Severity | Notes |
|---|---|---|---|
| Titles | `seo` (pre-existing `SeoScanner`) | low | Title length outside ~10–60 chars |
| Descriptions | `meta-description` | low | No `post_excerpt` set (the real, always-present field most themes/SEO plugins fall back to) |
| Canonicals | `canonical-url` | low | No `rel="canonical"` in rendered HTML — homepage + up to 9 recent posts |
| Schema | `schema` (pre-existing `SchemaScanner`) | info | No JSON-LD present at all on the homepage |
| Internal Links | `internal-linking` | low | Zero same-site links found in a post's own content |
| Headings | `heading-structure` | low | 300+ word posts with no `<h2>`-`<h6>` anywhere |
| Thin Content | `thin-content` | low | Under 300 words |
| Duplicate Content | `duplicate-content` | medium | Two+ published posts share an exact title (see "What this is not" below) |
| Sitemap | `sitemap` | medium | Neither `/wp-sitemap.xml` nor `/sitemap.xml` reachable |
| Robots | `robots-txt` | low / **high** | Unreachable (low), or blocking every crawler sitewide (high) |
| OpenGraph | `open-graph` | low | Missing `og:title`/`og:description`/`og:image` on the homepage |
| Twitter Cards | `twitter-card` | low | Missing `twitter:card` on the homepage |
| Orphan Pages | `orphan-pages` | low | Nothing in the sampled batch links to this page |
| Missing Images | `seo-images` | low | No featured image set |
| Structured Data | `structured-data` | medium | JSON-LD blocks exist but fail to parse as valid JSON |

All 15 share `get_category() === 'seo'` and `get_tier() === 'free'`. Every new
scanner extends `AbstractBasicScanner` and lives flat in `classes/Scanners/Basic/`
alongside the original 14 — no subfolder, per `SCANNERS.md`'s "no folder-per-scanner"
reasoning.

### What "Schema" vs. "Structured Data" actually means here

These sound like the same check but are deliberately different: `SchemaScanner`
("Schema" in the checklist) is a **presence** check — is there any JSON-LD on the
homepage at all. `StructuredDataValidationScanner` ("Structured Data") is a
**validity** check — of whatever JSON-LD blocks exist, do they actually parse as
JSON. A site can pass one and fail the other (JSON-LD present but malformed), which
is exactly why both exist as separate scanners rather than one doing both jobs.

### What "Duplicate Content" is not

A real text-similarity/near-duplicate detector would need to compare every pair of
posts' full content — an unbounded, expensive operation for a scanner that runs on
demand (`performance.md`). `DuplicateContentScanner` instead does one indexed SQL
aggregate (`GROUP BY post_title HAVING COUNT(*) > 1`) across the 200 most recently
modified posts — an honest, cheap proxy (two pages with an identical title are
almost always competing for the same search intent) documented as exactly that in
the scanner's own docblock, not a claim to detect near-duplicate content generally.

### What "Orphan Pages" is not

`OrphanPageScanner` cross-references posts only *within* the same 50-post sampled
batch (an O(n²) comparison, bounded and fast at that size). A page could have a
genuine inbound link from an older post outside the batch and still be reported as
an orphan here — a documented, deliberate trade-off for keeping the scanner's
runtime bounded, not a full sitewide link-graph analysis.

## Fixing a category collision this pass introduced

Before this pass, `seo` was one scanner's (`SeoScanner`) category, so the existing
`SeoTitleRewriteRule.applies_to()` could safely check `category === 'seo'` alone.
Giving 13 more scanners the same category broke that assumption — `applies_to()`
would have started firing on `meta-description`/`thin-content`/every other SEO
finding too. Fixed by matching on the `title_length` meta key `SeoScanner`
specifically attaches, not category alone (see `SeoTitleRewriteRule.php`'s updated
docblock). The 3 new rules below follow the same discipline from the start: each
matches on a scanner-specific meta key (`missing_description`,
`missing_featured_image`, `blocks_all_crawlers`), never on category alone or on the
Finding's (already-translated, locale-unsafe to string-match) title text.

## The 3 new rules (`classes/RuleEngine/Rules/`)

| Rule | `id` | type | fixable | AI required | Pairs with scanner |
|---|---|---|---|---|---|
| `MissingMetaDescriptionRule` | `missing-meta-description` | suggestion | yes | **yes** | `meta-description` |
| `MissingFeaturedImageRule` | `missing-featured-image` | suggestion | yes | no | `seo-images` |
| `RobotsBlockingCrawlersRule` | `robots-blocking-crawlers` | **critical** | **no** | no | `robots-txt` (the blocking finding only) |

`MissingFeaturedImageRule` demonstrates the fixable-but-no-AI combination
`RULE-ENGINE.md`'s `DormantPluginRule` already established (a mechanical editorial
task, nothing for AI to generate). `RobotsBlockingCrawlersRule` is deliberately
**not** fixable — automatically rewriting robots.txt is exactly the kind of
high-blast-radius, whole-site-affecting change no `AIAction` here should make
unattended; a site owner needs to look at the file before that rule is removed.

## The new AI Action: closing a fix loop

`RuleEngine\Rules\SeoTitleRewriteRule` (pre-existing) has recommended
AI-assisted title rewrites since the Rule Engine pass, but no `AIAction` ever
existed to actually do it — `requires_ai() === true` with no wiring behind it was a
real, documented gap. This pass closes the *equivalent* gap for the new
`MissingMetaDescriptionRule` instead (chosen because it's the more natural
one-click fix: describing a page from its own content is a well-bounded AI task,
matching `GenerateAltAction`'s reasoning, whereas a good title rewrite has tighter,
harder-to-validate length constraints):

**`AIActions\Actions\WriteMetaDescriptionAction`** (`write-meta-description`) —
shaped like `ImproveReadabilityAction` (a real `wp_update_post()` write, so it also
creates a WordPress revision as a bonus safety net) rather than
`GenerateAltAction`'s raw postmeta write, since `post_excerpt` is a first-class post
field. Writes to `post_excerpt`; rollback restores the previous value.
`RuleEngine\Rules\MissingMetaDescriptionRule`'s recommendations are this action's
natural input source, by the same by-convention id-matching `AI-ACTIONS.md`
documents (no formal Recommendation → Action mapping exists yet — see that doc's
own "What's not here yet").

A `write-seo-title` action closing `SeoTitleRewriteRule`'s own gap is a natural,
same-pattern follow-up, not built in this pass.

## Extension strategy

Identical shape to every other engine in this codebase:

1. **A new Free SEO check**: add a scanner class under `classes/Scanners/Basic/`
   with `get_category() === 'seo'`, register it in
   `ScannerRegistry::get_default_scanner_classes()`. If it's fixable, add a
   matching `Rule` (and an `AIAction` if AI is genuinely needed) the same way.
2. **A Pro premium SEO check** (e.g. a competitor-title-comparison scanner needing
   an external API): implement `ScannerInterface` directly inside a Pro module,
   `get_tier()` returns `'premium'`, register via
   `add_filter('vulopilot_scanner_sources', ...)`, license-gated
   (`plugin-families.md`).
3. **A third-party SEO check**: same filter, from any other plugin — no more
   privileged a path for Pro than a third party.

## What's not here yet

- **A `write-seo-title` AIAction** — `SeoTitleRewriteRule`'s own one-click-fix gap,
  same pattern as `WriteMetaDescriptionAction`, not built in this pass.
- **REST endpoints/UI surfacing these specific new findings differently** — they
  flow through the exact same `/findings?category=seo` endpoint and `FindingsTable`
  component every existing SEO finding already uses; no new REST work was needed.
- **A formal GEO (AI-search/answer-engine) equivalent.** `SCANNERS.md` already notes
  there's no `geo` category scanner — this pass doesn't add one; it's a distinct,
  separately-scoped feature area, not part of "the SEO module."
- **Per-check configuration** (e.g. a custom thin-content word-count threshold) —
  every threshold in this pass is a class constant, matching how `SeoScanner`'s
  title-length bounds and `BrokenLinksScanner`'s batch size already are.
