import React from 'react';
import "../../styles/web/UI/Analytics.scss";
import { Skeleton } from '@mui/material';
type AnalyticsItem = {
	icon?: string;
	iconClass?: string;
	colorClass?: string;
	number: React.ReactNode;
	text: React.ReactNode;
	extra?: React.ReactNode;
};

type AnalyticsProps = {
	data: AnalyticsItem[];
	variant?: 'default' | 'small' | 'dashboard';
	cols?: number;
	isLoading?: boolean;
};

const Analytics: React.FC<AnalyticsProps> = ({
	data,
	variant = 'default',
	cols,
	isLoading = false,
}) => {
	const skeletonItems = Array.from({ length: data.length || 4 });

	return (
		<div
			className={`analytics-container ${cols ? `flex-wrap` : ''}`}
			data-template={variant}
		>
			{isLoading
				? skeletonItems.map((_, idx) => (
					<div key={idx} className="analytics-item">
						<div className="analytics-icon">
							<Skeleton variant="text" width={80} height={80} />
						</div>
						<div className="details">
							<div className="number">
								<Skeleton variant="text" width={80} height={24} />
							</div>
							<div className="text">
								<Skeleton variant="text" width={100} height={18} />
							</div>
							{variant === 'dashboard' && (
								<div className="report">
									<Skeleton variant="text" width={60} height={16} />
								</div>
							)}
						</div>
					</div>
				))
				: data.map((item, idx) => (
					<div
						key={idx}
						className={`analytics-item ${cols ? `col-${cols}` : ''} ${item.colorClass || ''}`}
					>
						{item.icon && (
							<div className="analytics-icon">
								<i className={`adminfont-${item.icon} ${item.iconClass || ''}`} />
							</div>
						)}
						<div className="details">
							<div className="number">{item.number}</div>
							<div className="text">{item.text}</div>
							{variant === 'dashboard' && item.extra && (
								<div className="report">{item.extra}</div>
							)}
						</div>
					</div>
				))}
		</div>
	);
};

export default Analytics;
