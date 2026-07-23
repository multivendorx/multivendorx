/* global appLocalizer */
import { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { getApiLink, getApiResponse, sendApiResponse } from '@zyra/core';
import { ModuleGuardComponent, NoticeManager } from '@zyra/components';
import { ButtonInput } from '@zyra/inputs';
import DashboardGrid from '../../dashboard-widgets/DashboardGrid';
import { DashboardSummary } from '../../dashboard-widgets/types';
import './Dashboard.scss';

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

	if (error) {
		return (
			<div className="vulopilot-dashboard">
				<ModuleGuardComponent
					icon="error"
					title={__('Could not load the dashboard', 'vulopilot')}
					desc={error}
					buttonText={__('Retry', 'vulopilot')}
					onButtonClick={loadDashboard}
				/>
			</div>
		);
	}

	return (
		<div className="vulopilot-dashboard">
			<div className="dashboard-page-header">
				<h1>{__('Dashboard', 'vulopilot')}</h1>
				<ButtonInput
					buttons={{
						text: isScanning
							? __('Scanning…', 'vulopilot')
							: __('Run scan', 'vulopilot'),
						icon: 'search',
						onClick: handleRunScan,
						disabled: isScanning,
					}}
				/>
			</div>

			<DashboardGrid summary={summary} isLoading={isLoading} />
		</div>
	);
};

export default Dashboard;
