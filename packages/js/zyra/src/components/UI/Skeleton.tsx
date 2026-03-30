import React from 'react';
import '../../styles/web/UI/Skeleton.scss';

type SkeletonVariant = 'text' | 'circular' | 'rectangular';

interface SkeletonProps {
    variant?: SkeletonVariant;
    width?: number | string;
    height?: number | string;
    className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
    variant = 'text',
    width = '100%',
    height = 1,
    className = '',
}) => {
    const formatValue = (value: number | string ): string  => {
        if (typeof value === 'number') {
            return `${value}rem`;
        }
        return value;
    };

    const styles: React.CSSProperties = {
        width: formatValue(width),
        height: formatValue(height),
    };

    return (
        <span
            className={`skeleton skeleton-${variant} ${className}`}
            style={styles}
        />
    );
};

export default Skeleton;
