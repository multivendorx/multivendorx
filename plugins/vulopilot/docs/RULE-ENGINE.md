# VuloPilot — Rule Engine

Companion to [`SCANNERS.md`](SCANNERS.md) and [`DATABASE.md`](DATABASE.md).
Covers the contracts, the engine, the original 5 built-in rules, and how a
new rule gets added. [`SEO-MODULE.md`](SEO-MODULE.md) added 3 more rules
(`MissingMetaDescriptionRule`, `MissingFeaturedImageRule`,
`RobotsBlockingCrawlersRule`) and fixed a real bug this table's
`SeoTitleRewriteRule` row exposed once more scanners shared its category —
see that doc's "Fixing a category collision this pass introduced".
[`GEO-MODULE.md`](GEO-MODULE.md) added 2 more (`FaqOpportunityRule`,
`MissingSummaryBlockRule`), following the same scanner-specific-meta-key
matching discipline from the start.

## What a rule does

A rule turns a `Finding` (a scanner's raw output) into a `Recommendation`
(prioritized, actionable advice):

```
Finding                                    Recommendation
────────────────────────────────────────   ──────────────────────────────────────
category: images                           title: "Generate an ALT text suggestion"
object_type: attachment                     type: suggestion
title: "Image missing alt text: photo.jpg"  priority: 40
                                             fixable: true
                                             ai_required: true
                                             estimated_impact: medium
                                             estimated_time_minutes: 2
```

This is the worked example from the original spec — `ImagesScanner`
produces the Finding, `MissingAltTextRule` produces the Recommendation.

## Why this supersedes the original RuleEngine sketch in ARCHITECTURE.md

The first pass at `ARCHITECTURE.md` described a "Rule Engine" that
evaluated a stored condition tree against a Context to gate Automations
(`RuleEngine.php` + `ConditionRegistry.php` + `Conditions/`) — a
config-driven "if this condition matches, allow this automation to fire"
mechanism, closer to a generic rules-engine library.

Once given a concrete spec (this pass), it's clear that isn't what
"Rule Engine" needs to mean for VuloPilot. The real job is: interpret raw
scan findings into recommendations a site owner (or an automation) can act
on, with the specific metadata (type, priority, categories, tags,
fixability, AI requirement, impact, time) that make a recommendation list
usable. That's a Finding → Recommendation transform, not an abstract
condition evaluator — so this pass replaces the sketch rather than
building both. `Conditions/` (empty, never had files in it) is superseded
by `Rules/`. Automations, when built, will trigger off *Recommendations*
(the richer, already-prioritized output of this engine) rather than off a
separate condition-tree layer — see "What's not here yet" below.

## Contracts (`multivendorx/packages/php/vulopilot-core`)

```
src/
├── Contracts/RuleEngine/
│   └── RuleInterface.php   get_id/get_label/get_type/get_priority/get_categories/
│                           get_tags/is_fixable/requires_ai/get_estimated_impact/
│                           get_estimated_time_minutes/get_tier/applies_to()/get_recommendation()
└── ValueObjects/
    ├── RuleType.php         critical|error|warning|suggestion
    ├── Impact.php           high|medium|low
    └── Recommendation.php   the output: a rule's metadata + finding-specific content
```

- **`RuleType` and `Impact` are separate vocabularies from `Severity`.**
  `Severity` (already existed, for `Finding`) describes how bad the
  underlying problem is. `RuleType` describes the *nature* of the advice
  (is this flagging something broken, warning about risk, suggesting an
  improvement, or demanding immediate attention). `Impact` describes how
  much *fixing* it is expected to help. A low-severity Finding (one broken
  homepage link) can still produce a high-impact Suggestion; a
  medium-severity Finding (WordPress core update available) still produces
  an Error-type, high-impact recommendation. Collapsing these into one
  scale would lose real information the UI needs for sensible sorting.
- **No `ConditionInterface`.** The original sketch had one (matching
  `ScannerInterface`/`ScanResultInterface`'s planned shape); it's dropped
  here because `applies_to( Finding $finding ): bool` already *is* the
  matcher — pulling it out into a separate pluggable `Condition` object
  would only make sense if a rule needed to combine multiple independent
  conditions (AND/OR trees), which none of the 5 built-in rules do. Add it
  later if a real rule actually needs composable conditions, not
  preemptively.
- **`Recommendation` is constructor-validated** (throws on an invalid
  `RuleType`/`Impact`), same discipline as `Finding` validating `Severity`.

## Engine (`multivendorx/plugins/vulopilot/classes/RuleEngine`)

```
classes/RuleEngine/
├── RuleRegistry.php   Instantiates every registered rule class, indexed by get_id()
├── RuleEngine.php      Runs rules against Findings, self-hooks vulopilot_scan_completed
└── Rules/
    ├── AbstractBasicRule.php   shared get_tier()='free' + sensible defaults
    └── (5 concrete rules)
```

- **`RuleRegistry` is structurally identical to `Scanners\ScannerRegistry`**
  — same filter-based discovery (`vulopilot_rule_sources` instead of
  `vulopilot_scanner_sources`), same "skip anything that doesn't exist or
  doesn't implement the interface" defensiveness, same reasoning for not
  copying `Modules.php`'s folder-scan mechanism. Once one engine in this
  plugin settled on a pattern, the second engine reusing it exactly is the
  point — consistency across VuloPilot's own subsystems, not just against
  the wider monorepo.
- **`RuleEngine` self-hooks `vulopilot_scan_completed`** (the hook
  `Scanners\ScanRunner` fires) — every completed scan automatically flows
  into recommendation generation with zero coupling between the two
  engines: `ScanRunner` has never heard of `RuleEngine`; `RuleEngine` only
  depends on `ScanResult`, a shared value object both engines already
  know about. This is the concrete "extendable pipeline" the whole
  Scanners → RuleEngine → (future) AutomationEngine design has been
  building toward.
- **One rule throwing doesn't break the batch** — `generate_recommendations()`
  wraps each `applies_to()`/`get_recommendation()` call pair in a
  try/catch, same defensive posture `ScanRunner` takes toward scanners.
- **Recommendations sort by priority, highest first**, so the dashboard/AI
  Assistant can take the top of the list without re-sorting.
- **No persistence, again deliberately.** `RuleEngine` fires
  `vulopilot_recommendations_generated` and stops — writing recommendations
  anywhere durable is the Repositories/Services layer's job, same boundary
  `ScanRunner` already draws for `ScanResult`.

## The 5 built-in rules (`classes/RuleEngine/Rules/`)

| Rule | `id` | type | priority | categories | fixable | AI required | impact | time |
|---|---|---|---|---|---|---|---|---|
| `MissingAltTextRule` | `missing-alt-text` | suggestion | 40 | `images` | yes | **yes** | medium | 2 min |
| `UnresolvedCriticalFindingRule` | `unresolved-critical-finding` | **critical** | 100 | *(any — see below)* | no | no | high | 15 min |
| `CoreUpdateAvailableRule` | `core-update-available` | error | 90 | `updates` | yes | no | high | 10 min |
| `DormantPluginRule` | `dormant-plugin` | warning | 20 | `plugins` | yes | no | low | 3 min |
| `SeoTitleRewriteRule` | `seo-title-rewrite` | suggestion | 30 | `seo` | yes | **yes** | medium | 5 min |

Deliberately chosen to cover all 4 `RuleType`s, both `is_fixable()` states,
both `requires_ai()` states, and one cross-cutting rule alongside four
category-scoped ones — not an attempt to cover all 14 scanners' worth of
findings (that's a natural, separate follow-up, same way the scanner pass
didn't try to write a rule per scanner up front).

`UnresolvedCriticalFindingRule.get_categories()` returns an empty array —
by convention (documented on `RuleInterface::get_categories()`), an empty
array means the rule is cross-cutting and matches on something other than
category (here, `Severity::CRITICAL`, regardless of what category the
Finding belongs to).

## Extension strategy

Identical shape to `SCANNERS.md`'s, on purpose — once a pattern exists in
this codebase, the second engine that could reuse it should, rather than
inventing a parallel-but-different extension mechanism:

1. **A new Free built-in rule**: add a class under `classes/RuleEngine/Rules/`
   extending `AbstractBasicRule`, add its `::class` reference to
   `RuleRegistry::get_default_rule_classes()`.
2. **A Pro premium rule**: implement `VuloPilotCore\Contracts\RuleEngine\RuleInterface`
   directly inside a Pro module (`get_tier()` returns `'premium'` — Pro
   rules don't extend `AbstractBasicRule`, whose whole reason to exist is
   hard-coding `'free'`), hook
   `add_filter( 'vulopilot_rule_sources', ... )` from the module's
   `Module.php` to append the class name.
3. **A third-party rule**: same mechanism as step 2, from any other plugin
   or theme — no more privileged a path for Pro than for a third party.

## What's not here yet

- **Persistence** of `Recommendation`s — same status as `ScanResult`
  persistence in `SCANNERS.md`.
- **REST endpoints** exposing recommendations to the admin UI already built.
- **The Automation Engine.** Automations (per `ARCHITECTURE.md`) will
  trigger off `Recommendation`s — e.g. "when a `fixable = true`,
  `type = critical` recommendation is generated, run this action" — rather
  than off the originally-sketched standalone condition-tree layer. Not
  built yet.
- **User-authored custom rules.** `vulopilot_rules` (the DB table in
  `DATABASE.md`, with its `condition_tree` column) is reserved for a
  *different*, later feature: letting a site owner author or override
  rules from the dashboard. The 5 rules in this pass are code-defined,
  like scanners — nothing here reads or writes that table today; when the
  custom-rule-builder feature is built, it's an addition alongside these,
  not a replacement.

## Operational note: the shared package's composer cache

`multivendorx/vulopilot-core` is wired in via a Composer **path**
repository with `"options": { "symlink": false }` (forces a real copy into
`vendor/`, not a symlink — a symlink to an absolute host path breaks
inside a Docker/wp-env container, which is exactly the fatal error this
setup hit once already). The tradeoff: `composer update` **does not always
notice when the shared package's source files change** and can silently
reuse a stale copy in `vendor/` — verified while building this feature,
where a fresh `composer update` initially produced a `vendor/` missing the
newly-added `RuleInterface.php`/`RuleType.php`/`Impact.php`/`Recommendation.php`.
Deleting `composer.lock` and `vendor/` and re-running `composer update`
forces a real re-copy. Anyone changing `vulopilot-core` and not seeing the
change reflected in a consuming plugin should do the same before assuming
something else is broken.
