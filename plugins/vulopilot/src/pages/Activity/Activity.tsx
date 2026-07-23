import { __ } from '@wordpress/i18n';
import { CardComponent, ModuleGuardComponent } from '@zyra/components';
import { TableCard, TableRow } from '@zyra/table';
import { useApiList } from '../../services/useApiList';

interface ActivityLogRow extends TableRow {
	id: number;
	event_type: string;
	actor_type: 'user' | 'system' | 'automation';
	message: string;
	severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
	created_at: string;
}

const Activity = () => {
	const { data, total, isLoading, error, refetch } =
		useApiList<ActivityLogRow>('activity-logs', { per_page: 20 });

	if (error) {
		return (
			<CardComponent title={__('Activity', 'vulopilot')}>
				<ModuleGuardComponent
					icon="warning"
					title={__('Could not load the activity log', 'vulopilot')}
					desc={error}
					buttonText={__('Retry', 'vulopilot')}
					onButtonClick={refetch}
				/>
			</CardComponent>
		);
	}

	return (
		<TableCard
			title={__('Activity', 'vulopilot')}
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
			isLoading={isLoading}
			emptyMessage={__(
				'Nothing has happened yet — actions across VuloPilot will show up here.',
				'vulopilot'
			)}
			filters={[
				{
					key: 'actor_type',
					label: __('Actor', 'vulopilot'),
					type: 'select',
					size: 10,
					options: [
						{ label: __('User', 'vulopilot'), value: 'user' },
						{ label: __('System', 'vulopilot'), value: 'system' },
						{
							label: __('Automation', 'vulopilot'),
							value: 'automation',
						},
					],
				},
			]}
		/>
	);
};

export default Activity;
