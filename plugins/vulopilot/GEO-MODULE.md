# VuloPilot — GEO module

Companion to [`SEO-MODULE.md`](SEO-MODULE.md), [`SCANNERS.md`](SCANNERS.md),
[`RULE-ENGINE.md`](RULE-ENGINE.md), and [`AI-ACTIONS.md`](AI-ACTIONS.md). Covers the
12 requested GEO checks, why 8 became real scanners and 4 became an AI-powered
analysis instead, the new `GeoAnalysis\GeoAnalyzer` (the "Generate GEO Score"/
"Generate AI suggestions" capability), the 2 new rules, and the 2 new AI Actions
that close their fix loops.

## What GEO means here

GEO = Generative Engine Optimization — how discoverable and citable a page is to
AI answer engines (ChatGPT, Perplexity, Google AI Overviews), as distinct from
classic search-engine SEO (`SEO-MODULE.md`). `pages/GEO/GEO.tsx` and the `geo`
Finding category have existed since the admin-UI and Scanners passes, but
`SCANNERS.md` explicitly noted "there's no `geo` scanner in this list" — this pass
is what fills that gap.

## Splitting 12 checks into two honest categories

`SCANNERS.md`'s hard rule — **scanners never call AI** — means a check only becomes
a `Scanner` if it has a real, deterministic, non-AI signal. Four of the requested
checks genuinely don't:

| Check | Why it needs AI judgment, not a scanner |
|---|---|
| Entity Coverage | Whether key people/products/concepts are clearly named and explained requires understanding what the content is *about* |
| Question Coverage | Whether the content answers questions a reader would plausibly search for requires understanding reader intent |
| Answer Completeness | Whether an answer is self-contained requires judging whether it actually resolves the question, not just that words are present |
| LLM Readability | A holistic "could an AI system cleanly extract and quote this" assessment, not a single measurable property |

Faking these with a word-count or regex heuristic pretending to measure "entity
coverage" would be exactly the kind of dishonest scanner `SCANNERS.md`'s existing
scanners (each documented as "one honest check") argue against. Instead, these 4
are scored by a real AI call — see `GeoAnalysis\GeoAnalyzer` below — not skipped.

The other 8 checks *do* have a real, bounded, deterministic signal and became real
scanners, exactly like `SEO-MODULE.md`'s pass:

| Check | Scanner `id` | Scope | What it actually checks |
|---|---|---|---|
| Author Information | `geo-author-info` | per-post | Author has no bio (`get_the_author_meta('description')`) |
| EEAT | `geo-eeat-signals` | per-post | *Both* no author bio *and* never updated since publish |
| Trust Signals | `geo-trust-signals` | sitewide | No published About or Contact page exists |
| Citation Opportunities | `geo-citation-opportunities` | per-post | A statistic-shaped claim (`42%`, "studies show…") with zero outbound links |
| Summary Blocks | `geo-summary-block` | per-post | Long-form content with no TL;DR/key-takeaways marker or early list |
| FAQ Opportunities | `geo-faq-opportunity` | per-post | Long-form content with no question-phrased heading |
| Chunking | `geo-chunking` | per-post | A single `<p>` block over 150 words |
| Semantic Structure | `geo-semantic-structure` | per-post | A heading skips a level (e.g. H2 → H4 with no H3) |

All 8 share `get_category() === 'geo'`, `get_tier() === 'free'`, extend
`AbstractBasicScanner`, and live flat in `classes/Scanners/Basic/` — identical
convention to `SEO-MODULE.md`'s 13. `GeoTrustSignalsScanner` is the one sitewide
check among them (like `RobotsTxtScanner`'s "blocks all crawlers" finding) —
it applies identically to every post rather than being about one specific post.

## `GeoAnalysis\GeoAnalyzer` — "Generate GEO Score" / "Generate AI suggestions"

A plain, concrete orchestrator (`classes/GeoAnalysis/GeoAnalyzer.php`) — no
interface, same reasoning `Scanners\ScanRunner`/`RuleEngine\RuleEngine` already
establish: there's exactly one way "analyze this post for GEO" happens, so an
interface would have one implementer.

**This is not an `AIAction`.** Nothing about the post is mutated — it's a
read-only analysis producing a report, so there's no Approval/Execution/Rollback
lifecycle to run (`AI-ACTIONS.md`'s stages 5-7 exist specifically to gate a
*mutation*). Modeling it as an `AIAction` anyway (e.g. `execute()` just writing the
score to postmeta) would have forced every GEO score generation through an
unnecessary approval click for something that changes nothing on the site.

```php
public function analyze( int $post_id ): GeoScore
```

1. Computes a **deterministic score**: the percentage of the 8 scanners above with
   no open finding for this post (7 per-post + the 1 sitewide Trust Signals check) —
   read from already-persisted `vulopilot_scan_findings` via `FindingRepository`
   (which gained an `object_ref` filter in this pass specifically for this read).
   **Null, not 0, if this site has no GEO scan history at all** — an absence of
   problems is never confused with "never checked."
2. Sends the post's content, title, and (if known) the deterministic score as
   context to the configured AI provider, asking for the 4 AI-judged dimensions
   (0-100 each) plus 3-5 concrete suggestions, as JSON.
3. Averages the deterministic score and the AI dimensions' mean into one
   `overall_score` — a deliberately simple, documented heuristic, the same posture
   `Controllers/Dashboard.php`'s `calculate_overall_score()` already takes. If no
   deterministic history exists, the AI average stands alone rather than averaging
   in a fabricated deterministic number.
4. Persists the result to `_vulopilot_geo_score` postmeta (`GenerateSchemaAction`'s
   same postmeta-blob pattern — no new table) and returns it.

### Reusing the AI call path — and a small refactor to make that possible

`GeoAnalyzer` needed the exact "safety-validate → build provider chain → send →
sanitize response" sequence `AIActions\ActionRunner::propose()` already had, inline.
Rather than copy those six lines into a second consumer, they were extracted into
a new **`AIProviders\Support\SafeRequestSender`** class, and `ActionRunner` was
refactored to use it too (its own constructor now takes `SafeRequestSender` instead
of `ProviderRegistry`+`AISafetyValidator` separately). Both `ActionRunner` and
`GeoAnalyzer` now go through the identical safety-validated call path — no parallel
"send an AI request" logic exists anywhere in this codebase.

### `GeoScore` (`vulopilot-core/src/ValueObjects/GeoScore.php`)

Immutable, constructor-validated (every score 0-100 or null), same shape as
`Finding`/`Recommendation`/`ScanResult` — added to the shared package rather than
Free-only because, like those, it's plain data that could reasonably cross the
Free/Pro boundary later (e.g. a Pro bulk-GEO-audit feature reusing the exact same
result shape).

### REST: two routes, two costs

`Controllers/GeoAnalysis.php`:

- `GET /geo-analysis/{post_id}` — reads a previously generated score back from
  postmeta. **No AI call, no cost.**
- `POST /geo-analysis/{post_id}` — runs `GeoAnalyzer::analyze()`. **A real AI call.**

Split into two verbs/routes deliberately so simply loading the GEO page (or
re-opening `GeoScoreCard`) never silently re-spends an AI call a site owner didn't
explicitly ask for — the same cost-consciousness `AI-ARCHITECTURE.md`'s rate
limiting/usage tracking already treats as a first-class concern.

## The 2 new rules and 2 new AI Actions

| Rule | `id` | Pairs with scanner | Fix action |
|---|---|---|---|
| `FaqOpportunityRule` | `faq-opportunity` | `geo-faq-opportunity` | `GenerateFaqAction` |
| `MissingSummaryBlockRule` | `missing-summary-block` | `geo-summary-block` | `GenerateSummaryBlockAction` |

Both rules match on a scanner-specific meta key (`faq_opportunity`,
`missing_summary_block`), never on category alone or on the Finding's
already-translated title text — `SEO-MODULE.md`'s "Fixing a category collision"
section documents exactly why that discipline matters once many scanners share one
category (`geo` is now shared by all 8 checks above).

**`GenerateFaqAction`** and **`GenerateSummaryBlockAction`** (`classes/AIActions/Actions/`)
close those two fix loops — both a content-mutation pattern none of the existing 5
actions used yet:

- `GenerateFaqAction` **appends** an FAQ section (real, visible HTML — question
  headings + answers) to the end of `post_content` via `wp_update_post()`. Unlike
  `GenerateSchemaAction`'s postmeta-only write, this has to be visible HTML,
  because `GeoFaqOpportunityScanner`'s own check is about headings a crawler would
  actually render and see.
- `GenerateSummaryBlockAction` **prepends** a "Key Takeaways" list to the *top* of
  `post_content` — the one shape none of the other actions use (append or full
  rewrite). It has to land at the top because `GeoSummaryBlockScanner` specifically
  checks the first 600 characters for a summary.

Both get a WordPress revision for free via `wp_update_post()` (`ImproveReadabilityAction`'s
same bonus safety net) and roll back by restoring the previous full `post_content`.

## Frontend: `GeoScoreCard`

`src/pages/GEO/GeoScoreCard.tsx` — a small, hand-built form (post-ID input +
"Generate"/"Load existing score" buttons) rendered above the existing
`FindingsTable` on the GEO page. Not a table-row action, because a GEO score is
inherently per-post while every other page here lists sitewide findings — the same
"real form against a real REST contract, not the shared list-page pattern"
posture `Settings.tsx`'s own docblock already documents for the one other page
that doesn't fit the table shape. Displays the overall score, all 4 AI dimensions
(via the existing `AnalyticsComponent`), and the AI-generated suggestions list.

**Known UX gap, not fixed here**: the post picker is a plain numeric ID field, not
a live-search autocomplete — building a proper post-search component would need
its own new REST search endpoint, a genuinely separate, larger piece of UI work
than this pass's scope. Honest about being functional, not polished.

## Extension strategy

Identical shape to every other engine in this codebase:

1. **A new Free GEO check**: if it has a real deterministic signal, add a scanner
   with `get_category() === 'geo'` (register in `ScannerRegistry`); if it genuinely
   needs semantic judgment, extend `GeoAnalyzer`'s prompt/parsing to score a 5th AI
   dimension instead of forcing a fake scanner.
2. **A Pro premium GEO capability** (e.g. multi-page GEO audits, competitor
   citation-gap analysis): implement `ScannerInterface`/extend `GeoAnalyzer`'s
   reusable `GeoScore` value object from a Pro module, license-gated
   (`plugin-families.md`), same filter-based registration as everywhere else.
3. **A third-party check**: same filters, from any other plugin.

## What's not here yet

- **A live post-search picker** for `GeoScoreCard` — see above.
- **Bulk/sitewide GEO scoring** — `GeoAnalyzer::analyze()` is one post at a time;
  no batch/queue mechanism runs it across every post automatically.
- **GEO score history** — each `analyze()` call overwrites the previous postmeta
  value; there's no trend-over-time view the way `vulopilot_site_health_snapshots`
  gives the sitewide health score.
- **Quota/cost guardrails specific to GEO analysis** — it goes through the same
  `RateLimitedProvider`/`UsageTrackingProvider` every AI call does, but there's no
  GEO-specific "you've analyzed N posts this month" limit.
