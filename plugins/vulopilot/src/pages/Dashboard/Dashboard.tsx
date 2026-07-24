/* global appLocalizer */
import { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { getApiLink, getApiResponse, sendApiResponse } from '@zyra/core';
import {
	ColumnComponent,
	ContainerComponent,
	ModuleGuardComponent,
	NavigatorHeaderComponent,
	NoticeManager,
} from '@zyra/components';
import DashboardGrid from '../../dashboard-widgets/DashboardGrid';
import { DashboardSummary } from '../../dashboard-widgets/types';

/**
 * Zero-filled shape so DashboardGrid always has a real DashboardSummary
 * to pass to widgets while the first `/dashboard` request is in flight —
 * widgets render their own skeleton via the `isLoading` prop rather than
 * the page needing a separate "loading" screen state.
 */
const EMPTY_SUMMARY: DashboardSummary = {
	overall_score: 0,
	open_findings: 0,
	critical_findings: 0,
	active_automations: 0,
	ai_jobs_used: 0,
	ai_jobs_quota: 0,
	category_scores: {
		seo: 0,
		performance: 0,
		security: 0,
		accessibility: 0,
		woocommerce: null,
	},
	quick_fixes: 0,
	pending_approvals: 0,
	automation_status: { enabled: 0, disabled: 0 },
};

/**
 * Uses the same NavigatorHeaderComponent + ContainerComponent +
 * ColumnComponent shape every other page in this plugin now uses (see
 * Health.tsx's own docblock for why) — this page previously hand-rolled
 * its own `.vulopilot-dashboard`/`.dashboard-page-header` markup with a
 * bespoke Dashboard.scss that only ever defined a flex/gap layout, never
 * the padding/card containment the shared components provide, which is
 * exactly what made it look inconsistent with every other tab.
 */
const Dashboard = () => {
	const [summary, setSummary] = useState<DashboardSummary>(EMPTY_SUMMARY);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isScanning, setIsScanning] = useState(false);

	const loadDashboard = () => {
		setIsLoading(true);
		setError(null);

		getApiResponse<DashboardSummary>(
			getApiLink(appLocalizer, 'dashboard'),
			{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
		)
			.then((response) => {
				if (!response) {
					setError(
						__(
							'Could not load the dashboard summary.',
							'vulopilot'
						)
					);
					return;
				}

				setSummary(response);
			})
			.finally(() => setIsLoading(false));
	};

	useEffect(loadDashboard, []);

	const handleRunScan = () => {
		setIsScanning(true);

		sendApiResponse(appLocalizer, getApiLink(appLocalizer, 'scans'), {
			scanner_id: 'all',
			trigger_type: 'manual',
		})
			.then((response) => {
				if (response) {
					NoticeManager.add({
						uniqueKey: 'vulopilot-scan-started',
						type: 'success',
						position: 'notice',
						message: __(
							'Scan started — results will appear here shortly.',
							'vulopilot'
						),
					});
					loadDashboard();
				} else {
					NoticeManager.add({
						uniqueKey: 'vulopilot-scan-failed',
						type: 'error',
						position: 'notice',
						message: __(
							'Could not start a scan. Please try again.',
							'vulopilot'
						),
					});
				}
			})
			.finally(() => setIsScanning(false));
	};

	const pageHeader = (
		<NavigatorHeaderComponent
			headerIcon="home"
			headerTitle={__('Dashboard', 'vulopilot')}
			headerDescription={__(
				'Your site\'s overall health, at a glance.',
				'vulopilot'
			)}
			buttons={[
				{
					label: isScanning
						? __('Scanning…', 'vulopilot')
						: __('Run scan', 'vulopilot'),
					icon: 'search',
					onClick: handleRunScan,
				},
			]}
		/>
	);

	if (error) {
		return (
			<>
				{pageHeader}
				<ContainerComponent general>
					<ColumnComponent>
						<ModuleGuardComponent
							icon="error"
							title={__(
								'Could not load the dashboard',
								'vulopilot'
							)}
							desc={error}
							buttonText={__('Retry', 'vulopilot')}
							onButtonClick={loadDashboard}
						/>
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
					<DashboardGrid summary={summary} isLoading={isLoading} />
				</ColumnComponent>
			</ContainerComponent>
		</>
	);
};

export default Dashboard;
