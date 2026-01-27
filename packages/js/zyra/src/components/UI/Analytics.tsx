import React from 'react';
import "../../styles/web/UI/Analytics.scss";
import Skeleton from './Skeleton';
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
			{data.map((item, idx) => (
				<div
					key={idx}
					className={`analytics-item ${cols ? `col-${cols}` : ''} ${item.colorClass || ''}`}
				>
					<div className="analytics-icon">
						{isLoading ? (
							<Skeleton width={60} height={60} />
						) : (
							item.icon && ( <i className={`adminfont-${item.icon} ${item.iconClass || ''}`} />)
						)}
					</div>

					<div className="details">
						<div className="number">
							{isLoading ? (
								<Skeleton width={80} />
							) : (
								item.number
							)}
						</div>

						<div className="text">
							{isLoading ? (
								<Skeleton width={100} />
							) : (
								item.text
							)}
						</div>

						{variant === 'dashboard' && (
							<div className="report">
								{isLoading ? (
									<Skeleton width={60} />
								) : (
									item.extra
								)}
							</div>
						)}
					</div>
				</div>
			))}
		</div>
	);
};

export default Analytics;
