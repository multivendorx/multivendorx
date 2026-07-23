import React from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { ModuleGuardComponent } from '@zyra/components';
import DashboardWidget from './DashboardWidget';
import { useApiList } from '../services/useApiList';
import { WidgetProps } from './types';

interface AutomationRow {
	id: number;
	name: string;
	status: 'enabled' | 'disabled';
}

/**
 * Enabled/disabled counts come straight off the shared summary payload
 * (`summary.automation_status`, Controllers/Dashboard.php) — no extra
 * request needed for those two numbers. The row list underneath is a
 * second, small fetch against the same `/automations` endpoint
 * src/pages/Automation/Automation.tsx already uses, capped to 5 rows.
 */
const AutomationStatusWidget: React.FC<WidgetProps> = ({
	summary,
	isLoading,
	onHide,
}) => {
	const {
		data,
		isLoading: isListLoading,
		error,
		refetch,
	} = useApiList<AutomationRow>('automations', { per_page: 5 });

	return (
		<DashboardWidget
			title={__('Automation status', 'vulopilot')}
			icon="controls-repeat"
			isLoading={isLoading}
			onHide={onHide}
		>
			<div className="dashboard-widget-summary-line">
				{sprintf(
					/* translators: 1: number of enabled automations, 2: number of disabled automations. */
					__('%1$d enabled · %2$d disabled', 'vulopilot'),
					summary.automation_status.enabled,
					summary.automation_status.disabled
				)}
			</div>

			{error ? (
				<ModuleGuardComponent
					icon="error"
					title={__('Could not load automations', 'vulopilot')}
					desc={error}
					buttonText={__('Retry', 'vulopilot')}
					onButtonClick={refetch}
				/>
			) : !isListLoading && data.length === 0 ? (
				<ModuleGuardComponent
					icon="automation"
					title={__('No automations yet', 'vulopilot')}
					desc={__(
						'Create one from the Automation page to react to scan findings automatically.',
						'vulopilot'
					)}
				/>
			) : (
				<ul className="dashboard-widget-list">
					{data.map((row) => (
						<li
							key={row.id}
							className={`dashboard-widget-list-row status-${row.status}`}
						>
							<span className="dashboard-widget-list-message">
								{row.name}
							</span>
							<span
								className={`admin-badge status-${row.status}`}
							>
								{row.status}
							</span>
						</li>
					))}
				</ul>
			)}
		</DashboardWidget>
	);
};

export default AutomationStatusWidget;
