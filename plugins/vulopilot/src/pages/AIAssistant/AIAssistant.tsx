import { __ } from '@wordpress/i18n';
import {
	CardComponent,
	ColumnComponent,
	ContainerComponent,
	ModuleGuardComponent,
	NavigatorHeaderComponent,
} from '@zyra/components';
import { TableCard, TableRow } from '@zyra/table';
import { useApiList } from '../../services/useApiList';

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
 * A history-of-interactions view onto vulopilot_ai_history (DATABASE.md) —
 * the conversational AI Assistant UI itself is a larger piece of future
 * work; this page's job for now is giving the AI Providers/AIProviders
 * engine a real place to log to and a store owner a real audit trail of
 * what VuloPilot's AI has done on their behalf.
 */
const AIAssistant = () => {
	const { data, total, isLoading, error, refetch } =
		useApiList<AiHistoryRow>('ai-history', { per_page: 10 });

	const pageHeader = (
		<NavigatorHeaderComponent
			headerIcon="ai"
			headerTitle={__('AI Assistant', 'vulopilot')}
			headerDescription={__(
				'A history of every AI provider call VuloPilot has made on your behalf.',
				'vulopilot'
			)}
		/>
	);

	if (error) {
		return (
			<>
				{pageHeader}
				<ContainerComponent general>
					<ColumnComponent>
						<CardComponent title={__('AI Assistant', 'vulopilot')}>
							<ModuleGuardComponent
								icon="warning"
								title={__(
									'Could not load AI history',
									'vulopilot'
								)}
								desc={error}
								buttonText={__('Retry', 'vulopilot')}
								onButtonClick={refetch}
							/>
						</CardComponent>
					</ColumnComponent>
				</ContainerComponent>
			</>
		);
	}

	return (
		<>
			{pageHeader}
			<ContainerComponent general>
				<ColumnComponent>
					<TableCard
						title={__('AI Assistant', 'vulopilot')}
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
						isLoading={isLoading}
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
				</ColumnComponent>
			</ContainerComponent>
		</>
	);
};

export default AIAssistant;
