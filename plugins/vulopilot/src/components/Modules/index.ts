import { __ } from '@wordpress/i18n';

/**
 * The Modules page's metadata catalog — same shape as the free
 * multivendorx plugin's own `components/Modules/index.ts`
 * (`{ category, tab, modules: [...] }`, a `type: 'separator'` entry per
 * section, each real module `{ id, name, desc, proModule?, category }`).
 *
 * These 6 ids match the kebab-case ids VuloPilot's Modules.php loader
 * derives from vulopilot-pro's actual `modules/{Folder}/Module.php` folder
 * names (camel_to_kebab()) — Automation, SecurityMonitoring, WooCommerceAi,
 * AdvancedReports, OneClickFix, GeoInsights. The plugin's readme.txt is the
 * source of truth for this split: Free covers Website Health Monitoring,
 * SEO/GEO/Accessibility/WooCommerce scanning and detection, and BYOK AI
 * content generation; these 6 Pro modules cover "AI Automation Workflows",
 * "Scheduled Website Scans", "Security Monitoring", "WooCommerce AI"/"AI
 * Product Optimization", "Historical Reports", "One-Click AI Fixes", and
 * "GEO AI Scoring" respectively. `proModule: true` still shows the upsell
 * framing for a site without vulopilot-pro installed; `useModules()`'s
 * zustand store (ModuleGridComponent) already handles showing these as
 * active/available instead once Pro registers them via
 * `vulopilot_module_sources` — no separate "is this real" flag needed here.
 *
 * `miniModule: true` on every real entry (not the separator) is required
 * for `ModuleGridComponent`'s `variant="mini-module"` — used by the
 * Dashboard's compact Modules card (`pages/Dashboard/WelcomeSection.tsx`)
 * — to render anything at all: that variant filters `modulesArray.modules`
 * down to only `miniModule`-flagged entries, and this plugin's own
 * standalone Modules page (`Modules.tsx`) doesn't pass `variant`, so it
 * was never exercised until the Dashboard card needed it.
 */
export default {
	category: true,
	tab: 'modules',
	modules: [
		{
			type: 'separator',
			id: 'free',
			label: __('Free Modules', 'vulopilot'),
		},
		{
			id: 'geo',
			name: __('GEO', 'vulopilot'),
			desc: __(
				'Auto-regenerates llms.txt on publish/update (Settings → GEO). The GEO scanners and findings table themselves are core and run regardless of this module — this only covers that one automation.',
				'vulopilot'
			),
			category: ['free'],
			miniModule: true,
		},
		{
			type: 'separator',
			id: 'premium',
			label: __('Premium Modules', 'vulopilot'),
		},
		{
			id: 'automation',
			name: __('Automation', 'vulopilot'),
			desc: __(
				'AI Automation Workflows and Scheduled Website Scans — the trigger→action engine (11 triggers, 4 actions) plus recurring wp-cron scanning. Free only runs on-demand, manually-triggered scans without this module.',
				'vulopilot'
			),
			proModule: true,
			category: ['premium'],
			miniModule: true,
		},
		{
			id: 'security-monitoring',
			name: __('Security Monitoring', 'vulopilot'),
			desc: __(
				'Checks for an admin account named "admin" and anonymous REST API user-enumeration exposure.',
				'vulopilot'
			),
			proModule: true,
			category: ['premium'],
			miniModule: true,
		},
		{
			id: 'woo-commerce-ai',
			name: __('WooCommerce AI', 'vulopilot'),
			desc: __(
				'AI Product Optimization and Bulk AI Optimization — rewrites product titles, generates descriptions/FAQ/schema, and suggests cross-sell/upsell/bundles. Product detection scanning itself stays free; this closes the fix loop with AI.',
				'vulopilot'
			),
			proModule: true,
			category: ['premium'],
			miniModule: true,
		},
		{
			id: 'advanced-reports',
			name: __('Advanced Reports', 'vulopilot'),
			desc: __(
				'Historical Reports — recurring, emailed report schedules, a custom report builder that merges multiple report types, and historical site-health trend data.',
				'vulopilot'
			),
			proModule: true,
			category: ['premium'],
			miniModule: true,
		},
		{
			id: 'one-click-fix',
			name: __('One-Click AI Fixes', 'vulopilot'),
			desc: __(
				'Adds a "Fix this" action to findings that have a matching AI action (missing alt text, thin content, missing meta description, and more) — proposes the fix with one click; approving it still goes through the same Dashboard review every AI action requires.',
				'vulopilot'
			),
			proModule: true,
			category: ['premium'],
			miniModule: true,
		},
		{
			id: 'geo-insights',
			name: __('GEO Insights', 'vulopilot'),
			desc: __(
				'Per-post AI scoring for AI-search-engine discoverability — entity coverage, question coverage, answer completeness, LLM readability, and AI suggestions. The deterministic GEO findings table stays free; this AI-scored card is Pro.',
				'vulopilot'
			),
			proModule: true,
			category: ['premium'],
			miniModule: true,
		},
	],
};
