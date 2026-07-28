/* global appLocalizer */
import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { getApiLink, sendApiResponse } from '@zyra/core';
import {
	CardComponent,
	ModuleGuardComponent,
	NoticeManager,
	PopupComponent,
} from '@zyra/components';
import { TableCard, TableRow } from '@zyra/table';
import { useApiList } from '../services/useApiList';
import ShowProPopup from './Popup/Popup';

export interface Finding extends TableRow {
	id: number;
	title: string;
	severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
	category: string;
	status: 'open' | 'resolved' | 'ignored' | 'snoozed';
	created_at: string;
	/**
	 * Which AI action can fix this finding, e.g. 'generate-alt' — null/
	 * undefined when this finding's scanner has no mapped fix, or when
	 * vulopilot-pro's OneClickFix module isn't active (in which case this
	 * field is never added to the response at all). Read by the fix
	 * handler vulopilot-pro's OneClickFix module registers (see the
	 * `getFindingFixHandler` docblock below) — Free never inspects it itself.
	 * See VuloPilotPro\OneClickFix\ScannerFixMap.
	 */
	fix_action_id?: string | null;
}

/**
 * What a registered fix handler resolves to — Free displays this itself
 * (see getFindingFixHandler's own docblock for why the handler can't just
 * show its own notice) rather than caring what actually happened.
 */
interface FixOutcome {
	success: boolean;
	message: string;
}

/**
 * The "Fix" row action's actual behavior — registered by vulopilot-pro's
 * OneClickFix module (modules/OneClickFix/src/index.tsx) via this filter,
 * replacing the `null` default with a function that calls
 * `POST /findings/{id}/fix` and resolves what happened. Free never contains
 * that REST call or any AI-action-to-scanner mapping itself: the "Fix"
 * action below is always visible (register a source, don't modify the
 * host — same pattern as vulopilot_woocommerce_ai_panel/
 * vulopilot_pro_dashboard_component), but its onClick only ever does one of
 * two things — call this handler, or open the Pro popup when it's null
 * (Pro not installed/active, or Pro's OneClickFix module specifically
 * isn't enabled — this module's own JS entry is itself gated on
 * appLocalizer.active_modules, so a null handler covers both cases without
 * Free needing to know which).
 *
 * The handler resolves a { success, message } outcome rather than showing
 * its own notice: @multivendorx/zyra isn't in webpack's `externals` (only
 * react/react-dom/@wordpress/* are — tools/webpack/create-config.js), so
 * it's bundled separately per plugin. Free's and Pro's NoticeManager are
 * two different in-memory singletons — a notice added from Pro's bundle is
 * invisible to the NoticeReceiverComponent Free's own HeaderComponent
 * mounted from Free's bundle. Free's onClick below shows the notice itself
 * using ITS OWN NoticeManager, which the receiver actually subscribes to.
 *
 * Read fresh on every click rather than cached in a module-level constant:
 * Pro's own script (vulopilot-pro-admin-script) is a separate, later
 * <script> tag that depends on this one (it reads the `appLocalizer` global
 * this script localizes), so it hasn't registered its addFilter() callback
 * yet at the moment this module first evaluates — caching the result here
 * would permanently capture `null` and always show the popup, active
 * module or not. By click time both scripts have long finished running.
 */
const getFindingFixHandler = () =>
	applyFilters('vulopilot_finding_fix_handler', null);

interface FindingsTableProps {
	title: string;
	description?: string;
	/** Restricts the list to one finding category (e.g. 'seo', 'geo', 'woocommerce'). Omit to show every category (Health). */
	category?: string;
	/**
	 * Further restricts the list to a specific set of scanner ids within
	 * `category` — what SEO.tsx's per-section tables (e.g. "Titles & meta"
	 * vs. "Images") use to split one category's findings into several
	 * independent tables without duplicating this component's fetch/filter/
	 * bulk-action/fix-action wiring per section. Omit to show every scanner
	 * in `category` (every other page's single-table usage).
	 */
	scannerIds?: string[];
}

/**
 * Shared findings list — the Health, SEO, GEO, and WooCommerce pages are
 * all "vulopilot_scan_findings filtered to a category" (DATABASE.md), so
 * this one component serves all four rather than duplicating the same
 * table/filter/state wiring four times. SEO.tsx additionally scopes several
 * instances of this same component to one `scannerIds` group each, for its
 * per-section tables.
 */
const FindingsTable: React.FC<FindingsTableProps> = ({
	title,
	description,
	category,
	scannerIds,
}) => {
	const [isProPopupOpen, setIsProPopupOpen] = useState(false);

	/** Every finding status, in display order — reused for both the status-count pill bar and (previously) the status dropdown filter it now replaces. */
	const statusOptions = [
		{ label: __('Open', 'vulopilot'), value: 'open' },
		{ label: __('Resolved', 'vulopilot'), value: 'resolved' },
		{ label: __('Ignored', 'vulopilot'), value: 'ignored' },
		{ label: __('Snoozed', 'vulopilot'), value: 'snoozed' },
	];

	const {
		data,
		total,
		categoryCounts,
		isLoading,
		error,
		refetch,
		onQueryUpdate,
	} = useApiList<Finding>(
		'findings',
		{
			category,
			// Comma-joined, not an array — useApiList's params are plain
			// string|number values (see its own JSDoc); Findings::get_items()
			// on the backend splits this back into a scanner_id list
			// (see parse_scanner_ids()).
			scanner_id: scannerIds?.length ? scannerIds.join(',') : undefined,
		},
		{ key: 'status', options: statusOptions }
	);

	const handleSetStatus = (
		row: Record<string, unknown> | undefined,
		status: 'resolved' | 'ignored' | 'open',
		successMessage: string
	) => {
		if (!row) {
			return;
		}

		sendApiResponse(
			appLocalizer,
			getApiLink(appLocalizer, `findings/${row.id}`),
			{ status }
		).then((response) => {
			if (response) {
				NoticeManager.add({
					uniqueKey: `finding-${status}-${row.id}`,
					type: 'success',
					position: 'float',
					message: successMessage,
				});
				refetch();
			} else {
				NoticeManager.add({
					uniqueKey: `finding-${status}-failed-${row.id}`,
					type: 'error',
					position: 'float',
					message: __(
						'Could not update this finding. Please try again.',
						'vulopilot'
					),
				});
			}
		});
	};

	const handleResolve = (row?: Record<string, unknown>) =>
		handleSetStatus(
			row,
			'resolved',
			__('Finding marked as resolved.', 'vulopilot')
		);

	const handleIgnore = (row?: Record<string, unknown>) =>
		handleSetStatus(row, 'ignored', __('Finding ignored.', 'vulopilot'));

	const handleReopen = (row?: Record<string, unknown>) =>
		handleSetStatus(row, 'open', __('Finding reopened.', 'vulopilot'));

	if (error) {
		return (
			<CardComponent title={title}>
				<ModuleGuardComponent
					icon="warning"
					title={__('Could not load findings', 'vulopilot')}
					desc={error}
					buttonText={__('Retry', 'vulopilot')}
					onButtonClick={refetch}
				/>
			</CardComponent>
		);
	}

	const headers: Record<string, any> = {
		title: {
			label: __('Finding', 'vulopilot'),
			isSortable: true,
		},
		...(category
			? {}
			: {
					category: {
						label: __('Category', 'vulopilot'),
					},
				}),
		severity: {
			label: __('Severity', 'vulopilot'),
			type: 'badge',
			statusClass: (row: Finding) => `severity-${row.severity}`,
		},
		status: {
			label: __('Status', 'vulopilot'),
			type: 'badge',
			statusClass: (row: Finding) => `status-${row.status}`,
		},
		created_at: {
			label: __('Detected', 'vulopilot'),
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
						row?.status === 'open'
							? __('Mark resolved', 'vulopilot')
							: __('Resolved', 'vulopilot'),
					icon: 'yes',
					onClick: handleResolve,
				},
				{
					label: (row?: Record<string, unknown>) =>
						row?.status === 'ignored'
							? __('Ignored', 'vulopilot')
							: __('Ignore', 'vulopilot'),
					icon: 'hidden',
					onClick: handleIgnore,
				},
				{
					label: __('Reopen', 'vulopilot'),
					icon: 'controls-repeat',
					onClick: handleReopen,
				},
				// Always visible — Free itself has no AI-action-to-scanner
				// mapping or fix REST call (see getFindingFixHandler's own
				// docblock above); this is only ever the entry point + gate.
				{
					label: __('Fix', 'vulopilot'),
					icon: 'admin-tools',
					onClick: (row?: Record<string, unknown>) => {
						const findingFixHandler = getFindingFixHandler();

						if (typeof findingFixHandler === 'function') {
							// Pro's handler applies the fix directly and
							// resolves what happened (see its own docblock
							// for why it can't show its own notice) — Free
							// shows it here, then refetches so the row's
							// status reflects the fix immediately rather
							// than needing a manual page refresh.
							Promise.resolve(
								findingFixHandler(row) as
									| Promise<FixOutcome>
									| undefined
							).then((outcome) => {
								if (outcome?.message) {
									NoticeManager.add({
										uniqueKey: `finding-fix-${row?.id}`,
										type: outcome.success
											? 'success'
											: 'error',
										position: 'float',
										message: outcome.message,
									});
								}

								refetch();
							});
							return;
						}

						setIsProPopupOpen(true);
					},
				},
			] as any[],
		},
	};

	return (
		<>
			<TableCard
				headers={headers}
				rows={data}
				ids={data.map((row) => row.id)}
				totalRows={total}
				categoryCounts={categoryCounts}
				isLoading={isLoading}
				onQueryUpdate={onQueryUpdate}
				search={{
					placeholder: __('Search findings…', 'vulopilot'),
				}}
				bulkActions={[
					{
						label: __('Mark resolved', 'vulopilot'),
						value: 'resolved',
					},
					{ label: __('Ignore', 'vulopilot'), value: 'ignored' },
				]}
				onBulkActionApply={(action: string, ids: number[]) => {
					sendApiResponse(
						appLocalizer,
						getApiLink(appLocalizer, 'findings/bulk'),
						{ ids, status: action }
					).then((response: unknown) => {
						if (response) {
							NoticeManager.add({
								uniqueKey: 'findings-bulk-update',
								type: 'success',
								position: 'float',
								message: __(
									'Selected findings updated.',
									'vulopilot'
								),
							});
							refetch();
						} else {
							NoticeManager.add({
								uniqueKey: 'findings-bulk-update-failed',
								type: 'error',
								position: 'float',
								message: __(
									'Could not update the selected findings. Please try again.',
									'vulopilot'
								),
							});
						}
					});
				}}
				emptyMessage={
					description ||
					__('No findings here yet — nothing to report.', 'vulopilot')
				}
				filters={[
					{
						key: 'severity',
						label: __('Severity', 'vulopilot'),
						type: 'select',
						size: 10,
						options: [
							{ label: __('Critical', 'vulopilot'), value: 'critical' },
							{ label: __('High', 'vulopilot'), value: 'high' },
							{ label: __('Medium', 'vulopilot'), value: 'medium' },
							{ label: __('Low', 'vulopilot'), value: 'low' },
							{ label: __('Info', 'vulopilot'), value: 'info' },
						],
					},
				]}
			/>
			<PopupComponent
				open={isProPopupOpen}
				onClose={() => setIsProPopupOpen(false)}
				width={31.25}
				height="auto"
				position="lightbox"
			>
				{appLocalizer.khali_dabba ? (
					// Pro is active — OneClickFix specifically isn't
					// enabled, so point at Modules rather than pitching
					// an upgrade the user already has.
					<ShowProPopup moduleName="one-click-fix" />
				) : (
					<ShowProPopup />
				)}
			</PopupComponent>
		</>
	);
};

export default FindingsTable;
