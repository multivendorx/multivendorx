/* global appLocalizer */
import { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { getApiLink, getApiResponse, sendApiResponse } from '@zyra/core';
import { NoticeManager, PopupComponent } from '@zyra/components';
import { ButtonInput, SelectInput } from '@zyra/inputs';
import { TableCard, TableRow } from '@zyra/table';
import type { ComponentType } from 'react';
import { useApiList } from '../../services/useApiList';
import TablePage from '../../components/TablePage/TablePage';
import ShowProPopup from '../../components/Popup/Popup';

interface ReportTypeOption {
	id: string;
	label: string;
}

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

/**
 * Slot for vulopilot-pro's AdvancedReports module — recurring/scheduled
 * reports and the custom report builder are Pro business logic (backed by
 * REST routes `report-schedules` and `reports?report_type=custom`, both
 * only registered when that module is active), so their management UI is
 * injected here rather than built into Free's own bundle. Returns null
 * (renders nothing) when Pro/AdvancedReports isn't active — the same
 * "register a source, don't modify the host" pattern already used for
 * dashboard widgets (`vulopilot_dashboard_widgets`) and settings tabs
 * (`vulopilot_settings_context`).
 */
const AdvancedReportsPanel = applyFilters(
	'vulopilot_reports_advanced_panel',
	null
) as ComponentType | null;

const Reports = () => {
	const [isProPopupOpen, setIsProPopupOpen] = useState(false);
	const [reportTypes, setReportTypes] = useState<ReportTypeOption[]>([]);
	const [selectedReportType, setSelectedReportType] =
		useState<string>('scan_summary');

	// GET /reports/types is fully dynamic (VuloPilot()->report_type_registry->get_all()),
	// so this picks up AiVisibilityReport/PerformanceReport/UpdatesReport
	// (and any Pro-registered type like 'health') automatically — no
	// hardcoded list to keep in sync here.
	useEffect(() => {
		getApiResponse<ReportTypeOption[]>(
			getApiLink(appLocalizer, 'reports/types'),
			{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
		).then((response) => {
			if (response && response.length > 0) {
				setReportTypes(response);
			}
		});
	}, []);

	const statusOptions = [
		{ label: __('Generating', 'vulopilot'), value: 'generating' },
		{ label: __('Ready', 'vulopilot'), value: 'ready' },
		{ label: __('Failed', 'vulopilot'), value: 'failed' },
	];

	const {
		data,
		total,
		categoryCounts,
		isLoading,
		error,
		refetch,
		onQueryUpdate,
	} = useApiList<ReportRow>(
		'reports',
		{},
		{ key: 'status', options: statusOptions }
	);

	const handleGenerateReport = () => {
		// 'csv' rather than 'pdf' — pdf is a Pro-only exporter (registered
		// via vulopilot_report_exporter_sources by vulopilot-pro's
		// AdvancedReports module), so a format Free always has registered
		// is what this always-available button should generate.
		sendApiResponse(appLocalizer, getApiLink(appLocalizer, 'reports'), {
			report_type: selectedReportType,
			format: 'csv',
		}).then((response) => {
			if (response) {
				NoticeManager.add({
					uniqueKey: 'vulopilot-report-queued',
					type: 'success',
					position: 'float',
					message: __('Report generation started.', 'vulopilot'),
				});
				refetch();
			} else {
				NoticeManager.add({
					uniqueKey: 'vulopilot-report-failed',
					type: 'error',
					position: 'float',
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

		// pdf is a Pro-only exporter (registered via
		// vulopilot_report_exporter_sources by vulopilot-pro's
		// AdvancedReports module) — a pdf-format row can still exist from
		// when that module was active, so the row/action itself stays
		// visible; clicking it opens the Pro popup instead of downloading
		// once the module is no longer active.
		if (
			row.format === 'pdf' &&
			!appLocalizer.active_modules.includes('advanced-reports')
		) {
			setIsProPopupOpen(true);
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
		<>
			{reportTypes.length > 0 && (
				<SelectInput
					name="report_type"
					value={selectedReportType}
					options={reportTypes.map((type) => ({
						label: type.label,
						value: type.id,
					}))}
					onChange={(newValue) =>
						setSelectedReportType(newValue as string)
					}
					size="12rem"
				/>
			)}
			<ButtonInput
				buttons={{
					text: __('Generate report', 'vulopilot'),
					icon: 'media-document',
					onClick: handleGenerateReport,
				}}
			/>
		</>
	);

	return (
		<TablePage
			headerIcon="report"
			headerTitle={__('Reports', 'vulopilot')}
			headerDescription={__(
				'Generate and download scan summary, SEO, WooCommerce, security, and other compliance reports.',
				'vulopilot'
			)}
			headerAction={pageHeaderAction}
			error={error}
			onRetry={refetch}
			errorTitle={__('Could not load reports', 'vulopilot')}
		>
			<TableCard
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
								label: (row?: Record<string, unknown>) =>
									row?.status === 'ready'
										? __('Download', 'vulopilot')
										: __('Not ready yet', 'vulopilot'),
								icon: 'download',
								onClick: handleDownload,
							},
						],
					},
				}}
				rows={data}
				ids={data.map((row) => row.id)}
				totalRows={total}
				categoryCounts={categoryCounts}
				isLoading={isLoading}
				onQueryUpdate={onQueryUpdate}
				emptyMessage={__(
					'No reports yet — generate your first compliance report.',
					'vulopilot'
				)}
			/>
			{AdvancedReportsPanel && <AdvancedReportsPanel />}
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
		</TablePage>
	);
};

export default Reports;
