/* global appLocalizer */
import { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { getApiLink, getApiResponse } from '@zyra/core';
import { AnalyticsComponent, CardComponent, ModuleGuardComponent } from '@zyra/components';
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import { useApiList } from '../../services/useApiList';

interface CategoryScores {
	seo: number;
	performance: number;
	security: number;
	accessibility: number;
	woocommerce: number | null;
	geo: number;
}

interface DashboardSummary {
	overall_score: number;
	open_findings: number;
	critical_findings: number;
	category_scores: CategoryScores;
}

interface HealthSnapshot {
	snapshot_date: string;
	overall_score: number;
}

/**
 * Readme.txt's "Website Health Monitoring" → "Website Health Score" +
 * "Health Score Trend Timeline" pillars, surfaced on the dedicated Health
 * page itself rather than only on the Dashboard — this page previously
 * rendered a bare FindingsTable with no score context at all, unlike
 * SEO/GEO/WooCommerce's pages once they got their own summary cards.
 *
 * The composite score tiles reuse GET /dashboard's already-computed
 * `overall_score`/`category_scores` (Controllers/Dashboard.php's
 * calculate_overall_score()/calculate_category_score(), the same live,
 * on-demand weighting formula the Dashboard's "Overall health" stat
 * widget already uses) — no new backend endpoint. The trend chart reuses
 * `/site-health-snapshots` the exact same way dashboard-widgets/
 * HealthTimelineWidget.tsx does, including its same graceful "no trend
 * data yet" empty state for a Free-only install where that Pro-only
 * (vulopilot-pro AdvancedReports module) route doesn't exist yet — this
 * is a second, independent consumer of that endpoint, not a change to
 * the widget itself.
 */
const HealthScoreSummary = () => {
	const [summary, setSummary] = useState<DashboardSummary | null>(null);

	useEffect(() => {
		getApiResponse<DashboardSummary>(
			getApiLink(appLocalizer, 'dashboard'),
			{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
		).then((response) => {
			if (response) {
				setSummary(response);
			}
		});
	}, []);

	const { data: snapshots } = useApiList<HealthSnapshot>(
		'site-health-snapshots',
		{ days: 30 }
	);

	if (!summary) {
		return null;
	}

	const categoryTiles = [
		{
			icon: 'search',
			number: `${summary.category_scores.seo}/100`,
			text: __('SEO', 'vulopilot'),
		},
		{
			icon: 'bar-chart',
			number: `${summary.category_scores.performance}/100`,
			text: __('Performance', 'vulopilot'),
		},
		{
			icon: 'security',
			number: `${summary.category_scores.security}/100`,
			text: __('Security', 'vulopilot'),
		},
		{
			icon: 'eye',
			number: `${summary.category_scores.accessibility}/100`,
			text: __('Accessibility', 'vulopilot'),
		},
		{
			icon: 'globe',
			number: `${summary.category_scores.geo}/100`,
			text: __('GEO', 'vulopilot'),
		},
		...(summary.category_scores.woocommerce !== null
			? [
					{
						icon: 'woocommerce',
						number: `${summary.category_scores.woocommerce}/100`,
						text: __('WooCommerce', 'vulopilot'),
					},
				]
			: []),
	];

	return (
		<>
			<CardComponent title={__('Website health score', 'vulopilot')}>
				<AnalyticsComponent
					variant="dashboard"
					cols={4}
					data={[
						{
							icon: 'home',
							number: `${summary.overall_score}/100`,
							text: __('Overall health', 'vulopilot'),
						},
						{
							icon: 'warning',
							number: summary.open_findings,
							text: __('Open findings', 'vulopilot'),
						},
						{
							icon: 'flag',
							number: summary.critical_findings,
							text: __('Critical findings', 'vulopilot'),
						},
					]}
				/>
			</CardComponent>

			<CardComponent title={__('Score by pillar', 'vulopilot')}>
				<AnalyticsComponent
					variant="dashboard"
					cols={4}
					data={categoryTiles}
				/>
			</CardComponent>

			<CardComponent title={__('Health score trend, last 30 days', 'vulopilot')}>
				{snapshots.length === 0 ? (
					<ModuleGuardComponent
						icon="analytics"
						title={__('No trend data yet', 'vulopilot')}
						desc={__(
							'Run your first scan to start building a health score history.',
							'vulopilot'
						)}
					/>
				) : (
					<div className="dashboard-trend-chart">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={snapshots}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="snapshot_date" />
								<YAxis domain={[0, 100]} />
								<Tooltip />
								<Area
									type="monotone"
									dataKey="overall_score"
									stroke="#4B227A"
									fill="#00EED0"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				)}
			</CardComponent>
		</>
	);
};

export default HealthScoreSummary;
