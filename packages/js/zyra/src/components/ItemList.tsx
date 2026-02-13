import React from 'react';
import "../styles/web/UI/ItemList.scss";
interface Item {
    id?: string;
    title?: string;
    icon?: string;
    link?: string;
    targetBlank?: boolean;
    action?: (item: Item) => void;
    desc?: string;
    time?: string;
    className?: string;
}

export interface ItemListProps {
    items: Item[];
    variant?: 'default' | 'notification' | 'checklist';
}

const ItemList: React.FC<ItemListProps> = ({ items, variant }) => {

    return (
        <div className={`item-list ${variant || 'default'}`}>

            {items && items.map((item, index) => {
                const handleClick = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (item.action) item.action(item);
                };

                return (
                    // <div
                    //     key={index}
                    //     className={`item ${item.className || ''}`}
                    //     onClick={handleClick}
                    // >
                    <>
                        {item.link ? (
                            <a
                                href={item.link}
                                target={item.targetBlank ? "_blank" : "_self"}
                                className="item"
                            >
                                {item.icon && <i className={`item-icon ${item.icon}`}></i>}
                                {item.title}
                            </a>
                        ) : (
                            <div
                                className="item"
                                onClick={() => {
                                    item.action?.();
                                }}
                            >
                                {item.icon && <i className={`item-icon ${item.icon}`}></i>}

                                <div className="details">
                                    <div className="heading">{item.title}</div>
                                    {item.desc && <div className="desc">{item.desc}</div>}
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
                    </>
                    /* </div> */
                );
            })}

        </div>
    );
};

export default ItemList;
