import { __, sprintf } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { createStatWidgetComponent, StatWidgetConfig } from './StatWidget';
import HealthTimelineWidget from './HealthTimelineWidget';
import RecentActivityWidget from './RecentActivityWidget';
import LatestReportsWidget from './LatestReportsWidget';
import PendingApprovalWidget from './PendingApprovalWidget';
import AutomationStatusWidget from './AutomationStatusWidget';
import { WidgetDefinition } from './types';

/**
 * The seven "one number" widgets, each a StatWidgetConfig — see
 * StatWidget.tsx for why these share one component instead of seven.
 */
const STAT_WIDGET_CONFIGS: StatWidgetConfig[] = [
	{
		id: 'overall-health',
		title: __('Overall health', 'vulopilot'),
		icon: 'home',
		getNumber: (summary) => `${summary.overall_score}/100`,
		getExtra: (summary) =>
			sprintf(
				/* translators: %d is the number of open findings. */
				__('%d open findings', 'vulopilot'),
				summary.open_findings
			),
	},
	{
		id: 'seo',
		title: __('SEO', 'vulopilot'),
		icon: 'search',
		getNumber: (summary) => `${summary.category_scores.seo}/100`,
	},
	{
		id: 'performance',
		title: __('Performance', 'vulopilot'),
		icon: 'bar-chart',
		getNumber: (summary) => `${summary.category_scores.performance}/100`,
	},
	{
		id: 'security',
		title: __('Security', 'vulopilot'),
		icon: 'security',
		getNumber: (summary) => `${summary.category_scores.security}/100`,
		getExtra: (summary) =>
			sprintf(
				/* translators: %d is the number of critical findings. */
				__('%d critical', 'vulopilot'),
				summary.critical_findings
			),
	},
	{
		id: 'woocommerce',
		title: __('WooCommerce', 'vulopilot'),
		icon: 'woocommerce',
		getNumber: (summary) => `${summary.category_scores.woocommerce}/100`,
		getUnavailableState: (summary) =>
			summary.category_scores.woocommerce === null
				? {
						title: __('WooCommerce not active', 'vulopilot'),
						desc: __(
							'Install and activate WooCommerce to see marketplace health here.',
							'vulopilot'
						),
					}
				: null,
	},
	{
		id: 'accessibility',
		title: __('Accessibility', 'vulopilot'),
		icon: 'eye',
		getNumber: (summary) => `${summary.category_scores.accessibility}/100`,
	},
	{
		id: 'ai-usage',
		title: __('AI usage', 'vulopilot'),
		icon: 'ai',
		getNumber: (summary) =>
			`${summary.ai_jobs_used}/${summary.ai_jobs_quota}`,
		getExtra: () => __('This month', 'vulopilot'),
	},
	{
		id: 'quick-fixes',
		title: __('Quick fixes', 'vulopilot'),
		icon: 'check',
		getNumber: (summary) => summary.quick_fixes,
		getExtra: (summary) =>
			summary.quick_fixes > 0
				? __('Fixable with one AI action', 'vulopilot')
				: __('Nothing to fix right now', 'vulopilot'),
	},
];

/** The six widgets with their own fetch and/or non-stat layout. */
const STANDALONE_WIDGETS: WidgetDefinition[] = [
	{
		id: 'recent-activity',
		title: __('Recent activity', 'vulopilot'),
		icon: 'clock',
		size: 'medium',
		component: RecentActivityWidget,
	},
	{
		id: 'health-timeline',
		title: __('Health timeline', 'vulopilot'),
		icon: 'analytics',
		size: 'large',
		component: HealthTimelineWidget,
	},
	{
		id: 'latest-reports',
		title: __('Latest reports', 'vulopilot'),
		icon: 'report',
		size: 'medium',
		component: LatestReportsWidget,
	},
	{
		id: 'pending-approval',
		title: __('Pending approval', 'vulopilot'),
		icon: 'approval',
		size: 'medium',
		component: PendingApprovalWidget,
	},
	{
		id: 'automation-status',
		title: __('Automation status', 'vulopilot'),
		icon: 'automation',
		size: 'medium',
		component: AutomationStatusWidget,
	},
];

const STAT_WIDGETS: WidgetDefinition[] = STAT_WIDGET_CONFIGS.map(
	(config) => ({
		id: config.id,
		title: config.title,
		icon: config.icon,
		size: 'small' as const,
		component: createStatWidgetComponent(config),
	})
);

/**
 * Every widget the Dashboard can render, in the same order the widget
 * list was requested in. Passed through `vulopilot_dashboard_widgets`
 * (@wordpress/hooks — the same filter mechanism react-frontend.md
 * documents multivendorx using, e.g. `multivendorx_product_button`) so a
 * Pro module or third-party plugin can append its own WidgetDefinition
 * without touching this file — the same "register a source, don't
 * modify the registry" pattern used by every PHP-side registry in this
 * plugin (ScannerRegistry, RuleRegistry, ProviderRegistry, ActionRegistry).
 */
export const DEFAULT_DASHBOARD_WIDGETS: WidgetDefinition[] = applyFilters(
	'vulopilot_dashboard_widgets',
	[...STAT_WIDGETS, ...STANDALONE_WIDGETS]
) as WidgetDefinition[];
