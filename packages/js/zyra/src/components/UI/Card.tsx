import React, { useState } from 'react';
import "../../styles/web/UI/Card.scss";
import Skeleton from './Skeleton';


export type CardProps = {
  title?: React.ReactNode;
  desc?: React.ReactNode;
  className?: string;
  id?: string;
  iconName?: string;
  onIconClick?: () => void;
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
  id,
  iconName,
  onIconClick,
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
    <div {...(id ? { id } : {})} className={`card-content ${transparent ? 'transparent' : ''} ${contentHeight ? 'content-height' : ''} ${contentWidth ? 'content-width' : ''} ${className ? className : ''}`}>
      {isLoading ? (
        <>
          <div className="card-header">
            <div className="left">
              <Skeleton width={100} />
              <Skeleton width={160} />
            </div>

            <div className="right">
              <Skeleton variant="circular" width={24} height={24} />
            </div>
          </div>

          {/* Body skeleton */}
          <div className="card-body">
            <Skeleton width="90%" />
            <Skeleton width="85%" />
            <Skeleton width="60%" />
          </div>
        </>
      ) : (
        <>
          {(title || iconName || action) && (
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
