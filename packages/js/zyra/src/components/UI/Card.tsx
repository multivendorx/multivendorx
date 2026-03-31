import React, { useState, useEffect } from 'react';
import '../../styles/web/UI/Card.scss';
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
    contentWidth?: boolean;
    toggle?: boolean;
    defaultExpanded?: boolean; // New prop to set default state
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
    contentWidth = false,
    toggle = false,
    defaultExpanded = true, // Default to true for backward compatibility
    badges = [],
    children,
    isLoading,
}: CardProps) => {
    const [bodyVisible, setBodyVisible] = useState(defaultExpanded);

    // Update bodyVisible if defaultExpanded changes
    useEffect(() => {
        setBodyVisible(defaultExpanded);
    }, [defaultExpanded]);

    const getToggleIcon = () => {
        if (iconName) {
            return iconName;
        }
        return bodyVisible ? 'pagination-right-arrow' : 'keyboard-arrow-down';
    };

    return (
        <div
            {...(id ? { id } : {})}
            className={`card-content ${transparent ? 'transparent' : ''} ${
                contentWidth ? 'content-width' : ''
            } ${className ? className : ''}`}
        >
            {isLoading ? (
                <>
                    <div className="card-header">
                        <div className="left">
                            <Skeleton width={6.25} />
                            <Skeleton width={10} />
                        </div>

                        <div className="right">
                            <Skeleton
                                variant="circular"
                                width={1.5}
                                height={1.5}
                            />
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
                    {(title || iconName || action || toggle) && (
                        <div className="card-header">
                            <div className="left">
                                {title && (
                                    <div className="title">
                                        {title}
                                        {badges.map((b, i) => (
                                            <span
                                                key={i}
                                                className={`admin-badge ${
                                                    b.color ?? ''
                                                }`}
                                            >
                                                {b.text}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {desc && <div className="des">{desc}</div>}
                            </div>

                            <div className="right">
                                {action}

                                {toggle && !action && (
                                    <i
                                        className={`adminfont-${getToggleIcon()}`}
                                        onClick={() => {
                                            setBodyVisible(!bodyVisible);
                                            onIconClick?.();
                                        }}
                                    />
                                )}

                                {iconName && !toggle && !action && (
                                    <i
                                        className={`adminfont-${iconName}`}
                                        onClick={() => onIconClick?.()}
                                        style={{
                                            cursor: onIconClick
                                                ? 'pointer'
                                                : 'default',
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
