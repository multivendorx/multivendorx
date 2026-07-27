/* global appLocalizer */
import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import type { ComponentType } from 'react';
import { CardComponent, PopupComponent } from '@zyra/components';
import { ButtonInput } from '@zyra/inputs';
import { TableCard, TableRow } from '@zyra/table';
import { useApiList } from '../../services/useApiList';
import TablePage from '../../components/TablePage/TablePage';
import ShowProPopup from '../../components/Popup/Popup';

interface AiHistoryRow extends TableRow {
	id: number;
	provider: string;
	model: string;
	status: 'success' | 'failure';
	prompt_tokens: number;
	completion_tokens: number;
	created_at: string;
}

/**
 * Slot for vulopilot-pro's AdvancedReports module — a per-provider cost/
 * token/success-rate breakdown of this same history table. History logging
 * itself stays free (Free's own 9 built-in AI actions write here too, via
 * UsageTrackingProvider, regardless of Pro), so only this extra analytics
 * panel is Pro-gated, not the table above it. Same "register a source,
 * don't modify the host" pattern already used for
 * `vulopilot_reports_advanced_panel`. Shows a locked placeholder (below,
 * `AiAnalyticsLockedCard`) that opens the Pro popup on click when Pro/that
 * module isn't active, rather than rendering nothing.
 */
const AiAnalyticsPanel = applyFilters(
	'vulopilot_ai_assistant_pro_panel',
	null
) as ComponentType | null;

/**
 * Visible teaser for the analytics panel above — shown instead of it when
 * `AiAnalyticsPanel` isn't registered, so the feature is discoverable
 * rather than simply absent.
 */
const AiAnalyticsLockedCard = () => {
	const [isProPopupOpen, setIsProPopupOpen] = useState(false);

	return (
		<>
			<CardComponent
				title={__('AI cost & provider breakdown', 'vulopilot')}
				desc={__(
					'A per-provider cost, token, and success-rate breakdown of the history above.',
					'vulopilot'
				)}
			>
				<ButtonInput
					buttons={{
						text: __('Unlock with Pro', 'vulopilot'),
						icon: 'lock',
						onClick: () => setIsProPopupOpen(true),
					}}
				/>
			</CardComponent>
			<PopupComponent
				open={isProPopupOpen}
				onClose={() => setIsProPopupOpen(false)}
				width={31.25}
				height="auto"
				position="lightbox"
			>
				{appLocalizer.khali_dabba ? (
					// Pro is active — this specific module just isn't
					// toggled on yet, so point at Modules rather than
					// pitching an upgrade the user already has.
					<ShowProPopup moduleName="advanced-reports" />
				) : (
					<ShowProPopup />
				)}
			</PopupComponent>
		</>
	);
};

/**
 * A history-of-interactions view onto vulopilot_ai_history (DATABASE.md) —
 * the conversational AI Assistant UI itself is a larger piece of future
 * work; this page's job for now is giving the AI Providers/AIProviders
 * engine a real place to log to and a store owner a real audit trail of
 * what VuloPilot's AI has done on their behalf.
 */
const AIAssistant = () => {
	const statusOptions = [
		{ label: __('Success', 'vulopilot'), value: 'success' },
		{ label: __('Failure', 'vulopilot'), value: 'failure' },
	];

	const {
		data,
		total,
		categoryCounts,
		isLoading,
		error,
		refetch,
		onQueryUpdate,
	} = useApiList<AiHistoryRow>(
		'ai-history',
		{},
		{ key: 'status', options: statusOptions }
	);

	return (
		<TablePage
			headerIcon="ai"
			headerTitle={__('AI Assistant', 'vulopilot')}
			headerDescription={__(
				'A history of every AI provider call VuloPilot has made on your behalf.',
				'vulopilot'
			)}
			error={error}
			onRetry={refetch}
			errorTitle={__('Could not load AI history', 'vulopilot')}
		>
			<TableCard
				search={{
					placeholder: __('Search AI history…', 'vulopilot'),
				}}
				headers={{
					provider: {
						label: __('Provider', 'vulopilot'),
					},
					model: {
						label: __('Model', 'vulopilot'),
					},
					status: {
						label: __('Status', 'vulopilot'),
						type: 'badge',
						statusClass: (row: AiHistoryRow) =>
							`status-${row.status}`,
					},
					prompt_tokens: {
						label: __('Prompt tokens', 'vulopilot'),
						isNumeric: true,
					},
					completion_tokens: {
						label: __('Completion tokens', 'vulopilot'),
						isNumeric: true,
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
					'No AI activity yet — VuloPilot will log every AI-assisted action here.',
					'vulopilot'
				)}
				filters={[
					{
						key: 'provider',
						label: __('Provider', 'vulopilot'),
						type: 'select',
						size: 10,
						options: [
							{
								label: __('Default', 'vulopilot'),
								value: 'default',
							},
						],
					},
				]}
			/>
			{AiAnalyticsPanel ? <AiAnalyticsPanel /> : <AiAnalyticsLockedCard />}
		</TablePage>
	);
};

export default AIAssistant;
