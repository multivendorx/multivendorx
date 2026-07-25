import { __ } from '@wordpress/i18n';
import { TableCard, TableRow } from '@zyra/table';
import { useApiList } from '../../services/useApiList';
import TablePage from '../../components/TablePage/TablePage';

interface ActivityLogRow extends TableRow {
	id: number;
	event_type: string;
	actor_type: 'user' | 'system' | 'automation';
	message: string;
	severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
	created_at: string;
}

const Activity = () => {
	const actorTypeOptions = [
		{ label: __('User', 'vulopilot'), value: 'user' },
		{ label: __('System', 'vulopilot'), value: 'system' },
		{ label: __('Automation', 'vulopilot'), value: 'automation' },
	];

	const {
		data,
		total,
		categoryCounts,
		isLoading,
		error,
		refetch,
		onQueryUpdate,
	} = useApiList<ActivityLogRow>(
		'activity-logs',
		{},
		{ key: 'actor_type', options: actorTypeOptions }
	);

	return (
		<TablePage
			headerIcon="clock"
			headerTitle={__('Activity', 'vulopilot')}
			headerDescription={__(
				'Every action VuloPilot has taken or logged, across scans, automations, and AI actions.',
				'vulopilot'
			)}
			error={error}
			onRetry={refetch}
			errorTitle={__('Could not load the activity log', 'vulopilot')}
		>
			<TableCard
				search={{
					placeholder: __('Search activity…', 'vulopilot'),
				}}
				headers={{
					event_type: {
						label: __('Event', 'vulopilot'),
						isSortable: true,
					},
					message: {
						label: __('Details', 'vulopilot'),
					},
					actor_type: {
						label: __('Actor', 'vulopilot'),
					},
					severity: {
						label: __('Severity', 'vulopilot'),
						type: 'badge',
						statusClass: (row: ActivityLogRow) =>
							`severity-${row.severity}`,
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
					'Nothing has happened yet — actions across VuloPilot will show up here.',
					'vulopilot'
				)}
			/>
		</TablePage>
	);
};

export default Activity;
