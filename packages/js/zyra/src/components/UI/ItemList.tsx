import React from 'react';

interface Item {
    title?: string;
    icon?: string;
    link?: string;
    targetBlank?: boolean;
    action?: () => void;
    desc?: string;
    time?: string;
    className?: string;
}

export interface ItemListProps {
    items: Item[];
}

const ItemList: React.FC<ItemListProps> = ({ items }) => {

    return (
        <div className="popover-list">
            {items && items.map((item, index) => {
                const handleClick = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (item.action) item.action();
                };

                return (
                    <div
                        key={index}
                        className={`popover-list-item ${item.className || ''}`}
                        onClick={handleClick}
                    >
                        {item.icon && <i className={`popover-item-icon ${item.icon}`}></i>}

                        <div className="popover-item-content">
                            {item.link ? (
                                <a
                                    href={item.link}
                                    target={item.targetBlank ? "_blank" : "_self"}
                                >
                                    {item.title}
                                </a>
                            ) : (
                                <span>{item.title}</span>
                            )}

                            {item.desc && <div className="popover-item-desc">{item.desc}</div>}
                            {item.time && <div className="popover-item-time">{item.time}</div>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ItemList;
