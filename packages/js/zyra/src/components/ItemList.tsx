import React from 'react';
import "../styles/web/UI/ItemList.scss";
interface Item {
    id?: string;
    title?: string;
    icon?: string;
    img?: string;
    link?: string;
    tags?: React.ReactNode;
    targetBlank?: boolean;
    action?: (item: Item) => void;
    desc?: string;
    time?: string;
    className?: string;
}

export interface ItemListProps {
    items: Item[];
    className?: string ;
    background?: boolean;
    border?: boolean;
}

const ItemList: React.FC<ItemListProps> = ({ items, background, border, className }) => {

    return (
        <div className={`item-list ${className || 'default'}`}>

            {items && items.map((item, index) => {
                const handleClick = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (item.action) item.action(item);
                };

                return (
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
                                className={`item ${background ? 'background' : ''} ${border ? 'border' : ''}`}
                                onClick={() => {
                                    item.action?.();
                                }}
                            >
                                {item.icon && <i className={`item-icon ${item.icon}`}></i>}
                                {item.img && <img src={item.img} alt="" /> }

                                <div className="details">
                                    <div className="heading">{item.title}</div>
                                    {item.desc && <div className="desc">{item.desc}</div>}
                                </div>
                                {item.time && <div className="popover-item-time">{item.time}</div>}

                                {className === 'notification' && (
                                    <>
                                        <i className="check-icon adminfont-check color-green" />
                                        <i className="check-icon adminfont-cross color-red" />
                                    </>
                                )}

                                {item.tags && <div className="tags"> {item.tags} </div>}
                            </div>
                        )}
                    </>
                );
            })}

        </div>
    );
};

export default ItemList;
