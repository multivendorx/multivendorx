import React from 'react';
import { __ } from '@wordpress/i18n';
import { ModuleGuardComponent } from '@zyra/components';
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import DashboardWidget from './DashboardWidget';
import { useApiList } from '../services/useApiList';
import { WidgetProps } from './types';

interface HealthSnapshot {
	snapshot_date: string;
	overall_score: number;
}

/**
 * The health-score trend chart, unchanged in content from what
 * Dashboard.tsx originally rendered inline — moved here so it's a widget
 * like the other twelve (reorderable, hideable) instead of a fixed
 * element outside the grid. Fetches its own data (`/site-health-snapshots`)
 * rather than reading it off the shared summary payload, since it's a
 * list of up to 30 rows, not a single number the summary aggregate is
 * meant for (see Controllers/Dashboard.php's docblock on why list-shaped
 * widgets call their own endpoint).
 */
const HealthTimelineWidget: React.FC<WidgetProps> = ({ onHide }) => {
	const {
		data: snapshots,
		isLoading,
		error,
		refetch,
	} = useApiList<HealthSnapshot>('site-health-snapshots', { days: 30 });

	return (
		<DashboardWidget
			title={__('Health timeline', 'vulopilot')}
			icon="analytics"
			isLoading={isLoading}
			onHide={onHide}
		>
			{error ? (
				<ModuleGuardComponent
					icon="error"
					title={__('Could not load the health timeline', 'vulopilot')}
					desc={error}
					buttonText={__('Retry', 'vulopilot')}
					onButtonClick={refetch}
				/>
			) : snapshots.length === 0 ? (
				<ModuleGuardComponent
					icon="analytics"
					title={__('No trend data yet', 'vulopilot')}
					desc={__(
						'Run your first scan to start building a health score history.',
						'vulopilot'
					)}
				/>
			) : (
				<div className="dashboard-trend-chart">
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart data={snapshots}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="snapshot_date" />
							<YAxis domain={[0, 100]} />
							<Tooltip />
							<Area
								type="monotone"
								dataKey="overall_score"
								stroke="#4B227A"
								fill="#00EED0"
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			)}
		</DashboardWidget>
	);
};

export default HealthTimelineWidget;
