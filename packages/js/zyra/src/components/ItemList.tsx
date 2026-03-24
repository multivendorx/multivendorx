// External Dependencies
import React from 'react';

// Internal Dependencies
import { FieldComponent } from './fieldUtils';
import '../styles/web/UI/ItemList.scss';
import Skeleton from './UI/Skeleton';

export interface Item {
    id?: string;
    title?: string;
    icon?: string;
    img?: string;
    link?: string;
    tags?: React.ReactNode;
    targetBlank?: boolean;
    action?: (item: Item, e?: React.MouseEvent) => void;
    onApprove?: (item: Item) => void;
    onReject?: (item: Item) => void;
    desc?: string;
    value?: string;
    className?: string; // notification | checklist | feature-list | mini-card | price-list | documentation | badge-list 
}

interface ItemListUIProps {
    items: Item[];
    className?: string;
    background?: boolean;
    border?: boolean;
    onItemClick?: (item: Item) => void;
    loading?: boolean;
    skeletonCount?: number;
}

export const ItemListUI: React.FC<ItemListUIProps> = ({
    items,
    background,
    border,
    className,
    onItemClick,
    loading = false,
    skeletonCount = 5,
}) => {
    const [isExpanded, setIsExpanded] = React.useState(className === 'price-list');

    if (loading) {
        return (
            <div className={`item-list ${className || 'default'}`}>
                {Array.from({ length: skeletonCount }).map((_, index) => (
                    <div key={index} className="item">
                        <Skeleton variant="circular" width={32} height={32} />
                        <div className="details">
                            <Skeleton width="60%" height={12} />
                            <Skeleton width="40%" height={10} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className={`item-list ${className || 'default'} ${isExpanded ? 'expanded' : ''}`}>
            {items &&
                items.map((item) => {
                    const handleClick = (e: React.MouseEvent) => {
                        e.stopPropagation();
                        if (item.action) {
                            item.action(item, e);
                        }
                        if (onItemClick) {
                            onItemClick(item);
                        }
                    };
                    return (
                        <React.Fragment key={item.id}>
                            {item.link ? (
                                <a
                                    href={item.link}
                                    target={item.targetBlank ? '_blank' : '_self'}
                                    className={`item ${background ? 'background' : ''} ${border ? 'border' : ''} ${item.className || ''}`}
                                    onClick={handleClick}
                                >
                                    {item.icon && (
                                        <i className={`item-icon adminfont-${item.icon}`}></i>
                                    )}
                                    {item.title}
                                </a>
                            ) : (
                                <div
                                    className={`item ${background ? 'background' : ''} ${border ? 'border' : ''} ${item.className || ''}`}
                                    onClick={() => {
                                        item.action?.(item);
                                        if (onItemClick) {
                                            onItemClick(item);
                                        }
                                    }}
                                >
                                    {item.icon && (
                                        <i
                                            className={`item-icon adminfont-${item.icon}`}
                                        ></i>
                                    )}
                                    {item.img && (
                                        <img
                                            src={item.img}
                                            alt={item.title || 'item image'}
                                        />
                                    )}

                                    <div className="details">
                                        <div className="item-title">
                                            {item.title}
                                        </div>
                                        {item.value && (
                                            <div className="value">
                                                {item.value}
                                            </div>
                                        )}
                                        {item.desc && (
                                            <div className="desc">
                                                {item.desc}
                                            </div>
                                        )}
                                    </div>

                                    {className === 'notification' && (
                                        <>
                                            <i
                                                className="check-icon adminfont-check green-color"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    item.onApprove?.(item);
                                                }}
                                            />
                                            <i
                                                className="check-icon adminfont-cross red-color"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    item.onReject?.(item);
                                                }}
                                            />
                                        </>
                                    )}

                                    {item.tags && (
                                        <div className="tags">{item.tags}</div>
                                    )}
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            {className === 'price-list' && (
                <span
                    className="more-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded((prev) => !prev);
                    }}
                >
                    {isExpanded ? (
                        <>
                            More <i className="adminfont-arrow-down" />
                        </>
                    ) : (
                        <>
                            Less <i className="adminfont-arrow-up" />
                        </>
                    )}
                </span>
            )}
        </div>
    );
};

const ItemList: FieldComponent = {
    render: ({ field, value, onChange, canAccess }) => {
        const items = Array.isArray(value) ? value : field.items || [];

        return (
            <ItemListUI
                items={items}
                className={field.className}
                background={field.background}
                border={field.border}
                loading={field.loading}
                onItemClick={(item) => {
                    if (!canAccess) return;

                    if (item.action) {
                        item.action(item);
                    }

                    onChange?.(item);
                }}
            />
        );
    },
};

export default ItemList;