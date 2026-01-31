import React from "react";
import "../../styles/web/UI/Skeleton.scss";

type SkeletonVariant = "text" | "circular" | "rectangular";

interface SkeletonProps {
    variant?: SkeletonVariant;
    width?: number | string;
    height?: number | string;
    className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
    variant = "text",
    width,
    height,
    className = "",
}) => {
    const styles: React.CSSProperties = {
        width,
        height,
    };

    return (
        <span className={`skeleton skeleton-${variant} ${className}`} style={styles} />
    );
};

export default Skeleton;
