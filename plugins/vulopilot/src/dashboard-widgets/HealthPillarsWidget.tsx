import React from 'react';
import { __ } from '@wordpress/i18n';
import DashboardWidget from './DashboardWidget';
import { WidgetProps } from './types';
import './HealthPillarsWidget.scss';

/* eslint-disable no-unused-vars -- named param on a type-only call signature; base no-unused-vars doesn't recognize TS call-signature parameters, same as StatWidget.tsx's StatWidgetConfig */
/** Where each pillar's tile navigates — same `?page=vulopilot#&tab=X` hash
 * link WelcomeSection.tsx's "View All" modules button already uses, not a
 * new navigation mechanism. Security has no dedicated page of its own
 * (its score lives in category_scores, but its findings only ever show up
 * in Health's unfiltered list), so it routes to Health rather than a
 * dead tab. */
const PILLAR_TILES: {
	id: string;
	tab: string;
	label: string;
	icon: string;
	getScore: (summary: WidgetProps['summary']) => number | null;
}[] = /* eslint-enable no-unused-vars */ [
	{
		id: 'seo',
		tab: 'seo',
		label: __('SEO', 'vulopilot'),
		icon: 'search',
		getScore: (summary) => summary.category_scores.seo,
	},
	{
		id: 'performance',
		tab: 'performance',
		label: __('Performance', 'vulopilot'),
		icon: 'bar-chart',
		getScore: (summary) => summary.category_scores.performance,
	},
	{
		id: 'accessibility',
		tab: 'accessibility',
		label: __('Accessibility', 'vulopilot'),
		icon: 'eye',
		getScore: (summary) => summary.category_scores.accessibility,
	},
	{
		id: 'geo',
		tab: 'geo',
		label: __('GEO', 'vulopilot'),
		icon: 'globe',
		getScore: (summary) => summary.category_scores.geo,
	},
	{
		id: 'security',
		tab: 'health',
		label: __('Security', 'vulopilot'),
		icon: 'security',
		getScore: (summary) => summary.category_scores.security,
	},
	{
		id: 'woocommerce',
		tab: 'woocommerce',
		label: __('WooCommerce', 'vulopilot'),
		icon: 'woocommerce',
		getScore: (summary) => summary.category_scores.woocommerce,
	},
];

/**
 * "At a glance" hero for the Dashboard — every pillar's score in one row,
 * each tile a real link to that pillar's own page. HealthScoreSummary.tsx
 * already shows the same category_scores as plain (non-clickable)
 * AnalyticsComponent tiles on the Health page; this widget reuses the
 * same tile look (see HealthPillarsWidget.scss, modeled on zyra's
 * AnalyticsComponent.scss) but as real `<button>` elements so each score
 * is also a launcher, which is what the Dashboard — unlike Health — is
 * for. Registered as a normal widget (not a fixed section) so it's
 * subject to the same show/hide/reorder customization every other widget
 * already has.
 */
const HealthPillarsWidget: React.FC<WidgetProps> = ({
	summary,
	isLoading,
	onHide,
	isCustomizing,
}) => {
	const navigateTo = (tab: string) => {
		window.location.href = `?page=vulopilot#&tab=${tab}`;
	};

	return (
		<DashboardWidget
			title={__('Health by pillar', 'vulopilot')}
			icon="home"
			isLoading={isLoading}
			onHide={onHide}
			isCustomizing={isCustomizing}
		>
			<div className="dashboard-pillar-grid">
				{PILLAR_TILES.map((pillar) => {
					const score = pillar.getScore(summary);

					if (score === null) {
						return null;
					}

					return (
						<button
							key={pillar.id}
							type="button"
							className="dashboard-pillar-tile"
							onClick={() => navigateTo(pillar.tab)}
						>
							<i className={`adminfont-${pillar.icon}`} />
							<span className="dashboard-pillar-tile-label">
								{pillar.label}
							</span>
							<span className="dashboard-pillar-tile-score">
								{score}
								<small>/100</small>
							</span>
						</button>
					);
				})}
			</div>
		</DashboardWidget>
	);
};

export default HealthPillarsWidget;
