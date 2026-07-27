/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { getApiLink, getApiResponse } from '@zyra/core';
import { ModuleGuardComponent } from '@zyra/components';
import DashboardWidget from './DashboardWidget';
import { WidgetProps } from './types';

interface BotLastSeen {
	bot_name: string;
	last_seen_at: string;
}

interface CrawlerSummaryResponse {
	bot_last_seen: BotLastSeen[];
	most_crawled_pages: { requested_url: string; total: number }[];
	daily_volume: { date: string; total: number }[];
}

/**
 * A Dashboard-level teaser for the Crawler Traffic page — readme.txt's "AI
 * Crawler Traffic Monitoring" had its own dedicated page (CrawlerTraffic.tsx)
 * and REST summary (`GET /crawler-traffic/summary`,
 * Controllers/CrawlerTraffic.php) since Phase 2, but no presence anywhere
 * on the Dashboard itself — a user had to already know to click the
 * sidebar link to see it. Reuses the same summary endpoint
 * CrawlerSummaryCard.tsx fetches, just condensed to the top 3 bots by
 * last-seen, matching this widget system's existing "small independently
 * fetched summary" pattern (PendingApprovalWidget, RecentActivityWidget).
 */
const CrawlerTrafficWidget: React.FC<WidgetProps> = ({
	onHide,
	isCustomizing,
}) => {
	const [summary, setSummary] = useState<CrawlerSummaryResponse | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		getApiResponse<CrawlerSummaryResponse>(
			getApiLink(appLocalizer, 'crawler-traffic/summary'),
			{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
		)
			.then((response) => {
				if (response) {
					setSummary(response);
				}
			})
			.finally(() => setIsLoading(false));
	}, []);

	const totalVisits =
		summary?.daily_volume.reduce((sum, day) => sum + day.total, 0) ?? 0;
	const topBots = (summary?.bot_last_seen ?? []).slice(0, 3);

	return (
		<DashboardWidget
			title={__('AI crawler traffic', 'vulopilot')}
			icon="globe"
			isLoading={isLoading}
			onHide={onHide}
			isCustomizing={isCustomizing}
		>
			{!isLoading && topBots.length === 0 ? (
				<ModuleGuardComponent
					icon="globe"
					title={__('No AI crawler visits yet', 'vulopilot')}
					desc={__(
						'GPTBot, ClaudeBot, PerplexityBot and other AI crawlers will show up here once they visit your site.',
						'vulopilot'
					)}
				/>
			) : (
				<>
					<div className="dashboard-widget-list-message">
						{sprintf(
							/* translators: %d is the number of AI crawler visits. */
							__('%d visits, last 30 days', 'vulopilot'),
							totalVisits
						)}
					</div>
					<ul className="dashboard-widget-list">
						{topBots.map((bot) => (
							<li
								key={bot.bot_name}
								className="dashboard-widget-list-row"
							>
								<span className="dashboard-widget-list-message">
									{bot.bot_name}
								</span>
								<span className="dashboard-widget-list-meta">
									{bot.last_seen_at}
								</span>
							</li>
						))}
					</ul>
				</>
			)}
		</DashboardWidget>
	);
};

export default CrawlerTrafficWidget;
