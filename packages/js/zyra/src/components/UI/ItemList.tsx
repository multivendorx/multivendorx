import React from 'react';
import { ItemListProps } from '../types';

const ItemList: React.FC<ItemListProps> = ({ items }) => {
    if (!items || items.length === 0) return null;

    return (
        <div className="popover-list">
            {items.map((item, index) => {
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
                                    rel={item.targetBlank ? "noopener noreferrer" : undefined}
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
