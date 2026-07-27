/* global appLocalizer */
import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import type { ComponentType } from 'react';
import { PopupComponent } from '@zyra/components';
import { TableCard, TableRow } from '@zyra/table';
import { useApiList } from '../../services/useApiList';
import TablePage from '../../components/TablePage/TablePage';
import ShowProPopup from '../../components/Popup/Popup';

interface AutomationRow extends TableRow {
	id: number;
	name: string;
	trigger_type: string;
	status: 'enabled' | 'disabled';
	last_triggered_at: string | null;
}

/**
 * The real management panel (list, enable/disable, create, run) lives in
 * vulopilot-pro/modules/Automation's own React entry, registered into this
 * slot — same "register a source, don't modify the host" pattern already
 * used for Reports' `vulopilot_reports_advanced_panel`.
 */
const AutomationPanel = applyFilters(
	'vulopilot_automation_panel',
	null
) as ComponentType | null;

const Automation = () => {
	const [isProPopupOpen, setIsProPopupOpen] = useState(false);

	const statusOptions = [
		{ label: __('Enabled', 'vulopilot'), value: 'enabled' },
		{ label: __('Disabled', 'vulopilot'), value: 'disabled' },
	];

	const {
		data,
		total,
		categoryCounts,
		isLoading,
		error,
		refetch,
		onQueryUpdate,
	} = useApiList<AutomationRow>(
		'automations',
		{},
		{ key: 'status', options: statusOptions }
	);

	const openProPopup = () => setIsProPopupOpen(true);

	return (
		<TablePage
			headerIcon="automation"
			headerTitle={__('Automation', 'vulopilot')}
			headerDescription={__(
				'React to scan findings automatically — send emails, resolve findings, or run an AI action.',
				'vulopilot'
			)}
			error={error}
			onRetry={refetch}
			errorTitle={__('Could not load automations', 'vulopilot')}
		>
			{AutomationPanel ? (
				<AutomationPanel />
			) : (
				<>
					{/*
					 * Pro isn't active (or the Automation module isn't) — the
					 * table still renders with whatever Free's own baseline
					 * `automations` REST controller returns (list/enable-disable
					 * only, no create), but every action opens the Pro popup
					 * instead of calling the API, since creating/running an
					 * automation for real needs vulopilot-pro's engine.
					 */}
					<TableCard
						search={{
							placeholder: __(
								'Search automations…',
								'vulopilot'
							),
						}}
						buttonActions={[
							{
								label: __('Create automation', 'vulopilot'),
								onClick: openProPopup,
							},
						]}
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
										onClick: openProPopup,
									},
									{
										label: __('Run now', 'vulopilot'),
										icon: 'controls-play',
										onClick: openProPopup,
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
							'No automations yet — create one to react to scan findings automatically.',
							'vulopilot'
						)}
					/>
					<PopupComponent
						open={isProPopupOpen}
						onClose={() => setIsProPopupOpen(false)}
						width={31.25}
						height="auto"
						position="lightbox"
					>
						{appLocalizer.khali_dabba ? (
							// Pro is active — this specific module just
							// isn't toggled on yet, so point at Modules
							// rather than pitching an upgrade the user
							// already has.
							<ShowProPopup moduleName="automation" />
						) : (
							<ShowProPopup />
						)}
					</PopupComponent>
				</>
			)}
		</TablePage>
	);
};

export default Automation;
