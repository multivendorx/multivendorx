import { __ } from '@wordpress/i18n';

/**
 * The Modules page's metadata catalog — same shape as the free
 * multivendorx plugin's own `components/Modules/index.ts`
 * (`{ category, tab, modules: [...] }`, a `type: 'separator'` entry per
 * section, each real module `{ id, name, desc, proModule?, category }`).
 *
 * VuloPilot's own `modules/` folder-scan loader (module-architecture.md,
 * classes/Modules.php) has no real modules registered yet — free doesn't
 * ship any, and vulopilot-pro's own module registration is still deferred
 * (ARCHITECTURE.md's "What's deliberately NOT here yet": license gating +
 * `vulopilot_module_sources` registration both wait on Pro's `init_classes()`
 * landing). The five premium modules below are the ones ARCHITECTURE.md's
 * own Pro section already documents by name and behavior — shown here as
 * upsell cards (`proModule: true`) the same way multivendorx's own catalog
 * lists Pro-only modules a Free install doesn't have yet, not fabricated
 * feature ideas. `ComplianceReports` — originally documented as a Pro
 * module there — is deliberately NOT listed: the Reports Module (Reports
 * generation/exports/scheduling) shipped directly into Free during this
 * plugin's build, so listing it again here as a Pro upsell would be
 * inaccurate.
 */
export default {
	category: true,
	tab: 'modules',
	modules: [
		{
			type: 'separator',
			id: 'premium',
			label: __('Premium Modules', 'vulopilot'),
		},
		{
			id: 'advanced-security-scanner',
			name: __('Advanced Security Scanner', 'vulopilot'),
			desc: __(
				'Malware and file-integrity scanning across your entire WordPress install.',
				'vulopilot'
			),
			proModule: true,
			category: ['premium'],
		},
		{
			id: 'performance-optimizer',
			name: __('Performance Optimizer', 'vulopilot'),
			desc: __(
				'Deeper performance scanning plus AI actions that can apply the fix automatically.',
				'vulopilot'
			),
			proModule: true,
			category: ['premium'],
		},
		{
			id: 'multi-provider-ai',
			name: __('Multi-Provider AI', 'vulopilot'),
			desc: __(
				'Connect OpenAI, Anthropic, and Gemini with automatic provider fallback and routing.',
				'vulopilot'
			),
			proModule: true,
			category: ['premium'],
		},
		{
			id: 'advanced-automation-recipes',
			name: __('Advanced Automation Recipes', 'vulopilot'),
			desc: __(
				'Multi-step, conditional-branch automations built on top of the Automation Engine.',
				'vulopilot'
			),
			proModule: true,
			category: ['premium'],
		},
		{
			id: 'team-access',
			name: __('Team Access', 'vulopilot'),
			desc: __(
				'Delegate specific VuloPilot capabilities to other users on your team.',
				'vulopilot'
			),
			proModule: true,
			category: ['premium'],
		},
	],
};
