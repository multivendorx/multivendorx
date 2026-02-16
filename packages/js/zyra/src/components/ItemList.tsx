import React from 'react';
import "../styles/web/UI/ItemList.scss";
import Skeleton from './UI/Skeleton';

interface Item {
    id?: string;
    title?: string;
    icon?: string;
    iconClass?: string;
    link?: string;
    targetBlank?: boolean;
    action?: (item: Item) => void;
    desc?: string;
    description?: string;
    time?: string;
    className?: string;
}

interface MiniCardItem {
    iconClass?: string;
    title: string;
    description?: string;
}

export interface ItemListProps {
    items: Item[] | MiniCardItem[];
    variant?: 'default' | 'notification' | 'checklist' | 'mini-card';
    className?: string;
    header?: React.ReactNode;
    title?: React.ReactNode;
    background?: boolean;
    border?: boolean;
    width?: string;
    value?: React.ReactNode;
    description?: React.ReactNode;
    children?: React.ReactNode;
    isLoading?: boolean;
    cols?: number;
}

const ItemList: React.FC<ItemListProps> = ({ 
    items = [],
    variant = 'default',
    className = '',
    header,
    title,
    value: propValue,
    description: propDescription,
    children,
    background,
    border,
    cols,
    isLoading = false,
}) => {

    const isMiniCard = variant === 'mini-card';

    return (
        <div 
            className={[
                isMiniCard ? 'mini-card' : 'item-list',
                !isMiniCard ? variant : '',
                className,
                background ? 'background' : '',
                border ? 'border' : ''
            ].filter(Boolean).join(' ')}
            {...(isMiniCard && cols ? { 'data-cols': cols } : {})}
        >
            {/* Header Section - only for mini-card */}
            {isMiniCard && header && (
                <div className="mini-card-header">
                    {isLoading ? <Skeleton width={80} /> : header}
                </div>
            )}

            {/* Title Section - only for mini-card */}
            {isMiniCard && title && (
                <h3 className="mini-card-title">
                    {isLoading ? <Skeleton width={120} /> : title}
                </h3>
            )}

            {/* Value Section - only for mini-card */}
            {isMiniCard && propValue && (
                <div className="mini-card-value">
                    {isLoading ? <Skeleton width={100} /> : propValue}
                </div>
            )}

            {/* Description Section - only for mini-card */}
            {isMiniCard && propDescription && (
                <p className="mini-card-description">
                    {isLoading ? <Skeleton width="100%" /> : propDescription}
                </p>
            )}

            {/* Items Section */}
            {items.length > 0 && (
                <div className={isMiniCard ? 'mini-card-items' : ''}>
                    {isMiniCard ? (
                        items.map((item: any, index) => (
                            <div className="mini-card-item" key={item.id || index}>
                                {isLoading ? (
                                    <Skeleton width={24} height={24} />
                                ) : (
                                    (item.iconClass || item.icon) && 
                                    <i className={item.iconClass || item.icon}></i>
                                )}
                                <div className="content">
                                    <h3>
                                        {isLoading ? <Skeleton width={90} /> : item.title}
                                    </h3>
                                    {(isLoading || item.description || item.desc) && (
                                        <p>
                                            {isLoading ? <Skeleton width={90} /> : (item.description || item.desc)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        items.map((item: any, index) => {
                            const handleClick = (e: React.MouseEvent) => {
                                e.stopPropagation();
                                item.action?.(item);
                            };

                            return (
                                <React.Fragment key={item.id || index}>
                                    {item.link ? (
                                        <a
                                            href={item.link}
                                            target={item.targetBlank ? "_blank" : "_self"}
                                            className="item"
                                            onClick={handleClick}
                                        >
                                            {(item.icon || item.iconClass) && 
                                                <i className={`item-icon ${item.icon || item.iconClass}`}></i>
                                            }
                                            {item.title}
                                        </a>
                                    ) : (
                                        <div
                                            className="item"
                                            onClick={() => item.action?.(item)}
                                        >
                                            {(item.icon || item.iconClass) && 
                                                <i className={`item-icon ${item.icon || item.iconClass}`}></i>
                                            }

                                            <div className="details">
                                                <div className="heading">{item.title}</div>
                                                {(item.desc || item.description) && 
                                                    <div className="desc">{item.desc || item.description}</div>
                                                }
                                            </div>
                                            {item.time && <div className="popover-item-time">{item.time}</div>}

                                            {variant === 'notification' && (
                                                <>
                                                    <i className="check-icon adminfont-check color-green" />
                                                    <i className="check-icon adminfont-cross color-red" />
                                                </>
                                            )}
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })
                    )}
                </div>
            )}

            {isMiniCard && children && (
                <div className="mini-card-content">
                    {isLoading ? <Skeleton height={60} /> : children}
                </div>
            )}
        </div>
    );
};

export default ItemList;