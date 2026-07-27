import { __ } from '@wordpress/i18n';
import { TableCard, TableRow } from '@zyra/table';
import { useApiList } from '../../services/useApiList';
import TablePage from '../../components/TablePage/TablePage';
import CrawlerSummaryCard from './CrawlerSummaryCard';

interface CrawlerVisitRow extends TableRow {
	id: number;
	bot_name: string;
	requested_url: string;
	created_at: string;
}

/**
 * AI Crawler Traffic Monitoring (readme.txt) — same TablePage + useApiList
 * + TableCard shape Activity.tsx already uses for a paginated log table,
 * plus CrawlerSummaryCard above it for the aggregate section (last-seen
 * per bot, most-crawled pages, crawl volume trend). The bot-name filter
 * pills come from CrawlerTrafficLogger::BOT_SIGNATURES' display names,
 * kept in sync manually the same way Activity.tsx's actor_type options
 * are a manual mirror of ActivityLogRepository's own known values (no
 * REST round-trip just to fetch a fixed, small option list).
 */
const CrawlerTraffic = () => {
	const botNameOptions = [
		{ label: __('GPTBot (OpenAI)', 'vulopilot'), value: 'GPTBot (OpenAI)' },
		{
			label: __('ChatGPT-User (OpenAI)', 'vulopilot'),
			value: 'ChatGPT-User (OpenAI)',
		},
		{
			label: __('ClaudeBot (Anthropic)', 'vulopilot'),
			value: 'ClaudeBot (Anthropic)',
		},
		{
			label: __('anthropic-ai (Anthropic)', 'vulopilot'),
			value: 'anthropic-ai (Anthropic)',
		},
		{
			label: __('PerplexityBot (Perplexity)', 'vulopilot'),
			value: 'PerplexityBot (Perplexity)',
		},
		{
			label: __('Bytespider (ByteDance)', 'vulopilot'),
			value: 'Bytespider (ByteDance)',
		},
		{
			label: __('CCBot (Common Crawl)', 'vulopilot'),
			value: 'CCBot (Common Crawl)',
		},
		{
			label: __(
				'Google-CloudVertexBot (Google AI training)',
				'vulopilot'
			),
			value: 'Google-CloudVertexBot (Google AI training)',
		},
		{ label: __('Amazonbot (Amazon)', 'vulopilot'), value: 'Amazonbot (Amazon)' },
	];

	const {
		data,
		total,
		categoryCounts,
		isLoading,
		error,
		refetch,
		onQueryUpdate,
	} = useApiList<CrawlerVisitRow>(
		'crawler-traffic',
		{},
		{ key: 'bot_name', options: botNameOptions }
	);

	return (
		<TablePage
			headerIcon="globe"
			headerTitle={__('Crawler Traffic', 'vulopilot')}
			headerDescription={__(
				'Which AI answer engines are reading your site, and what they request — no IP addresses or personal data, ever.',
				'vulopilot'
			)}
			error={error}
			onRetry={refetch}
			errorTitle={__('Could not load crawler traffic', 'vulopilot')}
		>
			<CrawlerSummaryCard />

			<TableCard
				search={{
					placeholder: __('Search requested URLs…', 'vulopilot'),
				}}
				headers={{
					bot_name: {
						label: __('Bot', 'vulopilot'),
					},
					requested_url: {
						label: __('Requested URL', 'vulopilot'),
					},
					created_at: {
						label: __('When', 'vulopilot'),
						type: 'date',
						isSortable: true,
						defaultSort: true,
						defaultOrder: 'desc',
					},
				}}
				rows={data}
				ids={data.map((row) => row.id)}
				totalRows={total}
				categoryCounts={categoryCounts}
				isLoading={isLoading}
				onQueryUpdate={onQueryUpdate}
				emptyMessage={__(
					'No AI crawler visits detected yet.',
					'vulopilot'
				)}
			/>
		</TablePage>
	);
};

export default CrawlerTraffic;
