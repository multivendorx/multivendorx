/* global appLocalizer */
import { __ } from '@wordpress/i18n';
import { getApiLink, sendApiResponse } from '@zyra/core';
import { CardComponent, ModuleGuardComponent, NoticeManager } from '@zyra/components';
import { ButtonInput } from '@zyra/inputs';
import { TableCard, TableRow } from '@zyra/table';
import { useApiList } from '../../services/useApiList';

interface ReportRow extends TableRow {
	id: number;
	report_type: string;
	format: string;
	status: 'generating' | 'ready' | 'failed';
	period_start: string | null;
	period_end: string | null;
	created_at: string;
}

const Reports = () => {
	const { data, total, isLoading, error, refetch } = useApiList<ReportRow>(
		'reports',
		{ per_page: 10 }
	);

	const handleGenerateReport = () => {
		sendApiResponse(appLocalizer, getApiLink(appLocalizer, 'reports'), {
			report_type: 'scan_summary',
			format: 'pdf',
		}).then((response) => {
			if (response) {
				NoticeManager.add({
					uniqueKey: 'vulopilot-report-queued',
					type: 'success',
					position: 'notice',
					message: __(
						'Report generation started.',
						'vulopilot'
					),
				});
				refetch();
			} else {
				NoticeManager.add({
					uniqueKey: 'vulopilot-report-failed',
					type: 'error',
					position: 'notice',
					message: __(
						'Could not start report generation. Please try again.',
						'vulopilot'
					),
				});
			}
		});
	};

	const pageHeaderAction = (
		<ButtonInput
			buttons={{
				text: __('Generate report', 'vulopilot'),
				icon: 'media-document',
				onClick: handleGenerateReport,
			}}
		/>
	);

	if (error) {
		return (
			<CardComponent
				title={__('Reports', 'vulopilot')}
				action={pageHeaderAction}
			>
				<ModuleGuardComponent
					icon="warning"
					title={__('Could not load reports', 'vulopilot')}
					desc={error}
					buttonText={__('Retry', 'vulopilot')}
					onButtonClick={refetch}
				/>
			</CardComponent>
		);
	}

	return (
		<TableCard
			title={__('Reports', 'vulopilot')}
			buttonActions={[
				{
					label: __('Generate report', 'vulopilot'),
					onClick: handleGenerateReport,
				},
			]}
			headers={{
				report_type: {
					label: __('Type', 'vulopilot'),
				},
				format: {
					label: __('Format', 'vulopilot'),
				},
				status: {
					label: __('Status', 'vulopilot'),
					type: 'badge',
					statusClass: (row: ReportRow) => `status-${row.status}`,
				},
				created_at: {
					label: __('Generated', 'vulopilot'),
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
				'No reports yet — generate your first compliance report.',
				'vulopilot'
			)}
			filters={[
				{
					key: 'status',
					label: __('Status', 'vulopilot'),
					type: 'select',
					size: 10,
					options: [
						{ label: __('Generating', 'vulopilot'), value: 'generating' },
						{ label: __('Ready', 'vulopilot'), value: 'ready' },
						{ label: __('Failed', 'vulopilot'), value: 'failed' },
					],
				},
			]}
		/>
	);
};

export default Reports;
