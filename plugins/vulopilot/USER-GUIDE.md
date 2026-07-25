# VuloPilot (Free) — User Guide

This is a store-owner/site-admin guide to what VuloPilot's free tier actually does today. It's distinct from `readme.txt` (marketing copy) and from `.claude/`-style developer documentation (hooks/filters reference for third-party extenders) — this describes the real, current behavior of the plugin, verified against the code.

## What VuloPilot does

VuloPilot scans your WordPress site for issues across several categories, lists what it finds as **findings**, and — for some finding types — can draft an AI-written fix you review and approve before anything changes. It never edits your site automatically; every AI action requires you to approve it first.

## The Dashboard

The landing screen (`VuloPilot` in the admin menu). Shows:
- An overall health score (0–100), computed from currently-open findings (critical findings cost the most, low/info findings cost little).
- A "Run scan" button — triggers every scanner immediately and refreshes the dashboard when done.
- A grid of widgets: severity/category breakdowns, pending AI-action approvals, automation status, recent activity, latest reports, and a health-score trend chart. Widgets can be reordered/hidden.

**Known limitation**: the health-score *trend chart* only shows data once VuloPilot Pro's Advanced Reports module is active — the free plugin doesn't record historical daily snapshots itself (that's deliberately Pro-only historical-trend functionality). On a Free-only install this widget correctly shows "No trend data yet," not an error.

## Website Health Monitoring

Always-on checks, no toggle to disable them:
- Plugin/theme/core update availability
- Broken links found in your content
- Missing image alt text
- Excessive database bloat (post revisions, oversized autoloaded options)
- SSL certificate validity/expiry, or the site not running HTTPS at all
- Redirect chain length on your homepage
- Published pages that 404 on their own URL
- Recent PHP warnings/errors (only if `WP_DEBUG_LOG` is enabled — VuloPilot reads your site's own debug.log, it doesn't turn logging on for you)

## SEO Optimization (Settings → Scanning → SEO)

Toggle: **Enable SEO scanning**. Checks title length, meta descriptions, heading structure, internal linking, canonical URLs, XML sitemap, robots.txt, Open Graph tags, Twitter Cards, orphaned pages, image SEO, structured data, duplicate/thin content.

## GEO — Generative Engine Optimization (Settings → Scanning → GEO)

Toggle: **Enable GEO scanning**. Distinct from classic SEO — how discoverable/citable your content is to AI answer engines (ChatGPT, Perplexity, etc.): author-info presence, E-E-A-T signals, trust signals, citation opportunities, FAQ opportunities, content chunking, semantic structure.

The **GEO page** also has a per-post **GEO Score** card: enter a post ID, click "Generate GEO score" for an AI-scored breakdown (entity coverage, question coverage, answer completeness, LLM readability) plus written suggestions. Requires an AI provider to be configured (see below).

## Accessibility Scanner (Settings → Scanning → Accessibility)

Toggle: **Enable accessibility scanning**. Checks: duplicate `<h1>` tags, form fields missing labels, interactive elements missing ARIA roles. (Missing image alt text is checked too, but is filed under Website Health Monitoring above, not this category.)

## WooCommerce Optimization (Settings → Scanning → WooCommerce)

Toggle: **Enable WooCommerce scanning**. Only relevant if WooCommerce is active. Checks: checkout page health, missing product images/categories/tags/descriptions, SKU issues, product attributes, inventory health, pricing anomalies, duplicate products, product completeness.

## AI SEO / Content Assistant

Requires at least one AI provider configured (Settings → AI Providers): OpenAI, Anthropic, Google Gemini, OpenRouter, Ollama, or Groq — bring your own API key, no VuloPilot-hosted AI in the free tier.

Every AI action follows the same **propose → review → approve/reject → (optional) rollback** flow — nothing is written to your site until you explicitly approve it, and approved actions can be rolled back afterward. Free-tier actions:
- Generate image alt text
- Improve readability of a post/page
- Generate structured data (JSON-LD)
- Generate a new blog post draft
- Write a meta description
- Generate an FAQ section
- Generate a content summary block
- Rewrite a page's SEO title
- Suggest internal links to other posts on your site (only ever links to real, existing pages — never an invented URL)
- Generate social media caption variants for a post

**How to trigger these today**: there's no in-UI button for most of these in the free tier yet (that one-click "Fix this" experience is a VuloPilot Pro feature). They're reachable via the REST API directly if you or a developer wants to call them.

## Reports (Reports page)

Generate a one-off report (PDF/CSV/JSON) covering: overall scan summary, SEO, WooCommerce, security, accessibility, automation activity, or AI usage. Pick a report type and click "Generate report."

**Not in free**: scheduled/recurring reports, a custom report builder combining multiple types, and historical trend reports — all Pro (Advanced Reports module).

## Automation (Automation page)

Lists your configured automations (name, trigger type, status, last run) with Enable/Disable and search. You can filter by status.

**Known limitation, please read**: the underlying trigger→action execution engine isn't built yet — automations can be listed, enabled, and disabled, but nothing currently makes one actually fire on its trigger, and the "Run now" button returns an explicit "not supported yet" message rather than silently failing. Free-tier scheduled scanning (a plain recurring scan, not a trigger→action automation) is the separate Pro "Scheduled Website Scans" feature.

## Activity (Activity page)

A chronological log of everything VuloPilot has done: scans run, findings created, AI actions proposed/approved/rejected. Searchable, filterable by actor type (user/system/automation).

## AI Assistant (AI Assistant page)

A history of every AI provider call VuloPilot has made on your behalf — provider, model, token usage, success/failure. Searchable. This is an audit log, not a chat interface.

## Settings

- **General**: scan frequency preference (inert without Pro's scheduler — Free only runs scans on demand or via WP-Cron if you trigger it yourself), dashboard-layout note.
- **Notifications**: where critical-finding alerts email to, and the from-name/from-address for VuloPilot's own emails.
- **Automation**: cooldown period for a would-be automation (inert until the execution engine exists — see above).
- **Scanning → SEO / GEO / Accessibility / WooCommerce**: per-category on/off toggles, described above.
- **Scanning → Security**: informational — VuloPilot's security checks (admin-username detection, REST API user-enumeration exposure) are entirely a Pro feature; there's no free security scanner.
- **Account → AI Providers**: configure your OpenAI/Anthropic/Gemini/OpenRouter/Ollama/Groq API keys.
- **Account → Permissions**: informational only today — no real capability/role system exists yet.
- **Advanced**: debug logging toggle.
- **Advanced → Import/Export**: export/import your VuloPilot settings, or reset to defaults.

## What's Pro-only (for context)

Automation Workflows + Scheduled Scans, Security Monitoring, WooCommerce AI (9 product-specific AI actions — descriptions, titles, FAQs, cross-sell/upsell suggestions), Advanced Reports (scheduling, custom builder, historical trends), and One-Click AI Fixes (the in-UI "Fix this" button on findings). Everything else described above is free, unrestricted, with no time limit.

## Known issues / limitations (current, honest state)

- Automation's execution engine doesn't exist yet — enable/disable and listing work; actually running an automation doesn't.
- Bulk actions only exist on the Findings tables (Health/SEO/GEO/WooCommerce) — Resolve/Ignore multiple findings at once. Reports, Automation, Activity, and AI Assistant only support one row at a time.
- Search works on Findings, Activity, AI Assistant, and Automation tables. Reports doesn't have a search box — there's no good free-text field on a report row to search.
- Most free-tier AI actions have no in-UI trigger button yet (Pro's One-Click Fix provides that experience); they're reachable via REST today.
- "Core Web Vitals" and general "WCAG Recommendations" aren't literal, standalone checks — the closest available signal is the combination of the Slow Pages/Large Images performance checks (which affect Core Web Vitals) and the sum of all Accessibility-category checks (which is what "WCAG Recommendations" means in practice here).

## Manual testing checklist (for a human, in a browser)

This guide's functional review was done via WP-CLI and static code reading — it cannot see the rendered page or catch a client-side JavaScript console error. Before relying on this as "fully verified," a human should check, in an actual browser:

- [ ] Every table page (Health, SEO, GEO, WooCommerce, Activity, AI Assistant, Automation, Reports) shows exactly one page header and one item count, no duplicates.
- [ ] Triggering a row action (Resolve/Ignore/Reopen, Enable/Disable, Generate report) shows exactly one success/error toast, not two.
- [ ] The search box on Health/SEO/GEO/WooCommerce/Activity/AI Assistant/Automation actually filters results as you type.
- [ ] Selecting multiple findings on Health/SEO/GEO/WooCommerce and applying a bulk action (Mark resolved/Ignore) updates all selected rows.
- [ ] Pagination controls move between pages of results correctly on every table.
- [ ] Filters (severity/status/category-specific) narrow results correctly.
- [ ] The browser console shows no JavaScript errors on any of the above screens.
- [ ] Running a scan from the Dashboard actually populates new findings, and the dashboard's score/widgets update afterward.
- [ ] The GEO page's "Generate GEO score" button produces a real result when an AI provider is configured, and a clear error when none is.
