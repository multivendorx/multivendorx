# VuloPilot — AI provider architecture

Companion to [`RULE-ENGINE.md`](RULE-ENGINE.md), [`SCANNERS.md`](SCANNERS.md), and
[`DATABASE.md`](DATABASE.md). Covers the adapter contract, all 6 provider adapters, the
decorator stack (retry/rate-limit/usage-tracking/fallback), context/prompt/response job
handlers, safety validation, and the extension strategy.

## Contracts (`multivendorx/packages/php/vulopilot-core`)

```
src/
├── Contracts/AI/
│   └── AIProviderInterface.php    get_id/get_label/supports_streaming/get_available_models/send()/send_streaming()
├── ValueObjects/
│   ├── AIRequest.php               model, messages, temperature, max_tokens, stream — no credential
│   └── AIResponse.php              content, provider, model, prompt/completion tokens, finish_reason
└── Exceptions/
    ├── AIProviderException.php         base — catch this for "any provider failure"
    ├── TransientProviderException.php  retry-eligible (network error, 5xx, 429)
    ├── ProviderRequestException.php    not retry-eligible (bad key, malformed request)
    ├── RateLimitExceededException.php  thrown before an inner call even happens
    └── UnsafePromptException.php       thrown by the safety validator, before any provider is touched
```

> **Superseded:** this pass originally also defined `AIJobHandlerInterface` (context/prompt/parse
> for one AI conversation tied to a `Recommendation`) plus `AIJobRunner` and two job handlers. A
> later pass ([`AI-ACTIONS.md`](AI-ACTIONS.md)) replaced all of that with `AIActionInterface` +
> `AIActions\ActionRunner` once a second, genuinely different kind of AI-assisted workflow
> (user-typed input with no `Recommendation` at all, e.g. "Generate Blog") showed the
> Recommendation-only assumption was already too narrow. Those files were deleted, not left
> around deprecated — see `AI-ACTIONS.md`'s "Why this supersedes `AIJobHandlerInterface`" for the
> full reasoning. Everything below this note (providers, decorators, safety validation) is
> unaffected and still current.

- **`AIProviderInterface` is the only interface for a "provider"** — and every decorator
  (`Decorators\*`) implements the *same* interface it wraps. That's what makes "no
  provider-specific code outside adapters" structurally true: `AIActions\ActionRunner` calling
  `send()` never knows or needs to know whether it's talking to a raw `OpenAiProvider` or four
  decorators deep.
- **No `AIRequestInterface`/`AIResponseInterface`** — same reasoning as `Finding`/`ScanResult`/
  `Recommendation` in the Scanner/Rule Engine passes: there's exactly one shape for "a
  provider-agnostic chat request/response," so an interface for either would have one
  implementation and add nothing.
- **The exception hierarchy is what makes the decorator stack composable without any decorator
  inspecting *what kind* of provider it's wrapping** — `RetryingProvider` only ever asks "was
  this a `TransientProviderException`?", never "was this an OpenAI rate limit?".

## The 6 adapters (`classes/AIProviders/Providers/`)

| Adapter | Auth | Notable difference from the others |
|---|---|---|
| `OpenAiProvider` | `Authorization: Bearer` | The reference shape — `/chat/completions`, SSE streaming |
| `OpenRouterProvider` | `Authorization: Bearer` | Same wire protocol as OpenAI + `HTTP-Referer`/`X-Title` headers |
| `GroqProvider` | `Authorization: Bearer` | Same wire protocol as OpenAI, different base URL |
| `AnthropicProvider` | `x-api-key` header | `system` role pulled out of `messages[]` into a top-level field; `max_tokens` is *required*; response `content` is typed blocks, not a string; SSE framed as named events |
| `GeminiProvider` | `?key=` query param | `contents`/`parts` shape; assistant role is called `'model'`; system message goes in `systemInstruction`; streaming needs `alt=sse` to get line-by-line events instead of one streamed JSON array |
| `OllamaProvider` | none (local server) | No API key at all — what's "configured" is a base URL; streaming is raw NDJSON, not SSE |

**`AbstractOpenAiCompatibleProvider`** is the shared base for OpenAI/OpenRouter/Groq — real code
reuse, not a forced abstraction, because those three genuinely speak the same protocol.
Anthropic/Gemini/Ollama each get a standalone adapter because their request/response shapes are
genuinely different — folding them into the same base class would have been the opposite
mistake (a false abstraction hiding real differences).

### Streaming — what's real here and what's a documented gap

`StreamingHttpClient` (`AIProviders/Support/`) opens a real blocking socket read via PHP's native
`http://`/`https://` stream wrapper (`fopen()` + `fread()` in a loop) — not `wp_remote_post()`,
which buffers WordPress's entire HTTP response before returning and has no incremental-read hook
at all. This is genuine, working streaming transport: bytes are delivered to each adapter's
line-parsing callback as the server sends them, not simulated after the fact.

What's **not** here: real concurrent multi-stream handling (e.g. a raw cURL multi-handle) — every
`send_streaming()` call is a single blocking connection, which is the correct and sufficient
shape for "stream one AI response to one dashboard request," the only use case this pass builds
for.

## Credentials (BYOK)

`vulopilot_ai_provider_configs` (`DATABASE.md`) stores `provider`, `credentials` (always
encrypted — see below), `default_model`, `is_active`, `quota_limit`/`quota_used`.
`Repositories\AiProviderConfigRepository` is a thin `AbstractRepository` subclass, same shape as
every other repository from the REST/Repository pass.

**`Services\CredentialEncryption`** is new ground for this codebase (flagged in `DATABASE.md` when
the table was first designed) — AES-256-CBC, key derived from `wp_salt('auth')` (never stored in
the database itself), random IV per call. `ProviderRegistry::build_provider()` is the **one place**
a credential is ever decrypted — repositories, REST controllers, and job handlers never see a raw
key.

### BYOK vs. Built-in Credits

This pass builds BYOK only — a site owner enters their own key, it's encrypted and stored, and
`ProviderRegistry` decrypts it to build an adapter. **Built-in Credits (a MultiVendorX-hosted,
metered proxy so a site owner doesn't need their own key) is a Pro-tier extension point, not built
here** — the natural shape for it is a `BuiltInCreditsProvider` decorator (license-gated, like
every other Pro capability per `plugin-families.md`) that implements `AIProviderInterface` and
proxies through MultiVendorX's own server instead of decrypting a stored key, composing with the
existing decorator stack exactly the way `RetryingProvider`/`RateLimitedProvider` do. This keeps
Free's adapters and BYOK fully functional and real on their own, with Pro adding a mode, not adding
business logic Free is missing.

## The decorator stack (`classes/AIProviders/Decorators/`)

```
RateLimitedProvider → RetryingProvider → UsageTrackingProvider → (raw adapter)
```

Built by `ProviderRegistry::build_provider()` in exactly that order:

1. **`RateLimitedProvider`** — checks a per-minute budget (a WP transient, not a new caching
   layer — see its docblock) *before* even trying, so a spent budget never wastes a network round
   trip.
2. **`RetryingProvider`** — retries only `TransientProviderException` with exponential backoff
   (500ms, 1s, 2s, …); a `ProviderRequestException` or `RateLimitExceededException` passes straight
   through untouched, because retrying either would never help (see each exception's own
   docblock).
3. **`UsageTrackingProvider`** — records one `vulopilot_ai_history` row per real attempt, success
   or failure, with both token usage *and* an estimated USD cost together (merged into one
   decorator deliberately — see its docblock for why splitting "cost tracking" and "usage
   tracking" into two decorators would mean either two DB writes or awkward shared state).

**`ProviderFallbackChain`** is the "Fallback" requirement — also `AIProviderInterface`-shaped, but
built differently: `ProviderRegistry::build_fallback_chain()` builds one already-decorated chain
per configured provider (so each provider in the chain still gets its own rate limit/retry/usage
tracking) and tries them in order, moving on at any `AIProviderException`. Fallback is what
happens *after* an individual provider's own retries are exhausted, not a replacement for them.

## Job orchestration — now `AIActions\ActionRunner`

Superseded by the full action lifecycle in [`AI-ACTIONS.md`](AI-ACTIONS.md) — `propose()` covers
what this section used to describe (build a prompt, send it, safety-validate, parse the result),
then adds the Validator/Preview/Approval/Execution/Rollback/Logging stages `AIJobRunner` never
had. See that document for the full orchestration.

The "build a prompt, send it, safety-validate" sequence itself now lives in its own class,
**`AIProviders\Support\SafeRequestSender`**, extracted out of `ActionRunner::propose()` when
[`GEO-MODULE.md`](GEO-MODULE.md)'s `GeoAnalysis\GeoAnalyzer` needed the identical sequence for a
read-only analysis that isn't an `AIAction` at all (no mutation, so no Approval/Execution/Rollback
lifecycle applies). Both consumers now share one safety-validated call path instead of two.

## Safety validation (`Safety\AISafetyValidator`)

Two gates, not one — still used exactly as described here, now called from
`AIActions\ActionRunner` instead of the superseded `AIJobRunner`:

- **`validate_prompt()`** — runs *before* a request is ever sent. Rejects prompts over 32,000
  characters, and rejects (rather than silently stripping) any prompt whose text matches a
  known API-key shape (OpenAI-style `sk-…`, Google `AIza…`, a PEM private-key header) — a
  self-consistency check against exactly the kind of credential this codebase's own adapters
  handle, not a general PII scanner.
- **`sanitize_response()`** — runs on every response before an action ever sees it. Strips all
  HTML/script content via `wp_kses( $content, array() )` — an AI response is never trusted as
  safe-to-render markup just because the HTTP call succeeded.

## Extension strategy

Identical shape to `SCANNERS.md`/`RULE-ENGINE.md`, again on purpose:

1. **A new Free adapter** (a 7th provider): implement `AIProviderInterface`, add it to
   `ProviderRegistry::get_default_adapter_classes()`.
2. **A Pro premium provider mode** (e.g. the Built-in Credits decorator described above): register
   via `add_filter( 'vulopilot_ai_provider_sources', ... )` from a Pro module, license-gated the
   same way every other Pro capability is (`plugin-families.md`).
3. **A third-party adapter**: the same filter (`vulopilot_ai_provider_sources`), from any other
   plugin — no more privileged a path for Pro than for a third party.

## What's not here yet

- **Multimodal (vision) messages.** `AIRequest`'s `messages` are plain `{role, content: string}` —
  no image/file attachment support. `AI-ACTIONS.md`'s `GenerateAltAction` is context-based, not
  vision-based, as an honest answer to that gap, not a stand-in claiming to be vision-based.
- **Built-in Credits.** BYOK is fully real and functional; the Pro-tier hosted/metered mode is
  designed (see above) but not built.
- **A settings UI for configuring providers.** Nothing yet writes to
  `vulopilot_ai_provider_configs` from the dashboard — `AiProviderConfigRepository` exists and
  works, but there's no REST controller or Settings-page section wired to it yet (the existing
  Settings page only covers `scan_frequency`/`notification_email`).
- **Quota enforcement** against `vulopilot_ai_provider_configs.quota_limit`/`quota_used` — the
  columns exist in `DATABASE.md`'s schema; nothing reads or increments them yet. `RateLimitedProvider`
  enforces a *rate* (requests per minute), not a *budget* (total spend/tokens per period) — a
  related but different mechanism, deliberately not conflated here.
