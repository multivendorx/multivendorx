import React from 'react';
import '../../styles/web/UI/Analytics.scss';
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
    return (
        <div
            className={`analytics-container ${cols ? `flex-wrap` : ''}`}
            data-template={variant}
        >
            {data.map((item, idx) => (
                <div
                    key={idx}
                    className={`analytics-item ${
                        cols ? `col-${cols}` : ''
                    } ${item.colorClass || ''}`}
                >
                    <div className="analytics-icon">
                        {isLoading ? (
                            <Skeleton width={3.75} height={3.75} />
                        ) : (
                            item.icon && (
                                <i
                                    className={`adminfont-${item.icon} ${
                                        item.iconClass || ''
                                    }`}
                                />
                            )
                        )}
                    </div>

                    <div className="details">
                        <div className="number">
                            {isLoading ? <Skeleton width={5} /> : item.number}
                        </div>

                        <div className="text">
                            {isLoading ? <Skeleton width={6.25} /> : item.text}
                        </div>

                        {variant === 'dashboard' && (
                            <div className="report">
                                {isLoading ? (
                                    <Skeleton width={3.75} />
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
