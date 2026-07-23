import React from 'react';
import { __ } from '@wordpress/i18n';
import { ModuleGuardComponent } from '@zyra/components';
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
 * Read-only list of `vulopilot_ai_action_runs` rows awaiting approval
 * (`/ai-action-runs?status=pending_approval`, Controllers/AiActionRuns.php).
 * Deliberately shows no Approve/Reject buttons — AIActions\ActionRunner's
 * approve()/reject() methods exist (AI-ACTIONS.md), but no REST route
 * calls them yet (its own "What's not here yet" section). Rendering
 * buttons that call a route which doesn't exist would be exactly the
 * placeholder-code this codebase's guidelines rule out; this widget is
 * honest about being visibility-only until that REST surface is built.
 */
const PendingApprovalWidget: React.FC<WidgetProps> = ({ onHide }) => {
	const { data, isLoading, error, refetch } = useApiList<ActionRunRow>(
		'ai-action-runs',
		{ status: 'pending_approval', per_page: 5 }
	);

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
						</li>
					))}
				</ul>
			)}
		</DashboardWidget>
	);
};

export default PendingApprovalWidget;
