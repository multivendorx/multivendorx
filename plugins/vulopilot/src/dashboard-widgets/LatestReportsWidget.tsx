import React from 'react';
import { __ } from '@wordpress/i18n';
import { ModuleGuardComponent } from '@zyra/components';
import DashboardWidget from './DashboardWidget';
import { useApiList } from '../services/useApiList';
import { WidgetProps } from './types';

interface ReportRow {
	id: number;
	report_type: string;
	status: 'generating' | 'ready' | 'failed';
	created_at: string;
}

/**
 * Compact read of `/reports` (src/pages/Reports/Reports.tsx's own data
 * source) — same reasoning as RecentActivityWidget for using a plain list
 * instead of TableCard at this size.
 */
const LatestReportsWidget: React.FC<WidgetProps> = ({ onHide }) => {
	const { data, isLoading, error, refetch } = useApiList<ReportRow>(
		'reports',
		{ per_page: 5 }
	);

	return (
		<DashboardWidget
			title={__('Latest reports', 'vulopilot')}
			icon="report"
			isLoading={isLoading}
			onHide={onHide}
		>
			{error ? (
				<ModuleGuardComponent
					icon="error"
					title={__('Could not load reports', 'vulopilot')}
					desc={error}
					buttonText={__('Retry', 'vulopilot')}
					onButtonClick={refetch}
				/>
			) : data.length === 0 ? (
				<ModuleGuardComponent
					icon="report"
					title={__('No reports yet', 'vulopilot')}
					desc={__(
						'Generate your first compliance report from the Reports page.',
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
								{row.report_type}
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

export default LatestReportsWidget;
