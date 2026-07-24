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
	has_file: boolean;
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
					message: __('Report generation started.', 'vulopilot'),
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

	const handleDownload = (row?: Record<string, unknown>) => {
		if (!row || row.status !== 'ready' || !row.has_file) {
			return;
		}

		// A real browser navigation (window.open), not an XHR — the nonce
		// has to travel as a query param rather than the X-WP-Nonce header
		// this plugin's other REST calls use. getApiLink() already
		// contains its own `?rest_route=…` on plain-permalink sites, so
		// `&` (not a second `?`) is required once that's the case — same
		// fix as useApiList.ts's.
		const baseUrl = getApiLink(appLocalizer, `reports/${row.id}/download`);
		const separator = baseUrl.includes('?') ? '&' : '?';
		window.open(
			`${baseUrl}${separator}_wpnonce=${appLocalizer.nonce}`,
			'_blank'
		);
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

	const pageHeader = (
		<NavigatorHeaderComponent
			headerIcon="report"
			headerTitle={__('Reports', 'vulopilot')}
			headerDescription={__(
				'Generate and download scan summary, SEO, WooCommerce, security, and other compliance reports.',
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
						<CardComponent
							title={__('Reports', 'vulopilot')}
							action={pageHeaderAction}
						>
							<ModuleGuardComponent
								icon="warning"
								title={__(
									'Could not load reports',
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
								statusClass: (row: ReportRow) =>
									`status-${row.status}`,
							},
							created_at: {
								label: __('Generated', 'vulopilot'),
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
											row?.status === 'ready'
												? __('Download', 'vulopilot')
												: __(
														'Not ready yet',
														'vulopilot'
													),
										icon: 'download',
										onClick: handleDownload,
									},
								],
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
									{
										label: __('Generating', 'vulopilot'),
										value: 'generating',
									},
									{
										label: __('Ready', 'vulopilot'),
										value: 'ready',
									},
									{
										label: __('Failed', 'vulopilot'),
										value: 'failed',
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

export default Reports;
