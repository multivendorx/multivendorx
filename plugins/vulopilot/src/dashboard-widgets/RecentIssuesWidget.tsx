/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { getApiLink, getApiResponse } from '@zyra/core';
import { ModuleGuardComponent } from '@zyra/components';
import DashboardWidget from './DashboardWidget';
import { WidgetProps } from './types';

interface FindingRow {
	id: number;
	title: string;
	severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
	category: string;
}

interface FindingListResponse {
	data: FindingRow[];
	total: number;
}

/** Security has no dedicated page of its own (see HealthPillarsWidget's
 * same note) — its findings only ever show up in Health's unfiltered
 * list, so that's where a security finding's row navigates. */
const CATEGORY_TABS: Record<string, string> = {
	seo: 'seo',
	performance: 'performance',
	accessibility: 'accessibility',
	woocommerce: 'woocommerce',
	geo: 'geo',
	security: 'health',
};

/**
 * A real, honest replacement for a "quick fixes"/"top opportunities"
 * style widget — rather than inventing fixed action names with no
 * backend behind them, this reuses the same `GET /findings` endpoint
 * FindingsTable.tsx already calls (Health/SEO/GEO/WooCommerce pages),
 * scoped to the 5 most recent open findings across every category, each
 * row linking to the page that actually shows it. `count_quick_fixes()`
 * in Dashboard.php only ever returns a count, not a list of individually
 * named fixes — there's no real per-finding "suggested fix" text to
 * surface yet, so this widget shows what's actually known (title,
 * category, severity) instead of fabricating one.
 */
const RecentIssuesWidget: React.FC<WidgetProps> = ({
	onHide,
	isCustomizing,
}) => {
	const [findings, setFindings] = useState<FindingRow[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		getApiResponse<FindingListResponse>(
			getApiLink(
				appLocalizer,
				'findings?status=open&per_page=5&orderby=id&order=desc'
			),
			{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
		)
			.then((response) => {
				if (response) {
					setFindings(response.data);
				}
			})
			.finally(() => setIsLoading(false));
	}, []);

	return (
		<DashboardWidget
			title={__('Recent open issues', 'vulopilot')}
			icon="warning"
			isLoading={isLoading}
			onHide={onHide}
			isCustomizing={isCustomizing}
		>
			{!isLoading && findings.length === 0 ? (
				<ModuleGuardComponent
					icon="check"
					title={__('No open issues', 'vulopilot')}
					desc={__(
						'Every scanned finding is resolved right now.',
						'vulopilot'
					)}
				/>
			) : (
				<ul className="dashboard-widget-list">
					{findings.map((finding) => (
						<li
							key={finding.id}
							className="dashboard-widget-list-row"
						>
							<button
								type="button"
								className="dashboard-widget-list-link"
								onClick={() => {
									const tab =
										CATEGORY_TABS[finding.category] ??
										'health';
									window.location.href = `?page=vulopilot#&tab=${tab}`;
								}}
							>
								<span className="dashboard-widget-list-message">
									{finding.title}
								</span>
								<span
									className={`admin-badge badge-severity-${finding.severity}`}
								>
									{finding.severity}
								</span>
							</button>
						</li>
					))}
				</ul>
			)}
		</DashboardWidget>
	);
};

export default RecentIssuesWidget;
