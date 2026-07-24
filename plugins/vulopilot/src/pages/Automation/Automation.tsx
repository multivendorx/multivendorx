/* global appLocalizer */
import { __ } from '@wordpress/i18n';
import { getApiLink, sendApiResponse } from '@zyra/core';
import {
	CardComponent,
	ColumnComponent,
	ContainerComponent,
	ModuleGuardComponent,
	NavigatorHeaderComponent,
	NoticeManager,
} from '@zyra/components';
import { TableCard, TableRow } from '@zyra/table';
import { useApiList } from '../../services/useApiList';

interface AutomationRow extends TableRow {
	id: number;
	name: string;
	trigger_type: string;
	status: 'enabled' | 'disabled';
	last_triggered_at: string | null;
}

const Automation = () => {
	const { data, total, isLoading, error, refetch } =
		useApiList<AutomationRow>('automations', { per_page: 10 });

	const handleToggleStatus = (row?: Record<string, unknown>) => {
		if (!row) {
			return;
		}

		const nextStatus = row.status === 'enabled' ? 'disabled' : 'enabled';

		sendApiResponse(
			appLocalizer,
			getApiLink(appLocalizer, `automations/${row.id}`),
			{ status: nextStatus }
		).then((response) => {
			if (response) {
				NoticeManager.add({
					uniqueKey: `automation-toggled-${row.id}`,
					type: 'success',
					position: 'notice',
					message:
						nextStatus === 'enabled'
							? __('Automation enabled.', 'vulopilot')
							: __('Automation disabled.', 'vulopilot'),
				});
				refetch();
			} else {
				NoticeManager.add({
					uniqueKey: `automation-toggle-failed-${row.id}`,
					type: 'error',
					position: 'notice',
					message: __(
						'Could not update this automation. Please try again.',
						'vulopilot'
					),
				});
			}
		});
	};

	const handleRunNow = (row?: Record<string, unknown>) => {
		if (!row) {
			return;
		}

		sendApiResponse(
			appLocalizer,
			getApiLink(appLocalizer, `automations/${row.id}/run`),
			{}
		).then((response) => {
			NoticeManager.add({
				uniqueKey: `automation-run-${row.id}`,
				type: response ? 'success' : 'error',
				position: 'notice',
				message: response
					? __('Automation ran.', 'vulopilot')
					: __(
							'Could not run this automation — it may have no currently-matching recommendation to act on.',
							'vulopilot'
						),
			});

			if (response) {
				refetch();
			}
		});
	};

	const pageHeader = (
		<NavigatorHeaderComponent
			headerIcon="automation"
			headerTitle={__('Automation', 'vulopilot')}
			headerDescription={__(
				'React to scan findings automatically — send emails, resolve findings, or run an AI action.',
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
						<CardComponent title={__('Automation', 'vulopilot')}>
							<ModuleGuardComponent
								icon="warning"
								title={__(
									'Could not load automations',
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
						title={__('Automation', 'vulopilot')}
						headers={{
							name: {
								label: __('Automation', 'vulopilot'),
								isSortable: true,
							},
							trigger_type: {
								label: __('Trigger', 'vulopilot'),
							},
							status: {
								label: __('Status', 'vulopilot'),
								type: 'badge',
								statusClass: (row: AutomationRow) =>
									`status-${row.status}`,
							},
							last_triggered_at: {
								label: __('Last run', 'vulopilot'),
								type: 'date',
								isSortable: true,
								defaultSort: true,
								defaultOrder: 'desc',
							},
							actions: {
								label: __('Actions', 'vulopilot'),
								type: 'action',
								actions: [
									{
										label: (
											row?: Record<string, unknown>
										) =>
											row?.status === 'enabled'
												? __('Disable', 'vulopilot')
												: __('Enable', 'vulopilot'),
										icon: 'controls-repeat',
										onClick: handleToggleStatus,
									},
									{
										label: __('Run now', 'vulopilot'),
										icon: 'controls-play',
										onClick: handleRunNow,
									},
								],
							},
						}}
						rows={data}
						ids={data.map((row) => row.id)}
						totalRows={total}
						isLoading={isLoading}
						emptyMessage={__(
							'No automations yet — create one to react to scan findings automatically.',
							'vulopilot'
						)}
						filters={[
							{
								key: 'status',
								label: __('Status', 'vulopilot'),
								type: 'select',
								size: 10,
								options: [
									{
										label: __('Enabled', 'vulopilot'),
										value: 'enabled',
									},
									{
										label: __('Disabled', 'vulopilot'),
										value: 'disabled',
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

export default Automation;
