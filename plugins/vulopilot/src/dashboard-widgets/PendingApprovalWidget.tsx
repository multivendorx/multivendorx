/* global appLocalizer */
import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { getApiLink, sendApiResponse } from '@zyra/core';
import { ModuleGuardComponent, NoticeManager } from '@zyra/components';
import { ButtonInput } from '@zyra/inputs';
import DashboardWidget from './DashboardWidget';
import { useApiList } from '../services/useApiList';
import { WidgetProps } from './types';

interface ActionRunRow {
	id: number;
	action_id: string;
	object_type: string | null;
	created_at: string;
}

/**
 * `vulopilot_ai_action_runs` rows awaiting approval
 * (`/ai-action-runs?status=pending_approval`, Controllers/AiActionRuns.php).
 * Approve/Reject now call real REST routes
 * (`POST /ai-action-runs/{id}/approve|reject`) — AIActions\ActionRunner's
 * approve()/reject() methods have always existed, but nothing exposed
 * them over REST, so this widget used to be visibility-only by necessity.
 */
const PendingApprovalWidget: React.FC<WidgetProps> = ({ onHide }) => {
	const { data, isLoading, error, refetch } = useApiList<ActionRunRow>(
		'ai-action-runs',
		{ status: 'pending_approval', per_page: 5 }
	);
	const [busyId, setBusyId] = useState<number | null>(null);

	const handleDecision = (row: ActionRunRow, decision: 'approve' | 'reject') => {
		setBusyId(row.id);

		sendApiResponse(
			appLocalizer,
			getApiLink(appLocalizer, `ai-action-runs/${row.id}/${decision}`),
			{}
		)
			.then((response) => {
				NoticeManager.add({
					uniqueKey: `ai-action-${decision}-${row.id}`,
					type: response ? 'success' : 'error',
					position: 'notice',
					message: response
						? decision === 'approve'
							? __('Action approved and executed.', 'vulopilot')
							: __('Action rejected.', 'vulopilot')
						: __(
								'Could not complete this action. Please try again.',
								'vulopilot'
							),
				});

				if (response) {
					refetch();
				}
			})
			.finally(() => setBusyId(null));
	};

	return (
		<DashboardWidget
			title={__('Pending approval', 'vulopilot')}
			icon="approval"
			isLoading={isLoading}
			onHide={onHide}
		>
			{error ? (
				<ModuleGuardComponent
					icon="error"
					title={__(
						'Could not load pending AI actions',
						'vulopilot'
					)}
					desc={error}
					buttonText={__('Retry', 'vulopilot')}
					onButtonClick={refetch}
				/>
			) : data.length === 0 ? (
				<ModuleGuardComponent
					icon="check"
					title={__('Nothing waiting on you', 'vulopilot')}
					desc={__(
						'AI actions that need your approval before they run will appear here.',
						'vulopilot'
					)}
				/>
			) : (
				<ul className="dashboard-widget-list">
					{data.map((row) => (
						<li key={row.id} className="dashboard-widget-list-row">
							<span className="dashboard-widget-list-message">
								{row.action_id}
							</span>
							<span className="dashboard-widget-list-meta">
								{row.created_at}
							</span>
							<span className="dashboard-widget-list-actions">
								<ButtonInput
									buttons={{
										text: __('Approve', 'vulopilot'),
										icon: 'yes',
										onClick: () =>
											handleDecision(row, 'approve'),
										disabled: busyId === row.id,
									}}
								/>
								<ButtonInput
									buttons={{
										text: __('Reject', 'vulopilot'),
										icon: 'no',
										onClick: () =>
											handleDecision(row, 'reject'),
										disabled: busyId === row.id,
									}}
								/>
							</span>
						</li>
					))}
				</ul>
			)}
		</DashboardWidget>
	);
};

export default PendingApprovalWidget;
