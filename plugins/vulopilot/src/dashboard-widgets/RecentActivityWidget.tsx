import React from 'react';
import { __ } from '@wordpress/i18n';
import { ModuleGuardComponent } from '@zyra/components';
import DashboardWidget from './DashboardWidget';
import { useApiList } from '../services/useApiList';
import { WidgetProps } from './types';

interface ActivityLogRow {
	id: number;
	event_type: string;
	message: string;
	severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
	created_at: string;
}

/**
 * Compact read of the same `/activity-logs` endpoint the full Activity
 * page (src/pages/Activity/Activity.tsx) uses — a plain row list here
 * rather than Zyra's TableCard, since TableCard's pagination/column
 * filters are built for a full-page list view, not a 5-row dashboard
 * tile (a lighter list keeps the widget visually compact, per this
 * pass's "reusable widgets" requirement without misusing a component
 * outside the density it's meant for).
 */
const RecentActivityWidget: React.FC<WidgetProps> = ({ onHide }) => {
	const { data, isLoading, error, refetch } = useApiList<ActivityLogRow>(
		'activity-logs',
		{ per_page: 5 }
	);

	return (
		<DashboardWidget
			title={__('Recent activity', 'vulopilot')}
			icon="clock"
			isLoading={isLoading}
			onHide={onHide}
		>
			{error ? (
				<ModuleGuardComponent
					icon="error"
					title={__('Could not load recent activity', 'vulopilot')}
					desc={error}
					buttonText={__('Retry', 'vulopilot')}
					onButtonClick={refetch}
				/>
			) : data.length === 0 ? (
				<ModuleGuardComponent
					icon="clock"
					title={__('Nothing has happened yet', 'vulopilot')}
					desc={__(
						'Actions across VuloPilot will show up here.',
						'vulopilot'
					)}
				/>
			) : (
				<ul className="dashboard-widget-list">
					{data.map((row) => (
						<li
							key={row.id}
							className={`dashboard-widget-list-row severity-${row.severity}`}
						>
							<span className="dashboard-widget-list-message">
								{row.message}
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

export default RecentActivityWidget;
