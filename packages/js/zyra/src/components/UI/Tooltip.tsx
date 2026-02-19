import React from 'react';
import '../../styles/web/UI/Tooltip.scss';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
  withArrow?: boolean;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  text,
  children,
  position = 'top',
  withArrow = true,
  className = '',
}) => {
  return (
    <div 
      className={`tooltip-wrapper ${position} ${withArrow ? 'with-arrow' : ''} ${className}`}
    >
      {children}
      <span className="tooltip-name">{text}</span>
    </div>
  );
};

export default Tooltip;