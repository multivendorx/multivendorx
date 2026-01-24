import React, { useState } from 'react';
import "../../styles/web/UI/Card.scss";
import { Skeleton } from '@mui/material';

export type CardProps = {
  title?: React.ReactNode;
  desc?: React.ReactNode;
  className?: string;
  iconName?: string;
  onIconClick?: () => void;
  buttonLabel?: string;
  onButtonClick?: () => void;
  action?: React.ReactNode;
  transparent?: boolean;
  contentHeight?: boolean;
  contentWidth?: boolean;
  toggle?: boolean;
  badges?: {
    text: string;
    color?: string;
  }[];
  children?: React.ReactNode;
  isLoading?: true;
};

const Card = ({
  title,
  desc,
  className,
  iconName,
  onIconClick,
  buttonLabel,
  onButtonClick,
  action,
  transparent = false,
  contentHeight = false,
  contentWidth = false,
  toggle = false,
  badges = [],
  children,
  isLoading
}: CardProps) => {
  const [bodyVisible, setBodyVisible] = useState(true);

  return (
    <div className={`card-content ${transparent ? 'transparent' : ''} ${contentHeight ? 'content-height' : ''} ${contentWidth ? 'content-width' : ''} ${className ? className : ''}`}>
      {isLoading ? (
        <>
          <div className="card-header">
            <div className="left">
              <Skeleton variant="text" width={100} />
              <Skeleton variant="text" width={160} />
            </div>

            <div className="right">
              <Skeleton variant="circular" width={24} height={24} />
            </div>
          </div>

          {/* Body skeleton */}
          <div className="card-body">
            <Skeleton variant="text" width="90%" />
            <Skeleton variant="text" width="85%" />
            <Skeleton variant="text" width="60%" />
          </div>
        </>
      ) : (
        <>
          {(title || iconName || buttonLabel || action) && (
            <div className="card-header">
              <div className="left">
                {title && (
                  <div className="title">
                    {title}
                    {badges.map((b, i) => (
                      <span key={i} className={`admin-badge ${b.color ?? ''}`}>
                        {b.text}
                      </span>
                    ))}
                  </div>
                )}
                {desc && <div className="des">{desc}</div>}
              </div>

              <div className="right">
                {action}

                {iconName && !action && (
                  <i
                    className={iconName}
                    onClick={() => {
                      if (toggle) setBodyVisible(!bodyVisible);
                      onIconClick?.();
                    }}
                  />
                )}

                {buttonLabel && !action && (
                  <button className="admin-btn btn-purple" onClick={onButtonClick}>
                    {buttonLabel}
                  </button>
                )}
              </div>
            </div>
          )}

          {bodyVisible && children && (
            <div className="card-body">{children}</div>
          )}
        </>
      )}
    </div>

  );
};

export default Card;
