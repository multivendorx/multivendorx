# VuloPilot — AI Actions

Companion to [`AI-ARCHITECTURE.md`](AI-ARCHITECTURE.md), [`RULE-ENGINE.md`](RULE-ENGINE.md),
[`SCANNERS.md`](SCANNERS.md), and [`DATABASE.md`](DATABASE.md). Covers the action contract, the
8-stage lifecycle, all 4 built-in actions, persistence, and the extension strategy.

## What an AI Action is

Everything up through the Rule Engine pass produces *advice* — a `Recommendation` telling a site
owner what to do. An AI Action is what actually **does** it: a complete, safe, undoable workflow
from "here's the input" to "here's what changed on the site," with a mandatory human approval gate
in between and a recorded way back out.

```
Input → Prompt Builder → (AI call) → Validator → Preview → Approval → Execution → Rollback → Logging
```

Worked example (`GenerateAltAction`):

| Stage | What happens |
|---|---|
| Input | `attachment_id` validated — must exist and be an image |
| Prompt Builder | Filename + the post it's attached to become a chat prompt |
| *(AI call)* | Sent through `AIProviders\ProviderRegistry`'s fallback chain |
| Validator | Rejects an empty or absurdly long answer |
| Preview | "Set alt text for photo.jpg" + before/after text |
| Approval | A site owner clicks Approve (or Reject) — nothing has changed yet |
| Execution | `update_post_meta()` writes the new alt text |
| Rollback | Restores the exact previous value from a stored snapshot |
| Logging | Every stage transition above is a `vulopilot_activity_logs` row |

## Why this supersedes `AIJobHandlerInterface`

The AI-architecture pass built `AIJobHandlerInterface` (context/prompt/parse for one AI
conversation) keyed to a `Recommendation`. Given a concrete spec for what a complete action needs
— Preview, Approval, Execution, Rollback — that assumption breaks: **`GenerateBlogAction` has no
Recommendation to build context from at all.** A site owner types a topic and clicks Generate;
there was no Finding, no Rule, no scan involved. Tying every AI conversation to a Recommendation
was already too narrow the moment a second, genuinely different kind of AI-assisted workflow
existed.

So this pass replaces it rather than running two parallel "how do we talk to AI" systems side by
side (`AIJobHandlerInterface`'s two implementations, `AltTextJobHandler`/`SeoTitleRewriteJobHandler`,
and the now-unused `JobHandlerRegistry`/`AIJobRunner`, were deleted — not deprecated in place —
along with `AIJobHandlerInterface` itself). `AIActionInterface`'s `validate_input()` takes a plain
array, not a `Recommendation`, which is what makes both cases — "derived from a Finding" and
"typed by a user" — first-class instead of one being a workaround.

## Contracts (`multivendorx/packages/php/vulopilot-core`)

```
src/
├── Contracts/AI/
│   └── AIActionInterface.php   get_id/get_label/get_tier + 6 lifecycle methods (below)
├── ValueObjects/
│   ├── ActionPreview.php            summary + before/after + format — what stage 4 produces
│   └── ActionExecutionResult.php    success + object_type/ref + snapshot — what stage 6 produces
└── Exceptions/
    ├── InvalidActionInputException.php   thrown by validate_input(), before any AI call
    └── InvalidActionOutputException.php  thrown by validate_output(), before a Preview is built
```

`AIActionInterface` covers 6 of the 8 lifecycle stages directly:

| Stage | Interface method |
|---|---|
| 1. Input | `validate_input( array $input ): array` |
| 2. Prompt Builder | `build_prompt( array $input ): array` |
| — (AI call) | not on this interface — `AIActions\ActionRunner` calls it via `AIProviders\ProviderRegistry`, the same way `AIProviderInterface::send()` is what gets called, never re-implemented |
| — (parsing) | `parse_response( AIResponse $response ): array` |
| 3. Validator | `validate_output( array $output, array $input ): void` |
| 4. Preview | `build_preview( array $output, array $input ): ActionPreview` |
| 6. Execution | `execute( array $output, array $input ): ActionExecutionResult` |
| 7. Rollback | `rollback( array $snapshot ): void` |

**Stage 5 (Approval) and stage 8 (Logging) are deliberately not methods on the interface** — both
are identical across every action (a yes/no gate; a `vulopilot_activity_logs` write), so putting
either on the per-action contract would mean every new action re-implementing the same logic.
`ActionRunner` owns both generically instead.

## Persistence: `vulopilot_ai_action_runs`

Approval is a genuine pause — `propose()` and `approve()`/`reject()` are always two separate HTTP
requests, sometimes by two different people. A new table (`DATABASE.md`'s "known gaps" section
now updated) bridges them:

```sql
CREATE TABLE vulopilot_ai_action_runs (
    id             bigint(20) unsigned AUTO_INCREMENT,
    action_id      varchar(100),          -- e.g. 'generate-alt'
    status         varchar(20),           -- pending_approval|approved|rejected|executed|failed|rolled_back
    object_type    varchar(50),           -- set once executed, e.g. 'attachment'
    object_ref     varchar(255),
    input          longtext,              -- JSON, validate_input()'s output
    output         longtext,              -- JSON, parse_response()'s output
    preview        longtext,              -- JSON, ActionPreview::to_array()
    snapshot       longtext,              -- JSON, ActionExecutionResult::get_snapshot()
    error_message  text,
    requested_by   bigint(20) unsigned,
    approved_by    bigint(20) unsigned,
    created_at, approved_at, executed_at, rolled_back_at
);
```

Added directly to `Install.php`'s existing `1.0.0` baseline schema (`create_database_tables()`),
not a version-gated `1.1.0` migration — there is no real deployed `1.0.0` install of this
still-in-development plugin to stay backward-compatible with yet, so inventing a fake version bump
would misrepresent the schema's actual history. `Repositories\ActionRunRepository` is a thin
`AbstractRepository` subclass, same shape as every other repository in this codebase.

## `ActionRunner` — the orchestrator

Four public methods, not one `run()`, because of the approval pause:

```
propose( action_id, raw_input )   Stages 1-4. Persists 'pending_approval'. Nothing on the site changes.
approve( run_id )                 Stage 6. Persists 'executed' or 'failed'.
reject( run_id )                  Stage 5's negative branch. Persists 'rejected'. execute() never runs.
rollback( run_id )                Stage 7. Persists 'rolled_back'.
```

Every one of the four writes a `vulopilot_activity_logs` row (stage 8) via the existing
`ActivityLogRepository` — reused, not a second logging mechanism. `approve()` refuses to run twice
on the same `run_id` (only proceeds from `pending_approval`), and `rollback()` only proceeds from
`executed` — both enforced by checking `status` before doing anything, not left to the caller to
get right.

## The built-in actions (`classes/AIActions/Actions/`)

Chosen to cover every distinct kind of WordPress mutation + rollback shape, not to cover all 11
examples from the original spec — the remaining examples (Improve SEO, Improve GEO, Rewrite
Product, Summarize Post, Internal Linking) are same-pattern additions, most of them variations on
`ImproveReadabilityAction` (rewrite an existing field) or `GenerateSchemaAction` (add structured
metadata without touching existing content). Three more were since built: "Meta Description" —
[`SEO-MODULE.md`](SEO-MODULE.md)'s `Actions\WriteMetaDescriptionAction`, closing
`RuleEngine\Rules\MissingMetaDescriptionRule`'s fix loop the same way `GenerateAltAction` closes
`MissingAltTextRule`'s — and "Generate FAQ" plus a summary-block action —
[`GEO-MODULE.md`](GEO-MODULE.md)'s `Actions\GenerateFaqAction`/`GenerateSummaryBlockAction`,
introducing the append and prepend content-mutation shapes respectively (every action before those
either rewrote content wholesale, added postmeta-only, or created a new post).

| Action | Mutation pattern | Writes to | Rollback |
|---|---|---|---|
| `GenerateAltAction` | Metadata-only write | `_wp_attachment_image_alt` postmeta | Restore previous meta value |
| `ImproveReadabilityAction` | Existing-content rewrite | `post_content` via `wp_update_post()` | Restore previous `post_content` (also gets a bonus WP revision for free) |
| `GenerateSchemaAction` | Content-append (structured data) | `_vulopilot_schema_json` postmeta | Restore previous value, or delete if there wasn't one |
| `GenerateBlogAction` | New-content creation | `wp_insert_post()`, always `post_status = 'draft'` | `wp_trash_post()` (WordPress's own trash/restore is a second safety net) |
| `WriteMetaDescriptionAction` (SEO-MODULE.md) | Existing-field rewrite | `post_excerpt` via `wp_update_post()` | Restore previous `post_excerpt` |
| `GenerateFaqAction` (GEO-MODULE.md) | Content-append (visible HTML) | `post_content` via `wp_update_post()` | Restore previous `post_content` |
| `GenerateSummaryBlockAction` (GEO-MODULE.md) | Content-prepend (visible HTML) | `post_content` via `wp_update_post()` | Restore previous `post_content` |

`GenerateAltAction` is deliberately the one built to naturally pair with
`RuleEngine\Rules\MissingAltTextRule`'s recommendations — see "Recommendations as an input
source" below.

### `GenerateBlogAction` never auto-publishes

Approving this action only approves *generating a draft* — it does not put AI-written content
live. A human still has to open the draft and hit Publish themselves. This is a deliberate safety
choice, not a missing feature: the approval gate covers "should the AI attempt this," not "should
this go live unsupervised."

### `GenerateSchemaAction` doesn't render anything yet

It validates and saves valid JSON-LD to postmeta. Actually outputting that on the frontend (a
`wp_head` hook) is a separate, still-needed piece — see "What's not here yet".

## Recommendations as an input source

A `Recommendation` with `requires_ai() === true` (e.g. `MissingAltTextRule`'s) is one way an
action's `raw_input` gets built — the caller (a future REST endpoint) constructs
`['attachment_id' => $recommendation->get_object_ref()]` from the Recommendation and calls
`propose('generate-alt', $input)`. There's no hard-coded field linking a `RuleInterface` to an
`AIActionInterface` — the connection today is by convention (matching id/concept, e.g.
`missing-alt-text` ↔ `generate-alt`), not an enforced mapping. Formalizing that (an "Apply with
AI" button wired end-to-end) is REST/UI work, not part of this action-engine pass.

## Extension strategy

Identical shape to `SCANNERS.md`/`RULE-ENGINE.md`/`AI-ARCHITECTURE.md`:

1. **A new Free action**: extend `AbstractBasicAction`, add it to
   `ActionRegistry::get_default_action_classes()`.
2. **A Pro premium action**: implement `AIActionInterface` directly (`get_tier()` returns
   `'premium'`) inside a Pro module, register via
   `add_filter( 'vulopilot_ai_action_sources', ... )`, license-gated like every other Pro
   capability (`plugin-families.md`).
3. **A third-party action**: same filter, from any other plugin — no more privileged a path for
   Pro than a third party.

## What's not here yet

- **REST endpoints** for `propose`/`approve`/`reject`/`rollback` and an admin UI to trigger them —
  this pass is the engine; nothing yet calls `ActionRunner` from outside a test.
- **The other 7 example actions** (Generate FAQ, Improve SEO, Improve GEO, Rewrite Product,
  Summarize Post, Internal Linking, Meta Description) — same-pattern additions once needed, per
  the scoping note above.
- **Rendering `GenerateSchemaAction`'s saved JSON-LD** on the frontend.
- **A formal Recommendation → Action mapping** (currently by-convention id matching only).
- **Multimodal input** — `GenerateAltAction` is still context-based, not vision-based, for the
  same reason noted in `AI-ARCHITECTURE.md`.
