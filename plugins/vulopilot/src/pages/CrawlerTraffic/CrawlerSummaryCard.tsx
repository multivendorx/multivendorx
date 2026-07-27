/* global appLocalizer */
import { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { getApiLink, getApiResponse } from '@zyra/core';
import { AnalyticsComponent, CardComponent } from '@zyra/components';
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

interface BotLastSeen {
	bot_name: string;
	last_seen_at: string;
}

interface MostCrawledPage {
	requested_url: string;
	total: number;
}

interface DailyVolumePoint {
	date: string;
	total: number;
}

interface CrawlerSummaryResponse {
	bot_last_seen: BotLastSeen[];
	most_crawled_pages: MostCrawledPage[];
	daily_volume: DailyVolumePoint[];
}

/**
 * The Crawler Traffic page's aggregate section — readme.txt's "Live Visit
 * Logs & Last-Seen Timestamps" (the last-seen tiles here, the raw log
 * itself is the TableCard below), "Most-Crawled Pages," and "Crawl Volume
 * Trend Over Time." Fetches its own summary independently from the page's
 * paginated table, same "page has its own small independently-fetched
 * summary section" pattern already used by the Dashboard's
 * HealthTimelineWidget/AdvancedReports' AiAnalyticsPanel — and the same
 * recharts AreaChart HealthTimelineWidget already uses for its own trend
 * chart, not a new charting dependency.
 */
const CrawlerSummaryCard = () => {
	const [summary, setSummary] = useState<CrawlerSummaryResponse | null>(
		null
	);

	useEffect(() => {
		getApiResponse<CrawlerSummaryResponse>(
			getApiLink(appLocalizer, 'crawler-traffic/summary'),
			{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
		).then((response) => {
			if (response) {
				setSummary(response);
			}
		});
	}, []);

	if (!summary) {
		return null;
	}

	return (
		<>
			{summary.bot_last_seen.length > 0 && (
				<CardComponent title={__('Last seen', 'vulopilot')}>
					<AnalyticsComponent
						variant="dashboard"
						cols={4}
						data={summary.bot_last_seen.map((entry) => ({
							icon: 'globe',
							number: entry.last_seen_at,
							text: entry.bot_name,
						}))}
					/>
				</CardComponent>
			)}

			<CardComponent title={__('Crawl volume, last 30 days', 'vulopilot')}>
				<div className="dashboard-trend-chart">
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart data={summary.daily_volume}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="date" />
							<YAxis allowDecimals={false} />
							<Tooltip />
							<Area
								type="monotone"
								dataKey="total"
								stroke="#4B227A"
								fill="#00EED0"
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</CardComponent>

			{summary.most_crawled_pages.length > 0 && (
				<CardComponent title={__('Most-crawled pages', 'vulopilot')}>
					<ul className="dashboard-widget-list">
						{summary.most_crawled_pages.map((page) => (
							<li
								key={page.requested_url}
								className="dashboard-widget-list-row"
							>
								<span className="dashboard-widget-list-message">
									{page.requested_url}
								</span>
								<span className="dashboard-widget-list-meta">
									{page.total}
								</span>
							</li>
						))}
					</ul>
				</CardComponent>
			)}
		</>
	);
};

export default CrawlerSummaryCard;
