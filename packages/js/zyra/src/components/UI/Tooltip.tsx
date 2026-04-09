import React from 'react';
import '../../styles/web/UI/Tooltip.scss';

interface TooltipProps {
    text: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'end' | 'start';
    withOutArrow?: boolean;
    className?: string;  // hidden (opacity 0)
}

const Tooltip: React.FC<TooltipProps> = ({
    text,
    children,
    position = 'top',
    withOutArrow = false,
    className = '',
}) => {
    return (
        <div
            className={`tooltip-wrapper ${position} ${
                withOutArrow ? 'with-out-arrow' : ''
            } ${className}`}
        >
            {children}
            <span className="tooltip-name">{text}</span>
        </div>
    );
};

export default Tooltip;
